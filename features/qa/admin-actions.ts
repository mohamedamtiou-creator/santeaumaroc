"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import { logQa } from "@/lib/qa";
import { clearQuestionSummary } from "@/lib/qa-summary";
import { rejectQuestion, editQuestion } from "@/features/qa/actions";

async function requireAdmin() {
  const session = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, isActive: true },
  });
  if (!user || user.role !== "ADMIN" || !user.isActive) throw new Error("Accès refusé");
  return session;
}

/** Données de la file de modération Q/R. La file « À modérer » est paginée. */
export async function getModerationData({ page = 1, perPage = 25 }: { page?: number; perPage?: number } = {}) {
  await requireAdmin();
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const [pending, pendingTotal, openReports, recent, counts] = await Promise.all([
    prisma.question.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      skip: (safePage - 1) * perPage,
      take: perPage,
      select: {
        id: true, slug: true, title: true, body: true, urgencyLevel: true, createdAt: true,
        moderationNote: true, tags: true,
        askedBy: { select: { name: true, email: true } },
        specialty: { select: { name: true } },
      },
    }),
    prisma.question.count({ where: { status: "PENDING" } }),
    prisma.report.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, targetType: true, targetId: true, reason: true, detail: true, createdAt: true },
    }),
    prisma.question.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { id: true, slug: true, title: true, answersCount: true, publishedAt: true },
    }),
    prisma.question.groupBy({ by: ["status"], _count: true }),
  ]);

  // Suggestions IA (action AI_CHECK) rattachées aux questions en attente.
  const aiByQuestion: Record<string, Record<string, unknown>> = {};
  if (pending.length) {
    const logs = await prisma.qaModerationLog.findMany({
      where: { entityType: "QUESTION", action: "AI_CHECK", entityId: { in: pending.map((p) => p.id) } },
      orderBy: { createdAt: "desc" },
      select: { entityId: true, meta: true },
    });
    for (const l of logs) {
      if (!aiByQuestion[l.entityId] && l.meta && typeof l.meta === "object") {
        aiByQuestion[l.entityId] = l.meta as Record<string, unknown>;
      }
    }
  }

  return { pending, pendingTotal, page: safePage, perPage, openReports, recent, counts, aiByQuestion };
}

/** Fusionne une question (source) dans une cible : MERGED + redirection 301. */
export async function mergeQuestionForm(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const sourceId = ((formData.get("sourceId") ?? "") as string).trim();
  const targetSlug = ((formData.get("targetSlug") ?? "") as string).trim();
  if (!sourceId || !targetSlug) return;

  const target = await prisma.question.findUnique({ where: { slug: targetSlug }, select: { id: true } });
  const source = await prisma.question.findUnique({ where: { id: sourceId }, select: { id: true, slug: true } });
  if (!target || !source || target.id === source.id) return;

  await prisma.question.update({
    where: { id: sourceId },
    data: { status: "MERGED", mergedIntoId: target.id },
  });
  await logQa("QUESTION", sourceId, "MERGED", session.userId, `→ ${targetSlug}`);

  revalidatePath(`/questions/${source.slug}`);
  revalidatePath(`/questions/${targetSlug}`);
  revalidatePath("/admin/questions");
}

/** Rejet via formulaire (id + motif). */
export async function rejectQuestionForm(formData: FormData): Promise<void> {
  const id = ((formData.get("id") ?? "") as string).trim();
  const note = ((formData.get("note") ?? "") as string).trim();
  if (!id) return;
  await rejectQuestion(id, note); // requireAdmin appliqué dans rejectQuestion
}

/** Édition d'une question via formulaire admin, puis retour à la file. */
export async function editQuestionForm(formData: FormData): Promise<void> {
  await editQuestion(undefined, formData); // requireAdmin appliqué dans editQuestion
  redirect("/admin/questions");
}

/** Traitement d'un signalement (id + statut). */
export async function resolveReportForm(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = ((formData.get("id") ?? "") as string).trim();
  const status = ((formData.get("status") ?? "") as string).trim().toUpperCase();
  if (!id || !["REVIEWED", "DISMISSED", "ACTIONED"].includes(status)) return;

  await prisma.report.update({
    where: { id },
    data: { status, reviewedById: session.userId, reviewedAt: new Date() },
  });
  await logQa("REPORT", id, status, session.userId);
  revalidatePath("/admin/questions");
}

/** Retire (modère) une réponse signalée. */
export async function removeAnswerForm(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = ((formData.get("id") ?? "") as string).trim();
  if (!id) return;
  const answer = await prisma.answer.findUnique({ where: { id }, select: { questionId: true, question: { select: { slug: true, aiSummarySourceAnswerId: true } } } });
  if (!answer) return;
  await prisma.answer.update({ where: { id }, data: { status: "REMOVED" } });
  await prisma.question.update({
    where: { id: answer.questionId },
    data: { answersCount: await prisma.answer.count({ where: { questionId: answer.questionId, status: "PUBLISHED", NOT: { id } } }) },
  });
  // Gouvernance « L'essentiel » : si on retire la réponse dont dérive le résumé,
  // celui-ci devient orphelin → on l'efface.
  if (answer.question.aiSummarySourceAnswerId === id) {
    await clearQuestionSummary(answer.questionId);
  }
  await logQa("ANSWER", id, "REMOVED", session.userId);
  revalidatePath(`/questions/${answer.question.slug}`);
  revalidatePath("/admin/questions");
}
