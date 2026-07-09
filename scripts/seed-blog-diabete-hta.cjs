require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 1 — Cocons patients à forte prévalence & forte recherche au Maroc :
//   • Diabète (pilier : diabete-type-2-maroc → endocrinologie)
//   • Hypertension artérielle (pilier : hypertension-arterielle-maroc → cardiologie)
//
// Les 2 articles existants deviennent les PILIERS (aboutEntity ajouté). On crée
// des SATELLITES rattachés via pillarId. Chaque article : definition-first,
// tableaux, FAQ, « À retenir », relecture médicale (E-E-A-T) — optimisé SEO/GEO.
//
// Idempotent (upsert par slug). À lancer après `prisma generate`.
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// CONTENUS — DIABÈTE
// ─────────────────────────────────────────────────────────────────────────────

const cDiabSymptomes = `<p>Le diabète se manifeste par une glycémie (taux de sucre dans le sang) durablement trop élevée. Au début, les signes sont discrets, ce qui explique qu'au Maroc une part importante des diabétiques s'ignore. Reconnaître tôt les symptômes permet de consulter et d'éviter les complications.</p>

<h2>Quels sont les premiers signes du diabète ?</h2>
<p>Les symptômes classiques sont liés à l'excès de sucre que l'organisme tente d'éliminer par les urines. Les plus fréquents sont :</p>
<ul>
<li><strong>Une soif intense et permanente</strong> (polydipsie)</li>
<li><strong>Des envies fréquentes d'uriner</strong>, y compris la nuit (polyurie)</li>
<li><strong>Une fatigue inhabituelle</strong> et persistante</li>
<li><strong>Une perte de poids</strong> inexpliquée, malgré un appétit conservé ou augmenté</li>
<li><strong>Une vision floue</strong> passagère</li>
<li>Des <strong>plaies qui cicatrisent lentement</strong> et des infections à répétition</li>
</ul>

<h2>Diabète de type 1 ou de type 2 : des signes différents</h2>
<p>Dans le <strong>diabète de type 1</strong> (souvent chez l'enfant ou le jeune adulte), les symptômes apparaissent rapidement et de façon marquée. Dans le <strong>diabète de type 2</strong>, de loin le plus répandu au Maroc, l'installation est lente et silencieuse : la maladie est fréquemment découverte lors d'un bilan ou à l'occasion d'une complication.</p>

<h2>Quand faut-il s'inquiéter et consulter ?</h2>
<p>Consultez sans tarder si vous cumulez plusieurs de ces signes, surtout en présence de facteurs de risque : antécédents familiaux de diabète, surpoids, hypertension, sédentarité, ou antécédent de diabète gestationnel. Un simple dosage de la glycémie à jeun ou de l'hémoglobine glyquée (HbA1c) suffit à poser le diagnostic.</p>

<table>
<thead><tr><th>Glycémie à jeun</th><th>Interprétation</th></tr></thead>
<tbody>
<tr><td>&lt; 1,10 g/L</td><td>Normale</td></tr>
<tr><td>1,10 – 1,25 g/L</td><td>Prédiabète — surveillance</td></tr>
<tr><td>≥ 1,26 g/L (à 2 reprises)</td><td>Diabète</td></tr>
</tbody>
</table>
<p>Ces seuils sont indicatifs : seul un médecin interprète vos résultats au regard de votre situation.</p>

<h2>Pourquoi ne pas attendre ?</h2>
<p>Un diabète non traité abîme silencieusement les vaisseaux et les nerfs, avec un risque de complications aux yeux, aux reins, au cœur et aux pieds. Pris en charge tôt, il se contrôle très bien par l'hygiène de vie et, si besoin, un traitement adapté.</p>

<hr>
<p>En cas de doute, un endocrinologue ou votre médecin généraliste peut confirmer le diagnostic et vous orienter. La prise de rendez-vous en ligne permet de consulter rapidement, près de chez vous.</p>`;

