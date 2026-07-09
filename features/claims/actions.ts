"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { tryGetSession, verifySession } from "@/lib/dal";
import { createSession } from "@/lib/session";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { saveDocumentFile, DocumentValidationError } from "@/lib/document-storage";

type DocCategory = "cin" | "diplome" | "autre";
type DocumentInput = {
  url: string; name: string; size: number; type: string;
  category: DocCategory;
};

/* ── Tunnel « preuve d'abord » — soumission atomique ─────────── */
/*
 * Une seule Server Action gère tout le parcours de revendication, fichiers
 * compris. Elle évite : le profil « fantôme » (le placeholder est copié depuis
 * la fiche, sans ressaisie), le mur de vérification e-mail (auth différée :
 * on connecte tout de suite et l'e-mail de confirmation part en arrière-plan),
 * et l'impasse du compte patient (promu praticien à la soumission).
 */

/** Écrit une pièce justificative dans le stockage privé et y attache sa catégorie. */
async function saveDocument(file: File, category: DocCategory): Promise<DocumentInput> {
  try {
    const saved = await saveDocumentFile(file, "claim");
    return { ...saved, category };
  } catch (err) {
    if (err instanceof DocumentValidationError && err.reason === "TOO_LARGE")
      throw new Error("Fichier trop volumineux (max 5 Mo).");
    throw new Error("Format de fichier non supporté (JPG, PNG ou PDF).");
  }
}

