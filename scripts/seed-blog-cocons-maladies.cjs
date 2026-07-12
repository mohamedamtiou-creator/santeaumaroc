require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DENSIFICATION EN COCONS — 3 piliers Maladie existants deviennent des hubs, avec
// 4 satellites chacun (rattachés par pillarId). Le moteur affiche « Dans ce
// dossier » (pilier → satellites) et la bannière retour (satellite → pilier).
//   • Asthme      (asthme-maroc)                          → pneumologie / pédiatrie
//   • Cholestérol (cholesterol-maroc)                     → cardiologie
//   • AVC         (avc-accident-vasculaire-cerebral-maroc)→ cardiologie
// Satellites = deep-dives ciblés (long-tail), distincts du pilier. Gabarit léger :
// sections focalisées + FAQ + À retenir + relecture EEAT. Idempotent (upsert).
// Mappings CTA : lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ═══ ASTHME ═══════════════════════════════════════════════════════════════════
const cAsthmeCrise = `<p>Une crise d'asthme, c'est un rétrécissement soudain des bronches qui rend la respiration difficile. Savoir la reconnaître et réagir vite, avec le bon traitement, permet le plus souvent de la maîtriser à domicile — et de repérer les rares crises graves qui imposent d'appeler les secours.</p>

<h2>Reconnaître une crise d'asthme</h2>
<p>La crise associe des <strong>sifflements</strong>, une <strong>gêne à respirer</strong>, une <strong>toux</strong> et une <strong>oppression</strong> dans la poitrine. Elle peut être déclenchée par un allergène, un effort, une infection, la fumée ou le froid.</p>

<h2>Les gestes immédiats</h2>
<ul>
<li>S'arrêter, s'asseoir bien droit et rester calme (la panique aggrave la gêne).</li>
<li>Prendre aussitôt le <strong>traitement de secours</strong> (bronchodilatateur à action rapide), selon le plan remis par le médecin.</li>
<li>Respirer lentement en attendant que le traitement agisse.</li>
</ul>

<h2>Utiliser le traitement de secours</h2>
<p>Le bronchodilatateur ouvre rapidement les bronches. Une <a href="/blog/asthme-inhalateur-traitement-maroc">chambre d'inhalation</a> améliore son efficacité. On peut répéter les bouffées selon les consignes ; l'absence d'amélioration est un signal d'alerte.</p>

<h2>Quand appeler les urgences ?</h2>
<p>Appelez les secours (SAMU 141) si la personne : a du mal à parler ou à marcher, s'épuise à respirer, a les lèvres qui bleuissent, ou ne s'améliore pas malgré le traitement de secours. C'est une crise grave, urgence vitale.</p>

<h2>Après la crise</h2>
<p>Consultez pour comprendre le facteur déclenchant et vérifier que le <a href="/blog/asthme-maroc">traitement de fond</a> est adapté : des crises répétées signalent un asthme mal contrôlé à réévaluer.</p>

<h2>Les signes annonciateurs</h2>
<p>Une crise est souvent précédée de signes discrets : toux sèche qui s'installe, gêne à l'effort inhabituelle, réveils nocturnes, ou besoin plus fréquent du traitement de secours. Les repérer permet d'agir tôt — renforcer le traitement selon le plan du médecin — et souvent d'éviter la crise franche. Tenir un carnet de ces épisodes aide à ajuster le traitement de fond lors des consultations.</p>

<hr>
<p>Des crises fréquentes ou mal maîtrisées ? Sur SantéauMaroc, trouvez un pneumologue près de chez vous. En cas de crise grave, appelez immédiatement les secours.</p>`;
const asthmeCriseFaq = [
  { q: "Que faire en cas de crise d'asthme ?", a: "S'arrêter, s'asseoir bien droit, rester calme et prendre aussitôt le traitement de secours (bronchodilatateur rapide) selon le plan du médecin, en respirant lentement. Si la gêne ne cède pas, il faut appeler les secours." },
  { q: "Quand une crise d'asthme est-elle grave ?", a: "Quand la personne a du mal à parler ou à marcher, s'épuise à respirer, a les lèvres qui bleuissent ou ne s'améliore pas malgré le traitement de secours. C'est une urgence vitale : appelez le SAMU (141)." },
  { q: "Combien de bouffées de secours puis-je prendre ?", a: "Selon le plan d'action remis par votre médecin. En cas de crise, on répète souvent les bouffées à quelques minutes d'intervalle ; l'absence d'amélioration doit faire appeler les secours plutôt que multiplier indéfiniment les prises." },
  { q: "Comment éviter les crises d'asthme ?", a: "En prenant régulièrement son traitement de fond, en évitant les facteurs déclenchants (allergènes, tabac, froid) et en réévaluant le traitement avec le médecin si les crises se répètent, signe d'un asthme mal contrôlé." },
  { q: "Le stress peut-il déclencher une crise d'asthme ?", a: "Oui, les émotions fortes et le stress peuvent déclencher ou aggraver une crise chez les personnes asthmatiques, au même titre que l'effort, les allergènes ou les infections. Garder son calme et son traitement de secours à portée est important." },
];
const asthmeCriseTk = [
  "La crise d'asthme associe sifflements, gêne à respirer, toux et oppression thoracique.",
  "Gestes : s'asseoir, rester calme et prendre aussitôt le traitement de secours.",
  "Mal à parler, épuisement, lèvres bleues ou pas d'amélioration = urgence vitale.",
  "Des crises répétées signalent un asthme mal contrôlé, à réévaluer.",
];

const cAsthmeInhalateur = `<p>Bien utiliser ses inhalateurs est la clé d'un asthme contrôlé. Deux traitements sont à ne pas confondre, et une bonne technique d'inhalation fait toute la différence — une mauvaise technique est l'une des premières causes d'asthme mal équilibré.</p>

<h2>Traitement de fond ou de secours ?</h2>
<table>
<thead><tr><th>Type</th><th>Rôle</th><th>Quand</th></tr></thead>
<tbody>
<tr><td>Fond (corticoïde inhalé)</td><td>Réduit l'inflammation, prévient les crises</td><td>Chaque jour, même sans symptôme</td></tr>
<tr><td>Secours (bronchodilatateur rapide)</td><td>Ouvre les bronches, calme la crise</td><td>En cas de crise ou avant l'effort</td></tr>
</tbody>
</table>

<h2>Bien utiliser son inhalateur</h2>
<ul>
<li>Bien expirer avant, déclencher au début d'une inspiration lente et profonde, puis retenir sa respiration quelques secondes.</li>
<li>Rincer la bouche après un corticoïde inhalé (évite les mycoses).</li>
<li>Vérifier le nombre de doses restantes.</li>
</ul>

<h2>La chambre d'inhalation</h2>
<p>Ce tube entre l'aérosol et la bouche améliore nettement la quantité de médicament qui atteint les bronches. Elle est particulièrement utile chez l'<a href="/blog/asthme-enfant-maroc">enfant</a> et lors des crises.</p>

<h2>Les erreurs fréquentes</h2>
<p>Arrêter le traitement de fond « parce que ça va mieux », mal coordonner déclenchement et inspiration, ou abuser du traitement de secours sans revoir le fond. Faites contrôler votre technique à chaque consultation.</p>

<h2>Conserver et vérifier ses inhalateurs</h2>
<p>Gardez toujours votre traitement de secours sur vous et vérifiez régulièrement la date de péremption ainsi que le nombre de doses restantes. Conservez les dispositifs à l'abri de la chaleur. Amenez vos inhalateurs à chaque consultation : le médecin ou le pharmacien peut contrôler votre technique, souvent perfectible, et vous montrer les gestes directement sur votre propre dispositif.</p>

<hr>
<p>Pour revoir votre traitement et votre technique, consultez un pneumologue sur SantéauMaroc. Voir aussi la fiche <a href="/blog/asthme-maroc">Asthme</a>.</p>`;
const asthmeInhalateurFaq = [
  { q: "Quelle différence entre l'inhalateur de fond et de secours ?", a: "Le traitement de fond (corticoïde inhalé) se prend chaque jour pour prévenir les crises, même quand on va bien. Le traitement de secours (bronchodilatateur rapide) ne se prend qu'en cas de crise, pour ouvrir vite les bronches. Ils ne sont pas interchangeables." },
  { q: "Comment bien utiliser son inhalateur ?", a: "Expirer d'abord, déclencher au début d'une inspiration lente et profonde, puis retenir sa respiration quelques secondes. Rincer la bouche après un corticoïde inhalé. Une chambre d'inhalation améliore l'efficacité, surtout chez l'enfant." },
  { q: "Pourquoi rincer la bouche après l'inhalateur ?", a: "Après un corticoïde inhalé, se rincer la bouche évite les effets locaux comme une mycose (candidose) ou un enrouement. Ce geste simple améliore la tolérance du traitement de fond." },
  { q: "Peut-on arrêter le traitement de fond quand on va mieux ?", a: "Non, sauf avis médical. C'est justement le traitement de fond qui maintient l'asthme calme. L'arrêter dès que « ça va mieux » expose à une reprise des crises. Toute modification se décide avec le médecin." },
  { q: "À quoi sert une chambre d'inhalation ?", a: "Elle se place entre l'aérosol et la bouche et augmente la quantité de médicament qui atteint les bronches, en facilitant la coordination. Elle est très utile chez l'enfant, la personne âgée et pendant les crises." },
];
const asthmeInhalateurTk = [
  "Deux traitements à distinguer : le fond (chaque jour, prévient) et le secours (en crise).",
  "Bonne technique : expirer, déclencher en inspirant lentement, retenir sa respiration.",
  "Rincer la bouche après un corticoïde inhalé.",
  "Une mauvaise technique est une grande cause d'asthme mal contrôlé : la faire vérifier.",
];

