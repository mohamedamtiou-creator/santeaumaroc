/**
 * Ouvre l'indexation FRANÇAISE des guides « quand consulter » APRÈS relecture
 * (YMYL). Pose `reviewedAt` là où il est nul. Pendant `reviewedAt=null` la page
 * reste `noindex` et hors sitemap. Pendant du script AR (specialty-guides-approve-ar).
 *
 *   Tout ouvrir :  npx tsx --env-file=.env scripts/specialty-guides-approve.ts
 *   Un guide :      npx tsx --env-file=.env scripts/specialty-guides-approve.ts dermatologie
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const specialtySlug = process.argv[2];
  const where = specialtySlug
    ? { reviewedAt: null, specialty: { slug: specialtySlug } }
    : { status: "PUBLISHED", reviewedAt: null };
  const res = await prisma.specialtyGuide.updateMany({ where, data: { reviewedAt: new Date() } });
  console.log(`✓ ${res.count} guide(s) relu(s) FR → indexables${specialtySlug ? ` (${specialtySlug})` : ""}.`);
}

main().finally(() => prisma.$disconnect());
