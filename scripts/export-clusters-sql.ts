/**
 * Exporte le CONTENU du chantier « clusters » de la base LOCALE en SQL portable
 * pour la MEP prod. Résout les spécialités par `slug` (les IDs cuid diffèrent
 * entre environnements) et cible les topics par `slug` (stable).
 *
 *   npx tsx --env-file=.env scripts/export-clusters-sql.ts > scripts/mep/2026-07-clusters-data.sql
 *
 * Idempotent : UPDATE par slug + INSERT ... ON CONFLICT DO UPDATE.
 * Les guides sont exportés en RELU (reviewedAt/arReviewedAt = now()) → publiés.
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

async function main() {
  const out: string[] = [];
  out.push("-- =============================================================================");
  out.push("-- MEP « Clusters de contenu santé » — DONNÉES (DML)");
  out.push("-- À lancer APRÈS le script de schéma. Idempotent. Généré depuis la base locale.");
  out.push("-- =============================================================================");
  out.push("BEGIN;");

  // 1) Angles traitement / prévention + relatedTopicSlugs sur health_topics (par slug)
  const topics = await prisma.healthTopic.findMany({
    where: { OR: [{ treatmentSummary: { not: null } }, { preventionSummary: { not: null } }] },
    select: {
      slug: true, treatmentSummary: true, treatmentSteps: true, treatmentSummaryAr: true, treatmentStepsAr: true,
      preventionSummary: true, preventionSteps: true, preventionSummaryAr: true, preventionStepsAr: true,
      relatedTopicSlugs: true,
    },
    orderBy: { slug: "asc" },
  });
  out.push(`\n-- ${topics.length} topics porteurs d'un angle (traitement/prévention)`);
  for (const t of topics) {
    out.push(
      `UPDATE "health_topics" SET ` +
        `"treatmentSummary"=${q(t.treatmentSummary)}, "treatmentSteps"=${q(t.treatmentSteps)}, ` +
        `"treatmentSummaryAr"=${q(t.treatmentSummaryAr)}, "treatmentStepsAr"=${q(t.treatmentStepsAr)}, ` +
        `"preventionSummary"=${q(t.preventionSummary)}, "preventionSteps"=${q(t.preventionSteps)}, ` +
        `"preventionSummaryAr"=${q(t.preventionSummaryAr)}, "preventionStepsAr"=${q(t.preventionStepsAr)}, ` +
        `"relatedTopicSlugs"=${qArr(t.relatedTopicSlugs)} ` +
        `WHERE "slug"=${q(t.slug)};`,
    );
  }

  // 2) Guides de spécialité (INSERT ... SELECT résout specialtyId via slug ; ON CONFLICT update)
  const guides = await prisma.specialtyGuide.findMany({
    include: { specialty: { select: { slug: true } } },
    orderBy: { specialty: { slug: "asc" } },
  });
  out.push(`\n-- ${guides.length} guides de spécialité (relus = publiés)`);
  for (const g of guides) {
    const id = q(`sg_${g.specialty.slug}`);
    out.push(
      `INSERT INTO "specialty_guides" ("id","specialtyId","shortAnswer","reasons","redFlags","whenToConsult","faqJson","sources","relatedSlugs","shortAnswerAr","reasonsAr","redFlagsAr","whenToConsultAr","faqJsonAr","sourcesAr","reviewedAt","arReviewedAt","status","updatedAt")\n` +
        `SELECT ${id}, s."id", ${q(g.shortAnswer)}, ${q(g.reasons)}, ${q(g.redFlags)}, ${q(g.whenToConsult)}, ${q(g.faqJson)}, ${q(g.sources)}, ${qArr(g.relatedSlugs)}, ${q(g.shortAnswerAr)}, ${q(g.reasonsAr)}, ${q(g.redFlagsAr)}, ${q(g.whenToConsultAr)}, ${q(g.faqJsonAr)}, ${q(g.sourcesAr)}, now(), now(), 'PUBLISHED', now()\n` +
        `FROM "specialties" s WHERE s."slug"=${q(g.specialty.slug)}\n` +
        `ON CONFLICT ("specialtyId") DO UPDATE SET ` +
        `"shortAnswer"=EXCLUDED."shortAnswer", "reasons"=EXCLUDED."reasons", "redFlags"=EXCLUDED."redFlags", "whenToConsult"=EXCLUDED."whenToConsult", "faqJson"=EXCLUDED."faqJson", "sources"=EXCLUDED."sources", "relatedSlugs"=EXCLUDED."relatedSlugs", "shortAnswerAr"=EXCLUDED."shortAnswerAr", "reasonsAr"=EXCLUDED."reasonsAr", "redFlagsAr"=EXCLUDED."redFlagsAr", "whenToConsultAr"=EXCLUDED."whenToConsultAr", "faqJsonAr"=EXCLUDED."faqJsonAr", "sourcesAr"=EXCLUDED."sourcesAr", "reviewedAt"=EXCLUDED."reviewedAt", "arReviewedAt"=EXCLUDED."arReviewedAt", "updatedAt"=now();`,
    );
  }

  out.push("\nCOMMIT;");
  console.log(out.join("\n"));
}

main().finally(() => prisma.$disconnect());