const cAsthmeEnfant = `<p>L'asthme est la maladie chronique la plus fréquente de l'enfant. Bien pris en charge, il n'empêche ni le jeu, ni le sport, ni la scolarité, et s'atténue souvent à l'adolescence. Mais son diagnostic peut être plus délicat que chez l'adulte.</p>

<h2>Des symptômes parfois trompeurs</h2>
<p>Chez le tout-petit, l'asthme se manifeste souvent par des <strong>bronchites sifflantes à répétition</strong> plutôt que par des crises typiques, ce qui retarde le diagnostic — d'autant que la <a href="/blog/spirometrie-efr-maroc">spirométrie</a> n'est pas réalisable avant 5 à 6 ans environ.</p>

<h2>Les facteurs à maîtriser</h2>
<ul>
<li><strong>Tabagisme passif</strong> : un des principaux facteurs aggravants — un foyer sans tabac est essentiel.</li>
<li>Allergènes (acariens, animaux), infections, air froid.</li>
<li>Aérer le logement, traiter les <a href="/blog/asthme-allergique-maroc">allergies</a> éventuelles.</li>
</ul>

<h2>Les dispositifs adaptés</h2>
<p>Les jeunes enfants utilisent une <a href="/blog/asthme-inhalateur-traitement-maroc">chambre d'inhalation</a>, parfois avec un masque, pour bien recevoir le traitement. L'accompagnement des parents dans son usage est déterminant.</p>

<h2>École, sport et évolution</h2>
<p>Un asthme équilibré permet le sport (avec, si besoin, une bouffée de secours avant l'effort). Un projet d'accueil peut être mis en place à l'école. Beaucoup d'enfants voient leur asthme s'améliorer nettement en grandissant.</p>

<h2>Quand consulter en urgence ?</h2>
<p>Chez l'enfant, certains signes imposent d'appeler les secours : difficulté à parler ou à respirer, respiration très rapide qui creuse les côtes, lèvres bleutées, somnolence inhabituelle, ou absence d'amélioration après le traitement de secours. Dans le doute, mieux vaut consulter rapidement : l'asthme de l'enfant peut se dégrader vite.</p>

<hr>
<p>Un enfant qui siffle ou tousse souvent ? Sur SantéauMaroc, trouvez un pédiatre près de chez vous. Voir aussi la fiche <a href="/blog/asthme-maroc">Asthme</a>.</p>`;
const asthmeEnfantFaq = [
  { q: "Comment reconnaître l'asthme chez un enfant ?", a: "Chez le tout-petit, il se traduit souvent par des bronchites sifflantes à répétition, une toux nocturne ou à l'effort, plutôt que par des crises typiques. Le diagnostic, parfois délicat, repose sur les symptômes et leur récurrence, la spirométrie n'étant possible que vers 5-6 ans." },
  { q: "Un enfant asthmatique peut-il faire du sport ?", a: "Oui. Un asthme bien contrôlé permet le sport, avec au besoin une bouffée de bronchodilatateur avant l'effort. L'activité physique est même bénéfique. En cas de gêne à l'effort, il faut réévaluer le traitement avec le médecin." },
  { q: "Le tabagisme passif aggrave-t-il l'asthme de l'enfant ?", a: "Oui, c'est l'un des principaux facteurs aggravants. Un foyer sans tabac réduit nettement les crises et améliore le contrôle de l'asthme de l'enfant. Aérer le logement et limiter les allergènes aident également." },
  { q: "L'asthme de l'enfant disparaît-il en grandissant ?", a: "Souvent, il s'atténue nettement à l'adolescence, même s'il peut persister ou réapparaître à l'âge adulte. Un bon contrôle pendant l'enfance permet une vie normale et limite le retentissement sur la croissance et la scolarité." },
  { q: "Comment donner l'inhalateur à un jeune enfant ?", a: "Avec une chambre d'inhalation, parfois munie d'un masque adapté à l'âge, qui permet au médicament d'atteindre les bronches sans exiger une coordination parfaite. Le médecin ou le pharmacien montre le bon geste aux parents." },
];
const asthmeEnfantTk = [
  "L'asthme est la maladie chronique la plus fréquente de l'enfant.",
  "Chez le petit, il se manifeste souvent par des bronchites sifflantes à répétition.",
  "Le tabagisme passif est un facteur aggravant majeur : un foyer sans tabac est essentiel.",
  "Bien contrôlé, il permet sport et scolarité et s'atténue souvent à l'adolescence.",
];