const cDiabRamadan = `<p><strong>Un diabétique peut-il jeûner pendant le Ramadan ?</strong> Pour beaucoup, oui — à condition d'une évaluation médicale préalable et d'une adaptation du traitement. Mais le jeûne reste déconseillé pour certains profils à haut risque. La décision se prend toujours avec son médecin, idéalement quelques semaines avant le mois sacré.</p>

<h2>Évaluer son risque avant de jeûner</h2>
<p>Le risque dépend du type de diabète, de son équilibre et des traitements. On distingue schématiquement trois niveaux :</p>
<table>
<thead><tr><th>Niveau de risque</th><th>Profil</th><th>Jeûne</th></tr></thead>
<tbody>
<tr><td>Faible à modéré</td><td>Diabète de type 2 bien équilibré, traité par régime ou metformine</td><td>Possible, sous surveillance</td></tr>
<tr><td>Élevé</td><td>Diabète sous insuline, déséquilibré, ou hypoglycémies fréquentes</td><td>Déconseillé</td></tr>
<tr><td>Très élevé</td><td>Complications sévères, grossesse, antécédent d'acidocétose</td><td>Contre-indiqué</td></tr>
</tbody>
</table>

<h2>Adapter son traitement</h2>
<p>Les horaires des repas étant inversés, les doses et les moments de prise des médicaments doivent souvent être modifiés. <strong>Ne modifiez jamais vous-même votre insuline ou vos comprimés</strong> : seul votre médecin ajuste le traitement pour réduire le risque d'hypoglycémie (taux de sucre trop bas) le jour, et d'hyperglycémie après le f'tour.</p>

<h2>Repas du f'tour et du s'hour</h2>
<ul>
<li><strong>Rompre le jeûne</strong> progressivement : quelques dattes, une soupe (harira peu grasse), de l'eau — en évitant l'excès de sucreries (chebakia, jus sucrés).</li>
<li><strong>S'hour</strong> le plus tard possible, riche en aliments à index glycémique bas (céréales complètes, légumineuses, protéines) pour tenir la journée.</li>
<li><strong>Hydratation</strong> abondante entre le f'tour et le s'hour.</li>
</ul>

<h2>Les signaux qui imposent de rompre le jeûne</h2>
<p>Interrompez immédiatement le jeûne et contactez un médecin en cas de :</p>
<ul>
<li>Glycémie &lt; 0,70 g/L (hypoglycémie) ou &gt; 3,00 g/L</li>
<li>Sueurs, tremblements, vertiges, confusion</li>
<li>Soif intense, malaise marqué</li>
</ul>
<p>Rompre le jeûne pour raison médicale est autorisé : la préservation de la santé prime.</p>

<h2>Surveiller sa glycémie</h2>
<p>Contrairement à une idée reçue, <strong>se piquer le doigt pour mesurer sa glycémie ne rompt pas le jeûne</strong>. Multipliez les contrôles, surtout en milieu de journée et avant le f'tour.</p>

<hr>
<p>Avant le Ramadan, prenez rendez-vous avec un endocrinologue ou votre médecin pour évaluer votre risque et adapter votre traitement en toute sécurité.</p>`;

const cDiabAlim = `<p>L'alimentation est le premier traitement du diabète de type 2. Bonne nouvelle : la cuisine marocaine traditionnelle, riche en légumes, légumineuses et huile d'olive, s'y prête très bien — à condition de maîtriser les sucres rapides et les portions de féculents.</p>

<h2>Quel régime pour un diabétique ?</h2>
<p>Il n'existe pas d'aliment interdit, mais des équilibres à respecter. L'objectif est de limiter les pics de glycémie en privilégiant les aliments à <strong>index glycémique (IG) bas</strong> et en répartissant les glucides sur la journée.</p>

<h2>Les aliments à privilégier</h2>
<ul>
<li><strong>Légumes</strong> à volonté (cuisinés en tajine, en salade, en soupe)</li>
<li><strong>Légumineuses</strong> : lentilles, pois chiches, fèves, haricots — rassasiantes et à IG bas</li>
<li><strong>Céréales complètes</strong> : pain complet, semoule complète, orge (bel boula)</li>
<li><strong>Protéines maigres</strong> : poisson, volaille sans peau, œufs</li>
<li><strong>Huile d'olive</strong> comme matière grasse principale</li>
<li><strong>Fruits entiers</strong> avec modération (1 à 2 portions/jour)</li>
</ul>

<h2>Les aliments à limiter</h2>
<table>
<thead><tr><th>À limiter fortement</th><th>Pourquoi</th></tr></thead>
<tbody>
<tr><td>Thé et café très sucrés</td><td>Apport massif de sucre rapide</td></tr>
<tr><td>Pâtisseries marocaines (chebakia, briouates sucrées)</td><td>Sucre + graisses, fort impact glycémique</td></tr>
<tr><td>Jus de fruits et sodas</td><td>Sucres liquides, peu rassasiants</td></tr>
<tr><td>Pain blanc et msemen en excès</td><td>IG élevé, portions souvent trop grandes</td></tr>
<tr><td>Dattes en grande quantité</td><td>Très sucrées (à compter dans les glucides)</td></tr>
</tbody>
</table>

<h2>Adapter le thé à la menthe</h2>
<p>Pilier de la convivialité marocaine, le thé peut rester au menu : réduisez progressivement le sucre, utilisez un édulcorant si besoin, ou savourez-le nature avec de la menthe fraîche. C'est l'un des gestes les plus efficaces au quotidien.</p>

<h2>L'assiette équilibrée du diabétique</h2>
<p>Une règle simple à chaque repas : <strong>la moitié de l'assiette en légumes</strong>, un quart en féculents (de préférence complets), un quart en protéines, avec un filet d'huile d'olive. Mangez lentement et à heures régulières.</p>

<hr>
<p>Pour un plan alimentaire personnalisé et sûr, un endocrinologue ou un médecin nutritionniste vous accompagne. Prenez rendez-vous en ligne près de chez vous.</p>`;

