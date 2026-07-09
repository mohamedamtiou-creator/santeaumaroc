import { prisma } from "@/lib/prisma";
import { processCache } from "@/lib/process-cache";

export type SpecialtyCity = { slug: string; name: string; _count: { doctors: number } };

/**
 * Villes ayant des médecins actifs pour une spécialité, triées par effectif décroissant.
 *
 * PERF (cf. audit) : remplace un `city.findMany` avec `_count` filtré +
 * `orderBy: { doctors: { _count } }` — qui génère une SOUS-REQUÊTE CORRÉLÉE par
 * ville (~143×, mesuré à 52,9 ms / 11k buffers) — par un seul `groupBy` agrégé
 * puis une résolution des noms en `id IN (...)`.
 *
 * Cache in-process par slug SEUL (indépendant des filtres ville/tri/page) → bien
 * plus de cache-hits que l'ancienne version qui recalculait par combinaison.
 */
export function specialtyCityCounts(slug: string): Promise<SpecialtyCity[]> {
  return processCache(`specialite:cities:${slug}`, 3600, async () => {
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
