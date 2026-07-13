/**
 * Hubs symptômes — LOT 2 (~10), complète scripts/seed-symptoms.ts.
 * Contenu triage prudent, `reviewedAt` NON posé → noindex jusqu'à relecture.
 * Idempotent (upsert par slug). Pas de doublon avec le lot 1.
 * Lancer : npx tsx --env-file=.env scripts/seed-symptoms-2.ts
 */
import { prisma } from "@/lib/prisma";

type Faq = { q: string; a: string };
type Sym = {
  slug: string; term: string; shortAnswer: string; causes: string[]; redFlags: string[];
  whenToConsult: string; synonyms?: string[]; specialty?: string; related?: string[]; glossary?: string[]; faq?: Faq[];
};

const SYMPTOMS: Sym[] = [
  {
    slug: "constipation", term: "Constipation", synonyms: [], specialty: "gastro-enterologie",
    shortAnswer: "La constipation correspond à des selles peu fréquentes (moins de trois par semaine), dures ou difficiles à évacuer. Très fréquente et le plus souvent bénigne, elle est liée au mode de vie dans la majorité des cas et s'améliore par des mesures simples.",
    causes: ["Alimentation pauvre en fibres, hydratation insuffisante", "Manque d'activité physique", "Changement d'habitudes ou de rythme", "Certains médicaments", "Stress"],
    redFlags: ["Sang dans les selles", "Constipation récente et persistante après 50 ans", "Amaigrissement inexpliqué associé", "Alternance diarrhée/constipation qui s'installe", "Douleurs abdominales intenses avec arrêt des gaz"],
    whenToConsult: "Consultez si la constipation est récente et inhabituelle, résiste aux mesures simples, ou s'accompagne de sang, de douleurs ou d'une perte de poids.",
    glossary: [],
  },
  {
    slug: "insomnie", term: "Insomnie", synonyms: ["troubles du sommeil"], specialty: "pathologie-du-sommeil-et-de-la-vigilance",
    shortAnswer: "L'insomnie est une difficulté à s'endormir, à rester endormi ou un sommeil non réparateur, avec un retentissement sur la journée. Occasionnelle, elle est banale ; installée, elle mérite d'en chercher la cause et de revoir les habitudes de sommeil.",
    causes: ["Stress, anxiété ou dépression", "Mauvaise hygiène de sommeil (écrans, horaires irréguliers)", "Caféine, alcool, repas tardifs", "Douleur ou autre maladie", "Certains médicaments"],
    redFlags: ["Somnolence dangereuse en journée (au volant)", "Ronflements avec pauses respiratoires (apnées)", "Insomnie associée à une détresse psychologique", "Idées noires"],
    whenToConsult: "Consultez si l'insomnie dure plusieurs semaines, retentit sur votre journée, ou s'accompagne de signes de dépression ou d'apnées du sommeil.",
    glossary: [],
  },
  {
    slug: "douleurs-articulaires", term: "Douleurs articulaires", synonyms: ["arthralgies"], specialty: "rhumatologie",
    related: ["arthrose-maroc", "goutte-maroc"], glossary: ["arthrose", "goutte"],
    shortAnswer: "Les douleurs articulaires touchent une ou plusieurs articulations. Elles peuvent être mécaniques (aggravées par l'effort, soulagées par le repos) ou inflammatoires (raideur matinale, réveils nocturnes). Leur caractère et leur durée orientent la cause.",
    causes: ["Arthrose (usure)", "Poussée de goutte", "Rhumatisme inflammatoire", "Traumatisme ou surmenage", "Infection (plus rare)"],
    redFlags: ["Articulation chaude, rouge et très douloureuse avec fièvre", "Impossibilité de bouger l'articulation", "Gonflement brutal après un choc", "Douleurs multiples avec fièvre et fatigue"],
    whenToConsult: "Consultez si la douleur persiste, s'accompagne d'un gonflement, de rougeur, de fièvre, ou limite vos mouvements au quotidien.",
  },
  {
    slug: "demangeaisons", term: "Démangeaisons", synonyms: ["prurit"], specialty: "dermatologie",
    glossary: ["eczema", "psoriasis"],
    shortAnswer: "Les démangeaisons (prurit) sont une envie de se gratter, localisée ou étendue. Le plus souvent liées à une peau sèche ou une affection cutanée bénigne, elles peuvent rarement traduire une cause générale lorsqu'elles sont diffuses et persistantes.",
    causes: ["Peau sèche", "Eczéma, urticaire ou autre affection de peau", "Allergie ou piqûre", "Réaction à un médicament", "Cause générale (foie, thyroïde) si prurit diffus persistant"],
    redFlags: ["Démangeaisons avec gonflement du visage ou gêne respiratoire", "Jaunisse associée", "Prurit généralisé et durable sans lésion de peau", "Fièvre ou altération de l'état général"],
    whenToConsult: "Consultez si les démangeaisons sont étendues, persistantes, résistent aux soins hydratants, ou s'accompagnent de signes généraux.",
  },
  {
    slug: "brulures-urinaires", term: "Brûlures urinaires", synonyms: ["brûlures en urinant"], specialty: "urologie-et-chirurgie-urologique",
    glossary: ["cystite"],
    shortAnswer: "Une sensation de brûlure en urinant évoque le plus souvent une infection urinaire, surtout chez la femme. Elle s'accompagne d'envies fréquentes et pressantes. La présence de fièvre ou de douleur du dos change la prise en charge (atteinte possible du rein).",
    causes: ["Infection urinaire (cystite)", "Infection sexuellement transmissible", "Irritation ou sécheresse", "Calcul urinaire", "Chez l'homme, atteinte de la prostate"],
    redFlags: ["Fièvre avec douleur du dos ou du flanc", "Sang abondant dans les urines", "Vomissements avec fièvre", "Symptômes chez un homme, une femme enceinte ou un enfant"],
    whenToConsult: "Consultez rapidement en cas de fièvre, de douleur lombaire, de grossesse, ou si les symptômes persistent malgré une bonne hydratation.",
  },
  {
    slug: "troubles-de-la-vue", term: "Troubles de la vue", synonyms: ["baisse de vision", "vision floue"], specialty: "ophtalmologie",
    glossary: ["glaucome", "cataracte"],
    shortAnswer: "Un trouble de la vue peut être progressif (besoin de lunettes, cataracte) ou brutal. Une baisse de vision d'apparition soudaine, indolore ou douloureuse, est un signe d'alerte qui impose un avis ophtalmologique rapide.",
    causes: ["Trouble de la réfraction (myopie, presbytie…)", "Cataracte", "Sécheresse oculaire ou conjonctivite", "Migraine avec aura (transitoire)", "Atteinte de la rétine ou du nerf optique (urgent)"],
    redFlags: ["Perte de vision brutale d'un œil", "Voile noir, rideau ou éclairs lumineux", "Œil rouge et douloureux avec baisse de vue", "Vision double d'apparition soudaine"],
    whenToConsult: "Une baisse de vision brutale ou un œil rouge et douloureux avec baisse de vue sont des urgences ophtalmologiques. Pour une gêne progressive, prenez rendez-vous.",
  },
  {
    slug: "anxiete", term: "Anxiété", synonyms: ["angoisse"], specialty: "psychiatrie",
    related: ["depression-maroc"], glossary: ["depression"],
    shortAnswer: "L'anxiété est une réaction normale au stress, mais lorsqu'elle est excessive, persistante et gêne la vie quotidienne, elle peut relever d'un trouble anxieux qui se soigne. Elle se manifeste par des inquiétudes, des tensions et des signes physiques (palpitations, oppression).",
    causes: ["Stress et surcharge", "Trouble anxieux (anxiété généralisée, attaques de panique)", "Dépression associée", "Caféine ou excitants", "Certaines maladies (thyroïde) ou médicaments"],
    redFlags: ["Idées noires ou pensées suicidaires", "Attaques de panique répétées et invalidantes", "Anxiété empêchant de travailler ou de sortir", "Symptômes physiques inexpliqués et intenses"],
    whenToConsult: "Consultez si l'anxiété est intense, durable, ou retentit sur votre vie. En cas d'idées noires, demandez de l'aide sans attendre.",
  },
  {
    slug: "douleur-au-genou", term: "Douleur au genou", synonyms: ["gonalgie"], specialty: "traumatologie-orthopedie",
    glossary: ["arthrose"],
    shortAnswer: "La douleur au genou est très fréquente, d'origine mécanique (traumatisme, usure) le plus souvent. Selon qu'elle survient après un choc, à l'effort ou au repos, et qu'elle s'accompagne ou non d'un gonflement, la cause et la conduite diffèrent.",
    causes: ["Entorse ou lésion après un traumatisme", "Arthrose du genou", "Tendinite ou surmenage sportif", "Lésion du ménisque", "Poussée inflammatoire"],
    redFlags: ["Genou déformé après un choc violent", "Impossibilité de poser le pied ou de plier le genou", "Genou chaud, rouge et gonflé avec fièvre", "Blocage complet de l'articulation"],
    whenToConsult: "Consultez en cas de traumatisme important, d'impossibilité d'appui, de gonflement avec fièvre, ou d'une douleur qui persiste malgré le repos.",
  },
  {
    slug: "saignement-de-nez", term: "Saignement de nez", synonyms: ["épistaxis"], specialty: "oto-rhino-laryngologie",
    shortAnswer: "Le saignement de nez est le plus souvent bénin et provient de la partie antérieure de la cloison nasale. Il cède généralement en comprimant les narines. Des saignements répétés, abondants ou survenant sous anticoagulant doivent faire consulter.",
    causes: ["Fragilité des vaisseaux, air sec, grattage", "Rhume ou irritation nasale", "Hypertension artérielle", "Prise d'anticoagulants ou d'aspirine", "Trouble de la coagulation (plus rare)"],
    redFlags: ["Saignement abondant qui ne s'arrête pas après 20 minutes de compression", "Saignements répétés et inexpliqués", "Sous traitement anticoagulant", "Pâleur, malaise ou vertiges associés"],
    whenToConsult: "Consultez si le saignement ne cède pas malgré une compression prolongée, se répète souvent, ou survient sous anticoagulant.",
    faq: [{ q: "Quel geste faire en cas de saignement de nez ?", a: "Penchez la tête légèrement en avant (pas en arrière), mouchez-vous doucement puis comprimez fermement les deux narines entre le pouce et l'index pendant 10 à 15 minutes sans relâcher." }],
  },
  {
    slug: "perte-de-poids-inexpliquee", term: "Perte de poids inexpliquée", synonyms: ["amaigrissement"], specialty: "medecine-interne",
    shortAnswer: "Une perte de poids involontaire et significative (par exemple plus de 5 % du poids en 6 à 12 mois), sans régime ni augmentation d'activité, n'est pas anodine. Elle justifie de rechercher une cause médicale par un bilan.",
    causes: ["Trouble de la thyroïde ou diabète", "Dépression ou anxiété, perte d'appétit", "Maladie digestive", "Infection chronique", "Cause plus sérieuse à écarter par un bilan"],
    redFlags: ["Perte de poids rapide et importante", "Associée à de la fièvre, des sueurs nocturnes", "Sang dans les selles ou les urines", "Fatigue majeure ou masse palpable"],
    whenToConsult: "Consultez devant toute perte de poids involontaire et inexpliquée : un bilan permettra d'en identifier la cause.",
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
      kind: "SYMPTOM", term: s.term, shortAnswer: s.shortAnswer,
      causes: s.causes.join("\n"), redFlags: s.redFlags.join("\n"), whenToConsult: s.whenToConsult,
      faqJson: s.faq ? JSON.stringify(s.faq) : null, synonyms: s.synonyms ?? [],
      specialtyId, relatedSlugs: s.related ?? [], glossarySlugs: s.glossary ?? [], status: "PUBLISHED",
    };
    await prisma.healthTopic.upsert({ where: { slug: s.slug }, create: { slug: s.slug, ...data }, update: data });
    done++;
  }
  console.log(`✓ ${done} symptômes (lot 2) semés (reviewedAt=null → noindex).`);
  if (missingSpec.size) console.warn(`⚠️ spécialités introuvables : ${[...missingSpec].join(", ")}`);
}
main().finally(() => prisma.$disconnect());