const cDiabPrix = `<p><strong>Combien coûte une consultation chez l'endocrinologue au Maroc ?</strong> Dans le secteur privé, comptez en général entre <strong>250 et 600 dirhams</strong> selon la ville, la notoriété du praticien et la nature de la consultation. Le suivi du diabète est par ailleurs en partie pris en charge par l'assurance maladie.</p>

<h2>Prix indicatifs d'une consultation</h2>
<table>
<thead><tr><th>Type de consultation</th><th>Fourchette de prix (secteur privé)</th></tr></thead>
<tbody>
<tr><td>Endocrinologue / diabétologue</td><td>250 – 600 DH</td></tr>
<tr><td>Médecin généraliste</td><td>150 – 250 DH</td></tr>
<tr><td>Consultation de suivi</td><td>Parfois tarif réduit</td></tr>
</tbody>
</table>
<p>Ces montants sont <strong>indicatifs</strong> et varient d'un cabinet à l'autre. Les grandes villes (Casablanca, Rabat) affichent souvent des tarifs un peu plus élevés.</p>

<h2>Le diabète est-il remboursé par l'AMO ?</h2>
<p>Oui, en partie. Le diabète est reconnu comme une <strong>affection de longue durée (ALD)</strong>. À ce titre, la prise en charge par l'assurance maladie obligatoire (CNSS pour le privé, CNOPS pour le public) couvre une part des consultations, des analyses et des médicaments, selon le barème en vigueur. Renseignez-vous auprès de votre organisme pour connaître votre taux exact.</p>

<h2>Public ou privé ?</h2>
<ul>
<li><strong>Hôpital public / centre de santé</strong> : coût très faible, mais délais et affluence variables.</li>
<li><strong>Cabinet privé</strong> : rendez-vous plus rapide, à un tarif plus élevé.</li>
</ul>

<h2>Que comprend la première consultation ?</h2>
<p>L'endocrinologue évalue votre équilibre glycémique (HbA1c), recherche d'éventuelles complications, vérifie votre traitement et vous fixe des objectifs. Pensez à apporter vos derniers résultats d'analyses et la liste de vos médicaments.</p>

<hr>
<p>Comparez les praticiens près de chez vous et prenez rendez-vous en ligne avec un endocrinologue, gratuitement.</p>`;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENUS — HYPERTENSION
// ─────────────────────────────────────────────────────────────────────────────

const cHtaSymptomes = `<p>L'hypertension artérielle (HTA) est souvent surnommée le « tueur silencieux » : dans la grande majorité des cas, elle ne provoque <strong>aucun symptôme</strong> pendant des années, tout en abîmant les artères, le cœur, les reins et le cerveau. C'est pourquoi la mesure régulière de la tension est essentielle.</p>

<h2>L'hypertension donne-t-elle des symptômes ?</h2>
<p>Le plus souvent, non. Beaucoup de personnes hypertendues se sentent parfaitement bien. Lorsqu'ils existent, les signes sont peu spécifiques :</p>
<ul>
<li>Maux de tête, surtout le matin, à l'arrière du crâne</li>
<li>Vertiges ou sensation d'instabilité</li>
<li>Bourdonnements d'oreilles (acouphènes)</li>
<li>Fatigue, troubles du sommeil</li>
<li>Saignements de nez à répétition</li>
</ul>
<p>Ces symptômes ne sont ni constants ni fiables : seule la mesure de la tension permet le diagnostic.</p>

<h2>À partir de quels chiffres parle-t-on d'hypertension ?</h2>
<table>
<thead><tr><th>Tension (au cabinet)</th><th>Interprétation</th></tr></thead>
<tbody>
<tr><td>&lt; 12/8 (120/80 mmHg)</td><td>Optimale</td></tr>
<tr><td>de 12/8 à 13,9/8,9</td><td>Normale à normale-haute</td></tr>
<tr><td>≥ 14/9 (140/90 mmHg)</td><td>Hypertension (à confirmer)</td></tr>
</tbody>
</table>
<p>Le diagnostic repose sur des mesures répétées, idéalement confirmées à domicile, car la tension peut monter au cabinet (« effet blouse blanche »).</p>

<h2>Les signes d'une urgence</h2>
<p>Consultez en urgence si une poussée de tension s'accompagne de : douleur dans la poitrine, essoufflement brutal, troubles de la vision, difficulté à parler, faiblesse d'un côté du corps ou violents maux de tête. Ces signes peuvent annoncer une complication grave.</p>

<h2>Qui doit faire surveiller sa tension ?</h2>
<p>Tout le monde à partir de 40 ans, et plus tôt en cas de surpoids, d'antécédents familiaux, de diabète ou de tabagisme. Une mesure une fois par an suffit chez l'adulte sans facteur de risque.</p>

<hr>
<p>Un cardiologue ou votre médecin traitant peut confirmer le diagnostic et mettre en place un suivi. Prenez rendez-vous en ligne près de chez vous.</p>`;

