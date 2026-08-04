import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";
import { PRATICIENS_PAGE_SIZE } from "@/lib/praticiens-query";

/**
 * Index alphabétique par ville — la charpente de crawl du répertoire.
 *
 * POURQUOI. Les listings de ville sont des pages STATIQUES qui ne lisent jamais
 * `searchParams` : la pagination vit côté client, donc `?page=N` sert le HTML de
 * la page 1. Résultat, aucun lien HTML ne mène aux praticiens au-delà de la
 * première page (5 374 fiches pour Casablanca). Le sitemap seul les découvrait.
 *
 * Ces pages d'index remplacent la chaîne de pagination comme chemin de crawl :
 * légères (des liens, pas des cartes), denses, et toutes à UN clic de la page
 * ville — jamais en chaîne. Une fiche est ainsi à 3 clics de l'accueil pour les
 * villes liées depuis la home.
 */

/**
 * Une ville n'a d'index que si son listing dépasse une page : en dessous, la
 * page 1 montre déjà tout le monde et l'index n'apporterait rien.
 *
 * DÉRIVÉ de la taille de page, et non codé en dur : toute fiche au-delà de la
 * page 1 n'a AUCUN lien HTML sans index. Si la taille de page baisse, le seuil
 * doit suivre automatiquement, sinon les villes situées entre l'ancien et le
 * nouveau seuil reperdent silencieusement le chemin de crawl de leurs fiches.
 */
export const ALPHA_MIN_CITY_DOCTORS = PRATICIENS_PAGE_SIZE;

/**
 * Entrées par page d'index. Les noms marocains sont très concentrés sur quelques
 * initiales (Ben-, El-, Al-) : à Casablanca la lettre B pèse 1 115 praticiens à
 * elle seule. Sans découpage, une page d'index porterait 1 115 liens.
 */
export const ALPHA_INDEX_PAGE_SIZE = 300;

/**
 * Sous ce nombre de praticiens, une page de lettre passe en `noindex, follow` :
 * elle reste crawlée (les liens sont suivis, la découverte est préservée) mais
 * n'ajoute pas une page quasi vide à l'index — c'est exactement le signal
 * « faible valeur » qu'on cherche à éviter.
 */
export const ALPHA_MIN_INDEXABLE = 10;

export const ALPHA_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export type LetterBucket = {
  /** Initiale en majuscule, telle qu'affichée. */
  letter: string;
  /** Segment d'URL (minuscule). */
  slug: string;
  /** Nombre de praticiens actifs dont le nom commence par cette lettre. */
  count: number;
  /** Nombre de pages d'index pour cette lettre. */
  pages: number;
};

export type AlphaEntry = {
  slug: string;
  name: string;
  specialty: string;
  adresse: string;
};

/**
 * Répartition des praticiens actifs d'une ville par initiale du NOM.
 *
 * Le `nom` est garanti non vide et alphabétique en base (vérifié : 0 praticien
 * actif sans nom, 0 initiale hors A–Z), donc `startsWith` couvre l'intégralité
 * du référentiel — aucune fiche ne tombe hors de l'index. La somme des buckets
 * est renvoyée à part pour que l'appelant puisse le contrôler.
 */
export function getCityLetterBuckets(citySlug: string) {
  return cachedQuery(`ville:alpha:buckets:${citySlug}`, 3600, async () => {
    const rows = await prisma.$queryRaw<{ letter: string; n: bigint }[]>`
      SELECT upper(left(d.nom, 1)) AS letter, count(*) AS n
        FROM doctors d
        JOIN cities c ON c.id = d."cityId"
       WHERE d."isActive" = true AND c.slug = ${citySlug}
       GROUP BY 1
    `;

    const counts = new Map<string, number>();
    for (const r of rows) {
      const letter = r.letter?.toUpperCase() ?? "";
      if (ALPHA_LETTERS.includes(letter)) counts.set(letter, Number(r.n));
    }

    const buckets: LetterBucket[] = ALPHA_LETTERS.filter((l) => (counts.get(l) ?? 0) > 0).map((l) => {
      const count = counts.get(l) ?? 0;
      return { letter: l, slug: l.toLowerCase(), count, pages: Math.ceil(count / ALPHA_INDEX_PAGE_SIZE) };
    });

    const total = buckets.reduce((s, b) => s + b.count, 0);
    return { buckets, total };
  });
}

