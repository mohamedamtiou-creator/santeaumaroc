/**
 * Localisation FR/AR + parsing des fiches traitements. Mêmes garde-fous YMYL
 * que le glossaire/symptômes : FR indexé si `reviewedAt`, AR si `arReviewedAt`.
 * Repli FR sinon. cf lib/health-topic (helpers de parsing partagés).
 */
import type { Locale } from "@/lib/i18n";

export { parseLines, parseFaq, type FaqItem } from "@/lib/health-topic";

export type TreatmentArSource = {
  name: string;
  shortAnswer: string;
  options: string;
  duration: string | null;
  sideEffects: string | null;
  redFlags: string | null;
  whenToConsult: string | null;
  faqJson: string | null;
  sources: string | null;
  nameAr: string | null;
  shortAnswerAr: string | null;
  optionsAr: string | null;
  durationAr: string | null;
  sideEffectsAr: string | null;
  redFlagsAr: string | null;
  whenToConsultAr: string | null;
  faqJsonAr: string | null;
  sourcesAr: string | null;
  arReviewedAt: Date | null;
};

export function isTreatmentArReady(t: { arReviewedAt: Date | null; shortAnswerAr: string | null }): boolean {
  return !!t.arReviewedAt && !!t.shortAnswerAr;
}

export function isTreatmentReviewed(t: { reviewedAt: Date | null }): boolean {
  return !!t.reviewedAt;
}

export function treatmentLocalized<T extends TreatmentArSource>(t: T, locale: Locale) {
  const ar = locale === "ar" && isTreatmentArReady(t);
  const pick = (a: string | null, fr: string) => (ar && a ? a : fr);
  const pickN = (a: string | null, fr: string | null) => (ar && a ? a : fr);
  return {
    isArabic: ar,
    name: pick(t.nameAr, t.name),
    shortAnswer: pick(t.shortAnswerAr, t.shortAnswer),
    options: pick(t.optionsAr, t.options),
    duration: pickN(t.durationAr, t.duration),
    sideEffects: pickN(t.sideEffectsAr, t.sideEffects),
    redFlags: pickN(t.redFlagsAr, t.redFlags),
    whenToConsult: pickN(t.whenToConsultAr, t.whenToConsult),
    faqJson: pickN(t.faqJsonAr, t.faqJson),
    sources: pickN(t.sourcesAr, t.sources),
  };
}
