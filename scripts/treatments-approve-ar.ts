/**
 * Ouvre l'affichage/indexation ARABE des traitements APRÈS relecture humaine (YMYL).
 * Pose `arReviewedAt` sur les fiches dont la traduction arabe existe (`shortAnswerAr`)
 * et n'est pas encore relue.
 *
 * ⚠️ À NE LANCER QU'APRÈS relecture de la version arabe. Tant que `arReviewedAt`
 * est nul, la fiche /ar/traitements/[slug] reste en repli FR (arabe non servi/indexé).
 *
 *   Tout ouvrir :     npx tsx --env-file=.env scripts/treatments-approve-ar.ts
 *   Un traitement :    npx tsx --env-file=.env scripts/treatments-approve-ar.ts traitement-eczema
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const slug = process.argv[2];
  const where = slug
    ? { slug, arReviewedAt: null, shortAnswerAr: { not: null } }
    : { arReviewedAt: null, shortAnswerAr: { not: null } };
  const res = await prisma.treatment.updateMany({ where, data: { arReviewedAt: new Date() } });
  console.log(`✓ ${res.count} traitement(s) marqué(s) relu(s) AR → arabe servi/indexé${slug ? ` (${slug})` : ""}.`);
  console.log("ℹ Seules les fiches avec une traduction arabe (shortAnswerAr) sont concernées.");
}

main().finally(() => prisma.$disconnect());
