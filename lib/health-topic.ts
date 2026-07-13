/**
 * Localisation FR/AR + parsing des hubs santé (symptômes). Mêmes garde-fous
 * YMYL que le glossaire/blog : FR indexé si `reviewedAt`, AR si `arReviewedAt`.
 */
import type { Locale } from "@/lib/i18n";

export type HealthTopicArSource = {
  term: string;
  shortAnswer: string;
  causes: string;
  redFlags: string;
  whenToConsult: string | null;
  faqJson: string | null;
  sources: string | null;
  termAr: string | null;
  shortAnswerAr: string | null;
  causesAr: string | null;
  redFlagsAr: string | null;
  whenToConsultAr: string | null;
  faqJsonAr: string | null;
  sourcesAr: string | null;
  arReviewedAt: Date | null;
};

export function isTopicArReady(t: { arReviewedAt: Date | null; shortAnswerAr: string | null }): boolean {
  return !!t.arReviewedAt && !!t.shortAnswerAr;
}

export function isTopicReviewed(t: { reviewedAt: Date | null }): boolean {
  return !!t.reviewedAt;
}

export function topicLocalized<T extends HealthTopicArSource>(t: T, locale: Locale) {
  const ar = locale === "ar" && isTopicArReady(t);
  const pick = (a: string | null, fr: string) => (ar && a ? a : fr);
  const pickN = (a: string | null, fr: string | null) => (ar && a ? a : fr);
  return {
    isArabic: ar,
    term: pick(t.termAr, t.term),
    shortAnswer: pick(t.shortAnswerAr, t.shortAnswer),
    causes: pick(t.causesAr, t.causes),
    redFlags: pick(t.redFlagsAr, t.redFlags),
    whenToConsult: pickN(t.whenToConsultAr, t.whenToConsult),
    faqJson: pickN(t.faqJsonAr, t.faqJson),
    sources: pickN(t.sourcesAr, t.sources),
  };
}

/** Découpe une liste « 1 item par ligne » (puces tolérées). */
export function parseLines(s: string | null | undefined): string[] {
  if (!s) return [];
  return s.split(/\r?\n/).map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
}

export type FaqItem = { q: string; a: string };
export function parseFaq(s: string | null | undefined): FaqItem[] {
  if (!s) return [];
  try {
    const arr = JSON.parse(s);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x.q === "string" && typeof x.a === "string").map((x) => ({ q: x.q.trim(), a: x.a.trim() }));
  } catch {
    return [];
  }
}