function slugifyName(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueDoctorSlug(prenom: string, nom: string): Promise<string> {
  const base = slugifyName(`${prenom} ${nom}`) || "docteur";
  let slug = base;
  let n = 1;
  while (await prisma.doctor.findUnique({ where: { slug }, select: { id: true } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type ClaimFlowState = {
  ok?: boolean;
  /** Erreurs par champ : email | password | cgu | documents | form */
  errors?: Record<string, string>;
} | undefined;

export async function submitClaimFlow(
  _prev: ClaimFlowState,
  formData: FormData,
): Promise<ClaimFlowState> {
  const ficheId     = String(formData.get("ficheId")   ?? "").trim();
  const ficheSlug   = String(formData.get("ficheSlug") ?? "").trim();
  const message     = String(formData.get("message")   ?? "").trim();
  const ordreNumber = String(formData.get("ordreNumber") ?? "").trim();
  const cinFile     = formData.get("cin");
  const diplomeFile = formData.get("diplome");

  if (!ficheId) return { errors: { form: "Fiche introuvable." } };

  /* ── Validation des pièces (avant toute écriture) ── */
  if (!(cinFile instanceof File) || cinFile.size === 0)
    return { errors: { documents: "La copie de la CIN est obligatoire." } };
  const hasDiplome = diplomeFile instanceof File && diplomeFile.size > 0;
  if (!hasDiplome && !ordreNumber)
    return { errors: { documents: "Fournissez votre diplôme OU votre numéro d'inscription à l'Ordre National des Médecins." } };

  /* ── Fiche à revendiquer (source de vérité — jamais le client) ── */
  const fiche = await prisma.doctor.findUnique({
    where:  { id: ficheId },
    select: {
      id: true, userId: true, prenom: true, nom: true, civilite: true,
      adresse: true, phone: true, specialtyId: true, cityId: true,
    },
  });
  if (!fiche) return { errors: { form: "Fiche introuvable." } };
  if (fiche.userId) return { errors: { form: "Cette fiche a déjà été revendiquée par un autre compte." } };

  const session = await tryGetSession();

  /* Données du placeholder, copiées depuis la fiche (zéro ressaisie). */
  const profileSeed = {
    specialtyId: fiche.specialtyId,
    cityId:      fiche.cityId,
    nom:         fiche.nom,
    prenom:      fiche.prenom,
    civilite:    fiche.civilite,
    adresse:     fiche.adresse,
    phone:       fiche.phone,
    isActive:    false,
    isVerified:  false,
  };
  const fullName = [fiche.civilite, fiche.prenom, fiche.nom].filter(Boolean).join(" ");

  let verifEmail: { email: string; name: string; token: string } | null = null;

  /* ── Branche invité : création de compte « preuve d'abord » ── */
  if (!session?.userId) {
    const email    = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const cgu      = formData.get("cgu");

    const errors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email    = "Adresse e-mail invalide.";
    if (password.length < 8 || !/[0-9]/.test(password)) errors.password = "8 caractères minimum, dont un chiffre.";
    if (cgu !== "on") errors.cgu = "Vous devez accepter les conditions d'utilisation.";
    if (Object.keys(errors).length) return { errors };

    const limit = rateLimit(`claim-guest:${email}`, 3, 60 * 60 * 1_000);
    if (!limit.success) return { errors: { form: "Trop de tentatives. Réessayez dans une heure." } };

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing)
      return { errors: { email: "Un compte existe déjà avec cet e-mail. Connectez-vous pour revendiquer." } };

    let documents: DocumentInput[];
    try {
      documents = [await saveDocument(cinFile, "cin"), ...(hasDiplome ? [await saveDocument(diplomeFile as File, "diplome")] : [])];
    } catch (e) {
      return { errors: { documents: e instanceof Error ? e.message : "Erreur lors de l'envoi des fichiers." } };
    }

    const hashed = await bcrypt.hash(password, 10);
    const token  = crypto.randomBytes(32).toString("hex");
    const slug   = await uniqueDoctorSlug(fiche.prenom ?? "", fiche.nom ?? "");
    const name   = fullName || email;

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name, email, password: hashed, role: "DOCTOR", phone: fiche.phone,
          verificationToken: token,
          verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      await tx.doctor.create({ data: { userId: u.id, slug, ...profileSeed } });
      await tx.doctorClaim.create({
        data: {
          doctorId: fiche.id, userId: u.id, status: "PENDING",
          message: message || null, ordreNumber: ordreNumber || null,
          documents: documents as object[],
        },
      });
      return u;
    });

    await createSession(user.id, "DOCTOR");
    verifEmail = { email, name, token };
  }

  /* ── Branche connectée ── */
  else {
    if (session.role === "ADMIN")
      return { errors: { form: "Un compte administrateur ne peut pas revendiquer de fiche." } };

    let documents: DocumentInput[];
    try {
      documents = [await saveDocument(cinFile, "cin"), ...(hasDiplome ? [await saveDocument(diplomeFile as File, "diplome")] : [])];
    } catch (e) {
      return { errors: { documents: e instanceof Error ? e.message : "Erreur lors de l'envoi des fichiers." } };
    }

    const userId = session.userId;

    await prisma.$transaction(async (tx) => {
      // Compte patient → promotion en praticien (fin de l'impasse de rôle).
      if (session.role !== "DOCTOR") {
        await tx.user.update({ where: { id: userId }, data: { role: "DOCTOR" } });
      }
      // Garantit l'invariant « praticien ⇒ profil » sans ressaisie.
      const own = await tx.doctor.findUnique({ where: { userId }, select: { id: true } });
      if (!own) {
        const slug = await uniqueDoctorSlug(fiche.prenom ?? "", fiche.nom ?? "");
        await tx.doctor.create({ data: { userId, slug, ...profileSeed } });
      }
      await tx.doctorClaim.upsert({
        where:  { doctorId_userId: { doctorId: fiche.id, userId } },
        create: {
          doctorId: fiche.id, userId, status: "PENDING",
          message: message || null, ordreNumber: ordreNumber || null,
          documents: documents as object[],
        },
        update: {
          status: "PENDING", message: message || null, ordreNumber: ordreNumber || null,
          documents: documents as object[], adminNote: null, reviewedAt: null, reviewedById: null,
        },
      });
    });

    // Rafraîchit le rôle dans la session si on vient de promouvoir un patient.
    if (session.role !== "DOCTOR") await createSession(userId, "DOCTOR");
  }

  /* ── E-mail de vérification : différé, jamais bloquant ── */
  if (verifEmail) {
    try {
      await sendVerificationEmail(verifEmail.email, verifEmail.name, verifEmail.token, "/praticien/tableau-de-bord");
    } catch (e) {
      console.error("[submitClaimFlow] Verification email failed:", e);
    }
  }

  if (ficheSlug) revalidatePath(`/praticiens/${ficheSlug}`);
  revalidatePath("/admin/revendications");
  return { ok: true };
}

/* ── Approuver (ADMIN) ──────────────────────────────────────── */

export async function approveClaim(claimId: string): Promise<void> {
  const session = await verifySession();
  if (session.role !== "ADMIN") throw new Error("Accès refusé.");

  const claim = await prisma.doctorClaim.findUnique({
    where:   { id: claimId },
    include: { doctor: { select: { id: true, userId: true, slug: true } } },
  });
  if (!claim) throw new Error("Demande introuvable.");
  if (claim.status !== "PENDING") throw new Error("Cette demande a déjà été traitée.");
  if (claim.doctor.userId) throw new Error("Cette fiche est déjà associée à un compte médecin.");

  // Si le revendicateur a un profil d'inscription non actif, le délier d'abord
  const claimantExistingProfile = await prisma.doctor.findUnique({
    where:  { userId: claim.userId },
    select: { id: true, isActive: true, isVerified: true },
  });

  await prisma.$transaction(async (tx) => {
    if (claimantExistingProfile && !claimantExistingProfile.isActive && !claimantExistingProfile.isVerified) {
      await tx.doctor.update({
        where: { id: claimantExistingProfile.id },
        data:  { userId: null },
      });
    }

    await tx.doctor.update({
      where: { id: claim.doctorId },
      data:  { userId: claim.userId },
    });

    await tx.doctorClaim.update({
      where: { id: claimId },
      data:  { status: "APPROVED", reviewedAt: new Date(), reviewedById: session.userId },
    });

    await tx.doctorClaim.updateMany({
      where: { doctorId: claim.doctorId, status: "PENDING", id: { not: claimId } },
      data: {
        status:      "REJECTED",
        adminNote:   "Fiche attribuée à un autre compte.",
        reviewedAt:  new Date(),
        reviewedById: session.userId,
      },
    });
  });

  revalidatePath("/admin/revendications");
  revalidatePath(`/admin/revendications/${claimId}`);
  if (claim.doctor.slug) revalidatePath(`/praticiens/${claim.doctor.slug}`);
}

/* ── Rejeter (ADMIN) ────────────────────────────────────────── */

export async function rejectClaim(claimId: string, adminNote: string): Promise<void> {
  const session = await verifySession();
  if (session.role !== "ADMIN") throw new Error("Accès refusé.");
  if (!adminNote.trim()) throw new Error("Un motif de refus est requis.");

  const claim = await prisma.doctorClaim.findUnique({
    where:   { id: claimId },
    include: { doctor: { select: { slug: true } } },
  });
  if (!claim) throw new Error("Demande introuvable.");
  if (claim.status !== "PENDING") throw new Error("Cette demande a déjà été traitée.");

  await prisma.doctorClaim.update({
    where: { id: claimId },
    data: {
      status: "REJECTED",
      adminNote: adminNote.trim(),
      reviewedAt: new Date(),
      reviewedById: session.userId,
    },
  });

  revalidatePath("/admin/revendications");
  revalidatePath(`/admin/revendications/${claimId}`);
  if (claim.doctor.slug) revalidatePath(`/praticiens/${claim.doctor.slug}`);
}
