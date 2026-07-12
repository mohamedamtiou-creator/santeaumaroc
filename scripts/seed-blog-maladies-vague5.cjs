require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 5 — Fiches « Maladie » de référence (piliers autonomes), même gabarit :
//   • Zona                 → dermatologie         maladies-traitements
//   • Cancer colorectal    → gastro-entérologie   maladies-traitements
//   • Sinusite             → médecine générale    maladies-traitements
//   • Calculs rénaux       → médecine générale    maladies-traitements
//   • Hémorroïdes          → gastro-entérologie   maladies-traitements
//   • Varices              → médecine générale    maladies-traitements
// Définition, causes, facteurs, symptômes, diagnostic, examens, complications,
// traitement, prévention, quand consulter + FAQ + À retenir. SEO/GEO/E-E-A-T.
// Idempotent (upsert + update complet). Mappings CTA dans lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. ZONA
// ─────────────────────────────────────────────────────────────────────────────
const cZona = `<p>Une douleur qui brûle d'un seul côté du corps, suivie d'une éruption de petites cloques en bande : c'est le zona. Cette maladie, causée par le réveil du virus de la varicelle, touche surtout les adultes après 50 ans. Traité tôt, il évolue bien ; négligé, il peut laisser des douleurs tenaces. Reconnaître les signes rapidement est essentiel.</p>

<h2>Qu'est-ce que le zona ?</h2>
<p>Le zona est dû à la <strong>réactivation du virus varicelle-zona</strong>. Après une varicelle (souvent dans l'enfance), ce virus reste endormi dans l'organisme. Des années plus tard, il peut se « réveiller » et se manifester le long d'un nerf, provoquant une éruption douloureuse <strong>d'un seul côté du corps</strong>, en bande.</p>

<h2>Qui est à risque ?</h2>
<ul>
<li><strong>L'âge</strong> : le risque augmente nettement après 50 ans.</li>
<li>Une <strong>baisse des défenses immunitaires</strong> (maladie, traitement, stress important, fatigue).</li>
<li>Il faut avoir eu la varicelle auparavant.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<p>Le zona débute souvent par des <strong>douleurs, brûlures ou picotements</strong> sur une zone de peau, avant même l'éruption. Apparaissent ensuite des <strong>rougeurs puis des vésicules</strong> (petites cloques) groupées, sur un seul côté, le plus souvent au niveau du thorax, mais aussi du visage. Les lésions sèchent en croûtes en une à deux semaines.</p>
<blockquote>Attention : un zona touchant le visage, en particulier autour de l'œil (zona ophtalmique), est une urgence — il peut menacer la vue. Consultez immédiatement. Dans tous les cas, un traitement antiviral est d'autant plus efficace qu'il est débuté tôt (idéalement dans les 72 heures).</blockquote>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Le diagnostic est <strong>clinique</strong> : l'aspect et la localisation caractéristiques des lésions suffisent le plus souvent au médecin, sans examen complémentaire.</p>

<h2>Quelles complications ?</h2>
<p>La complication la plus fréquente est la <strong>douleur post-zostérienne</strong> : des douleurs qui persistent des semaines ou des mois après la guérison de l'éruption, surtout chez la personne âgée. Le zona ophtalmique peut, lui, laisser des séquelles oculaires.</p>

<h2>Comment traite-t-on le zona ?</h2>
<ul>
<li><strong>Antiviraux</strong>, d'autant plus utiles qu'ils sont commencés tôt, surtout après 50 ans ou en cas de zona du visage.</li>
<li><strong>Antalgiques</strong> pour soulager la douleur, parfois des traitements spécifiques des douleurs nerveuses.</li>
<li>Soins locaux des lésions pour éviter la surinfection.</li>
</ul>
<p>Un <strong>vaccin</strong> contre le zona existe et peut être proposé aux personnes âgées pour réduire le risque et la gravité.</p>

<h2>Le zona est-il contagieux ?</h2>
<p>Le zona lui-même ne « s'attrape » pas, mais le liquide des vésicules contient le virus : une personne n'ayant jamais eu la varicelle (enfant, femme enceinte non immunisée) peut, à ce contact, développer une varicelle. Il faut donc couvrir les lésions et éviter ces contacts jusqu'à la formation des croûtes.</p>

<h2>Zona : quand consulter ?</h2>
<p>Consultez rapidement dès les premiers signes, pour débuter le traitement à temps — et en urgence en cas d'atteinte du visage ou de l'œil. Le <a href="/specialites/medecine-generale">médecin généraliste</a> ou le <a href="/specialites/dermatologie">dermatologue</a> pose le diagnostic et instaure le traitement.</p>

<hr>
<p>Une éruption douloureuse d'un seul côté ? Consultez vite. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const zonaFaq = [
  { q: "Qu'est-ce qui provoque un zona ?", a: "Le zona est dû à la réactivation du virus de la varicelle, resté endormi dans l'organisme après une varicelle ancienne. Il se réveille souvent à la faveur de l'âge, d'une baisse des défenses immunitaires, d'une maladie ou d'un stress important." },
  { q: "Le zona est-il contagieux ?", a: "Le zona ne se transmet pas comme tel, mais le liquide des vésicules contient le virus : une personne n'ayant jamais eu la varicelle peut développer une varicelle à ce contact. Il faut couvrir les lésions et éviter les contacts à risque jusqu'aux croûtes." },
  { q: "Combien de temps dure un zona ?", a: "L'éruption sèche en croûtes en une à deux semaines. La douleur peut toutefois persister plus longtemps, en particulier chez la personne âgée (douleurs post-zostériennes), parfois durant des semaines ou des mois." },
  { q: "Le zona de l'œil est-il grave ?", a: "Oui, le zona ophtalmique (autour de l'œil) est une urgence, car il peut menacer la vue. Il faut consulter immédiatement pour un traitement rapide et un avis ophtalmologique." },
  { q: "Existe-t-il un vaccin contre le zona ?", a: "Oui, un vaccin contre le zona existe et peut être proposé aux personnes âgées pour réduire le risque de zona et de douleurs persistantes. Parlez-en à votre médecin pour savoir s'il vous est recommandé." },
  { q: "Pourquoi traiter le zona rapidement ?", a: "Parce que le traitement antiviral est d'autant plus efficace qu'il est débuté tôt, idéalement dans les 72 heures suivant l'éruption. Un traitement précoce réduit la durée, la gravité et le risque de douleurs persistantes." },
];
const zonaTakeaways = [
  "Le zona est la réactivation du virus de la varicelle, avec une éruption douloureuse d'un seul côté.",
  "Le risque augmente après 50 ans et en cas de baisse des défenses immunitaires.",
  "Le traitement antiviral est d'autant plus efficace qu'il est débuté tôt (dans les 72 heures).",
  "Un zona du visage ou de l'œil est une urgence pouvant menacer la vue.",
  "Complication fréquente : des douleurs persistantes après la guérison, surtout chez le sujet âgé.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. CANCER COLORECTAL
// ─────────────────────────────────────────────────────────────────────────────
const cCancerColorectal = `<p>Le cancer colorectal (du côlon ou du rectum) est l'un des cancers les plus fréquents, mais aussi l'un de ceux que l'on peut le mieux prévenir et guérir. Il se développe lentement, souvent à partir d'un petit polype, sur plusieurs années — ce qui laisse le temps de le dépister avant qu'il ne devienne dangereux. Le dépistage sauve des vies.</p>

