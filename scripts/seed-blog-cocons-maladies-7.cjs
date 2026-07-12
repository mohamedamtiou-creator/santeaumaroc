require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DENSIFICATION EN COCONS — vague 7 : Zona, Hémorroïdes, Varices.
//   • Zona (zona-maroc) → dermatologie
//   • Hémorroïdes (hemorroides-maroc) → gastro-entérologie
//   • Varices (varices-maroc) → médecine générale
// Idempotent (upsert). Mappings : lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ═══ ZONA ═════════════════════════════════════════════════════════════════════
const cZonaOeil = `<p>Le zona ophtalmique touche le territoire du nerf autour de l'œil. Contrairement au <a href="/blog/zona-maroc">zona</a> habituel, il constitue une urgence : il peut menacer la vue. Le reconnaître vite et consulter sans tarder est essentiel.</p>

<h2>Comment le reconnaître ?</h2>
<p>Il associe les signes du zona (douleur, brûlure puis éruption de vésicules d'un seul côté) au niveau du <strong>front, du cuir chevelu ou autour de l'œil</strong>. Un œil rouge, douloureux, une baisse de la vue ou des vésicules sur le bout du nez doivent particulièrement alerter.</p>

<blockquote>Attention : le zona ophtalmique est une urgence. Consultez immédiatement — un avis ophtalmologique est souvent nécessaire, car l'atteinte de l'œil peut laisser des séquelles.</blockquote>

<h2>Pourquoi c'est urgent</h2>
<p>Le virus peut atteindre les structures de l'œil (cornée, etc.) et menacer la vision. Un traitement <strong>antiviral débuté tôt</strong> (idéalement dans les 72 heures) réduit ce risque.</p>

<h2>Le traitement</h2>
<p>Antiviraux par voie générale, antalgiques, et prise en charge ophtalmologique de l'atteinte oculaire. Le suivi est important pour dépister d'éventuelles complications.</p>

<hr>
<p>Une éruption douloureuse autour de l'œil ? Consultez en urgence. Sur SantéauMaroc, trouvez un médecin ou un dermatologue près de chez vous.</p>`;
const zonaOeilFaq = [
  { q: "Le zona de l'œil est-il grave ?", a: "Oui, le zona ophtalmique est une urgence car il peut atteindre les structures de l'œil et menacer la vue. Il faut consulter immédiatement ; un avis ophtalmologique est souvent nécessaire, et un traitement antiviral précoce réduit le risque de séquelles." },
  { q: "Comment reconnaître un zona ophtalmique ?", a: "Par les signes du zona (douleur, brûlure puis vésicules d'un seul côté) au niveau du front, du cuir chevelu ou autour de l'œil. Un œil rouge, douloureux, une baisse de vue ou des vésicules sur le bout du nez doivent particulièrement alerter." },
  { q: "Que faire en cas de zona près de l'œil ?", a: "Consulter en urgence, sans attendre. Le traitement antiviral est d'autant plus efficace qu'il est débuté tôt (idéalement dans les 72 heures), et une prise en charge ophtalmologique est souvent nécessaire pour protéger la vue." },
  { q: "Le zona ophtalmique laisse-t-il des séquelles ?", a: "Il peut, s'il n'est pas pris en charge à temps, laisser des séquelles oculaires (atteinte de la cornée, baisse de vision) et des douleurs persistantes. Un traitement précoce et un suivi ophtalmologique réduisent nettement ce risque." },
  { q: "Le zona ophtalmique est-il fréquent ?", a: "C'est l'une des localisations du zona, moins fréquente que le zona du thorax, mais importante à connaître en raison de sa gravité potentielle pour l'œil. Toute éruption de zona sur le visage doit faire consulter rapidement." },
];
const zonaOeilTk = [
  "Le zona ophtalmique touche le territoire autour de l'œil : c'est une urgence.",
  "Signes d'alerte : œil rouge/douloureux, baisse de vue, vésicules sur le bout du nez.",
  "Consulter immédiatement ; antiviral précoce (< 72 h) et avis ophtalmologique.",
  "Pris à temps, il réduit le risque de séquelles pour la vue.",
];

