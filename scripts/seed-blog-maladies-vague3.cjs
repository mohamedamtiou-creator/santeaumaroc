require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 3 — Fiches « Maladie » de référence (piliers autonomes), même gabarit :
//   • Allergie              → médecine générale (repli)   maladies-traitements
//   • Migraine              → médecine générale (repli)   maladies-traitements
//   • Hypothyroïdie         → endocrinologie              maladies-traitements
//   • Insuffisance rénale   → médecine générale (repli)   maladies-traitements
//   • Arthrose              → médecine générale (repli)   maladies-traitements
//   • Ulcère / gastrite     → gastro-entérologie          maladies-traitements
// Définition, causes, facteurs, symptômes, diagnostic, examens, complications,
// traitement, prévention, quand consulter + FAQ + À retenir. SEO/GEO/E-E-A-T.
// Idempotent (upsert par slug + update complet). Mappings CTA dans lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. ALLERGIE
// ─────────────────────────────────────────────────────────────────────────────
const cAllergie = `<p>Éternuements à répétition, yeux qui piquent, plaques sur la peau, gêne après un aliment : les allergies concernent une part croissante de la population marocaine, enfants et adultes confondus. La plupart sont bénignes et se contrôlent bien, mais certaines réactions peuvent être graves. Savoir reconnaître une allergie et identifier son déclencheur change tout.</p>

<h2>Qu'est-ce qu'une allergie ?</h2>
<p>Une allergie est une <strong>réaction excessive du système immunitaire</strong> face à une substance normalement inoffensive, appelée <strong>allergène</strong> (pollen, acarien, aliment, médicament…). Lors d'un premier contact, l'organisme se « sensibilise » sans symptôme. Aux contacts suivants, il réagit en libérant notamment de l'<strong>histamine</strong>, responsable des signes de l'allergie.</p>
<p>Cette prédisposition à développer des allergies s'appelle le <strong>terrain atopique</strong> ; elle est souvent familiale.</p>

<h2>Les différentes formes d'allergie</h2>
<table>
<thead><tr><th>Forme</th><th>Manifestations</th></tr></thead>
<tbody>
<tr><td>Rhinite allergique (« rhume des foins »)</td><td>Éternuements, nez qui coule ou bouché, démangeaisons</td></tr>
<tr><td>Conjonctivite allergique</td><td>Yeux rouges, larmoyants, qui piquent</td></tr>
<tr><td><a href="/blog/asthme-maroc">Asthme</a> allergique</td><td>Toux, sifflements, essoufflement</td></tr>
<tr><td>Allergie cutanée</td><td>Urticaire (plaques), eczéma, démangeaisons</td></tr>
<tr><td>Allergie alimentaire ou médicamenteuse</td><td>Signes digestifs, cutanés, parfois généraux</td></tr>
</tbody>
</table>

<h2>Quels sont les allergènes les plus fréquents ?</h2>
<ul>
<li><strong>Allergènes de l'air</strong> : pollens (saison), acariens, poils d'animaux, moisissures.</li>
<li><strong>Aliments</strong> : arachide, fruits à coque, lait, œuf, poisson et fruits de mer, certains fruits.</li>
<li><strong>Médicaments</strong> : certains antibiotiques, l'aspirine et les anti-inflammatoires.</li>
<li><strong>Venins</strong> de piqûres d'insectes (abeille, guêpe).</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<p>Ils dépendent de l'allergène et de la « porte d'entrée » : éternuements et nez qui coule pour un pollen inhalé, plaques et démangeaisons pour un contact cutané, troubles digestifs pour un aliment. Les symptômes sont souvent <strong>récurrents</strong> et liés à une circonstance précise (saison, animal, aliment), ce qui aide à identifier le coupable.</p>
<blockquote>Attention : une réaction allergique généralisée et brutale — gonflement du visage, de la gorge ou des lèvres, difficulté à respirer, malaise, chute de tension — est une <strong>anaphylaxie</strong>. C'est une urgence vitale : appelez immédiatement les secours et, si la personne dispose d'un stylo d'adrénaline, utilisez-le sans attendre.</blockquote>

<h2>Comment diagnostique-t-on une allergie ?</h2>
<p>Le médecin s'appuie d'abord sur l'interrogatoire : nature des symptômes, circonstances, saisonnalité, antécédents familiaux. Il peut confirmer par :</p>
<ul>
<li><strong>Tests cutanés (prick-tests)</strong> : dépôt de petites quantités d'allergènes sur la peau pour observer la réaction.</li>
<li><strong>Dosages sanguins</strong> des anticorps (IgE spécifiques).</li>
</ul>
<p>Ces examens, réalisés par un allergologue ou un spécialiste, précisent l'allergène en cause.</p>

<h2>Quelles complications ?</h2>
<p>La plupart des allergies restent gênantes sans être graves. Mais elles peuvent altérer la qualité de vie (sommeil, concentration), évoluer vers un asthme, ou, pour certaines (aliments, venins, médicaments), provoquer une anaphylaxie potentiellement mortelle.</p>

<h2>Comment traite-t-on les allergies ?</h2>
<p>La prise en charge repose sur trois axes :</p>
<ol>
<li><strong>Éviter l'allergène</strong> quand c'est possible (éviction) : la mesure la plus efficace.</li>
<li><strong>Traiter les symptômes</strong> : antihistaminiques, corticoïdes locaux (spray nasal, crème), collyres.</li>
<li><strong>Désensibilisation (immunothérapie allergénique)</strong> : exposer progressivement l'organisme à l'allergène pour « rééduquer » le système immunitaire, dans certains cas sélectionnés.</li>
</ol>
<p>Les personnes à risque d'anaphylaxie doivent disposer d'un <strong>stylo d'adrénaline</strong> et savoir l'utiliser.</p>

<h2>Comment limiter les allergies au quotidien ?</h2>
<ul>
<li>Aérer le logement, laver la literie à haute température (acariens), limiter moquettes et peluches.</li>
<li>Éviter le tabac et les animaux si l'on y est allergique.</li>
<li>Suivre les alertes polliniques et fermer les fenêtres aux pics.</li>
<li>Lire les étiquettes alimentaires en cas d'allergie alimentaire.</li>
</ul>

<h2>Allergie : quand consulter ?</h2>
<p>Consultez si les symptômes sont gênants, récurrents ou saisonniers, ou en cas de doute sur une allergie alimentaire ou médicamenteuse. Le <a href="/specialites/medecine-generale">médecin généraliste</a> oriente, si besoin, vers un allergologue. Toute réaction généralisée (anaphylaxie) impose d'appeler les secours immédiatement.</p>

<hr>
<p>Des allergies qui gâchent votre quotidien ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const allergieFaq = [
  { q: "Comment savoir à quoi je suis allergique ?", a: "L'interrogatoire médical (circonstances, saison, aliments) oriente déjà beaucoup. Des tests cutanés (prick-tests) et/ou un dosage sanguin des IgE spécifiques, réalisés par un allergologue, permettent d'identifier précisément l'allergène en cause." },
  { q: "Les allergies peuvent-elles disparaître ?", a: "Certaines allergies de l'enfant (lait, œuf) s'atténuent avec l'âge. D'autres persistent. La désensibilisation peut, dans des cas sélectionnés, réduire durablement la réaction. L'éviction de l'allergène reste la mesure la plus efficace au quotidien." },
  { q: "Quelle est la différence entre un rhume et une rhinite allergique ?", a: "Le rhume est dû à un virus, dure quelques jours et s'accompagne parfois de fièvre. La rhinite allergique revient dans des circonstances précises (saison, animal, poussière), sans fièvre, souvent avec des démangeaisons du nez et des yeux, et peut durer des semaines." },
  { q: "Qu'est-ce qu'une anaphylaxie ?", a: "C'est une réaction allergique généralisée et brutale : gonflement du visage ou de la gorge, difficulté à respirer, malaise, chute de tension. C'est une urgence vitale : il faut appeler immédiatement les secours et utiliser un stylo d'adrénaline si la personne en a un." },
  { q: "Les antihistaminiques sont-ils dangereux ?", a: "Utilisés selon la prescription, ils sont sûrs. Certains peuvent donner de la somnolence ; les formes récentes en donnent moins. Demandez conseil à votre médecin ou pharmacien, surtout en cas de conduite, de grossesse ou d'autres traitements." },
  { q: "L'allergie est-elle héréditaire ?", a: "Il existe une prédisposition familiale (le terrain atopique) : avoir des parents allergiques ou asthmatiques augmente le risque. L'allergène précis, lui, n'est pas héréditaire et dépend de l'exposition de chacun." },
];
const allergieTakeaways = [
  "L'allergie est une réaction excessive du système immunitaire à une substance inoffensive.",
  "Formes fréquentes : rhinite, conjonctivite, asthme allergique, urticaire, allergie alimentaire.",
  "Le diagnostic repose sur l'interrogatoire, les tests cutanés et les IgE sanguines.",
  "Traitement : éviter l'allergène, antihistaminiques/corticoïdes locaux, parfois désensibilisation.",
  "L'anaphylaxie (gonflement, gêne à respirer) est une urgence vitale : appeler les secours.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. MIGRAINE
// ─────────────────────────────────────────────────────────────────────────────
const cMigraine = `<p>La migraine n'est pas un simple mal de tête : c'est une véritable maladie neurologique, faite de crises souvent intenses et invalidantes. Fréquente, en particulier chez la femme, elle est encore trop banalisée. Or, elle se prend en charge efficacement — à condition de bien la reconnaître et d'identifier ses déclencheurs.</p>

