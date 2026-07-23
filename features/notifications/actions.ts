"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

/** Marque toutes les notifications de l'utilisateur courant comme lues. */
export async function markAllNotificationsRead(): Promise<void> {
  const session = await verifySession();
  await prisma.notification.updateMany({
    where: { userId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/espace-auteur/notifications");
}
