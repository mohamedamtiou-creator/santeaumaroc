"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

type DocumentInput = { url: string; name: string; size: number; type: string; category: "cin" | "diplome" | "autre" };

export async function submitVerificationRequest(
  message: string,
  documents: DocumentInput[],
  ordreNumber?: string,
) {
  const e = getDictionary(await getLocale()).dashboard.errors;
  const session = await verifySession();
  if (session.role !== "DOCTOR") throw new Error(e.unauthorized);

  const doctor = await prisma.doctor.findUnique({
    where:  { userId: session.userId },
    select: { id: true },
  });
  if (!doctor) throw new Error(e.profileNotFound);

  await prisma.doctorClaim.upsert({
    where:  { doctorId_userId: { doctorId: doctor.id, userId: session.userId } },
    create: {
      doctorId:    doctor.id,
      userId:      session.userId,
      status:      "PENDING",
      message,
      ordreNumber: ordreNumber?.trim() || null,
      documents:   documents as object[],
    },
    update: {
      status:      "PENDING",
      message,
      ordreNumber: ordreNumber?.trim() || null,
      documents:   documents as object[],
      adminNote:    null,
      reviewedAt:   null,
      reviewedById: null,
    },
  });

  await prisma.verificationLog.create({
    data: {
      doctorId: doctor.id,
      action:   documents.length > 0 ? "SUBMITTED" : "DOCUMENTS_UPDATED",
      note:     message || null,
    },
  });

  revalidatePath("/praticien/tableau-de-bord/verification");
}

export async function getMyVerificationRequest() {
  const session = await verifySession();
  if (session.role !== "DOCTOR") return null;

  const doctor = await prisma.doctor.findUnique({
    where:  { userId: session.userId },
    select: {
      id: true,
      isVerified: true,
      isActive:   true,
      verificationLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { action: true, note: true, createdAt: true },
      },
      claims: {
        where:   { userId: session.userId },
        take:    1,
        select:  { status: true, message: true, adminNote: true, documents: true, ordreNumber: true, updatedAt: true },
      },
    },
  });

  if (!doctor) return null;
  return {
    isVerified: doctor.isVerified,
    isActive:   doctor.isActive,
    claim:      doctor.claims[0] ?? null,
    logs:       doctor.verificationLogs,
  };
}
