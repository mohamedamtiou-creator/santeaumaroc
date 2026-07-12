require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie SANTÉ DES SENIORS — nouvelle rubrique du blog (brief cat. 8, absente).
// Guides pratiques « bien vieillir » : chutes, mémoire, activité physique,
// nutrition, autonomie, sommeil. Gabarit guide (sections pratiques + quand
// consulter + FAQ + À retenir). Renvoie vers les fiches Maladie liées (arthrose,
// ostéoporose, dépression...). Repli spécialiste : médecine générale.
// Crée la catégorie puis seede. Intro/FAQ : blog-category-content.ts. Idempotent.
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Santé des seniors",
  slug: "sante-senior",
  description:
    "Bien vieillir au Maroc : prévenir les chutes, entretenir sa mémoire, rester actif, bien se nourrir, préserver son autonomie et son sommeil. Des guides pratiques et bienveillants, validés par des professionnels, qui ne remplacent pas l'avis de votre médecin.",
  color: "amber",
};

const cChutes = `<p>Les chutes sont l'un des principaux risques pour la santé après 65 ans. Fréquentes, elles peuvent avoir de lourdes conséquences — fracture, perte de confiance, perte d'autonomie. La bonne nouvelle : une grande partie d'entre elles peut être évitée par des mesures simples.</p>

<h2>Pourquoi les chutes sont un enjeu</h2>
<p>Avec l'âge, l'équilibre, la force musculaire et la vue diminuent, tandis que les os deviennent plus fragiles (<a href="/blog/osteoporose-maroc">ostéoporose</a>). Une chute peut alors entraîner une fracture, en particulier du <strong>col du fémur</strong>, source de perte d'autonomie.</p>

<h2>Les facteurs de risque</h2>
<ul>
<li>Troubles de l'équilibre et de la marche, faiblesse musculaire</li>
<li>Baisse de la vue, certains médicaments (somnifères, plusieurs traitements associés)</li>
<li>Hypotension en se levant, malaises</li>
<li>Domicile mal adapté (tapis, mauvais éclairage)</li>
</ul>

<h2>Aménager son domicile</h2>
<ul>
<li>Retirer ou fixer les tapis, dégager les passages, ranger les fils électriques.</li>
<li>Bien éclairer, surtout la nuit (veilleuse vers les toilettes).</li>
<li>Installer des barres d'appui (salle de bain, toilettes) et un tapis antidérapant.</li>
<li>Porter des chaussures fermées et antidérapantes.</li>
</ul>

<h2>Entretenir équilibre et force</h2>
<p>Une <a href="/blog/activite-physique-senior-maroc">activité physique régulière</a> (marche, exercices d'équilibre et de renforcement) est la mesure la plus efficace. Faire vérifier sa vue, réviser ses médicaments avec le médecin et assurer un bon apport en vitamine D complètent la prévention.</p>

<h2>Que faire après une chute ?</h2>
<p>Même sans blessure apparente, il faut en parler au médecin : une chute est un signal d'alerte qui doit faire rechercher une cause et renforcer la prévention. Des chutes répétées imposent un bilan.</p>

<hr>
<p>Prévenir les chutes, c'est préserver son autonomie. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;
const chutesFaq = [
  { q: "Comment prévenir les chutes chez une personne âgée ?", a: "En entretenant l'équilibre et la force par une activité physique régulière, en aménageant le domicile (tapis fixés, bon éclairage, barres d'appui), en faisant vérifier la vue, en révisant les médicaments avec le médecin et en assurant un bon apport en vitamine D." },
  { q: "Pourquoi les chutes sont-elles dangereuses après 65 ans ?", a: "Parce que les os sont plus fragiles (ostéoporose) : une chute peut entraîner une fracture, notamment du col du fémur, source de perte d'autonomie. La peur de retomber peut aussi réduire l'activité et aggraver la fragilité." },
  { q: "Quels aménagements du domicile réduisent le risque de chute ?", a: "Retirer ou fixer les tapis, dégager les passages, bien éclairer (surtout la nuit), installer des barres d'appui dans la salle de bain et les toilettes, un tapis antidérapant, et porter des chaussures fermées et antidérapantes." },
  { q: "Certains médicaments favorisent-ils les chutes ?", a: "Oui, notamment les somnifères, les calmants et l'association de plusieurs traitements, qui peuvent provoquer somnolence, vertiges ou baisse de tension. Une révision régulière des médicaments avec le médecin réduit ce risque." },
  { q: "Que faire après une chute sans blessure apparente ?", a: "En parler au médecin même en l'absence de blessure : une chute est un signal d'alerte qui doit faire rechercher une cause (équilibre, vue, tension, médicaments) et renforcer la prévention. Des chutes répétées imposent un bilan." },
];
const chutesTk = [
  "Les chutes sont un risque majeur après 65 ans, avec un danger de fracture du col du fémur.",
  "Une grande partie est évitable : équilibre, force, domicile adapté.",
  "Vérifier la vue, réviser les médicaments et assurer la vitamine D.",
  "Toute chute, même sans blessure, doit être signalée au médecin.",
];

const cMemoire = `<p>Avec l'âge, il est normal d'avoir parfois des oublis. Mais certains troubles de la mémoire doivent alerter. Distinguer le vieillissement normal d'un trouble à explorer permet de consulter au bon moment — et parfois d'agir tôt.</p>

