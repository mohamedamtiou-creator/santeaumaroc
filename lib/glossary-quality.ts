/**
 * Garde-fou anti-pages minces du glossaire.
 *
 * POURQUOI — le glossaire est le catalogue destiné à passer de 81 à ~600 termes.
 * Une définition de trente mots sans source ni lien sortant est le profil exact
 * de la « page mince » que Google sanctionne À L'ÉCHELLE : quelques-unes ne
 * gênent pas, six cents dégradent la perception du domaine entier. Le site
 * applique déjà ce principe ailleurs (combo spécialité × ville sous 3 praticiens,
 * lettre d'index sous un minimum d'entrées) : ce module l'étend au glossaire.
 *
 * MESURES DU 2 AOÛT 2026 sur les 81 termes relus, qui expliquent les réglages.
 *   Avant le lot de sourçage (10 termes sourcés) :
 *     · plancher à 28 mots → 0 page déindexée ;
 *     · exiger un signal   → 33 pages ;
 *     · exiger une source  → 71 pages — inacceptable, donc règle désactivée.
 *   Après le lot (79 termes sourcés, cf. scripts/seed-glossary-sources.ts) :
 *     · exiger un signal   → 1 page  (« Anesthésie », sans source ni pilier) ;
 *     · exiger une source  → 2 pages (« Anesthésie », « Corticoïde »).
 *
 * D'où les réglages actuels : le plancher de longueur ET l'exigence
 * d'enrichissement sont tous deux ACTIFS, puisque le coût est retombé à une
 * seule page — celle qui mérite effectivement de ne pas être indexée en l'état.
 * `scripts/check-glossary-quality.ts` recalcule ces coûts à la demande : à
 * rejouer avant tout nouveau durcissement.
 */

/** Longueur minimale d'une définition, en mots, pour mériter sa propre URL. */
export const GLOSSARY_MIN_WORDS = 28;

/**
 * Exige, en plus, au moins un signal d'enrichissement : source vérifiable,
 * article pilier ou synonyme. Activé une fois l'existant sourcé — coût mesuré :
 * une seule page. C'est ce réglage qui empêchera un lot de 500 définitions
 * nues d'être indexé tel quel.
 */
export const GLOSSARY_REQUIRE_ENRICHMENT = true;

export type GlossaryQualityInput = {
  definition: string;
  sources: string | null;
  relatedSlug: string | null;
  synonyms: string[];
};

/** Raison pour laquelle un terme n'est pas jugé indexable. */
export type GlossaryQualityIssue = "tooShort" | "noEnrichment";

export type GlossaryQuality = {
  /** Passe les critères de fond (indépendant des verrous de relecture). */
  substantial: boolean;
  words: number;
  sourceCount: number;
  hasEnrichment: boolean;
  issues: GlossaryQualityIssue[];
};

export function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/** Compte les sources en tolérant un JSON absent ou malformé. */
export function countSources(raw: string | null | undefined): number {
  if (!raw) return 0;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => x && typeof x.label === "string" && x.label.trim()).length : 0;
  } catch {
    return 0;
  }
}

export function glossaryQuality(term: GlossaryQualityInput): GlossaryQuality {
  const words = countWords(term.definition);
  const sourceCount = countSources(term.sources);
  const hasEnrichment = sourceCount > 0 || !!term.relatedSlug || term.synonyms.length > 0;

  const issues: GlossaryQualityIssue[] = [];
  if (words < GLOSSARY_MIN_WORDS) issues.push("tooShort");
  if (GLOSSARY_REQUIRE_ENRICHMENT && !hasEnrichment) issues.push("noEnrichment");

  return { substantial: issues.length === 0, words, sourceCount, hasEnrichment, issues };
}

/**
 * Indexabilité complète d'un terme : verrous de relecture (posés par
 * l'appelant, qui connaît la locale) ET critère de fond.
 *
 * `noindex, follow` et non `noindex, nofollow` : la page reste crawlée et
 * continue de transmettre ses liens internes — on refuse de l'indexer, pas de la
 * rattacher au site.
 */
export function isGlossaryIndexable(term: GlossaryQualityInput, reviewLocksPass: boolean): boolean {
  return reviewLocksPass && glossaryQuality(term).substantial;
}
