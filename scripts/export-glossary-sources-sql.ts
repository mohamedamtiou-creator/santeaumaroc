/**
 * Génère le SQL de mise à jour prod pour les SOURCES du glossaire.
 *
 * Contexte : le lot de sourçage (cf. scripts/seed-glossary-sources.ts) a rempli
 * le champ `sources` de 68 termes sur la base de travail. Ce script rejoue
 * exactement le même résultat en prod, sans dépendre de Node ni de Prisma côté
 * serveur — un simple `psql -f` ou un copier-coller en console SQL suffit.
 *
 * Garde-fous, dans l'ordre :
 *  · UPDATE par `slug`, jamais d'INSERT : les lignes existent déjà en prod ;
 *  · clause `AND (sources IS NULL OR sources = '' OR sources = '[]')` → une
 *    source déjà présente en prod n'est JAMAIS écrasée. Le script est donc
 *    idempotent et non destructif, y compris s'il est rejoué ;
 *  · aucune modification de `reviewedAt`/`arReviewedAt` : ajouter une source ne
 *    change pas l'état de relecture d'une fiche ;
 *  · transaction unique : soit tout passe, soit rien.
 *
 *   npx tsx --env-file=.env scripts/export-glossary-sources-sql.ts
 *   → prisma/manual-migrations/20260804_glossaire_sources.sql
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { prisma } from "@/lib/prisma";

const q = (v: string | null | undefined) => (v == null ? "NULL" : `'${v.replace(/'/g, "''")}'`);

const hasSources = (raw: string | null) => {
  if (!raw) return false;
  try {
    const a = JSON.parse(raw);
    return Array.isArray(a) && a.length > 0;
  } catch {
    return false;
  }
};

async function main() {
  const terms = await prisma.glossaryTerm.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, term: true, sources: true },
    orderBy: { term: "asc" },
  });

  const sourced = terms.filter((t) => hasSources(t.sources));

  const lines = sourced.map(
    (t) =>
      `UPDATE glossary_terms SET sources=${q(t.sources)} ` +
      `WHERE slug=${q(t.slug)} AND (sources IS NULL OR sources = '' OR sources = '[]');`,
  );

  const sql = [
    "-- Sources du glossaire — SantéauMaroc",
    `-- Généré le ${new Date().toISOString().slice(0, 10)} par scripts/export-glossary-sources-sql.ts`,
    `-- ${sourced.length} termes sourcés sur ${terms.length} publiés.`,
    "--",
    "-- Sûr et rejouable : n'écrase JAMAIS une source déjà présente en prod",
    "-- (clause sources IS NULL OR '' OR '[]'), ne touche pas aux dates de relecture,",
    "-- et n'insère aucune ligne. Un terme absent de la prod est simplement ignoré.",
    "",
    "BEGIN;",
    "",
    "-- État avant application (à comparer avec le compte final)",
    "SELECT count(*) AS termes_sans_source_avant",
    "  FROM glossary_terms",
    " WHERE status = 'PUBLISHED'",
    "   AND (sources IS NULL OR sources = '' OR sources = '[]');",
    "",
    ...lines,
    "",
    "-- Contrôle : ce compte doit avoir chuté d'autant de lignes que d'UPDATE appliqués",
    "SELECT count(*) AS termes_sans_source_apres",
    "  FROM glossary_terms",
    " WHERE status = 'PUBLISHED'",
    "   AND (sources IS NULL OR sources = '' OR sources = '[]');",
    "",
    "COMMIT;",
    "",
  ].join("\n");

  mkdirSync("prisma/manual-migrations", { recursive: true });
  const out = "prisma/manual-migrations/20260804_glossaire_sources.sql";
  writeFileSync(out, sql, "utf8");
  console.log(`${sourced.length} UPDATE générés (sur ${terms.length} termes publiés) → ${out}`);
  const missing = terms.filter((t) => !hasSources(t.sources));
  if (missing.length) console.log(`termes encore sans source : ${missing.map((t) => t.slug).join(", ")}`);
}

main().finally(() => prisma.$disconnect());