<h2>Oublis normaux ou signes d'alerte ?</h2>
<p>Oublier un nom ou ses clés, puis s'en souvenir, fait partie du vieillissement normal. Doivent en revanche alerter : oublier des événements récents importants, se perdre dans un lieu connu, répéter les mêmes questions, avoir du mal à suivre une conversation ou à gérer ses affaires courantes.</p>

<h2>Les causes possibles</h2>
<p>Un trouble de la mémoire n'est pas toujours une démence. Il peut être lié à une <a href="/blog/depression-maroc">dépression</a>, à des troubles du <a href="/blog/sommeil-personne-agee-maroc">sommeil</a>, à des médicaments, à une <a href="/blog/hypothyroidie-maroc">hypothyroïdie</a> ou à une carence — des causes souvent réversibles. La maladie d'Alzheimer et les autres démences sont d'autres possibilités, à évaluer par le médecin.</p>

<h2>Protéger sa mémoire</h2>
<ul>
<li>Stimuler son cerveau (lecture, jeux, apprentissages).</li>
<li>Garder une vie sociale active et lutter contre l'isolement.</li>
<li>Bouger régulièrement, bien dormir, bien manger.</li>
<li>Contrôler tension, diabète et cholestérol, qui protègent aussi le cerveau.</li>
</ul>

<h2>Quand consulter ?</h2>
<p>Devant des troubles qui s'installent, s'aggravent ou inquiètent la personne ou son entourage, une consultation permet un bilan de mémoire. Consulter tôt aide à identifier une cause réversible et, si besoin, à mettre en place un accompagnement adapté.</p>

<hr>
<p>Des troubles de la mémoire qui inquiètent ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;
const memoireFaq = [
  { q: "Quels troubles de la mémoire doivent inquiéter ?", a: "Oublier des événements récents importants, se perdre dans un lieu connu, répéter les mêmes questions, avoir du mal à suivre une conversation ou à gérer ses affaires courantes. Contrairement aux oublis bénins, ces signes justifient une consultation." },
  { q: "Perdre la mémoire est-il normal en vieillissant ?", a: "De petits oublis (un nom, ses clés) dont on se souvient ensuite font partie du vieillissement normal. Ce qui n'est pas normal, c'est un trouble qui s'installe, s'aggrave et retentit sur la vie quotidienne : cela doit faire consulter." },
  { q: "Un trouble de la mémoire est-il forcément la maladie d'Alzheimer ?", a: "Non. Il peut être lié à une dépression, à des troubles du sommeil, à des médicaments, à une hypothyroïdie ou à une carence — souvent réversibles. La maladie d'Alzheimer est une possibilité parmi d'autres, à évaluer par le médecin." },
  { q: "Comment entretenir sa mémoire ?", a: "En stimulant son cerveau (lecture, jeux, apprentissages), en gardant une vie sociale active, en bougeant régulièrement, en dormant bien et en contrôlant la tension, le diabète et le cholestérol, qui protègent aussi le cerveau." },
  { q: "Quand faire un bilan de mémoire ?", a: "Lorsque les troubles s'installent, s'aggravent ou inquiètent la personne ou son entourage. Consulter tôt permet d'identifier une cause réversible et, si nécessaire, de mettre en place un accompagnement adapté le plus vite possible." },
];
const memoireTk = [
  "De petits oublis sont normaux ; des troubles qui s'installent doivent alerter.",
  "Un trouble de la mémoire n'est pas toujours une démence (dépression, sommeil, thyroïde…).",
  "Stimulation intellectuelle, vie sociale, activité et contrôle cardiovasculaire protègent.",
  "Consulter tôt permet de repérer une cause réversible et d'accompagner.",
];

