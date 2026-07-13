/**
 * Seed des hubs symptômes (HealthTopic kind=SYMPTOM) — format triage structuré
 * pour l'extraction IA / featured snippet.
 *
 * ⚠️ GARDE-FOU YMYL : créés SANS `reviewedAt` → chaque page reste `noindex` et
 * hors sitemap jusqu'à relecture humaine. Contenu volontairement prudent et
 * générique (jamais de diagnostic). Ouvrir l'indexation après relecture via
 * scripts/symptoms-approve.ts. Idempotent (upsert par slug).
 *
 * Lancer :  npx tsx --env-file=.env scripts/seed-symptoms.ts
 */
import { prisma } from "@/lib/prisma";

type Faq = { q: string; a: string };
type Sym = {
  slug: string;
  term: string;
  shortAnswer: string;
  causes: string[];
  redFlags: string[];
  whenToConsult: string;
  synonyms?: string[];
  specialty?: string;
  related?: string[];
  glossary?: string[];
  faq?: Faq[];
};

const SYMPTOMS: Sym[] = [
  {
    slug: "mal-de-tete", term: "Mal de tête", synonyms: ["céphalée", "maux de tête"],
    specialty: "neurologie", glossary: ["cephalee", "migraine"], related: ["migraine-maroc"],
    shortAnswer: "Le mal de tête est une douleur ressentie au niveau du crâne ou de la nuque. Il est le plus souvent bénin (fatigue, tension, manque de sommeil), mais certaines caractéristiques doivent alerter. Sa cause se précise selon la localisation, l'intensité et les signes qui l'accompagnent.",
    causes: [
      "Céphalée de tension (stress, fatigue, posture)",
      "Migraine",
      "Manque de sommeil, déshydratation ou saut de repas",
      "Fièvre ou infection (rhume, sinusite)",
      "Excès d'écrans ou trouble de la vue non corrigé",
      "Consommation ou sevrage de caféine",
    ],
    redFlags: [
      "Mal de tête brutal et intense, « le pire de votre vie »",
      "Associé à fièvre élevée et raideur de la nuque",
      "Accompagné de troubles de la parole, de la vue, d'une faiblesse ou d'une confusion",
      "Après un traumatisme crânien",
      "Qui s'aggrave progressivement sur plusieurs jours",
    ],
    whenToConsult: "Consultez si les maux de tête sont fréquents, résistent aux antalgiques habituels, ou changent d'intensité et de rythme. Devant un signe d'alerte, l'avis médical doit être immédiat.",
    faq: [
      { q: "Quand un mal de tête est-il inquiétant ?", a: "Un mal de tête brutal et très intense, accompagné de fièvre avec raideur de la nuque, de troubles neurologiques (parole, vue, force) ou survenant après un choc à la tête doit conduire à consulter en urgence." },
      { q: "Quel médecin consulter pour des maux de tête récurrents ?", a: "Le médecin généraliste évalue en premier lieu. En cas de maux de tête chroniques ou de migraine, il peut orienter vers un neurologue." },
    ],
  },
  {
    slug: "fievre", term: "Fièvre", synonyms: ["hyperthermie", "température"],
    specialty: "medecine-generale", glossary: ["fievre"],
    shortAnswer: "La fièvre est une élévation de la température du corps au-dessus de 38 °C. C'est une réaction normale de l'organisme, le plus souvent à une infection. Elle n'est pas dangereuse en soi, mais son contexte et sa durée déterminent la conduite à tenir.",
    causes: [
      "Infection virale (rhume, grippe, gastro-entérite)",
      "Infection bactérienne (angine, infection urinaire…)",
      "Réaction après une vaccination",
      "Coup de chaleur ou forte déshydratation",
      "Poussée dentaire chez le nourrisson (fièvre modérée)",
    ],
    redFlags: [
      "Fièvre chez un nourrisson de moins de 3 mois",
      "Fièvre supérieure à 40 °C ou qui dure plus de 3 jours",
      "Associée à une raideur de la nuque, des taches sur la peau, ou une somnolence inhabituelle",
      "Difficulté à respirer ou déshydratation (bouche sèche, peu d'urines)",
      "Convulsions",
    ],
    whenToConsult: "Consultez si la fièvre persiste au-delà de 3 jours, est mal tolérée, ou touche un nourrisson, une personne âgée ou immunodéprimée. Les signes d'alerte imposent un avis rapide.",
    faq: [
      { q: "À partir de quelle température parle-t-on de fièvre ?", a: "On parle de fièvre à partir de 38 °C. Entre 37,5 et 38 °C, il s'agit d'une fébricule (fièvre légère)." },
      { q: "Faut-il faire baisser la fièvre systématiquement ?", a: "Non. La fièvre modérée aide l'organisme à lutter contre l'infection. On la traite surtout si elle est mal supportée, en s'hydratant bien et selon l'avis d'un professionnel de santé." },
    ],
  },
  {
    slug: "mal-de-ventre", term: "Mal de ventre", synonyms: ["douleur abdominale", "mal au ventre"],
    specialty: "gastro-enterologie", glossary: ["reflux-gastro-oesophagien"],
    shortAnswer: "Le mal de ventre désigne toute douleur ressentie dans l'abdomen. Très fréquent et le plus souvent bénin, il peut avoir de nombreuses causes digestives. Sa localisation, son intensité et les signes associés orientent vers son origine.",
    causes: [
      "Troubles digestifs (indigestion, ballonnements, constipation)",
      "Gastro-entérite virale",
      "Reflux gastro-œsophagien ou gastrite",
      "Règles douloureuses",
      "Stress et syndrome de l'intestin irritable",
    ],
    redFlags: [
      "Douleur intense et brutale, en coup de poignard",
      "Ventre dur, très sensible au toucher",
      "Associée à des vomissements répétés ou du sang dans les selles",
      "Fièvre élevée avec douleur localisée (par ex. en bas à droite)",
      "Absence d'émission de selles et de gaz avec ballonnement",
    ],
    whenToConsult: "Consultez si la douleur est intense, persiste plus de 48 heures, revient régulièrement ou s'accompagne de signes d'alerte. Une douleur brutale et intense justifie un avis en urgence.",
    faq: [
      { q: "Quand un mal de ventre nécessite-t-il d'aller aux urgences ?", a: "Une douleur brutale et intense, un ventre dur et très douloureux, des vomissements de sang ou du sang dans les selles, ou une douleur avec fièvre localisée à droite doivent amener à consulter en urgence." },
    ],
  },
  {
    slug: "toux", term: "Toux", synonyms: [],
    specialty: "pneumo-phtisiologie", related: ["asthme-maroc"],
    shortAnswer: "La toux est un réflexe qui protège les voies respiratoires en expulsant les sécrétions ou les irritants. Elle est le plus souvent liée à une infection virale bénigne. On distingue la toux sèche de la toux grasse, et la toux aiguë (récente) de la toux chronique (plus de 8 semaines).",
    causes: [
      "Infection virale des voies respiratoires (rhume, bronchite)",
      "Écoulement nasal postérieur (rhinite, sinusite)",
      "Asthme",
      "Reflux gastro-œsophagien",
      "Tabac ou irritants environnementaux",
    ],
    redFlags: [
      "Difficulté à respirer ou essoufflement au repos",
      "Crachats contenant du sang",
      "Toux avec fièvre élevée persistante",
      "Douleur thoracique importante",
      "Toux durant plus de 3 semaines sans amélioration",
    ],
    whenToConsult: "Consultez si la toux dure plus de 3 semaines, s'accompagne de fièvre persistante, d'essoufflement, de douleur thoracique ou de crachats sanglants.",
    faq: [
      { q: "Quelle différence entre toux sèche et toux grasse ?", a: "La toux sèche ne produit pas de sécrétions et est souvent irritative ; la toux grasse s'accompagne de crachats. Leur prise en charge peut différer : demandez conseil à un professionnel de santé." },
    ],
  },
  {
    slug: "mal-de-gorge", term: "Mal de gorge", synonyms: ["angine", "pharyngite"],
    specialty: "oto-rhino-laryngologie",
    shortAnswer: "Le mal de gorge est une douleur ou une irritation de la gorge, souvent majorée par la déglutition. Il est le plus souvent d'origine virale et guérit spontanément en quelques jours. Certaines angines sont bactériennes et peuvent nécessiter un traitement.",
    causes: [
      "Infection virale (rhume, pharyngite)",
      "Angine bactérienne (streptocoque)",
      "Air sec, tabac ou irritation",
      "Reflux gastro-œsophagien",
      "Allergie",
    ],
    redFlags: [
      "Difficulté à avaler sa salive ou à respirer",
      "Voix étouffée et bave (impossibilité d'avaler)",
      "Gonflement important du cou",
      "Fièvre élevée persistante",
      "Mal de gorge d'un seul côté, très intense",
    ],
    whenToConsult: "Consultez si le mal de gorge dure plus de 5 jours, s'accompagne de fièvre élevée, ou si vous avez du mal à avaler ou à respirer. Un test peut déterminer si l'angine est bactérienne.",
  },
  {
    slug: "douleur-thoracique", term: "Douleur à la poitrine", synonyms: ["douleur thoracique", "oppression thoracique"],
    specialty: "cardiologie", glossary: ["palpitations"],
    shortAnswer: "Une douleur à la poitrine peut avoir des causes bénignes (musculaire, digestive, anxiété) comme graves (cœur, poumons). Par prudence, toute douleur thoracique intense, prolongée ou inhabituelle doit être considérée comme une urgence jusqu'à preuve du contraire.",
    causes: [
      "Origine musculaire ou costale (après un effort, un faux mouvement)",
      "Reflux gastro-œsophagien",
      "Anxiété ou crise d'angoisse",
      "Cause cardiaque (angine de poitrine, infarctus)",
      "Cause pulmonaire (embolie, pleurésie)",
    ],
    redFlags: [
      "Douleur serrant la poitrine, irradiant vers le bras, la mâchoire ou le dos",
      "Associée à un essoufflement, des sueurs, des nausées ou un malaise",
      "Douleur intense et brutale",
      "Palpitations avec sensation de malaise",
      "Difficulté à respirer",
    ],
    whenToConsult: "Une douleur thoracique intense, oppressante ou accompagnée d'essoufflement, de sueurs ou d'irradiation vers le bras ou la mâchoire impose d'appeler immédiatement les secours (141 / 15).",
    faq: [
      { q: "Comment reconnaître une douleur cardiaque ?", a: "Une douleur en étau derrière le sternum, irradiant vers le bras gauche, la mâchoire ou le dos, avec essoufflement, sueurs ou malaise, évoque une cause cardiaque et nécessite d'appeler les secours sans attendre." },
    ],
  },
  {
    slug: "essoufflement", term: "Essoufflement", synonyms: ["dyspnée", "difficulté à respirer"],
    specialty: "pneumo-phtisiologie", glossary: ["dyspnee"], related: ["asthme-maroc"],
    shortAnswer: "L'essoufflement est une sensation de manquer d'air ou de respirer avec difficulté. À l'effort intense, il est normal ; au repos ou pour un effort minime, il doit alerter. Ses causes sont surtout respiratoires ou cardiaques.",
    causes: [
      "Effort physique intense (normal)",
      "Asthme ou bronchite",
      "Anémie",
      "Anxiété et hyperventilation",
      "Cause cardiaque (insuffisance cardiaque)",
    ],
    redFlags: [
      "Essoufflement soudain au repos",
      "Lèvres ou extrémités qui bleuissent",
      "Douleur thoracique associée",
      "Impossibilité de terminer une phrase",
      "Gonflement des jambes avec essoufflement",
    ],
    whenToConsult: "Un essoufflement d'apparition brutale, au repos, ou associé à une douleur thoracique est une urgence. Un essoufflement qui s'installe ou s'aggrave justifie une consultation rapide.",
  },
  {
    slug: "vertiges", term: "Vertiges", synonyms: ["étourdissements"],
    specialty: "oto-rhino-laryngologie", glossary: ["vertige"],
    shortAnswer: "Le vertige est une illusion de mouvement, souvent de rotation, de soi-même ou de l'environnement. Il traduit fréquemment un trouble de l'oreille interne, mais peut avoir une origine neurologique. Il s'accompagne parfois de nausées et de troubles de l'équilibre.",
    causes: [
      "Trouble de l'oreille interne (vertige positionnel, névrite)",
      "Baisse de tension ou hypoglycémie",
      "Effet de certains médicaments",
      "Anxiété",
      "Cause neurologique (plus rare)",
    ],
    redFlags: [
      "Vertige avec troubles de la parole, de la vue ou de la force",
      "Mal de tête intense et brutal associé",
      "Perte de connaissance",
      "Vertige après un traumatisme crânien",
      "Difficulté à marcher ou à tenir debout",
    ],
    whenToConsult: "Consultez si les vertiges sont intenses, répétés ou invalidants. Associés à des signes neurologiques, ils imposent un avis en urgence.",
  },
  {
    slug: "fatigue", term: "Fatigue", synonyms: ["asthénie", "épuisement"],
    specialty: "medecine-generale", glossary: ["anemie"], related: ["anemie-maroc"],
    shortAnswer: "La fatigue est une sensation de manque d'énergie. Passagère, elle est banale (manque de sommeil, surmenage). Persistante malgré le repos, elle peut révéler une cause médicale à explorer, comme une anémie ou un trouble de la thyroïde.",
    causes: [
      "Manque de sommeil ou surmenage",
      "Stress, anxiété ou dépression",
      "Anémie (carence en fer)",
      "Trouble de la thyroïde",
      "Infection récente ou chronique",
    ],
    redFlags: [
      "Fatigue intense d'installation rapide et inexpliquée",
      "Associée à une perte de poids importante",
      "Essoufflement ou pâleur marquée",
      "Fièvre prolongée",
      "Fatigue qui empêche les activités quotidiennes",
    ],
    whenToConsult: "Consultez si la fatigue persiste plusieurs semaines malgré un repos suffisant, ou s'accompagne d'autres symptômes (perte de poids, pâleur, essoufflement). Un bilan sanguin en recherche souvent la cause.",
  },
  {
    slug: "mal-de-dos", term: "Mal de dos", synonyms: ["lombalgie", "dorsalgie"],
    specialty: "rhumatologie", glossary: ["arthrose"], related: ["arthrose-maroc"],
    shortAnswer: "Le mal de dos, souvent lombaire, est très fréquent et le plus souvent bénin (« lumbago »). Il est généralement d'origine musculaire ou articulaire et évolue favorablement en quelques jours à semaines. Le maintien d'une activité douce est recommandé.",
    causes: [
      "Effort, faux mouvement ou port de charge",
      "Mauvaise posture prolongée",
      "Arthrose ou usure des articulations",
      "Hernie discale",
      "Stress et tensions musculaires",
    ],
    redFlags: [
      "Douleur après une chute ou un choc violent",
      "Associée à une perte de force ou un engourdissement d'une jambe",
      "Troubles pour uriner ou aller à la selle",
      "Fièvre ou perte de poids inexpliquée",
      "Douleur intense la nuit qui ne cède pas au repos",
    ],
    whenToConsult: "Consultez si la douleur dure plus de 4 à 6 semaines, s'aggrave, ou s'accompagne de signes d'alerte (perte de force, troubles urinaires, fièvre).",
  },
  {
    slug: "nausees-et-vomissements", term: "Nausées et vomissements", synonyms: ["envie de vomir", "mal au cœur"],
    specialty: "gastro-enterologie",
    shortAnswer: "Les nausées sont une envie de vomir, parfois suivies de vomissements. Le plus souvent d'origine digestive et passagères, elles peuvent aussi accompagner d'autres affections. Le principal risque, surtout chez l'enfant et la personne âgée, est la déshydratation.",
    causes: [
      "Gastro-entérite",
      "Intoxication ou indigestion alimentaire",
      "Grossesse (premier trimestre)",
      "Mal des transports",
      "Migraine ou certains médicaments",
    ],
    redFlags: [
      "Vomissements de sang ou d'aspect « marc de café »",
      "Signes de déshydratation (bouche sèche, peu d'urines, somnolence)",
      "Vomissements en jet avec mal de tête intense",
      "Douleur abdominale violente associée",
      "Vomissements persistant plus de 24 à 48 heures",
    ],
    whenToConsult: "Consultez si les vomissements persistent, empêchent de boire, ou s'accompagnent de signes de déshydratation ou de douleur intense. La présence de sang impose un avis urgent.",
  },
  {
    slug: "diarrhee", term: "Diarrhée", synonyms: [],
    specialty: "gastro-enterologie",
    shortAnswer: "La diarrhée correspond à des selles plus fréquentes et plus liquides que d'habitude. Le plus souvent d'origine infectieuse et de courte durée, elle guérit spontanément. La priorité est de compenser les pertes en eau et en sels pour éviter la déshydratation.",
    causes: [
      "Gastro-entérite virale ou bactérienne",
      "Intoxication alimentaire",
      "Effet de certains médicaments (antibiotiques)",
      "Stress ou syndrome de l'intestin irritable",
      "Intolérance alimentaire",
    ],
    redFlags: [
      "Présence de sang ou de glaires dans les selles",
      "Signes de déshydratation (soif intense, peu d'urines, fatigue)",
      "Fièvre élevée",
      "Diarrhée durant plus de 3 jours",
      "Douleur abdominale intense",
    ],
    whenToConsult: "Consultez si la diarrhée dure plus de 3 jours, contient du sang, s'accompagne de fièvre élevée ou de signes de déshydratation, surtout chez l'enfant et la personne âgée.",
  },
  {
    slug: "eruption-cutanee", term: "Éruption cutanée", synonyms: ["boutons", "plaques", "rougeurs"],
    specialty: "dermatologie",
    shortAnswer: "Une éruption cutanée est l'apparition de boutons, rougeurs ou plaques sur la peau. Les causes sont nombreuses : allergie, infection, irritation. La plupart sont bénignes, mais certaines associations de symptômes doivent conduire à consulter rapidement.",
    causes: [
      "Réaction allergique (aliment, médicament, contact)",
      "Infection virale (varicelle, rougeole…)",
      "Eczéma ou dermatite",
      "Piqûre d'insecte",
      "Chaleur et transpiration",
    ],
    redFlags: [
      "Éruption avec gonflement du visage, des lèvres ou difficulté à respirer",
      "Taches rouges ou violacées qui ne s'effacent pas à la pression",
      "Fièvre élevée associée",
      "Cloques étendues ou décollement de la peau",
      "Atteinte des muqueuses (bouche, yeux)",
    ],
    whenToConsult: "Consultez rapidement si l'éruption s'accompagne de fièvre, s'étend vite, ou touche les muqueuses. Un gonflement du visage ou une gêne respiratoire impose d'appeler les secours immédiatement.",
  },
];