<h2>Qu'est-ce que le cancer colorectal ?</h2>
<p>C'est une tumeur maligne qui se développe dans la paroi du <strong>côlon</strong> ou du <strong>rectum</strong> (le gros intestin). Il naît le plus souvent à partir d'un <strong>polype</strong>, petite excroissance bénigne qui peut, avec le temps, se transformer en cancer. Détecter et retirer ces polypes empêche l'apparition du cancer.</p>

<h2>Quels sont les facteurs de risque ?</h2>
<ul>
<li><strong>Âge</strong> : le risque augmente après 50 ans.</li>
<li><strong>Antécédents</strong> familiaux ou personnels de cancer colorectal ou de polypes.</li>
<li><strong>Alimentation</strong> riche en viande rouge et charcuterie, pauvre en fibres.</li>
<li><strong>Surpoids, sédentarité, tabac, alcool</strong>.</li>
<li>Certaines <strong>maladies inflammatoires</strong> chroniques de l'intestin.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<p>Au début, il n'y en a souvent aucun — d'où l'intérêt du dépistage. Plus tard peuvent apparaître :</p>
<ul>
<li><strong>Sang dans les selles</strong> ou selles noires</li>
<li><strong>Changement du transit</strong> récent et durable (diarrhée, constipation, alternance)</li>
<li>Douleurs abdominales, envie d'aller à la selle sans y parvenir</li>
<li>Fatigue, <a href="/blog/anemie-maroc">anémie</a>, amaigrissement inexpliqué</li>
</ul>

<h2>Le dépistage : l'arme la plus efficace</h2>
<p>Le dépistage permet de détecter la maladie tôt, voire d'empêcher son apparition en retirant les polypes :</p>
<ul>
<li><strong>Test de recherche de sang dans les selles</strong> : simple, à faire chez soi, recommandé à partir de 50 ans en l'absence de risque particulier.</li>
<li><strong>Coloscopie</strong> : examen de référence qui explore tout le côlon, permet de retirer les polypes et de faire des prélèvements.</li>
</ul>

<h2>Comment fait-on le diagnostic ?</h2>
<p>La <strong>coloscopie</strong> avec biopsie confirme le diagnostic. Un bilan d'extension (imagerie) précise ensuite le stade de la maladie pour adapter le traitement.</p>

<h2>Quels traitements ?</h2>
<p>Le traitement dépend du stade et associe, selon les cas, <strong>chirurgie</strong> (souvent le socle), <strong>chimiothérapie</strong> et <strong>radiothérapie</strong> (surtout pour le rectum). Détecté tôt, le cancer colorectal se guérit dans une large majorité des cas.</p>

