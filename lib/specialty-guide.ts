/**
 * Localisation FR/AR + garde-fous YMYL des guides de spécialité
 * (« Quand consulter un [spécialité] ? », route /quand-consulter/[specialite]).
 * Mêmes verrous que HealthTopic/glossaire : FR indexé si `reviewedAt`,
 * AR si `arReviewedAt`. Repli FR quand la traduction n'est pas relue.
 */
import type { Locale } from "@/lib/i18n";

export type SpecialtyGuideArSource = {
  shortAnswer: string;
  reasons: string;
  redFlags: string;
  whenToConsult: string | null;
  faqJson: string | null;
  sources: string | null;
  shortAnswerAr: string | null;
  reasonsAr: string | null;
  redFlagsAr: string | null;
  whenToConsultAr: string | null;
  faqJsonAr: string | null;
  sourcesAr: string | null;
  arReviewedAt: Date | null;
};

export function isGuideArReady(g: { arReviewedAt: Date | null; shortAnswerAr: string | null }): boolean {
  return !!g.arReviewedAt && !!g.shortAnswerAr;
}

export function isGuideReviewed(g: { reviewedAt: Date | null }): boolean {
  return !!g.reviewedAt;
}

export function guideLocalized<T extends SpecialtyGuideArSource>(g: T, locale: Locale) {
  const ar = locale === "ar" && isGuideArReady(g);
  const pick = (a: string | null, fr: string) => (ar && a ? a : fr);
  const pickN = (a: string | null, fr: string | null) => (ar && a ? a : fr);
  return {
    isArabic: ar,
    shortAnswer: pick(g.shortAnswerAr, g.shortAnswer),
    reasons: pick(g.reasonsAr, g.reasons),
    redFlags: pick(g.redFlagsAr, g.redFlags),
    whenToConsult: pickN(g.whenToConsultAr, g.whenToConsult),
    faqJson: pickN(g.faqJsonAr, g.faqJson),
    sources: pickN(g.sourcesAr, g.sources),
  };
}