const cActivite = `<p>Après 60 ans, l'activité physique est l'un des meilleurs remèdes : elle entretient les muscles, les os, l'équilibre, le moral et aide à gérer les maladies chroniques. Il n'est jamais trop tard pour s'y mettre, à condition d'y aller progressivement.</p>

<h2>Pourquoi bouger après 60 ans ?</h2>
<ul>
<li>Entretenir la <strong>force musculaire</strong> et l'<strong>équilibre</strong> (prévention des <a href="/blog/prevention-chutes-personnes-agees-maroc">chutes</a>).</li>
<li>Renforcer les <strong>os</strong> et soulager l'<a href="/blog/arthrose-maroc">arthrose</a>.</li>
<li>Améliorer le cœur, la tension, la glycémie et le moral.</li>
<li>Préserver l'<a href="/blog/autonomie-dependance-senior-maroc">autonomie</a> et le sommeil.</li>
</ul>

<h2>Quelles activités ?</h2>
<p>Les plus adaptées combinent :</p>
<ul>
<li><strong>Endurance douce</strong> : marche, natation, vélo.</li>
<li><strong>Renforcement musculaire</strong> léger (2 fois par semaine).</li>
<li><strong>Équilibre et souplesse</strong> : exercices simples, étirements.</li>
</ul>

<h2>Comment commencer ?</h2>
<p>Progressivement : commencer par de courtes séances et augmenter petit à petit. La marche quotidienne est un excellent point de départ. L'important est la <strong>régularité</strong>, pas l'intensité.</p>

<h2>Quelles précautions ?</h2>
<p>En cas de maladie du cœur, de diabète, d'arthrose sévère ou après une longue période d'inactivité, demandez l'avis de votre médecin avant de commencer. Choisissez des activités sans chocs, hydratez-vous et arrêtez en cas de douleur dans la poitrine, d'essoufflement anormal ou de malaise.</p>

<hr>
<p>Envie de reprendre une activité en toute sécurité ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;
const activiteFaq = [
  { q: "Quelle activité physique après 60 ans ?", a: "Un mélange d'endurance douce (marche, natation, vélo), de renforcement musculaire léger deux fois par semaine, et d'exercices d'équilibre et de souplesse. La marche quotidienne est un excellent point de départ, sans chocs et facile à tenir." },
  { q: "Est-il trop tard pour se remettre au sport à 70 ans ?", a: "Non, il n'est jamais trop tard. Reprendre une activité, même modeste, améliore la force, l'équilibre, le moral et la gestion des maladies chroniques à tout âge. L'important est de commencer progressivement et d'être régulier." },
  { q: "Combien d'activité physique pour un senior ?", a: "L'objectif souvent cité est d'environ 30 minutes d'activité modérée par jour, à adapter à chacun. Mieux vaut peu mais régulièrement que beaucoup d'un coup. On augmente la durée et l'intensité progressivement." },
  { q: "Faut-il un avis médical avant de reprendre le sport ?", a: "C'est recommandé en cas de maladie du cœur, de diabète, d'arthrose sévère ou après une longue inactivité. Le médecin vérifie l'absence de contre-indication et oriente vers des activités adaptées et sans danger." },
  { q: "L'activité physique aide-t-elle contre l'arthrose ?", a: "Oui, contrairement à une idée reçue. Une activité adaptée et sans chocs (marche, natation) entretient les articulations, renforce les muscles qui les soutiennent et réduit la douleur. Le repos complet, lui, aggrave l'arthrose." },
];
const activiteTk = [
  "Après 60 ans, bouger entretient muscles, os, équilibre, moral et maladies chroniques.",
  "Combiner endurance douce, renforcement léger et exercices d'équilibre.",
  "Commencer progressivement : la régularité prime sur l'intensité.",
  "Avis médical conseillé en cas de maladie chronique ou de longue inactivité.",
];

const cNutrition = `<p>Bien manger reste essentiel en vieillissant — et les besoins changent. Chez la personne âgée, le principal risque n'est pas l'excès mais la <strong>dénutrition</strong>, souvent silencieuse, qui fragilise et favorise chutes et infections.</p>

