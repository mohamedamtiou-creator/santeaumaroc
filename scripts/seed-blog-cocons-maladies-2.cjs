require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DENSIFICATION EN COCONS — vague 2 : Obésité, Dépression, Anémie (3 satellites
// chacun, rattachés par pillarId). Même logique que seed-blog-cocons-maladies.cjs.
//   • Obésité     (obesite-maroc)     → endocrinologie   [maladies-traitements]
//   • Dépression  (depression-maroc)  → psychiatrie       [sante-mentale]
//   • Anémie      (anemie-maroc)       → médecine générale [maladies-traitements]
// Idempotent (upsert). Mappings CTA : lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ═══ OBÉSITÉ ══════════════════════════════════════════════════════════════════
const cImc = `<p>Pour situer son poids, deux repères simples et complémentaires : l'indice de masse corporelle (IMC) et le tour de taille. Ensemble, ils évaluent non seulement le poids, mais aussi la répartition des graisses, la plus utile pour estimer le risque pour la santé.</p>

<h2>Calculer son IMC</h2>
<p>L'IMC se calcule en divisant le poids (en kg) par la taille au carré (en m²). Par exemple, 80 kg pour 1,70 m donne 80 ÷ (1,70 × 1,70) ≈ 27,7.</p>
<table>
<thead><tr><th>IMC</th><th>Interprétation</th></tr></thead>
<tbody>
<tr><td>18,5 – 24,9</td><td>Corpulence normale</td></tr>
<tr><td>25 – 29,9</td><td>Surpoids</td></tr>
<tr><td>30 – 34,9</td><td>Obésité modérée</td></tr>
<tr><td>≥ 35</td><td>Obésité sévère</td></tr>
</tbody>
</table>

<h2>Le tour de taille, tout aussi important</h2>
<p>L'IMC ne dit pas où se situe la graisse. Or la <strong>graisse abdominale</strong> est la plus à risque pour le cœur et le métabolisme. Le tour de taille, mesuré au niveau du nombril, complète l'IMC : un tour élevé signale un risque accru, même avec un IMC modéré.</p>

<h2>Les limites de l'IMC</h2>
<p>L'IMC est un repère, pas un diagnostic. Il peut surestimer la masse grasse chez une personne très musclée, ou la sous-estimer chez une personne âgée. Il s'interprète toujours avec le tour de taille et l'ensemble de la situation.</p>

<h2>Que faire de ces chiffres ?</h2>
<p>Un IMC ou un tour de taille élevé invite à en parler à son médecin, non pour « juger » un poids, mais pour prévenir les complications (voir la fiche <a href="/blog/obesite-maroc">Obésité</a>) : <a href="/blog/diabete-type-2-maroc">diabète</a>, <a href="/blog/hypertension-arterielle-maroc">hypertension</a>, <a href="/blog/cholesterol-maroc">cholestérol</a>.</p>

<hr>
<p>Pour faire le point sur votre poids et votre santé, trouvez un médecin près de chez vous sur SantéauMaroc et prenez rendez-vous en ligne, gratuitement.</p>`;
const imcFaq = [
  { q: "Comment calcule-t-on l'IMC ?", a: "En divisant le poids (en kg) par la taille au carré (en m²). Par exemple, 80 kg pour 1,70 m donne 80 ÷ (1,70 × 1,70) ≈ 27,7, soit un surpoids. Un IMC entre 18,5 et 24,9 est considéré comme normal." },
  { q: "À partir de quel IMC est-on en surpoids ou obèse ?", a: "Le surpoids correspond à un IMC entre 25 et 29,9, l'obésité à un IMC de 30 ou plus (sévère à partir de 35). Ces seuils sont des repères qui s'interprètent avec le tour de taille et la situation globale." },
  { q: "Pourquoi mesurer le tour de taille ?", a: "Parce que l'IMC ne dit pas où se situe la graisse. Le tour de taille reflète la graisse abdominale, la plus à risque pour le cœur et le métabolisme. Un tour de taille élevé signale un risque accru, même avec un IMC modéré." },
  { q: "L'IMC est-il fiable pour tout le monde ?", a: "C'est un repère utile mais imparfait : il peut surestimer la masse grasse chez une personne très musclée ou la sous-estimer chez une personne âgée. Il doit toujours être interprété avec le tour de taille et l'ensemble du contexte." },
  { q: "Un IMC élevé est-il forcément inquiétant ?", a: "Pas à lui seul : c'est un signal qui invite à évaluer le risque global (tour de taille, tension, glycémie, cholestérol) avec un médecin, afin de prévenir d'éventuelles complications, plutôt que de « juger » un poids." },
];
const imcTk = [
  "L'IMC = poids (kg) ÷ taille² (m) ; surpoids à partir de 25, obésité à partir de 30.",
  "Le tour de taille complète l'IMC en évaluant la graisse abdominale, la plus à risque.",
  "L'IMC est un repère, pas un diagnostic : il s'interprète avec le contexte.",
  "Des chiffres élevés invitent à évaluer le risque global avec un médecin.",
];

const cMaigrir = `<p>Perdre du poids durablement ne se joue pas sur un régime éclair, mais sur des changements réalistes tenus dans le temps. Bonne nouvelle : il n'est pas nécessaire d'atteindre un poids « idéal » — une perte de 5 à 10 % suffit déjà à améliorer nettement la santé.</p>

<h2>Se fixer un objectif réaliste</h2>
<p>Viser une perte de <strong>5 à 10 % du poids</strong>, lentement (quelques kilos sur plusieurs mois), est plus efficace et plus durable qu'une perte rapide. Chaque kilo perdu améliore la tension, la glycémie et les articulations.</p>

<h2>Les leviers qui marchent</h2>
<ul>
<li><strong>Alimentation</strong> : plus de légumes et de légumineuses, moins de sucres, de boissons sucrées et de fritures — sans interdits absolus.</li>
<li><strong>Activité physique</strong> régulière, même modeste (marche quotidienne).</li>
<li><strong>Sommeil</strong> suffisant et gestion du stress, qui influencent le poids.</li>
</ul>

<h2>Les pièges à éviter</h2>
<p>Les régimes très restrictifs entraînent frustration puis reprise de poids (effet « yo-yo »), parfois au-delà du poids de départ. Méfiez-vous des « solutions miracles », des produits « brûle-graisses » et des régimes déséquilibrés qui exposent à des carences.</p>

<h2>Se faire accompagner</h2>
<p>Un médecin, une diététicienne ou un nutritionniste aide à bâtir un plan adapté et sûr, surtout en cas d'<a href="/blog/obesite-maroc">obésité</a> ou de maladies associées. Un soutien psychologique est parfois précieux, car le rapport à l'alimentation est aussi émotionnel.</p>

<hr>
<p>Pour un accompagnement durable et sans danger, trouvez un médecin sur SantéauMaroc et prenez rendez-vous en ligne, gratuitement.</p>`;
const maigrirFaq = [
  { q: "Combien de poids faut-il perdre pour être en meilleure santé ?", a: "Pas besoin d'un poids « idéal » : une perte de 5 à 10 % du poids initial améliore déjà nettement la tension, la glycémie, le cholestérol et les articulations. L'objectif est une perte lente et surtout durable." },
  { q: "Pourquoi les régimes stricts ne marchent-ils pas ?", a: "Parce qu'ils entraînent frustration et privation, suivies d'une reprise de poids (effet yo-yo), parfois au-delà du poids de départ. Un rééquilibrage alimentaire progressif et tenable dans le temps est bien plus efficace." },
  { q: "Comment perdre du poids durablement ?", a: "En combinant une alimentation plus riche en légumes et légumineuses et plus pauvre en sucres et fritures, une activité physique régulière, un bon sommeil et la gestion du stress, idéalement accompagné par un professionnel. Sans interdits absolus." },
  { q: "Les produits « brûle-graisses » sont-ils efficaces ?", a: "Non, et certains peuvent être dangereux. Il n'existe pas de solution miracle. La perte de poids durable repose sur des changements réalistes de mode de vie, pas sur des compléments. Demandez conseil à un professionnel avant tout produit." },
  { q: "Faut-il consulter pour perdre du poids ?", a: "C'est recommandé en cas d'obésité, de maladies associées (diabète, hypertension) ou d'échecs répétés. Un médecin, une diététicienne ou un nutritionniste bâtit un plan adapté et sûr, et peut proposer un soutien psychologique si besoin." },
];
const maigrirTk = [
  "Perdre 5 à 10 % du poids, lentement, améliore déjà nettement la santé.",
  "Leviers : alimentation, activité physique, sommeil et gestion du stress.",
  "Éviter les régimes très restrictifs (effet yo-yo) et les « solutions miracles ».",
  "Se faire accompagner par un professionnel rend la démarche plus sûre et durable.",
];

const cBariatrique = `<p>La chirurgie de l'obésité, ou chirurgie bariatrique, s'adresse aux obésités sévères après échec d'une prise en charge médicale. Efficace, elle n'est pas une solution « facile » : elle exige une évaluation approfondie et un suivi à vie.</p>

<h2>Pour qui ?</h2>
<p>Elle est envisagée en cas d'<a href="/blog/obesite-maroc">obésité</a> sévère (IMC élevé), souvent avec des complications (diabète, apnées, hypertension), et après échec de mesures bien conduites. La décision se prend en équipe, après un bilan complet.</p>

<h2>Les principales techniques</h2>
<table>
<thead><tr><th>Technique</th><th>Principe</th></tr></thead>
<tbody>
<tr><td>Sleeve (gastrectomie longitudinale)</td><td>Réduction du volume de l'estomac</td></tr>
<tr><td>Bypass gastrique</td><td>Réduction de l'estomac + court-circuit d'une partie de l'intestin</td></tr>
<tr><td>Anneau gastrique</td><td>Anneau ajustable réduisant l'estomac (moins pratiqué aujourd'hui)</td></tr>
</tbody>
</table>

<h2>Ce que la chirurgie change</h2>
<p>Elle permet une perte de poids importante et durable et améliore souvent nettement le diabète et les autres complications. Mais elle impose de <strong>nouvelles habitudes alimentaires définitives</strong> et une supplémentation en vitamines à vie.</p>

<h2>Risques et suivi</h2>
<p>Comme toute chirurgie, elle comporte des risques, et expose à des carences si le suivi n'est pas respecté. Un <strong>accompagnement à vie</strong> (nutrition, vitamines, soutien psychologique) est indispensable à sa réussite. Ce n'est pas une décision anodine : elle se mûrit avec l'équipe soignante.</p>

<hr>
<p>Pour savoir si la chirurgie de l'obésité vous concerne, un avis spécialisé est nécessaire. Trouvez un endocrinologue sur SantéauMaroc et prenez rendez-vous en ligne.</p>`;
const bariatriqueFaq = [
  { q: "Qui peut bénéficier d'une chirurgie de l'obésité ?", a: "Elle est réservée aux obésités sévères (IMC élevé), souvent avec des complications comme le diabète ou l'apnée du sommeil, après échec d'une prise en charge médicale bien conduite. La décision se prend en équipe après un bilan complet." },
  { q: "Quelles sont les techniques de chirurgie bariatrique ?", a: "Principalement la sleeve (réduction du volume de l'estomac) et le bypass gastrique (réduction de l'estomac plus court-circuit d'une partie de l'intestin). L'anneau gastrique est moins pratiqué aujourd'hui. Le choix dépend de chaque situation." },
  { q: "La chirurgie de l'obésité est-elle une solution facile ?", a: "Non. Elle est efficace mais impose des habitudes alimentaires nouvelles et définitives, une supplémentation en vitamines à vie et un suivi régulier. Ce n'est pas une décision anodine : elle se mûrit avec l'équipe soignante." },
  { q: "Y a-t-il des risques et des carences après l'opération ?", a: "Oui : comme toute chirurgie, elle comporte des risques, et elle expose à des carences en vitamines et minéraux si le suivi et la supplémentation ne sont pas respectés. Un accompagnement à vie est indispensable." },
  { q: "La chirurgie guérit-elle le diabète ?", a: "Elle améliore souvent nettement le diabète de type 2, parfois jusqu'à une rémission, surtout quand la perte de poids est importante. Le suivi reste nécessaire, car les bénéfices dépendent du maintien des nouvelles habitudes." },
];
const bariatriqueTk = [
  "La chirurgie bariatrique vise les obésités sévères après échec médical.",
  "Techniques principales : sleeve et bypass gastrique.",
  "Elle exige des habitudes alimentaires définitives et des vitamines à vie.",
  "Un suivi à vie est indispensable : ce n'est pas une solution « facile ».",
];

// ═══ DÉPRESSION ═══════════════════════════════════════════════════════════════
const cAntidep = `<p>Les antidépresseurs font partie des traitements de la dépression, souvent aux côtés d'une psychothérapie. Entourés d'idées reçues, ils inquiètent parfois à tort. Bien utilisés, ils aident de nombreuses personnes à se rétablir.</p>

<h2>À quoi servent-ils ?</h2>
<p>Ils agissent sur les messagers chimiques du cerveau pour améliorer l'humeur, le sommeil, l'appétit et l'énergie. Ils sont proposés surtout dans les <a href="/blog/depression-maroc">dépressions</a> modérées à sévères, en complément d'un accompagnement psychologique.</p>

<h2>Ils agissent progressivement</h2>
<p>Leur effet n'est <strong>pas immédiat</strong> : il faut souvent <strong>2 à 4 semaines</strong> pour ressentir une amélioration. Ce délai est normal ; il ne faut pas conclure trop vite à un échec ni arrêter le traitement de soi-même.</p>

<h2>Les idées reçues</h2>
<ul>
<li><strong>« Ils rendent dépendant »</strong> : non, les antidépresseurs ne créent pas de dépendance comme certaines substances.</li>
<li><strong>« Ils changent la personnalité »</strong> : non, ils visent à retrouver son état habituel, pas à le modifier.</li>
<li><strong>« C'est un aveu de faiblesse »</strong> : non, se soigner est un acte de courage.</li>
</ul>

<h2>Le bon usage</h2>
<p>On les prend chaque jour, régulièrement, et on <strong>ne les arrête jamais brutalement</strong> ni sans avis médical : l'arrêt se fait progressivement, sous contrôle, pour éviter la rechute. Signalez tout effet indésirable au médecin, qui peut ajuster le traitement.</p>

<hr>
<p>Un traitement à discuter ou à ajuster ? Sur SantéauMaroc, trouvez un psychiatre ou un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const antidepFaq = [
  { q: "Les antidépresseurs rendent-ils dépendant ?", a: "Non, ils ne créent pas de dépendance comme certaines substances. Il ne faut cependant pas les arrêter brutalement : l'arrêt se fait progressivement et sous contrôle médical, pour éviter une rechute et des symptômes d'arrêt." },
  { q: "Combien de temps avant que les antidépresseurs agissent ?", a: "Leur effet n'est pas immédiat : il faut souvent 2 à 4 semaines pour ressentir une amélioration. Ce délai est normal ; il ne faut pas conclure trop vite à un échec ni arrêter le traitement de soi-même." },
  { q: "Les antidépresseurs changent-ils la personnalité ?", a: "Non. Leur but est d'aider à retrouver son état habituel, son énergie et son intérêt pour les choses, pas de modifier la personnalité. Bien dosés, ils lèvent les symptômes de la dépression sans « transformer » la personne." },
  { q: "Peut-on arrêter les antidépresseurs quand on va mieux ?", a: "Pas de sa propre initiative. Le traitement se poursuit un certain temps après l'amélioration pour éviter la rechute, puis se diminue progressivement sous contrôle médical. Un arrêt brutal expose à des symptômes désagréables et à une rechute." },
  { q: "Faut-il forcément des antidépresseurs pour une dépression ?", a: "Non. Les dépressions légères relèvent surtout de la psychothérapie et de mesures d'hygiène de vie. Les antidépresseurs sont proposés surtout dans les formes modérées à sévères. Le médecin décide au cas par cas, avec la personne." },
];
const antidepTk = [
  "Les antidépresseurs améliorent humeur, sommeil et énergie dans les dépressions modérées à sévères.",
  "Leur effet apparaît en 2 à 4 semaines : ce délai est normal.",
  "Ils ne créent pas de dépendance et ne changent pas la personnalité.",
  "Ne jamais les arrêter brutalement : l'arrêt se fait progressivement, sous contrôle.",
];

const cDeprimeVsDep = `<p>« Déprime » et « dépression » sont souvent confondues. Pourtant, l'une est une réaction passagère et normale, l'autre une véritable maladie. Savoir les distinguer aide à déculpabiliser et à consulter au bon moment.</p>

<h2>La déprime passagère</h2>
<p>Face à une contrariété, un deuil, une fatigue, il est normal de se sentir triste ou démotivé quelques jours. Cette « déprime » cède avec le temps, le repos et les bons moments, sans envahir toute la vie.</p>

<h2>La dépression, une maladie</h2>
<p>La <a href="/blog/depression-maroc">dépression</a> est différente : une tristesse et/ou une perte d'intérêt qui <strong>durent au moins deux semaines</strong>, s'accompagnent d'autres signes (fatigue, troubles du sommeil et de l'appétit, dévalorisation, difficultés de concentration) et <strong>retentissent sur le quotidien</strong>.</p>

