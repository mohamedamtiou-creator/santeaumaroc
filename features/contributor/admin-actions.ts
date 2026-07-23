"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { AUTHOR_STATUS } from "@/lib/contributor";
import { notifyAuthorVerification } from "@/features/notifications/dispatch";

async function requireAdmin() {
  const session = await verifySession();
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true, isActive: true } });
  if (!user || user.role !== "ADMIN" || !user.isActive) throw new Error("Accès refusé.");
  return session;
}

/** S'assure que le badge « Auteur vérifié » existe, puis l'attribue à l'auteur. */
async function grantVerifiedBadge(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], userId: string) {
  const badge = await tx.badge.upsert({
    where: { code: "VERIFIED" },
    create: { code: "VERIFIED", label: "Auteur vérifié", labelAr: "كاتب موثَّق", icon: "badge-check" },
    update: {},
  });
  await tx.authorBadge.upsert({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
    create: { userId, badgeId: badge.id },
    update: {},
  });
}

/** Valide l'identité d'un auteur : statut VERIFIED, licences approuvées, badge, notif. */
export async function approveAuthor(userId: string): Promise<void> {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } });
  if (!user) throw new Error("Auteur introuvable.");

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { authorStatus: AUTHOR_STATUS.VERIFIED } });
    await tx.medicalLicense.updateMany({
      where: { userId, status: "PENDING" },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });
    await grantVerifiedBadge(tx, userId);
  });

  await notifyAuthorVerification({ userId: user.id, email: user.email, name: user.name, approved: true });

  revalidatePath("/admin/auteurs");
}

/** Refuse un dossier auteur : statut UNVERIFIED, licences refusées (motif), notif. */
export async function rejectAuthor(userId: string, note: string): Promise<void> {
  await requireAdmin();
  const reason = note.trim();
  if (!reason) throw new Error("Un motif de refus est requis.");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } });
  if (!user) throw new Error("Auteur introuvable.");

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { authorStatus: AUTHOR_STATUS.UNVERIFIED } });
    await tx.medicalLicense.updateMany({
      where: { userId, status: "PENDING" },
      data: { status: "REJECTED", reviewedAt: new Date(), adminNote: reason },
    });
  });

  await notifyAuthorVerification({ userId: user.id, email: user.email, name: user.name, approved: false, note: reason });

  revalidatePath("/admin/auteurs");
}
