/**
 * Ouvre l'indexation des termes de glossaire APRÈS relecture humaine (YMYL).
 * Pose `reviewedAt` = maintenant sur les termes publiés non encore relus.
 *
 * ⚠️ À NE LANCER QU'APRÈS avoir réellement relu le contenu. Tant que
 * `reviewedAt` est nul, chaque page reste `noindex` et hors sitemap.
 *
 *   Tout ouvrir :        npx tsx --env-file=.env scripts/glossary-approve.ts
 *   Un terme précis :    npx tsx --env-file=.env scripts/glossary-approve.ts diabete-type-2
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const slug = process.argv[2];
  const now = new Date();
  const where = slug
    ? { slug, reviewedAt: null }
    : { status: "PUBLISHED", reviewedAt: null };
  const res = await prisma.glossaryTerm.updateMany({ where, data: { reviewedAt: now } });
  console.log(`✓ ${res.count} terme(s) marqué(s) relu(s) → désormais indexables${slug ? ` (${slug})` : ""}.`);
}

main().finally(() => prisma.$disconnect());