<h2>Les signes qui font pencher pour une dépression</h2>
<ul>
<li>Symptômes présents presque tous les jours depuis plus de deux semaines</li>
<li>Perte de plaisir pour ce qu'on aimait</li>
<li>Retentissement sur le travail, les relations, le sommeil</li>
<li>Idées noires (à prendre toujours au sérieux)</li>
</ul>

<h2>En cas de doute, consulter</h2>
<p>Il n'est jamais « trop tôt » pour demander de l'aide. Le médecin, par un simple entretien, aide à faire la part des choses. Devant des idées suicidaires, il s'agit d'une urgence : en parler immédiatement à un médecin, aux urgences ou à un proche.</p>

<hr>
<p>Un doute sur votre état ou celui d'un proche ? Sur SantéauMaroc, trouvez un médecin ou un psychiatre près de chez vous et prenez rendez-vous en ligne.</p>`;
const deprimeFaq = [
  { q: "Quelle différence entre déprime et dépression ?", a: "La déprime est une tristesse passagère, réaction normale à un événement, qui cède avec le temps et le repos. La dépression est une maladie : les symptômes durent au moins deux semaines, s'accompagnent d'autres signes et retentissent sur la vie quotidienne." },
  { q: "Quand la tristesse devient-elle une dépression ?", a: "Lorsqu'elle dure (au moins deux semaines), s'accompagne d'une perte d'intérêt, de fatigue, de troubles du sommeil et de l'appétit, de dévalorisation, et qu'elle perturbe le quotidien. En cas de doute, un médecin aide à faire la part des choses." },
  { q: "Comment savoir si je fais une dépression ?", a: "Si vous ressentez tristesse et/ou perte de plaisir presque tous les jours depuis plus de deux semaines, avec d'autres signes et un retentissement sur votre vie, il faut consulter. Le médecin évalue la situation par un entretien ; il n'est jamais trop tôt." },
  { q: "La déprime peut-elle évoluer en dépression ?", a: "Une tristesse passagère ne devient pas systématiquement une dépression, mais des difficultés qui s'installent et s'aggravent doivent alerter. Mieux vaut consulter si les symptômes durent, s'intensifient ou s'accompagnent d'idées noires." },
  { q: "Que faire en cas d'idées noires ?", a: "Les idées noires ou suicidaires sont une urgence, quelle que soit leur intensité. Il faut en parler immédiatement à un médecin, aux urgences ou à une personne de confiance, sans rester seul. Demander de l'aide est un acte de courage." },
];
const deprimeTk = [
  "La déprime est passagère et normale ; la dépression est une maladie qui dure et retentit.",
  "On parle de dépression au-delà de deux semaines, avec d'autres signes associés.",
  "La perte de plaisir et le retentissement sur le quotidien sont des repères clés.",
  "Idées noires = urgence : en parler immédiatement, ne pas rester seul.",
];

