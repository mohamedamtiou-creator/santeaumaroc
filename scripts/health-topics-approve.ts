/**
 * Ouvre l'indexation FRANÇAISE des hubs santé (symptômes ET maladies) APRÈS
 * relecture (YMYL). Pose `reviewedAt` là où il est nul. Pendant `reviewedAt=null`
 * la page reste `noindex` et hors sitemap. Pendant du script AR (health-topics-approve-ar).
 *
 *   Tout ouvrir :  npx tsx --env-file=.env scripts/health-topics-approve.ts
 *   Un hub :        npx tsx --env-file=.env scripts/health-topics-approve.ts diabete
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const slug = process.argv[2];
  const where = slug ? { slug, reviewedAt: null } : { status: "PUBLISHED", reviewedAt: null };
  const res = await prisma.healthTopic.updateMany({ where, data: { reviewedAt: new Date() } });
  console.log(`✓ ${res.count} hub(s) santé relu(s) FR → indexables${slug ? ` (${slug})` : ""}.`);
}

main().finally(() => prisma.$disconnect());
