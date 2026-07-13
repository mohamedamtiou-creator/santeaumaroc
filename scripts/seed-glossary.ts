/**
 * Seed du glossaire médical — ~40 termes fréquents, définitions courtes,
 * factuelles et neutres (format « réponse » pour AI Overviews).
 *
 * ⚠️ GARDE-FOU YMYL : les termes sont créés SANS `reviewedAt` → chaque page
 * reste `noindex` et n'entre PAS au sitemap tant qu'un humain ne l'a pas relue.
 * Après relecture, poser `reviewedAt` (par terme, ou en lot via
 * scripts/glossary-approve.ts). Idempotent : upsert par slug.
 *
 * Lancer :  npx tsx --env-file=.env scripts/seed-glossary.ts
 */
import { prisma } from "@/lib/prisma";

type Src = { label: string; url: string; publisher?: string; year?: string };
const who = (slug: string, fr: string, year: string): Src[] => [
  { label: `Organisation mondiale de la Santé — « ${fr} »`, url: `https://www.who.int/fr/news-room/fact-sheets/detail/${slug}`, publisher: "OMS", year },
];

type Term = {
  slug: string;
  term: string;
  definition: string;
  category: "symptome" | "maladie" | "examen" | "traitement" | "anatomie" | "general";
  synonyms?: string[];
  specialty?: string; // slug d'une spécialité existante
  related?: string;   // slug d'un article pilier existant
  sources?: Src[];
};