/** Praticiens d'une ville pour une initiale donnée, page par page, triés par nom. */
export function getCityLetterDoctors(citySlug: string, letter: string, page: number) {
  const L = letter.toUpperCase();
  const p = Math.max(1, page || 1);
  return cachedQuery(`ville:alpha:list:${citySlug}:${L}:${p}`, 3600, async () => {
    const rows = await prisma.doctor.findMany({
      where: { isActive: true, city: { slug: citySlug }, nom: { startsWith: L, mode: "insensitive" } },
      select: {
        slug: true, civilite: true, prenom: true, nom: true, adresse: true,
        specialty: { select: { name: true } },
      },
      orderBy: [{ nom: "asc" }, { prenom: "asc" }],
      take: ALPHA_INDEX_PAGE_SIZE,
      skip: (p - 1) * ALPHA_INDEX_PAGE_SIZE,
    });

    // Newlines/tabs retirés : un \n littéral dans un chunk RSC casse le <script>
    // qui l'enrobe (même précaution que lib/praticiens-query).
    const clean = (s: string | null) => (s ?? "").replace(/[\r\n\t\x00-\x1F\x7F]+/g, " ").trim();

    const entries: AlphaEntry[] = rows
      .filter((d): d is typeof d & { slug: string } => !!d.slug)
      .map((d) => ({
        slug: d.slug,
        name: [clean(d.civilite), clean(d.prenom), clean(d.nom)].filter(Boolean).join(" "),
        specialty: clean(d.specialty.name),
        adresse: clean(d.adresse),
      }));

    return { entries };
  });
}

/**
 * Villes éligibles à un index alphabétique (listing de plus d'une page).
 *
 * Le SEUIL fait partie de la clé de cache : il dérive de PRATICIENS_PAGE_SIZE,
 * donc une modification de la taille de page doit invalider cette liste
 * immédiatement. Sans cela, le Data Cache (durable, persistant entre builds)
 * resservirait pendant 1 h la liste calculée à l'ancien seuil — et les villes
 * nouvellement éligibles resteraient sans index, donc leurs fiches de page 2+
 * sans aucun chemin de lien.
 */
export function getAlphaIndexCities() {
  return cachedQuery(`ville:alpha:cities:min${ALPHA_MIN_CITY_DOCTORS}`, 3600, async () => {
    const rows = await prisma.city.findMany({
      select: { slug: true, _count: { select: { doctors: { where: { isActive: true } } } } },
    });
    return rows
      .filter((c) => c._count.doctors > ALPHA_MIN_CITY_DOCTORS)
      .map((c) => ({ slug: c.slug, count: c._count.doctors }));
  });
}

/**
 * Toutes les pages d'index INDEXABLES du site, en UNE requête et SANS cache.
 *
 * Réservé au sitemap : la route porte déjà son propre ISR de 24 h. Passer par
 * `cachedQuery` (TTL 1 h) y abaisserait le TTL de la route entière, et les ~13
 * requêtes lourdes de `coreEntries` tourneraient 24 fois plus souvent.
 */
export async function getAlphaIndexSitemapPaths(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ city: string; letter: string; n: bigint }[]>`
    SELECT c.slug AS city, upper(left(d.nom, 1)) AS letter, count(*) AS n
      FROM doctors d
      JOIN cities c ON c.id = d."cityId"
     WHERE d."isActive" = true
     GROUP BY 1, 2
  `;

  // Total par ville, pour n'garder que celles dont le listing dépasse une page.
  const cityTotals = new Map<string, number>();
  for (const r of rows) cityTotals.set(r.city, (cityTotals.get(r.city) ?? 0) + Number(r.n));

  const paths: string[] = [];
  for (const r of rows) {
    if ((cityTotals.get(r.city) ?? 0) <= ALPHA_MIN_CITY_DOCTORS) continue;
    const letter = (r.letter ?? "").toUpperCase();
    if (!ALPHA_LETTERS.includes(letter)) continue;
    const count = Number(r.n);
    if (count < ALPHA_MIN_INDEXABLE) continue; // page en noindex → pas advertisée
    const pages = Math.ceil(count / ALPHA_INDEX_PAGE_SIZE);
    for (let p = 1; p <= pages; p++) paths.push(alphaIndexPath(r.city, letter.toLowerCase(), p));
  }
  return paths;
}

/** URL d'une page d'index (page 1 sans suffixe → une seule URL canonique par lettre). */
export function alphaIndexPath(citySlug: string, letterSlug: string, page = 1) {
  return `/villes/${citySlug}/annuaire/${letterSlug}${page > 1 ? `/${page}` : ""}`;
}
