/**
 * Ouvre l'affichage/indexation ARABE des hubs santé (symptômes ET maladies,
 * table health_topics) APRÈS relecture (YMYL). Pose `arReviewedAt` là où la
 * traduction arabe existe (`shortAnswerAr`).
 *
 * Condition d'affichage AR = isTopicArReady (arReviewedAt + shortAnswerAr).
 *
 *   Tout ouvrir :   npx tsx --env-file=.env scripts/health-topics-approve-ar.ts
 *   Un hub :         npx tsx --env-file=.env scripts/health-topics-approve-ar.ts diabete
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const slug = process.argv[2];
  const where = slug
    ? { slug, arReviewedAt: null, shortAnswerAr: { not: null } }
    : { arReviewedAt: null, shortAnswerAr: { not: null } };
  const res = await prisma.healthTopic.updateMany({ where, data: { arReviewedAt: new Date() } });
  console.log(`✓ ${res.count} hub(s) santé marqué(s) relu(s) AR → arabe servi/indexé${slug ? ` (${slug})` : ""}.`);
  if (res.count === 0) console.log("ℹ 0 candidat : aucun hub avec traduction arabe (shortAnswerAr) non encore relue.");
}

main().finally(() => prisma.$disconnect());