<h2>Qu'est-ce que la migraine ?</h2>
<p>La migraine se manifeste par des <strong>crises de maux de tête récurrentes</strong>, typiquement d'un seul côté du crâne, avec une douleur <strong>pulsatile</strong> (qui bat comme le pouls), aggravée par l'effort, et souvent accompagnée de nausées et d'une gêne à la lumière et au bruit. Une crise dure de quelques heures à quelques jours.</p>
<p>Elle est différente de la <strong>céphalée de tension</strong>, plus fréquente, ressentie comme un étau autour de la tête, sans nausées ni aggravation à l'effort.</p>
<table>
<thead><tr><th></th><th>Migraine</th><th>Céphalée de tension</th></tr></thead>
<tbody>
<tr><td>Douleur</td><td>Pulsatile, souvent d'un côté</td><td>En étau, des deux côtés</td></tr>
<tr><td>Intensité</td><td>Modérée à sévère</td><td>Légère à modérée</td></tr>
<tr><td>Signes associés</td><td>Nausées, gêne à la lumière/au bruit</td><td>Peu ou pas</td></tr>
<tr><td>Effort physique</td><td>Aggrave la douleur</td><td>Sans effet</td></tr>
</tbody>
</table>

<h2>Migraine avec ou sans aura</h2>
<p>Chez certaines personnes, la crise est précédée d'une <strong>aura</strong> : troubles visuels (points lumineux, lignes brillantes), fourmillements ou troubles passagers de la parole, durant quelques minutes. La migraine sans aura est la plus fréquente.</p>

<h2>Quelles sont les causes et les déclencheurs ?</h2>
<p>La migraine repose sur une prédisposition, souvent familiale. Les crises sont ensuite déclenchées par des facteurs variables d'une personne à l'autre :</p>
<ul>
<li><strong>Stress</strong> (ou relâchement après le stress)</li>
<li><strong>Manque ou excès de sommeil</strong></li>
<li><strong>Variations hormonales</strong> (règles), d'où une fréquence plus élevée chez la femme</li>
<li><strong>Jeûne, repas sauté, déshydratation</strong></li>
<li>Certains aliments, l'alcool, la caféine</li>
<li>Écrans, lumière intense, bruit, chaleur</li>
</ul>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Le diagnostic est <strong>clinique</strong> : il repose sur la description des crises et leur caractère récurrent. Aucune imagerie n'est nécessaire dans la migraine typique. Tenir un <strong>agenda des crises</strong> (dates, durée, déclencheurs, traitements) aide beaucoup le médecin.</p>
<blockquote>Attention : certains maux de tête doivent faire consulter sans attendre — une céphalée brutale et intense « en coup de tonnerre », un mal de tête avec fièvre et raideur de la nuque, avec troubles neurologiques (parole, force, vision), après 50 ans pour la première fois, ou une aggravation inhabituelle. Ils imposent un avis médical, parfois en urgence.</blockquote>

<h2>Comment traite-t-on la migraine ?</h2>
<p>La prise en charge distingue deux volets :</p>
<ul>
<li><strong>Traitement de la crise</strong> : pris dès le début, il associe antalgiques ou anti-inflammatoires et, si besoin, des médicaments spécifiques (les <strong>triptans</strong>). Se reposer dans le calme et l'obscurité aide.</li>
<li><strong>Traitement de fond</strong> : proposé quand les crises sont fréquentes ou invalidantes, il se prend chaque jour pour les espacer.</li>
</ul>
<p>Attention à l'excès d'antalgiques : une consommation trop fréquente peut, paradoxalement, entretenir des maux de tête (« céphalée par abus médicamenteux »).</p>