<h2>Des besoins spécifiques</h2>
<ul>
<li><strong>Protéines</strong> (viande, poisson, œufs, légumineuses, produits laitiers) pour préserver les muscles.</li>
<li><strong>Calcium et vitamine D</strong> pour les os (voir <a href="/blog/osteoporose-maroc">ostéoporose</a>).</li>
<li><strong>Fibres</strong> et hydratation contre la constipation.</li>
</ul>

<h2>Attention à la dénutrition</h2>
<p>Perte d'appétit, repas sautés, isolement, problèmes dentaires ou de déglutition peuvent réduire les apports. Une <strong>perte de poids involontaire</strong> est un signal d'alerte à ne pas négliger.</p>

<h2>Adapter les repas</h2>
<ul>
<li>Fractionner en plusieurs petits repas et collations.</li>
<li>Enrichir les plats (œuf, fromage, lait, huile d'olive) sans augmenter le volume.</li>
<li>Adapter les textures en cas de problèmes dentaires ou de déglutition.</li>
<li>Partager les repas quand c'est possible : la convivialité stimule l'appétit.</li>
</ul>

<h2>Ne pas oublier de boire</h2>
<p>La sensation de soif diminue avec l'âge : il faut boire régulièrement, même sans soif, surtout par forte chaleur, pour éviter la déshydratation.</p>

<h2>Quand s'inquiéter ?</h2>
<p>Consultez en cas de perte de poids, de perte d'appétit durable ou de fatigue inhabituelle : un bilan (dont une recherche d'<a href="/blog/anemie-maroc">anémie</a>) peut être utile.</p>

<hr>
<p>Un proche âgé qui mange peu ou maigrit ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;
const nutritionFaq = [
  { q: "Quel est le principal risque nutritionnel chez la personne âgée ?", a: "C'est la dénutrition, souvent silencieuse, plutôt que l'excès. Elle fragilise, favorise les chutes et les infections et ralentit la récupération. Une perte de poids involontaire est un signal d'alerte à ne pas négliger." },
  { q: "Quels aliments privilégier pour un senior ?", a: "Des protéines à chaque repas (viande, poisson, œufs, légumineuses, produits laitiers) pour les muscles, du calcium et de la vitamine D pour les os, des fibres et une bonne hydratation. Varier et fractionner les repas aide en cas de petit appétit." },
  { q: "Comment stimuler l'appétit d'une personne âgée ?", a: "En fractionnant en petits repas et collations, en enrichissant les plats (œuf, fromage, lait, huile d'olive) sans en augmenter le volume, en adaptant les textures si besoin et en partageant les repas : la convivialité stimule l'appétit." },
  { q: "Pourquoi les personnes âgées doivent-elles boire davantage ?", a: "Parce que la sensation de soif diminue avec l'âge, exposant à la déshydratation, surtout par forte chaleur. Il faut donc boire régulièrement tout au long de la journée, même sans ressentir la soif." },
  { q: "Quand s'inquiéter de l'alimentation d'un proche âgé ?", a: "En cas de perte de poids involontaire, de perte d'appétit qui dure, de fatigue inhabituelle ou de difficultés à mâcher ou à avaler. Une consultation, avec un bilan à la recherche notamment d'une anémie, est alors utile." },
];
const nutritionTk = [
  "Chez le senior, le risque principal est la dénutrition, souvent silencieuse.",
  "Privilégier protéines (muscles), calcium/vitamine D (os), fibres et hydratation.",
  "Fractionner et enrichir les repas ; adapter les textures si besoin.",
  "Une perte de poids involontaire doit faire consulter.",
];

