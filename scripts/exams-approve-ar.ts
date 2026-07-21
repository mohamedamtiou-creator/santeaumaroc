/**
 * Ouvre l'affichage/indexation ARABE des examens APRÈS relecture humaine (YMYL).
 * Pose `arReviewedAt` sur les fiches dont la traduction arabe existe (`shortAnswerAr`)
 * et n'est pas encore relue.
 *
 * ⚠️ À NE LANCER QU'APRÈS relecture de la version arabe. Tant que `arReviewedAt`
 * est nul, la fiche /ar/examens/[slug] reste en repli FR (arabe non servi/indexé).
 *
 *   Tout ouvrir :   npx tsx --env-file=.env scripts/exams-approve-ar.ts
 *   Un examen :      npx tsx --env-file=.env scripts/exams-approve-ar.ts irm
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const slug = process.argv[2];
  const where = slug
    ? { slug, arReviewedAt: null, shortAnswerAr: { not: null } }
    : { arReviewedAt: null, shortAnswerAr: { not: null } };
  const res = await prisma.medicalExam.updateMany({ where, data: { arReviewedAt: new Date() } });
  console.log(`✓ ${res.count} examen(s) marqué(s) relu(s) AR → arabe servi/indexé${slug ? ` (${slug})` : ""}.`);
  console.log("ℹ Seules les fiches avec une traduction arabe (shortAnswerAr) sont concernées.");
}

main().finally(() => prisma.$disconnect());
