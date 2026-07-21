/**
 * Localisation FR/AR + parsing des fiches examens médicaux. Mêmes garde-fous
 * YMYL que le glossaire/symptômes : FR indexé si `reviewedAt`, AR si
 * `arReviewedAt`. Repli FR sinon. cf lib/health-topic (helpers de parsing partagés).
 */
import type { Locale } from "@/lib/i18n";

export { parseLines, parseFaq, type FaqItem } from "@/lib/health-topic";

export type MedicalExamArSource = {
  name: string;
  shortAnswer: string;
  indications: string;
  procedure: string;
  preparation: string | null;
  precautions: string | null;
  reimbursement: string | null;
  faqJson: string | null;
  sources: string | null;
  nameAr: string | null;
  shortAnswerAr: string | null;
  indicationsAr: string | null;
  procedureAr: string | null;
  preparationAr: string | null;
  precautionsAr: string | null;
  reimbursementAr: string | null;
  faqJsonAr: string | null;
  sourcesAr: string | null;
  arReviewedAt: Date | null;
};

export function isExamArReady(e: { arReviewedAt: Date | null; shortAnswerAr: string | null }): boolean {
  return !!e.arReviewedAt && !!e.shortAnswerAr;
}

export function isExamReviewed(e: { reviewedAt: Date | null }): boolean {
  return !!e.reviewedAt;
}

export function examLocalized<T extends MedicalExamArSource>(e: T, locale: Locale) {
  const ar = locale === "ar" && isExamArReady(e);
  const pick = (a: string | null, fr: string) => (ar && a ? a : fr);
  const pickN = (a: string | null, fr: string | null) => (ar && a ? a : fr);
  return {
    isArabic: ar,
    name: pick(e.nameAr, e.name),
    shortAnswer: pick(e.shortAnswerAr, e.shortAnswer),
    indications: pick(e.indicationsAr, e.indications),
    procedure: pick(e.procedureAr, e.procedure),
    preparation: pickN(e.preparationAr, e.preparation),
    precautions: pickN(e.precautionsAr, e.precautions),
    reimbursement: pickN(e.reimbursementAr, e.reimbursement),
    faqJson: pickN(e.faqJsonAr, e.faqJson),
    sources: pickN(e.sourcesAr, e.sources),
  };
}
