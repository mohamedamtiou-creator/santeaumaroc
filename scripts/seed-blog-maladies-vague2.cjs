require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 2 — Fiches « Maladie » de référence (piliers autonomes), même gabarit que
// seed-article-diabete.cjs / seed-article.cjs :
//   • Asthme            → pneumologie   (maladies-traitements)
//   • Cholestérol       → cardiologie   (maladies-traitements)
//   • AVC               → cardiologie   (maladies-traitements)
//   • Anémie            → médecine gén. (maladies-traitements, repli)
//   • Dépression        → psychiatrie   (sante-mentale, repli)
// Chaque fiche : définition, causes, facteurs de risque, symptômes, diagnostic,
// examens, complications, traitement, prévention, quand consulter + FAQ + À retenir.
// SEO/GEO/E-E-A-T : keyTakeaways, faqJson (FAQPage), aboutEntity (MedicalCondition),
// relecture médicale. Idempotent (upsert par slug + update complet).
// Les mappings spécialité (CTA praticiens) sont ajoutés dans lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. ASTHME
// ─────────────────────────────────────────────────────────────────────────────
const cAsthme = `<p>L'asthme est l'une des maladies respiratoires chroniques les plus fréquentes au Maroc, chez l'enfant comme chez l'adulte. Bien contrôlé, il permet de mener une vie tout à fait normale — y compris le sport. Mal pris en charge, il expose à des crises parfois graves. Comprendre sa maladie et bien utiliser ses traitements change tout.</p>

<h2>Qu'est-ce que l'asthme ?</h2>
<p>L'asthme est une <strong>inflammation chronique des bronches</strong>, les tuyaux qui amènent l'air aux poumons. Chez la personne asthmatique, ces bronches sont hyperréactives : au contact de certains facteurs déclenchants, elles se contractent, gonflent et produisent du mucus. Le passage de l'air devient difficile — c'est la crise d'asthme.</p>
<p>Point essentiel : cette obstruction est <strong>réversible</strong>, spontanément ou grâce aux médicaments. C'est ce qui distingue l'asthme d'autres maladies respiratoires.</p>

<h2>Quels sont les facteurs déclenchants et de risque ?</h2>
<p>L'asthme survient sur un terrain souvent allergique (« atopique ») et familial. Les principaux facteurs qui déclenchent ou aggravent les crises :</p>
<ul>
<li><strong>Allergènes</strong> : acariens, pollens, poils d'animaux, moisissures</li>
<li><strong>Tabac</strong> (actif et passif) et <strong>pollution</strong> de l'air</li>
<li><strong>Infections respiratoires</strong> (rhumes, grippe)</li>
<li><strong>Effort physique</strong>, air froid et sec</li>
<li><strong>Émotions fortes</strong>, stress</li>
<li>Certains <strong>médicaments</strong> et irritants (parfums, produits ménagers)</li>
</ul>

<h2>Quels sont les symptômes de l'asthme ?</h2>
<p>Les symptômes varient d'une personne à l'autre et dans le temps. Les plus caractéristiques :</p>
<ul>
<li><strong>Sifflements</strong> respiratoires (respiration « qui siffle »)</li>
<li><strong>Essoufflement</strong>, gêne à respirer</li>
<li><strong>Toux sèche</strong>, surtout la nuit et au petit matin ou à l'effort</li>
<li><strong>Oppression</strong> dans la poitrine</li>
</ul>
<p>Ces signes surviennent souvent par crises, et cèdent au repos ou avec le traitement de secours.</p>

<h2>Comment diagnostique-t-on l'asthme ?</h2>
<p>Le médecin s'appuie sur les symptômes, leur caractère variable et le contexte (allergies, antécédents familiaux). Il confirme par des examens simples :</p>
<ul>
<li><strong>Spirométrie (EFR)</strong> : mesure du souffle, qui objective l'obstruction et sa réversibilité après bronchodilatateur.</li>
<li><strong>Débit de pointe (peak flow)</strong> : petit appareil de suivi à domicile.</li>
<li><strong>Bilan allergologique</strong> si une allergie est suspectée.</li>
</ul>

<h2>Quelles complications si l'asthme est mal contrôlé ?</h2>
<p>Un asthme négligé peut mener à des crises de plus en plus fréquentes, à une gêne au quotidien (sommeil, activité, école, travail) et, surtout, à la <strong>crise d'asthme grave</strong>, qui met en jeu le pronostic vital.</p>
<blockquote>Attention : appelez les secours si, pendant une crise, la personne a du mal à parler ou à marcher, si les lèvres bleuissent, si la respiration s'épuise ou si le traitement de secours ne fait plus effet. C'est une urgence vitale.</blockquote>

<h2>Comment se soigne l'asthme ?</h2>
<p>Le traitement repose sur deux types de médicaments inhalés, à ne pas confondre :</p>
<table>
<thead><tr><th>Type</th><th>Rôle</th><th>Quand</th></tr></thead>
<tbody>
<tr><td>Traitement de fond (corticoïde inhalé, seul ou associé)</td><td>Réduit l'inflammation, prévient les crises</td><td>Tous les jours, même sans symptôme</td></tr>
<tr><td>Traitement de secours (bronchodilatateur à action rapide)</td><td>Ouvre les bronches, calme la crise</td><td>En cas de crise ou avant l'effort</td></tr>
</tbody>
</table>
<p>À cela s'ajoutent l'<strong>éviction des facteurs déclenchants</strong>, une bonne <strong>technique d'inhalation</strong> (souvent mal maîtrisée) et un <strong>plan d'action</strong> écrit remis par le médecin. Bien utilisé, le traitement de fond permet de vivre sans crise.</p>
<blockquote>Conseils pratiques : gardez toujours votre traitement de secours sur vous, vérifiez la date de péremption de vos inhalateurs et faites contrôler votre technique d'inhalation à chaque consultation. Une mauvaise technique est l'une des premières causes d'asthme mal contrôlé — une chambre d'inhalation aide beaucoup, en particulier chez l'enfant.</blockquote>

<h2>L'asthme de l'enfant</h2>
<p>L'asthme est la maladie chronique la plus fréquente chez l'enfant. Chez le tout-petit, il se manifeste souvent par des bronchites sifflantes à répétition plutôt que par des crises typiques, ce qui peut retarder le diagnostic — d'autant que la spirométrie n'est pas réalisable avant 5 à 6 ans environ.</p>
<p>Bien pris en charge, l'asthme de l'enfant n'empêche ni le jeu, ni le sport, ni la scolarité, et il s'atténue souvent à l'adolescence. Les priorités : supprimer le tabagisme passif (un des principaux facteurs aggravants), aérer le logement, traiter les allergies éventuelles et accompagner l'enfant comme ses parents dans le bon usage des dispositifs d'inhalation.</p>

<h2>Comment prévenir les crises ?</h2>
<ul>
<li>Prendre son traitement de fond régulièrement, sans l'arrêter dès que « ça va mieux ».</li>
<li>Réduire l'exposition aux allergènes (aération, literie anti-acariens, éloigner les animaux si besoin).</li>
<li>Arrêter le tabac et éviter le tabagisme passif.</li>
<li>Se faire vacciner contre la grippe.</li>
<li>Apprendre à reconnaître les signes annonciateurs d'une crise.</li>
</ul>

<h2>Asthme : quand consulter ?</h2>
<p>Consultez si vous avez des sifflements, une toux nocturne persistante ou un essoufflement inhabituel, et pour toute crise inhabituelle. Le <a href="/specialites/medecine-generale">médecin généraliste</a> ou le <a href="/specialites/pneumo-phtisiologie">pneumologue</a> pose le diagnostic, adapte le traitement et vérifie votre technique d'inhalation. Un asthme mal contrôlé (crises fréquentes, réveils nocturnes, recours répété au traitement de secours) justifie une consultation pour réajuster la prise en charge.</p>

<h2>Vivre avec l'asthme au Maroc</h2>
<p>Un asthme bien contrôlé n'empêche ni le sport, ni une vie active. De nombreux sportifs de haut niveau sont asthmatiques. La clé est l'<strong>observance</strong> du traitement de fond et la maîtrise de son plan d'action. En cas d'asthme d'effort, un bronchodilatateur pris avant l'activité prévient la crise. N'hésitez pas à demander à votre médecin de revoir avec vous, régulièrement, comment vous utilisez vos dispositifs.</p>

<hr>
<p>Une toux qui traîne, des sifflements, un asthme mal équilibré ? Sur SantéauMaroc, trouvez un médecin généraliste ou un pneumologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const asthmeFaq = [
  { q: "L'asthme se guérit-il ?", a: "On ne guérit pas l'asthme, mais on le contrôle très bien. Chez l'enfant, il peut s'atténuer nettement avec l'âge. Avec un traitement de fond adapté et l'éviction des facteurs déclenchants, la plupart des asthmatiques vivent sans crise et sans limitation." },
  { q: "Quelle est la différence entre le traitement de fond et le traitement de secours ?", a: "Le traitement de fond (corticoïde inhalé) se prend chaque jour pour réduire l'inflammation et prévenir les crises, même quand on se sent bien. Le traitement de secours (bronchodilatateur à action rapide) ne se prend qu'en cas de crise, pour ouvrir rapidement les bronches. Les deux ne sont pas interchangeables." },
  { q: "Peut-on faire du sport quand on est asthmatique ?", a: "Oui, et c'est même recommandé. Un asthme bien contrôlé permet toute activité physique. En cas d'asthme d'effort, un bronchodilatateur pris avant l'exercice prévient la crise. De nombreux sportifs de haut niveau sont asthmatiques." },
  { q: "Comment reconnaître une crise d'asthme grave ?", a: "Difficulté à parler ou à marcher, respiration très rapide qui s'épuise, lèvres ou ongles qui bleuissent, absence d'amélioration après le traitement de secours. Ce sont des signes d'urgence vitale : il faut appeler les secours immédiatement." },
  { q: "L'asthme est-il héréditaire ?", a: "Il existe une prédisposition familiale : avoir des parents asthmatiques ou allergiques augmente le risque. Mais l'environnement (allergènes, tabac, pollution) joue aussi un rôle majeur dans son apparition et ses crises." },
  { q: "L'asthme est-il forcément d'origine allergique ?", a: "Non. L'asthme allergique est le plus fréquent, surtout chez l'enfant, mais il existe des asthmes non allergiques, déclenchés par les infections, l'effort, l'air froid ou des irritants. Le bilan permet de préciser le profil." },
];
const asthmeTakeaways = [
  "L'asthme est une inflammation chronique des bronches, avec une obstruction réversible.",
  "Symptômes clés : sifflements, essoufflement, toux nocturne, oppression thoracique.",
  "Le diagnostic se confirme par une spirométrie (mesure du souffle).",
  "Deux traitements à distinguer : le fond (chaque jour, prévient) et le secours (en crise).",
  "Une crise grave (difficulté à parler, lèvres bleues) est une urgence vitale.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. CHOLESTÉROL
// ─────────────────────────────────────────────────────────────────────────────
const cCholesterol = `<p>Le cholestérol est souvent perçu comme un ennemi, alors qu'il est indispensable au fonctionnement de l'organisme. Le problème naît de son <strong>excès</strong> — en particulier du « mauvais » cholestérol — qui s'accumule dans les artères et prépare, en silence, l'infarctus et l'AVC. Bonne nouvelle : il se dépiste par une simple prise de sang et se corrige efficacement.</p>