const cPostZona = `<p>Après la guérison de l'éruption du <a href="/blog/zona-maroc">zona</a>, des douleurs peuvent persister sur la zone atteinte : ce sont les douleurs post-zostériennes. Fréquentes chez la personne âgée, elles peuvent être invalidantes, mais se traitent.</p>

<h2>Qu'est-ce que c'est ?</h2>
<p>Ce sont des douleurs nerveuses (brûlures, décharges, sensibilité au moindre contact) qui persistent des semaines ou des mois après la disparition des lésions du zona, sur le territoire du nerf touché.</p>

<h2>Qui est le plus concerné ?</h2>
<p>Le risque augmente avec l'<strong>âge</strong> et lorsque le zona a été douloureux ou étendu. C'est la complication la plus fréquente du zona.</p>

<h2>Comment les soulager ?</h2>
<ul>
<li>Des <strong>traitements spécifiques de la douleur nerveuse</strong> (différents des antalgiques classiques), sur prescription.</li>
<li>Parfois des traitements locaux.</li>
<li>De la patience : elles s'atténuent le plus souvent avec le temps.</li>
</ul>

<h2>Comment les prévenir ?</h2>
<p>Un <strong>traitement antiviral débuté tôt</strong> lors du zona réduit le risque. Chez la personne âgée, le <a href="/blog/vaccin-zona-maroc">vaccin contre le zona</a> diminue aussi ce risque.</p>

<hr>
<p>Des douleurs qui persistent après un zona ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const postZonaFaq = [
  { q: "Qu'est-ce que les douleurs post-zona ?", a: "Ce sont des douleurs nerveuses (brûlures, décharges, sensibilité au moindre contact) qui persistent des semaines ou des mois après la guérison de l'éruption du zona, sur le territoire du nerf atteint. C'est la complication la plus fréquente du zona." },
  { q: "Qui risque des douleurs après un zona ?", a: "Le risque augmente avec l'âge et lorsque le zona a été très douloureux ou étendu. Les personnes âgées sont les plus concernées, d'où l'intérêt d'un traitement antiviral précoce et, chez elles, de la vaccination." },
  { q: "Comment soulager les douleurs post-zostériennes ?", a: "Par des traitements spécifiques de la douleur nerveuse (différents des antalgiques habituels), sur prescription, parfois complétés de traitements locaux. Elles s'atténuent le plus souvent avec le temps, mais peuvent nécessiter un suivi." },
  { q: "Les douleurs post-zona disparaissent-elles ?", a: "Le plus souvent, elles s'atténuent progressivement sur des semaines à des mois. Chez certaines personnes, surtout âgées, elles peuvent durer plus longtemps et être invalidantes, ce qui justifie une prise en charge de la douleur." },
  { q: "Comment éviter les douleurs après un zona ?", a: "En traitant le zona par antiviral le plus tôt possible (idéalement dans les 72 heures), ce qui réduit le risque. Chez la personne âgée, le vaccin contre le zona diminue aussi la fréquence de ces douleurs." },
];
const postZonaTk = [
  "Les douleurs post-zona persistent après la guérison de l'éruption.",
  "Ce sont des douleurs nerveuses, plus fréquentes et durables chez le sujet âgé.",
  "Traitées par des médicaments spécifiques de la douleur nerveuse.",
  "Prévention : antiviral précoce lors du zona, et vaccin chez la personne âgée.",
];

const cVaccinZona = `<p>Un vaccin contre le <a href="/blog/zona-maroc">zona</a> existe. Destiné surtout aux personnes âgées, il réduit le risque de développer un zona et, surtout, ses douleurs persistantes, souvent invalidantes.</p>

<h2>Pourquoi vacciner contre le zona ?</h2>
<p>Le zona est dû au réveil du virus de la varicelle, favorisé par l'âge et la baisse des défenses immunitaires. Le vaccin renforce l'immunité contre ce virus et diminue le risque de zona et de <a href="/blog/douleurs-post-zona-maroc">douleurs post-zostériennes</a>.</p>

