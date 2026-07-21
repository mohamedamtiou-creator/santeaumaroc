/**
 * Ouvre l'affichage/indexation ARABE des termes de glossaire APRÈS relecture (YMYL).
 * Pose `arReviewedAt` sur les termes dont la traduction arabe existe (`definitionAr`)
 * et n'est pas encore relue.
 *
 * ⚠️ Prérequis : les termes doivent AVOIR une traduction (`termAr`/`definitionAr`).
 * À ce jour la base n'en a aucune → ce script matchera 0 tant que le glossaire n'est
 * pas traduit en arabe. Condition d'affichage AR = isGlossaryArReady (arReviewedAt + definitionAr).
 *
 *   Tout ouvrir :   npx tsx --env-file=.env scripts/glossary-approve-ar.ts
 *   Un terme :       npx tsx --env-file=.env scripts/glossary-approve-ar.ts hypertension-arterielle
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const slug = process.argv[2];
  const where = slug
    ? { slug, arReviewedAt: null, definitionAr: { not: null } }
    : { arReviewedAt: null, definitionAr: { not: null } };
  const res = await prisma.glossaryTerm.updateMany({ where, data: { arReviewedAt: new Date() } });
  console.log(`✓ ${res.count} terme(s) marqué(s) relu(s) AR → arabe servi/indexé${slug ? ` (${slug})` : ""}.`);
  if (res.count === 0) console.log("ℹ 0 candidat : aucun terme n'a de traduction arabe (definitionAr) à ce jour.");
}

main().finally(() => prisma.$disconnect());
