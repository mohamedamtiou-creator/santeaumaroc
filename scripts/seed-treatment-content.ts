/**
 * Seed de l'angle « comment traiter X ? » sur des HealthTopic EXISTANTS.
 * Pose treatmentSummary/treatmentSteps (+ AR) et relatedTopicSlugs SANS toucher
 * aux verrous YMYL → la page /comment-traiter/[slug] reste noindex tant que le
 * topic n'est pas relu (reviewedAt/arReviewedAt).
 *
 *   npx tsx --env-file=.env scripts/seed-treatment-content.ts
 */
import { prisma } from "@/lib/prisma";
import { TREATMENT_CONTENT } from "./data/treatment-content";
import { TREATMENT_CONTENT_2 } from "./data/treatment-content-2";
import { TREATMENT_CONTENT_3 } from "./data/treatment-content-3";

async function main() {
  let ok = 0;
  let missing = 0;
  for (const c of [...TREATMENT_CONTENT, ...TREATMENT_CONTENT_2, ...TREATMENT_CONTENT_3]) {
    const topic = await prisma.healthTopic.findUnique({ where: { slug: c.slug }, select: { id: true } });
    if (!topic) {
      console.warn(`⚠ topic introuvable, ignoré : ${c.slug}`);
      missing++;
      continue;
    }
    await prisma.healthTopic.update({
      where: { id: topic.id },
      data: {
        treatmentSummary: c.summary,
        treatmentSteps: c.steps.join("\n"),
        treatmentSummaryAr: c.summaryAr,
        treatmentStepsAr: c.stepsAr.join("\n"),
        ...(c.relatedTopicSlugs ? { relatedTopicSlugs: c.relatedTopicSlugs } : {}),
      },
    });
    ok++;
  }
  console.log(`✓ ${ok} angle(s) traitement semé(s)${missing ? `, ${missing} introuvable(s)` : ""} (noindex jusqu'à relecture).`);
}

main().finally(() => prisma.$disconnect());