const cAsthmeAllergique = `<p>La forme la plus fréquente d'asthme, surtout chez l'enfant et le jeune adulte, est l'asthme allergique : les crises sont déclenchées par des allergènes. Identifier et réduire ces déclencheurs est un pilier du contrôle, aux côtés du traitement.</p>

<h2>Le lien entre allergie et asthme</h2>
<p>Chez les personnes au terrain <a href="/blog/allergie-maroc">allergique</a> (atopique), l'exposition à un allergène enflamme les bronches et déclenche la crise. Rhinite allergique et asthme coexistent souvent : traiter l'une aide l'autre.</p>

<h2>Les allergènes en cause</h2>
<ul>
<li>Acariens (literie, poussière), moisissures</li>
<li>Poils d'animaux, blattes</li>
<li>Pollens (crises saisonnières)</li>
</ul>

<h2>Réduire l'exposition (éviction)</h2>
<ul>
<li>Literie anti-acariens, lavage à haute température, aération quotidienne.</li>
<li>Limiter moquettes, peluches et tapis ; éloigner les animaux si besoin.</li>
<li>Fermer les fenêtres aux pics de pollens.</li>
</ul>

<h2>Le bilan et la désensibilisation</h2>
<p>Un bilan allergologique (tests cutanés, prise de sang) précise les allergènes. Dans certains cas, une <strong>désensibilisation</strong> peut réduire durablement les réactions. Le traitement de fond de l'<a href="/blog/asthme-maroc">asthme</a> reste indispensable.</p>

<h2>Rhinite allergique et asthme : le même terrain</h2>
<p>Beaucoup d'asthmatiques allergiques ont aussi une rhinite (nez qui coule, éternuements, yeux qui piquent). On parle d'un « même terrain » respiratoire : négliger la rhinite peut déséquilibrer l'asthme. Les traiter ensemble améliore le contrôle. Signalez tous vos symptômes au médecin, y compris ceux du nez et des yeux, souvent banalisés à tort.</p>

<hr>
<p>Un asthme rythmé par les allergies ? Sur SantéauMaroc, trouvez un pneumologue près de chez vous. Voir aussi la fiche <a href="/blog/allergie-maroc">Allergies</a>.</p>`;
const asthmeAllergiqueFaq = [
  { q: "Qu'est-ce que l'asthme allergique ?", a: "C'est un asthme dont les crises sont déclenchées par des allergènes (acariens, pollens, poils d'animaux, moisissures) chez une personne au terrain allergique. C'est la forme la plus fréquente, surtout chez l'enfant et le jeune adulte." },
  { q: "Comment réduire les allergènes à la maison ?", a: "Literie anti-acariens, lavage du linge à haute température, aération quotidienne, moins de moquettes, tapis et peluches, éloignement des animaux si on y est allergique, et fenêtres fermées aux pics de pollens." },
  { q: "La rhinite allergique et l'asthme sont-ils liés ?", a: "Oui, ils coexistent souvent chez les personnes allergiques et partagent les mêmes déclencheurs. Traiter la rhinite allergique aide souvent à mieux contrôler l'asthme, et inversement : le médecin les prend en charge ensemble." },
  { q: "La désensibilisation guérit-elle l'asthme allergique ?", a: "Elle ne « guérit » pas mais peut, dans des cas sélectionnés, réduire durablement les réactions à un allergène identifié. Elle ne remplace pas le traitement de fond de l'asthme, qui reste indispensable." },
  { q: "Comment savoir à quel allergène je réagis ?", a: "Par un bilan allergologique : tests cutanés (prick-tests) et/ou dosage sanguin des IgE, réalisés par un allergologue. Ils précisent les allergènes en cause pour cibler l'éviction et, éventuellement, la désensibilisation." },
];
const asthmeAllergiqueTk = [
  "L'asthme allergique, le plus fréquent, voit ses crises déclenchées par des allergènes.",
  "Rhinite allergique et asthme coexistent souvent : traiter l'une aide l'autre.",
  "Réduire l'exposition (acariens, animaux, pollens) est un pilier du contrôle.",
  "Un bilan allergologique cible l'éviction ; le traitement de fond reste indispensable.",
];

// ═══ CHOLESTÉROL ══════════════════════════════════════════════════════════════
const cCholAlim = `<p>L'alimentation est le premier levier pour faire baisser le « mauvais » cholestérol (LDL). Adaptée à la cuisine marocaine, elle agit souvent avant même les médicaments et en complément de ceux-ci.</p>

<h2>Les principes</h2>
<p>Réduire les <strong>graisses saturées</strong> (qui font monter le LDL) et augmenter les <strong>fibres</strong> et les bonnes graisses. On ne supprime pas le gras, on le choisit.</p>

<h2>À privilégier</h2>
<ul>
<li>Huile d'olive, poisson gras (sardine, maquereau)</li>
<li>Légumineuses, fruits, légumes, céréales complètes</li>
<li>Une poignée de fruits à coque (amandes, noix)</li>
</ul>

<h2>À limiter</h2>
<ul>
<li>Fritures, viandes grasses et charcuterie (khlii, cachir)</li>
<li>Beurre, smen, pâtisseries et viennoiseries</li>
<li>Fromages très gras</li>
</ul>

<h2>Dans la cuisine marocaine</h2>
<p>Cuisiner à l'huile d'olive plutôt qu'au beurre, préférer vapeur, four et tajine à la friture, et intégrer les légumineuses plusieurs fois par semaine. Les fibres (avoine, légumineuses, légumes) réduisent l'absorption du cholestérol.</p>

<h2>Au-delà de l'assiette</h2>
<p>Bouger 30 minutes par jour augmente le « bon » cholestérol (HDL), et perdre du poids aide. Ces mesures accompagnent, sans les remplacer, les <a href="/blog/cholesterol-statines-maroc">statines</a> quand elles sont prescrites.</p>

<h2>Une journée type</h2>
<p>Au petit-déjeuner, privilégiez l'avoine ou le pain complet plutôt que les viennoiseries ; au déjeuner, une assiette de légumes et de légumineuses avec un filet d'huile d'olive ; en collation, un fruit ou une petite poignée d'amandes ; au dîner, du poisson ou une volaille sans peau avec des légumes. Réservez les pâtisseries aux occasions. Ces choix simples, répétés chaque jour, font baisser le LDL durablement.</p>

<hr>
<p>Un cholestérol à faire baisser ? Sur SantéauMaroc, trouvez un médecin ou un cardiologue près de chez vous. Voir la fiche <a href="/blog/cholesterol-maroc">Cholestérol</a>.</p>`;
const cholAlimFaq = [
  { q: "Quels aliments font baisser le cholestérol ?", a: "L'huile d'olive, le poisson gras (sardine, maquereau), les légumineuses, les fruits et légumes, les céréales complètes et une poignée de fruits à coque. Les fibres réduisent l'absorption du cholestérol : elles sont particulièrement utiles." },
  { q: "Quels aliments éviter en cas de cholestérol élevé ?", a: "Les graisses saturées : fritures, viandes grasses et charcuterie (khlii, cachir), beurre et smen, pâtisseries et viennoiseries, fromages très gras. On peut cuisiner à l'huile d'olive et privilégier vapeur, four et tajine à la friture." },
  { q: "L'alimentation suffit-elle à corriger le cholestérol ?", a: "Souvent pour les excès modérés. En cas de forme familiale ou de risque cardiovasculaire élevé, un traitement (statine) est nécessaire en complément. L'alimentation reste utile dans tous les cas et ne se remplace pas par les médicaments." },
  { q: "Les œufs sont-ils interdits en cas de cholestérol ?", a: "Non. On sait aujourd'hui que ce sont surtout les graisses saturées et le mode de vie qui élèvent le LDL, davantage que le cholestérol alimentaire lui-même. Les œufs peuvent être consommés avec mesure ; demandez conseil à votre médecin." },
  { q: "Le sport fait-il baisser le cholestérol ?", a: "L'activité physique régulière augmente surtout le « bon » cholestérol (HDL) et aide à perdre du poids, ce qui améliore le bilan global. Trente minutes de marche par jour sont un objectif accessible et efficace." },
];
const cholAlimTk = [
  "L'alimentation est le premier levier contre le « mauvais » cholestérol (LDL).",
  "Privilégier huile d'olive, poisson gras, légumineuses, fruits, légumes et fibres.",
  "Limiter fritures, charcuterie, beurre, pâtisseries et fromages gras.",
  "Bouger 30 min/jour augmente le « bon » cholestérol ; ces mesures complètent les statines.",
];

