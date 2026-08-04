import { TOOLS, TOOL_SLUGS, type ToolSlug } from "./health-tools";

/**
 * Maillage RETOUR : catalogue → outils.
 *
 * Le registre `TOOLS` déclare déjà, pour chaque outil, les fiches et spécialités
 * auxquelles il se rattache. On l'inverse ici une fois pour toutes au chargement
 * du module : une fiche « obésité » sait ainsi quels calculateurs lui sont utiles
 * sans qu'aucune liste ne soit maintenue en double. Ajouter un outil au registre
 * crée automatiquement ses liens entrants.
 *
 * Module pur (aucun accès base) : les pages fiches l'appellent sans coût.
 */

/** Position déclarée = priorité éditoriale : plus la fiche est citée tôt par un
 *  outil, plus cet outil est central pour elle. À égalité, l'ordre du hub tranche. */
type Ranked = { tool: ToolSlug; rank: number; order: number };

function buildIndex(pick: (slug: ToolSlug) => readonly string[]): Map<string, ToolSlug[]> {
  const acc = new Map<string, Ranked[]>();
  TOOL_SLUGS.forEach((tool, order) => {
    pick(tool).forEach((key, rank) => {
      const list = acc.get(key);
      const entry = { tool, rank, order };
      if (list) list.push(entry);
      else acc.set(key, [entry]);
    });
  });

  const out = new Map<string, ToolSlug[]>();
  for (const [key, list] of acc) {
    out.set(
      key,
      list.sort((a, b) => a.rank - b.rank || a.order - b.order).map((e) => e.tool),
    );
  }
  return out;
}

const BY_TOPIC = buildIndex((t) => TOOLS[t].topicSlugs);
const BY_EXAM = buildIndex((t) => TOOLS[t].examSlugs);
const BY_SPECIALTY = buildIndex((t) => [TOOLS[t].specialtySlug, ...TOOLS[t].altSpecialtySlugs]);

/** Deux liens suffisent sur une fiche : au-delà, on dilue le PageRank interne et
 *  on noie le CTA de prise de rendez-vous, qui reste l'action principale. */
const DEFAULT_MAX = 2;

const lookup = (index: Map<string, ToolSlug[]>, slug: string, max: number) =>
  (index.get(slug) ?? []).slice(0, max);

/** Outils pertinents pour une fiche symptôme ou maladie (`HealthTopic.slug`). */
export const toolsForTopic = (slug: string, max = DEFAULT_MAX) => lookup(BY_TOPIC, slug, max);

/** Outils pertinents pour une fiche examen (`MedicalExam.slug`). */
export const toolsForExam = (slug: string, max = DEFAULT_MAX) => lookup(BY_EXAM, slug, max);

/** Outils pertinents pour un hub de spécialité — trois liens y sont légitimes,
 *  la page est un carrefour et non une fiche. */
export const toolsForSpecialty = (slug: string, max = 3) => lookup(BY_SPECIALTY, slug, max);
