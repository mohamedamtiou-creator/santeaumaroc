/**
 * Exporte le CONTENU santé de la base LOCALE en SQL portable pour la MEP prod :
 *  - health_topics : UPSERT COMPLET par `slug` (base + AR + intent + clusters).
 *    specialtyId résolu par slug (les cuid diffèrent entre envs). id généré pour
 *    les lignes nouvelles ; ON CONFLICT (slug) met à jour les existantes.
 *    On NE touche PAS `views`/`createdAt` (données propres à la prod).
 *  - specialty_guides : INSERT ... ON CONFLICT (specialtyId), relus = publiés.
 *
 *   npx tsx --env-file=.env scripts/export-clusters-sql.ts > scripts/mep/2026-07-clusters-data.sql
 *
 * Idempotent (upsert). Réexécutable sans risque.
 */
import { prisma } from "@/lib/prisma";

function q(s: string | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return `'${s.replace(/'/g, "''")}'`;
}
function qArr(a: string[] | null | undefined): string {
  if (!a || a.length === 0) return "ARRAY[]::text[]";
  return `ARRAY[${a.map((x) => q(x)).join(", ")}]::text[]`;
}
function qTs(d: Date | null | undefined): string {
  if (!d) return "NULL";
  return `'${d.toISOString()}'::timestamp(3)`;
}
function qInt(n: number | null | undefined): string {
  return n === null || n === undefined ? "NULL" : String(n);
}

