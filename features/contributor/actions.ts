"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { createSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { saveDocumentFile, DocumentValidationError } from "@/lib/document-storage";
import {
  PROFESSION_KINDS,
  ROLE_CONTRIBUTOR,
  AUTHOR_STATUS,
  LICENSE_KINDS,
  requiredLicenseKinds,
  authorSlugBase,
  canContribute,
} from "@/lib/contributor";

export type ContributorState = { ok?: boolean; errors?: Record<string, string> } | undefined;

/** Résout un slug auteur unique à partir d'un nom (suffixe -2, -3… si collision). */
async function uniqueAuthorSlug(name: string): Promise<string> {
  const base = authorSlugBase(name);
  let slug = base;
  let n = 1;
  while (await prisma.user.findUnique({ where: { authorSlug: slug }, select: { id: true } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

/**
 * Candidature « devenir auteur ». L'utilisateur connecté déclare sa profession :
 * un PATIENT est promu CONTRIBUTOR ; un DOCTOR/ADMIN garde son rôle mais reçoit
 * les champs auteur. Aucune preuve ici → authorStatus = UNVERIFIED (l'étape
 * suivante est submitLicense). Un DOCTOR déjà vérifié pourra être fast-track
 * côté admin. Idempotent : ne régénère pas un authorSlug déjà posé.
 */
export async function applyAsAuthor(_prev: ContributorState, formData: FormData): Promise<ContributorState> {
  const session = await verifySession();

  const professionKind = String(formData.get("professionKind") ?? "").trim();
  const orgLegalName = String(formData.get("orgLegalName") ?? "").trim();

  if (!PROFESSION_KINDS.includes(professionKind)) {
    return { errors: { professionKind: "Sélectionnez votre profession." } };
  }

  const limit = rateLimit(`author-apply:${session.userId}`, 5, 60 * 60 * 1000);
  if (!limit.success) return { errors: { form: "Trop de tentatives. Réessayez plus tard." } };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, authorSlug: true, authorStatus: true },
  });
  if (!user) return { errors: { form: "Compte introuvable." } };
  if (user.role === "ADMIN") {
    return { errors: { form: "Un compte administrateur ne peut pas candidater comme auteur." } };
  }

  const slug = user.authorSlug ?? (await uniqueAuthorSlug(user.name || user.email));
  const isOrg = ["ASSOCIATION", "HOPITAL", "CLINIQUE"].includes(professionKind);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        professionKind,
        authorSlug: slug,
        // On ne rétrograde jamais un statut déjà VERIFIED (fast-track médecin).
        authorStatus: user.authorStatus === AUTHOR_STATUS.VERIFIED ? undefined : AUTHOR_STATUS.UNVERIFIED,
        // Un PATIENT devient CONTRIBUTOR ; DOCTOR reste DOCTOR (peut aussi contribuer).
        role: user.role === "PATIENT" ? ROLE_CONTRIBUTOR : undefined,
      },
    });
    await tx.contributorProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, isOrgAccount: isOrg, orgLegalName: isOrg && orgLegalName ? orgLegalName : null },
      update: { isOrgAccount: isOrg, orgLegalName: isOrg && orgLegalName ? orgLegalName : null },
    });
  });

  // Le rôle a pu changer (PATIENT → CONTRIBUTOR) : on rafraîchit le cookie de session.
  if (user.role === "PATIENT") await createSession(user.id, ROLE_CONTRIBUTOR);

  revalidatePath("/espace-auteur");
  return { ok: true };
}

/** Édition du profil public d'auteur (bio, diplômes, liens, ville, spécialité…). */
export async function updateAuthorProfile(_prev: ContributorState, formData: FormData): Promise<ContributorState> {
  const session = await verifySession();
  if (!canContribute(session.role)) return { errors: { form: "Accès refusé." } };

  const orNull = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v || null;
  };
  const url = (k: string) => {
    const v = orNull(k);
    if (!v) return null;
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  };
  const headline = orNull("headline");
  const languages = String(formData.get("languages") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const interests = String(formData.get("interests") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const yearsRaw = Number.parseInt(String(formData.get("yearsPractice") ?? ""), 10);
  const yearsPractice = Number.isFinite(yearsRaw) && yearsRaw >= 0 && yearsRaw < 80 ? yearsRaw : null;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.userId },
      data: {
        jobTitle: orNull("jobTitle"),
        credentials: orNull("credentials"),
        bio: orNull("bio"),
        bioAr: orNull("bioAr"),
        university: orNull("university"),
        orderName: orNull("orderName"),
        registrationNumber: orNull("registrationNumber"),
        website: url("website"),
        linkedin: url("linkedin"),
        cabinetUrl: url("cabinetUrl"),
        authorCityId: orNull("authorCityId"),
        authorSpecialtyId: orNull("authorSpecialtyId"),
      },
    });
    await tx.contributorProfile.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, headline, languages, interests, yearsPractice },
      update: { headline, languages, interests, yearsPractice },
    });
  });

  const u = await prisma.user.findUnique({ where: { id: session.userId }, select: { authorSlug: true } });
  if (u?.authorSlug) {
    revalidatePath(`/auteur/${u.authorSlug}`);
    revalidatePath(`/ar/auteur/${u.authorSlug}`);
  }
  revalidatePath("/espace-auteur/profil");
  return { ok: true };
}

