"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { rateLimit } from "@/lib/rate-limit";

type FollowResult = { ok: boolean; following: boolean; error?: "UNAUTH" | "RATE" };

/** Suivre / ne plus suivre une question (notifie à la publication d'une réponse). */
export async function toggleFollow(questionId: string): Promise<FollowResult> {
  const session = await tryGetSession();
  if (!session?.userId) return { ok: false, following: false, error: "UNAUTH" };

  const limit = rateLimit(`qa:follow:${session.userId}`, 60, 60 * 1000);
  if (!limit.success) return { ok: false, following: false, error: "RATE" };

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, slug: true },
  });
  if (!question) return { ok: false, following: false };

  const existing = await prisma.questionFollow.findUnique({
    where: { questionId_userId: { questionId, userId: session.userId } },
    select: { id: true },
  });

  let following: boolean;
  if (existing) {
    await prisma.questionFollow.delete({ where: { id: existing.id } });
    following = false;
  } else {
    await prisma.questionFollow.create({ data: { questionId, userId: session.userId } });
    following = true;
  }

  revalidatePath(`/questions/${question.slug}`);
  return { ok: true, following };
}
