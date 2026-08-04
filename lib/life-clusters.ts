import type { ToolSlug } from "./health-tools";

/**
 * Clusters « parcours de vie » — grossesse, nutrition, santé de l'enfant,
 * vaccination.
 *
 * Le catalogue du site est rangé par nomenclature médicale (un symptôme, une
 * maladie, un examen). Or personne ne cherche « diabète gestationnel » puis
 * « échographie » puis « dépression post-partum » : on cherche « grossesse ».
 * Ces hubs recomposent l'existant selon le parcours du patient.
 *
 * Règle de conception : un hub n'écrit AUCUN contenu médical propre. Il agrège
 * des fiches déjà relues et n'affiche que leur intitulé — jamais leur texte —
 * pour ne pas se mettre en concurrence avec elles (anti-cannibalisation). Le seul
 * contenu original du hub est éditorial : introduction, titres de sections et
 * FAQ, dans `lib/life-clusters-content.ts`.
 *
 * Tous les slugs référencés ici ont été vérifiés en base ; ceux qui
 * disparaîtraient seraient de toute façon ignorés à la résolution.
 */

export const CLUSTER_SLUGS = ["grossesse", "nutrition", "sante-enfant", "vaccination"] as const;

export type ClusterSlug = (typeof CLUSTER_SLUGS)[number];

export function isClusterSlug(v: string): v is ClusterSlug {
  return (CLUSTER_SLUGS as readonly string[]).includes(v);
}

/** Une entrée de section : le type détermine la table et le hub de destination. */
export type ClusterItem =
  | { kind: "topic"; slug: string }
  | { kind: "exam"; slug: string }
  | { kind: "treatment"; slug: string }
  | { kind: "post"; slug: string }
  | { kind: "tool"; slug: ToolSlug };

export type ClusterSection = {
  /** Clé stable → titre et chapô dans le contenu localisé. */
  key: string;
  items: readonly ClusterItem[];
};

export type LifeCluster = {
  slug: ClusterSlug;
  sections: readonly ClusterSection[];
  /** Spécialités du bloc de conversion, la première portant le CTA principal. */
  specialtySlugs: readonly string[];
  /** Spécialité servant au rail « dans votre ville » (combos spé × ville). */
  citySpecialtySlug: string;
  /** Autres clusters mis en avant en pied de page (maillage horizontal). */
  siblingSlugs: readonly ClusterSlug[];
  /** Date ISO de relecture éditoriale du hub (E-E-A-T, `lastReviewed`). */
  reviewed: string;
};

const REVIEWED = "2026-08-02";

const topic = (slug: string): ClusterItem => ({ kind: "topic", slug });
const exam = (slug: string): ClusterItem => ({ kind: "exam", slug });
const treatment = (slug: string): ClusterItem => ({ kind: "treatment", slug });
const post = (slug: string): ClusterItem => ({ kind: "post", slug });
const tool = (slug: ToolSlug): ClusterItem => ({ kind: "tool", slug });

