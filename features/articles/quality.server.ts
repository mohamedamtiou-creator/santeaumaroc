import "server-only";

import { countSources } from "@/lib/article-content";

/**
 * Contrôle qualité pré-soumission (MVP : déterministe, sans IA).
 *
 * Distingue les BLOCKERS (empêchent la soumission — garde-fous YMYL) des
 * WARNINGS (score dégradé mais non bloquant). La couche IA (plagiat, détection
 * IA, conformité médicale, lisibilité fine FR/AR) s'ajoutera en V1 en enrichissant
 * `report` sans changer ce contrat.
 */

export const MIN_SOURCES = 2;
export const MIN_WORDS = 300;

export type QualityReport = {
  wordCount: number;
  sources: number;
  hasMetaTitle: boolean;
  hasMetaDesc: boolean;
  hasH2: boolean;
  hasFaq: boolean;
  hasCoverAlt: boolean;
  conflictDeclared: boolean;
  blockers: string[];
  warnings: string[];
};

export type QualityResult = { score: number; report: QualityReport };

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

export function computeQuality(input: {
  content: string;
  excerpt: string;
  metaTitle: string | null;
  metaDesc: string | null;
  coverAlt: string | null;
  sources: string | null; // JSON déjà normalisé
  faqJson: string | null;
  conflictOfInterest: string | null;
}): QualityResult {
  const words = wordCount(input.content || "");
  const sources = countSources(input.sources);
  const hasMetaTitle = !!input.metaTitle?.trim();
  const hasMetaDesc = !!input.metaDesc?.trim();
  const hasH2 = /<h2[\s>]/i.test(input.content || "");
  const hasFaq = countSources(input.faqJson) > 0;
  const hasCoverAlt = !!input.coverAlt?.trim();
  const conflictDeclared = !!input.conflictOfInterest?.trim();

  const blockers: string[] = [];
  const warnings: string[] = [];

  // ── Garde-fous YMYL (bloquants) ──
  if (sources < MIN_SOURCES) blockers.push(`Au moins ${MIN_SOURCES} sources d'autorité sont requises (${sources} fournie${sources > 1 ? "s" : ""}).`);
  if (!conflictDeclared) blockers.push("La déclaration de conflit d'intérêt est obligatoire (indiquez « Aucun » le cas échéant).");
  if (words < MIN_WORDS) blockers.push(`L'article est trop court (${words} mots, minimum ${MIN_WORDS}).`);

  // ── Qualité (avertissements, score dégradé) ──
  if (!hasMetaTitle) warnings.push("Meta title manquant.");
  if (!hasMetaDesc) warnings.push("Meta description manquante.");
  if (!hasH2) warnings.push("Aucun sous-titre (H2) : structurez l'article pour la lisibilité et le SEO.");
  if (!hasFaq) warnings.push("Aucune FAQ : elle améliore la visibilité (AI Overviews, featured snippet).");
  if (!hasCoverAlt) warnings.push("Texte alternatif de l'image de couverture manquant (accessibilité + SEO).");
  if (!input.excerpt?.trim()) warnings.push("Résumé (excerpt) vide.");

  // Score : base 100, −20 par blocker, −8 par warning, plancher 0.
  const score = Math.max(0, 100 - blockers.length * 20 - warnings.length * 8);

  return {
    score,
    report: { wordCount: words, sources, hasMetaTitle, hasMetaDesc, hasH2, hasFaq, hasCoverAlt, conflictDeclared, blockers, warnings },
  };
}