const cHtaAlim = `<p>Adapter son alimentation est l'un des moyens les plus efficaces de faire baisser sa tension — parfois suffisant, souvent en complément d'un traitement. Le levier numéro un : <strong>réduire le sel</strong>.</p>

<h2>Pourquoi réduire le sel ?</h2>
<p>Le sodium contenu dans le sel retient l'eau et augmente la pression dans les artères. L'Organisation mondiale de la santé recommande de ne pas dépasser <strong>5 g de sel par jour</strong> (environ une cuillère à café). Or la consommation moyenne est souvent bien supérieure, notamment à cause des aliments transformés.</p>

<h2>Les aliments les plus salés à limiter</h2>
<table>
<thead><tr><th>À limiter</th><th>Alternative</th></tr></thead>
<tbody>
<tr><td>Olives et conserves salées (msseyer)</td><td>Olives bien rincées, légumes frais</td></tr>
<tr><td>Charcuterie, viandes salées (khlii, cachir)</td><td>Viande et poisson frais</td></tr>
<tr><td>Fromages salés, smen</td><td>Fromage frais, huile d'olive</td></tr>
<tr><td>Bouillons cubes, conserves</td><td>Épices, herbes, ail, citron</td></tr>
<tr><td>Pain en grande quantité</td><td>Pain complet en portions mesurées</td></tr>
</tbody>
</table>

<h2>Les aliments qui aident à baisser la tension</h2>
<p>Le régime de référence (type DASH) privilégie les aliments riches en potassium, qui contrebalance le sodium :</p>
<ul>
<li><strong>Fruits et légumes</strong> en abondance (banane, agrumes, tomate, épinards)</li>
<li><strong>Légumineuses</strong> et céréales complètes</li>
<li><strong>Produits laitiers</strong> peu gras</li>
<li><strong>Poisson</strong>, notamment gras (sardine, maquereau — fréquents et abordables au Maroc)</li>
<li><strong>Huile d'olive</strong> à la place des graisses saturées</li>
</ul>

<h2>Au-delà de l'assiette</h2>
<ul>
<li><strong>Bouger</strong> : 30 minutes de marche par jour font baisser la tension.</li>
<li><strong>Limiter le café fort et le tabac.</strong></li>
<li><strong>Perdre du poids</strong> si nécessaire : quelques kilos suffisent à faire une différence.</li>
</ul>

<h2>Le piège du sel caché</h2>
<p>L'essentiel du sel ne vient pas de la salière mais des aliments industriels. Prenez l'habitude de goûter avant de saler, de cuisiner maison et de relever vos plats avec les épices marocaines (cumin, paprika, gingembre, safran) plutôt qu'avec du sel.</p>

<hr>
<p>Pour un accompagnement adapté à votre tension, consultez un cardiologue ou un médecin nutritionniste. Prenez rendez-vous en ligne, gratuitement.</p>`;

