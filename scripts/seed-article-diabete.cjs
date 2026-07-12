require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// PILIER du cocon Diabète : diabete-type-2-maroc (catégorie maladies-traitements).
// Fiche « Maladie » de référence — gabarit exhaustif conforme au brief éditorial :
// définition, causes, facteurs de risque, symptômes, diagnostic, examens,
// traitements, prévention, complications, quand consulter + FAQ + À retenir.
// Optimisé SEO/GEO/E-E-A-T : keyTakeaways (TL;DR), faqJson (FAQPage), aboutEntity
// (MedicalCondition), relecture médicale (reviewedAt). Idempotent (upsert + update
// complet). Les satellites (symptômes, Ramadan, alimentation, prix) sont rattachés
// par scripts/seed-blog-diabete-hta.cjs, à lancer APRÈS ce script.
// ════════════════════════════════════════════════════════════════════════════

const content = `<p>Au Maroc, le diabète est devenu l'une des premières maladies chroniques : selon la Fédération internationale du diabète (FID), il touche environ un adulte sur huit, et près de la moitié des personnes concernées l'ignorent encore. Le <strong>diabète de type 2</strong> représente la grande majorité des cas. Soif inhabituelle, fatigue persistante, cicatrisation lente : ces signaux discrets méritent d'être pris au sérieux. Comprendre la maladie, c'est déjà se donner les moyens d'agir — car dépisté tôt, le diabète se contrôle très bien.</p>

<h2>Qu'est-ce que le diabète de type 2 ?</h2>
<p>Le diabète de type 2 est une maladie chronique caractérisée par un taux de sucre (glucose) durablement trop élevé dans le sang : c'est l'<strong>hyperglycémie</strong>. En temps normal, une hormone fabriquée par le pancréas — l'<strong>insuline</strong> — permet au glucose d'entrer dans les cellules pour y être utilisé comme carburant.</p>
<p>Dans le diabète de type 2, deux mécanismes se combinent : les cellules répondent mal à l'insuline (on parle de <strong>résistance à l'insuline</strong>), et le pancréas, qui compense d'abord en produisant davantage d'insuline, finit par s'épuiser. Le glucose s'accumule alors dans le sang. Cette installation est lente et progressive, le plus souvent après 40 ans — mais elle survient de plus en plus tôt.</p>

<h3>Diabète de type 1, type 2, gestationnel : quelles différences ?</h3>
<table>
<thead><tr><th>Type</th><th>Mécanisme</th><th>Particularités</th></tr></thead>
<tbody>
<tr><td>Type 1</td><td>Maladie auto-immune : le pancréas ne produit plus d'insuline</td><td>Souvent chez l'enfant ou le jeune adulte ; insuline indispensable dès le diagnostic</td></tr>
<tr><td>Type 2</td><td>Résistance à l'insuline + épuisement progressif du pancréas</td><td>Le plus fréquent ; lié au mode de vie et à l'hérédité ; longtemps silencieux</td></tr>
<tr><td>Gestationnel</td><td>Hyperglycémie apparaissant pendant la grossesse</td><td>Disparaît souvent après l'accouchement, mais augmente le risque de type 2 ensuite</td></tr>
</tbody>
</table>

<h2>Quelles sont les causes et les facteurs de risque ?</h2>
<p>Le diabète de type 2 résulte de la rencontre entre une <strong>prédisposition génétique</strong> et un <strong>mode de vie</strong>. On ne choisit pas ses gènes, mais on peut agir sur la plupart des autres facteurs. Les principaux sont :</p>
<ol>
<li><strong>Surpoids et obésité</strong>, en particulier la graisse abdominale — le facteur le plus déterminant.</li>
<li><strong>Sédentarité</strong> : un mode de vie peu actif aggrave la résistance à l'insuline.</li>
<li><strong>Alimentation déséquilibrée</strong> : excès de sucres rapides, de boissons sucrées et de graisses, manque de fibres.</li>
<li><strong>Antécédents familiaux</strong> : avoir un parent proche diabétique augmente nettement le risque.</li>
<li><strong>Âge</strong> : le risque s'élève après 45 ans.</li>
<li><strong>Antécédent de diabète gestationnel</strong> ou naissance d'un bébé de poids élevé.</li>
<li><strong>Hypertension artérielle et excès de cholestérol</strong>, fréquemment associés (voir notre guide sur <a href="/blog/hypertension-arterielle-maroc">l'hypertension artérielle</a>).</li>
</ol>
<blockquote>Bon à savoir : la présence de plusieurs de ces facteurs justifie un dépistage régulier de la glycémie, même en l'absence de tout symptôme. Le prédiabète, stade réversible qui précède la maladie, se repère uniquement par une prise de sang.</blockquote>

<h2>Quels sont les symptômes du diabète ?</h2>
<p>Le diabète de type 2 est souvent qualifié de « maladie silencieuse » : il peut évoluer des années sans se manifester. Lorsqu'ils apparaissent, les signes sont liés à l'excès de sucre que l'organisme cherche à éliminer par les urines :</p>
<ul>
<li>Soif intense et permanente (polydipsie)</li>
<li>Envies fréquentes d'uriner, y compris la nuit (polyurie)</li>
<li>Fatigue persistante sans raison apparente</li>
<li>Perte de poids inexpliquée, malgré un appétit conservé</li>
<li>Vision floue passagère</li>
<li>Plaies qui cicatrisent lentement, infections à répétition (urinaires, cutanées)</li>
<li>Fourmillements ou engourdissements des mains et des pieds</li>
</ul>
<p>Ces symptômes sont détaillés dans notre article dédié : <a href="/blog/diabete-symptomes-signes-maroc">les 6 signes du diabète qui doivent alerter</a>. Devant plusieurs de ces signes, une simple prise de sang permet de trancher.</p>

<h2>Comment diagnostique-t-on le diabète ?</h2>
<p>Le diagnostic repose sur des dosages sanguins simples, remboursés dans le cadre du suivi. Trois examens sont utilisés :</p>
<ul>
<li><strong>Glycémie à jeun</strong> : mesure du sucre après au moins 8 heures sans manger. C'est l'examen de première intention.</li>
<li><strong>Hémoglobine glyquée (HbA1c)</strong> : reflète la glycémie moyenne des trois derniers mois ; elle sert aussi au suivi.</li>
<li><strong>Hyperglycémie provoquée par voie orale (HGPO)</strong> : mesure de la glycémie 2 heures après l'ingestion de 75 g de glucose, utilisée dans certaines situations (grossesse, résultats douteux).</li>
</ul>
<table>
<thead><tr><th>Examen</th><th>Prédiabète</th><th>Diabète</th></tr></thead>
<tbody>
<tr><td>Glycémie à jeun</td><td>1,10 – 1,25 g/L</td><td>≥ 1,26 g/L (à 2 reprises)</td></tr>
<tr><td>HbA1c</td><td>5,7 – 6,4 %</td><td>≥ 6,5 %</td></tr>
<tr><td>Glycémie 2 h après HGPO</td><td>1,40 – 1,99 g/L</td><td>≥ 2,00 g/L</td></tr>
</tbody>
</table>
<p>Ces seuils sont indicatifs : seul un médecin interprète vos résultats au regard de votre situation. Un diabète peut aussi être affirmé devant une glycémie prise à n'importe quel moment ≥ 2,00 g/L accompagnée de symptômes.</p>

<h2>Le prédiabète : agir avant le diabète</h2>
<p>Entre une glycémie normale et le diabète existe une zone intermédiaire : le <strong>prédiabète</strong>. La glycémie y est plus élevée que la normale sans atteindre le seuil de la maladie (glycémie à jeun entre 1,10 et 1,25 g/L, ou HbA1c entre 5,7 et 6,4 %). C'est un stade décisif, car il est le plus souvent <strong>réversible</strong>.</p>
<p>À ce moment précis, une perte de poids modérée, une alimentation équilibrée et une activité physique régulière peuvent suffire à ramener la glycémie à la normale et à éviter — ou retarder de plusieurs années — le passage au diabète. Comme la maladie, le prédiabète ne donne aucun symptôme : il ne se découvre que par une prise de sang. C'est tout l'intérêt du dépistage chez les personnes à risque.</p>

<h2>Quelles complications si le diabète n'est pas contrôlé ?</h2>
<p>Une glycémie élevée durant des années abîme silencieusement les vaisseaux sanguins et les nerfs. C'est tout l'enjeu d'un bon contrôle : prévenir des complications qui, une fois installées, sont difficilement réversibles.</p>
<table>
<thead><tr><th>Organe touché</th><th>Complication possible</th></tr></thead>
<tbody>
<tr><td>Yeux</td><td>Rétinopathie diabétique, pouvant menacer la vue</td></tr>
<tr><td>Reins</td><td>Néphropathie, jusqu'à l'insuffisance rénale</td></tr>
<tr><td>Nerfs</td><td>Neuropathie : fourmillements, perte de sensibilité des pieds</td></tr>
<tr><td>Pieds</td><td>Plaies, infections, « pied diabétique » (risque d'amputation)</td></tr>
<tr><td>Cœur et vaisseaux</td><td>Infarctus, accident vasculaire cérébral (AVC), artérite</td></tr>
</tbody>
</table>
<blockquote>Attention : consultez rapidement en cas de soif intense avec vomissements, douleurs abdominales, respiration rapide, haleine à l'odeur fruitée ou somnolence inhabituelle. Ces signes peuvent traduire une décompensation aiguë (acidocétose) et constituent une urgence médicale.</blockquote>

<h2>Comment se soigne le diabète de type 2 ?</h2>
<p>Il n'existe pas de « guérison » du diabète de type 2, mais la maladie se gère très bien. L'objectif est de ramener et de maintenir la glycémie dans une zone sûre pour éviter les complications. Le traitement s'appuie sur plusieurs piliers, adaptés à chaque personne.</p>

<h3>1. Les mesures hygiéno-diététiques</h3>
<p>Elles constituent toujours la base du traitement. Pour un diabète débutant, une alimentation équilibrée et une activité physique régulière suffisent parfois à normaliser la glycémie. Nous détaillons les repas dans notre guide <a href="/blog/alimentation-diabete-cuisine-marocaine">alimentation et diabète : que manger dans la cuisine marocaine</a>.</p>

<h3>2. Les médicaments antidiabétiques</h3>
<p>Lorsque l'hygiène de vie ne suffit plus, un traitement par comprimés est instauré. Les principales classes prescrites au Maroc :</p>
<table>
<thead><tr><th>Classe</th><th>Action principale</th></tr></thead>
<tbody>
<tr><td>Metformine</td><td>Médicament de référence : réduit la production de glucose par le foie</td></tr>
<tr><td>Sulfamides hypoglycémiants</td><td>Stimulent la sécrétion d'insuline par le pancréas</td></tr>
<tr><td>Inhibiteurs de SGLT2</td><td>Éliminent l'excès de sucre par les urines ; protègent cœur et reins</td></tr>
<tr><td>Analogues du GLP-1</td><td>Ralentissent la digestion et favorisent la satiété ; aident à perdre du poids</td></tr>
</tbody>
</table>
<p>Le choix et l'association de ces médicaments relèvent du médecin. Ne modifiez jamais vous-même vos doses.</p>

<h3>3. L'insuline</h3>
<p>Dans les formes évoluées, quand le pancréas ne produit plus assez d'insuline, des injections deviennent nécessaires. Ce n'est pas un échec : c'est une évolution naturelle de la maladie, qui se traite efficacement.</p>

<h3>4. Le suivi régulier</h3>
<p>Un contrôle de l'<strong>HbA1c</strong> tous les 3 mois permet d'ajuster le traitement. L'objectif d'HbA1c, souvent situé autour de 7 %, est personnalisé par le médecin selon l'âge, l'ancienneté du diabète et les autres pathologies. Un bilan annuel complet — fond d'œil, bilan rénal, examen des pieds, bilan cardiovasculaire — dépiste les complications avant qu'elles ne s'installent. Certaines personnes pratiquent en plus l'<strong>autosurveillance</strong> de leur glycémie au doigt, selon les recommandations de leur médecin.</p>

<h2>Comment prévenir le diabète de type 2 ?</h2>
<p>C'est la bonne nouvelle : le diabète de type 2 est en grande partie <strong>évitable</strong>. Chez les personnes à risque (prédiabète), les grandes études de prévention montrent qu'un changement de mode de vie peut réduire de près de moitié le risque de développer la maladie.</p>
<h3>Bien manger</h3>
<ul>
<li>Privilégier les glucides complexes (pain complet, légumineuses, semoule complète) plutôt que les sucres rapides.</li>
<li>Augmenter les légumes, riches en fibres, à chaque repas.</li>
<li>Réduire sucreries, pâtisseries et boissons sucrées, jus industriels compris.</li>
<li>Cuisiner avec de l'huile d'olive et limiter les graisses animales.</li>
</ul>
<h3>Bouger régulièrement</h3>
<p>Environ <strong>30 minutes de marche rapide par jour</strong> améliorent la sensibilité à l'insuline et aident à maintenir un poids sain. Marche, natation ou vélo : l'essentiel est la régularité.</p>
<h3>Se faire dépister</h3>
<p>Si vous cumulez des facteurs de risque, demandez une glycémie à jeun lors de votre prochain bilan. Détecter un prédiabète, c'est pouvoir inverser la tendance à temps.</p>

<h2>Diabète : quand consulter ?</h2>
<p>Prenez rendez-vous sans tarder si vous présentez plusieurs symptômes évocateurs (soif, urines fréquentes, fatigue, perte de poids), ou si vous avez des facteurs de risque sans avoir jamais fait doser votre glycémie. Le <a href="/specialites/medecine-generale">médecin généraliste</a> est le premier interlocuteur ; il vous oriente si besoin vers un <a href="/specialites/endocrinologie-et-maladies-metaboliques">endocrinologue-diabétologue</a>, notamment pour le diagnostic initial, un diabète déséquilibré, un traitement par insuline ou l'apparition de complications.</p>

<h2>Vivre avec le diabète au Maroc</h2>
<p>Le diabète n'empêche pas de mener une vie pleine et active. Des milliers de Marocains diabétiques travaillent, voyagent et jeûnent — sous réserve, pour le Ramadan, d'une évaluation médicale préalable (voir <a href="/blog/diabete-ramadan-jeune-maroc">diabète et Ramadan : peut-on jeûner sans danger ?</a>).</p>
<p>Sur le plan financier, le diabète est reconnu comme une <strong>affection de longue durée (ALD)</strong> : l'assurance maladie obligatoire (CNSS pour le privé, CNOPS pour le public) prend en charge une partie des consultations, analyses et médicaments, selon le barème en vigueur. Pour situer le coût d'un suivi spécialisé, consultez notre article sur le <a href="/blog/prix-consultation-endocrinologue-maroc">prix d'une consultation chez l'endocrinologue au Maroc</a>.</p>
<h3>Reconnaître une hypoglycémie</h3>
<p>Chez les personnes traitées — en particulier par sulfamides ou insuline — la glycémie peut parfois chuter trop bas : c'est l'<strong>hypoglycémie</strong>. Elle se manifeste par des sueurs, des tremblements, une sensation de faim soudaine, des palpitations, une pâleur ou une confusion. Le bon réflexe : prendre aussitôt du sucre (3 morceaux, un verre de jus de fruit ou une cuillère de miel), puis un aliment plus consistant une fois le malaise passé. Une hypoglycémie sévère, avec perte de connaissance, est une urgence.</p>
<p>Enfin, l'<strong>éducation thérapeutique</strong> — apprendre à connaître sa maladie, lire les étiquettes, reconnaître une hypoglycémie — est aujourd'hui reconnue comme un véritable pilier du traitement. Un suivi régulier avec une diététicienne ou un infirmier formé fait souvent la différence.</p>

<hr>
<p>Un doute, des symptômes ou un simple besoin de faire le point ? Sur SantéauMaroc, trouvez en quelques clics un médecin généraliste ou un endocrinologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const faq = [
  {
    q: "Le diabète de type 2 se guérit-il ?",
    a: "On ne parle pas de guérison définitive, mais le diabète de type 2 se contrôle très bien. Chez certaines personnes, une perte de poids et un mode de vie sain permettent une rémission (glycémie normale sans médicament), à condition de maintenir ces efforts dans la durée et de poursuivre le suivi médical.",
  },
  {
    q: "Quelle est la différence entre diabète de type 1 et de type 2 ?",
    a: "Le diabète de type 1 est une maladie auto-immune : le pancréas ne produit plus d'insuline, ce qui impose des injections dès le diagnostic, souvent chez l'enfant ou le jeune adulte. Le type 2, de loin le plus fréquent, est lié au mode de vie et à l'hérédité : le corps résiste à l'insuline. Il se traite d'abord par l'hygiène de vie, puis par des médicaments.",
  },
  {
    q: "Quel taux de glycémie indique un diabète ?",
    a: "Une glycémie à jeun supérieure ou égale à 1,26 g/L, confirmée à deux reprises, signe un diabète. Une hémoglobine glyquée (HbA1c) supérieure ou égale à 6,5 %, ou une glycémie supérieure à 2,00 g/L avec des symptômes, le confirment également. Seul un médecin interprète ces résultats selon votre situation.",
  },
  {
    q: "Peut-on avoir du diabète sans aucun symptôme ?",
    a: "Oui, c'est même fréquent dans le diabète de type 2, qui évolue en silence pendant des années. Il est souvent découvert lors d'un bilan sanguin de routine ou à l'occasion d'une complication, d'où l'importance du dépistage chez les personnes à risque.",
  },
  {
    q: "Le diabète est-il pris en charge par l'assurance maladie au Maroc ?",
    a: "Oui, en partie. Le diabète est reconnu comme une affection de longue durée (ALD). L'assurance maladie obligatoire (CNSS ou CNOPS) couvre une part des consultations, analyses et médicaments selon le barème en vigueur. Renseignez-vous auprès de votre organisme pour votre taux exact.",
  },
  {
    q: "Un diabétique peut-il manger des dattes et boire du thé sucré ?",
    a: "Avec modération. Aucun aliment n'est totalement interdit, mais les dattes sont très sucrées et se comptent dans les glucides du repas. Pour le thé, réduire progressivement le sucre ou le boire nature à la menthe est l'un des gestes les plus efficaces au quotidien.",
  },
];

const keyTakeaways = [
  "Le diabète de type 2 est une hyperglycémie chronique liée à une résistance à l'insuline ; c'est la forme la plus fréquente au Maroc.",
  "Il évolue longtemps sans symptôme : le dépistage par une simple prise de sang est essentiel chez les personnes à risque.",
  "Le diagnostic repose sur la glycémie à jeun (≥ 1,26 g/L) ou l'HbA1c (≥ 6,5 %).",
  "Non contrôlé, il abîme les yeux, les reins, les nerfs, les pieds et le cœur — d'où l'importance d'un bon équilibre.",
  "Il est en grande partie évitable et se contrôle très bien par l'hygiène de vie et, si besoin, un traitement adapté.",
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

  // Champs mis à jour à chaque exécution (idempotent : rafraîchit le contenu).
  // On NE touche PAS à pillarId : ce pilier reste racine (pillarId = null), valeur
  // par ailleurs réaffirmée par seed-blog-diabete-hta.cjs.
  const data = {
    title:        "Diabète de type 2 au Maroc : symptômes, causes, traitement et prévention",
    excerpt:      "Le diabète de type 2 touche environ un adulte marocain sur huit, souvent sans le savoir. Symptômes, diagnostic, complications, traitements et prévention : le guide complet pour comprendre et agir.",
    content,
    categoryId:   cat.id,
    metaTitle:    "Diabète de type 2 au Maroc : symptômes, causes et traitement",
    metaDesc:     "Diabète de type 2 : symptômes, causes, diagnostic (glycémie, HbA1c), complications, traitements et prévention, expliqués simplement et adaptés au Maroc.",
    readingTime:  10,
    keyTakeaways: keyTakeaways.join("\n"),
    faqJson:      JSON.stringify(faq),
    aboutEntity:  "Diabète de type 2",
    reviewedById: admin.id,
    reviewedAt:   now,
  };

  const post = await prisma.post.upsert({
    where: { slug: "diabete-type-2-maroc" },
    update: data,
    create: {
      ...data,
      slug:        "diabete-type-2-maroc",
      authorId:    admin.id,
      status:      "PUBLISHED",
      publishedAt: now,
    },
    select: { slug: true, title: true, readingTime: true },
  });

  console.log("✓ Pilier Diabète mis à jour (gabarit de référence)");
  console.log("  URL        : /blog/" + post.slug);
  console.log("  Titre      : " + post.title);
  console.log("  Lecture    : " + post.readingTime + " min");
  console.log("  FAQ        : " + faq.length + " questions");
  console.log("  À retenir  : " + keyTakeaways.length + " points");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
