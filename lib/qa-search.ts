import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Recherche full-text tolérante sur les questions publiées.
 *
 * Combine trois signaux Postgres pour maximiser le rappel sur des requêtes
 * santé grand public (souvent accentuées à moitié, fautives, ou en darija
 * latinisée) :
 *  1. plein-texte français `websearch_to_tsquery` sur titre + corps + tags,
 *     désaccentué via `unaccent` (« diabete » trouve « diabète ») ;
 *  2. similarité trigram `pg_trgm` (`%`) → rattrape les fautes de frappe ;
 *  3. `ILIKE` désaccentué → repli sous-chaîne.
 *
 * Le classement privilégie la pertinence plein-texte, puis la similarité, puis
 * l'engagement (réponses) et la fraîcheur. Retourne des IDs classés + le total ;
 * l'appelant recharge les données riches via Prisma en conservant l'ordre.
 *
 * NB : requête à la volée (pas d'index GIN persistant) — adaptée à l'échelle
 * actuelle (dizaines/milliers de questions). Ajouter un index GIN sur un
 * `tsvector` généré quand le volume l'exigera.
 */
export async function searchQuestions(
  query: string,
  opts: { specialtySlug?: string; unansweredOnly?: boolean; limit: number; offset: number },
): Promise<{ ids: string[]; total: number }> {
  const q = query.trim();
  if (!q) return { ids: [], total: 0 };

  const specCond = opts.specialtySlug
    ? Prisma.sql`AND s."specialtyId" = (SELECT id FROM specialties WHERE slug = ${opts.specialtySlug} LIMIT 1)`
    : Prisma.empty;
  const unansweredCond = opts.unansweredOnly ? Prisma.sql`AND s."answersCount" = 0` : Prisma.empty;

  const doc = Prisma.sql`to_tsvector('french', unaccent(coalesce(s.title,'') || ' ' || coalesce(s.body,'') || ' ' || array_to_string(s.tags, ' ')))`;
  const tsq = Prisma.sql`websearch_to_tsquery('french', unaccent(${q}))`;

  const where = Prisma.sql`
    WHERE s.status = 'PUBLISHED'
      AND (
        ${doc} @@ ${tsq}
        OR word_similarity(unaccent(${q}), unaccent(s.title)) >= 0.4
        OR unaccent(s.title) ILIKE '%' || unaccent(${q}) || '%'
      )
      ${specCond}
      ${unansweredCond}`;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT s.id
      FROM questions s
      ${where}
      ORDER BY
        ts_rank(${doc}, ${tsq}) DESC,
        word_similarity(unaccent(${q}), unaccent(s.title)) DESC,
        s."answersCount" DESC,
        s."publishedAt" DESC NULLS LAST
      LIMIT ${opts.limit} OFFSET ${opts.offset}
    `),
    prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT count(*)::bigint AS count FROM questions s ${where}
    `),
  ]);

  return { ids: rows.map((r) => r.id), total: Number(countRows[0]?.count ?? 0) };
}
