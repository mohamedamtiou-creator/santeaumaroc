import { prisma } from "@/lib/prisma";
import { summarizeBestAnswer, translateSummaryToArabic, isAiEnabled } from "@/lib/qa-ai";
import { htmlToPlainText } from "@/lib/sanitize-html";

/**
 * Gouvernance de « L'essentiel » (résumé IA de la page question).
 *
 * Invariant YMYL : le résumé est un DÉRIVÉ de la réponse acceptée. Il ne doit
 * jamais survivre à sa source (réponse retirée / dé-acceptée) ni diverger d'elle
 * (réponse éditée après génération). Ce module est l'unique endroit qui écrit
 * les champs `aiSummary*` de Question, appelé depuis les actions
 * accept/unaccept/edit/remove. Le rendu (page [slug]) applique en plus un
 * garde-fou : n'afficher que si la source pointe vers la réponse acceptée.
 */

const CLEARED = {
  aiSummary: null,
  aiSummaryAr: null,
  aiSummarySourceAnswerId: null,
  aiSummaryAt: null,
} as const;

/** Efface le résumé (repli sûr : aucune réponse valide à résumer). */
export async function clearQuestionSummary(questionId: string): Promise<void> {
  await prisma.question.update({ where: { id: questionId }, data: CLEARED });
}

/**
 * (Re)génère « L'essentiel » à partir de la réponse acceptée `answerId`, et
 * trace sa provenance (source + horodatage).
 *
 * Fail-safe :
 *  - IA indisponible + `keepIfNoAi` → on marque seulement la provenance sans
 *    toucher au texte (cas seed / clé IA absente : le résumé existant reste
 *    cohérent avec la réponse acceptée qu'on vient de fixer) ;
 *  - IA indisponible sans `keepIfNoAi`, ou génération échouée → on EFFACE
 *    plutôt que de laisser un résumé potentiellement divergent.
 */
export async function regenerateQuestionSummary(opts: {
  questionId: string;
  questionTitle: string;
  answerId: string;
  answerHtml: string;
  keepIfNoAi?: boolean;
}): Promise<void> {
  const now = new Date();

  if (!isAiEnabled()) {
    if (opts.keepIfNoAi) {
      await prisma.question.update({
        where: { id: opts.questionId },
        data: { aiSummarySourceAnswerId: opts.answerId, aiSummaryAt: now },
      });
    } else {
      await clearQuestionSummary(opts.questionId);
    }
    return;
  }

  const summary = await summarizeBestAnswer({
    questionTitle: opts.questionTitle,
    answerPlainText: htmlToPlainText(opts.answerHtml),
  });

  if (summary) {
    // Traduction AR produite en même temps (brouillon). NON relue : la page ne la
    // sert que si un humain a relu APRÈS génération (arReviewedAt >= aiSummaryAt).
    // Jamais de repli FR non signalé sur une page AR.
    const summaryAr = await translateSummaryToArabic(summary);
    await prisma.question.update({
      where: { id: opts.questionId },
      data: {
        aiSummary: summary,
        aiSummaryAr: summaryAr,
        aiSummarySourceAnswerId: opts.answerId,
        aiSummaryAt: now,
      },
    });
  } else {
    await clearQuestionSummary(opts.questionId);
  }
}
