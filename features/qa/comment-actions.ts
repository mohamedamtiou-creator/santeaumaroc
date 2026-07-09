"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { logQa } from "@/lib/qa";

/**
 * Commentaire patient sur une réponse (commentaire / demande de précision).
 * Texte brut uniquement — pas de HTML (échappé au rendu).
 */
export async function postComment(state: FormState, formData: FormData): Promise<FormState> {
  const t = getDictionary(await getLocale()).qa;

  const session = await tryGetSession();
  if (!session?.userId) return { message: t.loginToAsk, code: "UNAUTH" };

  const limit = rateLimit(`qa:comment:${session.userId}`, 15, 60 * 60 * 1000);
  if (!limit.success) return { message: t.rateLimited };

  const answerId = ((formData.get("answerId") ?? "") as string).trim();
  const body = ((formData.get("body") ?? "") as string).trim().slice(0, 1000);

  if (!answerId || body.length < 3) return { errors: { body: [t.genericError] } };

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: { id: true, status: true, question: { select: { slug: true } } },
  });
  if (!answer || answer.status !== "PUBLISHED") return { message: t.genericError };

  const comment = await prisma.answerComment.create({
    data: { answerId, userId: session.userId, body, status: "PUBLISHED" },
    select: { id: true },
  });
  await logQa("COMMENT", comment.id, "SUBMITTED", session.userId);

  revalidatePath(`/questions/${answer.question.slug}`);
  return { message: "ok" };
}