<h2>Comment réduire son risque ?</h2>
<ul>
<li>Se faire dépister dès 50 ans (plus tôt en cas d'antécédents familiaux).</li>
<li>Manger plus de fibres (fruits, légumes, légumineuses), moins de viande rouge et de charcuterie.</li>
<li>Bouger régulièrement, maintenir un poids sain, limiter tabac et alcool.</li>
</ul>

<h2>Cancer colorectal : quand consulter ?</h2>
<p>Consultez devant tout sang dans les selles, un changement durable du transit, une anémie ou un amaigrissement inexpliqué — et pour organiser votre dépistage à partir de 50 ans. Le <a href="/specialites/medecine-generale">médecin généraliste</a> vous oriente vers un <a href="/specialites/gastro-enterologie">gastro-entérologue</a> pour la coloscopie.</p>

<hr>
<p>Le dépistage sauve des vies. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const cancerColorectalFaq = [
  { q: "Quels sont les premiers signes du cancer colorectal ?", a: "Au début, souvent aucun. Plus tard : du sang dans les selles, un changement durable du transit (diarrhée, constipation), des douleurs abdominales, une fatigue avec anémie ou un amaigrissement inexpliqué. D'où l'importance du dépistage avant les symptômes." },
  { q: "À partir de quel âge se faire dépister ?", a: "Dès 50 ans en l'absence de risque particulier, par un test de recherche de sang dans les selles. Plus tôt en cas d'antécédents familiaux de cancer colorectal ou de polypes. Votre médecin adapte la stratégie à votre situation." },
  { q: "Le cancer colorectal se guérit-il ?", a: "Oui, dans une large majorité des cas lorsqu'il est détecté tôt. C'est même l'un des cancers les plus curables et les plus évitables, car retirer les polypes lors d'une coloscopie empêche son apparition." },
  { q: "Qu'est-ce qu'un polype et est-ce grave ?", a: "Un polype est une petite excroissance bénigne de la paroi du côlon. La plupart ne deviennent jamais cancéreux, mais certains peuvent se transformer avec le temps. Les retirer lors d'une coloscopie prévient le cancer." },
  { q: "En quoi consiste le test de dépistage ?", a: "C'est un test simple à réaliser chez soi, qui recherche des traces de sang invisibles dans les selles. S'il est positif, une coloscopie est proposée pour en trouver la cause. Il est recommandé tous les deux ans à partir de 50 ans." },
  { q: "L'alimentation influence-t-elle le risque ?", a: "Oui. Une alimentation riche en viande rouge et charcuterie et pauvre en fibres augmente le risque, tout comme le surpoids, la sédentarité, le tabac et l'alcool. Plus de fibres et d'activité physique contribuent à le réduire." },
];
const cancerColorectalTakeaways = [
  "Le cancer colorectal se développe lentement, souvent à partir d'un polype : il est très dépistable.",
  "Il est longtemps silencieux ; sang dans les selles et transit modifié doivent alerter.",
  "Le dépistage dès 50 ans (test de selles, coloscopie) permet de le prévenir ou de le guérir.",
  "Détecté tôt, il se guérit dans une large majorité des cas.",
  "Prévention : plus de fibres, moins de viande rouge, activité physique, moins de tabac et d'alcool.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. SINUSITE
// ─────────────────────────────────────────────────────────────────────────────
const cSinusite = `<p>Nez bouché, pesanteur du visage, douleur qui augmente quand on se penche en avant : la sinusite est une inflammation très fréquente, le plus souvent bénigne et d'origine virale. Elle guérit généralement seule, mais certains signes doivent faire consulter. Voici comment la reconnaître et la soulager.</p>

<h2>Qu'est-ce que la sinusite ?</h2>
<p>Les sinus sont des cavités creuses situées dans les os du visage, autour du nez. La <strong>sinusite</strong> est leur inflammation, souvent dans les suites d'un rhume. On distingue la sinusite <strong>aiguë</strong> (passagère) de la sinusite <strong>chronique</strong> (qui dure ou récidive).</p>

<h2>Quelles sont les causes ?</h2>
<ul>
<li><strong>Infection virale</strong> (rhume) : de loin la plus fréquente.</li>
<li><strong>Surinfection bactérienne</strong> : plus rare, à évoquer si les symptômes s'aggravent ou se prolongent.</li>
<li><strong>Allergie</strong> (voir notre fiche sur les <a href="/blog/allergie-maroc">allergies</a>), pollution, problème dentaire.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li><strong>Nez bouché</strong> et écoulement (clair puis parfois épais)</li>
<li><strong>Douleur ou pesanteur du visage</strong> (front, joues), augmentée en penchant la tête</li>
<li>Maux de tête, parfois fièvre, baisse de l'odorat</li>
</ul>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Le diagnostic est <strong>clinique</strong>. Aucune imagerie n'est nécessaire pour une sinusite aiguë simple. Un scanner ou un avis ORL peuvent être utiles en cas de sinusite chronique, récidivante ou compliquée.</p>
<blockquote>Attention : consultez sans délai en cas de gonflement ou de rougeur autour d'un œil, de troubles de la vision, de maux de tête très violents, de fièvre élevée ou de raideur de la nuque. Ces signes rares peuvent traduire une complication grave.</blockquote>

<h2>Comment soulager une sinusite ?</h2>
<p>La plupart des sinusites virales guérissent en quelques jours avec des mesures simples :</p>
<ul>
<li><strong>Lavages de nez</strong> au sérum physiologique ou à l'eau de mer.</li>
<li><strong>Antalgiques</strong> contre la douleur et la fièvre.</li>
<li>Bonne hydratation, inhalations.</li>
</ul>
<p>Les <strong>antibiotiques</strong> ne sont utiles que dans les formes bactériennes ou qui se prolongent, sur prescription. En cas d'allergie, son traitement prévient les récidives.</p>

<h2>Sinusite : quand consulter ?</h2>
<p>Consultez si les symptômes durent plus de 10 jours, s'aggravent après une amélioration, s'accompagnent d'une fièvre élevée, ou en cas de sinusites à répétition. Le <a href="/specialites/medecine-generale">médecin généraliste</a> évalue et oriente vers un ORL si nécessaire. Les signes de gravité imposent une consultation en urgence.</p>

<hr>
<p>Une sinusite qui traîne ou revient souvent ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const sinusiteFaq = [
  { q: "Combien de temps dure une sinusite ?", a: "Une sinusite aiguë virale guérit le plus souvent en 7 à 10 jours. Si les symptômes durent plus longtemps, s'aggravent après une amélioration ou s'accompagnent d'une forte fièvre, il faut consulter, car une surinfection bactérienne est possible." },
  { q: "Faut-il des antibiotiques pour une sinusite ?", a: "Pas dans la majorité des cas, car la sinusite est surtout virale et guérit seule. Les antibiotiques sont réservés aux formes bactériennes ou qui se prolongent, sur prescription médicale. Les lavages de nez et les antalgiques sont la base du soulagement." },
  { q: "Comment soulager une sinusite naturellement ?", a: "Par des lavages de nez réguliers au sérum physiologique ou à l'eau de mer, une bonne hydratation, des inhalations et des antalgiques contre la douleur. Ces mesures suffisent souvent pour une sinusite virale." },
  { q: "Quelle est la différence entre un rhume et une sinusite ?", a: "Le rhume touche surtout le nez et dure quelques jours. La sinusite ajoute une douleur ou une pesanteur du visage, augmentée en penchant la tête, et peut se prolonger. Une sinusite fait souvent suite à un rhume." },
  { q: "Quand une sinusite est-elle grave ?", a: "C'est rare, mais un gonflement ou une rougeur autour de l'œil, des troubles de la vision, des maux de tête très violents, une fièvre élevée ou une raideur de la nuque imposent une consultation en urgence." },
  { q: "Pourquoi ai-je des sinusites à répétition ?", a: "Des sinusites récidivantes peuvent être favorisées par une allergie, une déviation de la cloison nasale, des polypes ou un problème dentaire. Un avis ORL permet d'en rechercher la cause et de proposer un traitement adapté." },
];
const sinusiteTakeaways = [
  "La sinusite est une inflammation des sinus, le plus souvent virale et bénigne.",
  "Signes typiques : nez bouché, pesanteur du visage augmentée en se penchant, maux de tête.",
  "La plupart guérissent seules : lavages de nez et antalgiques suffisent souvent.",
  "Les antibiotiques ne sont utiles que dans les formes bactériennes ou prolongées.",
  "Gonflement autour de l'œil, troubles visuels ou forte fièvre : consulter en urgence.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. CALCULS RÉNAUX
// ─────────────────────────────────────────────────────────────────────────────
const cCalculs = `<p>Une douleur soudaine et intense dans le bas du dos, qui irradie vers le ventre et ne laisse aucun répit : c'est souvent la colique néphrétique, provoquée par un calcul rénal. Fréquents, favorisés par le manque d'eau et la chaleur, les calculs urinaires se traitent bien et, surtout, se préviennent.</p>

<h2>Qu'est-ce qu'un calcul rénal ?</h2>
<p>Un calcul (ou « pierre ») est un petit agrégat solide qui se forme dans les reins à partir de substances présentes dans l'urine. Tant qu'il reste dans le rein, il peut être indolore. La douleur violente survient quand il se déplace et <strong>bloque l'uretère</strong>, le canal qui mène à la vessie : c'est la <strong>colique néphrétique</strong>.</p>

<h2>Quelles sont les causes et les facteurs ?</h2>
<ul>
<li><strong>Manque d'hydratation</strong> : le principal facteur, aggravé par la chaleur.</li>
<li><strong>Alimentation</strong> trop riche en sel, en protéines animales ou en certains aliments.</li>
<li><strong>Hérédité</strong>, antécédents de calculs.</li>
<li>Certaines maladies et infections urinaires.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li><strong>Douleur lombaire brutale et intense</strong>, d'un côté, irradiant vers le bas-ventre et les organes génitaux</li>
<li>Agitation (impossible de trouver une position antalgique), nausées, vomissements</li>
<li><strong>Sang dans les urines</strong>, envies fréquentes d'uriner</li>
</ul>
<blockquote>Attention : une colique néphrétique accompagnée de <strong>fièvre et de frissons</strong> est une urgence — elle peut signaler une infection de l'urine bloquée en amont du calcul. De même, l'impossibilité d'uriner impose une consultation en urgence.</blockquote>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Il repose sur l'<strong>imagerie</strong> (échographie, scanner) qui localise le calcul et évalue son retentissement, complétée par une analyse d'urine et de sang. L'analyse du calcul, une fois éliminé, aide à prévenir les récidives.</p>

<h2>Comment traite-t-on les calculs ?</h2>
<ul>
<li><strong>En crise</strong> : antalgiques puissants et hydratation ; beaucoup de petits calculs s'éliminent spontanément dans les urines.</li>
<li><strong>Si le calcul est trop gros ou bloquant</strong> : gestes spécialisés en urologie (fragmentation par ondes de choc, endoscopie).</li>
<li><strong>En cas d'infection ou de blocage</strong> : prise en charge urgente.</li>
</ul>

<h2>Comment prévenir les calculs ?</h2>
<ul>
<li><strong>Boire abondamment</strong> (au moins 1,5 à 2 litres d'eau par jour) : la mesure la plus efficace, encore plus en été.</li>
<li>Réduire le sel et adapter l'alimentation selon le type de calcul.</li>
<li>Traiter les facteurs favorisants identifiés par le médecin.</li>
</ul>

<h2>Calculs rénaux : quand consulter ?</h2>
<p>Consultez en urgence en cas de colique néphrétique fébrile ou d'impossibilité d'uriner. En dehors de l'urgence, le <a href="/specialites/medecine-generale">médecin généraliste</a> organise le bilan et oriente vers un urologue si besoin, notamment pour prévenir les récidives.</p>

<hr>
<p>Des douleurs évocatrices ou des calculs à répétition ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const calculsFaq = [
  { q: "Comment reconnaître une colique néphrétique ?", a: "Par une douleur brutale et très intense dans le bas du dos, d'un seul côté, qui irradie vers le ventre et les organes génitaux, sans position soulageante. Elle s'accompagne souvent de nausées, d'agitation et parfois de sang dans les urines." },
  { q: "Comment se forment les calculs rénaux ?", a: "Ils se forment dans les reins à partir de substances présentes dans l'urine qui cristallisent, surtout quand l'urine est trop concentrée. Le manque d'hydratation, la chaleur, une alimentation trop salée ou riche en protéines et l'hérédité favorisent leur apparition." },
  { q: "Comment évacuer un calcul rénal ?", a: "Beaucoup de petits calculs s'éliminent spontanément en buvant abondamment, avec des antalgiques pour la douleur. Les calculs plus gros ou bloquants nécessitent des gestes spécialisés en urologie (ondes de choc, endoscopie)." },
  { q: "Comment éviter les calculs rénaux ?", a: "En buvant beaucoup d'eau (au moins 1,5 à 2 litres par jour), encore plus en été, en réduisant le sel et en adaptant son alimentation selon le type de calcul. L'analyse d'un calcul éliminé aide le médecin à personnaliser la prévention." },
  { q: "Une colique néphrétique est-elle une urgence ?", a: "La douleur seule justifie une prise en charge rapide, mais devient une urgence si elle s'accompagne de fièvre et de frissons (risque d'infection) ou d'une impossibilité d'uriner. Il faut alors consulter sans attendre." },
  { q: "Les calculs rénaux récidivent-ils ?", a: "Oui, les récidives sont fréquentes. C'est pourquoi, après un calcul, un bilan et des mesures de prévention (hydratation, alimentation) sont importants pour réduire le risque d'en refaire." },
];
const calculsTakeaways = [
  "Un calcul rénal peut être indolore tant qu'il reste dans le rein ; la douleur survient s'il bloque l'uretère.",
  "La colique néphrétique est une douleur lombaire brutale et intense, sans position soulageante.",
  "Le manque d'hydratation et la chaleur sont les principaux facteurs favorisants.",
  "Colique avec fièvre ou impossibilité d'uriner = urgence.",
  "Prévention n°1 : boire abondamment (1,5 à 2 litres d'eau par jour), surtout en été.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. HÉMORROÏDES
// ─────────────────────────────────────────────────────────────────────────────
const cHemorroides = `<p>Sujet gênant dont on parle peu, les hémorroïdes sont pourtant très fréquentes et le plus souvent bénignes. Saignement à la selle, douleur, gêne : ces symptômes se soulagent bien. Mais un principe reste essentiel : tout saignement doit être évalué par un médecin, pour ne pas passer à côté d'une autre cause.</p>

<h2>Qu'est-ce que les hémorroïdes ?</h2>
<p>Les hémorroïdes sont des <strong>veines</strong> normalement présentes au niveau de l'anus et du rectum. On parle de « maladie hémorroïdaire » lorsqu'elles se dilatent, s'enflamment ou forment un caillot, provoquant des symptômes. C'est une affection courante et bénigne.</p>

<h2>Quelles sont les causes et les facteurs ?</h2>
<ul>
<li><strong>Constipation</strong> et efforts de poussée à la selle.</li>
<li><strong>Grossesse</strong> et accouchement.</li>
<li>Position assise prolongée, sédentarité.</li>
<li>Hérédité, repas très épicés, surpoids.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li><strong>Saignement</strong> de sang rouge vif au moment de la selle (sur le papier ou dans la cuvette)</li>
<li><strong>Douleur, gêne, démangeaisons</strong> de la région anale</li>
<li>Parfois une <strong>tuméfaction</strong> (boule) douloureuse en cas de caillot</li>
</ul>
<blockquote>Attention : ne mettez jamais un saignement « sur le compte des hémorroïdes » sans avis médical. D'autres causes, dont le <a href="/blog/cancer-colorectal-maroc">cancer colorectal</a>, peuvent saigner. Un examen s'impose, surtout après 50 ans ou en cas de changement du transit.</blockquote>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Le médecin réalise un <strong>examen de la région anale</strong>, simple, qui confirme le diagnostic. Selon l'âge et les symptômes, un examen complémentaire (anuscopie, voire coloscopie) est proposé pour écarter une autre cause de saignement.</p>

<h2>Comment soulager les hémorroïdes ?</h2>
<ul>
<li><strong>Régulariser le transit</strong> : plus de fibres, bonne hydratation, éviter les efforts de poussée — c'est la mesure de base.</li>
<li><strong>Traitements locaux</strong> (crèmes, suppositoires) et veinotoniques pour soulager les crises.</li>
<li><strong>Gestes spécialisés ou chirurgie</strong> pour les formes rebelles ou sévères.</li>
</ul>

<h2>Comment les prévenir ?</h2>
<ul>
<li>Lutter contre la constipation (fibres, eau, activité physique).</li>
<li>Éviter de rester trop longtemps aux toilettes et de forcer.</li>
<li>Limiter la station assise prolongée.</li>
</ul>

<h2>Hémorroïdes : quand consulter ?</h2>
<p>Consultez en cas de saignement, de douleur persistante ou de gêne, et systématiquement pour faire vérifier l'origine d'un saignement. Le <a href="/specialites/medecine-generale">médecin généraliste</a> évalue et oriente si besoin vers un <a href="/specialites/gastro-enterologie">gastro-entérologue</a> (proctologue).</p>

<hr>
<p>Des symptômes gênants ou un saignement à faire vérifier ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const hemorroidesFaq = [
  { q: "Comment reconnaître des hémorroïdes ?", a: "Les signes typiques sont un saignement de sang rouge vif au moment de la selle, une douleur, des démangeaisons ou une gêne anale, parfois une petite boule douloureuse. Seul un examen médical confirme le diagnostic et écarte une autre cause." },
  { q: "Les hémorroïdes sont-elles dangereuses ?", a: "Elles sont bénignes et n'évoluent pas en cancer. Le danger serait d'attribuer à tort un saignement aux hémorroïdes alors qu'il a une autre origine. Tout saignement doit donc être évalué par un médecin, surtout après 50 ans." },
  { q: "Comment soulager une crise hémorroïdaire ?", a: "En régularisant le transit (fibres, eau, éviter de forcer), avec des traitements locaux (crèmes, suppositoires) et des veinotoniques pour la douleur. Les formes rebelles ou sévères relèvent de gestes spécialisés ou d'une chirurgie." },
  { q: "La grossesse favorise-t-elle les hémorroïdes ?", a: "Oui, la grossesse et l'accouchement favorisent les hémorroïdes, en raison de la pression et des changements circulatoires. Elles régressent souvent après, et des traitements adaptés à la grossesse existent : parlez-en à votre médecin." },
  { q: "Un saignement anal est-il toujours dû aux hémorroïdes ?", a: "Non. Même si les hémorroïdes en sont une cause fréquente, un saignement peut avoir d'autres origines, dont le cancer colorectal. C'est pourquoi il ne faut jamais banaliser un saignement et toujours le faire évaluer médicalement." },
  { q: "Comment éviter les hémorroïdes ?", a: "En luttant contre la constipation (alimentation riche en fibres, bonne hydratation, activité physique), en évitant de forcer et de rester trop longtemps aux toilettes, et en limitant la position assise prolongée." },
];
const hemorroidesTakeaways = [
  "Les hémorroïdes sont des veines dilatées de l'anus ; la maladie hémorroïdaire est fréquente et bénigne.",
  "Symptômes : saignement rouge vif à la selle, douleur, gêne, parfois une boule.",
  "Constipation, grossesse et position assise prolongée les favorisent.",
  "Traitement : régulariser le transit, traitements locaux, gestes spécialisés si besoin.",
  "Ne jamais attribuer un saignement aux hémorroïdes sans avis médical.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. VARICES
// ─────────────────────────────────────────────────────────────────────────────
const cVarices = `<p>Jambes lourdes en fin de journée, chevilles gonflées, veines apparentes et sinueuses : les varices sont le signe visible d'une insuffisance veineuse, très fréquente, surtout chez la femme. Souvent considérées comme un simple problème esthétique, elles peuvent pourtant se compliquer. Bien prises en charge, elles restent bénignes.</p>

<h2>Qu'est-ce que les varices ?</h2>
<p>Les veines des jambes ramènent le sang vers le cœur, aidées par de petites valves qui empêchent le sang de redescendre. Quand ces valves fonctionnent mal, le sang stagne : les veines se dilatent et deviennent visibles et tortueuses. C'est l'<strong>insuffisance veineuse chronique</strong>, dont les varices sont la manifestation.</p>

<h2>Quels sont les facteurs de risque ?</h2>
<ul>
<li><strong>Hérédité</strong> et <strong>sexe féminin</strong>.</li>
<li><strong>Grossesses</strong>, variations hormonales.</li>
<li><strong>Âge</strong>, <strong>station debout prolongée</strong> (métiers concernés).</li>
<li><strong>Surpoids</strong>, sédentarité, chaleur.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li><strong>Jambes lourdes</strong>, douloureuses, surtout en fin de journée et par temps chaud</li>
<li><strong>Gonflement des chevilles</strong> (œdème) le soir</li>
<li><strong>Veines dilatées</strong> et visibles, démangeaisons, crampes nocturnes</li>
</ul>

<h2>Comment fait-on le diagnostic ?</h2>
<p>L'examen clinique suffit souvent. L'<strong>écho-doppler</strong> des veines des jambes précise le fonctionnement veineux et guide le traitement, surtout avant un geste.</p>
<blockquote>Attention : une douleur d'un mollet, avec rougeur, chaleur et gonflement, doit faire évoquer une <strong>phlébite</strong> (caillot dans une veine profonde) — une urgence, car elle peut se compliquer. Consultez sans attendre.</blockquote>

<h2>Quelles complications ?</h2>
<p>Non prises en charge, les varices peuvent entraîner un œdème persistant, des troubles de la peau (coloration, eczéma), voire un <strong>ulcère variqueux</strong> (plaie de jambe qui cicatrise mal). Une varice peut aussi se compliquer d'inflammation ou de saignement.</p>

<h2>Comment traite-t-on les varices ?</h2>
<ul>
<li><strong>Mesures veineuses</strong> : marche, surélévation des jambes, contention (bas de compression), éviter la chaleur et la station debout prolongée.</li>
<li><strong>Veinotoniques</strong> pour soulager les symptômes.</li>
<li><strong>Traitements des varices</strong> : sclérose, laser, ou chirurgie selon les cas.</li>
</ul>

<h2>Comment prévenir l'insuffisance veineuse ?</h2>
<ul>
<li>Marcher régulièrement et éviter la station debout ou assise prolongée.</li>
<li>Surélever les jambes, porter une contention si conseillée.</li>
<li>Maintenir un poids sain, éviter les sources de chaleur sur les jambes.</li>
</ul>

<h2>Varices : quand consulter ?</h2>
<p>Consultez en cas de jambes lourdes gênantes, de varices qui s'aggravent, de troubles de la peau ou d'ulcère — et en urgence en cas de suspicion de phlébite. Le <a href="/specialites/medecine-generale">médecin généraliste</a> évalue et oriente vers un spécialiste des veines (angiologue) si nécessaire.</p>

<hr>
<p>Des jambes lourdes ou des varices qui vous inquiètent ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const varicesFaq = [
  { q: "Les varices sont-elles seulement un problème esthétique ?", a: "Non. Si elles gênent souvent par leur aspect, les varices traduisent une insuffisance veineuse qui peut provoquer jambes lourdes, œdèmes, troubles de la peau et, à terme, un ulcère variqueux. Elles méritent donc une prise en charge." },
  { q: "Comment soulager les jambes lourdes ?", a: "En marchant régulièrement, en surélevant les jambes, en portant des bas de compression si conseillés, en évitant la station debout prolongée et la chaleur. Les veinotoniques peuvent aider à soulager les symptômes." },
  { q: "Comment se débarrasser des varices ?", a: "Selon les cas, par la sclérose (injection), le laser ou la chirurgie, après un écho-doppler. Ces gestes s'accompagnent toujours des mesures de base (marche, contention) pour limiter les récidives." },
  { q: "Qu'est-ce qui favorise les varices ?", a: "L'hérédité, le sexe féminin, les grossesses, l'âge, la station debout prolongée, le surpoids, la sédentarité et la chaleur. On peut agir sur plusieurs de ces facteurs pour ralentir leur apparition." },
  { q: "Comment distinguer des varices d'une phlébite ?", a: "Les varices sont chroniques et peu douloureuses. Une phlébite se manifeste par une douleur d'un mollet, avec rougeur, chaleur et gonflement d'apparition récente : c'est une urgence qui impose de consulter sans attendre." },
  { q: "La grossesse aggrave-t-elle les varices ?", a: "Oui, la grossesse favorise et aggrave les varices en raison de la pression et des changements hormonaux. Elles s'améliorent souvent après l'accouchement ; le port d'une contention pendant la grossesse aide à les prévenir." },
];
const varicesTakeaways = [
  "Les varices traduisent une insuffisance veineuse chronique, fréquente surtout chez la femme.",
  "Symptômes : jambes lourdes, chevilles gonflées le soir, veines dilatées et visibles.",
  "Ce n'est pas qu'esthétique : elles peuvent se compliquer (troubles cutanés, ulcère).",
  "Mesures clés : marche, contention, surélévation des jambes ; sclérose ou chirurgie si besoin.",
  "Douleur, rougeur et chaleur d'un mollet = suspicion de phlébite, une urgence.",
];

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES PILIERS
// ─────────────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    slug: "zona-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Zona",
    title: "Zona au Maroc : symptômes, traitement et douleurs",
    excerpt: "Le zona est une éruption douloureuse due au réveil du virus de la varicelle, surtout après 50 ans. Symptômes, urgence du zona de l'œil, traitement antiviral précoce et vaccin, adaptés au Maroc.",
    content: cZona,
    metaTitle: "Zona au Maroc : symptômes, traitement et vaccin",
    metaDesc: "Zona : causes (réveil du virus de la varicelle), symptômes (éruption douloureuse d'un côté), urgence du zona de l'œil, traitement antiviral précoce et vaccin, adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: zonaTakeaways,
    faq: zonaFaq,
  },
  {
    slug: "cancer-colorectal-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Cancer colorectal",
    title: "Cancer colorectal au Maroc : dépistage, signes et traitement",
    excerpt: "Le cancer colorectal est l'un des plus fréquents mais aussi des plus évitables grâce au dépistage. Facteurs de risque, signes, dépistage dès 50 ans, coloscopie et traitements, adaptés au Maroc.",
    content: cCancerColorectal,
    metaTitle: "Cancer colorectal au Maroc : dépistage, signes et traitement",
    metaDesc: "Cancer colorectal : facteurs de risque, signes (sang dans les selles, transit modifié), dépistage dès 50 ans (test, coloscopie) et traitements. Un cancer évitable et curable, au Maroc.",
    readingTime: 6,
    keyTakeaways: cancerColorectalTakeaways,
    faq: cancerColorectalFaq,
  },
  {
    slug: "sinusite-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Sinusite",
    title: "Sinusite au Maroc : symptômes, causes et comment la soulager",
    excerpt: "Nez bouché, douleur du visage, maux de tête : la sinusite est fréquente et le plus souvent virale et bénigne. Symptômes, quand des antibiotiques sont utiles, comment la soulager et signes de gravité, au Maroc.",
    content: cSinusite,
    metaTitle: "Sinusite au Maroc : symptômes, causes et traitement",
    metaDesc: "Sinusite : symptômes (nez bouché, douleur du visage), causes, comment la soulager (lavages, antalgiques), quand des antibiotiques sont utiles et signes de gravité, adaptés au Maroc.",
    readingTime: 5,
    keyTakeaways: sinusiteTakeaways,
    faq: sinusiteFaq,
  },
  {
    slug: "calculs-renaux-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Lithiase urinaire",
    title: "Calculs rénaux au Maroc : colique néphrétique, causes et prévention",
    excerpt: "Douleur violente du dos, colique néphrétique : les calculs rénaux sont fréquents, favorisés par le manque d'eau et la chaleur. Symptômes, urgence, traitement et prévention par l'hydratation, au Maroc.",
    content: cCalculs,
    metaTitle: "Calculs rénaux au Maroc : colique néphrétique et prévention",
    metaDesc: "Calculs rénaux : colique néphrétique, causes (manque d'eau, alimentation), signes d'urgence, diagnostic, traitement et prévention par l'hydratation, expliqués et adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: calculsTakeaways,
    faq: calculsFaq,
  },
  {
    slug: "hemorroides-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Maladie hémorroïdaire",
    title: "Hémorroïdes au Maroc : symptômes, causes et traitement",
    excerpt: "Saignement, douleur, gêne : les hémorroïdes sont fréquentes et bénignes, mais tout saignement doit être vérifié. Causes, symptômes, traitements et prévention par le transit, adaptés au Maroc.",
    content: cHemorroides,
    metaTitle: "Hémorroïdes au Maroc : symptômes, causes et traitement",
    metaDesc: "Hémorroïdes : causes, symptômes (saignement, douleur), pourquoi tout saignement doit être vérifié, traitements locaux et prévention par le transit, expliqués et adaptés au Maroc.",
    readingTime: 5,
    keyTakeaways: hemorroidesTakeaways,
    faq: hemorroidesFaq,
  },
  {
    slug: "varices-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Varices",
    title: "Varices et jambes lourdes au Maroc : causes et traitements",
    excerpt: "Jambes lourdes, chevilles gonflées, veines apparentes : les varices traduisent une insuffisance veineuse, pas qu'un souci esthétique. Causes, complications, traitements et prévention, adaptés au Maroc.",
    content: cVarices,
    metaTitle: "Varices et jambes lourdes au Maroc : causes et traitements",
    metaDesc: "Varices : causes (insuffisance veineuse), symptômes (jambes lourdes, œdème), complications, écho-doppler, traitements (contention, sclérose, chirurgie) et prévention, adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: varicesTakeaways,
    faq: varicesFaq,
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

  console.log(`\nVague 5 : ${PILLARS.length} fiches Maladie publiées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
