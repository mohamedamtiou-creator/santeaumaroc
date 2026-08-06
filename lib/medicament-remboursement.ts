import { prisma } from "@/lib/prisma";
import { TTL } from "@/lib/cache-ttl";
import { cachedQuery, decToNum } from "@/lib/cache";

/**
 * SILO REMBOURSEMENT DES MÉDICAMENTS.
 *
 * ── POURQUOI ──────────────────────────────────────────────────────────────
 * C'est le seul jeu de données de remboursement massif, structuré et de source
 * officielle du site : 5 916 médicaments actifs portent tous un taux, 5 889 un
 * prix de base de remboursement, 5 729 un PPV. Jusqu'ici `/prix` n'en montrait
 * RIEN — un simple lien vers `/medicaments`.
 *
 * Contrairement aux fourchettes de consultation (estimations éditoriales non
 * validées, cf. lib/prix-reference.ts), ces montants viennent du référentiel
 * public du médicament : ils sont publiables sans réserve de sourcing.
 *
 * ── CE QUE LA DONNÉE PERMET, ET CE QU'ELLE NE PERMET PAS ──────────────────
 * Mesuré le 1er août 2026 :
 *  · le taux est BINAIRE : « 70% » (3 939) ou « 0% » (1 977). Il n'y a pas de
 *    palier intermédiaire à exposer.
 *  · `classe` est NULL sur les 5 916 lignes → aucun axe par classe thérapeutique
 *    n'est possible. Ne pas construire de silo dessus.
 *  · `dci` est renseignée sur les 5 916 → c'est l'axe secondaire exploitable.
 *  · 457 médicaments ont un PPV STRICTEMENT SUPÉRIEUR à leur base de
 *    remboursement. C'est le reste à charge réel du patient, et l'information la
 *    plus utile du lot : elle n'est publiée nulle part ailleurs au Maroc.
 *
 * ── CRAWL ─────────────────────────────────────────────────────────────────
 * 5 916 entrées : ce listing tomberait dans le piège corrigé au chantier
 * précédent (pagination client ⇒ aucun chemin de lien HTML au-delà de la page 1).
 * Il a donc, dès l'origine, un index alphabétique serveur — même patron que
 * lib/city-alpha-index.ts.
 */

/** Entrées par page d'index. Aligné sur l'index alphabétique des villes. */
export const MED_INDEX_PAGE_SIZE = 300;

/** Sous ce nombre, une lettre passe en noindex,follow (page trop mince). */
export const MED_MIN_INDEXABLE = 10;

export const MED_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Regroupe les initiales non alphabétiques (chiffres, symboles) — aucune fiche perdue. */
export const MED_OTHER_SLUG = "autres";

export type MedLetterBucket = { letter: string; slug: string; count: number; pages: number };

export type MedRow = {
  slug: string;
  nom: string;
  dci: string | null;
  dosage: string | null;
  forme: string | null;
  /** Prix public de vente, en MAD. */
  ppv: number | null;
  /** Base de remboursement, en MAD. */
  base: number | null;
  /** Taux tel qu'en base (« 70% » | « 0% »). */
  taux: string | null;
  /** PPV − base quand PPV > base : le supplément réellement à la charge du patient. */
  ecart: number | null;
};

/* ── Statistiques de tête ───────────────────────────────────────────────── */

export function getRemboursementStats() {
  return cachedQuery("med:rembt:stats", TTL.STATIC, async () => {
    const [total, rembourses, nonRembourses, avecBase, avecPpv, ecartRows] = await Promise.all([
      prisma.medication.count({ where: { isActive: true } }),
      prisma.medication.count({ where: { isActive: true, tauxRemboursement: "70%" } }),
      prisma.medication.count({ where: { isActive: true, tauxRemboursement: "0%" } }),
      prisma.medication.count({ where: { isActive: true, prixBR: { not: null } } }),
      prisma.medication.count({ where: { isActive: true, ppv: { not: null } } }),
      prisma.$queryRaw<{ n: bigint; max_ecart: number | null }[]>`
        SELECT count(*) AS n, max(ppv - "prixBR")::float AS max_ecart
          FROM medications
         WHERE "isActive" = true AND ppv IS NOT NULL AND "prixBR" IS NOT NULL AND ppv > "prixBR"
      `,
    ]);
    return {
      total,
      rembourses,
      nonRembourses,
      avecBase,
      avecPpv,
      avecEcart: Number(ecartRows[0]?.n ?? 0),
      ecartMax: ecartRows[0]?.max_ecart ?? null,
    };
  });
}

