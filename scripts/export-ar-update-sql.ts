/**
 * Génère le SQL de MISE À JOUR prod pour les traductions arabes du glossaire et
 * des symptômes (lignes EXISTANTES en prod → UPDATE by slug, pas INSERT).
 *
 * - Portable & sûr : `reviewedAt = COALESCE("reviewedAt", now())` → ne dé-publie
 *   JAMAIS une fiche déjà relue en prod ; publie seulement celles en NULL (Option A).
 * - `arReviewedAt = now()` → ouvre l'affichage/indexation arabe.
 *
 *   npx tsx --env-file=.env scripts/export-ar-update-sql.ts
 *   → prisma/manual-migrations/20260721_ar_glossaire_symptomes.sql
 */
import { writeFileSync } from "node:fs";
import { prisma } from "@/lib/prisma";

const q = (v: string | null | undefined) => (v == null ? "NULL" : `'${v.replace(/'/g, "''")}'`);

async function main() {
  const glo = await prisma.glossaryTerm.findMany({
    where: { status: "PUBLISHED", definitionAr: { not: null } },
    select: { slug: true, termAr: true, definitionAr: true },
    orderBy: { term: "asc" },
  });
  const sym = await prisma.healthTopic.findMany({
    where: { kind: "SYMPTOM", status: "PUBLISHED", shortAnswerAr: { not: null } },
    select: { slug: true, termAr: true, shortAnswerAr: true, causesAr: true, redFlagsAr: true, whenToConsultAr: true, faqJsonAr: true },
    orderBy: { term: "asc" },
  });

  const gLines = glo.map((g) =>
    `UPDATE glossary_terms SET "termAr"=${q(g.termAr)}, "definitionAr"=${q(g.definitionAr)}, ` +
    `"arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug=${q(g.slug)};`,
  );
  const sLines = sym.map((s) =>
    `UPDATE health_topics SET "termAr"=${q(s.termAr)}, "shortAnswerAr"=${q(s.shortAnswerAr)}, ` +
    `"causesAr"=${q(s.causesAr)}, "redFlagsAr"=${q(s.redFlagsAr)}, "whenToConsultAr"=${q(s.whenToConsultAr)}, ` +
    `"faqJsonAr"=${q(s.faqJsonAr)}, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) ` +
    `WHERE slug=${q(s.slug)} AND kind='SYMPTOM';`,
  );

  const sql = [
    `-- Traductions arabes : glossaire (${glo.length}) + symptômes (${sym.length})`,
    `-- Lignes EXISTANTES en prod → UPDATE by slug. Sûr : COALESCE ne dé-publie jamais.`,
    `-- Ouvre l'AR (arReviewedAt) + publie le FR des fiches non encore relues (Option A).`,
    `-- Généré par scripts/export-ar-update-sql.ts`,
    ``,
    `BEGIN;`,
    ``,
    `-- ─── Glossaire ───`,
    ...gLines,
    ``,
    `-- ─── Symptômes ───`,
    ...sLines,
    ``,
    `COMMIT;`,
    ``,
  ].join("\n");

  writeFileSync("prisma/manual-migrations/20260721_ar_glossaire_symptomes.sql", sql, "utf8");
  console.log(`✓ SQL écrit : prisma/manual-migrations/20260721_ar_glossaire_symptomes.sql`);
  console.log(`  glossaire=${glo.length} symptômes=${sym.length} | UPDATE=${gLines.length + sLines.length}`);
  await prisma.$disconnect();
}

main();