const cPostPartum = `<p>Après un accouchement, un passage à vide est fréquent. Mais quand la tristesse s'installe et s'aggrave, il peut s'agir d'une dépression du post-partum, une maladie fréquente, bien identifiée et qui se soigne — pour le bien de la mère comme de l'enfant.</p>

<h2>« Baby blues » ou dépression ?</h2>
<p>Le <strong>baby blues</strong> touche de nombreuses mères dans les jours suivant l'accouchement : émotivité, larmes faciles, fatigue, qui s'estompent en une à deux semaines. La <strong>dépression du post-partum</strong> est plus intense, dure davantage et retentit sur la vie quotidienne et le lien avec le bébé.</p>

<h2>Les signes à repérer</h2>
<ul>
<li>Tristesse persistante, pleurs, irritabilité</li>
<li>Fatigue extrême, troubles du sommeil au-delà de ceux liés au bébé</li>
<li>Sentiment de culpabilité, d'incapacité à s'occuper de l'enfant</li>
<li>Perte d'intérêt, anxiété importante, idées noires</li>
</ul>

<h2>Pourquoi consulter ?</h2>
<p>La dépression du post-partum n'est <strong>ni une faute ni un manque d'amour</strong> pour le bébé. Elle se soigne bien (soutien, psychothérapie, parfois traitement adapté à l'allaitement). En parler tôt à un professionnel protège la mère et favorise le développement de l'enfant.</p>

<h2>Le rôle de l'entourage</h2>
<p>Le partenaire et les proches jouent un rôle clé : écouter sans juger, soulager la mère, l'encourager à consulter. Voir aussi notre fiche <a href="/blog/depression-maroc">Dépression</a>. Devant des idées noires, il s'agit d'une urgence.</p>

<hr>
<p>Un doute après une naissance ? Sur SantéauMaroc, trouvez un médecin ou un psychiatre près de chez vous et prenez rendez-vous en ligne.</p>`;
const postPartumFaq = [
  { q: "Quelle différence entre baby blues et dépression du post-partum ?", a: "Le baby blues est un passage émotif fréquent dans les jours après l'accouchement, qui s'estompe en une à deux semaines. La dépression du post-partum est plus intense, dure davantage et retentit sur la vie quotidienne et le lien avec le bébé." },
  { q: "Quels sont les signes d'une dépression après l'accouchement ?", a: "Tristesse persistante, pleurs, irritabilité, fatigue extrême, troubles du sommeil au-delà de ceux liés au bébé, sentiment de culpabilité ou d'incapacité, perte d'intérêt, anxiété importante et parfois idées noires." },
  { q: "La dépression du post-partum se soigne-t-elle ?", a: "Oui, très bien : par le soutien, la psychothérapie et, si besoin, un traitement adapté à l'allaitement. En parler tôt à un professionnel protège la mère et favorise le développement de l'enfant. Ce n'est ni une faute ni un manque d'amour." },
  { q: "Est-ce fréquent d'être déprimée après un accouchement ?", a: "Oui, la dépression du post-partum est fréquente et bien identifiée. Elle peut survenir dans les semaines ou les mois suivant la naissance. La reconnaître et consulter permet d'être aidée rapidement, sans culpabilité." },
  { q: "Comment aider une jeune maman qui semble déprimée ?", a: "L'écouter sans juger, l'aider concrètement pour la soulager, l'encourager à consulter et rester présent. Prendre au sérieux toute allusion à des idées noires et alerter un professionnel sans attendre : c'est alors une urgence." },
];
const postPartumTk = [
  "Le baby blues est passager ; la dépression du post-partum dure et retentit sur le quotidien.",
  "Signes : tristesse persistante, fatigue extrême, culpabilité, anxiété, idées noires.",
  "Ce n'est ni une faute ni un manque d'amour : elle se soigne bien.",
  "En parler tôt protège la mère et l'enfant ; les idées noires sont une urgence.",
];