const cCholStatines = `<p>Les statines sont les médicaments les plus utilisés pour faire baisser le cholestérol. Souvent entourées d'idées reçues, elles protègent efficacement le cœur et les artères lorsqu'elles sont indiquées.</p>

<h2>À quoi servent-elles ?</h2>
<p>Les statines réduisent la fabrication de cholestérol par le foie, abaissant le <strong>LDL</strong>. Leur but n'est pas qu'un chiffre : c'est de <strong>prévenir l'infarctus et l'<a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a></strong> en freinant l'athérosclérose.</p>

<h2>Pour qui ?</h2>
<p>Elles sont prescrites selon le <strong>risque cardiovasculaire global</strong>, pas uniquement selon le taux de cholestérol : après un infarctus ou un AVC, en cas de <a href="/blog/diabete-type-2-maroc">diabète</a>, d'<a href="/blog/hypertension-arterielle-maroc">hypertension</a> ou de cholestérol très élevé.</p>

<h2>Et les effets secondaires ?</h2>
<p>Elles sont généralement bien tolérées. Des douleurs musculaires sont possibles mais moins fréquentes qu'on ne le croit ; elles doivent être signalées au médecin, qui peut adapter le traitement. Un contrôle sanguin est parfois réalisé.</p>

<h2>À vie ? Peut-on arrêter ?</h2>
<p>Le traitement est souvent au long cours, car il maintient le LDL bas et la protection. <strong>Ne jamais l'arrêter sans avis médical</strong>, même si le bilan s'est normalisé : c'est le traitement qui maintient ce résultat. L'<a href="/blog/cholesterol-alimentation-maroc">hygiène de vie</a> l'accompagne toujours.</p>

<h2>Les bons réflexes au quotidien</h2>
<p>Prenez votre statine chaque jour, à heure régulière, sans l'associer à un excès de pamplemousse (qui peut interagir). Signalez toute douleur musculaire inhabituelle, surtout si elle est diffuse ou intense. Poursuivez en parallèle l'hygiène de vie : le médicament et l'alimentation agissent ensemble. Un contrôle sanguin périodique vérifie l'efficacité et la bonne tolérance du traitement.</p>

<hr>
<p>Une statine à discuter ou à ajuster ? Sur SantéauMaroc, trouvez un cardiologue près de chez vous. Voir la fiche <a href="/blog/cholesterol-maroc">Cholestérol</a>.</p>`;
const cholStatinesFaq = [
  { q: "À quoi servent les statines ?", a: "Elles réduisent la fabrication de cholestérol par le foie et abaissent le « mauvais » cholestérol (LDL). Leur objectif principal est de prévenir l'infarctus et l'AVC en freinant l'athérosclérose, au-delà du simple chiffre du bilan." },
  { q: "Les statines donnent-elles des douleurs musculaires ?", a: "Des douleurs musculaires sont possibles mais moins fréquentes que ne le laisse croire leur réputation. Elles doivent être signalées au médecin, qui peut adapter la dose ou changer de traitement. La plupart des personnes les tolèrent bien." },
  { q: "Les statines sont-elles à prendre à vie ?", a: "Souvent oui, car elles maintiennent le LDL bas et la protection cardiovasculaire. Ne jamais les arrêter sans avis médical, même quand le bilan est bon : c'est justement le traitement qui maintient ce résultat." },
  { q: "Peut-on remplacer les statines par l'alimentation ?", a: "L'alimentation et l'activité physique sont essentielles et parfois suffisantes pour les excès modérés. Mais quand le risque est élevé, elles ne remplacent pas les statines : elles les complètent. Le médecin décide selon votre risque global." },
  { q: "Qui doit prendre une statine ?", a: "La décision dépend du risque cardiovasculaire global, pas seulement du taux de cholestérol : après un infarctus ou un AVC, en cas de diabète, d'hypertension ou de cholestérol très élevé. Votre médecin évalue ce risque et fixe l'objectif." },
];
const cholStatinesTk = [
  "Les statines abaissent le LDL pour prévenir l'infarctus et l'AVC.",
  "Elles sont prescrites selon le risque cardiovasculaire global, pas qu'un chiffre.",
  "Généralement bien tolérées ; signaler d'éventuelles douleurs musculaires au médecin.",
  "Ne pas les arrêter sans avis médical, même si le bilan s'est normalisé.",
];

const cCholBilan = `<p>Le bilan lipidique (ou EAL) est la prise de sang qui mesure votre cholestérol. Savoir lire ses grands paramètres aide à comprendre son risque — sans se substituer à l'interprétation du médecin.</p>

<h2>Que mesure le bilan ?</h2>
<ul>
<li><strong>Cholestérol total</strong></li>
<li><strong>LDL</strong> (« mauvais ») : à abaisser</li>
<li><strong>HDL</strong> (« bon ») : protecteur, mieux vaut qu'il soit élevé</li>
<li><strong><a href="/blog/triglycerides-eleves-maroc">Triglycérides</a></strong> : une autre graisse du sang</li>
</ul>

<h2>Faut-il être à jeun ?</h2>
<p>Le plus souvent, un jeûne de 12 heures est demandé, en particulier pour les triglycérides. Suivez la consigne de votre médecin ou du <a href="/blog/analyse-de-sang-maroc">laboratoire</a>.</p>

<h2>Quelle cible pour le LDL ?</h2>
<p>Il n'y a pas de seuil unique : la cible de LDL dépend de votre <strong>risque cardiovasculaire global</strong> (diabète, hypertension, tabac, antécédents). Un même chiffre peut être acceptable chez l'un et trop élevé chez l'autre.</p>

<h2>Comment interpréter ?</h2>
<p>Un HDL bas, un LDL ou des triglycérides élevés augmentent le risque. Mais seul le médecin met ces valeurs en perspective avec votre situation pour décider d'une prise en charge — alimentation, activité, ou <a href="/blog/cholesterol-statines-maroc">statine</a>.</p>

<h2>Quand et à quelle fréquence ?</h2>
<p>Un premier bilan est conseillé à partir de 40 ans, plus tôt en cas d'antécédents familiaux, de diabète, d'hypertension ou de tabagisme. La fréquence du suivi dépend ensuite du résultat et d'un éventuel traitement : de tous les ans à tous les quelques années. Votre médecin fixe le rythme adapté à votre risque cardiovasculaire.</p>

<hr>
<p>Un bilan lipidique à comprendre ? Sur SantéauMaroc, trouvez un médecin près de chez vous. Voir la fiche <a href="/blog/cholesterol-maroc">Cholestérol</a>.</p>`;
const cholBilanFaq = [
  { q: "Que contient un bilan lipidique ?", a: "Il mesure le cholestérol total, le LDL (« mauvais »), le HDL (« bon ») et les triglycérides. Ensemble, ces valeurs aident à estimer le risque cardiovasculaire et à guider la prise en charge." },
  { q: "Faut-il être à jeun pour un bilan lipidique ?", a: "Le plus souvent oui, avec un jeûne d'environ 12 heures, surtout pour un dosage fiable des triglycérides. Suivez la consigne précise de votre médecin ou du laboratoire, car les pratiques peuvent varier." },
  { q: "Quel est le bon taux de LDL ?", a: "Il n'existe pas de seuil unique : la cible de LDL est personnalisée selon votre risque cardiovasculaire global (diabète, hypertension, tabac, antécédents). Seul votre médecin fixe l'objectif adapté à votre situation." },
  { q: "Un cholestérol total normal est-il rassurant ?", a: "Pas toujours : le cholestérol total peut masquer un LDL élevé ou un HDL bas. C'est surtout le LDL, le HDL et les triglycérides, replacés dans votre risque global, qui comptent. Le médecin interprète l'ensemble." },
  { q: "À quelle fréquence faire un bilan lipidique ?", a: "Cela dépend de l'âge, du risque et d'un éventuel traitement. En général à partir de 40 ans, plus tôt en cas d'antécédents familiaux ou de facteurs de risque, puis selon les recommandations de votre médecin." },
];
const cholBilanTk = [
  "Le bilan lipidique mesure cholestérol total, LDL, HDL et triglycérides.",
  "Un jeûne d'environ 12 h est souvent demandé, surtout pour les triglycérides.",
  "La cible de LDL est personnalisée selon le risque cardiovasculaire global.",
  "Seul le médecin met les valeurs en perspective avec votre situation.",
];

