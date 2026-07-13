/**
 * Localisation FR/AR des termes de glossaire (mêmes garde-fous YMYL que le blog).
 *
 * - FR indexé uniquement si `reviewedAt` posé (relecture humaine) — cf. la page
 *   qui applique `robots: noindex` sinon.
 * - AR servi/indexé uniquement si `arReviewedAt` ET traduction présente ; repli
 *   FR intégral sinon (une traduction partielle ne casse jamais l'affichage).
 */
import type { Locale } from "@/lib/i18n";

export const GLOSSARY_CATEGORIES = [
  "symptome",
  "maladie",
  "examen",
  "traitement",
  "anatomie",
  "general",
] as const;

export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

export type GlossaryArSource = {
  term: string;
  definition: string;
  sources: string | null;
  termAr: string | null;
  definitionAr: string | null;
  sourcesAr: string | null;
  arReviewedAt: Date | null;
};

/** L'arabe est-il prêt à être servi pour ce terme ? (relu + traduit) */
export function isGlossaryArReady(t: { arReviewedAt: Date | null; definitionAr: string | null }): boolean {
  return !!t.arReviewedAt && !!t.definitionAr;
}

/** La version FR est-elle relue (→ indexable) ? */
export function isGlossaryReviewed(t: { reviewedAt: Date | null }): boolean {
  return !!t.reviewedAt;
}

export function glossaryLocalized<T extends GlossaryArSource>(t: T, locale: Locale) {
  const ar = locale === "ar" && isGlossaryArReady(t);
  return {
    isArabic: ar,
    term: ar ? t.termAr! : t.term,
    definition: ar && t.definitionAr ? t.definitionAr : t.definition,
    sources: ar && t.sourcesAr ? t.sourcesAr : t.sources,
  };
}

/** Normalise une catégorie inconnue vers "general". */
export function normalizeCategory(c: string | null | undefined): GlossaryCategory {
  return (GLOSSARY_CATEGORIES as readonly string[]).includes(c ?? "")
    ? (c as GlossaryCategory)
    : "general";
}
