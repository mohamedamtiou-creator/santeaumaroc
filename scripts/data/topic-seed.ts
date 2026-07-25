/**
 * Type partagé des fiches HealthTopic rédigées par lots (intent-pages pipeline).
 * Chaque fiche est BILINGUE (FR + AR) et semée `reviewedAt=null` +
 * `arReviewedAt=null` → tout reste noindex jusqu'à relecture humaine (YMYL).
 *
 * Contenu = AIGUILLAGE prudent : jamais de diagnostic ni de posologie, toujours
 * renvoi vers un professionnel. `sources` optionnel (ajouté/vérifié en relecture).
 * `intentAnswer`/`intentAnswerAr` = réponse « quel médecin pour X ? » pré-rédigée
 * (servie une fois `intentSlug` attaché après relecture, cf. seed-intent-pages).
 */
export type Faq = { q: string; a: string };

export type TopicSeed = {
  slug: string;
  term: string;
  kind: "SYMPTOM" | "DISEASE";
  specialty: string; // slug de spécialité (doit exister)
  synonyms?: string[];
  related?: string[];   // slugs d'articles blog liés (maillage)
  glossary?: string[];  // slugs de termes de glossaire liés

  // ── FR ──
  shortAnswer: string;
  causes: string[];
  redFlags: string[];
  whenToConsult: string;
  faq: Faq[];
  intentAnswer: string;
  sources?: { label: string; url: string; publisher?: string; year?: number }[];

  // ── AR (relu séparément, servi si arReviewedAt) ──
  termAr: string;
  shortAnswerAr: string;
  causesAr: string[];
  redFlagsAr: string[];
  whenToConsultAr: string;
  faqAr: Faq[];
  intentAnswerAr: string;
};