const cTriglycerides = `<p>Les triglycérides sont, avec le cholestérol, l'une des graisses mesurées dans le sang. Élevés, ils augmentent le risque cardiovasculaire et, très élevés, celui de pancréatite. Ils sont très sensibles au mode de vie.</p>

<h2>Qu'est-ce que les triglycérides ?</h2>
<p>Ce sont des graisses apportées par l'alimentation et fabriquées par le foie, servant de réserve d'énergie. On les mesure dans le <a href="/blog/bilan-lipidique-maroc">bilan lipidique</a> ; un taux inférieur à 1,50 g/L est souhaitable.</p>

<h2>Pourquoi montent-ils ?</h2>
<ul>
<li>Excès de <strong>sucres</strong> et de boissons sucrées</li>
<li><strong>Alcool</strong>, surpoids, sédentarité</li>
<li><a href="/blog/diabete-type-2-maroc">Diabète</a> mal équilibré, hérédité</li>
</ul>

<h2>Quels risques ?</h2>
<p>Des triglycérides élevés participent au risque cardiovasculaire. Très élevés, ils exposent à une <strong>pancréatite</strong> (inflammation du pancréas), qui peut être grave.</p>

<h2>Comment les faire baisser ?</h2>
<ul>
<li>Réduire fortement les <strong>sucres rapides</strong>, les jus et sodas.</li>
<li>Limiter l'<strong>alcool</strong>, perdre du poids, bouger régulièrement.</li>
<li>Privilégier le poisson gras et les fibres.</li>
</ul>
<p>Ces mesures sont très efficaces ; un traitement est parfois ajouté, sur avis médical.</p>

<h2>Triglycérides et cœur</h2>
<p>Des triglycérides élevés vont souvent de pair avec un « bon » cholestérol (HDL) bas, un tour de taille élevé et un risque de diabète : c'est le « syndrome métabolique ». Cet ensemble augmente le risque cardiovasculaire. Agir sur les triglycérides — moins de sucre et d'alcool, plus d'activité physique — améliore donc tout ce profil, au-delà du seul chiffre.</p>

<hr>
<p>Des triglycérides élevés à corriger ? Sur SantéauMaroc, trouvez un médecin près de chez vous. Voir la fiche <a href="/blog/cholesterol-maroc">Cholestérol</a>.</p>`;
const triglyceridesFaq = [
  { q: "Qu'est-ce que les triglycérides ?", a: "Ce sont des graisses présentes dans le sang, apportées par l'alimentation et fabriquées par le foie, qui servent de réserve d'énergie. On les mesure dans le bilan lipidique ; un taux inférieur à 1,50 g/L est souhaitable." },
  { q: "Qu'est-ce qui fait monter les triglycérides ?", a: "Surtout l'excès de sucres et de boissons sucrées, l'alcool, le surpoids et la sédentarité, ainsi qu'un diabète mal équilibré et l'hérédité. Ce sont des paramètres très sensibles au mode de vie." },
  { q: "Comment faire baisser ses triglycérides ?", a: "En réduisant fortement les sucres rapides, les jus et sodas, en limitant l'alcool, en perdant du poids et en bougeant régulièrement. Le poisson gras et les fibres aident. Ces mesures sont très efficaces ; un traitement est parfois ajouté." },
  { q: "Des triglycérides élevés sont-ils dangereux ?", a: "Ils participent au risque cardiovasculaire. Lorsqu'ils sont très élevés, ils exposent à une pancréatite (inflammation du pancréas), qui peut être grave. Il est donc important de les corriger, sur les conseils de votre médecin." },
  { q: "Triglycérides et cholestérol, est-ce la même chose ?", a: "Non, ce sont deux graisses différentes du sang, mesurées ensemble dans le bilan lipidique. On peut avoir des triglycérides élevés avec un cholestérol normal, ou l'inverse. Le médecin interprète l'ensemble selon votre risque." },
];
const triglyceridesTk = [
  "Les triglycérides sont une graisse du sang mesurée avec le cholestérol.",
  "Ils montent surtout avec les sucres, l'alcool, le surpoids et la sédentarité.",
  "Élevés, ils augmentent le risque cardiovasculaire ; très élevés, celui de pancréatite.",
  "Réduire sucres et alcool, perdre du poids et bouger les fait nettement baisser.",
];

// ═══ AVC ══════════════════════════════════════════════════════════════════════
const cAvcSignes = `<p>Reconnaître un AVC en quelques secondes peut sauver une vie et éviter un handicap. Les signes apparaissent brutalement ; la règle « VITE » aide à les mémoriser et à réagir sans perdre une minute.</p>

<h2>La règle VITE</h2>
<ul>
<li><strong>V — Visage</strong> : la bouche se déforme, un côté du visage tombe.</li>
<li><strong>I — Incapacité</strong> : un bras (ou une jambe) ne peut plus se lever.</li>
<li><strong>T — Trouble de la parole</strong> : difficulté à parler ou à comprendre.</li>
<li><strong>E — En urgence</strong> : appelez immédiatement les secours.</li>
</ul>

<h2>Les autres signes</h2>
<p>Perte brutale de la vue, vertige intense avec troubles de l'équilibre, ou mal de tête violent et soudain « comme jamais ressenti ».</p>

<h2>Que faire immédiatement ?</h2>
<p>Appelez les secours (SAMU 141), notez l'<strong>heure d'apparition</strong> des signes, allongez la personne, ne lui donnez ni à boire ni à manger, et ne conduisez pas vous-même.</p>

<h2>Pourquoi agir aussi vite ?</h2>
<p>Chaque minute, des cellules du cerveau meurent. Les traitements qui débouchent l'artère n'agissent que dans une fenêtre de quelques heures : plus la prise en charge est rapide, plus le cerveau est préservé. Même transitoires, ces signes (voir <a href="/blog/ait-accident-ischemique-transitoire-maroc">AIT</a>) imposent d'appeler les secours.</p>

<h2>Noter l'heure : un réflexe qui change tout</h2>
<p>Retenez précisément l'heure d'apparition des premiers signes : elle conditionne les traitements possibles à l'hôpital, car déboucher l'artère n'est possible que dans une fenêtre de quelques heures. Ne donnez ni à boire ni à manger, n'attendez pas que « ça passe », et ne conduisez pas vous-même. Un seul réflexe : appeler les secours.</p>

<hr>
<p>Devant ces signes, appelez immédiatement les secours. Pour évaluer votre risque hors urgence, consultez un cardiologue sur SantéauMaroc. Voir la fiche <a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a>.</p>`;
const avcSignesFaq = [
  { q: "Quels sont les signes d'un AVC ?", a: "Ils apparaissent brutalement : déformation du visage, faiblesse d'un bras ou d'une jambe d'un côté, difficulté à parler ou à comprendre (règle VITE). Aussi : perte brutale de la vue, vertige intense, mal de tête violent et soudain." },
  { q: "Que signifie la règle VITE ?", a: "V pour Visage déformé, I pour Incapacité à lever un bras, T pour Trouble de la parole, E pour En urgence (appeler les secours). C'est un moyen simple de reconnaître un AVC et de réagir sans perdre de temps." },
  { q: "Que faire si je soupçonne un AVC ?", a: "Appeler immédiatement les secours (SAMU 141), noter l'heure d'apparition des signes, allonger la personne, ne rien lui donner à boire ni à manger, et ne pas conduire soi-même. La rapidité conditionne le pronostic." },
  { q: "Faut-il appeler les secours si les signes disparaissent ?", a: "Oui. Des signes qui disparaissent en quelques minutes peuvent être un accident ischémique transitoire (AIT), signal d'alarme majeur d'un AVC imminent. Il faut appeler les secours même si tout est rentré dans l'ordre." },
  { q: "Pourquoi faut-il agir très vite en cas d'AVC ?", a: "Parce que les cellules du cerveau meurent chaque minute et que les traitements qui débouchent l'artère n'agissent que dans une fenêtre de quelques heures. Plus la prise en charge est précoce, moins il y a de séquelles." },
];
const avcSignesTk = [
  "Les signes d'AVC sont brutaux : retenez « VITE » (Visage, Incapacité, Trouble parole, En urgence).",
  "Autres signes : perte brutale de la vue, vertige intense, mal de tête soudain violent.",
  "Appeler le SAMU (141), noter l'heure des signes, ne pas conduire soi-même.",
  "Même transitoires, ces signes imposent d'appeler les secours.",
];

