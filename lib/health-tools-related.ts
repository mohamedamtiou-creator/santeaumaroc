import "server-only";
import { TTL } from "@/lib/cache-ttl";
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

const NO_RELATED: ToolRelated = { topics: [], exams: [], specialty: null, altSpecialties: [] };

export async function getToolRelated(slug: ToolSlug, locale: Locale): Promise<ToolRelated> {
  const def = TOOLS[slug];

  try {
    return await cachedQuery(
      `tools:related:${slug}:${locale}`,
      TTL.DIRECTORY,
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
  } catch (e) {
    // Le maillage est un BONUS : le calculateur, la table de référence, la méthode
    // de calcul et les limites sont entièrement statiques et n'ont aucun besoin de
    // la base. Laisser remonter l'erreur faisait basculer toute la page sur
    // `error.tsx` — on perdait l'outil lui-même parce que des liens connexes
    // manquaient. On dégrade donc : liens en moins, page intacte.
    //
    // ⚠️ Le `catch` est DEHORS de `cachedQuery`, volontairement : à l'intérieur, le
    // repli vide serait mis en cache pour 3600 s et une coupure de quelques
    // secondes priverait la page de son maillage pendant une heure. Ici, `fn` a
    // déjà échoué sans rien écrire en cache → la requête suivante réessaie.
    console.error(`[tools] maillage indisponible pour ${slug}/${locale}`, e);
    return NO_RELATED;
  }
}