// ═══ ANÉMIE ═══════════════════════════════════════════════════════════════════
const cAnemieFer = `<p>L'anémie par carence en fer (ou anémie ferriprive) est de loin la plus fréquente, en particulier chez la femme. Le fer étant indispensable à la fabrication de l'hémoglobine, son manque prive l'organisme d'oxygène. Elle se corrige bien, à condition d'en traiter aussi la cause.</p>

<h2>Pourquoi manque-t-on de fer ?</h2>
<ul>
<li><strong>Pertes de sang</strong> : règles abondantes, saignements digestifs</li>
<li><strong>Besoins accrus</strong> : grossesse, croissance</li>
<li><strong>Apports insuffisants</strong> : alimentation pauvre en fer</li>
<li><strong>Mauvaise absorption</strong> : certaines maladies digestives</li>
</ul>

<h2>Les symptômes</h2>
<p>Fatigue, pâleur, essoufflement à l'effort, palpitations, ongles cassants, chute de cheveux. Ils s'installent souvent progressivement (voir la fiche <a href="/blog/anemie-maroc">Anémie</a>).</p>

<h2>Le diagnostic</h2>
<p>Une <a href="/blog/analyse-de-sang-maroc">prise de sang</a> mesure l'hémoglobine et surtout la <strong>ferritine</strong>, qui reflète les réserves en fer. Une ferritine basse confirme la carence. Le médecin recherche ensuite la cause du manque.</p>

<h2>Le traitement</h2>
<p>Il associe une <strong>supplémentation en fer</strong> (comprimés le plus souvent, parfois en perfusion) et le <strong>traitement de la cause</strong>. Le fer se prend idéalement à distance du thé et du café, avec une source de vitamine C. La correction prend plusieurs semaines à mois ; ne pas arrêter trop tôt.</p>
<blockquote>Bon à savoir : ne prenez pas de fer au long cours sans bilan. Se supplémenter à l'aveugle peut masquer une cause importante à traiter, comme un saignement digestif.</blockquote>

<hr>
<p>Une fatigue avec pâleur à explorer ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const anemieFerFaq = [
  { q: "Quels sont les signes d'un manque de fer ?", a: "Fatigue, pâleur, essoufflement à l'effort, palpitations, ongles cassants et chute de cheveux. Ces signes s'installent souvent progressivement. Une prise de sang mesurant l'hémoglobine et la ferritine confirme la carence en fer." },
  { q: "Qu'est-ce que la ferritine ?", a: "C'est une protéine qui reflète les réserves en fer de l'organisme. Une ferritine basse signe une carence en fer, même quand l'hémoglobine est encore normale. C'est un examen clé pour diagnostiquer et suivre une anémie ferriprive." },
  { q: "Comment bien prendre son fer ?", a: "Idéalement à distance du thé et du café (qui réduisent son absorption), avec une source de vitamine C (agrumes, tomate) qui l'améliore. Le traitement dure plusieurs semaines à mois : il ne faut pas l'arrêter trop tôt, sur avis médical." },
  { q: "Pourquoi chercher la cause d'un manque de fer ?", a: "Parce que la carence en fer est un signe, pas une maladie en soi. Elle peut venir de règles abondantes, de la grossesse, mais aussi d'un saignement digestif qu'il faut traiter. Se supplémenter sans bilan risque de masquer une cause importante." },
  { q: "Peut-on corriger un manque de fer par l'alimentation seule ?", a: "L'alimentation aide à prévenir et à entretenir de bonnes réserves, mais une carence installée nécessite le plus souvent une supplémentation prescrite, en plus du traitement de la cause. Le médecin adapte selon la sévérité." },
];
const anemieFerTk = [
  "L'anémie par carence en fer est la plus fréquente, surtout chez la femme.",
  "Signes : fatigue, pâleur, essoufflement, palpitations, ongles cassants.",
  "Diagnostic : prise de sang avec hémoglobine et ferritine (réserves en fer).",
  "Traiter le fer ET la cause ; ne pas se supplémenter à l'aveugle.",
];

const cAlimentsFer = `<p>Bien manger aide à prévenir la carence en fer et à entretenir de bonnes réserves. Encore faut-il connaître les bonnes sources de fer et les associations qui en favorisent — ou en gênent — l'absorption.</p>