<h2>Pour qui ?</h2>
<p>Il est surtout recommandé chez les <strong>personnes âgées</strong> (à partir d'un certain âge, selon les recommandations), y compris celles ayant déjà fait un zona. Votre médecin évalue s'il vous est indiqué.</p>

<h2>Ce qu'il faut savoir</h2>
<ul>
<li>Il ne traite pas un zona en cours : c'est un vaccin <strong>préventif</strong>.</li>
<li>Comme tout vaccin, il peut donner des réactions locales passagères.</li>
<li>Certaines situations (immunité très affaiblie) nécessitent un avis spécialisé.</li>
</ul>

<h2>En parler à son médecin</h2>
<p>La disponibilité et les recommandations peuvent évoluer. Demandez à votre médecin si la vaccination contre le zona vous est conseillée et comment y accéder.</p>

<hr>
<p>La vaccination contre le zona vous concerne-t-elle ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const vaccinZonaFaq = [
  { q: "À quoi sert le vaccin contre le zona ?", a: "À réduire le risque de développer un zona et, surtout, ses douleurs persistantes (post-zostériennes), souvent invalidantes. Il renforce l'immunité contre le virus responsable, favorisé par l'âge et la baisse des défenses immunitaires." },
  { q: "Qui devrait se faire vacciner contre le zona ?", a: "Surtout les personnes âgées, à partir d'un certain âge selon les recommandations, y compris celles ayant déjà eu un zona. Votre médecin évalue si la vaccination vous est indiquée en fonction de votre situation." },
  { q: "Le vaccin contre le zona traite-t-il un zona en cours ?", a: "Non, c'est un vaccin préventif : il ne traite pas un zona déjà déclaré. Il vise à réduire le risque de futurs zonas et de leurs complications douloureuses. Un zona en cours se traite par antiviral." },
  { q: "Peut-on se faire vacciner si on a déjà eu un zona ?", a: "Oui, la vaccination peut être proposée même après un zona, car il est possible d'en refaire. Le médecin en évalue l'intérêt selon l'âge et la situation. Il ne faut pas vacciner pendant un zona en cours." },
  { q: "Le vaccin contre le zona a-t-il des effets secondaires ?", a: "Comme tout vaccin, il peut entraîner des réactions locales passagères (douleur, rougeur) et parfois des symptômes généraux légers. Certaines situations d'immunité très affaiblie nécessitent un avis spécialisé avant vaccination." },
];
const vaccinZonaTk = [
  "Le vaccin contre le zona réduit le risque de zona et de douleurs persistantes.",
  "Surtout recommandé chez la personne âgée, sur avis médical.",
  "C'est un vaccin préventif : il ne traite pas un zona en cours.",
  "En parler à son médecin (recommandations et disponibilité évolutives).",
];

// ═══ HÉMORROÏDES ══════════════════════════════════════════════════════════════
const cCriseHemo = `<p>La crise hémorroïdaire est une poussée douloureuse des <a href="/blog/hemorroides-maroc">hémorroïdes</a>. Fréquente et bénigne, elle se soulage bien. L'essentiel est de régulariser le transit et de calmer les symptômes — tout en faisant vérifier un éventuel saignement.</p>

<h2>Reconnaître la crise</h2>
<p>Douleur, gêne ou démangeaisons de la région anale, parfois saignement de sang rouge vif à la selle, ou petite tuméfaction douloureuse en cas de caillot.</p>

<h2>Que faire pour soulager ?</h2>
<ul>
<li><strong>Régulariser le transit</strong> : fibres, hydratation, éviter de forcer et de rester longtemps aux toilettes.</li>
<li>Traitements locaux (crèmes, suppositoires) et antalgiques, sur conseil.</li>
<li>Bains de siège tièdes ; éviter les aliments très épicés le temps de la crise.</li>
</ul>

<blockquote>Attention : ne jamais attribuer un saignement d'emblée aux hémorroïdes sans avis médical, surtout après 50 ans ou en cas de changement du transit — voir <a href="/blog/cancer-colorectal-signes-alerte-maroc">signes d'alerte du cancer colorectal</a>. Tout saignement se fait vérifier.</blockquote>

<h2>Quand consulter ?</h2>
<p>En cas de douleur intense, de saignement, de crises répétées, ou de tuméfaction dure et très douloureuse (caillot). Le médecin peut proposer un <a href="/blog/traitement-hemorroides-maroc">traitement</a> adapté.</p>

<hr>
<p>Une crise gênante ou un saignement à vérifier ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const criseHemoFaq = [
  { q: "Comment soulager une crise hémorroïdaire ?", a: "En régularisant le transit (fibres, hydratation, éviter de forcer et de rester longtemps aux toilettes), avec des traitements locaux (crèmes, suppositoires) et des antalgiques sur conseil, et des bains de siège tièdes. Éviter les aliments très épicés le temps de la crise." },
  { q: "Combien de temps dure une crise d'hémorroïdes ?", a: "Une crise dure en général quelques jours et s'améliore avec les mesures locales et la régularisation du transit. Si la douleur est intense, si un saignement survient ou si les crises se répètent, il faut consulter." },
  { q: "Un saignement est-il forcément dû aux hémorroïdes ?", a: "Non. Même si les hémorroïdes en sont une cause fréquente, un saignement peut avoir d'autres origines, dont le cancer colorectal. Il ne faut jamais l'attribuer d'emblée aux hémorroïdes sans avis, surtout après 50 ans ou avec un changement du transit." },
  { q: "Quand consulter pour une crise hémorroïdaire ?", a: "En cas de douleur intense, de saignement, de crises répétées ou d'une tuméfaction dure et très douloureuse (caillot). Le médecin confirme le diagnostic, écarte une autre cause de saignement et propose un traitement adapté." },
  { q: "Qu'est-ce qui déclenche une crise d'hémorroïdes ?", a: "Souvent la constipation et les efforts de poussée, mais aussi la grossesse, la position assise prolongée, les repas très épicés et certains épisodes de la vie. Régulariser le transit est la meilleure prévention des crises." },
];
const criseHemoTk = [
  "La crise hémorroïdaire est une poussée douloureuse, fréquente et bénigne.",
  "Soulager : régulariser le transit, traitements locaux, bains de siège.",
  "Ne jamais attribuer un saignement aux hémorroïdes sans avis (surtout après 50 ans).",
  "Consulter si douleur intense, saignement ou crises répétées.",
];

const cHemoGrossesse = `<p>Les hémorroïdes sont très fréquentes pendant la grossesse et après l'accouchement. Gênantes mais bénignes, elles se soulagent par des mesures simples et des traitements adaptés à cette période.</p>

<h2>Pourquoi pendant la grossesse ?</h2>
<p>La pression exercée par l'utérus, les changements hormonaux et la <a href="/blog/constipation-maroc">constipation</a> fréquente favorisent les <a href="/blog/hemorroides-maroc">hémorroïdes</a>, surtout en fin de grossesse et lors de l'accouchement.</p>

<h2>Comment les soulager ?</h2>
<ul>
<li>Lutter contre la constipation : fibres, hydratation, activité physique douce.</li>
<li>Éviter de forcer et de rester longtemps aux toilettes.</li>
<li>Traitements locaux <strong>adaptés à la grossesse</strong>, sur avis médical.</li>
</ul>

<blockquote>Attention : pendant la grossesse et l'allaitement, ne prenez pas de médicament sans avis. Demandez conseil à votre médecin, votre sage-femme ou votre pharmacien pour un traitement adapté.</blockquote>

<h2>Après l'accouchement</h2>
<p>Les hémorroïdes régressent souvent dans les semaines suivant la naissance, avec les mesures d'hygiène de vie. Si elles persistent ou sont très gênantes, une prise en charge est possible.</p>

<h2>Quand consulter ?</h2>
<p>En cas de douleur importante, de saignement, ou de gêne persistante. Tout saignement doit être évalué, même s'il est probablement d'origine hémorroïdaire.</p>

<hr>
<p>Des hémorroïdes pendant la grossesse ? Sur SantéauMaroc, trouvez un médecin, une sage-femme ou un gynécologue près de chez vous.</p>`;
const hemoGrossesseFaq = [
  { q: "Pourquoi a-t-on des hémorroïdes pendant la grossesse ?", a: "À cause de la pression de l'utérus, des changements hormonaux et de la constipation fréquente, surtout en fin de grossesse et lors de l'accouchement. C'est très courant et bénin, mais gênant." },
  { q: "Comment soulager les hémorroïdes enceinte ?", a: "En luttant contre la constipation (fibres, hydratation, activité douce), en évitant de forcer et de rester longtemps aux toilettes, et avec des traitements locaux adaptés à la grossesse, sur avis médical. Ne pas prendre de médicament sans conseil." },
  { q: "Les hémorroïdes disparaissent-elles après l'accouchement ?", a: "Souvent, oui : elles régressent dans les semaines suivant la naissance avec les mesures d'hygiène de vie. Si elles persistent ou sont très gênantes, une prise en charge est possible auprès du médecin." },
  { q: "Peut-on se traiter les hémorroïdes soi-même enceinte ?", a: "Il ne faut pas prendre de médicament sans avis pendant la grossesse ou l'allaitement. Les mesures d'hygiène de vie sont sûres ; pour un traitement local, demandez conseil à votre médecin, votre sage-femme ou votre pharmacien." },
  { q: "Un saignement hémorroïdaire enceinte est-il inquiétant ?", a: "Un saignement anal est fréquent avec les hémorroïdes, mais il doit toujours être évalué, même pendant la grossesse, pour confirmer son origine. En parler à son médecin ou sa sage-femme permet d'être rassurée et bien orientée." },
];
const hemoGrossesseTk = [
  "Les hémorroïdes sont très fréquentes pendant la grossesse et après l'accouchement.",
  "Favorisées par la pression de l'utérus, les hormones et la constipation.",
  "Soulager : lutter contre la constipation + traitements locaux adaptés (sur avis).",
  "Ne pas se médiquer seule enceinte ; tout saignement se fait évaluer.",
];

const cTraitementHemo = `<p>Au-delà des mesures d'hygiène de vie, plusieurs traitements existent pour les <a href="/blog/hemorroides-maroc">hémorroïdes</a>, du traitement local aux gestes spécialisés. Le choix dépend de la gêne et du type d'hémorroïdes.</p>

<h2>La base : régulariser le transit</h2>
<p>Fibres, hydratation, activité physique et lutte contre la <a href="/blog/constipation-maroc">constipation</a> sont la première étape, et souvent la plus efficace pour éviter les crises.</p>

<h2>Les traitements médicaux</h2>
<ul>
<li><strong>Traitements locaux</strong> (crèmes, suppositoires) et <strong>antalgiques</strong> pour soulager les crises.</li>
<li><strong>Veinotoniques</strong> parfois proposés lors des poussées.</li>
</ul>

<h2>Les traitements instrumentaux</h2>
<p>Pour les hémorroïdes internes gênantes, des gestes réalisés en consultation (comme la <strong>ligature élastique</strong>) peuvent être proposés, sans hospitalisation.</p>

<h2>La chirurgie</h2>
<p>Réservée aux formes sévères ou rebelles, elle est efficace mais suivie de suites parfois douloureuses. Elle se discute avec le spécialiste (proctologue).</p>

<blockquote>Bon à savoir : avant tout traitement, un examen est nécessaire pour confirmer le diagnostic et écarter une autre cause de saignement. Tout saignement se fait vérifier.</blockquote>

<hr>
<p>Des hémorroïdes à traiter ? Sur SantéauMaroc, trouvez un gastro-entérologue (proctologue) près de chez vous.</p>`;
const traitementHemoFaq = [
  { q: "Quels sont les traitements des hémorroïdes ?", a: "D'abord la régularisation du transit (fibres, hydratation), puis les traitements locaux (crèmes, suppositoires) et antalgiques pour les crises. Pour les formes gênantes : des gestes instrumentaux (ligature élastique) en consultation, et la chirurgie pour les formes sévères ou rebelles." },
  { q: "Qu'est-ce que la ligature élastique des hémorroïdes ?", a: "C'est un geste réalisé en consultation, sans hospitalisation, qui consiste à poser un petit élastique à la base d'une hémorroïde interne pour la faire régresser. C'est une option pour les hémorroïdes internes gênantes, proposée par le spécialiste." },
  { q: "Faut-il opérer les hémorroïdes ?", a: "Non dans la plupart des cas. La chirurgie est réservée aux formes sévères ou rebelles aux autres traitements. Elle est efficace mais peut être suivie de suites douloureuses. La décision se prend avec un spécialiste (proctologue) selon la gêne." },
  { q: "Les traitements locaux guérissent-ils les hémorroïdes ?", a: "Ils soulagent les symptômes des crises (douleur, démangeaisons) mais ne « guérissent » pas définitivement. La base reste la régularisation du transit. Pour les formes persistantes, des gestes instrumentaux ou chirurgicaux peuvent être nécessaires." },
  { q: "Faut-il un examen avant de traiter des hémorroïdes ?", a: "Oui. Un examen est nécessaire pour confirmer le diagnostic et surtout écarter une autre cause de saignement, comme un cancer colorectal, avant tout traitement. Tout saignement doit être évalué médicalement." },
];
const traitementHemoTk = [
  "La base du traitement des hémorroïdes est la régularisation du transit.",
  "Traitements locaux et antalgiques pour les crises ; veinotoniques parfois.",
  "Gestes instrumentaux (ligature élastique) pour les formes gênantes.",
  "Chirurgie réservée aux formes sévères ; un examen préalable écarte une autre cause.",
];

// ═══ VARICES ══════════════════════════════════════════════════════════════════
const cJambesLourdes = `<p>Les jambes lourdes, surtout en fin de journée, sont le premier signe de l'insuffisance veineuse, dont les <a href="/blog/varices-maroc">varices</a> sont la manifestation visible. Gênante et fréquente, elle se soulage bien par des mesures simples.</p>

<h2>Qu'est-ce que l'insuffisance veineuse ?</h2>
<p>Les veines des jambes ramènent le sang vers le cœur grâce à des valves. Quand elles fonctionnent mal, le sang stagne : d'où la sensation de lourdeur, les gonflements et, à terme, les varices.</p>

<h2>Les symptômes</h2>
<ul>
<li>Jambes lourdes, douloureuses, surtout le soir et par temps chaud</li>
<li>Gonflement des chevilles, démangeaisons, crampes nocturnes</li>
<li>Veines apparentes et sinueuses</li>
</ul>

<h2>Comment soulager ?</h2>
<ul>
<li><strong>Marcher</strong> régulièrement, surélever les jambes, éviter la station debout ou assise prolongée.</li>
<li>Porter une <a href="/blog/bas-contention-varices-maroc">contention</a> si conseillée ; éviter la chaleur sur les jambes.</li>
<li>Maintenir un poids sain ; les veinotoniques peuvent soulager.</li>
</ul>

<blockquote>Attention : une douleur d'un mollet, avec rougeur, chaleur et gonflement d'apparition récente, doit faire évoquer une phlébite — urgence. Consultez sans attendre.</blockquote>

<hr>
<p>Des jambes lourdes qui gênent ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const jambesLourdesFaq = [
  { q: "Pourquoi ai-je les jambes lourdes le soir ?", a: "C'est le signe d'une insuffisance veineuse : les veines des jambes ramènent moins bien le sang vers le cœur, qui stagne, d'où la lourdeur, surtout en fin de journée et par temps chaud. Marcher et surélever les jambes soulagent." },
  { q: "Comment soulager les jambes lourdes ?", a: "En marchant régulièrement, en surélevant les jambes, en évitant la station debout ou assise prolongée et la chaleur, en portant une contention si conseillée et en maintenant un poids sain. Les veinotoniques peuvent aider à soulager les symptômes." },
  { q: "Jambes lourdes et varices, quel lien ?", a: "Les jambes lourdes traduisent une insuffisance veineuse, dont les varices sont la manifestation visible. On peut avoir des jambes lourdes avant l'apparition de varices ; les deux relèvent des mêmes mesures et d'un avis médical si cela s'aggrave." },
  { q: "Quand consulter pour des jambes lourdes ?", a: "Si la gêne est importante, s'aggrave, ou en cas de varices, de troubles de la peau ou d'ulcère. En urgence si un mollet devient douloureux, rouge, chaud et gonflé récemment (suspicion de phlébite)." },
  { q: "La contention est-elle utile contre les jambes lourdes ?", a: "Oui, les bas de contention aident le sang à remonter et soulagent nettement la lourdeur et les gonflements. Ils sont particulièrement utiles en cas de station debout prolongée, de voyage ou de grossesse, sur conseil médical." },
];
const jambesLourdesTk = [
  "Les jambes lourdes traduisent une insuffisance veineuse (dont les varices sont le signe visible).",
  "Symptômes : lourdeur le soir, chevilles gonflées, veines apparentes.",
  "Soulager : marche, surélever les jambes, contention, éviter la chaleur.",
  "Mollet rouge, chaud, gonflé récemment = suspicion de phlébite, urgence.",
];

const cContention = `<p>Les bas de contention (ou de compression) sont un traitement de base de l'insuffisance veineuse et des <a href="/blog/varices-maroc">varices</a>. Bien utilisés, ils soulagent efficacement les <a href="/blog/jambes-lourdes-insuffisance-veineuse-maroc">jambes lourdes</a> et préviennent les complications.</p>

<h2>À quoi servent-ils ?</h2>
<p>Ils exercent une pression dégressive sur la jambe (plus forte à la cheville) qui aide le sang à remonter vers le cœur. Résultat : moins de lourdeur, de gonflement et de risque de complications veineuses.</p>

<h2>Quand les porter ?</h2>
<ul>
<li>En cas de jambes lourdes, de varices, d'œdème veineux.</li>
<li>Lors des situations à risque : station debout prolongée, long voyage, grossesse.</li>
<li>Après certains gestes sur les varices, sur avis médical.</li>
</ul>

<h2>Comment bien les utiliser ?</h2>
<ul>
<li>Les enfiler <strong>le matin</strong>, jambes « dégonflées », avant de se lever si possible.</li>
<li>Choisir la bonne taille et la bonne classe de compression, sur conseil.</li>
<li>Les porter la journée, les retirer la nuit (sauf indication contraire).</li>
</ul>

<h2>Contre-indications</h2>
<p>Certaines maladies des artères des jambes contre-indiquent la contention : un avis médical est nécessaire avant de les porter en cas de doute.</p>

<hr>
<p>Des jambes lourdes ou des varices ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const contentionFaq = [
  { q: "À quoi servent les bas de contention ?", a: "Ils exercent une pression dégressive sur la jambe (plus forte à la cheville) qui aide le sang à remonter vers le cœur. Ils soulagent les jambes lourdes et les gonflements, et préviennent les complications de l'insuffisance veineuse." },
  { q: "Quand porter des bas de contention ?", a: "En cas de jambes lourdes, de varices ou d'œdème veineux, et dans les situations à risque : station debout prolongée, long voyage, grossesse, ou après certains gestes sur les varices. Le médecin conseille la classe et la durée." },
  { q: "Comment bien mettre ses bas de contention ?", a: "Les enfiler le matin, jambes « dégonflées », si possible avant de se lever, en choisissant la bonne taille et la bonne classe de compression. On les porte la journée et on les retire la nuit, sauf indication contraire." },
  { q: "Les bas de contention ont-ils des contre-indications ?", a: "Oui : certaines maladies des artères des jambes contre-indiquent la contention. En cas de doute, notamment chez les personnes âgées ou diabétiques, un avis médical est nécessaire avant de porter des bas de compression." },
  { q: "La contention fait-elle disparaître les varices ?", a: "Non, elle ne fait pas disparaître les varices, mais elle soulage les symptômes et prévient l'aggravation et les complications. Pour supprimer des varices, d'autres traitements (sclérose, laser, chirurgie) sont proposés selon les cas." },
];
const contentionTk = [
  "Les bas de contention aident le sang à remonter et soulagent les jambes lourdes.",
  "Utiles en cas de varices, de station debout prolongée, de voyage, de grossesse.",
  "À enfiler le matin, jambes dégonflées ; bonne taille et classe sur conseil.",
  "Certaines maladies des artères les contre-indiquent : avis médical si doute.",
];

const cTraitementVarices = `<p>Quand les mesures d'hygiène de vie et la <a href="/blog/bas-contention-varices-maroc">contention</a> ne suffisent pas, plusieurs traitements permettent de supprimer les <a href="/blog/varices-maroc">varices</a>. Le choix dépend du type de varices, précisé par un écho-doppler.</p>

<h2>Avant tout : le bilan</h2>
<p>Un <a href="/blog/echo-doppler-maroc">écho-doppler</a> des veines évalue le fonctionnement veineux et guide le traitement. Les mesures de base (marche, contention, poids) accompagnent toujours la prise en charge.</p>

<h2>Les traitements des varices</h2>
<ul>
<li><strong>Sclérose (sclérothérapie)</strong> : injection d'un produit qui « ferme » la varice, pour les petites et moyennes varices.</li>
<li><strong>Laser ou radiofréquence</strong> : traitement de la veine par la chaleur, à travers la peau ou par une petite sonde.</li>
<li><strong>Chirurgie</strong> : pour certaines varices importantes.</li>
</ul>

<h2>Après le traitement</h2>
<p>Le port de la contention est souvent recommandé quelque temps. La marche est encouragée. De nouvelles varices peuvent apparaître avec le temps : les mesures de prévention restent utiles.</p>

<blockquote>Bon à savoir : traiter des varices n'est pas qu'esthétique — cela soulage les symptômes et prévient des complications (troubles de la peau, ulcère). Le choix du traitement se fait avec un spécialiste des veines.</blockquote>

<hr>
<p>Des varices à traiter ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const traitementVaricesFaq = [
  { q: "Comment se débarrasser des varices ?", a: "Selon le type de varices, précisé par un écho-doppler : sclérose (injection), laser ou radiofréquence (traitement par la chaleur), ou chirurgie pour les varices importantes. Ces gestes s'accompagnent toujours des mesures de base (marche, contention)." },
  { q: "Qu'est-ce que la sclérose des varices ?", a: "La sclérothérapie consiste à injecter dans la varice un produit qui la « ferme » et la fait disparaître progressivement. Elle est adaptée aux petites et moyennes varices et se réalise le plus souvent en consultation." },
  { q: "Le traitement des varices est-il seulement esthétique ?", a: "Non. Traiter des varices soulage les symptômes (jambes lourdes, douleurs) et prévient des complications comme les troubles de la peau ou l'ulcère variqueux. Ce n'est donc pas qu'une question d'esthétique." },
  { q: "Les varices reviennent-elles après traitement ?", a: "De nouvelles varices peuvent apparaître avec le temps, car le terrain veineux persiste. C'est pourquoi les mesures de prévention (marche, contention, poids) restent utiles après le traitement, qui peut être complété si besoin." },
  { q: "Quel examen avant de traiter des varices ?", a: "Un écho-doppler des veines des jambes, qui évalue le fonctionnement veineux et guide le choix du traitement. Il est indispensable avant un geste sur les varices pour adapter la prise en charge à chaque situation." },
];
const traitementVaricesTk = [
  "Les varices se traitent par sclérose, laser/radiofréquence ou chirurgie.",
  "Un écho-doppler précise le type de varices et guide le traitement.",
  "Traiter n'est pas qu'esthétique : soulage et prévient les complications.",
  "De nouvelles varices peuvent apparaître : la prévention reste utile.",
];

// ─────────────────────────────────────────────────────────────────────────────
const SATELLITES = [
  { pillarSlug:"zona-maroc", categorySlug:"maladies-traitements", aboutEntity:"Zona ophtalmique",
    slug:"zona-ophtalmique-maroc", title:"Zona ophtalmique : une urgence pour l'œil",
    excerpt:"Zona de l'œil : comment le reconnaître, pourquoi c'est une urgence pour la vue et l'importance d'un traitement antiviral précoce. Un guide clair adapté au Maroc.",
    metaTitle:"Zona ophtalmique : une urgence pour l'œil | Maroc",
    metaDesc:"Zona ophtalmique (autour de l'œil) : signes d'alerte, pourquoi c'est une urgence menaçant la vue, traitement antiviral précoce et avis ophtalmologique. Adapté au Maroc.",
    readingTime:4, content:cZonaOeil, keyTakeaways:zonaOeilTk, faq:zonaOeilFaq },
  { pillarSlug:"zona-maroc", categorySlug:"maladies-traitements", aboutEntity:"Douleurs post-zostériennes",
    slug:"douleurs-post-zona-maroc", title:"Douleurs après un zona : comprendre et soulager",
    excerpt:"Douleurs post-zostériennes : ce qu'elles sont, qui est concerné, comment les soulager et les prévenir (antiviral précoce, vaccin). Un guide clair adapté au Maroc.",
    metaTitle:"Douleurs après un zona (post-zostériennes) | Maroc",
    metaDesc:"Douleurs post-zostériennes : douleurs nerveuses persistant après le zona, plus fréquentes chez le sujet âgé, comment les soulager et les prévenir. Guide clair adapté au Maroc.",
    readingTime:4, content:cPostZona, keyTakeaways:postZonaTk, faq:postZonaFaq },
  { pillarSlug:"zona-maroc", categorySlug:"maladies-traitements", aboutEntity:"Vaccin contre le zona",
    slug:"vaccin-zona-maroc", title:"Vaccin contre le zona : pour qui et pourquoi",
    excerpt:"Vaccin contre le zona : à quoi il sert, pour qui (surtout les seniors), ce qu'il faut savoir et comment en parler à son médecin. Un guide clair adapté au Maroc.",
    metaTitle:"Vaccin contre le zona : pour qui et pourquoi | Maroc",
    metaDesc:"Vaccin contre le zona : réduire le risque de zona et de douleurs persistantes, surtout chez la personne âgée, ce qu'il faut savoir et en parler à son médecin. Adapté au Maroc.",
    readingTime:4, content:cVaccinZona, keyTakeaways:vaccinZonaTk, faq:vaccinZonaFaq },

  { pillarSlug:"hemorroides-maroc", categorySlug:"maladies-traitements", aboutEntity:"Maladie hémorroïdaire",
    slug:"crise-hemorroidaire-que-faire-maroc", title:"Crise hémorroïdaire : que faire pour la soulager",
    excerpt:"Crise hémorroïdaire : reconnaître la poussée, comment la soulager, l'importance de vérifier un saignement et quand consulter. Un guide clair adapté au Maroc.",
    metaTitle:"Crise hémorroïdaire : que faire pour la soulager | Maroc",
    metaDesc:"Crise hémorroïdaire : reconnaître la poussée douloureuse, comment la soulager (transit, traitements locaux), vérifier tout saignement et quand consulter. Adapté au Maroc.",
    readingTime:4, content:cCriseHemo, keyTakeaways:criseHemoTk, faq:criseHemoFaq },
  { pillarSlug:"hemorroides-maroc", categorySlug:"maladies-traitements", aboutEntity:"Hémorroïdes de la grossesse",
    slug:"hemorroides-grossesse-maroc", title:"Hémorroïdes et grossesse : soulager sans risque",
    excerpt:"Hémorroïdes pendant la grossesse : pourquoi elles sont fréquentes, comment les soulager sans risque et quand consulter. Un guide clair adapté au Maroc.",
    metaTitle:"Hémorroïdes et grossesse : soulager sans risque | Maroc",
    metaDesc:"Hémorroïdes et grossesse : causes (pression, hormones, constipation), comment les soulager avec des traitements adaptés (sur avis) et quand consulter. Adapté au Maroc.",
    readingTime:4, content:cHemoGrossesse, keyTakeaways:hemoGrossesseTk, faq:hemoGrossesseFaq },
  { pillarSlug:"hemorroides-maroc", categorySlug:"maladies-traitements", aboutEntity:"Maladie hémorroïdaire",
    slug:"traitement-hemorroides-maroc", title:"Traitement des hémorroïdes : du local à la chirurgie",
    excerpt:"Traitements des hémorroïdes : régulariser le transit, traitements locaux, gestes instrumentaux (ligature) et chirurgie. Un guide clair adapté au Maroc.",
    metaTitle:"Traitement des hémorroïdes : options et conseils | Maroc",
    metaDesc:"Traitement des hémorroïdes : régulariser le transit, traitements locaux, ligature élastique et chirurgie pour les formes sévères, après un examen. Guide clair adapté au Maroc.",
    readingTime:4, content:cTraitementHemo, keyTakeaways:traitementHemoTk, faq:traitementHemoFaq },

  { pillarSlug:"varices-maroc", categorySlug:"maladies-traitements", aboutEntity:"Insuffisance veineuse",
    slug:"jambes-lourdes-insuffisance-veineuse-maroc", title:"Jambes lourdes et insuffisance veineuse : que faire ?",
    excerpt:"Jambes lourdes : comprendre l'insuffisance veineuse, les symptômes, comment soulager et l'alerte phlébite. Un guide clair adapté au Maroc.",
    metaTitle:"Jambes lourdes et insuffisance veineuse : que faire ? | Maroc",
    metaDesc:"Jambes lourdes : insuffisance veineuse, symptômes, comment soulager (marche, contention, surélever les jambes) et alerte phlébite. Guide clair adapté au Maroc.",
    readingTime:4, content:cJambesLourdes, keyTakeaways:jambesLourdesTk, faq:jambesLourdesFaq },
  { pillarSlug:"varices-maroc", categorySlug:"maladies-traitements", aboutEntity:"Varices",
    slug:"bas-contention-varices-maroc", title:"Bas de contention : à quoi ça sert et comment les porter",
    excerpt:"Bas de contention : leur rôle contre l'insuffisance veineuse et les varices, quand les porter, comment bien les utiliser et leurs contre-indications. Adapté au Maroc.",
    metaTitle:"Bas de contention : rôle et bon usage | Maroc",
    metaDesc:"Bas de contention (compression) : rôle contre jambes lourdes et varices, quand les porter, comment bien les enfiler et contre-indications. Guide clair adapté au Maroc.",
    readingTime:4, content:cContention, keyTakeaways:contentionTk, faq:contentionFaq },
  { pillarSlug:"varices-maroc", categorySlug:"maladies-traitements", aboutEntity:"Varices",
    slug:"traitement-varices-sclerose-laser-maroc", title:"Traiter les varices : sclérose, laser ou chirurgie",
    excerpt:"Traitement des varices : le bilan par écho-doppler, la sclérose, le laser/radiofréquence et la chirurgie, et les suites. Un guide clair adapté au Maroc.",
    metaTitle:"Traiter les varices : sclérose, laser ou chirurgie | Maroc",
    metaDesc:"Traitement des varices : bilan par écho-doppler, sclérothérapie, laser/radiofréquence, chirurgie et suites. Pas qu'esthétique : soulage et prévient. Adapté au Maroc.",
    readingTime:4, content:cTraitementVarices, keyTakeaways:traitementVaricesTk, faq:traitementVaricesFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (s) => { const c = cats.find(x=>x.slug===s); if(!c) throw new Error("cat "+s); return c.id; };
  const pillarSlugs = [...new Set(SATELLITES.map(s=>s.pillarSlug))];
  const pid = {};
  for (const s of pillarSlugs) { const p = await prisma.post.update({ where:{slug:s}, data:{pillarId:null}, select:{id:true,slug:true} }); pid[s]=p.id; console.log(`◆ ${p.slug}`); }
  const now = new Date();
  for (const art of SATELLITES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:catId(art.categorySlug), metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, pillarId:pid[art.pillarSlug], reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`  ↳ ${post.slug}`);
  }
  console.log(`\nCocons vague 7 : ${pillarSlugs.length} piliers, ${SATELLITES.length} satellites.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