const TERMS: Term[] = [
  // ── MALADIES ────────────────────────────────────────────────
  { slug: "hypertension-arterielle", term: "Hypertension artérielle", category: "maladie", synonyms: ["HTA", "tension élevée"], specialty: "cardiologie", related: "hypertension-arterielle-maroc",
    definition: "Élévation durable de la pression du sang dans les artères, définie à partir de 140/90 mmHg au cabinet. Souvent sans symptôme, elle augmente le risque d'infarctus, d'AVC et d'insuffisance rénale. Elle se dépiste par une simple mesure et se contrôle par l'hygiène de vie et, si besoin, des médicaments.",
    sources: who("hypertension", "Hypertension artérielle", "2025") },
  { slug: "diabete-type-2", term: "Diabète de type 2", category: "maladie", synonyms: ["diabète non insulinodépendant"], specialty: "endocrinologie-et-maladies-metaboliques", related: "diabete-type-2-maroc",
    definition: "Maladie chronique caractérisée par un excès de sucre dans le sang, dû à une résistance de l'organisme à l'insuline. Elle survient surtout à l'âge adulte et est favorisée par le surpoids et la sédentarité. Non contrôlée, elle abîme les yeux, les reins, les nerfs et le cœur.",
    sources: who("diabetes", "Diabète", "2024") },
  { slug: "asthme", term: "Asthme", category: "maladie", synonyms: [], specialty: "pneumo-phtisiologie", related: "asthme-maroc",
    definition: "Maladie inflammatoire chronique des bronches provoquant des épisodes de gêne respiratoire, de sifflements et de toux, souvent la nuit ou à l'effort. Les crises sont déclenchées par des allergènes, l'effort ou des infections. Le traitement repose sur des inhalateurs de fond et de secours.",
    sources: who("asthma", "Asthme", "2026") },
  { slug: "obesite", term: "Obésité", category: "maladie", synonyms: ["surpoids sévère"], specialty: "nutrition", related: "obesite-maroc",
    definition: "Accumulation excessive de graisse corporelle nuisant à la santé, définie par un indice de masse corporelle (IMC) égal ou supérieur à 30. Elle augmente le risque de diabète, d'hypertension et de maladies cardiaques. Sa prise en charge associe alimentation, activité physique et suivi médical.",
    sources: who("obesity-and-overweight", "Obésité et surpoids", "2025") },
  { slug: "depression", term: "Dépression", category: "maladie", synonyms: ["trouble dépressif"], specialty: "psychiatrie", related: "depression-maroc",
    definition: "Trouble mental fréquent marqué par une tristesse persistante, une perte d'intérêt et de plaisir pendant au moins deux semaines, avec fatigue, troubles du sommeil et de l'appétit. Ce n'est pas une faiblesse : c'est une maladie qui se soigne par psychothérapie et, si nécessaire, médicaments.",
    sources: who("depression", "Trouble dépressif (dépression)", "2025") },
  { slug: "hepatite-b", term: "Hépatite B", category: "maladie", synonyms: [], specialty: "gastro-enterologie", related: "hepatite-maroc",
    definition: "Infection du foie causée par le virus de l'hépatite B, transmise par le sang et les liquides biologiques. Souvent silencieuse, elle peut devenir chronique et évoluer vers la cirrhose ou le cancer du foie. Elle est évitable par la vaccination.",
    sources: who("hepatitis-b", "Hépatite B", "2026") },
  { slug: "migraine", term: "Migraine", category: "maladie", synonyms: [], specialty: "neurologie", related: "migraine-maroc",
    definition: "Maux de tête récurrents, souvent d'un seul côté, pulsatiles et intenses, aggravés par l'effort et accompagnés de nausées ou d'une gêne à la lumière et au bruit. Les crises durent de quelques heures à trois jours. Des traitements de crise et de fond existent." },
  { slug: "arthrose", term: "Arthrose", category: "maladie", synonyms: ["ostéoarthrite"], specialty: "rhumatologie", related: "arthrose-maroc",
    definition: "Usure progressive du cartilage qui recouvre les extrémités des os d'une articulation, provoquant douleur, raideur et perte de mobilité. Elle touche surtout les genoux, les hanches et les mains, et s'aggrave avec l'âge. La prise en charge associe exercice, antalgiques et parfois chirurgie." },
  { slug: "hypothyroidie", term: "Hypothyroïdie", category: "maladie", synonyms: [], specialty: "endocrinologie-et-maladies-metaboliques", related: "hypothyroidie-maroc",
    definition: "Production insuffisante d'hormones par la glande thyroïde, entraînant fatigue, prise de poids, frilosité, ralentissement et peau sèche. Elle se diagnostique par une prise de sang (TSH) et se traite par un apport quotidien d'hormone thyroïdienne de synthèse." },
  { slug: "reflux-gastro-oesophagien", term: "Reflux gastro-œsophagien", category: "maladie", synonyms: ["RGO", "remontées acides"], specialty: "gastro-enterologie", related: "reflux-gastro-oesophagien-maroc",
    definition: "Remontée du contenu acide de l'estomac vers l'œsophage, provoquant brûlures derrière le sternum et régurgitations, souvent après les repas ou en position allongée. Des mesures d'hygiène de vie et des médicaments réduisant l'acidité soulagent la plupart des cas." },
  { slug: "anemie", term: "Anémie", category: "maladie", synonyms: [], specialty: "medecine-interne", related: "anemie-maroc",
    definition: "Baisse du taux d'hémoglobine dans le sang, réduisant le transport de l'oxygène. Elle se manifeste par une fatigue, une pâleur et un essoufflement. La cause la plus fréquente est le manque de fer. Une prise de sang confirme le diagnostic et en recherche l'origine." },
  { slug: "goutte", term: "Goutte", category: "maladie", synonyms: [], specialty: "rhumatologie", related: "goutte-maroc",
    definition: "Forme d'arthrite due à l'accumulation de cristaux d'acide urique dans une articulation, provoquant des crises brutales de douleur intense, souvent au gros orteil. L'alimentation, l'alcool et certains médicaments favorisent les crises, qui se préviennent par un traitement de fond." },

  // ── SYMPTÔMES ───────────────────────────────────────────────
  { slug: "fievre", term: "Fièvre", category: "symptome", synonyms: ["hyperthermie"], specialty: "medecine-generale",
    definition: "Élévation de la température corporelle au-dessus de 38 °C, le plus souvent réaction de l'organisme à une infection. Elle n'est pas une maladie en soi mais un signal. Une fièvre élevée, persistante ou chez un nourrisson doit amener à consulter." },
  { slug: "cephalee", term: "Céphalée", category: "symptome", synonyms: ["mal de tête"], specialty: "neurologie",
    definition: "Douleur ressentie au niveau du crâne ou de la nuque. Le plus souvent bénigne (tension, fatigue), elle peut parfois signaler une cause à explorer. Un mal de tête brutal, inhabituel ou accompagné de fièvre, de vomissements ou de troubles neurologiques impose une consultation rapide." },
  { slug: "dyspnee", term: "Dyspnée", category: "symptome", synonyms: ["essoufflement", "difficulté à respirer"], specialty: "pneumo-phtisiologie",
    definition: "Sensation de gêne ou de difficulté à respirer, pouvant survenir à l'effort ou au repos. Elle peut être d'origine respiratoire ou cardiaque. Une dyspnée d'apparition brutale ou au repos est un signe d'alerte nécessitant un avis médical sans délai." },
  { slug: "vertige", term: "Vertige", category: "symptome", synonyms: [], specialty: "oto-rhino-laryngologie",
    definition: "Illusion de mouvement, souvent de rotation, de soi-même ou de l'environnement, parfois accompagnée de nausées et de troubles de l'équilibre. Les causes sont fréquemment liées à l'oreille interne, mais un bilan permet d'écarter une origine neurologique." },
  { slug: "palpitations", term: "Palpitations", category: "symptome", synonyms: [], specialty: "cardiologie",
    definition: "Perception anormale des battements du cœur, ressentis comme trop rapides, forts ou irréguliers. Souvent bénignes (stress, caféine, effort), elles peuvent parfois traduire un trouble du rythme cardiaque et justifient un électrocardiogramme si elles se répètent." },

  // ── EXAMENS ─────────────────────────────────────────────────
  { slug: "electrocardiogramme", term: "Électrocardiogramme (ECG)", category: "examen", synonyms: ["ECG"], specialty: "cardiologie",
    definition: "Examen simple et indolore qui enregistre l'activité électrique du cœur au moyen d'électrodes posées sur la peau. Il aide à détecter les troubles du rythme, les signes d'infarctus et d'autres anomalies cardiaques. Il dure quelques minutes et ne nécessite aucune préparation particulière." },
  { slug: "echographie", term: "Échographie", category: "examen", synonyms: ["écho"], specialty: "radio-diagnostic-et-imagerie-medicale",
    definition: "Technique d'imagerie utilisant des ultrasons pour visualiser les organes en temps réel, sans rayons X. Indolore et sans danger connu, elle explore notamment l'abdomen, le cœur, les vaisseaux et le fœtus pendant la grossesse." },
  { slug: "irm", term: "IRM (imagerie par résonance magnétique)", category: "examen", synonyms: ["imagerie par résonance magnétique"], specialty: "radio-diagnostic-et-imagerie-medicale",
    definition: "Examen d'imagerie utilisant un champ magnétique puissant, sans rayons X, pour produire des images détaillées des tissus mous : cerveau, articulations, moelle, organes. Il se déroule dans un tunnel et dure de 15 à 45 minutes. Les objets métalliques doivent être signalés." },
  { slug: "scanner", term: "Scanner (tomodensitométrie)", category: "examen", synonyms: ["TDM", "tomodensitométrie"], specialty: "radio-diagnostic-et-imagerie-medicale",
    definition: "Examen d'imagerie par rayons X qui reconstruit des images en coupes du corps. Rapide et précis, il explore de nombreux organes et situations d'urgence. Un produit de contraste iodé est parfois injecté pour mieux visualiser les vaisseaux et les tissus." },
  { slug: "mammographie", term: "Mammographie", category: "examen", synonyms: [], specialty: "radio-diagnostic-et-imagerie-medicale",
    definition: "Radiographie des seins servant à détecter précocement le cancer du sein, avant l'apparition de tout symptôme. Recommandée dans le cadre du dépistage à partir d'un certain âge, elle permet de repérer des anomalies de très petite taille." },
  { slug: "coloscopie", term: "Coloscopie", category: "examen", synonyms: [], specialty: "gastro-enterologie",
    definition: "Examen qui explore l'intérieur du gros intestin à l'aide d'une caméra souple, généralement sous anesthésie. Il permet de détecter et de retirer des polypes et de dépister le cancer colorectal. Il nécessite une préparation pour vider l'intestin la veille." },
  { slug: "prise-de-sang", term: "Prise de sang", category: "examen", synonyms: ["analyse de sang", "bilan sanguin"], specialty: "medecine-generale",
    definition: "Prélèvement d'un échantillon de sang, le plus souvent au pli du coude, afin d'analyser de nombreux paramètres : glycémie, cholestérol, numération, fonction du foie et des reins. Certains dosages exigent d'être à jeun ; suivez les consignes du laboratoire." },
  { slug: "glycemie", term: "Glycémie", category: "examen", synonyms: ["taux de sucre"], specialty: "endocrinologie-et-maladies-metaboliques",
    definition: "Taux de glucose (sucre) présent dans le sang, mesuré par une prise de sang ou un lecteur. C'est le paramètre clé pour dépister et surveiller le diabète. La glycémie à jeun normale se situe généralement en dessous de 1,10 g/L." },

  // ── TRAITEMENTS ─────────────────────────────────────────────
  { slug: "antibiotique", term: "Antibiotique", category: "traitement", synonyms: [], specialty: "medecine-generale",
    definition: "Médicament qui détruit les bactéries ou bloque leur multiplication. Il est inefficace contre les virus (rhume, grippe). Un usage inapproprié favorise la résistance bactérienne : il doit être pris uniquement sur prescription et pour toute la durée indiquée." },
  { slug: "anti-inflammatoire", term: "Anti-inflammatoire (AINS)", category: "traitement", synonyms: ["AINS"], specialty: "rhumatologie",
    definition: "Médicament qui réduit l'inflammation, la douleur et la fièvre (par exemple l'ibuprofène). Efficace mais non anodin, il peut irriter l'estomac et affecter les reins. Il s'utilise à la dose minimale et sur la durée la plus courte, en respectant les contre-indications." },
  { slug: "anticoagulant", term: "Anticoagulant", category: "traitement", synonyms: ["fluidifiant du sang"], specialty: "cardiologie",
    definition: "Médicament qui ralentit la coagulation du sang pour prévenir ou traiter les caillots (phlébite, embolie, certains troubles du rythme). Il augmente le risque de saignement et nécessite un suivi et le respect strict des doses prescrites." },
  { slug: "antihypertenseur", term: "Antihypertenseur", category: "traitement", synonyms: [], specialty: "cardiologie",
    definition: "Famille de médicaments destinés à abaisser une tension artérielle trop élevée et à réduire le risque d'infarctus et d'AVC. Plusieurs classes existent et sont souvent associées. Le traitement est en général au long cours, même en l'absence de symptôme." },
  { slug: "vaccin", term: "Vaccin", category: "traitement", synonyms: ["vaccination"], specialty: "medecine-generale",
    definition: "Préparation qui entraîne le système immunitaire à reconnaître un agent infectieux, afin de protéger contre une maladie avant toute exposition. La vaccination protège l'individu et, à l'échelle collective, freine la circulation des maladies contagieuses." },
  { slug: "anesthesie", term: "Anesthésie", category: "traitement", synonyms: [], specialty: "anesthesie-reanimation",
    definition: "Suppression temporaire de la douleur lors d'un acte médical ou chirurgical. Elle peut être locale (une zone), loco-régionale (un membre) ou générale (perte de conscience contrôlée). Une consultation préalable évalue les risques et adapte la technique." },
  { slug: "corticoide", term: "Corticoïde", category: "traitement", synonyms: ["cortisone"], specialty: "medecine-interne",
    definition: "Médicament anti-inflammatoire puissant dérivé d'une hormone naturelle, utilisé dans de nombreuses maladies inflammatoires et allergiques. Un traitement prolongé expose à des effets indésirables et ne doit jamais être arrêté brutalement sans avis médical." },
  { slug: "insuline", term: "Insuline", category: "traitement", synonyms: [], specialty: "endocrinologie-et-maladies-metaboliques",
    definition: "Hormone qui permet au sucre de passer du sang vers les cellules. Administrée en injections, elle est indispensable dans le diabète de type 1 et parfois nécessaire dans le type 2. Les doses s'ajustent à l'alimentation et à la glycémie." },

  // ── ANATOMIE ────────────────────────────────────────────────
  { slug: "artere", term: "Artère", category: "anatomie", synonyms: [], specialty: "cardiologie",
    definition: "Vaisseau sanguin qui transporte le sang du cœur vers les organes. Les artères ont une paroi épaisse et élastique qui supporte la pression du sang. Leur rétrécissement par des dépôts (athérosclérose) est à l'origine de l'infarctus et de nombreux AVC." },
  { slug: "rein", term: "Rein", category: "anatomie", synonyms: [], specialty: "nephrologie",
    definition: "Organe pair en forme de haricot qui filtre le sang pour éliminer les déchets et l'excès d'eau sous forme d'urine. Les reins régulent aussi la pression artérielle et l'équilibre des sels minéraux. Leur défaillance conduit à l'insuffisance rénale." },
  { slug: "foie", term: "Foie", category: "anatomie", synonyms: [], specialty: "gastro-enterologie",
    definition: "Volumineux organe situé sous les côtes à droite, essentiel à la digestion, au stockage de l'énergie, à la fabrication de protéines et à l'élimination des toxines. Il peut être atteint par les hépatites, l'alcool ou la surcharge en graisse." },

  // ── GÉNÉRAL ─────────────────────────────────────────────────
  { slug: "ordonnance", term: "Ordonnance", category: "general", synonyms: ["prescription"], specialty: "medecine-generale",
    definition: "Document rédigé par un professionnel de santé autorisé, listant les médicaments ou soins prescrits, leurs doses et leur durée. Elle est nécessaire pour délivrer de nombreux médicaments et permet le suivi et le remboursement des soins." },
  { slug: "depistage", term: "Dépistage", category: "general", synonyms: [], specialty: "sante-publique-et-medecine-sociale",
    definition: "Recherche d'une maladie chez une personne sans symptôme, dans le but de la détecter tôt et d'améliorer les chances de guérison. Il repose sur des examens simples et ciblés (par exemple mammographie, glycémie, tension) proposés selon l'âge et les facteurs de risque." },
  { slug: "teleconsultation", term: "Téléconsultation", category: "general", synonyms: ["consultation à distance"], specialty: "medecine-generale",
    definition: "Consultation médicale réalisée à distance, par vidéo ou téléphone, entre un patient et un professionnel de santé. Elle convient à de nombreuses situations non urgentes mais ne remplace pas un examen physique lorsqu'il est nécessaire." },
];

async function main() {
  const specialties = await prisma.specialty.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(specialties.map((s) => [s.slug, s.id]));

  let done = 0;
  const missingSpec = new Set<string>();
  for (const t of TERMS) {
    const specialtyId = t.specialty ? bySlug.get(t.specialty) ?? null : null;
    if (t.specialty && !specialtyId) missingSpec.add(t.specialty);

    const data = {
      term: t.term,
      definition: t.definition,
      category: t.category,
      synonyms: t.synonyms ?? [],
      specialtyId,
      relatedSlug: t.related ?? null,
      sources: t.sources ? JSON.stringify(t.sources) : null,
      status: "PUBLISHED",
      // reviewedAt volontairement NON posé → noindex jusqu'à relecture humaine.
    };
    await prisma.glossaryTerm.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, ...data },
      update: data,
    });
    done++;
  }
  console.log(`✓ ${done} termes de glossaire semés (status PUBLISHED, reviewedAt=null → noindex).`);
  if (missingSpec.size) console.warn(`⚠️ spécialités introuvables (specialtyId=null) : ${[...missingSpec].join(", ")}`);
  console.log("→ Relire puis ouvrir l'indexation via scripts/glossary-approve.ts");
}

main().finally(() => prisma.$disconnect());
