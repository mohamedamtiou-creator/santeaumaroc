require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// PILIER du cocon Hypertension : hypertension-arterielle-maroc.
// Fiche « Maladie » de référence — même gabarit que scripts/seed-article-diabete.cjs :
// définition, causes, facteurs de risque, symptômes, diagnostic, examens,
// complications, traitements, prévention, quand consulter + FAQ + À retenir.
// Optimisé SEO/GEO/E-E-A-T : keyTakeaways, faqJson (FAQPage), aboutEntity
// (MedicalCondition), relecture médicale. Idempotent (upsert + update complet).
// Catégorie CORRIGÉE : maladies-traitements (l'HTA est une maladie chronique,
// alignée sur le pilier diabète), au lieu de prevention-sante précédemment.
// Les satellites (symptômes, alimentation, mesure de tension) sont rattachés par
// scripts/seed-blog-diabete-hta.cjs, à lancer APRÈS ce script.
// ════════════════════════════════════════════════════════════════════════════

const content = `<p>L'hypertension artérielle (HTA) est l'une des maladies chroniques les plus répandues au Maroc : elle concerne près d'un adulte sur trois, et beaucoup l'ignorent. On la surnomme le « tueur silencieux » car elle progresse sans bruit pendant des années tout en abîmant le cœur, le cerveau, les reins et les yeux. La bonne nouvelle : dépistée à temps, elle se contrôle très bien. Encore faut-il penser à mesurer sa tension.</p>

<h2>Qu'est-ce que l'hypertension artérielle ?</h2>
<p>La tension artérielle est la pression exercée par le sang sur la paroi des artères. Elle s'exprime par deux chiffres, par exemple <strong>12/8</strong> (soit 120/80 mmHg) : le premier (systolique) correspond à la contraction du cœur, le second (diastolique) à son relâchement.</p>
<p>On parle d'hypertension lorsque cette pression reste durablement trop élevée — au-delà de <strong>140/90 mmHg</strong> mesurée au cabinet, sur des mesures répétées. Ce n'est pas un simple chiffre : c'est un facteur de risque majeur d'accident vasculaire cérébral (AVC) et d'infarctus.</p>

<h3>Comment lire les chiffres de tension ?</h3>
<table>
<thead><tr><th>Tension (au cabinet)</th><th>Interprétation</th></tr></thead>
<tbody>
<tr><td>&lt; 120/80 mmHg (12/8)</td><td>Optimale</td></tr>
<tr><td>120–139 / 80–89</td><td>Normale à normale-haute</td></tr>
<tr><td>140–159 / 90–99</td><td>Hypertension légère (grade 1)</td></tr>
<tr><td>≥ 160/100</td><td>Hypertension modérée à sévère (grades 2–3)</td></tr>
</tbody>
</table>
<p>Le diagnostic ne se pose jamais sur une seule mesure : la tension varie au fil de la journée et peut monter au cabinet (« effet blouse blanche »).</p>

<h2>Quelles sont les causes et les facteurs de risque ?</h2>
<p>Dans plus de 9 cas sur 10, aucune cause unique n'est retrouvée : on parle d'hypertension <strong>essentielle</strong>, favorisée par la combinaison de l'hérédité et du mode de vie. Plus rarement, l'HTA est <strong>secondaire</strong> à une autre maladie (rénale, hormonale) ou à certains médicaments — une piste explorée surtout chez les sujets jeunes ou les cas résistants.</p>
<p>Les principaux facteurs de risque, sur lesquels on peut agir :</p>
<ul>
<li><strong>Alimentation trop salée</strong> : le sel retient l'eau et élève la pression.</li>
<li><strong>Surpoids et obésité</strong>, notamment abdominale.</li>
<li><strong>Sédentarité</strong> et manque d'activité physique.</li>
<li><strong>Tabac</strong> et <strong>consommation excessive d'alcool</strong>.</li>
<li><strong>Stress chronique</strong>, mauvais sommeil.</li>
<li><strong>Âge</strong> (le risque augmente après 50 ans) et <strong>hérédité</strong>.</li>
<li><strong>Diabète</strong> et excès de cholestérol, souvent associés (voir notre fiche sur le <a href="/blog/diabete-type-2-maroc">diabète de type 2</a>).</li>
</ul>
<blockquote>Bon à savoir : l'hypertension et le diabète se renforcent mutuellement et multiplient le risque cardiovasculaire. Lorsqu'ils coexistent, le contrôle de la tension devient encore plus important.</blockquote>

<h2>Quels sont les symptômes de l'hypertension ?</h2>
<p>Le plus souvent, <strong>aucun</strong>. C'est tout le piège : on peut être hypertendu depuis des années en se sentant parfaitement bien. Quand des signes existent, ils sont peu spécifiques :</p>
<ul>
<li>Maux de tête, surtout le matin, à l'arrière du crâne</li>
<li>Vertiges, sensation d'instabilité</li>
<li>Bourdonnements d'oreilles (acouphènes)</li>
<li>Fatigue, troubles du sommeil</li>
<li>Saignements de nez à répétition, mouches devant les yeux</li>
</ul>
<p>Ces symptômes n'étant ni constants ni fiables, seule la mesure de la tension permet le diagnostic. Nous détaillons ces signes dans notre article : <a href="/blog/symptomes-hypertension-arterielle-maroc">symptômes de l'hypertension, le « tueur silencieux »</a>.</p>

<h2>Comment diagnostique-t-on l'hypertension ?</h2>
<p>Le diagnostic repose sur des mesures répétées, confirmées en dehors du cabinet. Trois approches se complètent :</p>
<ul>
<li><strong>Mesure au cabinet</strong> : plusieurs relevés, au repos, lors de consultations différentes.</li>
<li><strong>Automesure à domicile</strong> : la « règle des 3 » — 3 mesures le matin et 3 le soir, pendant 3 jours (voir <a href="/blog/mesurer-tension-arterielle-maroc">comment bien mesurer sa tension à domicile</a>).</li>
<li><strong>MAPA (Holter tensionnel)</strong> : un brassard mesure la tension sur 24 heures, utile en cas de doute.</li>
</ul>
<table>
<thead><tr><th>Lieu de mesure</th><th>Seuil d'hypertension</th></tr></thead>
<tbody>
<tr><td>Au cabinet</td><td>≥ 140/90 mmHg</td></tr>
<tr><td>Automesure à domicile</td><td>≥ 135/85 mmHg</td></tr>
<tr><td>MAPA (moyenne sur 24 h)</td><td>≥ 130/80 mmHg</td></tr>
</tbody>
</table>

<h3>Quels examens après le diagnostic ?</h3>
<p>Une fois l'HTA confirmée, le médecin recherche son retentissement et les autres facteurs de risque : électrocardiogramme (ECG), prise de sang (fonction rénale, ionogramme, glycémie, bilan lipidique), recherche de protéines dans les urines, et parfois un fond d'œil. Ce bilan oriente le traitement et le suivi.</p>

<h2>Quelles complications si l'hypertension n'est pas traitée ?</h2>
<p>Une pression trop élevée use les artères en permanence. Les complications s'installent en silence, d'où l'importance d'un bon contrôle :</p>
<table>
<thead><tr><th>Organe</th><th>Complication possible</th></tr></thead>
<tbody>
<tr><td>Cerveau</td><td>Accident vasculaire cérébral (AVC)</td></tr>
<tr><td>Cœur</td><td>Infarctus, insuffisance cardiaque</td></tr>
<tr><td>Reins</td><td>Insuffisance rénale</td></tr>
<tr><td>Yeux</td><td>Atteinte de la rétine (baisse de la vue)</td></tr>
<tr><td>Artères des jambes</td><td>Artérite des membres inférieurs</td></tr>
</tbody>
</table>
<blockquote>Attention : consultez en urgence si une poussée de tension s'accompagne de douleur dans la poitrine, d'essoufflement brutal, de troubles de la vision ou de la parole, d'une faiblesse d'un côté du corps ou de violents maux de tête. Ces signes peuvent annoncer une urgence (AVC, infarctus).</blockquote>

<h2>Comment se soigne l'hypertension artérielle ?</h2>
<p>Une fois diagnostiquée, l'hypertension se traite très efficacement. L'objectif est de ramener la tension sous 140/90 mmHg (parfois plus bas selon le profil) pour protéger le cœur, le cerveau et les reins.</p>

<h3>1. Les mesures hygiéno-diététiques</h3>
<p>Elles constituent la base et suffisent parfois dans les formes légères :</p>
<ul>
<li><strong>Réduire le sel</strong> : moins de 5 g par jour (OMS), en se méfiant du sel caché des aliments transformés (voir <a href="/blog/alimentation-anti-hypertension-maroc">l'alimentation anti-hypertension</a>).</li>
<li><strong>Bouger</strong> : environ 30 minutes de marche par jour.</li>
<li><strong>Perdre du poids</strong> si nécessaire : quelques kilos font déjà baisser la tension.</li>
<li><strong>Limiter l'alcool</strong> et <strong>arrêter le tabac</strong>.</li>
</ul>

<h3>2. Les médicaments antihypertenseurs</h3>
<p>Quand l'hygiène de vie ne suffit pas, le médecin prescrit un ou plusieurs médicaments, souvent à prendre au long cours. Les grandes familles :</p>
<table>
<thead><tr><th>Famille</th><th>Action</th></tr></thead>
<tbody>
<tr><td>Diurétiques thiazidiques</td><td>Aident les reins à éliminer le sel et l'eau</td></tr>
<tr><td>IEC et sartans (ARA2)</td><td>Relâchent les artères en bloquant une hormone vasoconstrictrice</td></tr>
<tr><td>Inhibiteurs calciques</td><td>Dilatent les vaisseaux sanguins</td></tr>
<tr><td>Bêta-bloquants</td><td>Ralentissent le cœur et réduisent sa charge de travail</td></tr>
</tbody>
</table>
<p>Le choix dépend de votre profil (âge, diabète, reins, cœur). <strong>Ne jamais arrêter ni modifier son traitement sans avis médical</strong>, même si la tension redevient normale : c'est justement le signe qu'il fonctionne.</p>

<h3>3. Le suivi</h3>
<p>Un suivi régulier permet de vérifier l'efficacité et la tolérance du traitement, et d'adapter les doses. L'automesure à domicile, notée dans un carnet, aide beaucoup le médecin à ajuster la prise en charge. L'objectif de tension est par ailleurs <strong>personnalisé</strong> : il peut être un peu plus souple chez la personne âgée, et plus strict en cas de diabète ou d'atteinte rénale.</p>

<h2>Comment prévenir l'hypertension ?</h2>
<p>Les mêmes règles qui traitent l'HTA aident aussi à l'éviter, surtout en présence de facteurs de risque :</p>
<ul>
<li>Limiter le sel et privilégier fruits, légumes et poisson (riches en potassium — régime type DASH).</li>
<li>Maintenir un poids sain et une activité physique régulière.</li>
<li>Ne pas fumer et limiter l'alcool.</li>
<li>Gérer le stress et soigner son sommeil.</li>
<li>Faire contrôler sa tension au moins une fois par an à partir de 40 ans.</li>
</ul>

<h2>Hypertension et grossesse</h2>
<p>Une tension élevée pendant la grossesse mérite une surveillance particulière. Elle peut exister avant la grossesse ou apparaître après la 20e semaine (hypertension gravidique). Associée à la présence de protéines dans les urines, elle définit la <strong>prééclampsie</strong>, une complication qui impose une prise en charge rapide.</p>
<p>Certains signes doivent amener à consulter sans attendre : maux de tête violents, troubles de la vision (mouches, vision trouble), douleur en barre au niveau de l'estomac, gonflement brutal du visage et des mains. Un suivi régulier, avec mesure de la tension à chaque consultation, permet de repérer ces situations à temps (voir notre guide sur le <a href="/blog/suivi-grossesse-maroc">suivi de grossesse au Maroc</a>).</p>

<h2>Hypertension : quand consulter ?</h2>
<p>Prenez rendez-vous si vous découvrez des chiffres élevés en automesure, si vous avez des facteurs de risque, ou simplement pour un contrôle annuel après 40 ans. Le <a href="/specialites/medecine-generale">médecin généraliste</a> assure le dépistage et le suivi de la plupart des hypertensions ; il vous oriente vers un <a href="/specialites/cardiologie">cardiologue</a> en cas d'HTA difficile à équilibrer, de complications ou de maladie cardiaque associée.</p>

<h2>Vivre avec l'hypertension au Maroc</h2>
<p>Bien traitée, l'hypertension n'empêche pas de mener une vie tout à fait normale. La clé est l'<strong>observance</strong> : prendre son traitement chaque jour, à heure fixe, et poursuivre l'automesure. Beaucoup d'abandons surviennent parce que « on se sent bien » — or c'est précisément le traitement qui maintient cet équilibre.</p>
<p>Sur le plan de la prise en charge, l'hypertension sévère ou compliquée peut relever des affections de longue durée (ALD) : l'assurance maladie obligatoire (CNSS pour le privé, CNOPS pour le public) couvre alors une partie des soins, selon le barème en vigueur. Renseignez-vous auprès de votre organisme.</p>

<h2>Idées reçues sur l'hypertension</h2>
<ul>
<li><strong>« Je le sentirais si ma tension était trop haute. »</strong> Faux : l'hypertension est le plus souvent sans symptôme. Seule la mesure la révèle.</li>
<li><strong>« Ma tension est bonne, je peux arrêter mon traitement. »</strong> Faux et risqué : c'est justement le traitement qui maintient ces bons chiffres. Tout arrêt se décide avec le médecin.</li>
<li><strong>« Le sel, c'est seulement la salière. »</strong> Faux : l'essentiel du sel vient des aliments transformés (pain, conserves, charcuterie, fromages salés).</li>
<li><strong>« L'hypertension ne touche que les personnes âgées. »</strong> Faux : elle est plus fréquente avec l'âge, mais concerne aussi des adultes jeunes, surtout en cas de surpoids ou d'antécédents familiaux.</li>
</ul>

<hr>
<p>Un chiffre de tension élevé, un doute, un renouvellement de traitement ? Sur SantéauMaroc, trouvez en quelques clics un médecin généraliste ou un cardiologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const faq = [
  {
    q: "À partir de quel chiffre parle-t-on d'hypertension ?",
    a: "À partir de 140/90 mmHg (14/9) mesurée au cabinet, sur des mesures répétées. En automesure à domicile, le seuil est de 135/85 mmHg. Le diagnostic ne se pose jamais sur une seule mesure, car la tension varie et peut monter au cabinet (« effet blouse blanche »).",
  },
  {
    q: "L'hypertension donne-t-elle des symptômes ?",
    a: "Le plus souvent non : c'est le « tueur silencieux ». La majorité des personnes hypertendues ne ressentent rien pendant des années. Des maux de tête, vertiges ou acouphènes peuvent exister, mais ils ne sont ni constants ni fiables. Seule la mesure de la tension permet le diagnostic.",
  },
  {
    q: "Comment faire baisser sa tension artérielle ?",
    a: "D'abord par l'hygiène de vie : réduire le sel (moins de 5 g par jour), marcher 30 minutes par jour, perdre du poids si besoin, limiter l'alcool et arrêter le tabac. Si cela ne suffit pas, le médecin prescrit un traitement médicamenteux, souvent à prendre au long cours.",
  },
  {
    q: "Le traitement de l'hypertension est-il à vie ?",
    a: "Souvent oui, car l'hypertension essentielle est une maladie chronique. Le traitement maintient la tension normale mais ne « guérit » pas la maladie : c'est pourquoi il ne faut jamais l'arrêter sans avis médical, même quand les chiffres sont bons. Dans certains cas, l'amélioration du mode de vie permet d'alléger le traitement.",
  },
  {
    q: "Quand l'hypertension est-elle une urgence ?",
    a: "En cas de tension très élevée accompagnée de douleur dans la poitrine, d'essoufflement brutal, de troubles de la vision ou de la parole, d'une faiblesse d'un côté du corps ou de violents maux de tête. Ces signes peuvent annoncer un AVC ou un infarctus : il faut consulter en urgence.",
  },
  {
    q: "Le stress provoque-t-il de l'hypertension ?",
    a: "Le stress provoque des pics ponctuels de tension et, lorsqu'il est chronique, il favorise l'hypertension et de mauvaises habitudes (tabac, mauvaise alimentation, mauvais sommeil). Il n'en est cependant pas la cause unique : l'hypertension est multifactorielle.",
  },
];

const keyTakeaways = [
  "L'hypertension artérielle touche près d'un adulte marocain sur trois et reste longtemps silencieuse.",
  "On parle d'hypertension à partir de 140/90 mmHg au cabinet (135/85 en automesure), sur mesures répétées.",
  "Non traitée, elle est une cause majeure d'AVC, d'infarctus et d'insuffisance rénale.",
  "Le traitement associe hygiène de vie (moins de sel, activité, poids) et, si besoin, des médicaments au long cours.",
  "Ne jamais arrêter son traitement sans avis médical, même si la tension est redevenue normale.",
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, email: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.findFirst({
    where: { slug: "maladies-traitements" },
    select: { id: true },
  });
  if (!cat) { console.error("Catégorie introuvable."); process.exit(1); }

  const now = new Date();

  // Champs rafraîchis à chaque exécution (idempotent). On NE touche PAS à pillarId
  // (pilier racine, réaffirmé null par seed-blog-diabete-hta.cjs). `featured`
  // conservé côté create ; non écrasé à l'update.
  const data = {
    title:        "Hypertension artérielle au Maroc : symptômes, causes et traitement",
    excerpt:      "L'hypertension touche près d'un adulte sur trois au Maroc, souvent sans symptôme. Chiffres, causes, complications, traitements et prévention : le guide complet pour comprendre et protéger son cœur.",
    content,
    categoryId:   cat.id,
    metaTitle:    "Hypertension artérielle au Maroc : symptômes et traitement",
    metaDesc:     "Hypertension artérielle : à partir de quels chiffres, symptômes, causes, complications (AVC, infarctus), traitements et prévention, expliqués et adaptés au Maroc.",
    readingTime:  9,
    keyTakeaways: keyTakeaways.join("\n"),
    faqJson:      JSON.stringify(faq),
    aboutEntity:  "Hypertension artérielle",
    reviewedById: admin.id,
    reviewedAt:   now,
  };

  const post = await prisma.post.upsert({
    where: { slug: "hypertension-arterielle-maroc" },
    update: data,
    create: {
      ...data,
      slug:        "hypertension-arterielle-maroc",
      authorId:    admin.id,
      status:      "PUBLISHED",
      publishedAt: now,
      featured:    true,
    },
    select: { slug: true, title: true, readingTime: true },
  });

  console.log("✓ Pilier Hypertension mis à jour (gabarit de référence)");
  console.log("  URL        : /blog/" + post.slug);
  console.log("  Titre      : " + post.title);
  console.log("  Catégorie  : maladies-traitements (corrigée)");
  console.log("  Lecture    : " + post.readingTime + " min");
  console.log("  FAQ        : " + faq.length + " questions | À retenir : " + keyTakeaways.length + " points");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
