/**
 * Seed des fiches HealthTopic rédigées par lots (pipeline intent-pages).
 * Upsert par slug, BILINGUE, **`reviewedAt=null` + `arReviewedAt=null`** → tout
 * reste noindex et hors sitemap jusqu'à relecture humaine (garde-fou YMYL).
 *
 * `intentSlug` n'est PAS posé ici : il l'est après relecture via
 * scripts/seed-intent-pages.ts (aucune page intention avant relecture). La
 * réponse intention pré-rédigée est stockée dès maintenant (intentAnswer*).
 *
 * Ajouter un lot = importer son fichier `scripts/data/topics-batch-NN.ts` et
 * l'ajouter à BATCHES ci-dessous. Idempotent.
 *
 *   npx tsx --env-file=.env scripts/seed-topic-batches.ts
 */
import { prisma } from "@/lib/prisma";
import type { TopicSeed } from "@/scripts/data/topic-seed";
import { BATCH_01 } from "@/scripts/data/topics-batch-01";
import { BATCH_02 } from "@/scripts/data/topics-batch-02";
import { BATCH_03 } from "@/scripts/data/topics-batch-03";
import { BATCH_04 } from "@/scripts/data/topics-batch-04";
import { BATCH_05 } from "@/scripts/data/topics-batch-05";

const BATCHES: TopicSeed[][] = [BATCH_01, BATCH_02, BATCH_03, BATCH_04, BATCH_05];

async function main() {
  const all = BATCHES.flat();
  const specialties = await prisma.specialty.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(specialties.map((s) => [s.slug, s.id]));

  let done = 0;
  const missingSpec = new Set<string>();
  const dupCheck = new Set<string>();

  for (const t of all) {
    if (dupCheck.has(t.slug)) { console.warn(`⚠️ doublon de slug dans les lots : ${t.slug}`); continue; }
    dupCheck.add(t.slug);

    const specialtyId = bySlug.get(t.specialty) ?? null;
    if (!specialtyId) missingSpec.add(t.specialty);

    const data = {
      kind: t.kind,
      term: t.term,
      shortAnswer: t.shortAnswer,
      causes: t.causes.join("\n"),
      redFlags: t.redFlags.join("\n"),
      whenToConsult: t.whenToConsult,
      faqJson: JSON.stringify(t.faq),
      synonyms: t.synonyms ?? [],
      specialtyId,
      relatedSlugs: t.related ?? [],
      glossarySlugs: t.glossary ?? [],
      sources: t.sources ? JSON.stringify(t.sources) : null,
      // Réponse intention pré-rédigée (servie après attache de intentSlug).
      intentAnswer: t.intentAnswer,
      intentAnswerAr: t.intentAnswerAr,
      // AR (noindex tant que arReviewedAt=null).
      termAr: t.termAr,
      shortAnswerAr: t.shortAnswerAr,
      causesAr: t.causesAr.join("\n"),
      redFlagsAr: t.redFlagsAr.join("\n"),
      whenToConsultAr: t.whenToConsultAr,
      faqJsonAr: JSON.stringify(t.faqAr),
      status: "PUBLISHED",
      // reviewedAt / arReviewedAt volontairement non posés → noindex.
    };

    await prisma.healthTopic.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, ...data },
      update: data,
    });
    done++;
  }

  console.log(`✓ ${done} fiche(s) semée(s) FR+AR (PUBLISHED, reviewedAt/arReviewedAt=null → noindex).`);
  if (missingSpec.size) console.warn(`⚠️ spécialités introuvables : ${[...missingSpec].join(", ")}`);
  console.log("→ Relire, puis : symptoms-approve.ts <slug> (FR) · health-topics-approve-ar.ts <slug> (AR) · seed-intent-pages.ts (attache intentSlug)");
}

main().finally(() => prisma.$disconnect());
