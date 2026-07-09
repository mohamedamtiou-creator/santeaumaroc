"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import type { FormState } from "@/lib/definitions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeRichText, htmlToPlainText } from "@/lib/sanitize-html";
import { recomputeAnswerScore, logQa, snapshotRevision } from "@/lib/qa";
import { sendAnswerPublishedEmail } from "@/lib/email";
import { regenerateQuestionSummary, clearQuestionSummary } from "@/lib/qa-summary";

/** Résout le médecin VÉRIFIÉ associé à la session, ou null. */
async function getVerifiedDoctor(userId: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true, isVerified: true, isActive: true, isBlacklisted: true, nom: true, prenom: true, civilite: true },
  });
  if (!doctor || !doctor.isVerified || !doctor.isActive || doctor.isBlacklisted) return null;
  return doctor;
}

function doctorName(d: { civilite: string | null; prenom: string | null; nom: string | null }): string {
  return [d.civilite, d.prenom, d.nom].filter(Boolean).join(" ") || "Un médecin";
}

// ── Médecin vérifié : publier une réponse ─────────────────────────────────────
export async function postAnswer(state: FormState, formData: FormData): Promise<FormState> {
  const t = getDictionary(await getLocale()).qa;

  const session = await tryGetSession();
  if (!session?.userId) return { message: t.loginToAsk, code: "UNAUTH" };
  if (session.role !== "DOCTOR") return { message: t.patientCannotAnswer, code: "FORBIDDEN" };

  const doctor = await getVerifiedDoctor(session.userId);
  if (!doctor) return { message: t.patientCannotAnswer, code: "NOT_VERIFIED" };

  const limit = rateLimit(`qa:answer:${doctor.id}`, 20, 60 * 60 * 1000);
  if (!limit.success) return { message: t.rateLimited };

  const questionId = ((formData.get("questionId") ?? "") as string).trim();
  const bodyRaw = ((formData.get("body") ?? "") as string);
  const body = sanitizeRichText(bodyRaw);
  const plain = htmlToPlainText(body);

  if (!questionId) return { message: t.genericError };
  if (plain.length < 30) return { errors: { body: [t.answerGuidelines] } };

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      askedBy: { select: { email: true, emailVerified: true } },
      follows: { select: { user: { select: { email: true, emailVerified: true } } } },
    },
  });
  if (!question || question.status !== "PUBLISHED") return { message: t.genericError };

  const answer = await prisma.answer.create({
    data: { questionId, doctorId: doctor.id, body, status: "PUBLISHED" },
    select: { id: true },
  });

  // Compteur dénormalisé + date de dernière réponse.
  await prisma.question.update({
    where: { id: questionId },
    data: { answersCount: { increment: 1 }, lastAnswerAt: new Date() },
  });
  await recomputeAnswerScore(answer.id);
  await logQa("ANSWER", answer.id, "PUBLISHED", session.userId);

  // Notifications e-mail (demandeur + suiveurs), best-effort.
  const recipients = new Set<string>();
  if (question.askedBy?.email && question.askedBy.emailVerified) recipients.add(question.askedBy.email);
  for (const f of question.follows) {
    if (f.user?.email && f.user.emailVerified) recipients.add(f.user.email);
  }
  const name = doctorName(doctor);
  for (const email of recipients) {
    try {
      await sendAnswerPublishedEmail(email, question.title, name, question.slug);
    } catch (err) {
      console.error("[qa] sendAnswerPublishedEmail", err);
    }
  }

  revalidatePath(`/questions/${question.slug}`);
  return { message: "ok" };
}

// ── Médecin : éditer sa propre réponse ────────────────────────────────────────
export async function editAnswer(state: FormState, formData: FormData): Promise<FormState> {
  const t = getDictionary(await getLocale()).qa;

  const session = await tryGetSession();
  if (!session?.userId || session.role !== "DOCTOR") return { message: t.patientCannotAnswer, code: "FORBIDDEN" };
  const doctor = await getVerifiedDoctor(session.userId);
  if (!doctor) return { message: t.patientCannotAnswer, code: "NOT_VERIFIED" };

  const answerId = ((formData.get("answerId") ?? "") as string).trim();
  const body = sanitizeRichText((formData.get("body") ?? "") as string);
  if (htmlToPlainText(body).length < 30) return { errors: { body: [t.answerGuidelines] } };

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: {
      id: true, doctorId: true, body: true, isAccepted: true,
      question: { select: { id: true, slug: true, title: true, aiSummarySourceAnswerId: true } },
    },
  });
  if (!answer || answer.doctorId !== doctor.id) return { message: t.genericError, code: "FORBIDDEN" };

  await snapshotRevision("ANSWER", answerId, session.userId, null, answer.body);
  await prisma.answer.update({ where: { id: answerId }, data: { body, editedAt: new Date() } });
  await logQa("ANSWER", answerId, "EDITED", session.userId);

  // Gouvernance « L'essentiel » : si on vient d'éditer la réponse dont dérive le
  // résumé, il doit être régénéré (IA on) ou effacé (IA off) — jamais laissé
  // divergent du texte affiché.
  if (answer.isAccepted || answer.question.aiSummarySourceAnswerId === answerId) {
    await regenerateQuestionSummary({
      questionId: answer.question.id,
      questionTitle: answer.question.title,
      answerId,
      answerHtml: body,
      keepIfNoAi: false,
    });
  }

  revalidatePath(`/questions/${answer.question.slug}`);
  return { message: "ok" };
}

// ── Auteur de la question (ou admin) : retenir une réponse ────────────────────
export async function acceptAnswer(answerId: string): Promise<{ ok: boolean }> {
  const session = await tryGetSession();
  if (!session?.userId) return { ok: false };

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: {
      id: true,
      isAccepted: true,
      body: true,
      question: { select: { id: true, slug: true, askedById: true, title: true } },
    },
  });
  if (!answer) return { ok: false };

  const isOwner = answer.question.askedById === session.userId;
  const isAdmin = session.role === "ADMIN";
  if (!isOwner && !isAdmin) return { ok: false };

  const willAccept = !answer.isAccepted;

  // Une seule réponse retenue par question.
  await prisma.answer.updateMany({
    where: { questionId: answer.question.id, isAccepted: true },
    data: { isAccepted: false },
  });
  if (willAccept) {
    await prisma.answer.update({ where: { id: answerId }, data: { isAccepted: true } });
  }

  // Recalcule le score de toutes les réponses de la question (l'accepted bonus change).
  const all = await prisma.answer.findMany({
    where: { questionId: answer.question.id },
    select: { id: true },
  });
  for (const a of all) await recomputeAnswerScore(a.id);

  // Gouvernance « L'essentiel » : le résumé est dérivé de la réponse ACCEPTÉE.
  //  - à l'acceptation → (re)génère + trace la source (garde le résumé seed si IA off) ;
  //  - à la dé-acceptation → efface (plus de réponse retenue = plus d'essentiel).
  if (willAccept) {
    await regenerateQuestionSummary({
      questionId: answer.question.id,
      questionTitle: answer.question.title,
      answerId,
      answerHtml: answer.body,
      keepIfNoAi: true,
    });
  } else {
    await clearQuestionSummary(answer.question.id);
  }

  await logQa("ANSWER", answerId, willAccept ? "ACCEPTED" : "UNACCEPTED", session.userId);
  revalidatePath(`/questions/${answer.question.slug}`);
  return { ok: true };
}