const cAutonomie = `<p>Préserver son autonomie le plus longtemps possible est au cœur du bien-vieillir. Cela se prépare : en restant actif, en adaptant son cadre de vie et en s'appuyant sur son entourage et les aides disponibles.</p>

<h2>Préserver son autonomie</h2>
<ul>
<li>Rester <a href="/blog/activite-physique-senior-maroc">physiquement actif</a> et stimuler sa <a href="/blog/memoire-troubles-cognitifs-senior-maroc">mémoire</a>.</li>
<li>Entretenir le lien social, lutter contre l'isolement.</li>
<li>Adapter le domicile pour prévenir les <a href="/blog/prevention-chutes-personnes-agees-maroc">chutes</a>.</li>
<li>Bien se nourrir et suivre ses maladies chroniques.</li>
</ul>

<h2>Repérer la perte d'autonomie</h2>
<p>Des difficultés nouvelles pour les gestes du quotidien (se laver, s'habiller, cuisiner, gérer ses médicaments ou ses papiers), des chutes, un repli sur soi ou une perte de poids doivent alerter l'entourage.</p>

<h2>Les aides possibles</h2>
<ul>
<li>Aides à domicile pour les tâches quotidiennes.</li>
<li>Aménagement du logement et aides techniques (barres, siège de douche).</li>
<li>Coordination avec le médecin et les professionnels de santé.</li>
</ul>

<h2>Le rôle des proches (aidants)</h2>
<p>Accompagner un proche est précieux mais peut être épuisant. Les <strong>aidants</strong> doivent aussi prendre soin d'eux, s'informer et se faire aider, pour tenir dans la durée sans s'épuiser.</p>

<h2>Quand demander de l'aide ?</h2>
<p>Dès les premières difficultés, sans attendre une crise. En parler tôt au médecin permet d'organiser un accompagnement adapté et de préserver la qualité de vie de la personne et de son entourage.</p>

<hr>
<p>Un proche qui perd en autonomie ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;
const autonomieFaq = [
  { q: "Comment préserver l'autonomie en vieillissant ?", a: "En restant physiquement actif, en stimulant sa mémoire, en entretenant le lien social, en adaptant son domicile pour éviter les chutes, en se nourrissant bien et en suivant ses maladies chroniques. La prévention se prépare tôt." },
  { q: "Comment repérer une perte d'autonomie chez un proche ?", a: "Par des difficultés nouvelles pour les gestes quotidiens (se laver, s'habiller, cuisiner, gérer médicaments et papiers), des chutes, un repli sur soi ou une perte de poids. Ces signes doivent alerter et amener à en parler au médecin." },
  { q: "Quelles aides existent pour une personne âgée dépendante ?", a: "Des aides à domicile pour les tâches quotidiennes, l'aménagement du logement et des aides techniques (barres d'appui, siège de douche), et la coordination avec le médecin et les professionnels de santé. Le médecin oriente vers les solutions adaptées." },
  { q: "Comment aider un proche âgé sans s'épuiser ?", a: "En s'informant, en acceptant de se faire aider, en partageant la charge et en prenant soin de soi. L'épuisement des aidants est fréquent : demander du soutien tôt permet d'accompagner dans la durée sans se mettre en difficulté." },
  { q: "Quand demander de l'aide pour un proche âgé ?", a: "Dès les premières difficultés, sans attendre une crise ou une chute grave. En parler tôt au médecin permet d'organiser un accompagnement adapté et de préserver la qualité de vie de la personne comme de son entourage." },
];
const autonomieTk = [
  "Préserver l'autonomie se prépare : activité, mémoire, lien social, domicile adapté.",
  "Repérer tôt les difficultés du quotidien et les signaler au médecin.",
  "Des aides existent : à domicile, techniques, coordination médicale.",
  "Les aidants doivent aussi se faire aider pour tenir dans la durée.",
];

const cSommeil = `<p>Le sommeil change avec l'âge, ce qui inquiète souvent à tort. Distinguer une évolution normale d'un vrai trouble du sommeil aide à mieux dormir — et à ne pas recourir trop vite aux somnifères, dont les risques sont réels chez le senior.</p>

<h2>Le sommeil évolue avec l'âge</h2>
<p>Avec les années, le sommeil devient plus <strong>léger et fragmenté</strong>, on s'endort et se réveille plus tôt, et les siestes sont plus fréquentes. C'est en partie normal : le besoin de sommeil ne disparaît pas, mais sa structure change.</p>