const cHtaMesure = `<p>Bien mesurer sa tension artérielle à domicile est essentiel pour dépister et suivre l'hypertension. Une mesure mal réalisée peut donner des chiffres faussement élevés ou rassurants. Voici la méthode correcte.</p>

<h2>Que veulent dire les deux chiffres ?</h2>
<p>La tension s'exprime par deux nombres, par exemple <strong>12/8</strong> :</p>
<ul>
<li>Le <strong>premier (systolique)</strong> : la pression quand le cœur se contracte.</li>
<li>Le <strong>second (diastolique)</strong> : la pression quand le cœur se relâche.</li>
</ul>
<p>On parle d'hypertension à partir de 14/9 (140/90 mmHg) mesurée au cabinet, ou 13,5/8,5 à domicile, sur des mesures répétées.</p>

<h2>Comment bien mesurer sa tension à la maison</h2>
<ol>
<li>Reposez-vous <strong>5 minutes</strong> assis, sans avoir fumé, ni bu de café, ni fait d'effort juste avant.</li>
<li>Installez-vous le <strong>dos appuyé, les pieds à plat</strong>, sans croiser les jambes.</li>
<li>Posez le bras sur la table, <strong>le brassard à hauteur du cœur</strong>.</li>
<li>Ne parlez pas pendant la mesure.</li>
<li>Réalisez <strong>2 à 3 mesures</strong> espacées d'une minute et notez-les.</li>
</ol>

<h2>La règle des « 3 par jour pendant 3 jours »</h2>
<p>Pour un suivi fiable, mesurez votre tension 3 fois le matin et 3 fois le soir, pendant 3 jours d'affilée, avant une consultation. Cette automesure reflète mieux la réalité que le seul chiffre du cabinet.</p>

<table>
<thead><tr><th>Lieu de mesure</th><th>Seuil d'hypertension</th></tr></thead>
<tbody>
<tr><td>Au cabinet</td><td>≥ 140/90 mmHg</td></tr>
<tr><td>En automesure à domicile</td><td>≥ 135/85 mmHg</td></tr>
</tbody>
</table>

<h2>Quel tensiomètre choisir ?</h2>
<p>Privilégiez un <strong>tensiomètre électronique de bras</strong> (plus fiable que ceux de poignet), validé cliniquement. Ils sont disponibles en pharmacie au Maroc à un prix abordable.</p>

<hr>
<p>Des chiffres élevés et répétés ? Ne restez pas seul face au doute : un cardiologue ou votre médecin interprète vos mesures et vous oriente. Prenez rendez-vous en ligne.</p>`;

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES ARTICLES
// ─────────────────────────────────────────────────────────────────────────────

// Mises à jour des piliers existants (aboutEntity + s'assurer qu'ils ne sont pas satellites).
const PILLARS = [
  { slug: "diabete-type-2-maroc",         aboutEntity: "Diabète de type 2" },
  { slug: "hypertension-arterielle-maroc", aboutEntity: "Hypertension artérielle" },
];