<h2>Qu'est-ce que le cholestérol ?</h2>
<p>Le cholestérol est une graisse (lipide) fabriquée par le foie et apportée par l'alimentation. Il circule dans le sang lié à des transporteurs :</p>
<ul>
<li><strong>Le LDL-cholestérol</strong>, dit « mauvais » : en excès, il se dépose sur la paroi des artères.</li>
<li><strong>Le HDL-cholestérol</strong>, dit « bon » : il ramène le cholestérol vers le foie pour l'éliminer.</li>
</ul>
<p>On parle d'<strong>hypercholestérolémie</strong> lorsque le LDL est trop élevé. Associé à un excès de <strong>triglycérides</strong> (une autre graisse du sang), on parle plus largement de dyslipidémie.</p>

<h2>Quelles sont les causes et les facteurs de risque ?</h2>
<ol>
<li><strong>Alimentation</strong> riche en graisses saturées (fritures, viandes grasses, beurre, pâtisseries).</li>
<li><strong>Hérédité</strong> : la forme familiale entraîne un cholestérol très élevé dès le jeune âge.</li>
<li><strong>Surpoids</strong> et <strong>sédentarité</strong>.</li>
<li><strong>Diabète</strong> et <strong><a href="/blog/hypertension-arterielle-maroc">hypertension</a></strong>, souvent associés.</li>
<li><strong>Tabac</strong>, qui abaisse le « bon » cholestérol.</li>
<li>Certaines maladies (hypothyroïdie, maladies rénales) et l'âge.</li>
</ol>