<h2>Les bonnes habitudes</h2>
<ul>
<li>Se lever et se coucher à des horaires réguliers.</li>
<li>S'exposer à la lumière du jour et rester actif.</li>
<li>Limiter les siestes longues (préférer une sieste courte en début d'après-midi).</li>
<li>Éviter café, thé et écrans le soir ; dîner léger.</li>
</ul>

<h2>Les troubles à ne pas négliger</h2>
<p>Une insomnie qui dure, des ronflements avec pauses respiratoires (apnées du sommeil), un syndrome des jambes sans repos, ou des réveils liés à une <a href="/blog/depression-maroc">dépression</a> ou à des douleurs méritent d'être explorés. Ils ne sont pas une fatalité de l'âge.</p>

<h2>Prudence avec les somnifères</h2>
<p>Les somnifères exposent, chez la personne âgée, à des <strong>chutes</strong>, à une somnolence et à des troubles de la mémoire. Ils ne doivent être utilisés que ponctuellement, sur avis médical, et jamais augmentés ou prolongés seul.</p>

<h2>Quand consulter ?</h2>
<p>Si le manque de sommeil retentit sur la journée (fatigue, somnolence, moral), ou en cas de ronflements avec pauses respiratoires, parlez-en à votre médecin plutôt que de recourir seul aux somnifères.</p>

<hr>
<p>Un sommeil qui se dégrade ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;
const sommeilFaq = [
  { q: "Est-il normal de moins bien dormir en vieillissant ?", a: "Le sommeil devient plus léger et fragmenté avec l'âge, avec un endormissement et un réveil plus précoces : c'est en partie normal. Le besoin de sommeil ne disparaît pas pour autant. Un trouble qui retentit sur la journée doit toutefois être exploré." },
  { q: "Comment mieux dormir quand on est âgé ?", a: "Garder des horaires réguliers, s'exposer à la lumière du jour, rester actif, limiter les siestes longues, éviter café, thé et écrans le soir et dîner léger. Ces habitudes améliorent le sommeil sans médicament." },
  { q: "Les somnifères sont-ils dangereux pour les seniors ?", a: "Ils exposent à des chutes, à une somnolence et à des troubles de la mémoire chez la personne âgée. Ils ne doivent être utilisés que ponctuellement, sur avis médical, et jamais augmentés ni prolongés de sa propre initiative." },
  { q: "Quels troubles du sommeil doivent faire consulter ?", a: "Une insomnie qui dure, des ronflements avec pauses respiratoires (apnées du sommeil), un syndrome des jambes sans repos, ou des réveils liés à une dépression ou à des douleurs. Ces troubles ne sont pas une fatalité de l'âge." },
  { q: "La sieste est-elle bonne pour les personnes âgées ?", a: "Une sieste courte en début d'après-midi peut être bénéfique. En revanche, des siestes longues ou tardives fragmentent le sommeil de la nuit. Mieux vaut une courte sieste et une bonne activité en journée." },
];
const sommeilTk = [
  "Le sommeil devient plus léger et fragmenté avec l'âge : en partie normal.",
  "Bonnes habitudes : horaires réguliers, lumière du jour, éviter excitants le soir.",
  "Insomnie durable, apnées ou jambes sans repos ne sont pas une fatalité : consulter.",
  "Prudence avec les somnifères (chutes, mémoire) : jamais seul ni au long cours.",
];

const ARTICLES = [
  { slug: "prevention-chutes-personnes-agees-maroc", aboutEntity: "Chute de la personne âgée",
    title: "Prévenir les chutes chez la personne âgée",
    excerpt: "Prévenir les chutes après 65 ans : facteurs de risque, aménagement du domicile, équilibre et force, et que faire après une chute. Un guide pratique adapté au Maroc.",
    metaTitle: "Prévenir les chutes chez la personne âgée | Maroc",
    metaDesc: "Prévenir les chutes après 65 ans : facteurs de risque, aménagement du domicile, équilibre, vue et médicaments, que faire après une chute. Guide pratique adapté au Maroc.",
    readingTime: 5, content: cChutes, keyTakeaways: chutesTk, faq: chutesFaq },
  { slug: "memoire-troubles-cognitifs-senior-maroc", aboutEntity: "Troubles de la mémoire",
    title: "Mémoire et troubles cognitifs : quand s'inquiéter ?",
    excerpt: "Troubles de la mémoire du senior : oublis normaux ou signes d'alerte, causes possibles (dont réversibles), comment protéger sa mémoire et quand consulter. Adapté au Maroc.",
    metaTitle: "Troubles de la mémoire du senior : quand s'inquiéter ? | Maroc",
    metaDesc: "Mémoire et troubles cognitifs : distinguer oublis normaux et signes d'alerte, causes possibles (dépression, thyroïde, Alzheimer), protéger sa mémoire et quand consulter. Adapté au Maroc.",
    readingTime: 5, content: cMemoire, keyTakeaways: memoireTk, faq: memoireFaq },
  { slug: "activite-physique-senior-maroc", aboutEntity: "Activité physique du senior",
    title: "Activité physique après 60 ans : bouger en sécurité",
    excerpt: "Activité physique après 60 ans : pourquoi c'est essentiel, quelles activités, comment commencer progressivement et quelles précautions. Un guide pratique adapté au Maroc.",
    metaTitle: "Activité physique après 60 ans : bouger en sécurité | Maroc",
    metaDesc: "Activité physique après 60 ans : bienfaits (muscles, équilibre, chroniques), activités adaptées, comment commencer et précautions. Il n'est jamais trop tard — guide adapté au Maroc.",
    readingTime: 5, content: cActivite, keyTakeaways: activiteTk, faq: activiteFaq },
  { slug: "nutrition-personne-agee-maroc", aboutEntity: "Nutrition de la personne âgée",
    title: "Nutrition de la personne âgée : éviter la dénutrition",
    excerpt: "Nutrition du senior : besoins spécifiques (protéines, calcium, hydratation), risque de dénutrition, comment adapter les repas et quand s'inquiéter. Un guide pratique adapté au Maroc.",
    metaTitle: "Nutrition de la personne âgée : éviter la dénutrition | Maroc",
    metaDesc: "Nutrition de la personne âgée : besoins (protéines, calcium, vitamine D, hydratation), risque de dénutrition, adapter les repas et quand s'inquiéter. Guide pratique adapté au Maroc.",
    readingTime: 5, content: cNutrition, keyTakeaways: nutritionTk, faq: nutritionFaq },
  { slug: "autonomie-dependance-senior-maroc", aboutEntity: "Perte d'autonomie",
    title: "Autonomie et dépendance : bien vieillir et se faire aider",
    excerpt: "Préserver l'autonomie en vieillissant : repérer la perte d'autonomie, les aides possibles, le rôle des aidants et quand demander de l'aide. Un guide pratique adapté au Maroc.",
    metaTitle: "Autonomie et dépendance de la personne âgée | Maroc",
    metaDesc: "Autonomie et dépendance : préserver son autonomie, repérer les difficultés, les aides possibles, le rôle des aidants et quand demander de l'aide. Guide pratique adapté au Maroc.",
    readingTime: 5, content: cAutonomie, keyTakeaways: autonomieTk, faq: autonomieFaq },
  { slug: "sommeil-personne-agee-maroc", aboutEntity: "Sommeil de la personne âgée",
    title: "Sommeil de la personne âgée : mieux dormir sans somnifères",
    excerpt: "Sommeil du senior : comment il évolue avec l'âge, les bonnes habitudes, les troubles à explorer et la prudence avec les somnifères. Un guide pratique adapté au Maroc.",
    metaTitle: "Sommeil de la personne âgée : mieux dormir | Maroc",
    metaDesc: "Sommeil de la personne âgée : évolution normale avec l'âge, bonnes habitudes, troubles à explorer (insomnie, apnées) et prudence avec les somnifères (chutes). Adapté au Maroc.",
    readingTime: 5, content: cSommeil, keyTakeaways: sommeilTk, faq: sommeilFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name, description: CATEGORY.description, color: CATEGORY.color },
    create: CATEGORY, select: { id: true, slug: true },
  });
  console.log(`✓ Catégorie  /blog/categorie/${cat.slug}  (${CATEGORY.name})`);
  const now = new Date();
  for (const art of ARTICLES) {
    const data = {
      title: art.title, excerpt: art.excerpt, content: art.content, categoryId: cat.id,
      metaTitle: art.metaTitle, metaDesc: art.metaDesc, readingTime: art.readingTime,
      keyTakeaways: art.keyTakeaways.join("\n"), faqJson: JSON.stringify(art.faq), aboutEntity: art.aboutEntity,
      reviewedById: admin.id, reviewedAt: now,
    };
    const post = await prisma.post.upsert({
      where: { slug: art.slug }, update: data,
      create: { ...data, slug: art.slug, authorId: admin.id, status: "PUBLISHED", publishedAt: now },
      select: { slug: true },
    });
    console.log(`✓ Senior  /blog/${post.slug}`);
  }
  console.log(`\nCatégorie Santé des seniors : ${ARTICLES.length} fiches publiées.`);
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
