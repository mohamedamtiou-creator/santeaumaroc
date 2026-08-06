import { prisma } from "@/lib/prisma";
import { TTL } from "@/lib/cache-ttl";
import { cachedQuery } from "@/lib/cache";

export type SpecialtyCity = { slug: string; name: string; _count: { doctors: number } };

/**
 * Effectif minimal pour qu'un combo spécialité × ville mérite l'index.
 *
 * SOURCE UNIQUE de ce seuil. Il gouverne TROIS décisions qui doivent rester
 * cohérentes, faute de quoi on paie pour des pages que Google ne prend pas :
 *   1. `robots` de la page      (`specialites/[slug]/[ville]/page.tsx`) — sous le
 *      seuil, la page est servie en `noindex, follow` (near-duplicate) ;
 *   2. le sitemap               (`app/sitemap.ts`) — on n'advertise jamais une
 *      URL qu'on sert en noindex ;
 *   3. `generateStaticParams`   (même page) — c'est celle qui manquait.
 *
 * Le point 3 était le trou : 1 396 combos étaient PRÉ-RENDUS au build (19 012
 * objets ISR, 809 Mo côté FR seul, le double avec l'arabe) alors que le sitemap
 * n'en déclarait qu'une partie. On payait la génération, le stockage et la
 * revalidation de pages explicitement marquées noindex.
 *
 * Les combos sous le seuil restent JOIGNABLES : `dynamicParams` est actif par
 * défaut, donc ils sont générés à la demande à la première visite. Rien ne
 * disparaît pour le crawl ni pour l'utilisateur — seul le pré-rendu systématique
 * au build est supprimé.
 */
export const MIN_INDEXABLE_COMBO_DOCTORS = 3;

/**
 * Combos (spécialité, ville) qui atteignent le seuil d'indexabilité.
 *
 * Un `groupBy` unique, partagé par `generateStaticParams` et le sitemap — ils ne
 * peuvent donc plus diverger. Remplace côté page un `findMany({ distinct })` qui
 * remontait TOUS les couples, y compris ceux à un seul médecin.
 */
export async function indexableCombos(): Promise<{ slug: string; ville: string }[]> {
  const [grouped, specialties, cities] = await Promise.all([
    prisma.doctor.groupBy({
      by: ["specialtyId", "cityId"],
      where: { isActive: true },
      _count: { _all: true },
    }),
    prisma.specialty.findMany({ select: { id: true, slug: true } }),
    prisma.city.findMany({ select: { id: true, slug: true } }),
  ]);

  const specSlug = new Map(specialties.map((s) => [s.id, s.slug]));
  const citySlug = new Map(cities.map((c) => [c.id, c.slug]));

  const combos: { slug: string; ville: string }[] = [];
  for (const g of grouped) {
    if (g._count._all < MIN_INDEXABLE_COMBO_DOCTORS) continue;
    const s = specSlug.get(g.specialtyId);
    const c = citySlug.get(g.cityId);
    if (s && c) combos.push({ slug: s, ville: c });
  }
  return combos;
}

/**
 * Villes ayant des médecins actifs pour une spécialité, triées par effectif décroissant.
 *
 * PERF (cf. audit) : remplace un `city.findMany` avec `_count` filtré +
 * `orderBy: { doctors: { _count } }` — qui génère une SOUS-REQUÊTE CORRÉLÉE par
 * ville (~143×, mesuré à 52,9 ms / 11k buffers) — par un seul `groupBy` agrégé
 * puis une résolution des noms en `id IN (...)`.
 *
 * Cache DURABLE par slug SEUL (indépendant des filtres ville/tri/page) → bien
 * plus de cache-hits que l'ancienne version qui recalculait par combinaison, et
 * survit aux cold starts serverless (Data Cache, contrairement à processCache seul).
 */
export function specialtyCityCounts(slug: string): Promise<SpecialtyCity[]> {
  return cachedQuery(`specialite:cities:${slug}`, TTL.DIRECTORY, async () => {
    const groups = await prisma.doctor.groupBy({
      by: ["cityId"],
      where: { isActive: true, specialty: { slug } },
      _count: { cityId: true },
      orderBy: { _count: { cityId: "desc" } },
    });
    if (groups.length === 0) return [];
    const rows = await prisma.city.findMany({
      where: { id: { in: groups.map((g) => g.cityId) } },
      select: { id: true, slug: true, name: true },
    });
    const byId = new Map(rows.map((c) => [c.id, c] as const));
    // flatMap + garde : ignore une ville introuvable sans casser l'ordre du tri.
    return groups.flatMap((g) => {
      const c = byId.get(g.cityId);
      return c ? [{ slug: c.slug, name: c.name, _count: { doctors: g._count.cityId } }] : [];
    });
  });
}