<h2>Comment prévenir les crises ?</h2>
<ul>
<li>Identifier et limiter ses déclencheurs personnels grâce à l'agenda des crises.</li>
<li>Avoir un sommeil régulier et une bonne hydratation.</li>
<li>Ne pas sauter de repas ; gérer le stress (relaxation, activité physique).</li>
<li>Traiter la crise tôt, sans multiplier les prises d'antalgiques.</li>
</ul>

<h2>Migraine : quand consulter ?</h2>
<p>Consultez si les crises sont fréquentes, intenses, retentissent sur votre vie, ou si vos traitements habituels ne suffisent plus. Le <a href="/specialites/medecine-generale">médecin généraliste</a> assure l'essentiel de la prise en charge et oriente si nécessaire. Tout mal de tête inhabituel ou d'apparition brutale justifie un avis rapide.</p>

<hr>
<p>Des migraines qui reviennent et gâchent vos journées ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const migraineFaq = [
  { q: "Quelle est la différence entre une migraine et un mal de tête ordinaire ?", a: "La migraine est une maladie : crises récurrentes de douleur souvent d'un côté, pulsatile, aggravée par l'effort, avec nausées et gêne à la lumière. Le mal de tête de tension, plus banal, ressemble à un étau des deux côtés, sans nausées et sans aggravation à l'effort." },
  { q: "Qu'est-ce qu'une aura migraineuse ?", a: "C'est un ensemble de signes précédant la crise chez certaines personnes : troubles visuels (points lumineux, lignes), fourmillements ou troubles passagers de la parole, durant quelques minutes. La migraine sans aura reste la plus fréquente." },
  { q: "Comment arrêter une crise de migraine ?", a: "En prenant le traitement dès les premiers signes : antalgiques ou anti-inflammatoires, et si besoin un triptan prescrit par le médecin. Se reposer au calme, dans l'obscurité, aide aussi. Éviter de multiplier les antalgiques, qui peuvent entretenir les maux de tête." },
  { q: "La migraine est-elle dangereuse ?", a: "La migraine typique n'est pas dangereuse, mais elle est invalidante. En revanche, un mal de tête brutal et intense, avec fièvre et raideur de la nuque, troubles neurologiques, ou après 50 ans pour la première fois, doit faire consulter sans attendre." },
  { q: "Pourquoi les femmes ont-elles plus de migraines ?", a: "Les variations hormonales, notamment liées aux règles, jouent un rôle déclenchant important. La migraine est ainsi deux à trois fois plus fréquente chez la femme, et souvent rythmée par le cycle menstruel." },
  { q: "Peut-on prévenir les migraines ?", a: "Oui, en partie : identifier ses déclencheurs (stress, sommeil irrégulier, jeûne, certains aliments) et les limiter espace les crises. Quand elles sont fréquentes, un traitement de fond quotidien peut être prescrit pour les réduire." },
];
const migraineTakeaways = [
  "La migraine est une maladie neurologique faite de crises récurrentes, pas un simple mal de tête.",
  "Douleur souvent d'un côté, pulsatile, avec nausées et gêne à la lumière et au bruit.",
  "Le diagnostic est clinique ; un agenda des crises aide beaucoup.",
  "Traitement de la crise (dont les triptans) et, si crises fréquentes, traitement de fond.",
  "Un mal de tête brutal ou inhabituel doit faire consulter sans attendre.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. HYPOTHYROÏDIE
// ─────────────────────────────────────────────────────────────────────────────
const cHypothyroidie = `<p>Fatigue qui s'installe, prise de poids inexpliquée, frilosité, moral en berne : ces symptômes discrets et peu spécifiques cachent parfois une hypothyroïdie, un trouble fréquent, surtout chez la femme. Bonne nouvelle : il se dépiste par une simple prise de sang et se traite très bien.</p>

<h2>Qu'est-ce que l'hypothyroïdie ?</h2>
<p>La thyroïde est une petite glande située à la base du cou, en forme de papillon. Elle fabrique les <strong>hormones thyroïdiennes</strong>, qui règlent le rythme de fonctionnement de tout l'organisme (le métabolisme). Dans l'<strong>hypothyroïdie</strong>, la thyroïde n'en produit pas assez : le corps « tourne au ralenti ».</p>
<p>C'est l'inverse de l'<strong>hyperthyroïdie</strong>, où la glande en produit trop (le corps « s'emballe » : nervosité, palpitations, amaigrissement).</p>

<h2>Quelles sont les causes ?</h2>
<ul>
<li><strong>Thyroïdite auto-immune (maladie de Hashimoto)</strong> : la cause la plus fréquente ; le système immunitaire attaque la thyroïde.</li>
<li><strong>Carence en iode</strong>, nécessaire à la fabrication des hormones.</li>
<li><strong>Suites d'un traitement</strong> de la thyroïde (chirurgie, iode radioactif).</li>
<li>Certains <strong>médicaments</strong> ; plus rarement, une cause congénitale (dépistée à la naissance).</li>
</ul>
<p>Les femmes, les personnes âgées et celles ayant des antécédents familiaux sont plus exposées ; la période <strong>après un accouchement</strong> est également à risque.</p>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li>Fatigue, somnolence, ralentissement</li>
<li>Prise de poids modérée malgré un appétit inchangé</li>
<li>Frilosité (sensibilité au froid)</li>
<li>Constipation, peau sèche, cheveux et ongles cassants</li>
<li>Humeur triste, troubles de la concentration et de la mémoire</li>
<li>Règles irrégulières</li>
</ul>
<p>Ces signes s'installent lentement et sont peu spécifiques, ce qui explique un diagnostic souvent tardif.</p>

<h2>Comment diagnostique-t-on l'hypothyroïdie ?</h2>
<p>Par une <strong>prise de sang</strong>. Le dosage de la <strong>TSH</strong> (l'hormone qui commande la thyroïde) est l'examen clé : dans l'hypothyroïdie, la TSH est <strong>élevée</strong>, tandis que l'hormone thyroïdienne (T4 libre) est basse ou normale.</p>
<table>
<thead><tr><th>Situation</th><th>TSH</th><th>T4 libre</th></tr></thead>
<tbody>
<tr><td>Normale</td><td>Normale</td><td>Normale</td></tr>
<tr><td>Hypothyroïdie fruste (débutante)</td><td>Élevée</td><td>Normale</td></tr>
<tr><td>Hypothyroïdie avérée</td><td>Élevée</td><td>Basse</td></tr>
</tbody>
</table>
<p>Le médecin peut compléter par la recherche d'anticorps (Hashimoto) et une échographie de la thyroïde.</p>

<h2>Quelles complications ?</h2>
<p>Non traitée, une hypothyroïdie marquée peut retentir sur le cœur (ralentissement, cholestérol), l'humeur et, dans de rares cas sévères, entraîner des complications graves. Pendant la <strong>grossesse</strong>, une hypothyroïdie doit être équilibrée, car elle est importante pour le développement du bébé.</p>

<h2>Comment se traite l'hypothyroïdie ?</h2>
<p>Le traitement consiste à <strong>remplacer l'hormone manquante</strong> par un comprimé de <strong>lévothyroxine</strong>, identique à l'hormone naturelle. Quelques principes :</p>
<ul>
<li>Se prend en général le matin, à jeun, chaque jour.</li>
<li>La dose est ajustée par le médecin sur le contrôle de la TSH.</li>
<li>Le traitement est le plus souvent <strong>à vie</strong>, bien toléré, sans dépendance.</li>
</ul>
<blockquote>Bon à savoir : ne modifiez pas votre dose vous-même. Un surdosage entraîne des signes d'hyperthyroïdie (palpitations, nervosité). Le suivi régulier de la TSH permet de trouver la dose juste.</blockquote>

<h2>Hypothyroïdie : quand consulter ?</h2>
<p>Consultez en cas de fatigue persistante, de prise de poids inexpliquée, de frilosité ou de troubles de l'humeur sans cause évidente, surtout chez la femme et en cas d'antécédents familiaux. Le <a href="/specialites/medecine-generale">médecin généraliste</a> prescrit le bilan et peut orienter vers un <a href="/specialites/endocrinologie-et-maladies-metaboliques">endocrinologue</a>. À noter : une hypothyroïdie peut parfois ressembler à une <a href="/blog/depression-maroc">dépression</a> — d'où l'intérêt d'un bilan.</p>

<hr>
<p>Une fatigue qui dure, un bilan thyroïdien à interpréter ? Sur SantéauMaroc, trouvez un médecin généraliste ou un endocrinologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const hypothyroidieFaq = [
  { q: "Quels sont les symptômes de l'hypothyroïdie ?", a: "Fatigue, prise de poids modérée, frilosité, constipation, peau sèche, cheveux cassants, humeur triste, troubles de la concentration et règles irrégulières. Ces signes s'installent lentement et sont peu spécifiques." },
  { q: "Comment diagnostique-t-on un problème de thyroïde ?", a: "Par une prise de sang. Le dosage de la TSH est l'examen clé : une TSH élevée oriente vers une hypothyroïdie, confirmée par le dosage de la T4 libre. Le médecin peut ajouter la recherche d'anticorps et une échographie." },
  { q: "Le traitement de l'hypothyroïdie est-il à vie ?", a: "Le plus souvent oui, surtout dans la maladie de Hashimoto. Le comprimé de lévothyroxine remplace l'hormone manquante ; il est bien toléré et ne crée pas de dépendance. La dose est ajustée sur la TSH lors du suivi." },
  { q: "Peut-on maigrir en traitant son hypothyroïdie ?", a: "Le traitement corrige le ralentissement du métabolisme et peut faire perdre les quelques kilos pris à cause de l'hypothyroïdie, souvent liés à une rétention d'eau. Il n'est pas un traitement amaigrissant et ne remplace pas une alimentation équilibrée." },
  { q: "Hypothyroïdie et grossesse : est-ce compatible ?", a: "Oui, mais l'hypothyroïdie doit être bien équilibrée, car les hormones thyroïdiennes sont importantes pour le développement du bébé. Les besoins augmentent pendant la grossesse : la dose et la TSH sont surveillées de près." },
  { q: "La fatigue peut-elle venir de la thyroïde ?", a: "Oui, la fatigue est un symptôme fréquent de l'hypothyroïdie. Mais elle a de nombreuses autres causes (anémie, dépression, manque de sommeil…). Une prise de sang permet de faire la part des choses avec votre médecin." },
];
const hypothyroidieTakeaways = [
  "L'hypothyroïdie, c'est une thyroïde qui produit trop peu d'hormones : le corps tourne au ralenti.",
  "Symptômes discrets : fatigue, prise de poids, frilosité, constipation, humeur triste.",
  "Le diagnostic repose sur une prise de sang : TSH élevée, T4 libre basse ou normale.",
  "Le traitement (lévothyroxine) remplace l'hormone manquante, souvent à vie et bien toléré.",
  "La dose s'ajuste sur la TSH : ne jamais la modifier soi-même.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. INSUFFISANCE RÉNALE
// ─────────────────────────────────────────────────────────────────────────────
const cInsuffisanceRenale = `<p>Les reins travaillent en silence pour filtrer le sang et éliminer les déchets. Quand ils s'abîment, l'insuffisance rénale s'installe souvent sans bruit, jusqu'à un stade avancé. Au Maroc, ses deux grandes causes — le diabète et l'hypertension — sont très répandues. Bonne nouvelle : dépistée tôt, sa progression peut être nettement ralentie.</p>

<h2>Qu'est-ce que l'insuffisance rénale ?</h2>
<p>Les reins filtrent le sang, éliminent les déchets et l'excès d'eau dans les urines, régulent la tension, les minéraux et fabriquent des substances utiles (dont celles qui stimulent les globules rouges). L'<strong>insuffisance rénale</strong> est la baisse de cette capacité de filtration.</p>
<p>Elle peut être <strong>aiguë</strong> (brutale, souvent réversible) ou <strong>chronique</strong> (installation lente et progressive sur des mois ou des années). C'est surtout la forme chronique qui pose un problème de santé publique.</p>

<h2>Quelles sont les causes et les facteurs de risque ?</h2>
<ol>
<li><strong><a href="/blog/diabete-type-2-maroc">Diabète</a></strong> : la première cause d'insuffisance rénale chronique.</li>
<li><strong><a href="/blog/hypertension-arterielle-maroc">Hypertension artérielle</a></strong> : la deuxième, qui abîme les vaisseaux du rein.</li>
<li>Maladies des reins (glomérulonéphrites), maladies héréditaires (polykystose).</li>
<li>Obstacles sur les voies urinaires (calculs, prostate), infections répétées.</li>
<li>Usage prolongé de certains médicaments toxiques pour le rein.</li>
</ol>

<h2>Quels sont les symptômes ?</h2>
<p>Au début, l'insuffisance rénale chronique est <strong>silencieuse</strong> : les reins compensent longtemps. Les signes n'apparaissent qu'à un stade avancé :</p>
<ul>
<li>Fatigue, pâleur (liée à l'anémie)</li>
<li>Gonflements (œdèmes) des chevilles, des paupières</li>
<li>Tension élevée</li>
<li>Urines mousseuses (protéines) ou de couleur anormale</li>
<li>Démangeaisons, nausées, perte d'appétit</li>
</ul>
<p>C'est pourquoi le <strong>dépistage</strong> des personnes à risque est essentiel : il ne faut pas attendre les symptômes.</p>

<h2>Comment diagnostique-t-on l'insuffisance rénale ?</h2>
<p>Par des examens simples :</p>
<ul>
<li><strong>Prise de sang</strong> : dosage de la <strong>créatinine</strong>, qui permet de calculer le <strong>débit de filtration glomérulaire (DFG)</strong>, reflet du fonctionnement des reins.</li>
<li><strong>Analyse d'urine</strong> : recherche de protéines (albumine), signe précoce d'atteinte.</li>
<li><strong>Échographie</strong> des reins.</li>
</ul>
<table>
<thead><tr><th>DFG (ml/min)</th><th>Fonction rénale</th></tr></thead>
<tbody>
<tr><td>≥ 90</td><td>Normale</td></tr>
<tr><td>60 – 89</td><td>Légèrement diminuée</td></tr>
<tr><td>30 – 59</td><td>Modérément diminuée</td></tr>
<tr><td>15 – 29</td><td>Sévèrement diminuée</td></tr>
<tr><td>&lt; 15</td><td>Insuffisance rénale terminale</td></tr>
</tbody>
</table>

<h2>Quelles complications ?</h2>
<p>Une insuffisance rénale évoluée retentit sur tout l'organisme : anémie, fragilité des os, risque cardiovasculaire accru, accumulation de déchets. Au stade <strong>terminal</strong>, les reins ne suffisent plus : un traitement de suppléance devient nécessaire — la <strong>dialyse</strong> (rein artificiel) ou la <strong>greffe de rein</strong>.</p>

<h2>Comment ralentir la maladie ?</h2>
<p>À défaut de « réparer » les reins, on peut freiner nettement la progression :</p>
<ul>
<li><strong>Équilibrer le diabète et la tension</strong> : la mesure la plus importante.</li>
<li>Réduire le sel, adapter l'alimentation selon les conseils du médecin.</li>
<li>Prendre les traitements prescrits qui protègent le rein.</li>
<li>Éviter l'automédication, en particulier les anti-inflammatoires (AINS).</li>
</ul>
<blockquote>Attention : les anti-inflammatoires (ibuprofène et autres AINS), pris de façon répétée sans avis médical, peuvent abîmer les reins. En cas de maladie rénale ou de facteurs de risque, demandez toujours conseil avant d'en prendre.</blockquote>

<h2>Insuffisance rénale : quand consulter ?</h2>
<p>Faites surveiller vos reins si vous êtes diabétique, hypertendu, ou si vous avez des antécédents familiaux — une simple prise de sang et une analyse d'urine suffisent. Le <a href="/specialites/medecine-generale">médecin généraliste</a> assure ce dépistage et oriente vers un néphrologue si nécessaire.</p>

<hr>
<p>Diabétique ou hypertendu, pensez à faire contrôler vos reins. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const insuffisanceRenaleFaq = [
  { q: "Quels sont les premiers signes d'une insuffisance rénale ?", a: "Au début, il n'y en a pas : la maladie est silencieuse. Les signes tardifs sont la fatigue, les gonflements (chevilles, paupières), une tension élevée, des urines mousseuses, des démangeaisons et des nausées. D'où l'importance du dépistage chez les personnes à risque." },
  { q: "Quelles sont les principales causes d'insuffisance rénale ?", a: "Le diabète est la première cause, suivi de l'hypertension artérielle. Viennent ensuite les maladies des reins, les maladies héréditaires, les obstacles urinaires et certains médicaments toxiques pour le rein." },
  { q: "Comment savoir si mes reins fonctionnent bien ?", a: "Par une prise de sang mesurant la créatinine (qui permet de calculer le débit de filtration, le DFG) et une analyse d'urine recherchant des protéines. Une échographie complète parfois le bilan. Ces examens sont simples et recommandés chez les personnes à risque." },
  { q: "L'insuffisance rénale se guérit-elle ?", a: "L'insuffisance rénale aiguë est souvent réversible. La forme chronique ne se guérit pas, mais sa progression peut être fortement ralentie en contrôlant le diabète, la tension et en évitant les médicaments toxiques pour le rein. Au stade terminal, la dialyse ou la greffe prennent le relais." },
  { q: "Peut-on prendre des anti-inflammatoires quand on a les reins fragiles ?", a: "Avec prudence et sur avis médical seulement. Les anti-inflammatoires (AINS) pris de façon répétée peuvent abîmer les reins. En cas de maladie rénale, de diabète ou d'hypertension, demandez toujours conseil avant d'en prendre." },
  { q: "Qu'est-ce que la dialyse ?", a: "La dialyse est un traitement qui filtre le sang à la place des reins défaillants, au stade terminal de l'insuffisance rénale. Elle peut se faire en centre plusieurs fois par semaine. La greffe de rein est l'autre solution de suppléance." },
];
const insuffisanceRenaleTakeaways = [
  "L'insuffisance rénale est la baisse de la capacité des reins à filtrer le sang.",
  "Diabète et hypertension en sont les deux principales causes, très fréquentes au Maroc.",
  "Longtemps silencieuse : seul le dépistage (créatinine, protéines urinaires) la révèle tôt.",
  "On ne la guérit pas, mais on ralentit fortement sa progression en la prenant tôt.",
  "Éviter l'automédication par anti-inflammatoires, toxiques pour les reins.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. ARTHROSE
// ─────────────────────────────────────────────────────────────────────────────
const cArthrose = `<p>L'arthrose est la maladie articulaire la plus fréquente, et l'une des premières causes de douleur et de gêne à partir de la cinquantaine. Souvent réduite à une fatalité liée à l'âge, elle se prend pourtant très bien en charge — et le pire ennemi de l'articulation arthrosique n'est pas le mouvement, mais l'immobilité.</p>

<h2>Qu'est-ce que l'arthrose ?</h2>
<p>L'arthrose est une <strong>usure du cartilage</strong>, ce tissu lisse qui recouvre l'extrémité des os et permet aux articulations de glisser sans frottement. Quand il s'abîme, les os frottent, l'articulation devient douloureuse et raide, et de petites excroissances osseuses peuvent se former.</p>
<p>Elle touche surtout le <strong>genou</strong> (gonarthrose), la <strong>hanche</strong> (coxarthrose), les <strong>mains</strong> et la <strong>colonne vertébrale</strong>.</p>

<h2>Arthrose ou arthrite : quelle différence ?</h2>
<table>
<thead><tr><th></th><th>Arthrose</th><th>Arthrite (inflammatoire)</th></tr></thead>
<tbody>
<tr><td>Origine</td><td>Usure mécanique du cartilage</td><td>Inflammation de l'articulation</td></tr>
<tr><td>Douleur</td><td>À l'effort, calmée par le repos</td><td>Au repos, réveille la nuit</td></tr>
<tr><td>Raideur du matin</td><td>Courte (quelques minutes)</td><td>Prolongée (plus de 30 min)</td></tr>
</tbody>
</table>

<h2>Quelles sont les causes et les facteurs de risque ?</h2>
<ul>
<li><strong>Âge</strong> : la fréquence augmente avec les années.</li>
<li><strong>Surpoids et obésité</strong> : un facteur majeur, surtout pour le genou et la hanche.</li>
<li><strong>Antécédents de traumatisme</strong> ou d'opération de l'articulation.</li>
<li><strong>Activités</strong> sollicitant fortement et répétitivement certaines articulations.</li>
<li><strong>Hérédité</strong> (notamment pour l'arthrose des mains) ; plus fréquente chez la femme après la ménopause.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li><strong>Douleur mécanique</strong> : déclenchée par l'effort et le mouvement, soulagée par le repos.</li>
<li><strong>Raideur</strong> courte au réveil ou après être resté immobile (« dérouillage »).</li>
<li>Craquements, gonflement par poussées, limitation des mouvements.</li>
</ul>
<p>L'arthrose évolue par périodes, avec des poussées douloureuses entrecoupées d'accalmies.</p>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Le diagnostic est <strong>clinique</strong>, confirmé par une <strong>radiographie</strong> qui montre le pincement de l'articulation (cartilage aminci) et les excroissances osseuses. Des examens complémentaires ne sont utiles que pour écarter une autre cause.</p>

<h2>Comment soulager l'arthrose ?</h2>
<p>Il n'existe pas de traitement qui « répare » le cartilage, mais on soulage efficacement la douleur et on préserve la fonction :</p>
<ul>
<li><strong>Bouger</strong> : une activité physique adaptée et régulière (marche, natation, vélo) entretient l'articulation. C'est essentiel.</li>
<li><strong>Perdre du poids</strong> : soulage nettement les genoux et les hanches.</li>
<li><strong>Kinésithérapie</strong> pour renforcer les muscles et préserver la mobilité.</li>
<li><strong>Médicaments</strong> de la douleur (paracétamol en première intention, anti-inflammatoires sur de courtes périodes), parfois infiltrations.</li>
<li><strong>Chirurgie (prothèse)</strong> aux stades avancés et invalidants, notamment pour la hanche et le genou.</li>
</ul>
<blockquote>Bon à savoir : contrairement à une idée reçue, le repos complet aggrave l'arthrose en affaiblissant les muscles. Le bon réflexe est de rester actif, en adaptant l'intensité et en évitant les chocs.</blockquote>

<h2>Comment prévenir ou freiner l'arthrose ?</h2>
<ul>
<li>Maintenir un poids sain.</li>
<li>Pratiquer une activité physique douce et régulière.</li>
<li>Protéger ses articulations (bonnes postures, éviter le port de charges excessives).</li>
<li>Renforcer les muscles qui soutiennent les articulations.</li>
</ul>

<h2>Arthrose : quand consulter ?</h2>
<p>Consultez en cas de douleur articulaire persistante, de raideur ou de gêne dans les mouvements du quotidien. Le <a href="/specialites/medecine-generale">médecin généraliste</a> pose le diagnostic, soulage et oriente si besoin vers un rhumatologue ou un chirurgien orthopédiste. Une douleur qui réveille la nuit ou une articulation chaude et gonflée doit faire évoquer une autre cause et consulter.</p>

<hr>
<p>Des douleurs articulaires qui vous limitent ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const arthroseFaq = [
  { q: "Quelle est la différence entre l'arthrose et l'arthrite ?", a: "L'arthrose est une usure mécanique du cartilage : la douleur survient à l'effort et se calme au repos, avec une raideur courte le matin. L'arthrite est une inflammation : la douleur est présente au repos, réveille la nuit et s'accompagne d'une raideur matinale prolongée." },
  { q: "Faut-il se reposer ou bouger quand on a de l'arthrose ?", a: "Il faut bouger. Le repos complet affaiblit les muscles et aggrave l'arthrose. Une activité physique adaptée et régulière (marche, natation, vélo), sans chocs, entretient l'articulation et réduit la douleur. C'est un pilier du traitement." },
  { q: "L'arthrose se guérit-elle ?", a: "On ne répare pas le cartilage usé, mais on soulage très bien la douleur et on préserve la fonction : activité adaptée, perte de poids, kinésithérapie, antalgiques et, aux stades avancés, pose d'une prothèse. La maladie se gère sur le long terme." },
  { q: "Le surpoids aggrave-t-il l'arthrose ?", a: "Oui, nettement, surtout pour le genou et la hanche qui portent le poids du corps. Perdre quelques kilos soulage significativement les articulations et ralentit l'évolution. La perte de poids fait partie du traitement." },
  { q: "Quels sports pratiquer avec de l'arthrose ?", a: "Les activités douces et sans chocs : marche, natation, aquagym, vélo. Elles entretiennent la mobilité et renforcent les muscles sans traumatiser l'articulation. Il vaut mieux éviter les sports à impacts répétés en cas d'arthrose avancée." },
  { q: "À quel âge apparaît l'arthrose ?", a: "Elle devient fréquente à partir de la cinquantaine, mais peut survenir plus tôt en cas de surpoids, d'antécédent de traumatisme ou d'activité très sollicitante. Ce n'est pas une simple fatalité de l'âge : on peut agir sur plusieurs facteurs." },
];
const arthroseTakeaways = [
  "L'arthrose est une usure du cartilage, la maladie articulaire la plus fréquente.",
  "Douleur mécanique (à l'effort, calmée par le repos) avec raideur courte au réveil.",
  "Le surpoids est un facteur majeur, surtout pour le genou et la hanche.",
  "Rester actif est essentiel : le repos complet aggrave l'arthrose.",
  "Traitement : activité adaptée, perte de poids, kiné, antalgiques, prothèse si besoin.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. ULCÈRE / GASTRITE
// ─────────────────────────────────────────────────────────────────────────────
const cUlcere = `<p>Brûlures ou douleurs au creux de l'estomac, surtout entre les repas ou la nuit ? La gastrite et l'ulcère font partie des causes les plus fréquentes. Longtemps attribués au seul stress, on sait aujourd'hui qu'une bactérie et certains médicaments en sont les vrais responsables — et qu'ils se traitent très bien.</p>

<h2>Gastrite et ulcère : de quoi parle-t-on ?</h2>
<p>La paroi de l'estomac est protégée par une muqueuse. Quand cette protection est dépassée :</p>
<ul>
<li>La <strong>gastrite</strong> est une <strong>inflammation</strong> de la muqueuse de l'estomac.</li>
<li>L'<strong>ulcère</strong> est une <strong>plaie profonde</strong> qui creuse la paroi de l'estomac ou du duodénum (le début de l'intestin). On parle d'ulcère gastroduodénal.</li>
</ul>

<h2>Quelles sont les causes ?</h2>
<ol>
<li><strong>La bactérie <em>Helicobacter pylori</em></strong> : la cause la plus fréquente, très répandue ; elle fragilise la muqueuse.</li>
<li><strong>Les anti-inflammatoires (AINS) et l'aspirine</strong>, surtout pris de façon prolongée.</li>
<li><strong>Le tabac et l'alcool</strong>, qui agressent la muqueuse.</li>
<li>Le <strong>stress</strong> et une alimentation irritante aggravent les symptômes sans en être, à eux seuls, la cause.</li>
</ol>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li><strong>Douleur ou brûlure</strong> au creux de l'estomac (épigastre), parfois rythmée par les repas ou survenant la nuit</li>
<li>Sensation de faim douloureuse, calmée ou aggravée par l'alimentation</li>
<li>Nausées, ballonnements, digestion difficile, perte d'appétit</li>
</ul>
<p>Certains ulcères sont peu ou pas douloureux et se révèlent par une complication.</p>
<blockquote>Attention : consultez en urgence en cas de vomissements de sang (rouge ou « marc de café »), de selles noires et collantes (comme du goudron), de douleur abdominale brutale et intense, de malaise ou de pâleur. Ce sont des signes d'hémorragie ou de perforation, complications graves de l'ulcère.</blockquote>

<h2>Comment fait-on le diagnostic ?</h2>
<p>L'examen de référence est la <strong>fibroscopie (gastroscopie)</strong> : une caméra souple explore l'estomac, visualise la gastrite ou l'ulcère et permet des prélèvements. La recherche d'<em>Helicobacter pylori</em> se fait par biopsie lors de la fibroscopie, par un <strong>test respiratoire</strong> ou d'autres tests. La fibroscopie est particulièrement recommandée après 50 ans ou en présence de signes d'alerte.</p>

<h2>Quelles complications ?</h2>
<p>Non traité, l'ulcère peut se compliquer d'une <strong>hémorragie digestive</strong>, d'une <strong>perforation</strong> de la paroi (urgence chirurgicale) ou d'un rétrécissement. Par ailleurs, l'infection chronique à <em>Helicobacter pylori</em> est associée à un risque accru de cancer de l'estomac, d'où l'intérêt de la traiter.</p>

<h2>Comment se traite l'ulcère ?</h2>
<ul>
<li><strong>Médicaments antiacides</strong> : les inhibiteurs de la pompe à protons (IPP) réduisent fortement l'acidité et permettent la cicatrisation.</li>
<li><strong>Éradication d'<em>Helicobacter pylori</em></strong> : une association d'antibiotiques et d'IPP pendant une durée définie, quand la bactérie est présente.</li>
<li><strong>Arrêt des facteurs agressants</strong> : anti-inflammatoires, tabac, alcool.</li>
</ul>
<p>Bien traité, l'ulcère cicatrise et les récidives deviennent rares, surtout après éradication de la bactérie.</p>

<h2>Comment prévenir ?</h2>
<ul>
<li>Ne pas prendre d'anti-inflammatoires de façon prolongée sans avis médical, et jamais l'estomac vide en cas de sensibilité.</li>
<li>Limiter tabac et alcool.</li>
<li>Consulter en cas de brûlures d'estomac persistantes plutôt que de recourir aux antiacides au long cours sans avis.</li>
</ul>

<h2>Ulcère : quand consulter ?</h2>
<p>Consultez en cas de brûlures ou de douleurs de l'estomac persistantes ou récidivantes. Le <a href="/specialites/medecine-generale">médecin généraliste</a> évalue et oriente, si besoin, vers un <a href="/specialites/gastro-enterologie">gastro-entérologue</a> pour une fibroscopie. Les signes d'hémorragie (sang dans les vomissements, selles noires) imposent d'appeler les secours immédiatement.</p>

<hr>
<p>Des brûlures d'estomac qui reviennent ? Sur SantéauMaroc, trouvez un médecin généraliste ou un gastro-entérologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const ulcereFaq = [
  { q: "Quelle est la différence entre une gastrite et un ulcère ?", a: "La gastrite est une inflammation de la muqueuse de l'estomac. L'ulcère est une plaie plus profonde qui creuse la paroi de l'estomac ou du duodénum. L'ulcère est généralement plus douloureux et peut se compliquer." },
  { q: "Le stress donne-t-il des ulcères ?", a: "Le stress aggrave les symptômes et la douleur, mais il n'est pas la cause principale. Les vrais responsables sont surtout la bactérie Helicobacter pylori et les anti-inflammatoires. C'est une idée reçue tenace que le stress seul creuse l'ulcère." },
  { q: "Qu'est-ce qu'Helicobacter pylori ?", a: "C'est une bactérie très répandue qui colonise l'estomac et fragilise sa muqueuse. Elle est la première cause d'ulcère et augmente le risque de cancer de l'estomac. Elle se recherche par test respiratoire ou biopsie, et se traite par des antibiotiques." },
  { q: "Comment savoir si j'ai un ulcère ?", a: "L'examen de référence est la fibroscopie (gastroscopie) : une caméra explore l'estomac, visualise l'ulcère et permet de rechercher Helicobacter pylori. Elle est recommandée en cas de symptômes persistants, après 50 ans ou en présence de signes d'alerte." },
  { q: "Quels aliments éviter en cas d'ulcère ?", a: "Il n'y a pas de régime strict, mais il est conseillé de limiter l'alcool, le café en excès, les plats très épicés ou très gras qui aggravent les brûlures, et surtout d'arrêter le tabac. Le traitement médicamenteux reste l'essentiel." },
  { q: "Un ulcère peut-il être grave ?", a: "Oui s'il se complique : hémorragie digestive (vomissements de sang, selles noires) ou perforation, qui sont des urgences. Bien traité, en revanche, l'ulcère cicatrise et les récidives sont rares, surtout après éradication d'Helicobacter pylori." },
];
const ulcereTakeaways = [
  "La gastrite est une inflammation de l'estomac ; l'ulcère, une plaie plus profonde de sa paroi.",
  "Causes principales : la bactérie Helicobacter pylori et les anti-inflammatoires (AINS).",
  "Symptôme typique : brûlure au creux de l'estomac, parfois la nuit ou entre les repas.",
  "Le diagnostic de référence est la fibroscopie, avec recherche d'Helicobacter pylori.",
  "Sang dans les vomissements ou selles noires = urgence (hémorragie).",
];

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES PILIERS
// ─────────────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    slug: "allergie-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Allergie",
    title: "Allergies au Maroc : causes, symptômes et traitements",
    excerpt: "Rhinite, urticaire, asthme, allergie alimentaire : comprendre les allergies, identifier les allergènes, reconnaître l'anaphylaxie et connaître les traitements, expliqué et adapté au Maroc.",
    content: cAllergie,
    metaTitle: "Allergies au Maroc : causes, symptômes et traitement",
    metaDesc: "Allergies : formes (rhinite, urticaire, asthme, alimentaire), allergènes fréquents, diagnostic, anaphylaxie et traitements (antihistaminiques, désensibilisation), au Maroc.",
    readingTime: 6,
    keyTakeaways: allergieTakeaways,
    faq: allergieFaq,
  },
  {
    slug: "migraine-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Migraine",
    title: "Migraine au Maroc : symptômes, déclencheurs et traitements",
    excerpt: "La migraine est une vraie maladie neurologique, pas un simple mal de tête. Symptômes, aura, déclencheurs, diagnostic et traitements (crise et fond) : le guide pour mieux la contrôler, au Maroc.",
    content: cMigraine,
    metaTitle: "Migraine au Maroc : symptômes, causes et traitement",
    metaDesc: "Migraine : différence avec un mal de tête ordinaire, aura, déclencheurs, diagnostic et traitements de crise (triptans) et de fond. Mieux comprendre et gérer ses crises, au Maroc.",
    readingTime: 6,
    keyTakeaways: migraineTakeaways,
    faq: migraineFaq,
  },
  {
    slug: "hypothyroidie-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Hypothyroïdie",
    title: "Hypothyroïdie au Maroc : symptômes, causes et traitement",
    excerpt: "Fatigue, prise de poids, frilosité : et si c'était la thyroïde ? Symptômes, causes, diagnostic par la TSH et traitement (lévothyroxine) de l'hypothyroïdie, expliqués et adaptés au Maroc.",
    content: cHypothyroidie,
    metaTitle: "Hypothyroïdie au Maroc : symptômes, causes et traitement",
    metaDesc: "Hypothyroïdie : symptômes (fatigue, prise de poids, frilosité), causes, diagnostic par la TSH et traitement par lévothyroxine. Un trouble fréquent qui se traite bien, au Maroc.",
    readingTime: 6,
    keyTakeaways: hypothyroidieTakeaways,
    faq: hypothyroidieFaq,
  },
  {
    slug: "insuffisance-renale-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Insuffisance rénale",
    title: "Insuffisance rénale au Maroc : causes, signes et prévention",
    excerpt: "Souvent silencieuse, l'insuffisance rénale a pour premières causes le diabète et l'hypertension. Signes, diagnostic (créatinine, DFG), complications et prévention, expliqués et adaptés au Maroc.",
    content: cInsuffisanceRenale,
    metaTitle: "Insuffisance rénale au Maroc : causes, signes et prévention",
    metaDesc: "Insuffisance rénale : causes (diabète, hypertension), signes tardifs, diagnostic (créatinine, DFG, protéinurie), complications, dialyse et prévention, adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: insuffisanceRenaleTakeaways,
    faq: insuffisanceRenaleFaq,
  },
  {
    slug: "arthrose-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Arthrose",
    title: "Arthrose au Maroc : symptômes, causes et comment la soulager",
    excerpt: "Douleur du genou, de la hanche ou des mains : l'arthrose est la maladie articulaire la plus fréquente. Symptômes, causes, diagnostic et solutions pour la soulager (dont l'activité), adaptés au Maroc.",
    content: cArthrose,
    metaTitle: "Arthrose au Maroc : symptômes, causes et traitement",
    metaDesc: "Arthrose : symptômes (douleur mécanique, raideur), différence avec l'arthrite, causes (âge, surpoids), diagnostic et solutions pour la soulager (activité, kiné, prothèse), au Maroc.",
    readingTime: 6,
    keyTakeaways: arthroseTakeaways,
    faq: arthroseFaq,
  },
  {
    slug: "ulcere-estomac-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Ulcère gastroduodénal",
    title: "Ulcère de l'estomac et gastrite au Maroc : causes et traitement",
    excerpt: "Brûlures d'estomac, douleurs : gastrite et ulcère sont surtout dus à la bactérie Helicobacter pylori et aux anti-inflammatoires. Causes, diagnostic, complications et traitement, adaptés au Maroc.",
    content: cUlcere,
    metaTitle: "Ulcère de l'estomac et gastrite au Maroc : causes et traitement",
    metaDesc: "Ulcère et gastrite : causes (Helicobacter pylori, anti-inflammatoires), symptômes, fibroscopie, complications (hémorragie) et traitement (IPP, antibiotiques), adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: ulcereTakeaways,
    faq: ulcereFaq,
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (slug) => {
    const c = cats.find((x) => x.slug === slug);
    if (!c) throw new Error(`Catégorie introuvable : ${slug}`);
    return c.id;
  };

  const now = new Date();

  for (const art of PILLARS) {
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
    console.log(`✓ Fiche Maladie  /blog/${post.slug}`);
  }

  console.log(`\nVague 3 : ${PILLARS.length} fiches Maladie publiées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
