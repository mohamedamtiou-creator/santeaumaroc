"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
// `revalidatePath` : pages /admin uniquement (rendues dynamiquement — l'appel
// n'y rafraîchit que le cache routeur client). Tout ce qui est public passe par
// les invalidateurs de lib/revalidate.ts, qui couvrent les DEUX locales.
import { revalidatePath } from "next/cache";
import {
  revalidateDoctor,
  revalidateDirectory,
  revalidateLocalizedPath,
  revalidateSitemaps,
} from "@/lib/revalidate";
import { sendVerificationApprovedEmail, sendVerificationRejectedEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await verifySession();
  // Recheck from DB — a JWT can outlive a role change or account deactivation.
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, isActive: true },
  });
  if (!user || user.role !== "ADMIN" || !user.isActive) {
    throw new Error("Accès refusé");
  }
  return session;
}

/* ── Liste ──────────────────────────────────────────────── */

export async function getDoctorsForAdmin(filtre?: string, q?: string) {
  const where = {
    ...(filtre === "non-verifies" && { isVerified: false, claims: { some: { status: "PENDING" } } }),
    ...(filtre === "verifies"     && { isVerified: true }),
    ...(filtre === "inactifs"     && { isActive: false }),
    ...(q && {
      OR: [
        { nom:    { contains: q, mode: "insensitive" as const } },
        { prenom: { contains: q, mode: "insensitive" as const } },
        { user:   { email: { contains: q, mode: "insensitive" as const } } },
      ],
    }),
  };

  return prisma.doctor.findMany({
    where,
    include: {
      user:      { select: { email: true } },
      specialty: { select: { name: true } },
      city:      { select: { name: true } },
      claims:    { select: { status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ claims: { _count: "desc" } }, { isVerified: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
}

/* ── Détail médecin ─────────────────────────────────────── */

export async function getDoctorDetail(id: string) {
  await requireAdmin();
  return prisma.doctor.findUnique({
    where: { id },
    include: {
      user:      { select: { email: true, name: true, createdAt: true } },
      specialty: { select: { name: true } },
      city:      { select: { name: true } },
      claims: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          reviewer: { select: { name: true } },
        },
        // ordreNumber included via model
      },
      verificationLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { admin: { select: { name: true } } },
      },
    },
  });
}

/* ── Vérification ───────────────────────────────────────── */

export async function approveVerification(doctorId: string, note?: string) {
  const session = await requireAdmin();

  const doctor = await prisma.doctor.findUnique({
    where:   { id: doctorId },
    include: { user: { select: { email: true, name: true } }, claims: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  if (!doctor) throw new Error("Médecin introuvable");

  await prisma.$transaction([
    prisma.doctor.update({
      where: { id: doctorId },
      data:  { isVerified: true, isActive: true },
    }),
    prisma.doctorClaim.updateMany({
      where: { doctorId, status: "PENDING" },
      data:  { status: "APPROVED", adminNote: note ?? null, reviewedAt: new Date(), reviewedById: session.userId },
    }),
    prisma.verificationLog.create({
      data: { doctorId, adminId: session.userId, action: "APPROVED", note: note ?? null },
    }),
  ]);

  if (doctor.user?.email) {
    await sendVerificationApprovedEmail(
      doctor.user.email,
      [doctor.civilite, doctor.prenom, doctor.nom].filter(Boolean).join(" ") || doctor.user.name,
      note
    ).catch(console.error);
  }

  revalidatePath("/admin/praticiens");
  revalidatePath(`/admin/praticiens/${doctorId}`);
  revalidatePath("/praticien/tableau-de-bord/verification");
  // La validation pose le badge « vérifié » ET réactive la fiche : celle-ci
  // rentre donc dans le périmètre indexable (sitemap) et son rendu change.
  revalidateDoctor(doctor.slug);
  revalidateLocalizedPath("/praticiens");
  revalidateSitemaps();
}

export async function rejectVerification(doctorId: string, note: string) {
  const session = await requireAdmin();
  if (!note.trim()) throw new Error("Un motif de refus est requis");

  const doctor = await prisma.doctor.findUnique({
    where:   { id: doctorId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!doctor) throw new Error("Médecin introuvable");

  await prisma.$transaction([
    prisma.doctorClaim.updateMany({
      where: { doctorId, status: "PENDING" },
      data:  { status: "REJECTED", adminNote: note, reviewedAt: new Date(), reviewedById: session.userId },
    }),
    prisma.verificationLog.create({
      data: { doctorId, adminId: session.userId, action: "REJECTED", note },
    }),
  ]);

  if (doctor.user?.email) {
    await sendVerificationRejectedEmail(
      doctor.user.email,
      [doctor.civilite, doctor.prenom, doctor.nom].filter(Boolean).join(" ") || doctor.user.name,
      note
    ).catch(console.error);
  }

  revalidatePath("/admin/praticiens");
  revalidatePath(`/admin/praticiens/${doctorId}`);
  revalidatePath("/praticien/tableau-de-bord/verification");
}

export async function revokeVerification(doctorId: string, note: string) {
  const session = await requireAdmin();

  await prisma.$transaction([
    prisma.doctor.update({
      where: { id: doctorId },
      data:  { isVerified: false },
    }),
    prisma.verificationLog.create({
      data: { doctorId, adminId: session.userId, action: "REVOKED", note: note || null },
    }),
  ]);

  revalidatePath("/admin/praticiens");
  revalidatePath(`/admin/praticiens/${doctorId}`);
  // Le badge « vérifié » disparaît de la fiche publique et du listing.
  const revoked = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { slug: true } });
  revalidateDoctor(revoked?.slug);
  revalidateLocalizedPath("/praticiens");
}

/* ── Activation ─────────────────────────────────────────── */

export async function toggleDoctorActive(doctorId: string, current: boolean) {
  await requireAdmin();
  // Slug, spécialité et ville sont lus pour l'invalidation : (dés)activer une
  // fiche la fait entrer ou sortir du sitemap, et décale les compteurs de tous
  // les silos où elle est comptée (spécialité, ville, combo).
  const doctor = await prisma.doctor.update({
    where: { id: doctorId },
    data:  { isActive: !current },
    select: { slug: true, specialty: { select: { slug: true } }, city: { select: { slug: true } } },
  });
  revalidatePath("/admin/praticiens");
  revalidateDoctor(doctor.slug);
  revalidateDirectory(doctor.specialty?.slug, doctor.city?.slug);
  revalidateLocalizedPath("/praticiens");
  revalidateSitemaps();
}

/* ── Localisation / coordonnées GPS (SEO local + schema geo) ── */

export async function setDoctorCoordinates(
  doctorId: string,
  latitude: number | null,
  longitude: number | null,
) {
  await requireAdmin();

  // geo n'a de sens qu'avec les deux valeurs ; on accepte aussi le couple null (effacement).
  const hasLat = latitude != null;
  const hasLng = longitude != null;
  if (hasLat !== hasLng) {
    throw new Error("Latitude et longitude doivent être renseignées ensemble.");
  }
  if (hasLat && (latitude! < -90 || latitude! > 90)) {
    throw new Error("Latitude invalide (doit être comprise entre -90 et 90).");
  }
  if (hasLng && (longitude! < -180 || longitude! > 180)) {
    throw new Error("Longitude invalide (doit être comprise entre -180 et 180).");
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { slug: true } });
  if (!doctor) throw new Error("Médecin introuvable");

  await prisma.doctor.update({
    where: { id: doctorId },
    data:  { latitude: hasLat ? latitude : null, longitude: hasLng ? longitude : null },
  });

  revalidatePath(`/admin/praticiens/${doctorId}`);
  revalidateDoctor(doctor.slug);
}

/* ── Stats dashboard ────────────────────────────────────── */

export async function getAdminStats() {
  await requireAdmin();
  const [total, verified, pending, inactive] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctor.count({ where: { isVerified: true } }),
    prisma.doctorClaim.count({ where: { status: "PENDING" } }),
    prisma.doctor.count({ where: { isActive: false } }),
  ]);
  return { total, verified, pending, inactive };
}

/* ── Plan / abonnement du médecin (gating des fonctions Pro) ── */
const PLAN_VALUES = ["FREE", "PRO", "CABINET"];

export async function setDoctorPlan(doctorId: string, plan: string) {
  await requireAdmin();
  if (!PLAN_VALUES.includes(plan)) throw new Error("Plan invalide");

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { slug: true } });
  if (!doctor) throw new Error("Médecin introuvable");

  await prisma.doctor.update({
    where: { id: doctorId },
    data: {
      plan,
      planActivatedAt: plan === "FREE" ? null : new Date(),
      planExpiresAt:   null, // activation manuelle sans échéance
    },
  });

  revalidatePath("/admin/praticiens");
  revalidatePath(`/admin/praticiens/${doctorId}`);
  revalidateDoctor(doctor.slug);
}
