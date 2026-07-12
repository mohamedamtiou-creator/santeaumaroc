require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie SYMPTÔMES — nouvelle rubrique du blog (gabarit dédié, distinct des
// fiches Maladie). Chaque fiche : causes fréquentes, causes graves, que faire à
// la maison, quand consulter, QUAND APPELER LES URGENCES, examens possibles,
// traitements possibles + FAQ + À retenir. Rappel constant : seul un médecin
// pose un diagnostic. SEO/GEO/E-E-A-T (aboutEntity = MedicalSignOrSymptom logique,
// stocké comme aboutEntity ; le moteur émet about: MedicalCondition — acceptable).
//
// Le script CRÉE d'abord la catégorie `symptomes`, puis seede les fiches.
// Intro/FAQ de la page catégorie : lib/blog-category-content.ts.
// Mappings CTA spécialiste : lib/blog-related.ts.
// Idempotent (upsert). 1er lot : 6 symptômes à fort trafic.
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Symptômes",
  slug: "symptomes",
  description:
    "Comprendre ses symptômes : causes possibles fréquentes et graves, ce qu'on peut faire à la maison, et surtout quand consulter ou appeler les urgences. Une information fiable qui ne remplace jamais l'avis d'un médecin.",
  color: "rose",
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. MAL DE VENTRE
// ─────────────────────────────────────────────────────────────────────────────
const cVentre = `<p>Le mal de ventre est l'un des motifs de consultation les plus fréquents. La plupart du temps bénin et passager, il peut aussi, plus rarement, révéler une urgence. Savoir reconnaître les signaux d'alerte permet de réagir au bon moment — sans s'inquiéter inutilement pour une simple indigestion.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Indigestion, excès alimentaire, repas trop gras ou épicé</li>
<li>Gastro-entérite (souvent avec diarrhée et vomissements)</li>
<li>Constipation, ballonnements, gaz</li>
<li>Brûlures d'estomac (<a href="/blog/reflux-gastro-oesophagien-maroc">reflux</a>) ou <a href="/blog/ulcere-estomac-maroc">gastrite/ulcère</a></li>
<li>Règles douloureuses chez la femme</li>
<li>Stress et anxiété (le ventre est très sensible aux émotions)</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<p>Certaines douleurs abdominales imposent un avis médical rapide car elles peuvent traduire une urgence :</p>
<ul>
<li><strong>Appendicite</strong> (douleur qui se fixe en bas à droite)</li>
<li><strong>Occlusion intestinale</strong> (arrêt des gaz et des selles, ventre gonflé)</li>
<li><strong>Colique néphrétique</strong> (<a href="/blog/calculs-renaux-maroc">calcul rénal</a>) ou crise de calcul biliaire</li>
<li><strong>Ulcère compliqué</strong>, pancréatite</li>
<li>Urgence gynécologique, en particulier <strong>en cas de grossesse</strong> (grossesse extra-utérine)</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Se reposer, boire par petites gorgées, manger léger (riz, bouillon) sans se forcer.</li>
<li>Une bouillotte tiède peut soulager les crampes.</li>
<li>Éviter l'automédication par anti-inflammatoires (ibuprofène), qui agressent l'estomac.</li>
</ul>
<blockquote>Attention : ne prenez pas d'antidouleur puissant qui masquerait une douleur importante avant d'avoir vu un médecin. Une douleur qui « disparaît » sous antalgique peut retarder le diagnostic d'une urgence.</blockquote>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si la douleur dure plus de 48 heures, revient régulièrement, ou s'accompagne de fièvre, de vomissements, d'un changement du transit, de sang dans les selles ou d'un amaigrissement.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) en cas de :</p>
<ul>
<li>Douleur abdominale <strong>brutale et très intense</strong>, ou ventre dur et très douloureux</li>
<li>Vomissements de sang ou selles noires</li>
<li>Fièvre élevée avec frissons, malaise</li>
<li>Douleur abdominale chez une femme enceinte</li>
<li>Arrêt total des gaz et des selles avec ventre gonflé</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Selon le contexte : examen clinique, prise de sang, bandelette urinaire, échographie abdominale, parfois scanner ou fibroscopie. Le médecin choisit en fonction de la localisation et des signes associés.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent entièrement de la cause : antispasmodiques pour les crampes, traitement du reflux, réhydratation en cas de gastro-entérite, antibiotiques si infection, chirurgie en cas d'urgence (appendicite, occlusion). <strong>Seul un médecin peut poser un diagnostic</strong> et prescrire le traitement adapté.</p>

<hr>
<p>Un mal de ventre inquiétant ou qui dure ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;

const ventreFaq = [
  { q: "Quand un mal de ventre est-il une urgence ?", a: "En cas de douleur brutale et très intense, de ventre dur, de vomissements de sang ou de selles noires, de fièvre élevée avec malaise, d'arrêt des gaz et des selles, ou de douleur chez une femme enceinte. Il faut alors appeler les secours (SAMU 141)." },
  { q: "Que prendre contre un mal de ventre ?", a: "Pour une douleur bénigne : repos, hydratation par petites gorgées, repas léger et éventuellement une bouillotte. Évitez les anti-inflammatoires (ibuprofène), qui agressent l'estomac, et ne masquez pas une douleur importante par un antalgique puissant avant d'avoir consulté." },
  { q: "Un mal de ventre à droite, est-ce l'appendicite ?", a: "Une douleur qui se fixe en bas à droite, surtout avec fièvre, nausées et sensibilité au toucher, peut évoquer une appendicite et impose un avis médical rapide. Mais d'autres causes existent : seul un médecin peut trancher après examen." },
  { q: "Le stress peut-il donner mal au ventre ?", a: "Oui, le ventre est très sensible aux émotions : le stress et l'anxiété provoquent fréquemment des douleurs, des crampes ou des troubles du transit. Cela reste un diagnostic d'élimination, après avoir écarté une cause physique." },
  { q: "Combien de temps peut durer un mal de ventre bénin ?", a: "Une douleur liée à une indigestion ou une gastro-entérite dure en général quelques heures à quelques jours. Au-delà de 48 heures, si elle revient ou s'aggrave, ou en présence d'autres signes, il faut consulter." },
  { q: "Mal de ventre et grossesse : faut-il s'inquiéter ?", a: "Toute douleur abdominale pendant la grossesse, surtout si elle est intense ou s'accompagne de saignements, doit amener à consulter sans attendre. En début de grossesse, une douleur d'un côté peut évoquer une grossesse extra-utérine, une urgence." },
];
const ventreTakeaways = [
  "La plupart des maux de ventre sont bénins (indigestion, gastro, constipation, stress).",
  "Certaines douleurs sont des urgences : appendicite, occlusion, calcul, urgence gynécologique.",
  "À la maison : repos, hydratation, repas léger ; éviter les anti-inflammatoires.",
  "Douleur brutale et intense, sang, fièvre ou grossesse = appeler les secours.",
  "Seul un médecin peut poser un diagnostic : ne pas masquer une douleur importante.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. MAL DE TÊTE
// ─────────────────────────────────────────────────────────────────────────────
const cTete = `<p>Le mal de tête (céphalée) touche presque tout le monde à un moment ou à un autre. Il est le plus souvent bénin, lié à la fatigue, au stress ou à une migraine. Plus rarement, il peut être le signe d'un problème grave. Voici comment faire la part des choses et savoir quand s'inquiéter.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Céphalée de tension (sensation d'étau), liée au stress et à la fatigue</li>
<li><a href="/blog/migraine-maroc">Migraine</a> (douleur d'un côté, pulsatile, avec nausées)</li>
<li>Manque de sommeil, déshydratation, saut de repas, jeûne</li>
<li>Excès d'écrans, problème de vue non corrigé</li>
<li><a href="/blog/sinusite-maroc">Sinusite</a>, rhume</li>
<li>Sevrage en caféine, ou au contraire abus d'antalgiques</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li><strong>Méningite</strong> : mal de tête avec fièvre et raideur de la nuque</li>
<li><strong><a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a> ou hémorragie</strong> : céphalée brutale et intense « en coup de tonnerre »</li>
<li>Poussée d'<a href="/blog/hypertension-arterielle-maroc">hypertension</a> sévère</li>
<li>Plus rarement : tumeur, glaucome aigu (œil rouge et douloureux)</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Se reposer dans un endroit calme et sombre.</li>
<li>Boire de l'eau, manger si l'on est à jeun.</li>
<li>Prendre un antalgique simple (paracétamol) sans en abuser.</li>
<li>Limiter les écrans et régulariser le sommeil.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si les maux de tête sont fréquents, s'aggravent, résistent aux antalgiques habituels, apparaissent pour la première fois après 50 ans, ou s'accompagnent d'autres symptômes.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) devant :</p>
<ul>
<li>Un mal de tête <strong>brutal et très intense</strong>, « comme jamais ressenti »</li>
<li>Un mal de tête avec <strong>fièvre et raideur de la nuque</strong></li>
<li>Des <strong>troubles neurologiques</strong> : trouble de la parole, faiblesse d'un côté, trouble de la vision, confusion</li>
<li>Un mal de tête après un <strong>traumatisme crânien</strong></li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Le plus souvent, l'interrogatoire et l'examen (dont la mesure de la tension) suffisent. Une imagerie du cerveau (scanner, IRM) n'est demandée qu'en présence de signes d'alerte.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent de la cause : antalgiques et repos pour une céphalée de tension, traitement spécifique de la migraine, correction de la vue, prise en charge d'une sinusite. <strong>Seul un médecin peut poser un diagnostic</strong> devant un mal de tête inhabituel.</p>

<hr>
<p>Des maux de tête fréquents ou inhabituels ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;

const teteFaq = [
  { q: "Quand un mal de tête est-il grave ?", a: "Un mal de tête brutal et très intense « comme jamais ressenti », avec fièvre et raideur de la nuque, avec des troubles neurologiques (parole, vision, force) ou après un traumatisme crânien, doit faire appeler les secours. Ces situations sont rares mais sérieuses." },
  { q: "Comment faire passer un mal de tête ?", a: "Pour une céphalée banale : se reposer au calme et dans l'obscurité, boire de l'eau, manger si l'on est à jeun, prendre un antalgique simple sans en abuser et limiter les écrans. Un excès d'antalgiques peut paradoxalement entretenir les maux de tête." },
  { q: "Quelle différence entre migraine et mal de tête de tension ?", a: "La migraine est une douleur souvent d'un côté, pulsatile, avec nausées et gêne à la lumière, aggravée par l'effort. La céphalée de tension ressemble à un étau des deux côtés, sans nausées ni aggravation à l'effort." },
  { q: "Pourquoi ai-je mal à la tête tous les jours ?", a: "Des maux de tête quotidiens peuvent être liés au stress, à un mauvais sommeil, à un problème de vue, à une consommation trop fréquente d'antalgiques ou à une migraine chronique. Ils justifient une consultation pour en trouver la cause." },
  { q: "Le mal de tête peut-il venir de la tension ?", a: "Une hypertension sévère peut donner des maux de tête, souvent le matin et à l'arrière du crâne. Mais l'hypertension est le plus souvent silencieuse : seul un contrôle de la tension permet de le vérifier." },
  { q: "Faut-il faire un scanner pour un mal de tête ?", a: "Non, pas dans la majorité des cas. L'imagerie du cerveau n'est nécessaire qu'en présence de signes d'alerte (céphalée brutale, signes neurologiques, apparition après 50 ans, aggravation). Le médecin décide selon l'examen." },
];
const teteTakeaways = [
  "La plupart des maux de tête sont bénins (tension, migraine, fatigue, déshydratation).",
  "Une céphalée brutale et intense « comme jamais » est une urgence.",
  "Fièvre + raideur de la nuque, ou troubles neurologiques = appeler les secours.",
  "À la maison : repos au calme, hydratation, antalgique simple sans abus.",
  "Seul un médecin peut poser un diagnostic devant un mal de tête inhabituel.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. FIÈVRE (ADULTE)
// ─────────────────────────────────────────────────────────────────────────────
const cFievre = `<p>La fièvre — une température supérieure à 38 °C — n'est pas une maladie, mais un signe : c'est la réaction normale de l'organisme qui lutte, le plus souvent contre une infection. Chez l'adulte, elle est généralement bénigne et passagère. Certaines situations imposent toutefois de consulter rapidement. (Pour l'enfant, voir notre guide dédié : <a href="/blog/fievre-enfant-que-faire-maroc">la fièvre chez l'enfant</a>.)</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Infections virales : grippe, rhume, angine, infections respiratoires</li>
<li>Infections bactériennes : angine, infection urinaire, infection pulmonaire</li>
<li>Réaction après une vaccination</li>
<li>Coup de chaleur, en été</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li><strong>Infection sévère</strong> pouvant se généraliser (sepsis)</li>
<li><strong>Méningite</strong> (fièvre avec maux de tête violents et raideur de la nuque)</li>
<li><strong>Paludisme</strong> en cas de retour d'un pays où il circule</li>
<li>Infection urinaire haute (avec douleur du dos), pneumonie</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Boire abondamment pour compenser les pertes en eau.</li>
<li>Se reposer et ne pas trop se couvrir.</li>
<li>Prendre du paracétamol pour le confort, en respectant les doses.</li>
<li>Surveiller la température et l'évolution des symptômes.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si la fièvre dure plus de 3 jours, si elle est mal tolérée, si elle survient chez une personne âgée, enceinte, immunodéprimée ou porteuse d'une maladie chronique, ou si elle s'accompagne de symptômes marqués (douleur, toux, brûlures urinaires).</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) en cas de fièvre avec :</p>
<ul>
<li><strong>Raideur de la nuque</strong>, maux de tête violents, ou <strong>taches rouges/violacées</strong> sur la peau</li>
<li><strong>Confusion</strong>, somnolence anormale, difficulté à réveiller la personne</li>
<li><strong>Difficulté à respirer</strong></li>
<li>Fièvre <strong>au retour d'un pays impaludé</strong>, ou chez une personne très fragile</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Selon le contexte : prise de sang, analyse d'urine (ECBU), radiographie du thorax, prélèvement de gorge, test du paludisme si voyage. Le médecin cible les examens selon les symptômes.</p>

<h2>Quels traitements possibles ?</h2>
<p>Le traitement vise la cause : la plupart des fièvres virales guérissent seules avec du repos et de l'hydratation. Les antibiotiques ne sont utiles qu'en cas d'infection bactérienne, sur prescription. Le paracétamol soulage l'inconfort mais ne traite pas la cause. <strong>Seul un médecin peut poser un diagnostic.</strong></p>

<hr>
<p>Une fièvre qui inquiète ou qui dure ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;

const fievreFaq = [
  { q: "À partir de quelle température parle-t-on de fièvre ?", a: "On parle de fièvre à partir de 38 °C. Entre 37,5 et 38 °C, on parle de fébricule. La fièvre est une réaction normale de défense de l'organisme, le plus souvent contre une infection, et n'est pas une maladie en soi." },
  { q: "Quand s'inquiéter d'une fièvre chez l'adulte ?", a: "Si elle dure plus de 3 jours, est mal tolérée, ou survient chez une personne fragile (âgée, enceinte, immunodéprimée). Elle devient une urgence avec raideur de la nuque, taches cutanées, confusion, difficulté à respirer, ou au retour d'un pays impaludé." },
  { q: "Comment faire baisser la fièvre ?", a: "En buvant abondamment, en se reposant, en ne se couvrant pas trop et en prenant du paracétamol en respectant les doses. Ces mesures améliorent le confort ; elles ne traitent pas la cause de la fièvre, qui doit être identifiée si elle persiste." },
  { q: "Faut-il des antibiotiques pour la fièvre ?", a: "Pas systématiquement. La plupart des fièvres sont virales et guérissent seules. Les antibiotiques ne sont utiles qu'en cas d'infection bactérienne, prouvée ou suspectée par le médecin. Les prendre sans raison est inutile et favorise les résistances." },
  { q: "Fièvre au retour de voyage : que faire ?", a: "Une fièvre au retour d'un pays où circule le paludisme est une urgence : il faut consulter rapidement et signaler le voyage. D'autres infections tropicales peuvent aussi se manifester par de la fièvre : ne les négligez pas." },
  { q: "La fièvre est-elle dangereuse en elle-même ?", a: "Chez l'adulte, la fièvre elle-même est rarement dangereuse ; c'est sa cause qui compte. L'important est de surveiller les signes associés et la tolérance, et de consulter si la fièvre persiste ou s'accompagne de signes d'alerte." },
];
const fievreTakeaways = [
  "La fièvre (> 38 °C) est un signe de défense, pas une maladie : le plus souvent une infection.",
  "Chez l'adulte, elle est généralement bénigne et guérit seule avec repos et hydratation.",
  "Consulter si elle dure plus de 3 jours ou chez une personne fragile.",
  "Raideur de la nuque, taches cutanées, confusion, gêne à respirer = appeler les secours.",
  "Antibiotiques seulement si infection bactérienne : seul un médecin peut en juger.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. TOUX
// ─────────────────────────────────────────────────────────────────────────────
const cToux = `<p>La toux est un réflexe utile qui protège les voies respiratoires. Le plus souvent, elle accompagne un rhume et disparaît en quelques jours. Mais une toux qui s'installe ou qui s'accompagne de certains signes doit faire consulter — au Maroc, elle peut notamment révéler une tuberculose, qui se soigne bien lorsqu'elle est prise à temps.</p>

<h2>Toux aiguë ou chronique ?</h2>
<p>On distingue la <strong>toux aiguë</strong> (moins de 3 semaines, souvent virale) de la <strong>toux chronique</strong> (plus de 8 semaines), qui nécessite d'en rechercher la cause.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Infections virales : rhume, bronchite, laryngite</li>
<li><a href="/blog/allergie-maroc">Allergie</a> et <a href="/blog/asthme-maroc">asthme</a></li>
<li><a href="/blog/reflux-gastro-oesophagien-maroc">Reflux</a> gastro-œsophagien</li>
<li>Écoulement nasal postérieur (<a href="/blog/sinusite-maroc">sinusite</a>)</li>
<li>Tabac ; certains médicaments de la tension</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li><strong>Pneumonie</strong> (fièvre, essoufflement, douleur)</li>
<li><strong>Tuberculose</strong> : toux de plus de 2-3 semaines, sueurs nocturnes, amaigrissement, parfois crachats de sang</li>
<li><strong><a href="/blog/bpco-maroc">BPCO</a></strong> chez le fumeur, insuffisance cardiaque</li>
<li>Plus rarement, un cancer ou un corps étranger inhalé</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li>Bien s'hydrater ; le miel peut apaiser une toux sèche (sauf chez le nourrisson).</li>
<li>Arrêter de fumer et aérer l'intérieur.</li>
<li>Ne pas chercher à supprimer une toux grasse : elle aide à évacuer les sécrétions.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si la toux dure plus de 3 semaines, si elle s'accompagne de fièvre, d'essoufflement, de crachats colorés, d'un amaigrissement ou de sueurs nocturnes (évoquer la tuberculose), ou si elle revient régulièrement.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) en cas de :</p>
<ul>
<li><strong>Difficulté importante à respirer</strong>, respiration rapide et épuisante</li>
<li><strong>Douleur intense dans la poitrine</strong></li>
<li><strong>Crachats de sang abondants</strong></li>
<li>Lèvres ou ongles qui <strong>bleuissent</strong></li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Selon le contexte : auscultation, radiographie du thorax, spirométrie (test du souffle), analyse des crachats (recherche de tuberculose), prise de sang. Le médecin oriente selon la durée et les signes.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent de la cause : la toux virale guérit seule, l'asthme et l'allergie ont leurs traitements, le reflux et la sinusite aussi. Les antibiotiques ne servent qu'en cas d'infection bactérienne. <strong>Seul un médecin peut poser un diagnostic</strong> devant une toux qui traîne.</p>

<hr>
<p>Une toux qui persiste ou qui inquiète ? Sur SantéauMaroc, trouvez un médecin ou un pneumologue près de chez vous et prenez rendez-vous en ligne. En cas de signe d'urgence, appelez immédiatement les secours.</p>`;

const touxFaq = [
  { q: "Quand une toux doit-elle inquiéter ?", a: "Une toux qui dure plus de 3 semaines, avec fièvre, essoufflement, crachats colorés ou de sang, amaigrissement ou sueurs nocturnes, doit faire consulter. Au Maroc, une toux prolongée avec ces signes fait notamment rechercher une tuberculose." },
  { q: "Comment calmer une toux à la maison ?", a: "En s'hydratant bien, avec du miel pour une toux sèche (pas chez le nourrisson), en arrêtant de fumer et en aérant. Il ne faut pas chercher à supprimer une toux grasse, qui aide à évacuer les sécrétions." },
  { q: "Quelle différence entre toux sèche et toux grasse ?", a: "La toux sèche est irritative, sans crachats ; la toux grasse ramène des sécrétions (crachats). La toux grasse a un rôle utile et ne doit pas être bloquée. Leur cause et leur prise en charge peuvent différer." },
  { q: "Une toux peut-elle venir de l'estomac ?", a: "Oui. Le reflux gastro-œsophagien est une cause fréquente de toux chronique, surtout la nuit ou après les repas. D'autres causes possibles sont l'asthme, l'allergie et l'écoulement nasal postérieur d'une sinusite." },
  { q: "Quand la toux est-elle une urgence ?", a: "En cas de difficulté importante à respirer, de douleur intense dans la poitrine, de crachats de sang abondants ou de lèvres qui bleuissent. Il faut alors appeler les secours sans attendre." },
  { q: "Combien de temps dure une toux après un rhume ?", a: "Une toux post-rhume peut persister une à deux semaines, parfois un peu plus, même après la guérison du rhume. Si elle dépasse 3 semaines ou s'aggrave, il faut consulter pour en rechercher la cause." },
];
const touxTakeaways = [
  "La toux est un réflexe utile ; la plupart des toux aiguës sont virales et passagères.",
  "Une toux de plus de 3 semaines doit faire consulter et rechercher une cause.",
  "Au Maroc, penser à la tuberculose : toux prolongée, sueurs nocturnes, amaigrissement.",
  "Difficulté à respirer, douleur thoracique ou crachats de sang = appeler les secours.",
  "Ne pas bloquer une toux grasse : elle aide à évacuer les sécrétions.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. DOULEUR À LA POITRINE
// ─────────────────────────────────────────────────────────────────────────────
const cPoitrine = `<p>Une douleur dans la poitrine est un symptôme qui inquiète, à juste titre : elle peut être totalement bénigne, mais aussi révéler une urgence vitale comme l'infarctus. Face à ce symptôme, le premier réflexe est de reconnaître les signes de gravité — car en cas de doute, chaque minute compte.</p>

<blockquote>Attention : appelez immédiatement les secours (SAMU 141) devant une douleur de la poitrine intense, en étau ou en oppression, qui dure, surtout si elle irradie vers le bras gauche, la mâchoire ou le dos, et s'accompagne d'essoufflement, de sueurs, de nausées ou d'un malaise. Ne conduisez pas vous-même : ce peut être un infarctus.</blockquote>

<h2>Les causes fréquentes (souvent bénignes)</h2>
<ul>
<li>Douleur musculaire ou de la paroi thoracique (après un effort, une toux)</li>
<li>Anxiété, crise d'angoisse</li>
<li><a href="/blog/reflux-gastro-oesophagien-maroc">Reflux</a> et brûlures d'estomac (douleur qui remonte, liée aux repas)</li>
<li>Douleur costale (costochondrite)</li>
</ul>

<h2>Les causes graves à ne pas manquer</h2>
<ul>
<li><strong>Infarctus du myocarde ou angine de poitrine</strong> (origine cardiaque)</li>
<li><strong>Embolie pulmonaire</strong> (douleur avec essoufflement brutal)</li>
<li><strong>Péricardite</strong>, <strong>dissection de l'aorte</strong>, <strong>pneumothorax</strong></li>
</ul>

<h2>Que faire ?</h2>
<ul>
<li>Devant les signes d'alerte ci-dessus : <strong>appeler les secours immédiatement</strong>, s'asseoir ou s'allonger, ne pas faire d'effort.</li>
<li>Pour une douleur légère, clairement liée à un mouvement ou aux repas et sans signe de gravité : se reposer et consulter pour en avoir le cœur net.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez rapidement pour toute douleur thoracique qui revient, notamment déclenchée par l'effort et calmée par le repos (évocatrice d'angine de poitrine), ou persistante et inexpliquée, même modérée.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) devant une douleur thoracique :</p>
<ul>
<li>Intense, en étau ou en oppression, qui dure plus de quelques minutes</li>
<li>Irradiant vers le bras, la mâchoire ou le dos</li>
<li>Avec essoufflement, sueurs, nausées, malaise ou palpitations</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>En urgence : <strong>électrocardiogramme (ECG)</strong> et prise de sang (dont la troponine, marqueur cardiaque), radiographie du thorax. D'autres examens (échographie cardiaque, scanner) sont réalisés selon l'orientation.</p>

<h2>Quels traitements possibles ?</h2>
<p>Ils dépendent de la cause : une urgence cardiaque relève d'une prise en charge hospitalière immédiate ; un reflux ou une douleur musculaire se traitent simplement. <strong>Face à une douleur de la poitrine, ne prenez jamais le risque de « laisser passer » un signe d'alerte</strong> : seul un médecin peut faire le tri.</p>

<hr>
<p>Une douleur thoracique à l'effort ou récidivante ? Consultez un cardiologue près de chez vous sur SantéauMaroc. Devant un signe d'alerte, appelez immédiatement les secours (SAMU 141).</p>`;

const poitrineFaq = [
  { q: "Comment savoir si une douleur à la poitrine est un infarctus ?", a: "Une douleur intense, en étau ou en oppression, qui dure, irradie vers le bras gauche, la mâchoire ou le dos, avec essoufflement, sueurs, nausées ou malaise, doit faire penser à un infarctus. Il faut appeler immédiatement les secours (SAMU 141), sans conduire soi-même." },
  { q: "Une douleur à la poitrine est-elle toujours cardiaque ?", a: "Non. Beaucoup de douleurs thoraciques sont bénignes : douleur musculaire, anxiété, reflux, douleur costale. Mais comme certaines causes sont graves, toute douleur inquiétante ou avec signes d'alerte doit être évaluée médicalement." },
  { q: "Le stress peut-il donner des douleurs à la poitrine ?", a: "Oui, l'anxiété et les crises d'angoisse provoquent fréquemment des douleurs ou une oppression thoracique. C'est toutefois un diagnostic à retenir seulement après avoir écarté une cause cardiaque ou grave, ce que seul un médecin peut faire." },
  { q: "Comment distinguer un reflux d'un problème de cœur ?", a: "Le reflux donne une brûlure qui remonte derrière le sternum, liée aux repas ou à la position allongée. Une douleur cardiaque est plutôt une oppression déclenchée par l'effort. Cette distinction n'est pas fiable à 100 % : en cas de doute, consultez ou appelez les secours." },
  { q: "Que faire en attendant les secours pour une douleur thoracique ?", a: "S'asseoir ou s'allonger, cesser tout effort, desserrer les vêtements et rester calme en attendant les secours. Ne pas conduire soi-même. Signaler l'heure de début de la douleur, utile pour la prise en charge." },
  { q: "Une douleur qui apparaît à l'effort est-elle inquiétante ?", a: "Oui. Une douleur ou une oppression thoracique déclenchée par l'effort et calmée par le repos évoque une angine de poitrine (artères du cœur rétrécies) et impose de consulter rapidement un médecin, même si elle disparaît." },
];
const poitrineTakeaways = [
  "Une douleur thoracique peut être bénigne ou révéler une urgence vitale (infarctus).",
  "Douleur en étau irradiant au bras/mâchoire, avec sueurs ou essoufflement = appeler le SAMU (141).",
  "Une douleur déclenchée par l'effort et calmée par le repos évoque une angine : consulter vite.",
  "Reflux, douleur musculaire et anxiété sont des causes fréquentes et bénignes.",
  "En cas de doute, ne jamais « laisser passer » : seul un médecin peut faire le tri.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAL DE DOS
// ─────────────────────────────────────────────────────────────────────────────
const cDos = `<p>Le mal de dos, en particulier au bas du dos (lombalgie), est si répandu qu'on l'appelle « le mal du siècle ». Rassurant : dans la grande majorité des cas, il est bénin et guérit en quelques semaines. Le meilleur réflexe est souvent de rester actif — l'alitement prolongé aggrave le problème.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li>Lombalgie « commune » : faux mouvement, effort de soulèvement, contracture musculaire</li>
<li>Mauvaises postures, position assise prolongée, sédentarité</li>
<li><a href="/blog/arthrose-maroc">Arthrose</a> du dos</li>
<li>Hernie discale (douleur irradiant dans la jambe : sciatique)</li>
<li>Stress et tensions musculaires</li>
</ul>

<h2>Les causes plus graves à ne pas manquer</h2>
<ul>
<li><strong>Fracture</strong> (après un traumatisme, ou spontanée en cas d'<a href="/blog/osteoporose-maroc">ostéoporose</a>)</li>
<li><strong>Infection</strong> ou <strong>tumeur</strong> (douleur permanente, la nuit, avec altération de l'état général)</li>
<li><strong>Syndrome de la queue de cheval</strong> : urgence (voir ci-dessous)</li>
<li>Douleur inflammatoire (réveillant la nuit, raideur matinale prolongée)</li>
</ul>

<h2>Que faire à la maison ?</h2>
<ul>
<li><strong>Rester actif</strong> et poursuivre ses activités autant que possible : c'est prouvé, cela accélère la guérison.</li>
<li>Appliquer de la chaleur sur la zone douloureuse.</li>
<li>Prendre un antalgique simple si besoin.</li>
<li>Éviter l'alitement prolongé, qui affaiblit les muscles.</li>
</ul>

<h2>Quand consulter un médecin ?</h2>
<p>Consultez si la douleur persiste au-delà de quelques semaines, revient souvent, irradie dans la jambe, ou vous empêche de dormir ou de bouger normalement.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Consultez en urgence en cas de mal de dos avec :</p>
<ul>
<li><strong>Perte de force</strong> dans une ou les deux jambes</li>
<li><strong>Troubles pour uriner ou aller à la selle</strong> et <strong>insensibilité autour du périnée</strong> (syndrome de la queue de cheval — urgence)</li>
<li><strong>Fièvre</strong>, amaigrissement, altération de l'état général</li>
<li>Douleur après un <strong>traumatisme</strong> important</li>
</ul>

<h2>Quels examens possibles ?</h2>
<p>Dans une lombalgie commune récente, <strong>aucun examen n'est nécessaire</strong>. L'imagerie (radiographie, scanner, IRM) n'est utile qu'en présence de signes d'alerte ou si la douleur persiste anormalement.</p>

<h2>Quels traitements possibles ?</h2>
<p>Le mouvement, la kinésithérapie et les antalgiques sont la base. La chirurgie est rare, réservée à des situations précises (hernie compliquée, urgence). <strong>Seul un médecin peut poser un diagnostic</strong> et éliminer une cause grave.</p>

<hr>
<p>Un mal de dos qui persiste ou qui inquiète ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne. Devant un signe d'alerte, consultez en urgence.</p>`;

const dosFaq = [
  { q: "Faut-il se reposer ou bouger quand on a mal au dos ?", a: "Il faut rester actif. Pour une lombalgie commune, poursuivre ses activités autant que possible accélère la guérison, alors que l'alitement prolongé affaiblit les muscles et retarde la récupération. La chaleur et un antalgique simple peuvent aider." },
  { q: "Quand un mal de dos est-il grave ?", a: "En cas de perte de force dans les jambes, de troubles pour uriner ou aller à la selle avec insensibilité du périnée (syndrome de la queue de cheval), de fièvre, d'amaigrissement, ou après un traumatisme important. Ces situations imposent une prise en charge urgente." },
  { q: "Qu'est-ce qu'une sciatique ?", a: "C'est une douleur qui part du bas du dos et descend dans la jambe, le long du trajet du nerf sciatique, souvent due à une hernie discale. Elle est fréquente et guérit le plus souvent en quelques semaines, mais une perte de force impose de consulter vite." },
  { q: "Faut-il faire une radio ou une IRM pour un mal de dos ?", a: "Pas pour une lombalgie commune récente : l'imagerie n'apporte rien et n'est pas recommandée. Elle est réservée aux situations avec signes d'alerte ou lorsque la douleur persiste anormalement. Le médecin décide au cas par cas." },
  { q: "Pourquoi ai-je souvent mal au bas du dos ?", a: "Les récidives de lombalgie sont fréquentes et souvent favorisées par la sédentarité, les mauvaises postures, le manque d'activité physique, le surpoids et le stress. Renforcer les muscles et bouger régulièrement aide à les prévenir." },
  { q: "Le mal de dos peut-il venir des reins ?", a: "Parfois : une douleur d'un côté du dos avec fièvre ou brûlures urinaires peut évoquer une infection urinaire ou un calcul rénal. Mais la grande majorité des maux de dos sont d'origine musculaire ou articulaire. En cas de doute, consultez." },
];
const dosTakeaways = [
  "Le mal de dos est très fréquent et, dans la grande majorité des cas, bénin.",
  "Rester actif accélère la guérison : éviter l'alitement prolongé.",
  "Perte de force, troubles urinaires + insensibilité du périnée = urgence (queue de cheval).",
  "Aucune imagerie n'est utile pour une lombalgie commune récente.",
  "Fièvre, amaigrissement ou douleur après traumatisme doivent faire consulter.",
];

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES FICHES
// ─────────────────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: "mal-au-ventre-maroc",
    aboutEntity: "Douleur abdominale",
    title: "Mal de ventre : causes, que faire et quand consulter",
    excerpt: "Mal de ventre : causes fréquentes et graves, ce qu'on peut faire à la maison, quand consulter et quand appeler les urgences. Un guide clair, adapté au Maroc — sans remplacer l'avis d'un médecin.",
    content: cVentre,
    metaTitle: "Mal de ventre : causes, que faire et quand consulter | Maroc",
    metaDesc: "Mal de ventre : causes fréquentes et graves (appendicite, occlusion…), que faire à la maison, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: ventreTakeaways,
    faq: ventreFaq,
  },
  {
    slug: "mal-de-tete-maroc",
    aboutEntity: "Céphalée",
    title: "Mal de tête : causes, que faire et quand s'inquiéter",
    excerpt: "Mal de tête : causes fréquentes (tension, migraine) et graves à ne pas manquer, que faire à la maison, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    content: cTete,
    metaTitle: "Mal de tête : causes et quand s'inquiéter | Maroc",
    metaDesc: "Mal de tête : causes fréquentes et graves, que faire à la maison, quand consulter et quand appeler les urgences (céphalée brutale, fièvre + raideur de nuque). Adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: teteTakeaways,
    faq: teteFaq,
  },
  {
    slug: "fievre-adulte-maroc",
    aboutEntity: "Fièvre",
    title: "Fièvre chez l'adulte : que faire et quand consulter",
    excerpt: "Fièvre chez l'adulte : causes fréquentes et graves, que faire à la maison, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc, sans remplacer l'avis d'un médecin.",
    content: cFievre,
    metaTitle: "Fièvre chez l'adulte : que faire et quand consulter | Maroc",
    metaDesc: "Fièvre chez l'adulte : causes, que faire à la maison, quand consulter et quand appeler les urgences (raideur de nuque, confusion, retour de voyage). Guide adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: fievreTakeaways,
    faq: fievreFaq,
  },
  {
    slug: "toux-maroc",
    aboutEntity: "Toux",
    title: "Toux : causes, que faire et quand consulter",
    excerpt: "Toux aiguë ou chronique : causes fréquentes et graves (dont la tuberculose), que faire à la maison, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    content: cToux,
    metaTitle: "Toux : causes, que faire et quand consulter | Maroc",
    metaDesc: "Toux : causes fréquentes et graves (pneumonie, tuberculose, BPCO), que faire à la maison, quand consulter et quand appeler les urgences. Guide clair adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: touxTakeaways,
    faq: touxFaq,
  },
  {
    slug: "douleur-poitrine-maroc",
    aboutEntity: "Douleur thoracique",
    title: "Douleur à la poitrine : reconnaître l'urgence et quand consulter",
    excerpt: "Douleur à la poitrine : quand c'est une urgence (infarctus), causes fréquentes et graves, que faire et quand appeler les secours. Guide clair adapté au Maroc — chaque minute compte.",
    content: cPoitrine,
    metaTitle: "Douleur à la poitrine : urgence ou pas ? | Maroc",
    metaDesc: "Douleur à la poitrine : reconnaître les signes d'infarctus, causes fréquentes et graves, que faire et quand appeler les secours (SAMU 141). Guide clair adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: poitrineTakeaways,
    faq: poitrineFaq,
  },
  {
    slug: "mal-de-dos-maroc",
    aboutEntity: "Lombalgie",
    title: "Mal de dos : causes, que faire et quand consulter",
    excerpt: "Mal de dos (lombalgie) : causes fréquentes et graves, pourquoi rester actif, que faire à la maison, quand consulter et quand c'est une urgence. Guide clair adapté au Maroc.",
    content: cDos,
    metaTitle: "Mal de dos : causes, que faire et quand consulter | Maroc",
    metaDesc: "Mal de dos (lombalgie) : causes fréquentes et graves, pourquoi rester actif, que faire à la maison, quand consulter et signes d'urgence. Guide clair adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: dosTakeaways,
    faq: dosFaq,
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  // 1. Créer / mettre à jour la catégorie Symptômes.
  const cat = await prisma.postCategory.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name, description: CATEGORY.description, color: CATEGORY.color },
    create: CATEGORY,
    select: { id: true, slug: true },
  });
  console.log(`✓ Catégorie  /blog/categorie/${cat.slug}  (${CATEGORY.name})`);

  const now = new Date();

  // 2. Seeder les fiches symptômes.
  for (const art of ARTICLES) {
    const data = {
      title:        art.title,
      excerpt:      art.excerpt,
      content:      art.content,
      categoryId:   cat.id,
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
    console.log(`✓ Symptôme  /blog/${post.slug}`);
  }

  console.log(`\nCatégorie Symptômes : ${ARTICLES.length} fiches publiées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