<h2>Les meilleures sources de fer</h2>
<p>On distingue deux types de fer :</p>
<ul>
<li><strong>Fer d'origine animale</strong> (bien absorbé) : viande rouge, volaille, poisson, abats.</li>
<li><strong>Fer d'origine végétale</strong> (moins bien absorbé) : lentilles, pois chiches, haricots, épinards, fruits secs.</li>
</ul>

<h2>Améliorer l'absorption</h2>
<p>Associer une <strong>source de vitamine C</strong> (agrumes, tomate, poivron, persil) au même repas améliore nettement l'absorption du fer, surtout d'origine végétale. Un filet de citron sur les lentilles, une orange en dessert : des gestes simples et efficaces.</p>

<h2>Ce qui gêne l'absorption</h2>
<p>Le <strong>thé</strong> et le <strong>café</strong>, très consommés au Maroc, réduisent l'absorption du fer lorsqu'ils sont pris pendant ou juste après le repas. Mieux vaut les décaler d'une à deux heures.</p>

<h2>Qui doit être vigilant ?</h2>
<p>Les femmes ayant des règles abondantes, les femmes enceintes (voir <a href="/blog/anemie-grossesse-maroc">anémie et grossesse</a>) et les personnes suivant un régime végétarien doivent veiller à leurs apports. En cas de fatigue ou de pâleur, une <a href="/blog/anemie-maroc">anémie</a> se recherche par une prise de sang.</p>