/**
 * Les médicaments dont le PPV dépasse la base de remboursement, du plus gros
 * écart au plus petit. Table courte et à forte valeur : c'est l'information que
 * le patient cherche sans la trouver ailleurs.
 */
export function getEcartsDeBase(limit = 60) {
  return cachedQuery(`med:rembt:ecarts:${limit}`, TTL.STATIC, async () => {
    const rows = await prisma.$queryRaw<
      { slug: string; nom: string; dci: string | null; ppv: number; base: number; ecart: number }[]
    >`
      SELECT slug, nom, dci, ppv::float AS ppv, "prixBR"::float AS base, (ppv - "prixBR")::float AS ecart
        FROM medications
       WHERE "isActive" = true AND ppv IS NOT NULL AND "prixBR" IS NOT NULL AND ppv > "prixBR"
       ORDER BY (ppv - "prixBR") DESC, nom ASC
       LIMIT ${limit}
    `;
    return rows.map((r) => ({ ...r, ppv: Number(r.ppv), base: Number(r.base), ecart: Number(r.ecart) }));
  });
}

/* ── Index alphabétique ─────────────────────────────────────────────────── */

export function getMedLetterBuckets() {
  return cachedQuery("med:rembt:buckets", TTL.STATIC, async () => {
    const rows = await prisma.$queryRaw<{ letter: string; n: bigint }[]>`
      SELECT upper(left(nom, 1)) AS letter, count(*) AS n
        FROM medications
       WHERE "isActive" = true
       GROUP BY 1
    `;

    const counts = new Map<string, number>();
    let other = 0;
    for (const r of rows) {
      const l = (r.letter ?? "").toUpperCase();
      const n = Number(r.n);
      if (MED_LETTERS.includes(l)) counts.set(l, (counts.get(l) ?? 0) + n);
      else other += n; // chiffres, symboles : regroupés, jamais perdus
    }

    const buckets: MedLetterBucket[] = MED_LETTERS.filter((l) => (counts.get(l) ?? 0) > 0).map((l) => {
      const count = counts.get(l) ?? 0;
      return { letter: l, slug: l.toLowerCase(), count, pages: Math.ceil(count / MED_INDEX_PAGE_SIZE) };
    });
    if (other > 0) {
      buckets.push({
        letter: "0–9",
        slug: MED_OTHER_SLUG,
        count: other,
        pages: Math.ceil(other / MED_INDEX_PAGE_SIZE),
      });
    }

    const total = buckets.reduce((s, b) => s + b.count, 0);
    return { buckets, total };
  });
}

const SELECT_ROW = {
  slug: true, nom: true, dci: true, dosage: true, forme: true,
  ppv: true, prixBR: true, tauxRemboursement: true,
} as const;

function toRow(m: {
  slug: string; nom: string; dci: string | null; dosage: string | null; forme: string | null;
  ppv: unknown; prixBR: unknown; tauxRemboursement: string | null;
}): MedRow {
  const ppv = decToNum(m.ppv as never);
  const base = decToNum(m.prixBR as never);
  return {
    slug: m.slug,
    nom: m.nom,
    dci: m.dci,
    dosage: m.dosage,
    forme: m.forme,
    ppv,
    base,
    taux: m.tauxRemboursement,
    ecart: ppv != null && base != null && ppv > base ? Math.round((ppv - base) * 100) / 100 : null,
  };
}

/** Médicaments d'une lettre, page par page, triés par nom. */
export function getMedByLetter(letterSlug: string, page: number) {
  const p = Math.max(1, page || 1);
  return cachedQuery(`med:rembt:list:${letterSlug}:${p}`, TTL.STATIC, async () => {
    const isOther = letterSlug === MED_OTHER_SLUG;
    const rows = await prisma.medication.findMany({
      where: isOther
        ? {
            isActive: true,
            // Aucune initiale A–Z : le complément exact des 26 lettres.
            AND: MED_LETTERS.map((l) => ({ NOT: { nom: { startsWith: l, mode: "insensitive" as const } } })),
          }
        : { isActive: true, nom: { startsWith: letterSlug.toUpperCase(), mode: "insensitive" as const } },
      select: SELECT_ROW,
      orderBy: [{ nom: "asc" }],
      take: MED_INDEX_PAGE_SIZE,
      skip: (p - 1) * MED_INDEX_PAGE_SIZE,
    });
    return { rows: rows.map(toRow) };
  });
}

/** URL d'une page d'index (page 1 sans suffixe → une seule URL canonique). */
export function medIndexPath(letterSlug: string, page = 1) {
  return `/remboursement-amo-cnss/medicaments/${letterSlug}${page > 1 ? `/${page}` : ""}`;
}

export const MED_HUB_PATH = "/remboursement-amo-cnss/medicaments";