export const CLUSTERS: Record<ClusterSlug, LifeCluster> = {
  grossesse: {
    slug: "grossesse",
    sections: [
      {
        key: "avant",
        items: [
          tool("ovulation"),
          topic("contraception"),
          topic("infertilite-feminine"),
          topic("infertilite-masculine"),
          topic("syndrome-des-ovaires-polykystiques"),
          topic("regles-irregulieres"),
          topic("absence-de-regles"),
          exam("test-grossesse"),
        ],
      },
      {
        key: "suivi",
        items: [
          tool("date-accouchement"),
          tool("semaines-grossesse"),
          post("suivi-grossesse-maroc"),
          exam("echographie"),
          exam("prise-de-sang"),
          exam("analyse-urine"),
          exam("amniocentese"),
        ],
      },
      {
        key: "complications",
        items: [
          topic("diabete-gestationnel"),
          post("anemie-grossesse-maroc"),
          topic("carence-en-fer"),
          topic("infection-urinaire"),
          post("thyroide-grossesse-maroc"),
          topic("hypertension-arterielle"),
          topic("toxoplasmose"),
          topic("fausse-couche"),
        ],
      },
      {
        key: "inconforts",
        items: [
          topic("nausees-et-vomissements"),
          topic("reflux-gastro-oesophagien"),
          topic("constipation"),
          post("hemorroides-grossesse-maroc"),
          topic("hemorroides"),
          topic("varices"),
          topic("jambes-gonflees"),
          topic("mal-de-dos"),
          topic("insomnie"),
        ],
      },
      {
        key: "apres",
        items: [
          topic("depression-post-partum"),
          post("allaitement-maroc"),
          topic("mastite"),
          topic("coliques-du-nourrisson"),
          topic("diarrhee-du-nourrisson"),
          topic("bronchiolite"),
        ],
      },
    ],
    specialtySlugs: ["gyneco-obstetrique", "sage-femme", "pediatrie"],
    citySpecialtySlug: "gyneco-obstetrique",
    siblingSlugs: ["sante-enfant", "nutrition", "vaccination"],
    reviewed: REVIEWED,
  },

  nutrition: {
    slug: "nutrition",
    sections: [
      {
        key: "poids",
        items: [
          tool("calcul-imc"),
          tool("tour-de-taille"),
          tool("calcul-calories"),
          topic("obesite"),
          topic("prise-de-poids-inexpliquee"),
          topic("perte-de-poids-inexpliquee"),
          topic("denutrition"),
          topic("troubles-du-comportement-alimentaire"),
        ],
      },
      {
        key: "chroniques",
        items: [
          tool("risque-diabete"),
          topic("diabete"),
          post("alimentation-diabete-cuisine-marocaine"),
          post("diabete-ramadan-jeune-maroc"),
          topic("hypercholesterolemie"),
          post("cholesterol-alimentation-maroc"),
          topic("hypertension-arterielle"),
          post("alimentation-anti-hypertension-maroc"),
          topic("goutte"),
          post("alimentation-goutte-maroc"),
          topic("steatose-hepatique"),
          topic("insuffisance-renale"),
          post("insuffisance-renale-alimentation-maroc"),
          treatment("traitement-diabete-type-2"),
          treatment("traitement-hypercholesterolemie"),
        ],
      },
      {
        key: "digestion",
        items: [
          topic("intolerance-au-lactose"),
          topic("maladie-coeliaque"),
          topic("syndrome-de-l-intestin-irritable"),
          topic("ballonnements"),
          topic("constipation"),
          post("reflux-alimentation-mesures-maroc"),
          topic("allergie-alimentaire"),
          post("allergie-alimentaire-maroc"),
          exam("test-allergie"),
        ],
      },
      {
        key: "carences",
        items: [
          topic("carence-en-fer"),
          post("aliments-riches-en-fer-maroc"),
          topic("anemie"),
          topic("carence-en-vitamine-d"),
          topic("osteoporose"),
          exam("prise-de-sang"),
          treatment("traitement-anemie-ferriprive"),
        ],
      },
      {
        key: "quotidien",
        items: [
          tool("besoins-en-eau"),
          post("alimentation-mediterraneenne-maroc"),
          post("nutrition-personne-agee-maroc"),
          tool("frequence-cardiaque"),
          topic("coup-de-chaleur"),
          topic("calculs-renaux"),
        ],
      },
    ],
    specialtySlugs: ["nutrition", "dietetique", "endocrinologie-et-maladies-metaboliques"],
    citySpecialtySlug: "nutrition",
    siblingSlugs: ["grossesse", "sante-enfant", "vaccination"],
    reviewed: REVIEWED,
  },

  "sante-enfant": {
    slug: "sante-enfant",
    sections: [
      {
        key: "frequents",
        items: [
          topic("fievre-chez-l-enfant"),
          post("fievre-enfant-que-faire-maroc"),
          tool("dose-paracetamol"),
          topic("toux-chez-l-enfant"),
          topic("angine"),
          topic("otite"),
          topic("bronchiolite"),
          post("bronchiolite-nourrisson-maroc"),
          topic("gastro-enterite"),
          post("diarrhee-enfant-gastro-maroc"),
          topic("diarrhee-du-nourrisson"),
          topic("coliques-du-nourrisson"),
          topic("conjonctivite"),
          topic("oxyurose"),
          treatment("traitement-otite"),
          treatment("traitement-angine"),
        ],
      },
      {
        key: "eruptions",
        items: [
          topic("varicelle"),
          topic("roseole"),
          topic("rougeole"),
          topic("rubeole"),
          topic("oreillons"),
          topic("impetigo"),
          topic("eruption-cutanee"),
          topic("teigne"),
        ],
      },
      {
        key: "croissance",
        items: [
          post("developpement-croissance-enfant-maroc"),
          topic("retard-de-croissance"),
          post("sommeil-enfant-maroc"),
          topic("enuresie"),
          topic("autisme"),
          topic("tdah"),
          topic("strabisme"),
          topic("myopie"),
          topic("perte-d-audition"),
          topic("dents-mal-alignees"),
          exam("audiogramme"),
        ],
      },
      {
        key: "alimentation",
        items: [
          post("alimentation-bebe-diversification-maroc"),
          post("reflux-nourrisson-maroc"),
          topic("allergie-alimentaire"),
          topic("intolerance-au-lactose"),
          topic("carence-en-fer"),
          topic("carence-en-vitamine-d"),
        ],
      },
      {
        key: "chroniques",
        items: [
          topic("asthme"),
          post("asthme-enfant-maroc"),
          topic("eczema"),
          topic("rhinite-allergique"),
          topic("epilepsie"),
          topic("drepanocytose"),
          topic("thalassemie"),
          treatment("traitement-asthme"),
          treatment("traitement-eczema"),
        ],
      },
      {
        key: "prevention",
        items: [
          tool("calendrier-vaccinal"),
          post("calendrier-vaccinal-enfant-maroc"),
          post("choisir-pediatre-suivi-enfant-maroc"),
          post("sante-enfant-guide-maroc"),
        ],
      },
    ],
    specialtySlugs: ["pediatrie", "neonatologie", "chirurgie-pediatrique"],
    citySpecialtySlug: "pediatrie",
    siblingSlugs: ["vaccination", "grossesse", "nutrition"],
    reviewed: REVIEWED,
  },

  vaccination: {
    slug: "vaccination",
    sections: [
      {
        key: "calendrier",
        items: [
          tool("calendrier-vaccinal"),
          post("calendrier-vaccinal-enfant-maroc"),
          post("vaccination-adulte-maroc"),
          post("vaccination-senior-maroc"),
        ],
      },
      {
        key: "enfance",
        items: [
          topic("rougeole"),
          topic("rubeole"),
          topic("oreillons"),
          topic("coqueluche"),
          topic("varicelle"),
          topic("meningite"),
          topic("tuberculose"),
          topic("hepatite-virale"),
        ],
      },
      {
        key: "adulte",
        items: [
          topic("grippe"),
          topic("covid-19"),
          topic("zona"),
          post("vaccin-zona-maroc"),
          topic("condylomes"),
          topic("hepatite-a"),
        ],
      },
      {
        key: "voyage",
        items: [
          topic("fievre-typhoide"),
          topic("hepatite-a"),
          topic("rage"),
          topic("diarrhee-du-voyageur"),
          topic("leishmaniose-cutanee"),
          topic("brucellose"),
        ],
      },
    ],
    specialtySlugs: ["medecine-generale", "pediatrie", "maladies-infectieuses"],
    citySpecialtySlug: "medecine-generale",
    siblingSlugs: ["sante-enfant", "grossesse", "nutrition"],
    reviewed: REVIEWED,
  },
};

export const CLUSTER_LIST: readonly LifeCluster[] = CLUSTER_SLUGS.map((s) => CLUSTERS[s]);
