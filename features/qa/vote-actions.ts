"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";
import { recomputeAnswerScore } from "@/lib/qa";

type VoteResult = { ok: boolean; active: boolean; count: number; error?: "UNAUTH" | "RATE" };

/** Vote « utile » sur une réponse (toggle). Optimistic UI côté client. */
export async function toggleUpvote(answerId: string): Promise<VoteResult> {
  const session = await tryGetSession();
  if (!session?.userId) return { ok: false, active: false, count: 0, error: "UNAUTH" };

  const limit = rateLimit(`qa:vote:${session.userId}`, 60, 60 * 1000);
  if (!limit.success) return { ok: false, active: false, count: 0, error: "RATE" };

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: { id: true, question: { select: { slug: true } } },
  });
  if (!answer) return { ok: false, active: false, count: 0 };

  const existing = await prisma.answerVote.findUnique({
    where: { answerId_userId: { answerId, userId: session.userId } },
    select: { id: true },
  });

  let active: boolean;
  if (existing) {
    await prisma.answerVote.delete({ where: { id: existing.id } });
    active = false;
  } else {
    await prisma.answerVote.create({ data: { answerId, userId: session.userId } });
    active = true;
  }

  const count = await prisma.answerVote.count({ where: { answerId } });
  await prisma.answer.update({ where: { id: answerId }, data: { upvotes: count } });
  await recomputeAnswerScore(answerId);

  revalidatePath(`/questions/${answer.question.slug}`);
  return { ok: true, active, count };
}

/** Remercier le médecin pour sa réponse (toggle). */
export async function toggleThank(answerId: string): Promise<VoteResult> {
  const session = await tryGetSession();
  if (!session?.userId) return { ok: false, active: false, count: 0, error: "UNAUTH" };

  const limit = rateLimit(`qa:thank:${session.userId}`, 60, 60 * 1000);
  if (!limit.success) return { ok: false, active: false, count: 0, error: "RATE" };

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: { id: true, question: { select: { slug: true } } },
  });
  if (!answer) return { ok: false, active: false, count: 0 };

  const existing = await prisma.thank.findUnique({
    where: { answerId_userId: { answerId, userId: session.userId } },
    select: { id: true },
  });

  let active: boolean;
  if (existing) {
    await prisma.thank.delete({ where: { id: existing.id } });
    active = false;
  } else {
    await prisma.thank.create({ data: { answerId, userId: session.userId } });
    active = true;
  }

  const count = await prisma.thank.count({ where: { answerId } });
  await prisma.answer.update({ where: { id: answerId }, data: { thanksCount: count } });
  await recomputeAnswerScore(answerId);

  revalidatePath(`/questions/${answer.question.slug}`);
  return { ok: true, active, count };
}
