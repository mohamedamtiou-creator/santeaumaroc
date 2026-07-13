/**
 * Ouvre l'indexation des symptômes APRÈS relecture humaine (YMYL).
 * Pose `reviewedAt` sur les hubs symptômes publiés non encore relus.
 *
 * ⚠️ À NE LANCER QU'APRÈS relecture. Tant que `reviewedAt` est nul, la page
 * reste `noindex` et hors sitemap.
 *
 *   Tout ouvrir :      npx tsx --env-file=.env scripts/symptoms-approve.ts
 *   Un symptôme :      npx tsx --env-file=.env scripts/symptoms-approve.ts mal-de-tete
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const slug = process.argv[2];
  const where = slug ? { slug, reviewedAt: null } : { kind: "SYMPTOM", status: "PUBLISHED", reviewedAt: null };
  const res = await prisma.healthTopic.updateMany({ where, data: { reviewedAt: new Date() } });
  console.log(`✓ ${res.count} symptôme(s) marqué(s) relu(s) → indexables${slug ? ` (${slug})` : ""}.`);
}

main().finally(() => prisma.$disconnect());