const cAvcRecup = `<p>Après un AVC, la récupération dépend beaucoup de la rapidité de la prise en charge initiale et de la qualité de la rééducation. Beaucoup de patients retrouvent une autonomie satisfaisante ; l'accompagnement et la prévention d'une récidive sont essentiels.</p>

<h2>Les séquelles possibles</h2>
<p>Selon la zone du cerveau touchée : faiblesse ou paralysie d'un côté, troubles de la parole, de la déglutition, de l'équilibre, de la mémoire ou de l'humeur. Leur importance est très variable.</p>

<h2>La rééducation</h2>
<ul>
<li><strong>Kinésithérapie</strong> : récupérer force, mobilité et équilibre.</li>
<li><strong>Orthophonie</strong> : rééduquer la parole et la déglutition.</li>
<li>Ergothérapie et soutien psychologique selon les besoins.</li>
</ul>
<p>Commencée tôt et poursuivie régulièrement, la rééducation améliore nettement la récupération.</p>

<h2>Prévenir une récidive</h2>
<p>Après un AVC, le risque d'en refaire est réel : le contrôle strict des facteurs de risque est capital — <a href="/blog/hypertension-arterielle-maroc">tension</a>, <a href="/blog/diabete-type-2-maroc">diabète</a>, <a href="/blog/cholesterol-maroc">cholestérol</a>, arrêt du tabac, et parfois un traitement anticoagulant ou antiagrégant (voir <a href="/blog/avc-prevention-maroc">prévenir l'AVC</a>).</p>

<h2>Le soutien au quotidien</h2>
<p>L'entourage, les associations de patients et un suivi médical régulier jouent un grand rôle dans la reprise d'une vie la plus autonome possible.</p>

<h2>Le rôle des proches</h2>
<p>L'entourage joue un rôle majeur : encourager la rééducation, aider aux exercices du quotidien, veiller à la prise des traitements de prévention et soutenir le moral, car la dépression est fréquente après un AVC. Les associations de patients et un suivi médical régulier aident aussi la personne et sa famille à traverser cette étape.</p>

<hr>
<p>Après un AVC, un suivi rapproché est essentiel. Sur SantéauMaroc, trouvez un médecin ou un cardiologue près de chez vous. Voir la fiche <a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a>.</p>`;
const avcRecupFaq = [
  { q: "Peut-on récupérer complètement après un AVC ?", a: "La récupération est très variable selon la zone touchée et la rapidité de la prise en charge. Beaucoup de patients retrouvent une autonomie satisfaisante, surtout grâce à une rééducation commencée tôt et poursuivie régulièrement." },
  { q: "En quoi consiste la rééducation après un AVC ?", a: "Elle associe selon les besoins la kinésithérapie (force, mobilité, équilibre), l'orthophonie (parole, déglutition), l'ergothérapie et un soutien psychologique. Commencée précocement, elle améliore nettement la récupération." },
  { q: "Quels sont les risques après un premier AVC ?", a: "Le principal est la récidive. C'est pourquoi le contrôle strict des facteurs de risque (tension, diabète, cholestérol, tabac) et, parfois, un traitement anticoagulant ou antiagrégant sont essentiels après un AVC." },
  { q: "Combien de temps dure la rééducation ?", a: "Cela dépend des séquelles : de quelques semaines à plusieurs mois, parfois davantage. La régularité est déterminante. L'équipe médicale adapte les objectifs et la durée à la récupération de chaque personne." },
  { q: "Comment éviter un deuxième AVC ?", a: "En contrôlant strictement la tension, le diabète et le cholestérol, en arrêtant le tabac, en bougeant, et en suivant le traitement de prévention prescrit. Un pouls irrégulier (fibrillation) doit aussi être recherché et traité." },
];
const avcRecupTk = [
  "La récupération dépend de la rapidité initiale et de la qualité de la rééducation.",
  "Rééducation : kinésithérapie, orthophonie, ergothérapie, soutien psychologique.",
  "Après un AVC, prévenir la récidive est capital : contrôle des facteurs de risque.",
  "L'entourage et un suivi régulier favorisent le retour à l'autonomie.",
];

const cAvcPrev = `<p>La plupart des AVC sont évitables : ils résultent surtout de facteurs de risque que l'on peut contrôler. Agir dessus est la meilleure protection, avant comme après un premier accident.</p>

<h2>Le facteur n°1 : l'hypertension</h2>
<p>L'<a href="/blog/hypertension-arterielle-maroc">hypertension artérielle</a> est de loin le premier facteur de risque d'AVC. La dépister et la traiter est la mesure de prévention la plus efficace.</p>

<h2>Les autres facteurs à contrôler</h2>
<ul>
<li><a href="/blog/diabete-type-2-maroc">Diabète</a> et excès de <a href="/blog/cholesterol-maroc">cholestérol</a></li>
<li>Tabac et consommation excessive d'alcool</li>
<li>Surpoids, sédentarité</li>
<li><strong>Fibrillation auriculaire</strong> (trouble du rythme) : un pouls irrégulier doit être recherché et traité</li>
</ul>

<h2>Les bons réflexes</h2>
<ul>
<li>Faire contrôler sa tension, sa glycémie et son cholestérol.</li>
<li>Arrêter le tabac, limiter l'alcool et le sel.</li>
<li>Bouger régulièrement et maintenir un poids sain.</li>
</ul>

<h2>Après un AVC ou un AIT</h2>
<p>La prévention est encore plus stricte pour éviter la récidive, avec souvent un traitement (antiagrégant ou anticoagulant) et un contrôle rapproché des facteurs de risque. Un <a href="/blog/ait-accident-ischemique-transitoire-maroc">AIT</a> est un signal à ne jamais négliger.</p>

<h2>Faire le point avec son médecin</h2>
<p>À partir de 50 ans, ou plus tôt en cas de facteurs de risque, un bilan simple (tension, glycémie, cholestérol, pouls) permet de repérer et de corriger ce qui expose à l'AVC. C'est encore plus important en cas d'antécédents familiaux ou personnels. Prévenir coûte peu et évite beaucoup : ne remettez pas ce contrôle.</p>

<hr>
<p>Hypertendu, diabétique ou fumeur ? Faites évaluer votre risque d'AVC. Sur SantéauMaroc, trouvez un cardiologue près de chez vous. Voir la fiche <a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a>.</p>`;
const avcPrevFaq = [
  { q: "Comment prévenir un AVC ?", a: "En contrôlant les facteurs de risque : traiter l'hypertension (le facteur n°1), équilibrer le diabète et le cholestérol, arrêter le tabac, limiter l'alcool et le sel, bouger et maintenir un poids sain. Un trouble du rythme cardiaque doit aussi être recherché." },
  { q: "Quel est le principal facteur de risque d'AVC ?", a: "L'hypertension artérielle, de loin. La dépister et la traiter est la mesure de prévention la plus efficace contre l'AVC, avec le contrôle du diabète et du cholestérol et l'arrêt du tabac." },
  { q: "La fibrillation auriculaire augmente-t-elle le risque d'AVC ?", a: "Oui. Ce trouble du rythme favorise la formation de caillots pouvant migrer vers le cerveau. Un pouls irrégulier doit être recherché : lorsqu'une fibrillation est présente, un traitement anticoagulant réduit fortement le risque d'AVC." },
  { q: "Peut-on éviter un AVC quand on a des facteurs de risque ?", a: "Oui, en grande partie. Contrôler la tension, le diabète et le cholestérol, arrêter le tabac et adopter une bonne hygiène de vie réduisent nettement le risque. La prévention est efficace, avant comme après un premier accident." },
  { q: "Que faire après un AIT pour éviter un AVC ?", a: "Un AIT (mini-AVC) est un signal d'alarme majeur. Il impose un bilan urgent et une prévention stricte : traitement adapté (souvent antiagrégant ou anticoagulant) et contrôle rapproché de tous les facteurs de risque." },
];
const avcPrevTk = [
  "La plupart des AVC sont évitables en contrôlant les facteurs de risque.",
  "L'hypertension est le facteur n°1 : la traiter est la prévention la plus efficace.",
  "Contrôler aussi diabète et cholestérol, arrêter le tabac, bouger.",
  "Une fibrillation auriculaire doit être recherchée et traitée (anticoagulant).",
];

