/**
 * Ouvre l'indexation des traitements APRÈS relecture humaine (YMYL).
 * Pose `reviewedAt` sur les fiches traitements publiées non encore relues.
 *
 * ⚠️ À NE LANCER QU'APRÈS relecture. Tant que `reviewedAt` est nul, la page
 * reste `noindex` et hors sitemap.
 *
 *   Tout ouvrir :     npx tsx --env-file=.env scripts/treatments-approve.ts
 *   Un traitement :    npx tsx --env-file=.env scripts/treatments-approve.ts eczema
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const slug = process.argv[2];
  const where = slug ? { slug, reviewedAt: null } : { status: "PUBLISHED", reviewedAt: null };
  const res = await prisma.treatment.updateMany({ where, data: { reviewedAt: new Date() } });
  console.log(`✓ ${res.count} traitement(s) marqué(s) relu(s) → indexables${slug ? ` (${slug})` : ""}.`);
}

main().finally(() => prisma.$disconnect());