/** Une pièce justificative téléversée → stockage privé. */
async function saveLicenseDoc(file: File): Promise<{ url: string; name: string }> {
  try {
    const saved = await saveDocumentFile(file, "license");
    return { url: saved.url, name: saved.name };
  } catch (err) {
    if (err instanceof DocumentValidationError && err.reason === "TOO_LARGE")
      throw new Error("Fichier trop volumineux (max 5 Mo).");
    throw new Error("Format non supporté (JPG, PNG ou PDF).");
  }
}

/**
 * Soumission des preuves d'identité (Ordre, diplôme, RC/statuts…). Crée les
 * MedicalLicense et passe l'auteur en PENDING → l'admin vérifie ensuite.
 * On attend au moins un document requis pour la profession déclarée.
 */
export async function submitLicense(_prev: ContributorState, formData: FormData): Promise<ContributorState> {
  const session = await verifySession();
  if (!canContribute(session.role)) return { errors: { form: "Accès refusé." } };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, professionKind: true, authorStatus: true },
  });
  if (!user?.professionKind) return { errors: { form: "Déclarez d'abord votre profession." } };

  const ordreNumber = String(formData.get("ordreNumber") ?? "").trim();
  const required = requiredLicenseKinds(user.professionKind);

  // Collecte des fichiers par type (champ nommé par kind : ORDRE, DIPLOME…).
  const toSave: { kind: string; file: File }[] = [];
  for (const kind of LICENSE_KINDS) {
    const f = formData.get(kind);
    if (f instanceof File && f.size > 0) toSave.push({ kind, file: f });
  }

  const hasOrderProof = ordreNumber || toSave.some((t) => t.kind === "ORDRE");
  const providedKinds = new Set(toSave.map((t) => t.kind));
  const missing = required.filter((k) => k === "ORDRE" ? !hasOrderProof : !providedKinds.has(k));
  if (missing.length) {
    return {
      errors: {
        documents: `Documents requis manquants : ${missing.join(", ")}. Fournissez au minimum ${required.join(" et ")}.`,
      },
    };
  }

  const limit = rateLimit(`author-license:${session.userId}`, 6, 60 * 60 * 1000);
  if (!limit.success) return { errors: { form: "Trop d'envois. Réessayez plus tard." } };

  let saved: { kind: string; url: string; name: string; ordreNumber: string | null }[];
  try {
    saved = await Promise.all(
      toSave.map(async (t) => {
        const doc = await saveLicenseDoc(t.file);
        return { kind: t.kind, url: doc.url, name: doc.name, ordreNumber: t.kind === "ORDRE" ? ordreNumber || null : null };
      }),
    );
  } catch (e) {
    return { errors: { documents: e instanceof Error ? e.message : "Erreur lors de l'envoi des fichiers." } };
  }

  await prisma.$transaction(async (tx) => {
    // Remplace un dossier antérieur en attente (re-soumission après refus).
    await tx.medicalLicense.deleteMany({ where: { userId: user.id, status: "PENDING" } });
    if (saved.length) {
      await tx.medicalLicense.createMany({
        data: saved.map((s) => ({
          userId: user.id,
          kind: s.kind,
          ordreNumber: s.ordreNumber,
          documentUrl: s.url,
          documentName: s.name,
        })),
      });
    }
    // N° d'Ordre sans document scanné : on l'enregistre quand même comme preuve ORDRE.
    if (ordreNumber && !saved.some((s) => s.kind === "ORDRE")) {
      await tx.medicalLicense.create({
        data: { userId: user.id, kind: "ORDRE", ordreNumber, documentUrl: "", documentName: "N° d'Ordre déclaré" },
      });
      await tx.user.update({ where: { id: user.id }, data: { registrationNumber: ordreNumber } });
    }
    if (user.authorStatus !== AUTHOR_STATUS.VERIFIED) {
      await tx.user.update({ where: { id: user.id }, data: { authorStatus: AUTHOR_STATUS.PENDING } });
    }
  });

  revalidatePath("/espace-auteur/verification");
  revalidatePath("/admin/auteurs");
  return { ok: true };
}
