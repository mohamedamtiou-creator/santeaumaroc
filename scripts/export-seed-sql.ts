/**
 * Génère un SEED SQL portable (à coller dans la console SQL de l'hébergeur, ou
 * `psql -f`) pour les 30 examens + 30 traitements + 10 maladies.
 *
 * - `specialtyId` résolu par SOUS-REQUÊTE sur le slug → portable entre bases.
 * - `ON CONFLICT (slug) DO NOTHING` → idempotent (ré-exécutable).
 * - `reviewedAt`/`arReviewedAt` = NULL → contenu en NOINDEX (garde-fou YMYL).
 * - À lancer APRÈS la migration de schéma (tables medical_exams/treatments créées).
 *
 *   npx tsx --env-file=.env scripts/export-seed-sql.ts
 *   → prisma/manual-migrations/20260721_seed_examens_traitements_maladies.sql
 */
import { writeFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";

const q = (v: string | null | undefined) => (v == null ? "NULL" : `'${v.replace(/'/g, "''")}'`);
const n = (v: number | null | undefined) => (v == null ? "NULL" : String(v));
const arr = (a: string[] | null | undefined) =>
  !a || a.length === 0 ? "ARRAY[]::text[]" : `ARRAY[${a.map((x) => `'${x.replace(/'/g, "''")}'`).join(",")}]::text[]`;
const spec = (slug: string | null | undefined) =>
  slug ? `(SELECT id FROM specialties WHERE slug='${slug.replace(/'/g, "''")}')` : "NULL";
// Émet la date de relecture d'après l'état réel de la ligne (now() si relu, NULL sinon).
const ts = (v: Date | null | undefined) => (v ? "now()" : "NULL");

function insert(table: string, cols: string[], values: string[]): string {
  const colList = cols.map((c) => `"${c}"`).join(", ");
  return `INSERT INTO ${table} (${colList})\nVALUES\n  ${values.join(",\n  ")}\nON CONFLICT (slug) DO NOTHING;\n`;
}

