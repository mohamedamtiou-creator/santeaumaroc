import "server-only";
import { cachedQuery } from "@/lib/cache";
import type { Locale } from "@/lib/i18n";
import {
  resolveExams,
  resolveSpecialties,
  resolveTopics,
  type ResolvedItem,
  type ResolvedSpecialty,
} from "@/lib/health-content-resolve";
import { TOOLS, type ToolSlug } from "@/lib/health-tools";

/**
 * Maillage d'une page outil vers le catalogue existant.
 *
 * Les slugs liés déclarés dans `lib/health-tools.ts` sont RÉSOLUS EN BASE via
 * `health-content-resolve` (verrous YMYL partagés) : un slug absent, non publié
 * ou non relu est simplement ignoré. C'est ce qui garantit zéro lien mort quand
 * le catalogue bouge, et un maillage qui s'enrichit tout seul à mesure que de
 * nouvelles fiches sont approuvées.
 */

export type { ResolvedItem as RelatedItem, ResolvedSpecialty as RelatedSpecialty };

export type ToolRelated = {
  topics: ResolvedItem[];
  exams: ResolvedItem[];
  specialty: ResolvedSpecialty | null;
  altSpecialties: ResolvedSpecialty[];
};

export function getToolRelated(slug: ToolSlug, locale: Locale): Promise<ToolRelated> {
  const def = TOOLS[slug];

  return cachedQuery(
    `tools:related:${slug}:${locale}`,
    3600,
    async () => {
      const [topics, exams, specialties] = await Promise.all([
        resolveTopics(def.topicSlugs, locale),
        resolveExams(def.examSlugs, locale),
        resolveSpecialties([def.specialtySlug, ...def.altSpecialtySlugs], locale),
      ]);

      // `resolveSpecialties` respecte l'ordre demandé : la principale d'abord.
      const specialty = specialties.find((s) => s.slug === def.specialtySlug) ?? null;
      const altSpecialties = specialties.filter((s) => s.slug !== def.specialtySlug);

      return { topics, exams, specialty, altSpecialties };
    },
    ["tools-related", "health-topics", "medical-exams"],
  );
}
