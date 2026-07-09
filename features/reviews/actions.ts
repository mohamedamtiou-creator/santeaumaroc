"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export async function submitReview(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const e = getDictionary(await getLocale()).review.errors;

  /* ── Authentification ─────────────────────────────────────── */
  const session = await tryGetSession();
  if (!session?.userId) {
    return { message: e.notLoggedIn };
  }
  if (session.role !== "PATIENT" && session.role !== "ADMIN") {
    return { message: e.notPatient };
  }

  /* ── Extraction des données ───────────────────────────────── */
  const doctorId   = ((formData.get("doctorId")   ?? "") as string).trim();
  const doctorSlug = ((formData.get("doctorSlug") ?? "") as string).trim();
  const ratingRaw  = formData.get("rating");
  const comment    = ((formData.get("comment")    ?? "") as string).trim();

  /* ── Validation de la note ────────────────────────────────── */
  const rating = Number(ratingRaw);
  if (!doctorId || isNaN(rating) || rating < 1 || rating > 5) {
    return { errors: { rating: [e.rating] } };
  }

  /* ── Validation du commentaire ────────────────────────────── */
  if (comment.length > 0 && comment.length < 10) {
    return { errors: { comment: [e.commentMin] } };
  }
  if (comment.length > 600) {
    return { errors: { comment: [e.commentMax] } };
  }

  /* ── Vérification : patient doit avoir un RDV avec ce médecin ── */
  const existingReview = await prisma.review.findUnique({
    where:  { patientId_doctorId: { patientId: session.userId, doctorId } },
    select: { id: true, appointmentId: true },
  });

  // RDV à rattacher à l'avis (le plus récent honoré en priorité) → « Consultation vérifiée ».
  const linkAppointment = await prisma.appointment.findFirst({
    where: {
      patientId: session.userId,
      doctorId,
      status:    { notIn: ["CANCELLED"] },
    },
    orderBy: [{ completedAt: "desc" }, { date: "desc" }],
    select: { id: true },
  });

  if (!existingReview && !linkAppointment) {
    return { message: e.needAppointment };
  }
  // RDV à lier : seulement si l'avis n'en a pas déjà un (évite tout conflit d'unicité).
  const appointmentToLink = !existingReview?.appointmentId ? linkAppointment?.id ?? null : null;

  /* ── Anti-spam : limite 5 nouveaux avis par 24 h ─────────── */
  if (!existingReview) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.review.count({
      where: { patientId: session.userId, createdAt: { gte: since } },
    });
    if (recentCount >= 5) {
      return { message: e.rateLimit };
    }
  }

  /* ── Upsert : un seul avis par patient et par médecin ──────── */
  await prisma.review.upsert({
    where: { patientId_doctorId: { patientId: session.userId, doctorId } },
    create: {
      patientId: session.userId,
      doctorId,
      rating,
      comment:   comment || null,
      appointmentId: appointmentToLink,
    },
    update: {
      rating,
      comment: comment || null,
      ...(appointmentToLink && { appointmentId: appointmentToLink }),
    },
  });

  /* ── Recalcul de la note moyenne + compteur d'avis dénormalisé ── */
  const agg = await prisma.review.aggregate({
    where: { doctorId },
    _avg:  { rating: true },
    _count: true,
  });
  await prisma.doctor.update({
    where: { id: doctorId },
    data:  { averageRating: agg._avg.rating ?? 0, reviewsCount: agg._count },
  });

  /* ── Revalidation du cache ────────────────────────────────── */
  revalidatePath("/tableau-de-bord/rendez-vous");
  if (doctorSlug) {
    revalidatePath(`/praticiens/${doctorSlug}`);
  }

  return { message: "ok" };
}

/**
 * Avis laissé depuis le lien e-mail post-consultation (`/avis/[token]`).
 * Authentifié par le token du rendez-vous — pas de session requise (faible friction).
 * L'avis est systématiquement rattaché au RDV → badge « Consultation vérifiée ».
 */
