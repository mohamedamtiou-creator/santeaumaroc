/**
 * Glossaire médical — LOT 2 (~40 termes), complète scripts/seed-glossary.ts.
 * Mêmes règles : définitions courtes/neutres, `reviewedAt` NON posé → noindex
 * jusqu'à relecture humaine (YMYL). Sources OMS uniquement si fiche VÉRIFIÉE.
 * Idempotent (upsert par slug). Aucun doublon avec le lot 1 ni avec les hubs
 * symptômes (mal-de-tête, fièvre, toux… vivent dans /symptomes).
 *
 * Lancer : npx tsx --env-file=.env scripts/seed-glossary-2.ts
 */
import { prisma } from "@/lib/prisma";

type Src = { label: string; url: string; publisher?: string; year?: string };
const who = (slug: string, fr: string, year: string): Src[] => [
  { label: `Organisation mondiale de la Santé — « ${fr} »`, url: `https://www.who.int/fr/news-room/fact-sheets/detail/${slug}`, publisher: "OMS", year },
];

type Term = {
  slug: string; term: string; definition: string;
  category: "symptome" | "maladie" | "examen" | "traitement" | "anatomie" | "general";
  synonyms?: string[]; specialty?: string; related?: string; sources?: Src[];
};

const TERMS: Term[] = [
  // ── MALADIES ────────────────────────────────────────────────
  { slug: "grippe", term: "Grippe", category: "maladie", synonyms: ["influenza"], specialty: "pneumo-phtisiologie",
    definition: "Infection respiratoire virale contagieuse due aux virus influenza, marquée par une fièvre d'apparition brutale, des courbatures, une fatigue et une toux. Le plus souvent bénigne, elle peut être grave chez les personnes fragiles. La vaccination annuelle est le principal moyen de prévention.",
    sources: who("influenza-(seasonal)", "Grippe saisonnière", "2025") },
  { slug: "tuberculose", term: "Tuberculose", category: "maladie", synonyms: ["BK"], specialty: "pneumo-phtisiologie",
    definition: "Maladie infectieuse due à une bactérie (bacille de Koch) touchant surtout les poumons, transmise par voie aérienne. Elle se manifeste par une toux prolongée, une fièvre, des sueurs nocturnes et un amaigrissement. Elle se guérit par un traitement antibiotique prolongé et bien suivi.",
    sources: who("tuberculosis", "Tuberculose", "2026") },
  { slug: "cancer-du-sein", term: "Cancer du sein", category: "maladie", synonyms: [], specialty: "cancerologie",
    definition: "Tumeur maligne développée à partir des cellules du sein. C'est le cancer le plus fréquent chez la femme. Détecté tôt, notamment par le dépistage (mammographie) et l'autopalpation, il se traite avec de bonnes chances de guérison. Toute masse ou modification du sein doit être montrée à un médecin.",
    sources: who("breast-cancer", "Cancer du sein", "2026") },
  { slug: "avc", term: "Accident vasculaire cérébral (AVC)", category: "maladie", synonyms: ["attaque cérébrale"], specialty: "neurologie", related: "avc-accident-vasculaire-cerebral-maroc",
    definition: "Interruption brutale de la circulation du sang dans une partie du cerveau, par un caillot ou une hémorragie. C'est une urgence absolue : paralysie ou engourdissement d'un côté, trouble de la parole, déformation du visage imposent d'appeler immédiatement les secours. Agir vite préserve le cerveau.",
    sources: who("cardiovascular-diseases-(cvds)", "Maladies cardiovasculaires", "2025") },
  { slug: "infarctus-du-myocarde", term: "Infarctus du myocarde", category: "maladie", synonyms: ["crise cardiaque"], specialty: "cardiologie",
    definition: "Destruction d'une partie du muscle cardiaque privée de sang par l'obstruction d'une artère du cœur. Il se manifeste souvent par une douleur intense en étau dans la poitrine, irradiant vers le bras ou la mâchoire. C'est une urgence vitale : appeler les secours sans attendre." },
  { slug: "insuffisance-cardiaque", term: "Insuffisance cardiaque", category: "maladie", synonyms: [], specialty: "cardiologie",
    definition: "Incapacité du cœur à pomper suffisamment de sang pour les besoins du corps. Elle provoque essoufflement, fatigue et gonflement des jambes. Chronique, elle se contrôle par des médicaments, une réduction du sel et un suivi régulier." },
  { slug: "pneumonie", term: "Pneumonie", category: "maladie", synonyms: [], specialty: "pneumo-phtisiologie",
    definition: "Infection d'un ou des deux poumons, le plus souvent bactérienne ou virale, provoquant fièvre, toux, essoufflement et douleur thoracique. Elle peut être grave chez l'enfant, la personne âgée ou fragile, et nécessite un avis médical." },
  { slug: "bronchite", term: "Bronchite", category: "maladie", synonyms: [], specialty: "pneumo-phtisiologie",
    definition: "Inflammation des bronches, le plus souvent virale et bénigne, se traduisant par une toux parfois grasse, une gêne thoracique et une fatigue. Elle guérit généralement seule en une à deux semaines ; une toux persistante ou une fièvre élevée justifient une consultation." },
  { slug: "gastro-enterite", term: "Gastro-entérite", category: "maladie", synonyms: ["gastro"], specialty: "gastro-enterologie",
    definition: "Inflammation du tube digestif, le plus souvent virale, provoquant diarrhée, vomissements, douleurs abdominales et parfois fièvre. Bénigne et spontanément résolutive, elle expose surtout à la déshydratation : l'essentiel est de bien se réhydrater." },
  { slug: "cystite", term: "Cystite", category: "maladie", synonyms: ["infection urinaire"], specialty: "urologie-et-chirurgie-urologique",
    definition: "Infection de la vessie, fréquente chez la femme, provoquant des brûlures en urinant, des envies fréquentes et pressantes et parfois du sang dans les urines. Une fièvre ou une douleur du dos associées doivent faire consulter (risque d'atteinte du rein)." },
  { slug: "eczema", term: "Eczéma", category: "maladie", synonyms: ["dermatite atopique"], specialty: "dermatologie",
    definition: "Maladie inflammatoire de la peau, non contagieuse, provoquant des plaques rouges, sèches et des démangeaisons. Elle évolue par poussées et est fréquente chez l'enfant. Les soins associent hydratation de la peau et traitements des poussées." },
  { slug: "psoriasis", term: "Psoriasis", category: "maladie", synonyms: [], specialty: "dermatologie",
    definition: "Maladie inflammatoire chronique de la peau, non contagieuse, se manifestant par des plaques rouges recouvertes de squames blanches, souvent aux coudes, genoux et cuir chevelu. Elle évolue par poussées et bénéficie de traitements locaux ou généraux selon la sévérité." },
  { slug: "acne", term: "Acné", category: "maladie", synonyms: [], specialty: "dermatologie",
    definition: "Affection de la peau très fréquente à l'adolescence, liée aux glandes sébacées, se traduisant par des boutons et points noirs surtout sur le visage. Des traitements efficaces existent ; un avis dermatologique est utile pour les formes étendues ou cicatricielles." },
  { slug: "conjonctivite", term: "Conjonctivite", category: "maladie", synonyms: [], specialty: "ophtalmologie",
    definition: "Inflammation de la membrane qui recouvre l'œil, d'origine virale, bactérienne ou allergique, provoquant rougeur, larmoiement et sensation de grain de sable. Souvent bénigne ; une douleur importante ou une baisse de la vue imposent un avis ophtalmologique." },
  { slug: "glaucome", term: "Glaucome", category: "maladie", synonyms: [], specialty: "ophtalmologie",
    definition: "Maladie de l'œil liée le plus souvent à une pression intraoculaire trop élevée, qui abîme progressivement le nerf optique et peut conduire à la cécité. Longtemps silencieux, il se dépiste par un examen ophtalmologique régulier après un certain âge." },
  { slug: "cataracte", term: "Cataracte", category: "maladie", synonyms: [], specialty: "ophtalmologie",
    definition: "Opacification progressive du cristallin de l'œil, entraînant une baisse de la vue, un éblouissement et des couleurs ternies. Très fréquente avec l'âge, elle se traite par une intervention chirurgicale courante qui remplace le cristallin." },
  { slug: "osteoporose", term: "Ostéoporose", category: "maladie", synonyms: [], specialty: "rhumatologie", related: "osteoporose-maroc",
    definition: "Fragilisation des os liée à une perte de densité osseuse, augmentant le risque de fractures, surtout après la ménopause et avec l'âge. Souvent silencieuse jusqu'à la fracture, elle se prévient par l'activité physique, un apport suffisant en calcium et vitamine D, et parfois des traitements." },
  { slug: "sciatique", term: "Sciatique", category: "maladie", synonyms: ["névralgie sciatique"], specialty: "rhumatologie",
    definition: "Douleur qui suit le trajet du nerf sciatique, de la fesse jusqu'à la jambe, le plus souvent due à la compression d'une racine nerveuse (hernie discale). Elle guérit habituellement en quelques semaines ; une perte de force ou des troubles urinaires imposent un avis rapide." },
  { slug: "hernie-discale", term: "Hernie discale", category: "maladie", synonyms: [], specialty: "traumatologie-orthopedie",
    definition: "Saillie d'un disque situé entre deux vertèbres, qui peut comprimer un nerf et provoquer une douleur irradiant dans un membre (par exemple une sciatique). La majorité des cas évoluent favorablement sans chirurgie, avec repos relatif, antalgiques et rééducation." },
  { slug: "varices", term: "Varices", category: "maladie", synonyms: [], specialty: "angiologie", related: "varices-maroc",
    definition: "Veines dilatées et visibles, surtout aux jambes, dues à un mauvais retour du sang vers le cœur. Elles provoquent lourdeur et gonflement des jambes. La contention, l'activité physique et divers traitements permettent de les prendre en charge." },
  { slug: "epilepsie", term: "Épilepsie", category: "maladie", synonyms: [], specialty: "neurologie",
    definition: "Maladie neurologique caractérisée par la répétition de crises liées à une activité électrique anormale du cerveau. Les crises prennent des formes variées (convulsions, absences). Un traitement adapté permet à la plupart des personnes de contrôler leurs crises." },

  // ── SYMPTÔMES (termes cliniques, distincts des hubs /symptomes) ──
  { slug: "tachycardie", term: "Tachycardie", category: "symptome", synonyms: [], specialty: "cardiologie",
    definition: "Accélération du rythme cardiaque au-dessus de 100 battements par minute au repos. Elle peut être normale (effort, émotion, fièvre) ou traduire un trouble du rythme. Une tachycardie mal tolérée, avec malaise ou douleur thoracique, doit faire consulter." },
  { slug: "hypoglycemie", term: "Hypoglycémie", category: "symptome", synonyms: ["chute de sucre"], specialty: "endocrinologie-et-maladies-metaboliques",
    definition: "Baisse anormale du taux de sucre dans le sang, fréquente chez les personnes diabétiques traitées. Elle provoque sueurs, tremblements, faim, palpitations et confusion. Elle se corrige par une prise rapide de sucre ; les formes sévères sont une urgence." },
  { slug: "oedeme", term: "Œdème", category: "symptome", synonyms: ["gonflement"], specialty: "medecine-interne",
    definition: "Accumulation de liquide dans les tissus, provoquant un gonflement, souvent des jambes ou des chevilles. Les causes sont multiples (station debout prolongée, veineuse, cardiaque, rénale). Un œdème brutal, douloureux ou d'un seul côté doit faire consulter." },
  { slug: "ictere", term: "Ictère", category: "symptome", synonyms: ["jaunisse"], specialty: "gastro-enterologie",
    definition: "Coloration jaune de la peau et du blanc des yeux, due à un excès de bilirubine dans le sang. Il peut traduire une atteinte du foie ou des voies biliaires. Chez l'adulte, un ictère justifie toujours une consultation pour en rechercher la cause." },

  // ── EXAMENS ─────────────────────────────────────────────────
  { slug: "radiographie", term: "Radiographie", category: "examen", synonyms: ["radio"], specialty: "radio-diagnostic-et-imagerie-medicale",
    definition: "Examen d'imagerie utilisant les rayons X pour visualiser les os et certains organes (poumons notamment). Rapide et indolore, il expose à une faible dose de rayonnement. Il est déconseillé pendant la grossesse sauf nécessité." },
  { slug: "endoscopie", term: "Endoscopie", category: "examen", synonyms: [], specialty: "gastro-enterologie",
    definition: "Examen qui explore l'intérieur d'un organe creux à l'aide d'une caméra souple (endoscope). La gastroscopie explore l'estomac, la coloscopie le côlon. Elle permet de voir, prélever et parfois traiter, souvent sous sédation." },
  { slug: "biopsie", term: "Biopsie", category: "examen", synonyms: [], specialty: "anatomo-pathologie",
    definition: "Prélèvement d'un petit fragment de tissu en vue de l'analyser au microscope. C'est l'examen de référence pour préciser la nature d'une lésion, notamment pour confirmer ou écarter un cancer." },
  { slug: "frottis", term: "Frottis cervico-utérin", category: "examen", synonyms: ["frottis"], specialty: "gyneco-obstetrique",
    definition: "Prélèvement de cellules du col de l'utérus, indolore, servant à dépister précocement les lésions pouvant évoluer vers un cancer du col. Il est recommandé de façon régulière chez la femme, selon un rythme défini avec le médecin." },
  { slug: "epreuve-d-effort", term: "Épreuve d'effort", category: "examen", synonyms: ["test d'effort"], specialty: "cardiologie",
    definition: "Enregistrement de l'activité du cœur pendant un effort progressif (vélo ou tapis), sous surveillance médicale. Il aide à détecter une maladie des artères du cœur et à évaluer la tolérance à l'effort." },

  // ── TRAITEMENTS ─────────────────────────────────────────────
  { slug: "chimiotherapie", term: "Chimiothérapie", category: "traitement", synonyms: [], specialty: "cancerologie",
    definition: "Traitement médicamenteux du cancer visant à détruire les cellules cancéreuses ou à freiner leur multiplication. Administrée par cures, elle peut entraîner des effets indésirables (fatigue, nausées, chute des cheveux) qui se gèrent avec l'équipe soignante." },
  { slug: "radiotherapie", term: "Radiothérapie", category: "traitement", synonyms: [], specialty: "radiotherapie",
    definition: "Traitement du cancer utilisant des rayonnements pour détruire les cellules tumorales tout en préservant au maximum les tissus voisins. Elle est délivrée en séances, souvent indolores, planifiées par une équipe spécialisée." },
  { slug: "kinesitherapie", term: "Kinésithérapie", category: "traitement", synonyms: ["rééducation", "kiné"], specialty: "kinesitherapie",
    definition: "Ensemble de techniques manuelles et d'exercices visant à restaurer le mouvement et la fonction (après une blessure, une opération ou dans une maladie chronique). Elle est réalisée par un kinésithérapeute, souvent sur prescription médicale." },
  { slug: "antihistaminique", term: "Antihistaminique", category: "traitement", synonyms: [], specialty: "allergologie",
    definition: "Médicament qui atténue les symptômes des allergies (éternuements, écoulement nasal, démangeaisons, urticaire) en bloquant l'action de l'histamine. Certains peuvent entraîner une somnolence ; suivez les conseils du pharmacien ou du médecin." },
  { slug: "antidepresseur", term: "Antidépresseur", category: "traitement", synonyms: [], specialty: "psychiatrie",
    definition: "Médicament utilisé pour traiter la dépression et certains troubles anxieux. Son effet met plusieurs semaines à s'installer. Il ne doit être ni arrêté brutalement ni pris sans suivi médical, en complément d'une prise en charge globale." },

  // ── ANATOMIE ────────────────────────────────────────────────
  { slug: "thyroide", term: "Thyroïde", category: "anatomie", synonyms: [], specialty: "endocrinologie-et-maladies-metaboliques",
    definition: "Glande située à la base du cou, en forme de papillon, qui produit des hormones réglant le métabolisme (énergie, poids, température). Son dysfonctionnement (hypo- ou hyperthyroïdie) retentit sur l'ensemble de l'organisme." },
  { slug: "prostate", term: "Prostate", category: "anatomie", synonyms: [], specialty: "urologie-et-chirurgie-urologique",
    definition: "Glande de l'appareil génital masculin, située sous la vessie, qui participe à la production du sperme. Elle augmente souvent de volume avec l'âge, ce qui peut gêner la miction et justifier une surveillance urologique." },
  { slug: "coeur", term: "Cœur", category: "anatomie", synonyms: [], specialty: "cardiologie",
    definition: "Organe musculaire qui pompe le sang dans tout le corps grâce à des contractions régulières. Il comprend quatre cavités et assure la circulation de l'oxygène vers les organes. Ses maladies figurent parmi les premières causes de mortalité." },
  { slug: "poumons", term: "Poumons", category: "anatomie", synonyms: [], specialty: "pneumo-phtisiologie",
    definition: "Les deux organes de la respiration, situés dans le thorax, où l'oxygène de l'air passe dans le sang et le gaz carbonique est éliminé. Le tabac, les infections et la pollution comptent parmi leurs principales agressions." },

  // ── GÉNÉRAL ─────────────────────────────────────────────────
  { slug: "imc", term: "Indice de masse corporelle (IMC)", category: "general", synonyms: ["IMC"], specialty: "nutrition",
    definition: "Rapport entre le poids et la taille (poids en kg divisé par la taille en mètres au carré) servant à estimer la corpulence. Un IMC entre 18,5 et 25 est considéré comme normal ; au-delà de 30, on parle d'obésité. C'est un repère, pas un diagnostic." },
  { slug: "amo", term: "Assurance maladie obligatoire (AMO)", category: "general", synonyms: ["AMO"], specialty: "sante-publique-et-medecine-sociale",
    definition: "Régime de couverture santé de base au Maroc, qui rembourse une partie des soins, consultations, médicaments et hospitalisations selon des tarifs de référence. Elle est gérée notamment par la CNSS ; le reste à charge dépend de la couverture." },
  { slug: "effet-secondaire", term: "Effet secondaire", category: "general", synonyms: ["effet indésirable"], specialty: "pharmacologie",
    definition: "Effet non recherché d'un médicament, en plus de son action attendue. Il va du bénin (somnolence, nausée) au grave (allergie). Tout effet inhabituel doit être signalé au médecin ou au pharmacien ; certains justifient d'arrêter le traitement." },
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
      term: t.term, definition: t.definition, category: t.category,
      synonyms: t.synonyms ?? [], specialtyId, relatedSlug: t.related ?? null,
      sources: t.sources ? JSON.stringify(t.sources) : null, status: "PUBLISHED",
    };
    await prisma.glossaryTerm.upsert({ where: { slug: t.slug }, create: { slug: t.slug, ...data }, update: data });
    done++;
  }
  console.log(`✓ ${done} termes (lot 2) semés (reviewedAt=null → noindex).`);
  if (missingSpec.size) console.warn(`⚠️ spécialités introuvables : ${[...missingSpec].join(", ")}`);
}
main().finally(() => prisma.$disconnect());