<h2>Quels sont les symptômes d'un excès de cholestérol ?</h2>
<p>Aucun, dans l'immense majorité des cas. L'excès de cholestérol est totalement <strong>silencieux</strong> : il ne se voit ni ne se sent. C'est ce qui le rend dangereux — on le découvre trop souvent au moment d'une complication. Seules les formes familiales sévères peuvent donner des dépôts visibles (petites boules jaunâtres sur les paupières ou les tendons, arc blanchâtre autour de l'iris).</p>

<h2>Comment le dépiste-t-on ?</h2>
<p>Par une simple prise de sang à jeun, le <strong>bilan lipidique</strong> (ou EAL). Il mesure le cholestérol total, le LDL, le HDL et les triglycérides.</p>
<table>
<thead><tr><th>Paramètre</th><th>Repère général</th></tr></thead>
<tbody>
<tr><td>LDL (« mauvais »)</td><td>D'autant plus bas que le risque cardiovasculaire est élevé</td></tr>
<tr><td>HDL (« bon »)</td><td>Plus il est haut, mieux c'est</td></tr>
<tr><td>Triglycérides</td><td>&lt; 1,50 g/L souhaitable</td></tr>
</tbody>
</table>
<p>La cible de LDL n'est pas la même pour tout le monde : elle est fixée par le médecin en fonction du risque global (diabète, hypertension, tabac, antécédents). Un même chiffre peut être acceptable chez l'un et trop élevé chez l'autre.</p>

<h2>Quelles complications ?</h2>
<p>L'excès de LDL favorise l'<strong>athérosclérose</strong> : des plaques de graisse se forment et rétrécissent les artères. Avec le temps, cela expose à :</p>
<table>
<thead><tr><th>Localisation</th><th>Conséquence</th></tr></thead>
<tbody>
<tr><td>Artères du cœur</td><td>Angine de poitrine, infarctus</td></tr>
<tr><td>Artères du cerveau</td><td><a href="/blog/avc-accident-vasculaire-cerebral-maroc">Accident vasculaire cérébral (AVC)</a></td></tr>
<tr><td>Artères des jambes</td><td>Artérite des membres inférieurs</td></tr>
</tbody>
</table>

<h2>Comment faire baisser son cholestérol ?</h2>
<p>La première étape est toujours l'hygiène de vie, souvent suffisante :</p>
<ul>
<li>Réduire les graisses saturées (fritures, charcuterie, beurre, viennoiseries).</li>
<li>Privilégier l'huile d'olive, le poisson gras (sardine, maquereau), les fruits, légumes et fibres.</li>
<li>Bouger : 30 minutes d'activité par jour augmentent le « bon » cholestérol.</li>
<li>Perdre du poids si nécessaire, arrêter le tabac.</li>
</ul>
<p>Si cela ne suffit pas, ou en cas de risque élevé, le médecin prescrit un médicament — le plus souvent une <strong>statine</strong>. Le traitement ne dispense jamais des mesures d'hygiène de vie ; il les complète.</p>

<h2>Bien manger pour son cholestérol</h2>
<p>L'alimentation abaisse le « mauvais » cholestérol et fait partie intégrante du traitement. Quelques repères concrets, faciles à appliquer dans la cuisine marocaine :</p>
<ul>
<li><strong>À privilégier</strong> : huile d'olive, poisson gras (sardine, maquereau), légumineuses, fruits et légumes, céréales complètes, une poignée de fruits à coque (amandes, noix).</li>
<li><strong>À limiter</strong> : fritures, viandes grasses et charcuterie (khlii, cachir), beurre et smen, pâtisseries et viennoiseries, fromages très gras.</li>
<li>Cuisiner à l'huile d'olive plutôt qu'au beurre, et préférer les cuissons vapeur, au four ou en tajine à la friture.</li>
</ul>
<blockquote>Bon à savoir : les fibres (avoine, légumineuses, fruits et légumes) réduisent l'absorption du cholestérol. Intégrer une portion de légumineuses plusieurs fois par semaine est un réflexe simple et efficace.</blockquote>

<h2>Idées reçues sur le cholestérol</h2>
<ul>
<li><strong>« Je suis mince, je ne risque rien. »</strong> Faux : le cholestérol dépend aussi de l'hérédité. Une personne mince peut avoir un LDL élevé, surtout en cas de forme familiale.</li>
<li><strong>« Seul le cholestérol des aliments compte. »</strong> Faux : ce sont surtout les graisses saturées et le mode de vie qui élèvent le LDL, davantage que le cholestérol alimentaire lui-même.</li>
<li><strong>« Si je me sens bien, il est forcément normal. »</strong> Faux : il est silencieux. Seule la prise de sang permet de le connaître.</li>
</ul>

<h2>Cholestérol : quand consulter ?</h2>
<p>Faites doser votre cholestérol à partir de 40 ans, plus tôt en cas d'antécédents familiaux, de <a href="/blog/diabete-type-2-maroc">diabète</a>, d'hypertension ou de tabagisme. Le <a href="/specialites/medecine-generale">médecin généraliste</a> assure le dépistage et le suivi ; le <a href="/specialites/cardiologie">cardiologue</a> intervient en cas de risque élevé ou de maladie cardiovasculaire.</p>

<hr>
<p>Un bilan lipidique à interpréter, un cholestérol élevé à prendre en charge ? Sur SantéauMaroc, trouvez un médecin généraliste ou un cardiologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const cholesterolFaq = [
  { q: "Quelle est la différence entre le bon et le mauvais cholestérol ?", a: "Le LDL (« mauvais ») dépose le cholestérol sur la paroi des artères quand il est en excès ; le HDL (« bon ») en débarrasse les artères. L'objectif est d'abaisser le LDL et de préserver un HDL élevé." },
  { q: "L'excès de cholestérol donne-t-il des symptômes ?", a: "Non, dans la quasi-totalité des cas il est silencieux : il ne se voit ni ne se sent. On le découvre par une prise de sang, ou malheureusement lors d'une complication (infarctus, AVC). D'où l'intérêt du dépistage." },
  { q: "À partir de quand le cholestérol est-il trop élevé ?", a: "Il n'y a pas de seuil unique : la cible de LDL dépend de votre risque cardiovasculaire global (diabète, hypertension, tabac, antécédents). Un chiffre acceptable pour une personne peut être trop élevé pour une autre. Seul le médecin fixe votre objectif." },
  { q: "Comment faire baisser son cholestérol naturellement ?", a: "En réduisant les graisses saturées (fritures, charcuterie, beurre), en privilégiant l'huile d'olive, le poisson gras, les fruits, légumes et fibres, en bougeant 30 minutes par jour, en perdant du poids si besoin et en arrêtant le tabac." },
  { q: "Les statines sont-elles à prendre à vie ?", a: "Souvent oui, car elles maintiennent le LDL bas et protègent les artères. Elles ne se remplacent pas par l'hygiène de vie mais s'y ajoutent. Ne jamais arrêter une statine sans avis médical, même si le bilan s'est normalisé." },
  { q: "L'alimentation seule suffit-elle à corriger le cholestérol ?", a: "Souvent oui pour les excès modérés. Mais en cas de forme familiale ou de risque cardiovasculaire élevé, un traitement médicamenteux est nécessaire en complément. Le médecin décide selon votre bilan et votre risque global." },
];
const cholesterolTakeaways = [
  "Le cholestérol est utile ; c'est son excès, surtout le LDL, qui est dangereux.",
  "L'hypercholestérolémie est silencieuse : seule une prise de sang la révèle.",
  "La cible de LDL est personnalisée selon le risque cardiovasculaire global.",
  "En excès, il favorise l'athérosclérose : infarctus, AVC, artérite.",
  "Le traitement commence par l'hygiène de vie ; une statine s'y ajoute si besoin.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. AVC
// ─────────────────────────────────────────────────────────────────────────────
const cAvc = `<p>L'accident vasculaire cérébral (AVC) est une urgence médicale absolue : chaque minute compte. Reconnaître ses signes et appeler immédiatement les secours peut sauver une vie et éviter un handicap lourd. Au Maroc, l'AVC est l'une des premières causes de décès et de handicap acquis — et pourtant, il est en grande partie évitable.</p>

<h2>Qu'est-ce qu'un AVC ?</h2>
<p>Un AVC survient quand la circulation du sang dans une partie du cerveau s'interrompt brutalement. Privées d'oxygène, les cellules cérébrales meurent en quelques minutes. Il existe deux mécanismes :</p>
<table>
<thead><tr><th>Type</th><th>Mécanisme</th><th>Fréquence</th></tr></thead>
<tbody>
<tr><td>AVC ischémique</td><td>Une artère du cerveau est bouchée par un caillot</td><td>Le plus fréquent (~80 %)</td></tr>
<tr><td>AVC hémorragique</td><td>Une artère du cerveau se rompt et saigne</td><td>Plus rare, souvent plus grave</td></tr>
</tbody>
</table>
<p>L'<strong>accident ischémique transitoire (AIT)</strong> est un « mini-AVC » dont les signes disparaissent en quelques minutes. Il ne faut jamais l'ignorer : c'est un signal d'alarme majeur.</p>

<h2>Quels sont les signes d'un AVC ? (réagir vite)</h2>
<p>Les signes apparaissent <strong>brutalement</strong>. La règle « VITE » aide à les mémoriser :</p>
<ul>
<li><strong>V — Visage</strong> : la bouche se déforme, un côté du visage tombe.</li>
<li><strong>I — Incapacité</strong> : un bras (ou une jambe) ne peut plus se lever, faiblesse d'un côté.</li>
<li><strong>T — Trouble de la parole</strong> : difficulté à parler ou à comprendre.</li>
<li><strong>E — En urgence</strong> : appelez immédiatement les secours.</li>
</ul>
<p>Autres signes possibles : perte brutale de la vue, vertige intense avec troubles de l'équilibre, mal de tête violent et soudain « comme jamais ressenti ».</p>
<blockquote>Attention : devant l'un de ces signes, même s'il disparaît, appelez sans attendre les secours (au Maroc, SAMU 141 ou protection civile 15). N'attendez pas, ne conduisez pas vous-même : plus la prise en charge est rapide, plus le cerveau est préservé.</blockquote>

<h3>Que faire en attendant les secours ?</h3>
<ul>
<li>Notez l'<strong>heure exacte</strong> d'apparition des premiers signes : elle conditionne les traitements possibles.</li>
<li>Allongez la personne, la tête légèrement surélevée, et desserrez ses vêtements.</li>
<li>Ne lui donnez <strong>ni à boire ni à manger</strong>, ni aucun médicament.</li>
<li>Restez auprès d'elle, rassurez-la et surveillez sa conscience et sa respiration jusqu'à l'arrivée des secours.</li>
</ul>

<h2>Quelles sont les causes et les facteurs de risque ?</h2>
<p>L'AVC résulte le plus souvent de l'usure des artères. Les facteurs de risque, en grande partie modifiables :</p>
<ul>
<li><strong><a href="/blog/hypertension-arterielle-maroc">Hypertension artérielle</a></strong> : le facteur n°1.</li>
<li><strong><a href="/blog/diabete-type-2-maroc">Diabète</a></strong> et excès de <strong><a href="/blog/cholesterol-maroc">cholestérol</a></strong>.</li>
<li><strong>Tabac</strong> et consommation excessive d'alcool.</li>
<li><strong>Fibrillation auriculaire</strong> (trouble du rythme cardiaque).</li>
<li>Surpoids, sédentarité, âge et hérédité.</li>
</ul>

<h2>Comment se fait le diagnostic ?</h2>
<p>À l'hôpital, une <strong>imagerie cérébrale</strong> en urgence (scanner ou IRM) distingue l'AVC ischémique de l'AVC hémorragique — une distinction capitale, car le traitement diffère totalement. Un bilan cardiaque et sanguin recherche ensuite la cause.</p>

<h2>Quels traitements ?</h2>
<p>Pour l'AVC ischémique pris en charge à temps, des traitements permettent de <strong>déboucher l'artère</strong> : médicament qui dissout le caillot (thrombolyse) ou geste pour le retirer (thrombectomie). Ils n'agissent que dans une fenêtre de quelques heures — d'où l'urgence. Vient ensuite la <strong>prévention des récidives</strong> (contrôle des facteurs de risque, parfois anticoagulants) et la <strong>rééducation</strong> (kinésithérapie, orthophonie), essentielle pour récupérer.</p>

<h2>Comment prévenir l'AVC ?</h2>
<ul>
<li>Faire contrôler et traiter sa tension artérielle — la mesure la plus efficace.</li>
<li>Équilibrer son diabète et son cholestérol.</li>
<li>Arrêter le tabac, limiter l'alcool.</li>
<li>Bouger régulièrement et maintenir un poids sain.</li>
<li>Faire dépister un trouble du rythme cardiaque (pouls irrégulier).</li>
</ul>

<h2>AVC : quand consulter ou appeler les urgences ?</h2>
<p>Tout signe brutal évocateur d'AVC (« VITE »), même transitoire, impose d'<strong>appeler les secours immédiatement</strong>. En dehors de l'urgence, consultez votre <a href="/specialites/medecine-generale">médecin généraliste</a> ou un <a href="/specialites/cardiologie">cardiologue</a> pour évaluer et contrôler vos facteurs de risque, surtout si vous êtes hypertendu, diabétique ou fumeur.</p>

<h2>Après un AVC</h2>
<p>La récupération dépend beaucoup de la rapidité de la prise en charge initiale et de la qualité de la rééducation. De nombreux patients récupèrent une autonomie satisfaisante. L'accompagnement (kinésithérapie, orthophonie, soutien psychologique) et le contrôle strict des facteurs de risque, pour éviter une récidive, sont déterminants.</p>

<hr>
<p>Hors urgence, pour évaluer et réduire votre risque d'AVC, trouvez un médecin généraliste ou un cardiologue près de chez vous sur SantéauMaroc et prenez rendez-vous en ligne. En cas de signe brutal, appelez immédiatement les secours.</p>`;

const avcFaq = [
  { q: "Quels sont les premiers signes d'un AVC ?", a: "Ils apparaissent brutalement : déformation du visage, faiblesse d'un bras ou d'une jambe d'un côté, difficulté à parler ou à comprendre. Retenez le mot « VITE » (Visage, Incapacité, Trouble de la parole, En urgence). D'autres signes : perte brutale de la vue, vertige intense, mal de tête violent et soudain." },
  { q: "Que faire en cas de suspicion d'AVC ?", a: "Appeler immédiatement les secours (au Maroc, SAMU 141 ou protection civile 15), même si les signes disparaissent. Ne pas conduire soi-même, ne pas attendre. Noter l'heure d'apparition des signes : elle est cruciale pour le traitement." },
  { q: "Un AVC peut-il se guérir ?", a: "Pris en charge très rapidement, l'AVC ischémique peut être traité en débouchant l'artère (thrombolyse, thrombectomie), ce qui limite les séquelles. Beaucoup de patients récupèrent grâce à la rééducation. Le pronostic dépend surtout de la rapidité de la prise en charge." },
  { q: "Quel est le principal facteur de risque d'AVC ?", a: "L'hypertension artérielle est de loin le premier facteur de risque. La contrôler et la traiter est la mesure de prévention la plus efficace, avec l'équilibre du diabète et du cholestérol, l'arrêt du tabac et l'activité physique." },
  { q: "Qu'est-ce qu'un AIT (mini-AVC) ?", a: "L'accident ischémique transitoire donne les mêmes signes qu'un AVC mais qui disparaissent en quelques minutes. Il ne laisse pas de séquelle, mais c'est un signal d'alarme majeur annonçant un risque d'AVC : il impose de consulter en urgence." },
  { q: "L'AVC ne touche-t-il que les personnes âgées ?", a: "Le risque augmente avec l'âge, mais l'AVC peut survenir à tout âge, y compris chez des adultes jeunes, surtout en présence de facteurs de risque (hypertension, tabac, diabète) ou de certaines maladies cardiaques." },
];
const avcTakeaways = [
  "L'AVC est une urgence absolue : chaque minute de retard aggrave les séquelles.",
  "Signes brutaux « VITE » : Visage déformé, Incapacité d'un bras, Trouble de la parole → En urgence.",
  "Devant ces signes, même transitoires, appeler immédiatement les secours.",
  "L'hypertension est le premier facteur de risque, largement contrôlable.",
  "Prévention : tension, diabète, cholestérol, arrêt du tabac et activité physique.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. ANÉMIE
// ─────────────────────────────────────────────────────────────────────────────
const cAnemie = `<p>Se sentir constamment fatigué, essoufflé au moindre effort, le teint pâle ? L'anémie fait partie des causes les plus fréquentes de ces symptômes, en particulier chez la femme. Le plus souvent bénigne et bien traitée, elle doit néanmoins toujours faire rechercher sa cause. Une simple prise de sang permet de la diagnostiquer.</p>

<h2>Qu'est-ce que l'anémie ?</h2>
<p>L'anémie est une <strong>baisse du taux d'hémoglobine</strong> dans le sang. L'hémoglobine, contenue dans les globules rouges, transporte l'oxygène vers tous les organes. Quand elle diminue, l'organisme est moins bien oxygéné — d'où la fatigue et l'essoufflement.</p>
<p>L'anémie n'est pas une maladie en soi mais un <strong>signe</strong> : elle traduit toujours une cause qu'il faut identifier.</p>

<h2>Quelles sont les causes de l'anémie ?</h2>
<p>La plus fréquente, de loin, est la <strong>carence en fer</strong> (le fer est indispensable à la fabrication de l'hémoglobine). Les principales causes :</p>
<ul>
<li><strong>Carence en fer</strong> : règles abondantes, grossesse, alimentation pauvre en fer, saignements digestifs.</li>
<li><strong>Carence en vitamines</strong> B12 ou folates (acide folique).</li>
<li><strong>Maladies chroniques</strong> (inflammation, maladie rénale).</li>
<li><strong>Maladies du sang</strong> ou anémies héréditaires (comme la thalassémie).</li>
</ul>

<h2>Quels sont les symptômes de l'anémie ?</h2>
<ul>
<li>Fatigue persistante, baisse de forme</li>
<li>Pâleur (peau, intérieur des paupières)</li>
<li>Essoufflement à l'effort, palpitations</li>
<li>Vertiges, maux de tête</li>
<li>Ongles cassants, chute de cheveux</li>
</ul>
<p>Ces signes s'installent souvent progressivement, si bien qu'ils passent parfois inaperçus jusqu'à un bilan sanguin.</p>

<h2>Comment diagnostique-t-on l'anémie ?</h2>
<p>Par une <strong>numération formule sanguine (NFS ou hémogramme)</strong>, qui mesure le taux d'hémoglobine. Selon les résultats, le médecin complète par un <strong>bilan martial</strong> (dont la ferritine, qui reflète les réserves en fer), un dosage des vitamines B12 et folates, et une recherche de la cause.</p>
<table>
<thead><tr><th>Profil</th><th>Seuil indicatif d'anémie (hémoglobine)</th></tr></thead>
<tbody>
<tr><td>Homme adulte</td><td>&lt; 13 g/dL</td></tr>
<tr><td>Femme adulte</td><td>&lt; 12 g/dL</td></tr>
<tr><td>Femme enceinte</td><td>&lt; 11 g/dL</td></tr>
</tbody>
</table>
<p>Ces seuils sont indicatifs et interprétés par le médecin selon le contexte.</p>

<h2>L'anémie chez la femme et l'enfant</h2>
<p>La femme est particulièrement exposée à l'anémie par carence en fer : les <strong>règles abondantes</strong> et la <strong>grossesse</strong> augmentent à la fois les pertes et les besoins. Chez la femme enceinte, une supplémentation en fer et en acide folique est fréquemment prescrite, et le taux d'hémoglobine surveillé tout au long du suivi prénatal.</p>
<p>Chez le <strong>nourrisson et le jeune enfant</strong> en pleine croissance, la carence en fer est également fréquente et peut retentir sur le développement. Une alimentation adaptée et, si besoin, une supplémentation sur avis médical permettent de la corriger.</p>

<h2>Quelles complications ?</h2>
<p>Une anémie légère fatigue et diminue la qualité de vie. Une anémie sévère ou prolongée fait travailler le cœur davantage et peut le retentir. Pendant la <strong>grossesse</strong>, une anémie augmente les risques pour la mère et l'enfant — d'où l'importance du dépistage et du suivi (voir notre guide sur le <a href="/blog/suivi-grossesse-maroc">suivi de grossesse au Maroc</a>).</p>

<h2>Comment se traite l'anémie ?</h2>
<p>Le traitement dépend entièrement de la <strong>cause</strong> :</p>
<ul>
<li><strong>Carence en fer</strong> : supplémentation en fer (comprimés, parfois en perfusion), et surtout traitement de la cause du manque (saignements, alimentation).</li>
<li><strong>Carence en B12 ou folates</strong> : supplémentation adaptée.</li>
<li><strong>Autres causes</strong> : prise en charge de la maladie sous-jacente.</li>
</ul>
<blockquote>Bon à savoir : ne prenez pas de fer de votre propre initiative sur une longue durée. Un excès de fer est nuisible, et se supplémenter sans bilan peut masquer une cause importante à traiter (par exemple un saignement digestif).</blockquote>

<h2>Comment prévenir l'anémie par carence ?</h2>
<ul>
<li>Adopter une alimentation riche en fer : viande rouge, volaille, poisson, légumineuses (lentilles, pois chiches), légumes verts.</li>
<li>Associer une source de vitamine C (agrumes, tomate) qui améliore l'absorption du fer.</li>
<li>Surveiller son taux en cas de règles abondantes, de grossesse ou de régime végétarien.</li>
</ul>

<h2>Anémie : quand consulter ?</h2>
<p>Consultez en cas de fatigue inhabituelle et persistante, de pâleur ou d'essoufflement anormal. Le <a href="/specialites/medecine-generale">médecin généraliste</a> prescrit le bilan, identifie la cause et met en place le traitement, en orientant vers un spécialiste si nécessaire.</p>

<hr>
<p>Une fatigue qui dure, un bilan sanguin à interpréter ? Sur SantéauMaroc, trouvez un médecin généraliste près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const anemieFaq = [
  { q: "Quels sont les symptômes de l'anémie ?", a: "Une fatigue persistante, une pâleur (peau, intérieur des paupières), un essoufflement à l'effort, des palpitations, des vertiges, des maux de tête, parfois des ongles cassants. Ces signes s'installent souvent progressivement." },
  { q: "Quelle est la cause la plus fréquente de l'anémie ?", a: "La carence en fer, de loin la plus fréquente, surtout chez la femme (règles abondantes, grossesse) et en cas d'alimentation pauvre en fer ou de saignements. Le fer est indispensable à la fabrication de l'hémoglobine." },
  { q: "Comment savoir si je suis anémié ?", a: "Par une prise de sang : la numération formule sanguine (NFS) mesure le taux d'hémoglobine. Le médecin complète souvent par un dosage de la ferritine (réserves en fer) et des vitamines B12 et folates pour en trouver la cause." },
  { q: "Quels aliments contre l'anémie par manque de fer ?", a: "Viande rouge, volaille, poisson, légumineuses (lentilles, pois chiches) et légumes verts. Associer une source de vitamine C (agrumes, tomate) améliore l'absorption du fer. Le traitement de la cause reste indispensable." },
  { q: "Peut-on prendre du fer sans ordonnance ?", a: "Ce n'est pas conseillé sur la durée. Un excès de fer est nuisible et une supplémentation sans bilan peut masquer une cause importante (comme un saignement digestif). Mieux vaut un bilan et un avis médical avant de se supplémenter." },
  { q: "L'anémie est-elle dangereuse pendant la grossesse ?", a: "Une anémie non prise en charge pendant la grossesse augmente les risques pour la mère et l'enfant. C'est pourquoi le taux d'hémoglobine est surveillé lors du suivi prénatal et une supplémentation est souvent prescrite." },
];
const anemieTakeaways = [
  "L'anémie est une baisse de l'hémoglobine, qui transporte l'oxygène dans le sang.",
  "Symptômes fréquents : fatigue, pâleur, essoufflement, palpitations, vertiges.",
  "La carence en fer est la cause la plus fréquente, surtout chez la femme.",
  "Le diagnostic repose sur une prise de sang (NFS + ferritine).",
  "Le traitement vise la cause : ne pas se supplémenter en fer sans bilan.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. DÉPRESSION
// ─────────────────────────────────────────────────────────────────────────────
const cDepression = `<p>La dépression n'est ni une faiblesse, ni un simple « coup de blues » : c'est une véritable maladie, fréquente, qui se soigne très bien. Encore trop taboue au Maroc, elle pousse beaucoup de personnes à souffrir en silence. Or, en parler et consulter sont les premiers pas vers le rétablissement. Comprendre la dépression aide à déculpabiliser et à agir.</p>

<h2>Qu'est-ce que la dépression ?</h2>
<p>La dépression est un <strong>trouble de l'humeur</strong> caractérisé par une tristesse profonde et/ou une perte d'intérêt et de plaisir, qui durent (au moins deux semaines), et qui retentissent sur la vie quotidienne. Elle est différente d'une tristesse passagère, réaction normale face aux difficultés de la vie : la dépression s'installe, envahit tout et ne cède pas au simple repos ou aux encouragements.</p>

<h2>Quelles sont les causes et les facteurs de risque ?</h2>
<p>La dépression est <strong>multifactorielle</strong> : elle résulte de la combinaison de plusieurs éléments, sans qu'il y ait « une » cause unique ou une faute de la personne.</p>
<ul>
<li><strong>Facteurs biologiques</strong> : déséquilibre des messagers chimiques du cerveau, hérédité.</li>
<li><strong>Événements de vie</strong> : deuil, séparation, difficultés professionnelles ou financières, isolement.</li>
<li><strong>Facteurs psychologiques</strong> : antécédents, stress chronique, manque d'estime de soi.</li>
<li><strong>Maladies</strong> chroniques ou douloureuses ; période particulière comme l'<strong>après-accouchement</strong> (dépression du post-partum).</li>
</ul>

<h2>Quels sont les symptômes de la dépression ?</h2>
<p>Ils associent des signes psychologiques et physiques :</p>
<ul>
<li><strong>Tristesse</strong> persistante, envie de pleurer</li>
<li><strong>Perte d'intérêt et de plaisir</strong> pour ce qu'on aimait (anhédonie)</li>
<li><strong>Fatigue</strong>, manque d'énergie</li>
<li>Troubles du <strong>sommeil</strong> (insomnie ou hypersomnie) et de l'<strong>appétit</strong></li>
<li>Difficultés de <strong>concentration</strong>, ralentissement</li>
<li>Sentiment de <strong>culpabilité</strong>, de dévalorisation</li>
<li>Idées noires, pensées de mort</li>
</ul>
<blockquote>Attention : en cas d'idées suicidaires — les vôtres ou celles d'un proche — il s'agit d'une urgence. N'attendez pas : parlez-en immédiatement à un médecin, aux urgences ou à une personne de confiance. La souffrance peut être soulagée, et demander de l'aide est un acte de courage, pas de faiblesse.</blockquote>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Le diagnostic est <strong>clinique</strong> : il repose sur un entretien avec un médecin (généraliste ou psychiatre), qui évalue les symptômes, leur durée et leur retentissement. Il n'existe pas de prise de sang de la dépression ; un bilan peut cependant être demandé pour écarter une autre cause (comme un trouble de la thyroïde).</p>

<h2>Comment se soigne la dépression ?</h2>
<p>La dépression se traite efficacement. La prise en charge, adaptée à la sévérité, associe :</p>
<table>
<thead><tr><th>Approche</th><th>Principe</th></tr></thead>
<tbody>
<tr><td>Psychothérapie</td><td>Un accompagnement par la parole (dont les thérapies cognitivo-comportementales), très efficace</td></tr>
<tr><td>Antidépresseurs</td><td>Prescrits dans les formes modérées à sévères ; ils agissent en 2 à 4 semaines</td></tr>
<tr><td>Hygiène de vie</td><td>Activité physique, sommeil, lien social — en soutien du traitement</td></tr>
</tbody>
</table>
<p>Deux messages essentiels : les antidépresseurs <strong>ne créent pas de dépendance</strong> comme on le croit souvent, et il ne faut <strong>jamais les arrêter brutalement</strong> ni sans avis médical, même quand on se sent mieux — le traitement se poursuit un certain temps pour éviter la rechute.</p>

<h2>Dépression : quand consulter ?</h2>
<p>Consultez si les symptômes durent plus de deux semaines, s'ils perturbent votre quotidien (sommeil, travail, relations), ou dès qu'apparaissent des idées noires. Le <a href="/specialites/medecine-generale">médecin généraliste</a> est un bon premier interlocuteur ; il peut orienter vers un <a href="/specialites/psychiatrie">psychiatre</a>. Il n'est jamais « trop tôt » pour demander de l'aide.</p>

<h2>Comment aider un proche qui déprime ?</h2>
<ul>
<li><strong>Écouter sans juger</strong> ni minimiser : « secoue-toi » est contre-productif, car la dépression n'est pas une question de volonté.</li>
<li><strong>Encourager à consulter</strong> et proposer d'accompagner la personne, sans la forcer.</li>
<li><strong>Rester présent</strong> dans la durée : garder le lien, proposer des activités simples, sans pression.</li>
<li><strong>Prendre au sérieux</strong> toute allusion à des idées noires et alerter un professionnel sans attendre.</li>
</ul>

<h2>Vivre avec et se rétablir</h2>
<p>La grande majorité des personnes déprimées vont mieux avec une prise en charge adaptée. Le rétablissement demande du temps et de la patience — ce n'est pas une question de volonté. Le soutien des proches, le maintien d'un minimum d'activité et de lien social, et la poursuite du suivi jusqu'au bout sont des alliés précieux. Parler de sa souffrance, au Maroc comme ailleurs, reste le premier pas pour s'en sortir.</p>

<hr>
<p>Si vous traversez une période difficile, vous n'êtes pas seul. Sur SantéauMaroc, trouvez un médecin généraliste ou un psychiatre près de chez vous et prenez rendez-vous en ligne. En cas d'idées suicidaires, contactez immédiatement les urgences ou une personne de confiance.</p>`;

const depressionFaq = [
  { q: "Comment savoir si je fais une dépression ou un simple coup de blues ?", a: "Un coup de blues est passager et cède au repos ou aux bons moments. La dépression s'installe (au moins deux semaines), associe tristesse et/ou perte d'intérêt à d'autres signes (fatigue, troubles du sommeil et de l'appétit, dévalorisation) et retentit sur le quotidien. En cas de doute, un médecin peut vous aider à faire le point." },
  { q: "La dépression se soigne-t-elle vraiment ?", a: "Oui, très bien. La psychothérapie et, si besoin, les antidépresseurs permettent à la grande majorité des personnes de se rétablir. Le rétablissement demande du temps : ce n'est pas une question de volonté." },
  { q: "Les antidépresseurs rendent-ils dépendant ?", a: "Non, les antidépresseurs ne créent pas de dépendance comme le font certaines substances. Il ne faut cependant jamais les arrêter brutalement ni sans avis médical : l'arrêt se fait progressivement, sous contrôle, pour éviter la rechute." },
  { q: "Faut-il voir un psychiatre ou un psychologue ?", a: "Le psychiatre est un médecin : il pose le diagnostic et peut prescrire un traitement. Le psychologue accompagne par la parole et les thérapies. Les deux sont souvent complémentaires. Le médecin généraliste est aussi un bon premier interlocuteur." },
  { q: "Que faire en cas d'idées suicidaires ?", a: "C'est une urgence. Il faut en parler immédiatement à un médecin, aux urgences ou à une personne de confiance, sans rester seul. La souffrance peut être soulagée : demander de l'aide est un acte de courage." },
  { q: "La dépression après l'accouchement est-elle fréquente ?", a: "Oui, la dépression du post-partum est fréquente et bien identifiée. Différente du simple « baby blues » passager, elle nécessite une prise en charge. En parler à un professionnel permet d'être aidée rapidement, pour la mère comme pour l'enfant." },
];
const depressionTakeaways = [
  "La dépression est une maladie fréquente qui se soigne, pas une faiblesse.",
  "Elle associe tristesse et/ou perte d'intérêt durables à d'autres signes, plus de deux semaines.",
  "Le diagnostic est clinique ; il n'existe pas de prise de sang de la dépression.",
  "Le traitement associe psychothérapie et, si besoin, antidépresseurs (efficaces en 2 à 4 semaines).",
  "Les idées suicidaires sont une urgence : en parler immédiatement, ne pas rester seul.",
];

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES PILIERS
// ─────────────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    slug: "asthme-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Asthme",
    title: "Asthme au Maroc : symptômes, causes, traitement et prévention",
    excerpt: "L'asthme est une maladie respiratoire chronique fréquente au Maroc. Symptômes, facteurs déclenchants, traitements de fond et de secours, crise grave et prévention : le guide complet pour bien la contrôler.",
    content: cAsthme,
    metaTitle: "Asthme au Maroc : symptômes, causes et traitement",
    metaDesc: "Asthme : symptômes (sifflements, toux, essoufflement), causes, diagnostic, traitements de fond et de secours, crise grave et prévention, expliqués et adaptés au Maroc.",
    readingTime: 7,
    keyTakeaways: asthmeTakeaways,
    faq: asthmeFaq,
  },
  {
    slug: "cholesterol-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Hypercholestérolémie",
    title: "Cholestérol au Maroc : bon, mauvais, risques et comment le faire baisser",
    excerpt: "Excès de cholestérol : différence entre bon (HDL) et mauvais (LDL), dépistage par bilan sanguin, complications cardiovasculaires et solutions pour le faire baisser, adaptées au Maroc.",
    content: cCholesterol,
    metaTitle: "Cholestérol au Maroc : risques et comment le faire baisser",
    metaDesc: "Cholestérol : bon (HDL) et mauvais (LDL), causes, dépistage, complications (infarctus, AVC) et comment le faire baisser par l'alimentation et le traitement, au Maroc.",
    readingTime: 7,
    keyTakeaways: cholesterolTakeaways,
    faq: cholesterolFaq,
  },
  {
    slug: "avc-accident-vasculaire-cerebral-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Accident vasculaire cérébral",
    title: "AVC au Maroc : reconnaître les signes, réagir vite et prévenir",
    excerpt: "L'AVC est une urgence absolue. Reconnaître les signes (règle « VITE »), réagir vite, comprendre les causes, les traitements et la prévention : le guide pour sauver des vies, adapté au Maroc.",
    content: cAvc,
    metaTitle: "AVC au Maroc : signes, urgence et prévention",
    metaDesc: "AVC : reconnaître les signes brutaux (VITE), que faire en urgence, causes et facteurs de risque, traitements et prévention. Chaque minute compte — guide adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: avcTakeaways,
    faq: avcFaq,
  },
  {
    slug: "anemie-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Anémie",
    title: "Anémie au Maroc : causes, symptômes, diagnostic et traitement",
    excerpt: "Fatigue, pâleur, essoufflement : l'anémie est fréquente, surtout chez la femme. Causes (dont la carence en fer), symptômes, diagnostic par prise de sang et traitements, expliqués et adaptés au Maroc.",
    content: cAnemie,
    metaTitle: "Anémie au Maroc : causes, symptômes et traitement",
    metaDesc: "Anémie : causes (carence en fer, vitamines), symptômes (fatigue, pâleur, essoufflement), diagnostic par prise de sang (NFS, ferritine) et traitement, adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: anemieTakeaways,
    faq: anemieFaq,
  },
  {
    slug: "depression-maroc",
    categorySlug: "sante-mentale",
    aboutEntity: "Dépression",
    title: "Dépression au Maroc : symptômes, causes et comment s'en sortir",
    excerpt: "La dépression est une maladie fréquente qui se soigne, pas une faiblesse. Symptômes, causes, diagnostic, traitements (psychothérapie, antidépresseurs) et quand consulter : comprendre pour agir, au Maroc.",
    content: cDepression,
    metaTitle: "Dépression au Maroc : symptômes, causes et traitement",
    metaDesc: "Dépression : reconnaître les symptômes, comprendre les causes, le diagnostic et les traitements (psychothérapie, antidépresseurs), et savoir quand consulter. Une maladie qui se soigne, au Maroc.",
    readingTime: 6,
    keyTakeaways: depressionTakeaways,
    faq: depressionFaq,
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
    console.log(`✓ Fiche Maladie  /blog/${post.slug}  (${art.categorySlug})`);
  }

  console.log(`\nVague 2 : ${PILLARS.length} fiches Maladie publiées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
