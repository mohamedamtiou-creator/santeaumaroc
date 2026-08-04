import "server-only";
import { cachedQuery } from "@/lib/cache";
import type { Locale } from "@/lib/i18n";
import {
  resolveExams,
  resolvePosts,
  resolveSpecialties,
  resolveTopics,
  resolveTreatments,
  type ResolvedItem,
  type ResolvedSpecialty,
} from "@/lib/health-content-resolve";
import { specialtyCityCounts } from "@/lib/specialty-cities";
import type { ClusterItem, ClusterSlug, LifeCluster } from "@/lib/life-clusters";
import { CLUSTERS } from "@/lib/life-clusters";
import type { ToolSlug } from "@/lib/health-tools";

/**
 * Résolution d'un cluster de parcours de vie.
 *
 * Toutes les entrées déclarées (fiches, examens, traitements, guides) sont
 * résolues en QUATRE requêtes groupées, quel que soit le nombre de sections,
 * puis réparties dans les sections d'origine en conservant l'ordre déclaré. Les
 * outils ne coûtent rien : ils viennent du registre statique.
 *
 * Ce qui n'est pas résolu disparaît : une section vidée de ses entrées n'est pas
 * rendue (pas de titre orphelin), et le compteur affiché ne promet que ce qui
 * existe vraiment.
 */

export type ClusterEntry =
  | { kind: "tool"; slug: ToolSlug }
  | { kind: "topic" | "exam" | "treatment" | "post"; item: ResolvedItem };

export type ClusterResolvedSection = {
  key: string;
  entries: ClusterEntry[];
};

export type ClusterCity = { slug: string; name: string; doctors: number };

export type ResolvedCluster = {
  sections: ClusterResolvedSection[];
  specialties: ResolvedSpecialty[];
  cities: ClusterCity[];
  /** Nombre de contenus du catalogue effectivement reliés (outils exclus). */
  contentCount: number;
};

/** Nombre de villes affichées dans le rail « près de chez vous ». */
const CITY_LIMIT = 8;

/** Seuil de densité repris des combos spécialité × ville : sous 3 praticiens, la
 *  page cible est servie en `noindex` — inutile de lui envoyer du jus. */
const CITY_MIN_DOCTORS = 3;

const slugsOf = (cluster: LifeCluster, kind: ClusterItem["kind"]): string[] => {
  const out: string[] = [];
  for (const section of cluster.sections) {
    for (const item of section.items) {
      if (item.kind === kind && !out.includes(item.slug)) out.push(item.slug);
    }
  }
  return out;
};

/**
 * Ne met en cache QUE ce qui vient de la base.
 *
 * Les entrées « outil » viennent du registre statique : les inclure dans le
 * cache signifierait qu'ajouter un outil à un dossier n'apparaît qu'après
 * expiration du TTL (jusqu'à une heure après le déploiement). L'assemblage des
 * sections se fait donc HORS cache, à chaque rendu — il ne coûte rien.
 */
function getResolvedContent(slug: ClusterSlug, locale: Locale) {
  const cluster = CLUSTERS[slug];
  return cachedQuery(
    `cluster:content:${slug}:${locale}`,
    3600,
    async () => {
      const [topics, exams, treatments, posts, specialties, cityRows] = await Promise.all([
        resolveTopics(slugsOf(cluster, "topic"), locale),
        resolveExams(slugsOf(cluster, "exam"), locale),
        resolveTreatments(slugsOf(cluster, "treatment"), locale),
        resolvePosts(slugsOf(cluster, "post"), locale),
        resolveSpecialties(cluster.specialtySlugs, locale),
        specialtyCityCounts(cluster.citySpecialtySlug),
      ]);
      const cities = cityRows
        .filter((c) => c._count.doctors >= CITY_MIN_DOCTORS)
        .slice(0, CITY_LIMIT)
        .map((c) => ({ slug: c.slug, name: c.name, doctors: c._count.doctors }));
      return { topics, exams, treatments, posts, specialties, cities };
    },
    ["life-clusters", "health-topics", "medical-exams", "posts"],
  );
}

export async function getCluster(slug: ClusterSlug, locale: Locale): Promise<ResolvedCluster> {
  const cluster = CLUSTERS[slug];
  const { topics, exams, treatments, posts, specialties, cities } = await getResolvedContent(slug, locale);

  const byKind = {
    topic: new Map(topics.map((i) => [i.slug, i] as const)),
    exam: new Map(exams.map((i) => [i.slug, i] as const)),
    treatment: new Map(treatments.map((i) => [i.slug, i] as const)),
    post: new Map(posts.map((i) => [i.slug, i] as const)),
  };

  let contentCount = 0;
  const sections: ClusterResolvedSection[] = [];
  for (const section of cluster.sections) {
    const entries: ClusterEntry[] = [];
    for (const item of section.items) {
      if (item.kind === "tool") {
        entries.push({ kind: "tool", slug: item.slug });
        continue;
      }
      const resolved = byKind[item.kind].get(item.slug);
      if (resolved) {
        entries.push({ kind: item.kind, item: resolved });
        contentCount++;
      }
    }
    if (entries.length > 0) sections.push({ key: section.key, entries });
  }

  return { sections, specialties, cities, contentCount };
}
