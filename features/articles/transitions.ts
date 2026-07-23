import "server-only";

import { prisma } from "@/lib/prisma";
import { canTransition } from "@/lib/contributor";
import type { Prisma } from "@prisma/client";

/**
 * Machine à états du workflow éditorial (Post.editorialStatus).
 *
 * Toute transition passe par `transition()`, qui refuse les changements non
 * autorisés (cf lib/contributor.EDITORIAL_TRANSITIONS) et écrit un EditorialEvent
 * immuable. Les helpers acceptent un client transactionnel pour composer avec
 * d'autres écritures (ex. poser reviewedAt en même temps que PUBLISHED).
 */

type DB = Prisma.TransactionClient | typeof prisma;

export async function recordEvent(
  db: DB,
  input: {
    postId: string;
    actorId: string | null;
    action: string;
    fromStatus?: string | null;
    toStatus?: string | null;
    note?: string | null;
  },
): Promise<void> {
  await db.editorialEvent.create({
    data: {
      postId: input.postId,
      actorId: input.actorId,
      action: input.action,
      fromStatus: input.fromStatus ?? null,
      toStatus: input.toStatus ?? null,
      note: input.note ?? null,
    },
  });
}

/**
 * Applique une transition d'état validée + journalise l'événement.
 * Lève si la transition n'est pas autorisée depuis `from`.
 */
export async function transition(
  db: DB,
  input: {
    postId: string;
    from: string;
    to: string;
    actorId: string | null;
    action: string;
    note?: string | null;
    /** Champs supplémentaires à écrire sur le Post dans le même mouvement. */
    extraData?: Prisma.PostUpdateInput;
  },
): Promise<void> {
  if (!canTransition(input.from, input.to)) {
    throw new Error(`Transition éditoriale interdite : ${input.from} → ${input.to}.`);
  }
  await db.post.update({
    where: { id: input.postId },
    data: { editorialStatus: input.to, ...(input.extraData ?? {}) },
  });
  await recordEvent(db, {
    postId: input.postId,
    actorId: input.actorId,
    action: input.action,
    fromStatus: input.from,
    toStatus: input.to,
    note: input.note,
  });
}

/**
 * Fige l'état courant de l'article dans une ArticleRevision (versioning + diff).
 * Le numéro de version est incrémental par article.
 */
export async function snapshotRevision(
  db: DB,
  input: { postId: string; authorId: string; note?: string | null },
): Promise<void> {
  const post = await db.post.findUnique({
    where: { id: input.postId },
    select: {
      title: true, excerpt: true, content: true, coverImage: true, coverAlt: true,
      metaTitle: true, metaDesc: true, keyTakeaways: true, faqJson: true, sources: true,
      aboutEntity: true, bibliography: true, conflictOfInterest: true, evidenceLevel: true,
      titleAr: true, excerptAr: true, contentAr: true, metaTitleAr: true, metaDescAr: true,
      keyTakeawaysAr: true, faqJsonAr: true, sourcesAr: true,
    },
  });
  if (!post) return;

  const last = await db.articleRevision.findFirst({
    where: { postId: input.postId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  await db.articleRevision.create({
    data: {
      postId: input.postId,
      version: (last?.version ?? 0) + 1,
      snapshot: post as unknown as Prisma.InputJsonValue,
      authorId: input.authorId,
      note: input.note ?? null,
    },
  });
}