<hr>
<p>Un doute sur vos apports ou une fatigue à explorer ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const alimentsFerFaq = [
  { q: "Quels aliments sont riches en fer ?", a: "La viande rouge, la volaille, le poisson et les abats (fer bien absorbé), ainsi que les légumineuses (lentilles, pois chiches, haricots), les épinards et les fruits secs (fer végétal, moins bien absorbé). Varier les sources est utile." },
  { q: "Comment mieux absorber le fer des aliments ?", a: "En associant une source de vitamine C au repas (agrumes, tomate, poivron, persil), qui améliore nettement l'absorption, surtout du fer végétal. Un filet de citron sur les lentilles ou une orange en dessert sont des gestes simples et efficaces." },
  { q: "Le thé empêche-t-il d'absorber le fer ?", a: "Le thé et le café réduisent l'absorption du fer lorsqu'ils sont pris pendant ou juste après le repas. Comme ils sont très consommés au Maroc, mieux vaut les décaler d'une à deux heures des repas riches en fer." },
  { q: "Les végétariens manquent-ils de fer ?", a: "Ils sont plus exposés, car le fer végétal est moins bien absorbé. Avec une alimentation variée (légumineuses, céréales complètes, fruits secs) associée à la vitamine C, les apports peuvent être suffisants ; une surveillance est parfois utile." },
  { q: "L'alimentation suffit-elle en cas d'anémie ?", a: "Pour prévenir et entretenir les réserves, oui. Mais une anémie par carence installée nécessite le plus souvent une supplémentation prescrite, en plus du traitement de la cause. L'alimentation reste un complément important." },
];
const alimentsFerTk = [
  "Fer bien absorbé : viande, volaille, poisson ; fer végétal : légumineuses, épinards.",
  "La vitamine C au même repas améliore nettement l'absorption du fer.",
  "Thé et café pendant le repas réduisent l'absorption : les décaler.",
  "Femmes réglées, femmes enceintes et végétariens doivent être vigilants.",
];