async function main() {
  const specialties = await prisma.specialty.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(specialties.map((s) => [s.slug, s.id]));

  let done = 0;
  const missingSpec = new Set<string>();
  for (const s of SYMPTOMS) {
    const specialtyId = s.specialty ? bySlug.get(s.specialty) ?? null : null;
    if (s.specialty && !specialtyId) missingSpec.add(s.specialty);

    const data = {
      kind: "SYMPTOM",
      term: s.term,
      shortAnswer: s.shortAnswer,
      causes: s.causes.join("\n"),
      redFlags: s.redFlags.join("\n"),
      whenToConsult: s.whenToConsult,
      faqJson: s.faq ? JSON.stringify(s.faq) : null,
      synonyms: s.synonyms ?? [],
      specialtyId,
      relatedSlugs: s.related ?? [],
      glossarySlugs: s.glossary ?? [],
      status: "PUBLISHED",
      // reviewedAt volontairement non posé → noindex jusqu'à relecture.
    };
    await prisma.healthTopic.upsert({
      where: { slug: s.slug },
      create: { slug: s.slug, ...data },
      update: data,
    });
    done++;
  }
  console.log(`✓ ${done} symptômes semés (PUBLISHED, reviewedAt=null → noindex).`);
  if (missingSpec.size) console.warn(`⚠️ spécialités introuvables : ${[...missingSpec].join(", ")}`);
  console.log("→ Relire puis ouvrir via scripts/symptoms-approve.ts");
}

main().finally(() => prisma.$disconnect());
