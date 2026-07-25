/**
 * Seed de l'angle « comment prévenir X ? » sur des HealthTopic EXISTANTS.
 * Pose preventionSummary/preventionSteps (+ AR) SANS toucher aux verrous YMYL →
 * la page /prevenir/[slug] reste noindex tant que le topic n'est pas relu.
 *
 *   npx tsx --env-file=.env scripts/seed-prevention-content.ts
 */
import { prisma } from "@/lib/prisma";
import { PREVENTION_CONTENT } from "./data/prevention-content";

async function main() {
  let ok = 0;
  let missing = 0;
  for (const c of PREVENTION_CONTENT) {
    const topic = await prisma.healthTopic.findUnique({ where: { slug: c.slug }, select: { id: true } });
    if (!topic) {
      console.warn(`⚠ topic introuvable, ignoré : ${c.slug}`);
      missing++;
      continue;
    }
    await prisma.healthTopic.update({
      where: { id: topic.id },
      data: {
        preventionSummary: c.summary,
        preventionSteps: c.steps.join("\n"),
        preventionSummaryAr: c.summaryAr,
        preventionStepsAr: c.stepsAr.join("\n"),
        // relatedTopicSlugs est partagé au topic (posé par le seed traitement) →
        // on ne le réécrit PAS ici pour ne pas l'écraser.
      },
    });
    ok++;
  }
  console.log(`✓ ${ok} angle(s) prévention semé(s)${missing ? `, ${missing} introuvable(s)` : ""} (noindex jusqu'à relecture).`);
}

main().finally(() => prisma.$disconnect());