async function main() {
  const [exams, treatments, diseases] = await Promise.all([
    prisma.medicalExam.findMany({ include: { specialty: { select: { slug: true } } }, orderBy: { name: "asc" } }),
    prisma.treatment.findMany({ include: { specialty: { select: { slug: true } } }, orderBy: { name: "asc" } }),
    prisma.healthTopic.findMany({ where: { kind: "DISEASE" }, include: { specialty: { select: { slug: true } } }, orderBy: { term: "asc" } }),
  ]);

  const examCols = ["id","name","slug","category","shortAnswer","indications","procedure","preparation","precautions","durationMin","priceMin","priceMax","reimbursement","faqJson","synonyms","specialtyId","relatedSlugs","glossarySlugs","sources","nameAr","shortAnswerAr","indicationsAr","procedureAr","preparationAr","precautionsAr","reimbursementAr","faqJsonAr","sourcesAr","arReviewedAt","reviewedAt","status","views","createdAt","updatedAt"];
  const examVals = exams.map((e) => `(${[
    q(e.id), q(e.name), q(e.slug), q(e.category), q(e.shortAnswer), q(e.indications), q(e.procedure), q(e.preparation), q(e.precautions),
    n(e.durationMin), n(e.priceMin), n(e.priceMax), q(e.reimbursement), q(e.faqJson), arr(e.synonyms), spec(e.specialty?.slug), arr(e.relatedSlugs), arr(e.glossarySlugs), q(e.sources),
    q(e.nameAr), q(e.shortAnswerAr), q(e.indicationsAr), q(e.procedureAr), q(e.preparationAr), q(e.precautionsAr), q(e.reimbursementAr), q(e.faqJsonAr), q(e.sourcesAr),
    ts(e.arReviewedAt), ts(e.reviewedAt), q(e.status), "0", "now()", "now()",
  ].join(", ")})`);

  const trCols = ["id","name","slug","category","shortAnswer","options","duration","sideEffects","redFlags","whenToConsult","faqJson","synonyms","specialtyId","relatedSlugs","glossarySlugs","sources","nameAr","shortAnswerAr","optionsAr","durationAr","sideEffectsAr","redFlagsAr","whenToConsultAr","faqJsonAr","sourcesAr","arReviewedAt","reviewedAt","status","views","createdAt","updatedAt"];
  const trVals = treatments.map((t) => `(${[
    q(t.id), q(t.name), q(t.slug), q(t.category), q(t.shortAnswer), q(t.options), q(t.duration), q(t.sideEffects), q(t.redFlags), q(t.whenToConsult), q(t.faqJson),
    arr(t.synonyms), spec(t.specialty?.slug), arr(t.relatedSlugs), arr(t.glossarySlugs), q(t.sources),
    q(t.nameAr), q(t.shortAnswerAr), q(t.optionsAr), q(t.durationAr), q(t.sideEffectsAr), q(t.redFlagsAr), q(t.whenToConsultAr), q(t.faqJsonAr), q(t.sourcesAr),
    ts(t.arReviewedAt), ts(t.reviewedAt), q(t.status), "0", "now()", "now()",
  ].join(", ")})`);

  const htCols = ["id","kind","term","slug","shortAnswer","causes","redFlags","whenToConsult","faqJson","synonyms","specialtyId","relatedSlugs","glossarySlugs","sources","termAr","shortAnswerAr","causesAr","redFlagsAr","whenToConsultAr","faqJsonAr","sourcesAr","arReviewedAt","reviewedAt","status","views","createdAt","updatedAt"];
  const htVals = diseases.map((d) => `(${[
    q(d.id), q(d.kind), q(d.term), q(d.slug), q(d.shortAnswer), q(d.causes), q(d.redFlags), q(d.whenToConsult), q(d.faqJson),
    arr(d.synonyms), spec(d.specialty?.slug), arr(d.relatedSlugs), arr(d.glossarySlugs), q(d.sources),
    q(d.termAr), q(d.shortAnswerAr), q(d.causesAr), q(d.redFlagsAr), q(d.whenToConsultAr), q(d.faqJsonAr), q(d.sourcesAr),
    ts(d.arReviewedAt), ts(d.reviewedAt), q(d.status), "0", "now()", "now()",
  ].join(", ")})`);

  const header = `-- Seed portable : Examens (${exams.length}) + Traitements (${treatments.length}) + Maladies (${diseases.length})
-- À lancer APRÈS la migration de schéma (tables medical_exams / treatments créées).
-- Portable (specialtyId résolu par slug), idempotent (ON CONFLICT slug).
-- reviewedAt/arReviewedAt reflètent l'état de relecture en base source (now() = relu/indexable, NULL = noindex).
-- Généré par scripts/export-seed-sql.ts

BEGIN;

`;
  const body = [
    `-- ─── Examens ───`, insert("medical_exams", examCols, examVals), "",
    `-- ─── Traitements ───`, insert("treatments", trCols, trVals), "",
    `-- ─── Maladies (health_topics, kind=DISEASE) ───`, insert("health_topics", htCols, htVals),
  ].join("\n");

  writeFileSync("prisma/manual-migrations/20260721_seed_examens_traitements_maladies.sql", header + body + "\nCOMMIT;\n", "utf8");
  console.log(`✓ SQL écrit : prisma/manual-migrations/20260721_seed_examens_traitements_maladies.sql`);
  console.log(`  examens=${exams.length} traitements=${treatments.length} maladies=${diseases.length}`);
  const noSpec = [...exams, ...treatments, ...diseases].filter((r) => !r.specialty).length;
  if (noSpec) console.log(`  ⚠ ${noSpec} ligne(s) sans spécialité (specialtyId=NULL)`);
  await prisma.$disconnect();
}

main();
