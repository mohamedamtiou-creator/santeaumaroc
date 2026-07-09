import type { Locale } from "@/lib/i18n";

/**
 * Localisation du CONTENU Q/R (≠ chrome, déjà traduit via dictionnaires).
 *
 * Le contenu arabe vit dans des colonnes sœurs `…Ar` sur Question/Answer
 * (cf prisma/schema). Règle YMYL : on ne sert/indexe l'arabe qu'une fois la
 * traduction **relue par un humain** (`arReviewedAt` posé). Sinon → repli FR
 * gracieux, et la page arabe reste `noindex` (cf pages `/questions/**`).
 */

type QLocalizable = {
  title: string;
  body?: string | null;
  aiSummary?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  titleAr?: string | null;
  bodyAr?: string | null;
  aiSummaryAr?: string | null;
  metaTitleAr?: string | null;
  metaDescAr?: string | null;
  arReviewedAt?: Date | null;
};

/** Une question a-t-elle une version arabe prête à être servie/indexée ? */
export function isQuestionArReady(q: { titleAr?: string | null; arReviewedAt?: Date | null }): boolean {
  return !!q.titleAr && !!q.arReviewedAt;
}

/** Champs de contenu question résolus pour la locale (repli FR si AR absent/non relu). */
export function qLocalized(q: QLocalizable, locale: Locale) {
  const ar = locale === "ar" && isQuestionArReady(q);
  return {
    title: ar ? q.titleAr! : q.title,
    body: ar ? q.bodyAr ?? q.body ?? null : q.body ?? null,
    aiSummary: ar ? q.aiSummaryAr ?? q.aiSummary ?? null : q.aiSummary ?? null,
    metaTitle: ar ? q.metaTitleAr ?? q.metaTitle ?? null : q.metaTitle ?? null,
    metaDesc: ar ? q.metaDescAr ?? q.metaDesc ?? null : q.metaDesc ?? null,
    /** true = contenu arabe effectivement servi (page indexable en AR). */
    ar,
  };
}

/**
 * Corps de réponse résolu. Ne bascule en AR que si la question est AR-ready ET
 * la réponse elle-même relue — sinon repli FR (évite d'injecter du FR non
 * signalé dans une page annoncée arabe).
 */
export function aLocalized(
  a: { body: string; bodyAr?: string | null; arReviewedAt?: Date | null },
  locale: Locale,
  questionArReady: boolean,
): string {
  const ar = locale === "ar" && questionArReady && !!a.bodyAr && !!a.arReviewedAt;
  return ar ? a.bodyAr! : a.body;
}

/** Titre localisé léger pour les cartes de liste (repli FR). */
export function localizedTitle(
  q: { title: string; titleAr?: string | null; arReviewedAt?: Date | null },
  locale: Locale,
): string {
  return locale === "ar" && isQuestionArReady(q) ? q.titleAr! : q.title;
}
