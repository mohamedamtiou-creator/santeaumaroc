"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { sendAppointmentConfirmationEmail, sendReviewRequestEmail } from "@/lib/email";
import { randomUUID } from "crypto";
import { formatDate } from "@/lib/utils";
import type { FormState } from "@/lib/definitions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

async function dashErrors() {
  return getDictionary(await getLocale()).dashboard.errors;
}

export async function bookAppointment(state: FormState, formData: FormData): Promise<FormState> {
  const e = getDictionary(await getLocale()).rdv.errors;
  const session = await tryGetSession();
  if (!session?.userId) {
    return { message: e.notLoggedIn };
  }

  const doctorId = (formData.get("doctorId") ?? "") as string;
  const date = (formData.get("date") ?? "") as string;
  const time = (formData.get("time") ?? "") as string;
  const reason = (formData.get("reason") ?? "") as string;
  const phoneRaw = ((formData.get("phone") ?? "") as string).trim();

  if (!doctorId || !date || !time) {
    return { message: e.selectSlot };
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { message: e.invalidSlot };
  }

  // Slot must be in the future
  const slotDateTime = new Date(`${date}T${time}:00`);
  if (slotDateTime <= new Date()) {
    return { message: e.slotPast };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId, isActive: true },
    include: { user: { select: { email: true } } },
  });
  if (!doctor) {
    return { message: e.doctorNotFound };
  }

  // Patient must not already have an appointment with this doctor at this date/time
  const duplicate = await prisma.appointment.findFirst({
    where: {
      doctorId,
      patientId: session.userId,
      date,
      time,
      status: { notIn: ["CANCELLED"] },
    },
  });
  if (duplicate) {
    return { message: e.duplicate };
  }

  const patient = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, phone: true },
  });
  if (!patient) {
    return { message: e.userNotFound };
  }

  // Enregistre le téléphone (rappel SMS) si le patient n'en a pas encore et l'a fourni.
  if (!patient.phone && phoneRaw && /^[+0-9\s().-]{6,20}$/.test(phoneRaw)) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { phone: phoneRaw },
    });
  }

  // Wrap conflict check + insert in a transaction to prevent race conditions
  let appointment;
  try {
    appointment = await prisma.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: { doctorId, date, time, status: { notIn: ["CANCELLED"] } },
        select: { id: true },
      });
      if (conflict) return null;

      return tx.appointment.create({
        data: { patientId: session.userId, doctorId, date, time, reason: reason || null, status: "PENDING" },
      });
    });
  } catch {
    return { message: e.genericError };
  }

  if (!appointment) {
    return { message: e.slotTaken };
  }

  const doctorName = [doctor.civilite, doctor.prenom, doctor.nom]
    .filter(Boolean)
    .join(" ");

  try {
    await sendAppointmentConfirmationEmail(
      patient.email,
      patient.name,
      doctorName,
      formatDate(date),
      time
    );
  } catch {
    // email non bloquant
  }

  redirect(`/praticiens/${doctor.slug}/rdv/confirmation?id=${appointment.id}`);
}

export async function cancelAppointment(appointmentId: string): Promise<FormState> {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId) {
    return { message: e.unauthorized };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.patientId !== session.userId) {
    return { message: e.apptNotFound };
  }

  if (appointment.status === "CANCELLED") {
    return { message: e.alreadyCancelled };
  }

  // Cannot cancel if less than 2 hours before
  const slotDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
  const twoHoursBefore = new Date(slotDateTime.getTime() - 2 * 60 * 60 * 1000);
  if (new Date() > twoHoursBefore) {
    return { message: e.cancelTooLate };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  return { message: "ok" };
}

async function getDoctorFromSession(userId: string) {
  return prisma.doctor.findUnique({ where: { userId }, select: { id: true } });
}

export async function confirmAppointment(appointmentId: string): Promise<FormState> {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") return { message: e.unauthorized };

  const doctor = await getDoctorFromSession(session.userId);
  if (!doctor) return { message: e.doctorNotFound };

  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.doctorId !== doctor.id) return { message: e.apptNotFound };
  if (appt.status !== "PENDING") return { message: e.cannotConfirm };

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CONFIRMED" },
  });

  revalidatePath("/praticien/tableau-de-bord/rendez-vous");
  return { message: "ok" };
}

export async function completeAppointment(appointmentId: string): Promise<FormState> {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") return { message: e.unauthorized };

  const doctor = await getDoctorFromSession(session.userId);
  if (!doctor) return { message: e.doctorNotFound };

  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { name: true, email: true } },
      doctor:  { select: { civilite: true, prenom: true, nom: true } },
    },
  });
  if (!appt || appt.doctorId !== doctor.id) return { message: e.apptNotFound };
  if (!["PENDING", "CONFIRMED"].includes(appt.status)) return { message: e.cannotComplete };

  /* Collecte d'avis : on n'envoie une demande que si le patient n'a pas déjà
     évalué ce médecin et qu'aucun token n'a déjà été émis pour ce RDV (idempotent). */
  const alreadyReviewed = await prisma.review.findUnique({
    where:  { patientId_doctorId: { patientId: appt.patientId, doctorId: appt.doctorId } },
    select: { id: true },
  });
  const issueReviewRequest = !appt.reviewToken && !alreadyReviewed && !!appt.patient.email;
  const reviewToken = issueReviewRequest ? randomUUID() : appt.reviewToken;

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      ...(issueReviewRequest && { reviewToken, reviewRequestedAt: new Date() }),
    },
  });

  // Envoi best-effort : un échec d'e-mail ne doit pas faire échouer la clôture du RDV.
  if (issueReviewRequest && reviewToken) {
    const doctorName = [appt.doctor.civilite, appt.doctor.prenom, appt.doctor.nom].filter(Boolean).join(" ") || "votre médecin";
    try {
      await sendReviewRequestEmail(appt.patient.email!, appt.patient.name ?? "", doctorName, reviewToken);
    } catch (err) {
      console.error("[completeAppointment] Échec envoi demande d'avis →", err);
    }
  }

  revalidatePath("/praticien/tableau-de-bord/rendez-vous");
  revalidatePath("/praticien/tableau-de-bord/agenda");
  return { message: "ok" };
}

export async function cancelAppointmentByPraticien(appointmentId: string): Promise<FormState> {
  const e = await dashErrors();
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") return { message: e.unauthorized };

  const doctor = await getDoctorFromSession(session.userId);
  if (!doctor) return { message: e.doctorNotFound };

  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.doctorId !== doctor.id) return { message: e.apptNotFound };
  if (appt.status === "CANCELLED") return { message: e.alreadyCancelledShort };

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  revalidatePath("/praticien/tableau-de-bord/rendez-vous");
  revalidatePath("/praticien/tableau-de-bord/agenda");
  return { message: "ok" };
}