// Satellites à créer/mettre à jour. `pillarSlug` => rattachement au cocon.
const SATELLITES = [
  // ─── Cocon Diabète ───
  {
    pillarSlug: "diabete-type-2-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Diabète",
    title: "Symptômes du diabète : 6 signes qui doivent alerter",
    slug: "diabete-symptomes-signes-maroc",
    excerpt: "Soif intense, envies fréquentes d'uriner, fatigue, perte de poids… Reconnaître les premiers signes du diabète pour consulter à temps au Maroc.",
    content: cDiabSymptomes,
    metaTitle: "Symptômes du diabète : les signes qui alertent | Maroc",
    metaDesc: "Quels sont les premiers symptômes du diabète ? Soif, urines fréquentes, fatigue, perte de poids : reconnaître les signes et savoir quand consulter au Maroc.",
    readingTime: 5,
    keyTakeaways: [
      "Les signes classiques : soif intense, urines fréquentes, fatigue, perte de poids inexpliquée.",
      "Le diabète de type 2 s'installe en silence : beaucoup de diabétiques s'ignorent au Maroc.",
      "Un simple dosage de la glycémie à jeun ou de l'HbA1c confirme le diagnostic.",
      "Dépisté tôt, le diabète se contrôle très bien et évite les complications.",
    ],
    faq: [
      { q: "Quels sont les premiers signes du diabète ?", a: "Une soif intense, des envies fréquentes d'uriner (surtout la nuit), une fatigue persistante, une perte de poids inexpliquée, une vision floue et des plaies qui cicatrisent mal sont les signes les plus fréquents." },
      { q: "Peut-on avoir du diabète sans symptôme ?", a: "Oui, c'est fréquent dans le diabète de type 2, qui évolue silencieusement pendant des années. Il est souvent découvert lors d'un bilan sanguin ou d'une complication, d'où l'intérêt du dépistage." },
      { q: "Quel test pour savoir si j'ai du diabète ?", a: "Une glycémie à jeun ≥ 1,26 g/L à deux reprises, ou une hémoglobine glyquée (HbA1c) élevée, confirme le diagnostic. Votre médecin interprète ces résultats selon votre situation." },
    ],
  },
  {
    pillarSlug: "diabete-type-2-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Diabète",
    title: "Diabète et Ramadan : peut-on jeûner sans danger ?",
    slug: "diabete-ramadan-jeune-maroc",
    excerpt: "Risques, évaluation médicale, adaptation du traitement, repas du f'tour et signaux d'alerte : tout ce qu'un diabétique doit savoir avant de jeûner le Ramadan.",
    content: cDiabRamadan,
    metaTitle: "Diabète & Ramadan au Maroc : jeûner sans risque",
    metaDesc: "Diabétique et envie de jeûner le Ramadan ? Évaluation du risque, adaptation du traitement, repas du f'tour et signaux d'alerte, expliqués pour le Maroc.",
    readingTime: 6,
    keyTakeaways: [
      "Le jeûne est souvent possible pour un diabète de type 2 bien équilibré, après avis médical.",
      "Il est déconseillé sous insuline, en cas de déséquilibre ou d'hypoglycémies fréquentes.",
      "Ne jamais modifier seul son traitement : seul le médecin l'adapte aux nouveaux horaires.",
      "Rompre le jeûne est impératif si la glycémie chute (< 0,70 g/L) ou en cas de malaise.",
    ],
    faq: [
      { q: "Un diabétique peut-il jeûner pendant le Ramadan ?", a: "Souvent oui pour un diabète de type 2 bien équilibré, après évaluation médicale et adaptation du traitement. Le jeûne est déconseillé ou contre-indiqué pour les profils à haut risque (insuline, déséquilibre, complications, grossesse)." },
      { q: "Mesurer sa glycémie rompt-il le jeûne ?", a: "Non. Se piquer le doigt pour contrôler sa glycémie ne rompt pas le jeûne. Il est même recommandé de multiplier les contrôles, surtout en milieu de journée et avant le f'tour." },
      { q: "Quand faut-il rompre le jeûne ?", a: "Immédiatement si la glycémie descend sous 0,70 g/L ou dépasse 3,00 g/L, ou en cas de sueurs, tremblements, vertiges ou confusion. La préservation de la santé prime." },
    ],
  },
  {
    pillarSlug: "diabete-type-2-maroc",
    categorySlug: "nutrition-bien-etre",
    aboutEntity: "Diabète de type 2",
    title: "Alimentation et diabète : que manger ? (cuisine marocaine)",
    slug: "alimentation-diabete-cuisine-marocaine",
    excerpt: "Aliments à privilégier et à limiter, thé à la menthe, assiette équilibrée : adapter la cuisine marocaine pour contrôler son diabète au quotidien.",
    content: cDiabAlim,
    metaTitle: "Alimentation du diabétique au Maroc : que manger ?",
    metaDesc: "Diabète et alimentation : quels aliments privilégier et limiter dans la cuisine marocaine, comment adapter le thé et composer une assiette équilibrée.",
    readingTime: 5,
    keyTakeaways: [
      "Aucun aliment n'est interdit : il s'agit d'équilibrer et de limiter les sucres rapides.",
      "Légumes, légumineuses, céréales complètes et huile d'olive sont à privilégier.",
      "Limiter le thé sucré, les pâtisseries, jus et pain blanc en excès.",
      "Règle de l'assiette : ½ légumes, ¼ féculents complets, ¼ protéines.",
    ],
    faq: [
      { q: "La cuisine marocaine est-elle compatible avec le diabète ?", a: "Oui. Dans sa forme traditionnelle (légumes, légumineuses, huile d'olive, poisson), elle est proche du régime méditerranéen recommandé. Il faut surtout maîtriser les sucres rapides et les portions de féculents." },
      { q: "Un diabétique peut-il boire du thé à la menthe ?", a: "Oui, en réduisant progressivement le sucre, en utilisant un édulcorant ou en le buvant nature avec de la menthe. Réduire le sucre du thé est l'un des gestes les plus efficaces au quotidien." },
      { q: "Peut-on manger des dattes quand on est diabétique ?", a: "Avec modération. Les dattes sont très sucrées : elles se comptent dans les apports en glucides du repas. Mieux vaut en limiter la quantité et les associer à des aliments rassasiants." },
    ],
  },
  {
    pillarSlug: "diabete-type-2-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Diabète",
    title: "Prix d'une consultation chez l'endocrinologue au Maroc",
    slug: "prix-consultation-endocrinologue-maroc",
    excerpt: "Tarifs indicatifs en dirhams, prise en charge du diabète par l'AMO, public ou privé : ce qu'il faut savoir avant de consulter un endocrinologue au Maroc.",
    content: cDiabPrix,
    metaTitle: "Prix consultation endocrinologue au Maroc (2026)",
    metaDesc: "Combien coûte un endocrinologue au Maroc ? Tarifs indicatifs en DH, remboursement du diabète par l'AMO (ALD), différences public/privé et déroulé de la consultation.",
    readingTime: 4,
    keyTakeaways: [
      "Une consultation d'endocrinologue privé coûte en général 250 à 600 DH au Maroc.",
      "Le diabète est une affection de longue durée (ALD) : prise en charge partielle par l'AMO.",
      "Le public est peu coûteux mais avec des délais ; le privé est plus rapide et plus cher.",
      "Apportez vos analyses récentes et la liste de vos médicaments à la première consultation.",
    ],
    faq: [
      { q: "Combien coûte une consultation chez l'endocrinologue au Maroc ?", a: "Dans le privé, comptez généralement entre 250 et 600 DH selon la ville et le praticien. Les tarifs sont indicatifs et un peu plus élevés dans les grandes villes comme Casablanca et Rabat." },
      { q: "Le diabète est-il remboursé au Maroc ?", a: "Oui, en partie. Le diabète est reconnu comme affection de longue durée (ALD). L'AMO (CNSS ou CNOPS) couvre une part des consultations, analyses et médicaments selon le barème en vigueur." },
      { q: "Faut-il voir un endocrinologue ou un généraliste pour le diabète ?", a: "Le généraliste assure le suivi de nombreux diabètes équilibrés. L'endocrinologue intervient pour le diagnostic initial, les cas complexes, le diabète sous insuline ou en cas de complications." },
    ],
  },
  // ─── Cocon Hypertension ───
  {
    pillarSlug: "hypertension-arterielle-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Hypertension artérielle",
    title: "Symptômes de l'hypertension : le « tueur silencieux »",
    slug: "symptomes-hypertension-arterielle-maroc",
    excerpt: "L'hypertension ne donne souvent aucun symptôme tout en abîmant les artères. Quels signes surveiller, à partir de quels chiffres s'inquiéter et quand consulter.",
    content: cHtaSymptomes,
    metaTitle: "Symptômes de l'hypertension artérielle | Maroc",
    metaDesc: "Quels sont les symptômes de l'hypertension ? Pourquoi elle est silencieuse, les signes à surveiller, les chiffres qui inquiètent et quand consulter au Maroc.",
    readingTime: 5,
    keyTakeaways: [
      "L'hypertension est le plus souvent sans symptôme : elle abîme les artères en silence.",
      "Maux de tête, vertiges, acouphènes peuvent exister mais ne sont pas fiables.",
      "On parle d'hypertension à partir de 14/9 (140/90 mmHg), sur mesures répétées.",
      "Faire surveiller sa tension dès 40 ans, plus tôt en cas de facteurs de risque.",
    ],
    faq: [
      { q: "L'hypertension donne-t-elle des symptômes ?", a: "Le plus souvent non. La majorité des personnes hypertendues ne ressentent rien, d'où le surnom de « tueur silencieux ». Seule la mesure de la tension permet le diagnostic." },
      { q: "À partir de quel chiffre parle-t-on d'hypertension ?", a: "À partir de 14/9 (140/90 mmHg) mesurée au cabinet, sur des mesures répétées. L'automesure à domicile (seuil 135/85) aide à confirmer en évitant l'effet « blouse blanche »." },
      { q: "Quand l'hypertension est-elle une urgence ?", a: "En cas de douleur thoracique, essoufflement brutal, troubles de la vision ou de la parole, faiblesse d'un côté du corps ou violents maux de tête : consultez en urgence." },
    ],
  },
  {
    pillarSlug: "hypertension-arterielle-maroc",
    categorySlug: "nutrition-bien-etre",
    aboutEntity: "Hypertension artérielle",
    title: "Alimentation contre l'hypertension : réduire le sel",
    slug: "alimentation-anti-hypertension-maroc",
    excerpt: "Réduire le sel, repérer le sel caché, privilégier le potassium : les bons réflexes alimentaires pour faire baisser sa tension, adaptés à la cuisine marocaine.",
    content: cHtaAlim,
    metaTitle: "Alimentation et hypertension au Maroc : réduire le sel",
    metaDesc: "Comment baisser sa tension par l'alimentation : limiter le sel et le sel caché, miser sur le potassium et le régime DASH, avec des conseils pour la cuisine marocaine.",
    readingTime: 5,
    keyTakeaways: [
      "Réduire le sel est le levier n°1 : viser moins de 5 g par jour (OMS).",
      "Le sel caché vient surtout des aliments transformés, pas de la salière.",
      "Fruits, légumes et poisson (riches en potassium) aident à baisser la tension.",
      "Marche quotidienne, perte de poids et moins de tabac complètent l'effet.",
    ],
    faq: [
      { q: "Quel est l'aliment à éviter en cas d'hypertension ?", a: "Avant tout le sel, et les aliments très salés : olives et conserves salées, charcuterie (khlii, cachir), fromages salés, bouillons cubes. L'OMS recommande moins de 5 g de sel par jour." },
      { q: "Quels aliments font baisser la tension ?", a: "Les aliments riches en potassium : fruits et légumes (banane, agrumes, tomate, épinards), légumineuses, produits laitiers peu gras et poisson gras (sardine, maquereau), avec de l'huile d'olive." },
      { q: "Comment réduire le sel sans perdre le goût ?", a: "Cuisinez maison, goûtez avant de saler et relevez vos plats avec les épices marocaines (cumin, paprika, gingembre, safran), l'ail et le citron plutôt qu'avec du sel." },
    ],
  },
  {
    pillarSlug: "hypertension-arterielle-maroc",
    categorySlug: "prevention-sante",
    aboutEntity: "Hypertension artérielle",
    title: "Comment bien mesurer sa tension artérielle à domicile",
    slug: "mesurer-tension-arterielle-maroc",
    excerpt: "Que veulent dire les deux chiffres, la bonne méthode d'automesure, la règle des « 3 par jour pendant 3 jours » et quel tensiomètre choisir au Maroc.",
    content: cHtaMesure,
    metaTitle: "Mesurer sa tension artérielle à domicile : la méthode",
    metaDesc: "Comment bien mesurer sa tension à la maison : signification des chiffres, méthode correcte, règle des 3 mesures et choix du tensiomètre, pour un suivi fiable au Maroc.",
    readingTime: 4,
    keyTakeaways: [
      "Le 1er chiffre (systolique) et le 2e (diastolique) reflètent contraction et relâchement du cœur.",
      "Mesurer au repos, assis, brassard à hauteur du cœur, sans parler.",
      "Règle des « 3 par jour pendant 3 jours » avant une consultation.",
      "Préférer un tensiomètre électronique de bras validé cliniquement.",
    ],
    faq: [
      { q: "Que signifient les deux chiffres de la tension ?", a: "Le premier (systolique) est la pression quand le cœur se contracte ; le second (diastolique) quand il se relâche. Par exemple 12/8 signifie 120/80 mmHg." },
      { q: "Comment bien mesurer sa tension à la maison ?", a: "Reposez-vous 5 minutes, asseyez-vous le dos appuyé et les pieds à plat, placez le brassard à hauteur du cœur, ne parlez pas et réalisez 2 à 3 mesures espacées d'une minute." },
      { q: "Quel tensiomètre choisir ?", a: "Un tensiomètre électronique de bras, validé cliniquement, plus fiable que les modèles de poignet. Ils sont disponibles en pharmacie au Maroc à un prix abordable." },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  // Résolution des catégories utilisées.
  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (slug) => {
    const c = cats.find((x) => x.slug === slug);
    if (!c) throw new Error(`Catégorie introuvable : ${slug}`);
    return c.id;
  };

  // 1. Piliers : ajouter aboutEntity, s'assurer pillarId = null. Capturer les ids.
  const pillarId = {};
  for (const p of PILLARS) {
    const post = await prisma.post.update({
      where: { slug: p.slug },
      data: { aboutEntity: p.aboutEntity, pillarId: null },
      select: { id: true, slug: true },
    });
    pillarId[p.slug] = post.id;
    console.log(`✓ Pilier  /blog/${post.slug}  (about: ${p.aboutEntity})`);
  }

  const now = new Date();

  // 2. Satellites : upsert + rattachement au pilier.
  for (const art of SATELLITES) {
    const data = {
      title:        art.title,
      excerpt:      art.excerpt,
      content:      art.content,
      categoryId:   catId(art.categorySlug),
      metaTitle:    art.metaTitle,
      metaDesc:     art.metaDesc,
      readingTime:  art.readingTime,
      keyTakeaways: art.keyTakeaways.join("\n"),
      faqJson:      JSON.stringify(art.faq),
      aboutEntity:  art.aboutEntity,
      pillarId:     pillarId[art.pillarSlug],
      reviewedById: admin.id,
      reviewedAt:   now,
    };
    const post = await prisma.post.upsert({
      where: { slug: art.slug },
      update: data,
      create: {
        ...data,
        slug:        art.slug,
        authorId:    admin.id,
        status:      "PUBLISHED",
        publishedAt: now,
      },
      select: { slug: true },
    });
    console.log(`✓ Satellite [${art.pillarSlug.split("-")[0]}] /blog/${post.slug}`);
  }

  console.log(`\nVague 1 : ${PILLARS.length} piliers mis à jour, ${SATELLITES.length} satellites publiés.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
