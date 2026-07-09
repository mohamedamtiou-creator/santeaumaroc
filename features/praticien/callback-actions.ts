"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

/** Met à jour le statut d'une demande de rappel — réservé au praticien propriétaire de la fiche. */
export async function setCallbackStatus(id: string, status: "PENDING" | "CONTACTED") {
  const e = getDictionary(await getLocale()).dashboard.errors;
  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") throw new Error(e.unauthorized);

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });
  if (!doctor) throw new Error(e.profileNotFound);

  // updateMany scoppé au doctorId : empêche d'agir sur le rappel d'un autre praticien.
  const res = await prisma.callbackRequest.updateMany({
    where: { id, doctorId: doctor.id },
    data: { status },
  });
  if (res.count === 0) throw new Error(e.unauthorized);

  revalidatePath("/praticien/tableau-de-bord/rappels");
  revalidatePath("/praticien/tableau-de-bord");
}