const cAit = `<p>L'accident ischémique transitoire (AIT), ou « mini-AVC », donne les mêmes signes qu'un AVC mais qui disparaissent en quelques minutes. Sans séquelle, il est pourtant un signal d'alarme majeur à ne jamais ignorer.</p>

<h2>Qu'est-ce qu'un AIT ?</h2>
<p>C'est une interruption <strong>brève et transitoire</strong> de la circulation dans une partie du cerveau. Les signes régressent totalement, le plus souvent en moins d'une heure, sans laisser de trace — mais le risque d'AVC dans les jours qui suivent est élevé.</p>

<h2>Les signes</h2>
<p>Identiques à ceux de l'<a href="/blog/avc-signes-reconnaitre-maroc">AVC</a> (règle VITE) : déformation du visage, faiblesse d'un côté, trouble de la parole, perte brutale de la vue — mais transitoires.</p>

<h2>Pourquoi c'est une urgence</h2>
<p>L'AIT annonce souvent un AVC imminent. Même si tout est rentré dans l'ordre, il faut <strong>appeler les secours (SAMU 141)</strong> et réaliser un bilan en urgence pour en trouver la cause et prévenir l'AVC.</p>

<h2>La prise en charge</h2>
<p>Le bilan recherche l'origine (artères, cœur, facteurs de risque). Un traitement (souvent antiagrégant ou anticoagulant) et le contrôle strict des facteurs de risque réduisent fortement le risque d'AVC (voir <a href="/blog/avc-prevention-maroc">prévenir l'AVC</a>).</p>

<h2>AIT ou AVC : quelle différence ?</h2>
<p>La différence tient à la durée et aux séquelles : dans l'AIT, les signes régressent complètement en quelques minutes à une heure, sans lésion durable ; dans l'AVC, ils persistent et laissent souvent des séquelles. Mais sur le moment, rien ne permet de les distinguer avec certitude : tout signe évocateur doit donc être traité comme une urgence.</p>

<hr>
<p>Des signes brefs évocateurs d'AVC ? Appelez les secours, même s'ils disparaissent. Voir la fiche <a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a>.</p>`;
const aitFaq = [
  { q: "Qu'est-ce qu'un AIT (mini-AVC) ?", a: "C'est une interruption brève de la circulation dans une partie du cerveau, donnant les mêmes signes qu'un AVC mais transitoires, régressant en quelques minutes sans séquelle. C'est un signal d'alarme majeur d'AVC imminent." },
  { q: "Un mini-AVC est-il grave s'il disparaît ?", a: "Oui, même s'il ne laisse pas de séquelle. L'AIT annonce souvent un AVC dans les jours qui suivent. Il impose d'appeler les secours et de réaliser un bilan en urgence pour prévenir cet AVC." },
  { q: "Que faire en cas d'AIT ?", a: "Appeler immédiatement les secours (SAMU 141), même si les signes ont disparu. Un bilan urgent recherche la cause, et un traitement associé au contrôle des facteurs de risque réduit fortement le risque d'AVC." },
  { q: "Quels sont les signes d'un AIT ?", a: "Les mêmes que l'AVC (règle VITE) : déformation du visage, faiblesse d'un côté, trouble de la parole, perte brutale de la vue — mais transitoires, disparaissant en quelques minutes à une heure." },
  { q: "Comment éviter un AVC après un AIT ?", a: "Par un bilan urgent pour trouver la cause, un traitement adapté (souvent antiagrégant ou anticoagulant) et un contrôle strict des facteurs de risque : tension, diabète, cholestérol, tabac, et recherche d'une fibrillation." },
];
const aitTk = [
  "L'AIT (« mini-AVC ») donne les signes d'un AVC, mais transitoires et sans séquelle.",
  "C'est un signal d'alarme majeur : le risque d'AVC dans les jours suivants est élevé.",
  "Même si tout rentre dans l'ordre, appeler les secours et faire un bilan urgent.",
  "Traitement + contrôle des facteurs de risque réduisent fortement le risque d'AVC.",
];

