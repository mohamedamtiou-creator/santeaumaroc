require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Backfill E-E-A-T + GEO pour les articles existants :
 *  - signature éditoriale médicale sur le(s) compte(s) auteur
 *  - date de vérification médicale (reviewedAt = lastReviewed)
 *  - « À retenir » (keyTakeaways) + FAQ structurée (faqJson)
 *
 * Idempotent : ré-exécutable sans dupliquer.
 */

// Signature éditoriale honnête (pas de n° d'ordre fabriqué)
const EDITORIAL = {
  jobTitle: "Rédaction médicale — SantéauMaroc",
  credentials:
    "Contenus élaborés à partir de sources médicales de référence (OMS, Ministère de la Santé du Maroc, HAS, sociétés savantes) et relus avant publication.",
  bio:
    "L'équipe de rédaction médicale de SantéauMaroc produit des contenus de santé fiables, sourcés et adaptés au contexte marocain, dans le seul but d'informer — jamais de remplacer une consultation.",
};

const ARTICLES = {
  "hypertension-arterielle-maroc": {
    keyTakeaways: [
      "L'hypertension est définie par une tension ≥ 140/90 mmHg mesurée à plusieurs reprises ; elle est le plus souvent silencieuse.",
      "Premiers leviers : réduire le sel, bouger 30 min/jour, limiter l'alcool et le tabac, gérer le stress et le poids.",
      "Un dépistage régulier est recommandé dès 40 ans, ou plus tôt en cas d'antécédents familiaux.",
      "Non traitée, elle augmente fortement le risque d'AVC, d'infarctus et d'insuffisance rénale.",
    ],
    faq: [
      { q: "Quelle tension est considérée comme normale ?", a: "Une tension est considérée normale en dessous de 120/80 mmHg. On parle d'hypertension à partir de 140/90 mmHg confirmée sur plusieurs mesures, au repos et à des moments différents." },
      { q: "L'hypertension donne-t-elle des symptômes ?", a: "Le plus souvent non : c'est une maladie silencieuse. Certaines personnes ressentent maux de tête, vertiges ou palpitations, mais l'absence de symptômes ne signifie pas l'absence de risque. Seule la mesure régulière permet de la détecter." },
      { q: "Peut-on faire baisser sa tension sans médicament ?", a: "Une hypertension légère peut souvent être améliorée par l'hygiène de vie : moins de sel, activité physique régulière, perte de poids, arrêt du tabac et réduction de l'alcool. Le médecin décide si un traitement est nécessaire ; ne jamais l'arrêter seul." },
      { q: "À quelle fréquence mesurer sa tension ?", a: "Au moins une fois par an à partir de 40 ans, et plus souvent en cas d'antécédents familiaux, de surpoids, de diabète ou de tension déjà élevée. Un automesureur validé à domicile est utile pour le suivi." },
    ],
  },

  "diabete-type-2-maroc": {
    keyTakeaways: [
      "Le diabète de type 2 se caractérise par une glycémie chroniquement élevée, souvent liée au surpoids et à la sédentarité.",
      "Il évolue longtemps sans symptômes : le dépistage par prise de sang est essentiel après 45 ans ou en cas de facteurs de risque.",
      "Alimentation équilibrée, activité physique et perte de poids peuvent prévenir ou retarder la maladie.",
      "Un bon contrôle glycémique protège les yeux, les reins, les nerfs et le cœur.",
    ],
    faq: [
      { q: "Quels sont les premiers signes du diabète de type 2 ?", a: "Soif intense, envie fréquente d'uriner, fatigue, vision floue ou cicatrisation lente. Mais la maladie est souvent silencieuse pendant des années, d'où l'importance du dépistage par glycémie à jeun." },
      { q: "Peut-on guérir du diabète de type 2 ?", a: "On ne parle pas de guérison définitive, mais une perte de poids et un mode de vie adapté peuvent normaliser la glycémie et permettre, dans certains cas, de réduire voire suspendre les traitements, toujours sous suivi médical." },
      { q: "Quelle alimentation adopter ?", a: "Privilégier légumes, légumineuses, céréales complètes et bonnes graisses (huile d'olive) ; limiter sucres rapides, sodas, pâtisseries et féculents raffinés. L'alimentation méditerranéenne marocaine est un excellent modèle." },
      { q: "Comment se faire dépister au Maroc ?", a: "Une simple prise de sang (glycémie à jeun ou HbA1c) prescrite par un médecin généraliste suffit. Le dépistage est conseillé dès 45 ans, ou plus tôt en cas de surpoids, d'antécédents familiaux ou de diabète gestationnel." },
    ],
  },

  "alimentation-mediterraneenne-maroc": {
    keyTakeaways: [
      "L'alimentation méditerranéenne — proche de la cuisine marocaine traditionnelle — est l'un des régimes les mieux validés scientifiquement.",
      "Elle repose sur les légumes, fruits, légumineuses, céréales complètes, huile d'olive et poisson, avec peu de viande rouge et de produits transformés.",
      "Elle réduit le risque de maladies cardiovasculaires, de diabète de type 2 et de certains cancers.",
      "Tajines de légumes, soupes de légumineuses, huile d'olive et fruits secs en font un modèle accessible au quotidien.",
    ],
    faq: [
      { q: "La cuisine marocaine est-elle méditerranéenne ?", a: "En grande partie oui : légumes, légumineuses (pois chiches, lentilles, fèves), huile d'olive, céréales et fruits secs en sont des piliers. Il suffit souvent de limiter le sucre, le sel et les fritures pour en tirer tous les bénéfices." },
      { q: "Quels aliments privilégier au quotidien ?", a: "Légumes et fruits à chaque repas, légumineuses plusieurs fois par semaine, huile d'olive comme matière grasse principale, poisson 1 à 2 fois par semaine, et céréales complètes (pain complet, orge, boulgour)." },
      { q: "Quels aliments limiter ?", a: "Les sucres rapides (pâtisseries, sodas, thé très sucré), la viande rouge en excès, la charcuterie, les fritures et les produits ultra-transformés." },
      { q: "Ce régime aide-t-il à perdre du poids ?", a: "Il favorise un poids sain grâce à sa richesse en fibres et sa satiété, sans privation. Associé à l'activité physique, il aide à la gestion durable du poids plus efficacement que les régimes restrictifs." },
    ],
  },

  "cancer-sein-maroc-depistage-prevention": {
    keyTakeaways: [
      "Le cancer du sein est le cancer le plus fréquent chez la femme au Maroc ; dépisté tôt, il se guérit dans la grande majorité des cas.",
      "L'autopalpation mensuelle et l'examen clinique annuel permettent de repérer toute anomalie précocement.",
      "La mammographie de dépistage est recommandée régulièrement à partir de 40-45 ans, plus tôt en cas d'antécédents familiaux.",
      "Toute boule, modification de la peau ou du mamelon doit amener à consulter sans tarder.",
    ],
    faq: [
      { q: "À quel âge commencer la mammographie ?", a: "Le dépistage par mammographie est généralement recommandé à partir de 40 à 45 ans, puis de façon régulière. En cas d'antécédents familiaux de cancer du sein, un suivi plus précoce et rapproché peut être proposé par le médecin." },
      { q: "Comment faire une autopalpation ?", a: "Une fois par mois, quelques jours après les règles, palper chaque sein et l'aisselle à la recherche d'une boule, d'un changement de forme, de la peau ou du mamelon. Au moindre doute, consulter un médecin." },
      { q: "Quels sont les signes qui doivent alerter ?", a: "Une boule dure et indolore, une modification de la taille ou de la forme du sein, une rétraction ou un écoulement du mamelon, une peau d'orange ou une rougeur persistante. Ces signes imposent une consultation rapide." },
      { q: "Peut-on réduire son risque ?", a: "On ne peut pas l'éviter totalement, mais limiter l'alcool, maintenir un poids sain, pratiquer une activité physique et allaiter quand c'est possible réduisent le risque. Le dépistage reste la meilleure protection." },
    ],
  },

  "stress-chronique-burn-out-maroc": {
    keyTakeaways: [
      "Le stress chronique épuise l'organisme et peut évoluer vers un burn-out, surtout en contexte professionnel.",
      "Signes d'alerte : fatigue persistante, troubles du sommeil, irritabilité, perte de motivation et difficultés de concentration.",
      "Sommeil, activité physique, lien social et techniques de respiration aident à réguler le stress au quotidien.",
      "Quand le retentissement est important, consulter un médecin ou un professionnel de santé mentale est essentiel.",
    ],
    faq: [
      { q: "Quelle différence entre stress et burn-out ?", a: "Le stress est une réaction d'adaptation normale et passagère. Le burn-out est un épuisement profond — physique, émotionnel et mental — installé après une exposition prolongée au stress, souvent lié au travail, avec perte de motivation et sentiment d'échec." },
      { q: "Quels sont les signes du burn-out ?", a: "Fatigue intense qui ne passe pas au repos, troubles du sommeil, cynisme ou détachement, irritabilité, troubles de la concentration, et parfois symptômes physiques (maux de tête, douleurs, troubles digestifs)." },
      { q: "Comment gérer le stress au quotidien ?", a: "Préserver un sommeil régulier, pratiquer une activité physique, fractionner les tâches, poser des limites, entretenir le lien social et utiliser des techniques de respiration ou de relaxation. Réduire la caféine et le temps d'écran aide aussi." },
      { q: "Quand consulter ?", a: "Dès que le stress retentit durablement sur le sommeil, l'humeur, le travail ou les relations, ou en cas de signes dépressifs. Un médecin généraliste, un psychiatre ou un psychologue peuvent accompagner et orienter vers la prise en charge adaptée." },
    ],
  },
};

async function main() {
  const reviewedAt = new Date();
  let updatedPosts = 0;
  const authorIds = new Set();

  for (const [slug, data] of Object.entries(ARTICLES)) {
    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true, authorId: true } });
    if (!post) { console.log("  – introuvable, ignoré :", slug); continue; }

    await prisma.post.update({
      where: { id: post.id },
      data: {
        keyTakeaways: data.keyTakeaways.join("\n"),
        faqJson: JSON.stringify(data.faq),
        reviewedAt,
      },
    });
    authorIds.add(post.authorId);
    updatedPosts++;
    console.log("  ✓ article :", slug);
  }

  // Signature éditoriale sur les comptes auteurs concernés
  for (const id of authorIds) {
    await prisma.user.update({ where: { id }, data: EDITORIAL });
    console.log("  ✓ signature auteur :", id);
  }

  console.log(`\nTerminé : ${updatedPosts} article(s), ${authorIds.size} auteur(s) mis à jour.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