const cAnemieGrossesse = `<p>L'anémie est fréquente pendant la grossesse : les besoins en fer augmentent fortement pour la mère et le bébé. Le plus souvent bénigne et bien prise en charge, elle est surveillée tout au long du suivi prénatal car, non traitée, elle peut avoir des conséquences.</p>

<h2>Pourquoi l'anémie est fréquente enceinte</h2>
<p>La grossesse augmente le volume sanguin et les besoins en fer (pour le bébé, le placenta, la future perte à l'accouchement). Si les apports ne suivent pas, une <a href="/blog/anemie-maroc">anémie</a> par carence en fer s'installe.</p>

<h2>Les signes</h2>
<p>Fatigue (souvent mise sur le compte de la grossesse), pâleur, essoufflement, vertiges. C'est pourquoi le taux d'hémoglobine est contrôlé lors du <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</p>

<h2>Pourquoi la traiter</h2>
<p>Une anémie non prise en charge peut augmenter la fatigue, la sensibilité aux infections et certains risques pour la mère et l'enfant. Sa correction améliore le bien-être et sécurise la grossesse.</p>

<h2>La prise en charge</h2>
<ul>
<li>Une <strong>supplémentation en fer</strong> (et souvent en acide folique) est fréquemment prescrite.</li>
<li>Une <a href="/blog/aliments-riches-en-fer-maroc">alimentation riche en fer</a>, avec de la vitamine C, complète le traitement.</li>
<li>Le taux est recontrôlé pour vérifier l'efficacité.</li>
</ul>

<hr>
<p>Enceinte et fatiguée ? Parlez-en à votre médecin. Sur SantéauMaroc, trouvez un gynécologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const anemieGrossesseFaq = [
  { q: "Pourquoi l'anémie est-elle fréquente pendant la grossesse ?", a: "Parce que la grossesse augmente le volume sanguin et les besoins en fer (pour le bébé, le placenta et la perte de l'accouchement). Si les apports ne suivent pas, une anémie par carence en fer s'installe. Le taux d'hémoglobine est donc surveillé." },
  { q: "L'anémie est-elle dangereuse pour le bébé ?", a: "Une anémie non prise en charge peut augmenter la fatigue et certains risques pour la mère et l'enfant. Bien traitée, elle n'a en général pas de conséquence. C'est pourquoi elle est dépistée et corrigée pendant le suivi prénatal." },
  { q: "Faut-il prendre du fer pendant la grossesse ?", a: "Une supplémentation en fer, souvent associée à l'acide folique, est fréquemment prescrite pendant la grossesse, surtout en cas d'anémie. Elle se prend sur avis médical, avec une alimentation riche en fer et en vitamine C." },
  { q: "Comment reconnaître une anémie pendant la grossesse ?", a: "Par une fatigue plus marquée que d'habitude, une pâleur, un essoufflement ou des vertiges. Comme ces signes peuvent être attribués à la grossesse, le contrôle du taux d'hémoglobine par prise de sang est essentiel." },
  { q: "Quelle alimentation contre l'anémie enceinte ?", a: "Une alimentation riche en fer (viande, volaille, poisson, légumineuses, légumes verts) associée à une source de vitamine C pour améliorer l'absorption. Le thé et le café sont à décaler des repas. L'alimentation complète la supplémentation prescrite." },
];
const anemieGrossesseTk = [
  "La grossesse augmente les besoins en fer : l'anémie y est fréquente.",
  "Le taux d'hémoglobine est surveillé tout au long du suivi prénatal.",
  "Non traitée, l'anémie peut avoir des conséquences pour la mère et l'enfant.",
  "Prise en charge : supplémentation en fer/acide folique + alimentation adaptée.",
];

// ─────────────────────────────────────────────────────────────────────────────
const SATELLITES = [
  { pillarSlug: "obesite-maroc", categorySlug: "maladies-traitements", aboutEntity: "Obésité",
    slug: "imc-tour-de-taille-maroc", title: "IMC et tour de taille : bien évaluer son poids",
    excerpt: "IMC et tour de taille : comment les calculer, les interpréter, leurs limites et ce qu'il faut en faire pour évaluer son risque santé. Un guide clair, adapté au Maroc.",
    metaTitle: "IMC et tour de taille : bien évaluer son poids | Maroc",
    metaDesc: "IMC et tour de taille : calcul, interprétation (surpoids, obésité), limites de l'IMC et rôle de la graisse abdominale pour évaluer son risque santé. Guide clair, adapté au Maroc.",
    readingTime: 5, content: cImc, keyTakeaways: imcTk, faq: imcFaq },
  { pillarSlug: "obesite-maroc", categorySlug: "maladies-traitements", aboutEntity: "Obésité",
    slug: "maigrir-durablement-maroc", title: "Maigrir durablement : méthode et pièges à éviter",
    excerpt: "Perdre du poids durablement : objectif réaliste, leviers qui marchent, pièges des régimes stricts et intérêt d'un accompagnement. Un guide clair et sans « solution miracle ».",
    metaTitle: "Maigrir durablement : méthode et pièges à éviter | Maroc",
    metaDesc: "Maigrir durablement : viser 5-10 % du poids, leviers efficaces (alimentation, activité, sommeil), pièges des régimes stricts (effet yo-yo) et intérêt d'un accompagnement. Adapté au Maroc.",
    readingTime: 5, content: cMaigrir, keyTakeaways: maigrirTk, faq: maigrirFaq },
  { pillarSlug: "obesite-maroc", categorySlug: "maladies-traitements", aboutEntity: "Chirurgie bariatrique",
    slug: "chirurgie-bariatrique-maroc", title: "Chirurgie de l'obésité (sleeve, bypass) : pour qui ?",
    excerpt: "Chirurgie bariatrique : pour qui, techniques (sleeve, bypass), ce qu'elle change, risques et suivi à vie. Une décision qui se mûrit avec l'équipe soignante, expliquée au Maroc.",
    metaTitle: "Chirurgie de l'obésité (sleeve, bypass) : pour qui ? | Maroc",
    metaDesc: "Chirurgie bariatrique : indications, techniques (sleeve, bypass), bénéfices, risques et suivi à vie. Ce qu'il faut savoir avant une chirurgie de l'obésité, adapté au Maroc.",
    readingTime: 5, content: cBariatrique, keyTakeaways: bariatriqueTk, faq: bariatriqueFaq },

  { pillarSlug: "depression-maroc", categorySlug: "sante-mentale", aboutEntity: "Dépression",
    slug: "antidepresseurs-maroc", title: "Antidépresseurs : idées reçues et bon usage",
    excerpt: "Antidépresseurs : à quoi ils servent, délai d'action, idées reçues (dépendance, personnalité) et bon usage. Un guide clair pour dédramatiser, adapté au Maroc.",
    metaTitle: "Antidépresseurs : idées reçues et bon usage | Maroc",
    metaDesc: "Antidépresseurs : à quoi ils servent, délai d'action (2-4 semaines), idées reçues (dépendance, personnalité) et bon usage (ne pas arrêter seul). Guide clair adapté au Maroc.",
    readingTime: 5, content: cAntidep, keyTakeaways: antidepTk, faq: antidepFaq },
  { pillarSlug: "depression-maroc", categorySlug: "sante-mentale", aboutEntity: "Dépression",
    slug: "depression-ou-deprime-maroc", title: "Déprime ou dépression : comment faire la différence ?",
    excerpt: "Déprime passagère ou vraie dépression ? Les signes qui distinguent une réaction normale d'une maladie, et quand consulter. Un guide clair pour déculpabiliser, adapté au Maroc.",
    metaTitle: "Déprime ou dépression : quelle différence ? | Maroc",
    metaDesc: "Déprime ou dépression : distinguer une tristesse passagère d'une maladie (durée, retentissement, perte de plaisir), et savoir quand consulter. Guide clair adapté au Maroc.",
    readingTime: 5, content: cDeprimeVsDep, keyTakeaways: deprimeTk, faq: deprimeFaq },
  { pillarSlug: "depression-maroc", categorySlug: "sante-mentale", aboutEntity: "Dépression du post-partum",
    slug: "depression-post-partum-maroc", title: "Dépression du post-partum : la reconnaître et en sortir",
    excerpt: "Dépression du post-partum : différence avec le baby blues, signes à repérer, pourquoi consulter et rôle de l'entourage. Une maladie fréquente qui se soigne, adapté au Maroc.",
    metaTitle: "Dépression du post-partum : signes et solutions | Maroc",
    metaDesc: "Dépression du post-partum : différence avec le baby blues, signes à repérer, pourquoi et comment consulter, rôle de l'entourage. Une maladie fréquente qui se soigne. Adapté au Maroc.",
    readingTime: 5, content: cPostPartum, keyTakeaways: postPartumTk, faq: postPartumFaq },

  { pillarSlug: "anemie-maroc", categorySlug: "maladies-traitements", aboutEntity: "Anémie ferriprive",
    slug: "anemie-fer-carence-maroc", title: "Anémie par carence en fer : causes et traitement",
    excerpt: "Anémie par carence en fer : pourquoi elle survient, symptômes, diagnostic (ferritine), traitement et importance de chercher la cause. Un guide clair, adapté au Maroc.",
    metaTitle: "Anémie par carence en fer : causes et traitement | Maroc",
    metaDesc: "Anémie ferriprive : causes (règles, grossesse, saignements), symptômes, diagnostic par ferritine, supplémentation en fer et traitement de la cause. Guide clair adapté au Maroc.",
    readingTime: 5, content: cAnemieFer, keyTakeaways: anemieFerTk, faq: anemieFerFaq },
  { pillarSlug: "anemie-maroc", categorySlug: "maladies-traitements", aboutEntity: "Carence en fer",
    slug: "aliments-riches-en-fer-maroc", title: "Aliments riches en fer : bien les choisir et les associer",
    excerpt: "Aliments riches en fer : meilleures sources, comment améliorer l'absorption (vitamine C), ce qui la gêne (thé, café) et qui doit être vigilant. Un guide pratique adapté au Maroc.",
    metaTitle: "Aliments riches en fer : bien les choisir | Maroc",
    metaDesc: "Aliments riches en fer : sources animales et végétales, rôle de la vitamine C pour l'absorption, effet du thé et du café, et personnes à risque. Guide pratique adapté au Maroc.",
    readingTime: 5, content: cAlimentsFer, keyTakeaways: alimentsFerTk, faq: alimentsFerFaq },
  { pillarSlug: "anemie-maroc", categorySlug: "maladies-traitements", aboutEntity: "Anémie de la grossesse",
    slug: "anemie-grossesse-maroc", title: "Anémie et grossesse : dépistage et prise en charge",
    excerpt: "Anémie pendant la grossesse : pourquoi elle est fréquente, signes, risques, et prise en charge (fer, acide folique, alimentation). Un guide clair et rassurant, adapté au Maroc.",
    metaTitle: "Anémie et grossesse : dépistage et prise en charge | Maroc",
    metaDesc: "Anémie et grossesse : pourquoi elle est fréquente, signes, risques pour la mère et l'enfant, et prise en charge (fer, acide folique, alimentation). Guide clair adapté au Maroc.",
    readingTime: 5, content: cAnemieGrossesse, keyTakeaways: anemieGrossesseTk, faq: anemieGrossesseFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (slug) => { const c = cats.find((x) => x.slug === slug); if (!c) throw new Error(`Catégorie introuvable : ${slug}`); return c.id; };

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
      title: art.title, excerpt: art.excerpt, content: art.content, categoryId: catId(art.categorySlug),
      metaTitle: art.metaTitle, metaDesc: art.metaDesc, readingTime: art.readingTime,
      keyTakeaways: art.keyTakeaways.join("\n"), faqJson: JSON.stringify(art.faq), aboutEntity: art.aboutEntity,
      pillarId: pillarId[art.pillarSlug], reviewedById: admin.id, reviewedAt: now,
    };
    const post = await prisma.post.upsert({
      where: { slug: art.slug }, update: data,
      create: { ...data, slug: art.slug, authorId: admin.id, status: "PUBLISHED", publishedAt: now },
      select: { slug: true },
    });
    console.log(`  ↳ satellite [${art.pillarSlug.split("-")[0]}] /blog/${post.slug}`);
  }
  console.log(`\nCocons vague 2 : ${pillarSlugs.length} piliers densifiés, ${SATELLITES.length} satellites publiés.`);
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