// ─────────────────────────────────────────────────────────────────────────────
// SATELLITES (pillarSlug => rattachement)
// ─────────────────────────────────────────────────────────────────────────────
const SATELLITES = [
  // ─── Cocon Asthme ───
  { pillarSlug: "asthme-maroc", categorySlug: "maladies-traitements", aboutEntity: "Asthme",
    slug: "asthme-crise-que-faire-maroc", title: "Crise d'asthme : que faire et comment réagir",
    excerpt: "Crise d'asthme : reconnaître les signes, les bons gestes, le traitement de secours et quand appeler les urgences. Un guide clair et rassurant, adapté au Maroc.",
    metaTitle: "Crise d'asthme : que faire et quand appeler les urgences | Maroc",
    metaDesc: "Crise d'asthme : reconnaître les signes, gestes immédiats, traitement de secours et signes de gravité qui imposent d'appeler les urgences. Guide clair adapté au Maroc.",
    readingTime: 5, content: cAsthmeCrise, keyTakeaways: asthmeCriseTk, faq: asthmeCriseFaq },
  { pillarSlug: "asthme-maroc", categorySlug: "maladies-traitements", aboutEntity: "Asthme",
    slug: "asthme-inhalateur-traitement-maroc", title: "Inhalateurs de l'asthme : fond, secours et bonne technique",
    excerpt: "Traitement de fond ou de secours, technique d'inhalation, chambre d'inhalation et erreurs à éviter : bien utiliser ses inhalateurs pour un asthme contrôlé, au Maroc.",
    metaTitle: "Inhalateurs de l'asthme : fond, secours et technique | Maroc",
    metaDesc: "Inhalateurs de l'asthme : différence fond/secours, bonne technique d'inhalation, chambre d'inhalation et erreurs fréquentes. Clés d'un asthme contrôlé, adapté au Maroc.",
    readingTime: 5, content: cAsthmeInhalateur, keyTakeaways: asthmeInhalateurTk, faq: asthmeInhalateurFaq },
  { pillarSlug: "asthme-maroc", categorySlug: "maladies-traitements", aboutEntity: "Asthme",
    slug: "asthme-enfant-maroc", title: "Asthme de l'enfant : reconnaître, traiter et accompagner",
    excerpt: "Asthme de l'enfant : symptômes parfois trompeurs, rôle du tabagisme passif, dispositifs adaptés, sport et scolarité, évolution. Un guide pour les parents, adapté au Maroc.",
    metaTitle: "Asthme de l'enfant : symptômes, traitement et sport | Maroc",
    metaDesc: "Asthme de l'enfant : symptômes (bronchites sifflantes), diagnostic, tabagisme passif, dispositifs adaptés, sport et scolarité, évolution. Guide pour les parents, au Maroc.",
    readingTime: 5, content: cAsthmeEnfant, keyTakeaways: asthmeEnfantTk, faq: asthmeEnfantFaq },
  { pillarSlug: "asthme-maroc", categorySlug: "maladies-traitements", aboutEntity: "Asthme allergique",
    slug: "asthme-allergique-maroc", title: "Asthme allergique : allergènes, éviction et désensibilisation",
    excerpt: "Asthme allergique : lien allergie-asthme, allergènes en cause, comment réduire l'exposition, bilan et désensibilisation. Un guide clair, adapté au Maroc.",
    metaTitle: "Asthme allergique : allergènes et éviction | Maroc",
    metaDesc: "Asthme allergique : lien avec l'allergie, allergènes (acariens, pollens, animaux), éviction, bilan allergologique et désensibilisation. Guide clair adapté au Maroc.",
    readingTime: 5, content: cAsthmeAllergique, keyTakeaways: asthmeAllergiqueTk, faq: asthmeAllergiqueFaq },

  // ─── Cocon Cholestérol ───
  { pillarSlug: "cholesterol-maroc", categorySlug: "maladies-traitements", aboutEntity: "Hypercholestérolémie",
    slug: "cholesterol-alimentation-maroc", title: "Alimentation anti-cholestérol : que manger au Maroc",
    excerpt: "Aliments à privilégier et à limiter, cuisine marocaine et bons réflexes : l'alimentation pour faire baisser le mauvais cholestérol (LDL), adaptée au Maroc.",
    metaTitle: "Alimentation anti-cholestérol au Maroc : que manger",
    metaDesc: "Alimentation anti-cholestérol : aliments à privilégier (huile d'olive, poisson, fibres) et à limiter (fritures, charcuterie), adaptés à la cuisine marocaine, pour baisser le LDL.",
    readingTime: 5, content: cCholAlim, keyTakeaways: cholAlimTk, faq: cholAlimFaq },
  { pillarSlug: "cholesterol-maroc", categorySlug: "maladies-traitements", aboutEntity: "Hypercholestérolémie",
    slug: "cholesterol-statines-maroc", title: "Statines : à quoi servent-elles vraiment ?",
    excerpt: "Statines : rôle, pour qui, effets secondaires (idées reçues) et traitement au long cours. Ce qu'il faut savoir pour protéger son cœur, au Maroc.",
    metaTitle: "Statines : à quoi servent-elles et pour qui ? | Maroc",
    metaDesc: "Statines contre le cholestérol : à quoi elles servent, pour qui, effets secondaires (douleurs musculaires), traitement à vie et pourquoi ne pas l'arrêter seul. Adapté au Maroc.",
    readingTime: 5, content: cCholStatines, keyTakeaways: cholStatinesTk, faq: cholStatinesFaq },
  { pillarSlug: "cholesterol-maroc", categorySlug: "maladies-traitements", aboutEntity: "Hypercholestérolémie",
    slug: "bilan-lipidique-maroc", title: "Bilan lipidique : comprendre ses résultats (LDL, HDL, triglycérides)",
    excerpt: "Bilan lipidique : ce qu'il mesure, à jeun ou non, cible de LDL personnalisée et comment interpréter LDL, HDL et triglycérides. Un guide clair, adapté au Maroc.",
    metaTitle: "Bilan lipidique : comprendre ses résultats | Maroc",
    metaDesc: "Bilan lipidique : cholestérol total, LDL, HDL, triglycérides, faut-il être à jeun, cible de LDL selon le risque et interprétation. Guide clair adapté au Maroc.",
    readingTime: 5, content: cCholBilan, keyTakeaways: cholBilanTk, faq: cholBilanFaq },
  { pillarSlug: "cholesterol-maroc", categorySlug: "maladies-traitements", aboutEntity: "Hypertriglycéridémie",
    slug: "triglycerides-eleves-maroc", title: "Triglycérides élevés : causes, risques et solutions",
    excerpt: "Triglycérides élevés : ce que c'est, pourquoi ils montent (sucre, alcool), les risques (dont la pancréatite) et comment les faire baisser. Un guide clair, adapté au Maroc.",
    metaTitle: "Triglycérides élevés : causes, risques et solutions | Maroc",
    metaDesc: "Triglycérides élevés : définition, causes (sucre, alcool, surpoids), risques cardiovasculaires et de pancréatite, et comment les faire baisser. Guide clair adapté au Maroc.",
    readingTime: 5, content: cTriglycerides, keyTakeaways: triglyceridesTk, faq: triglyceridesFaq },

  // ─── Cocon AVC ───
  { pillarSlug: "avc-accident-vasculaire-cerebral-maroc", categorySlug: "maladies-traitements", aboutEntity: "Accident vasculaire cérébral",
    slug: "avc-signes-reconnaitre-maroc", title: "Reconnaître un AVC : la règle VITE",
    excerpt: "Reconnaître un AVC en quelques secondes avec la règle VITE, les autres signes, que faire immédiatement et pourquoi chaque minute compte. Un guide qui peut sauver une vie.",
    metaTitle: "Reconnaître un AVC : la règle VITE | Maroc",
    metaDesc: "Reconnaître un AVC : la règle VITE (Visage, Incapacité, Trouble de la parole, En urgence), les autres signes et que faire immédiatement. Chaque minute compte — adapté au Maroc.",
    readingTime: 5, content: cAvcSignes, keyTakeaways: avcSignesTk, faq: avcSignesFaq },
  { pillarSlug: "avc-accident-vasculaire-cerebral-maroc", categorySlug: "maladies-traitements", aboutEntity: "Accident vasculaire cérébral",
    slug: "avc-recuperation-reeducation-maroc", title: "Après un AVC : récupération et rééducation",
    excerpt: "Après un AVC : séquelles possibles, rééducation (kiné, orthophonie), récupération, prévention de la récidive et soutien au quotidien. Un guide clair, adapté au Maroc.",
    metaTitle: "Après un AVC : récupération et rééducation | Maroc",
    metaDesc: "Après un AVC : séquelles possibles, rééducation (kinésithérapie, orthophonie), récupération, prévention de la récidive et soutien. Guide clair et rassurant, adapté au Maroc.",
    readingTime: 5, content: cAvcRecup, keyTakeaways: avcRecupTk, faq: avcRecupFaq },
  { pillarSlug: "avc-accident-vasculaire-cerebral-maroc", categorySlug: "maladies-traitements", aboutEntity: "Accident vasculaire cérébral",
    slug: "avc-prevention-maroc", title: "Prévenir l'AVC : les facteurs de risque à contrôler",
    excerpt: "Prévenir l'AVC : hypertension (facteur n°1), diabète, cholestérol, tabac, fibrillation et bons réflexes. La plupart des AVC sont évitables — guide adapté au Maroc.",
    metaTitle: "Prévenir l'AVC : les facteurs de risque à contrôler | Maroc",
    metaDesc: "Prévenir l'AVC : contrôler l'hypertension (facteur n°1), le diabète, le cholestérol, arrêter le tabac et rechercher une fibrillation. La plupart des AVC sont évitables, au Maroc.",
    readingTime: 5, content: cAvcPrev, keyTakeaways: avcPrevTk, faq: avcPrevFaq },
  { pillarSlug: "avc-accident-vasculaire-cerebral-maroc", categorySlug: "maladies-traitements", aboutEntity: "Accident ischémique transitoire",
    slug: "ait-accident-ischemique-transitoire-maroc", title: "AIT (mini-AVC) : un signal d'alarme à ne pas ignorer",
    excerpt: "L'accident ischémique transitoire (AIT) donne les signes d'un AVC mais transitoires. Pourquoi c'est une urgence même sans séquelle, et comment prévenir l'AVC. Adapté au Maroc.",
    metaTitle: "AIT (mini-AVC) : signes et urgence | Maroc",
    metaDesc: "AIT (accident ischémique transitoire, « mini-AVC ») : signes transitoires identiques à l'AVC, pourquoi c'est une urgence même sans séquelle et comment prévenir l'AVC. Au Maroc.",
    readingTime: 5, content: cAit, keyTakeaways: aitTk, faq: aitFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (slug) => {
    const c = cats.find((x) => x.slug === slug);
    if (!c) throw new Error(`Catégorie introuvable : ${slug}`);
    return c.id;
  };

  // Résoudre les piliers + s'assurer qu'ils restent racines (pillarId = null).
  const pillarSlugs = [...new Set(SATELLITES.map((s) => s.pillarSlug))];
  const pillarId = {};
  for (const slug of pillarSlugs) {
    const p = await prisma.post.update({ where: { slug }, data: { pillarId: null }, select: { id: true, slug: true } });
    pillarId[slug] = p.id;
    console.log(`◆ Pilier hub  /blog/${p.slug}`);
  }

  const now = new Date();
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
      create: { ...data, slug: art.slug, authorId: admin.id, status: "PUBLISHED", publishedAt: now },
      select: { slug: true },
    });
    console.log(`  ↳ satellite [${art.pillarSlug.split("-")[0]}] /blog/${post.slug}`);
  }

  console.log(`\nCocons : ${pillarSlugs.length} piliers densifiés, ${SATELLITES.length} satellites publiés.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
