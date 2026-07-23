"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { canReview, EDITORIAL_STATUS } from "@/lib/contributor";
import type { Prisma } from "@prisma/client";
import { transition } from "@/features/articles/transitions";
import { publishArticleNow } from "@/features/articles/publish";
import { notifyArticleDecision } from "@/features/notifications/dispatch";

export type ReviewState = { ok?: boolean; errors?: Record<string, string> } | undefined;

/** Garde : relecteur médical (EDITOR) ou ADMIN, compte actif. */
async function requireEditor() {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user || !user.isActive || !canReview(user.role)) throw new Error("Accès refusé.");
  return user;
}

/** Prend un article en relecture (SUBMITTED → IN_REVIEW) et s'y assigne. */
export async function assignReview(postId: string): Promise<ReviewState> {
  const editor = await requireEditor();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { editorialStatus: true, authorId: true } });
  if (!post) return { errors: { form: "Article introuvable." } };
  if (post.authorId === editor.id) return { errors: { form: "Vous ne pouvez pas relire votre propre article." } };
  if (post.editorialStatus !== EDITORIAL_STATUS.SUBMITTED) {
    return { errors: { form: "Cet article n'est pas en attente de relecture." } };
  }

  await prisma.$transaction(async (tx) => {
    await tx.reviewAssignment.create({ data: { postId, editorId: editor.id, status: "OPEN" } });
    await transition(tx, {
      postId,
      from: post.editorialStatus,
      to: EDITORIAL_STATUS.IN_REVIEW,
      actorId: editor.id,
      action: "ASSIGNED",
    });
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${postId}/reviser`);
  return { ok: true };
}

/**
 * Décision de relecture : APPROVE | CHANGES | REJECT.
 * - APPROVE  : IN_REVIEW → APPROVED + pose la relecture médicale (reviewedBy/At).
 * - CHANGES  : IN_REVIEW → CHANGES_REQUESTED (note obligatoire, renvoyée à l'auteur).
 * - REJECT   : → REJECTED (note obligatoire, terminal).
 * Verrou : le relecteur ne peut pas être l'auteur.
 */
export async function decideReview(postId: string, decision: "APPROVE" | "CHANGES" | "REJECT", note: string): Promise<ReviewState> {
  const editor = await requireEditor();
  const trimmedNote = note.trim();
  if ((decision === "CHANGES" || decision === "REJECT") && !trimmedNote) {
    return { errors: { note: "Un motif est requis pour cette décision." } };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      editorialStatus: true, title: true, authorId: true,
      author: { select: { id: true, name: true, email: true } },
    },
  });
  if (!post) return { errors: { form: "Article introuvable." } };
  if (post.authorId === editor.id) return { errors: { form: "Vous ne pouvez pas relire votre propre article." } };
  if (post.editorialStatus !== EDITORIAL_STATUS.IN_REVIEW) {
    return { errors: { form: "Cet article n'est pas en cours de relecture." } };
  }

  const to =
    decision === "APPROVE"
      ? EDITORIAL_STATUS.APPROVED
      : decision === "CHANGES"
        ? EDITORIAL_STATUS.CHANGES_REQUESTED
        : EDITORIAL_STATUS.REJECTED;

  await prisma.$transaction(async (tx) => {
    await tx.reviewAssignment.updateMany({
      where: { postId, editorId: editor.id, status: "OPEN" },
      data: { status: "DONE", decision, decidedAt: new Date() },
    });
    await transition(tx, {
      postId,
      from: post.editorialStatus,
      to,
      actorId: editor.id,
      action: decision === "APPROVE" ? "APPROVED" : decision === "CHANGES" ? "CHANGES_REQUESTED" : "REJECTED",
      note: trimmedNote || null,
      // La validation médicale humaine (E-E-A-T / lastReviewed) est posée à l'approbation.
      extraData: (decision === "APPROVE" ? { reviewedById: editor.id, reviewedAt: new Date() } : {}) as Prisma.PostUpdateInput,
    });
  });

  await notifyArticleDecision({
    authorId: post.author.id,
    authorEmail: post.author.email,
    authorName: post.author.name,
    articleTitle: post.title,
    decision,
    note: trimmedNote || null,
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${postId}/reviser`);
  revalidatePath("/espace-auteur/articles");
  return { ok: true };
}

/**
 * Publie (ou planifie) un article approuvé. APPROVED → PUBLISHED.
 * Rend l'article indexable (status=PUBLISHED) et incrémente le compteur auteur.
 */
export async function publishApproved(postId: string, scheduledFor?: string): Promise<ReviewState> {
  const editor = await requireEditor();
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { editorialStatus: true },
  });
  if (!post) return { errors: { form: "Article introuvable." } };
  if (post.editorialStatus !== EDITORIAL_STATUS.APPROVED) {
    return { errors: { form: "Seul un article approuvé peut être publié." } };
  }

  const when = scheduledFor ? new Date(scheduledFor) : null;
  const isFuture = when && when.getTime() > Date.now();

  if (isFuture) {
    // Planification : reste APPROVED, `scheduledFor` posé (le cron publiera).
    await prisma.$transaction(async (tx) => {
      await tx.post.update({ where: { id: postId }, data: { scheduledFor: when } });
      await tx.editorialEvent.create({
        data: { postId, actorId: editor.id, action: "SCHEDULED", fromStatus: "APPROVED", toStatus: "APPROVED", note: when.toISOString() },
      });
    });
  } else {
    // Publication immédiate (transition + compteur + badges + notif + revalidation).
    await publishArticleNow(postId, editor.id);
  }

  revalidatePath("/admin/articles");
  revalidatePath("/espace-auteur/articles");
  return { ok: true };
}
