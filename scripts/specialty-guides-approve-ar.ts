/**
 * Ouvre l'indexation ARABE des guides « quand consulter » APRÈS relecture de la
 * traduction (YMYL). Pose `arReviewedAt` là où il est nul (et où la version AR
 * existe). Tant que `arReviewedAt=null`, l'arabe n'est ni servi ni indexé (repli FR).
 *
 *   Tout ouvrir :  npx tsx --env-file=.env scripts/specialty-guides-approve-ar.ts
 *   Un guide :      npx tsx --env-file=.env scripts/specialty-guides-approve-ar.ts dermatologie
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const specialtySlug = process.argv[2];
  const where = specialtySlug
    ? { arReviewedAt: null, shortAnswerAr: { not: null }, specialty: { slug: specialtySlug } }
    : { status: "PUBLISHED", arReviewedAt: null, shortAnswerAr: { not: null } };
  const res = await prisma.specialtyGuide.updateMany({ where, data: { arReviewedAt: new Date() } });
  console.log(`✓ ${res.count} guide(s) relu(s) AR → indexables${specialtySlug ? ` (${specialtySlug})` : ""}.`);
}

main().finally(() => prisma.$disconnect());
