"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

async function dashErrors() {
  return getDictionary(await getLocale()).dashboard.errors;
}

async function getDoctorRef(userId: string) {
  return prisma.doctor.findUnique({ where: { userId }, select: { id: true, slug: true } });
}

/**
 * Revalide la fiche publique ET la page de prise de RDV du médecin : horaires,
 * absences et règles de réservation changent les créneaux affichés publiquement,
 * qui seraient sinon périmés jusqu'à la revalidation temporelle (1 h).
 */
function revalidatePublicDoctor(slug: string | null | undefined) {
  if (!slug) return;
  revalidatePath(`/praticiens/${slug}`);
  revalidatePath(`/praticiens/${slug}/rdv`);
}

/* ── Absences ───────────────────────────────────────────── */

export async function createAbsence(data: {
  type: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}) {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") throw new Error(e.unauthorized);

  const doctor = await getDoctorRef(session.userId);
  if (!doctor) throw new Error(e.profileNotFound);

  if (data.endDate < data.startDate) throw new Error(e.absEndAfterStart);

  await prisma.doctorAbsence.create({
    data: {
      doctorId:  doctor.id,
      type:      data.type,
      startDate: data.startDate,
      endDate:   data.endDate,
      allDay:    data.allDay,
      startTime: data.allDay ? null : (data.startTime ?? null),
      endTime:   data.allDay ? null : (data.endTime   ?? null),
      reason:    data.reason?.trim() || null,
    },
  });

  revalidatePath("/praticien/tableau-de-bord/horaires");
  revalidatePath("/praticien/tableau-de-bord/agenda");
  revalidatePublicDoctor(doctor.slug);
}

export async function deleteAbsence(id: string) {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") throw new Error(e.unauthorized);

  const doctor = await getDoctorRef(session.userId);
  if (!doctor) throw new Error(e.profileNotFound);

  const absence = await prisma.doctorAbsence.findUnique({ where: { id }, select: { doctorId: true } });
  if (!absence || absence.doctorId !== doctor.id) throw new Error(e.absenceNotFound);

  await prisma.doctorAbsence.delete({ where: { id } });

  revalidatePath("/praticien/tableau-de-bord/horaires");
  revalidatePath("/praticien/tableau-de-bord/agenda");
  revalidatePublicDoctor(doctor.slug);
}

/* ── Booking rules ──────────────────────────────────────── */

export async function updateBookingRules(data: {
  consultationDuration: number;
  bookingLeadHours: number;
  bookingMaxDays: number;
}) {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") throw new Error(e.unauthorized);

  const doctor = await getDoctorRef(session.userId);
  if (!doctor) throw new Error(e.profileNotFound);

  await prisma.doctor.update({
    where: { id: doctor.id },
    data: {
      consultationDuration: data.consultationDuration,
      bookingLeadHours:     data.bookingLeadHours,
      bookingMaxDays:       data.bookingMaxDays,
    },
  });

  revalidatePath("/praticien/tableau-de-bord/horaires");
  revalidatePath("/praticien/tableau-de-bord/profil");
  revalidatePublicDoctor(doctor.slug);
}