async function main() {
  const out: string[] = [];
  out.push("-- =============================================================================");
  out.push("-- MEP « Contenu santé (health graph + clusters) » — DONNÉES (DML)");
  out.push("-- À lancer APRÈS le script de schéma. Idempotent (upsert par slug). Généré depuis local.");
  out.push("-- =============================================================================");
  out.push("SET client_min_messages = WARNING;");
  out.push("BEGIN;");

  // ── health_topics : upsert complet par slug ────────────────────────────────
  const topics = await prisma.healthTopic.findMany({
    include: { specialty: { select: { slug: true } } },
    orderBy: { slug: "asc" },
  });
  out.push(`\n-- ${topics.length} health_topics (upsert complet par slug)`);
  for (const t of topics) {
    const specSub = t.specialty ? `(SELECT "id" FROM "specialties" WHERE "slug"=${q(t.specialty.slug)})` : "NULL";
    out.push(
      `INSERT INTO "health_topics" (` +
        `"id","kind","term","slug","shortAnswer","causes","redFlags","whenToConsult","faqJson","synonyms",` +
        `"specialtyId","relatedSlugs","glossarySlugs","sources","termAr","shortAnswerAr","causesAr","redFlagsAr",` +
        `"whenToConsultAr","faqJsonAr","sourcesAr","arReviewedAt","reviewedAt","status",` +
        `"intentSlug","intentQuestion","intentAnswer","intentQuestionAr","intentAnswerAr","relatedTopicSlugs",` +
        `"treatmentSummary","treatmentSteps","treatmentSummaryAr","treatmentStepsAr",` +
        `"preventionSummary","preventionSteps","preventionSummaryAr","preventionStepsAr","updatedAt")\n` +
        `VALUES (${q(`ht_${t.slug}`)}, ${q(t.kind)}, ${q(t.term)}, ${q(t.slug)}, ${q(t.shortAnswer)}, ${q(t.causes)}, ${q(t.redFlags)}, ${q(t.whenToConsult)}, ${q(t.faqJson)}, ${qArr(t.synonyms)}, ` +
        `${specSub}, ${qArr(t.relatedSlugs)}, ${qArr(t.glossarySlugs)}, ${q(t.sources)}, ${q(t.termAr)}, ${q(t.shortAnswerAr)}, ${q(t.causesAr)}, ${q(t.redFlagsAr)}, ` +
        `${q(t.whenToConsultAr)}, ${q(t.faqJsonAr)}, ${q(t.sourcesAr)}, ${qTs(t.arReviewedAt)}, ${qTs(t.reviewedAt)}, ${q(t.status)}, ` +
        `${q(t.intentSlug)}, ${q(t.intentQuestion)}, ${q(t.intentAnswer)}, ${q(t.intentQuestionAr)}, ${q(t.intentAnswerAr)}, ${qArr(t.relatedTopicSlugs)}, ` +
        `${q(t.treatmentSummary)}, ${q(t.treatmentSteps)}, ${q(t.treatmentSummaryAr)}, ${q(t.treatmentStepsAr)}, ` +
        `${q(t.preventionSummary)}, ${q(t.preventionSteps)}, ${q(t.preventionSummaryAr)}, ${q(t.preventionStepsAr)}, now())\n` +
        `ON CONFLICT ("slug") DO UPDATE SET ` +
        `"kind"=EXCLUDED."kind","term"=EXCLUDED."term","shortAnswer"=EXCLUDED."shortAnswer","causes"=EXCLUDED."causes","redFlags"=EXCLUDED."redFlags","whenToConsult"=EXCLUDED."whenToConsult","faqJson"=EXCLUDED."faqJson","synonyms"=EXCLUDED."synonyms",` +
        `"specialtyId"=EXCLUDED."specialtyId","relatedSlugs"=EXCLUDED."relatedSlugs","glossarySlugs"=EXCLUDED."glossarySlugs","sources"=EXCLUDED."sources","termAr"=EXCLUDED."termAr","shortAnswerAr"=EXCLUDED."shortAnswerAr","causesAr"=EXCLUDED."causesAr","redFlagsAr"=EXCLUDED."redFlagsAr",` +
        `"whenToConsultAr"=EXCLUDED."whenToConsultAr","faqJsonAr"=EXCLUDED."faqJsonAr","sourcesAr"=EXCLUDED."sourcesAr","arReviewedAt"=EXCLUDED."arReviewedAt","reviewedAt"=EXCLUDED."reviewedAt","status"=EXCLUDED."status",` +
        `"intentSlug"=EXCLUDED."intentSlug","intentQuestion"=EXCLUDED."intentQuestion","intentAnswer"=EXCLUDED."intentAnswer","intentQuestionAr"=EXCLUDED."intentQuestionAr","intentAnswerAr"=EXCLUDED."intentAnswerAr","relatedTopicSlugs"=EXCLUDED."relatedTopicSlugs",` +
        `"treatmentSummary"=EXCLUDED."treatmentSummary","treatmentSteps"=EXCLUDED."treatmentSteps","treatmentSummaryAr"=EXCLUDED."treatmentSummaryAr","treatmentStepsAr"=EXCLUDED."treatmentStepsAr",` +
        `"preventionSummary"=EXCLUDED."preventionSummary","preventionSteps"=EXCLUDED."preventionSteps","preventionSummaryAr"=EXCLUDED."preventionSummaryAr","preventionStepsAr"=EXCLUDED."preventionStepsAr","updatedAt"=now();`,
    );
  }

  // ── specialty_guides : upsert par specialtyId (résolu via slug) ────────────
  const guides = await prisma.specialtyGuide.findMany({
    include: { specialty: { select: { slug: true } } },
    orderBy: { specialty: { slug: "asc" } },
  });
  out.push(`\n-- ${guides.length} specialty_guides (relus = publiés)`);
  for (const g of guides) {
    out.push(
      `INSERT INTO "specialty_guides" ("id","specialtyId","shortAnswer","reasons","redFlags","whenToConsult","faqJson","sources","relatedSlugs","shortAnswerAr","reasonsAr","redFlagsAr","whenToConsultAr","faqJsonAr","sourcesAr","reviewedAt","arReviewedAt","status","updatedAt")\n` +
        `SELECT ${q(`sg_${g.specialty.slug}`)}, s."id", ${q(g.shortAnswer)}, ${q(g.reasons)}, ${q(g.redFlags)}, ${q(g.whenToConsult)}, ${q(g.faqJson)}, ${q(g.sources)}, ${qArr(g.relatedSlugs)}, ${q(g.shortAnswerAr)}, ${q(g.reasonsAr)}, ${q(g.redFlagsAr)}, ${q(g.whenToConsultAr)}, ${q(g.faqJsonAr)}, ${q(g.sourcesAr)}, now(), now(), 'PUBLISHED', now()\n` +
        `FROM "specialties" s WHERE s."slug"=${q(g.specialty.slug)}\n` +
        `ON CONFLICT ("specialtyId") DO UPDATE SET ` +
        `"shortAnswer"=EXCLUDED."shortAnswer","reasons"=EXCLUDED."reasons","redFlags"=EXCLUDED."redFlags","whenToConsult"=EXCLUDED."whenToConsult","faqJson"=EXCLUDED."faqJson","sources"=EXCLUDED."sources","relatedSlugs"=EXCLUDED."relatedSlugs","shortAnswerAr"=EXCLUDED."shortAnswerAr","reasonsAr"=EXCLUDED."reasonsAr","redFlagsAr"=EXCLUDED."redFlagsAr","whenToConsultAr"=EXCLUDED."whenToConsultAr","faqJsonAr"=EXCLUDED."faqJsonAr","sourcesAr"=EXCLUDED."sourcesAr","reviewedAt"=EXCLUDED."reviewedAt","arReviewedAt"=EXCLUDED."arReviewedAt","updatedAt"=now();`,
    );
  }

  out.push("\nCOMMIT;");
  console.log(out.join("\n"));
}

main().finally(() => prisma.$disconnect());