export async function submitTokenReview(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const e = getDictionary(await getLocale()).review.errors;

  const token     = ((formData.get("token")   ?? "") as string).trim();
  const ratingRaw = formData.get("rating");
  const comment   = ((formData.get("comment") ?? "") as string).trim();

  if (!token) return { message: e.invalidLink };

  const appt = await prisma.appointment.findUnique({
    where:  { reviewToken: token },
    select: { id: true, patientId: true, doctorId: true, doctor: { select: { slug: true } } },
  });
  if (!appt) return { message: e.invalidLink };

  const rating = Number(ratingRaw);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { errors: { rating: [e.rating] } };
  }
  if (comment.length > 0 && comment.length < 10) {
    return { errors: { comment: [e.commentMin] } };
  }
  if (comment.length > 600) {
    return { errors: { comment: [e.commentMax] } };
  }

  await prisma.review.upsert({
    where: { patientId_doctorId: { patientId: appt.patientId, doctorId: appt.doctorId } },
    create: {
      patientId:     appt.patientId,
      doctorId:      appt.doctorId,
      appointmentId: appt.id,
      rating,
      comment: comment || null,
    },
    update: {
      rating,
      comment:       comment || null,
      appointmentId: appt.id,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { doctorId: appt.doctorId },
    _avg:  { rating: true },
    _count: true,
  });
  await prisma.doctor.update({
    where: { id: appt.doctorId },
    data:  { averageRating: agg._avg.rating ?? 0, reviewsCount: agg._count },
  });

  if (appt.doctor.slug) revalidatePath(`/praticiens/${appt.doctor.slug}`);
  return { message: "ok" };
}

/**
 * Avis sur un établissement (clinique / pharmacie / laboratoire).
 *
 * Modèle de confiance : tout utilisateur connecté peut noter (impossible de
 * vérifier une « visite » — aucun RDV n'existe côté établissement). Publication
 * immédiate + un seul avis par utilisateur et par établissement (modifiable),
 * `isPublic` permettant le masquage/modération a posteriori. Rate-limit 5 / 24 h.
 * Le nom du compte est dénormalisé dans `auteur` (affichage sans jointure).
 */
export async function submitEstablishmentReview(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const e = getDictionary(await getLocale()).review.errors;

  const session = await tryGetSession();
  if (!session?.userId) {
    return { message: e.notLoggedIn };
  }

  const establishmentId = ((formData.get("establishmentId") ?? "") as string).trim();
  const basePath        = ((formData.get("basePath")        ?? "") as string).trim();
  const slug            = ((formData.get("slug")            ?? "") as string).trim();
  const ratingRaw       = formData.get("rating");
  const comment         = ((formData.get("comment")         ?? "") as string).trim();

  const rating = Number(ratingRaw);
  if (!establishmentId || isNaN(rating) || rating < 1 || rating > 5) {
    return { errors: { rating: [e.rating] } };
  }
  if (comment.length > 0 && comment.length < 10) {
    return { errors: { comment: [e.commentMin] } };
  }
  if (comment.length > 600) {
    return { errors: { comment: [e.commentMax] } };
  }

  const estab = await prisma.establishment.findUnique({
    where:  { id: establishmentId },
    select: { id: true, isActive: true },
  });
  if (!estab || !estab.isActive) return { message: e.invalidLink };

  const user = await prisma.user.findUnique({
    where:  { id: session.userId },
    select: { name: true },
  });
  const auteur = user?.name?.trim() || "Utilisateur";

  const existing = await prisma.establishmentReview.findFirst({
    where:  { userId: session.userId, establishmentId },
    select: { id: true },
  });

  // Anti-spam : 5 nouveaux avis maximum par 24 h.
  if (!existing) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.establishmentReview.count({
      where: { userId: session.userId, createdAt: { gte: since } },
    });
    if (recentCount >= 5) {
      return { message: e.rateLimit };
    }
  }

  if (existing) {
    await prisma.establishmentReview.update({
      where: { id: existing.id },
      data:  { note: rating, commentaire: comment || null, auteur },
    });
  } else {
    await prisma.establishmentReview.create({
      data: {
        establishmentId,
        userId: session.userId,
        note:   rating,
        commentaire: comment || null,
        auteur,
        isPublic: true,
      },
    });
  }

  // Recalcul de la note moyenne (avis publics uniquement).
  const agg = await prisma.establishmentReview.aggregate({
    where: { establishmentId, isPublic: true },
    _avg:  { note: true },
  });
  await prisma.establishment.update({
    where: { id: establishmentId },
    data:  { averageRating: agg._avg.note ?? 0 },
  });

  // Revalide la fiche établissement (route dépend du type : /cliniques, …).
  if (basePath.startsWith("/") && slug) {
    revalidatePath(`${basePath}/${slug}`);
  }

  return { message: "ok" };
}
