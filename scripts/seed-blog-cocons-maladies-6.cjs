require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DENSIFICATION EN COCONS — vague 6 : Hypothyroïdie, Cancer colorectal, Calculs.
//   • Hypothyroïdie (hypothyroidie-maroc) → endocrinologie
//   • Cancer colorectal (cancer-colorectal-maroc) → gastro-entérologie
//   • Calculs rénaux (calculs-renaux-maroc) → médecine générale
// Idempotent (upsert). Mappings : lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ═══ HYPOTHYROÏDIE ════════════════════════════════════════════════════════════
const cLevo = `<p>La lévothyroxine est le traitement de référence de l'<a href="/blog/hypothyroidie-maroc">hypothyroïdie</a>. Elle remplace l'hormone thyroïdienne que la glande ne produit plus assez. Bien prise et bien suivie, elle permet une vie tout à fait normale.</p>

<h2>À quoi sert-elle ?</h2>
<p>À apporter l'hormone thyroïdienne manquante, pour lever la fatigue, la prise de poids, la frilosité et les autres symptômes de l'hypothyroïdie. C'est une hormone identique à celle du corps.</p>

<h2>Comment la prendre ?</h2>
<ul>
<li>En général le <strong>matin, à jeun</strong>, avec un verre d'eau, en attendant un peu avant le petit-déjeuner.</li>
<li>Chaque jour, à la dose prescrite, sans sauter de prise.</li>
<li>La dose est ajustée <strong>selon la TSH</strong> (prise de sang de contrôle).</li>
</ul>

<h2>Points de vigilance</h2>
<p>Certains aliments, le café et des médicaments (fer, calcium, pansements gastriques) peuvent gêner son absorption : les espacer de la prise. Un surdosage donne des signes d'hyperthyroïdie (palpitations, nervosité) ; un sous-dosage laisse persister la fatigue. Ne modifiez jamais la dose seul.</p>

<h2>Un traitement au long cours</h2>
<p>Le plus souvent à vie, bien toléré et sans dépendance. Le suivi régulier de la TSH permet de trouver et de maintenir la bonne dose.</p>

<hr>
<p>Un traitement thyroïdien à équilibrer ? Sur SantéauMaroc, trouvez un médecin ou un endocrinologue près de chez vous.</p>`;
const levoFaq = [
  { q: "Comment prendre la lévothyroxine ?", a: "En général le matin à jeun, avec un verre d'eau, en attendant un peu avant de manger, chaque jour et à la dose prescrite. Elle ne doit pas être modifiée seul : la dose est ajustée par le médecin selon la TSH (prise de sang de contrôle)." },
  { q: "La lévothyroxine est-elle à prendre à vie ?", a: "Le plus souvent oui, car l'hypothyroïdie est durable (surtout dans la maladie de Hashimoto). Le traitement remplace l'hormone manquante, est bien toléré et ne crée pas de dépendance. Un suivi régulier de la TSH permet d'ajuster la dose." },
  { q: "Qu'est-ce qui gêne l'absorption de la lévothyroxine ?", a: "Le café, certains aliments et des médicaments comme le fer, le calcium ou les pansements gastriques peuvent réduire son absorption. Il faut les espacer de la prise du comprimé, qui se fait de préférence à jeun." },
  { q: "Que se passe-t-il si la dose n'est pas la bonne ?", a: "Un sous-dosage laisse persister la fatigue et les symptômes ; un surdosage donne des signes d'hyperthyroïdie (palpitations, nervosité, perte de poids). C'est pourquoi la dose est ajustée sur la TSH et ne doit jamais être modifiée soi-même." },
  { q: "Peut-on arrêter la lévothyroxine si on se sent bien ?", a: "Non, pas de sa propre initiative : se sentir bien signifie justement que la dose est adaptée. Arrêter ferait revenir l'hypothyroïdie. Toute modification se décide avec le médecin, sur la base de la TSH." },
];
const levoTk = [
  "La lévothyroxine remplace l'hormone thyroïdienne manquante dans l'hypothyroïdie.",
  "À prendre le matin à jeun, chaque jour ; dose ajustée sur la TSH.",
  "Café, fer, calcium, pansements gastriques gênent l'absorption : les espacer.",
  "Traitement souvent à vie, bien toléré ; ne jamais modifier la dose seul.",
];

const cThyroGrossesse = `<p>La thyroïde joue un rôle clé pendant la grossesse, pour la mère comme pour le développement du bébé. Une <a href="/blog/hypothyroidie-maroc">hypothyroïdie</a> mal équilibrée doit être corrigée : le suivi est renforcé pendant cette période.</p>

<h2>Pourquoi la thyroïde compte enceinte</h2>
<p>Les hormones thyroïdiennes sont indispensables au bon développement du cerveau du bébé, surtout en début de grossesse. Les besoins augmentent : une hypothyroïdie insuffisamment traitée peut avoir des conséquences.</p>

<h2>Si vous êtes déjà traitée</h2>
<ul>
<li>La dose de lévothyroxine doit souvent être <strong>augmentée</strong> dès le début de la grossesse, sur avis médical.</li>
<li>La <strong>TSH</strong> est surveillée plus régulièrement.</li>
<li>Ne modifiez jamais la dose seule : signalez rapidement votre grossesse.</li>
</ul>

<h2>Dépistage et découverte pendant la grossesse</h2>
<p>Un trouble thyroïdien peut être recherché en cas de symptômes, d'antécédents ou de facteurs de risque. Découverte pendant la grossesse, une hypothyroïdie se traite par lévothyroxine, sans danger pour le bébé lorsqu'elle est bien conduite.</p>

<h2>Après l'accouchement</h2>
<p>La dose est souvent réajustée après la naissance. Une inflammation de la thyroïde (thyroïdite du post-partum) peut aussi survenir dans les mois qui suivent : à évoquer devant une fatigue ou des troubles inhabituels.</p>

<hr>
<p>Enceinte avec un problème de thyroïde ? Sur SantéauMaroc, trouvez un médecin, un gynécologue ou un endocrinologue près de chez vous.</p>`;
const thyroGrossesseFaq = [
  { q: "Pourquoi surveiller la thyroïde pendant la grossesse ?", a: "Parce que les hormones thyroïdiennes sont indispensables au développement du cerveau du bébé, surtout en début de grossesse, et que les besoins augmentent. Une hypothyroïdie mal équilibrée peut avoir des conséquences : le suivi est donc renforcé." },
  { q: "Faut-il augmenter la lévothyroxine enceinte ?", a: "Souvent oui : la dose doit fréquemment être augmentée dès le début de la grossesse, sur avis médical, et la TSH surveillée plus régulièrement. Il faut signaler rapidement sa grossesse et ne jamais ajuster la dose soi-même." },
  { q: "L'hypothyroïdie est-elle dangereuse pour le bébé ?", a: "Une hypothyroïdie non traitée ou mal équilibrée peut nuire au développement du bébé. Bien traitée par lévothyroxine, avec un suivi de la TSH, elle n'est pas dangereuse : le traitement est justement là pour protéger la mère et l'enfant." },
  { q: "Peut-on prendre de la lévothyroxine enceinte ?", a: "Oui, la lévothyroxine est le traitement de l'hypothyroïdie et se poursuit (souvent à dose augmentée) pendant la grossesse, sans danger pour le bébé lorsqu'elle est bien conduite. Elle est même nécessaire pour son bon développement." },
  { q: "Qu'est-ce que la thyroïdite du post-partum ?", a: "C'est une inflammation de la thyroïde pouvant survenir dans les mois suivant l'accouchement, avec des phases d'hyper puis d'hypothyroïdie. Elle doit être évoquée devant une fatigue ou des troubles inhabituels après une naissance, et fait l'objet d'un suivi." },
];
const thyroGrossesseTk = [
  "Les hormones thyroïdiennes sont clés pour le développement du bébé.",
  "Sous traitement, la dose de lévothyroxine est souvent augmentée dès le début de grossesse.",
  "Signaler rapidement sa grossesse ; TSH surveillée de près ; ne pas ajuster seul.",
  "Penser à la thyroïdite du post-partum devant une fatigue inhabituelle après la naissance.",
];

const cHyper = `<p>L'hyperthyroïdie est l'inverse de l'<a href="/blog/hypothyroidie-maroc">hypothyroïdie</a> : la thyroïde produit trop d'hormones et le corps « s'emballe ». Moins fréquente, elle se reconnaît par des signes assez évocateurs et se traite bien.</p>

<h2>Les symptômes</h2>
<ul>
<li>Nervosité, irritabilité, tremblements des mains</li>
<li>Palpitations, cœur qui bat vite</li>
<li>Amaigrissement malgré un bon appétit, sueurs, sensibilité à la chaleur</li>
<li>Troubles du sommeil, diarrhée, parfois yeux qui « sortent »</li>
</ul>

<h2>Les causes</h2>
<p>Le plus souvent une maladie auto-immune (maladie de Basedow), parfois des nodules thyroïdiens ou une inflammation de la glande.</p>

<h2>Le diagnostic</h2>
<p>Une <a href="/blog/analyse-de-sang-maroc">prise de sang</a> : dans l'hyperthyroïdie, la <strong>TSH est basse</strong> et les hormones thyroïdiennes élevées. Le médecin complète par un dosage d'anticorps et une échographie.</p>

<h2>Le traitement</h2>
<p>Selon la cause : médicaments qui freinent la thyroïde, parfois iode radioactif ou chirurgie. Un traitement contrôle les symptômes (comme les palpitations) en attendant l'effet. Un suivi régulier est nécessaire.</p>

<blockquote>Attention : un emballement sévère avec fièvre, palpitations très rapides et malaise est rare mais grave — consultez en urgence.</blockquote>

<hr>
<p>Des signes d'hyperthyroïdie ? Sur SantéauMaroc, trouvez un médecin ou un endocrinologue près de chez vous.</p>`;
const hyperFaq = [
  { q: "Quels sont les symptômes de l'hyperthyroïdie ?", a: "Nervosité, irritabilité, tremblements des mains, palpitations, cœur qui bat vite, amaigrissement malgré un bon appétit, sueurs, sensibilité à la chaleur, troubles du sommeil et diarrhée. Dans la maladie de Basedow, les yeux peuvent sembler « sortir »." },
  { q: "Quelle différence entre hypo et hyperthyroïdie ?", a: "Dans l'hypothyroïdie, la thyroïde produit trop peu d'hormones et le corps tourne au ralenti (fatigue, prise de poids, frilosité). Dans l'hyperthyroïdie, elle en produit trop et le corps s'emballe (nervosité, palpitations, amaigrissement). Une prise de sang (TSH) les distingue." },
  { q: "Comment diagnostique-t-on l'hyperthyroïdie ?", a: "Par une prise de sang : la TSH est basse et les hormones thyroïdiennes élevées. Le médecin complète par un dosage d'anticorps et une échographie de la thyroïde pour en préciser la cause (maladie de Basedow, nodules, inflammation)." },
  { q: "L'hyperthyroïdie se soigne-t-elle ?", a: "Oui, bien. Selon la cause : médicaments qui freinent la thyroïde, parfois iode radioactif ou chirurgie. Un traitement contrôle les symptômes (palpitations) en attendant. Un suivi régulier est nécessaire pour adapter la prise en charge." },
  { q: "L'hyperthyroïdie fait-elle maigrir ?", a: "Oui, l'amaigrissement malgré un bon appétit est un signe classique, car le métabolisme s'accélère. Ce n'est pas une façon « saine » de maigrir : c'est un symptôme de maladie qui doit être diagnostiqué et traité, pas recherché." },
];
const hyperTk = [
  "L'hyperthyroïdie : la thyroïde produit trop d'hormones, le corps s'emballe.",
  "Signes : nervosité, palpitations, amaigrissement malgré l'appétit, sueurs.",
  "Diagnostic : prise de sang (TSH basse, hormones élevées).",
  "Se traite bien (médicaments, iode radioactif ou chirurgie) avec suivi.",
];

// ═══ CANCER COLORECTAL ════════════════════════════════════════════════════════
const cDepistageCCR = `<p>Le dépistage est l'arme la plus efficace contre le <a href="/blog/cancer-colorectal-maroc">cancer colorectal</a> : il permet de le détecter tôt, voire de l'éviter en retirant les polypes avant qu'ils ne deviennent cancéreux. Il s'adresse aux personnes sans symptôme, à partir d'un certain âge.</p>

<h2>Pourquoi se faire dépister ?</h2>
<p>Le cancer colorectal se développe lentement, souvent à partir d'un <a href="/blog/polypes-colon-maroc">polype</a>, sur plusieurs années. Détecté tôt, il se guérit dans la grande majorité des cas — d'où l'intérêt d'agir avant tout symptôme.</p>

<h2>Le test de recherche de sang dans les selles</h2>
<p>Simple et à faire chez soi, il détecte des traces de sang invisibles à l'œil. Recommandé <strong>à partir de 50 ans</strong> en l'absence de risque particulier, il se répète régulièrement. S'il est positif, une coloscopie est proposée.</p>

<h2>La coloscopie</h2>
<p>C'est l'examen de référence : elle explore tout le côlon, permet de <strong>retirer les polypes</strong> et de faire des prélèvements. Elle est proposée d'emblée en cas d'antécédents familiaux ou de facteurs de risque (voir la fiche <a href="/blog/coloscopie-maroc">coloscopie</a>).</p>

<h2>Qui doit être dépisté plus tôt ?</h2>
<p>Les personnes ayant des antécédents familiaux de cancer colorectal ou de polypes, ou certaines maladies de l'intestin, sur avis médical. Parlez-en à votre médecin pour connaître la stratégie adaptée.</p>

<hr>
<p>Un dépistage à organiser ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const depistageCCRFaq = [
  { q: "À partir de quel âge dépister le cancer colorectal ?", a: "Dès 50 ans en l'absence de risque particulier, par un test de recherche de sang dans les selles à répéter régulièrement. Plus tôt en cas d'antécédents familiaux de cancer colorectal ou de polypes, sur avis médical." },
  { q: "En quoi consiste le test de dépistage ?", a: "C'est un test simple à réaliser chez soi, qui recherche des traces de sang invisibles dans les selles. S'il est positif, une coloscopie est proposée pour en trouver la cause. Il est recommandé tous les deux ans à partir de 50 ans." },
  { q: "Le dépistage peut-il éviter le cancer ?", a: "Oui, en partie : la coloscopie permet de retirer les polypes avant qu'ils ne deviennent cancéreux, ce qui prévient l'apparition du cancer. Détecté tôt par le dépistage, le cancer colorectal se guérit aussi dans la grande majorité des cas." },
  { q: "Faut-il une coloscopie si le test est positif ?", a: "Oui. Un test de dépistage positif ne signifie pas forcément un cancer, mais impose une coloscopie pour en rechercher la cause (polype, autre lésion) et, le cas échéant, retirer un polype ou faire des prélèvements." },
  { q: "Qui doit être dépisté plus tôt ou par coloscopie d'emblée ?", a: "Les personnes ayant des antécédents familiaux de cancer colorectal ou de polypes, ou certaines maladies inflammatoires de l'intestin. Pour elles, une coloscopie est souvent proposée d'emblée et plus tôt. Le médecin définit la stratégie adaptée." },
];
const depistageCCRTk = [
  "Le dépistage détecte le cancer colorectal tôt, voire l'évite (retrait des polypes).",
  "Test de sang dans les selles dès 50 ans, à répéter ; coloscopie si positif.",
  "Coloscopie d'emblée en cas d'antécédents familiaux ou de facteurs de risque.",
  "Détecté tôt, ce cancer se guérit dans la grande majorité des cas.",
];

const cPolypes = `<p>Un polype du côlon est une petite excroissance sur la paroi interne de l'intestin. Le plus souvent bénin, il peut, pour certains types et avec le temps, évoluer vers un <a href="/blog/cancer-colorectal-maroc">cancer colorectal</a>. Les retirer, c'est prévenir ce cancer.</p>

<h2>Qu'est-ce qu'un polype ?</h2>
<p>C'est une petite masse qui fait saillie dans le côlon ou le rectum. Il existe plusieurs types : la plupart ne deviennent jamais cancéreux, mais certains (les adénomes) peuvent se transformer sur plusieurs années.</p>

<h2>Y a-t-il des symptômes ?</h2>
<p>Le plus souvent <strong>aucun</strong>. Les polypes sont généralement découverts lors d'une <a href="/blog/coloscopie-maroc">coloscopie</a>, notamment de dépistage. Plus rarement, un gros polype peut saigner.</p>

<h2>Que fait-on d'un polype ?</h2>
<p>Lors de la coloscopie, le polype est le plus souvent <strong>retiré dans le même temps</strong> (polypectomie), puis analysé. Ce geste simple prévient l'évolution vers un cancer.</p>

<h2>Et après ?</h2>
<p>Selon le type, la taille et le nombre de polypes retirés, le médecin propose un <strong>rythme de surveillance</strong> par coloscopie. Avoir eu des polypes justifie un suivi et incite à surveiller aussi l'entourage familial.</p>

<hr>
<p>Des polypes à surveiller ou un dépistage à faire ? Sur SantéauMaroc, trouvez un gastro-entérologue près de chez vous.</p>`;
const polypesFaq = [
  { q: "Qu'est-ce qu'un polype du côlon ?", a: "C'est une petite excroissance sur la paroi interne du côlon ou du rectum. La plupart sont bénins et ne deviennent jamais cancéreux, mais certains types (les adénomes) peuvent se transformer en cancer sur plusieurs années." },
  { q: "Un polype est-il un cancer ?", a: "Non, un polype n'est pas un cancer. La majorité restent bénins. Le risque est que certains, avec le temps, évoluent vers un cancer colorectal : c'est pourquoi on les retire lors de la coloscopie, ce qui prévient cette évolution." },
  { q: "Les polypes donnent-ils des symptômes ?", a: "Le plus souvent aucun : ils sont généralement découverts lors d'une coloscopie, notamment de dépistage. Plus rarement, un gros polype peut saigner. C'est l'une des raisons pour lesquelles le dépistage est important." },
  { q: "Comment enlève-t-on un polype ?", a: "Le plus souvent lors de la coloscopie elle-même : le polype est retiré dans le même temps (polypectomie), sans chirurgie, puis analysé. Ce geste simple prévient l'évolution vers un cancer colorectal." },
  { q: "Faut-il une surveillance après des polypes ?", a: "Oui. Selon le type, la taille et le nombre de polypes retirés, le médecin propose un rythme de surveillance par coloscopie. Avoir eu des polypes justifie un suivi et incite aussi à en parler à son entourage familial." },
];
const polypesTk = [
  "Un polype du côlon est une excroissance le plus souvent bénigne.",
  "Certains (adénomes) peuvent évoluer vers un cancer sur plusieurs années.",
  "Souvent sans symptôme : découverts et retirés lors de la coloscopie.",
  "Les retirer prévient le cancer ; une surveillance est ensuite proposée.",
];

const cSignesCCR = `<p>Le <a href="/blog/cancer-colorectal-maroc">cancer colorectal</a> est longtemps silencieux, mais certains signes doivent alerter et faire consulter sans tarder. Les connaître permet un diagnostic plus précoce, quand les chances de guérison sont les meilleures.</p>

<h2>Les signes qui doivent alerter</h2>
<ul>
<li><strong>Sang dans les selles</strong> ou selles noires</li>
<li><strong>Changement durable du transit</strong> : diarrhée, constipation, ou alternance récente</li>
<li>Douleurs abdominales persistantes, envie d'aller à la selle sans y parvenir</li>
<li>Fatigue et pâleur d'une <a href="/blog/anemie-maroc">anémie</a>, amaigrissement inexpliqué</li>
</ul>

<h2>Attention aux fausses réassurances</h2>
<blockquote>Attention : un saignement ne doit jamais être attribué d'emblée à des <a href="/blog/hemorroides-maroc">hémorroïdes</a> sans avis médical, surtout après 50 ans ou en cas de changement du transit. Tout saignement se fait vérifier.</blockquote>

<h2>Que faire devant ces signes ?</h2>
<p>Consulter : le médecin évalue et oriente si besoin vers une <a href="/blog/coloscopie-maroc">coloscopie</a>. Ces signes ne signifient pas forcément un cancer — ils ont souvent une cause bénigne — mais ils justifient un examen.</p>

<h2>Ne pas attendre</h2>
<p>Plus le diagnostic est précoce, meilleures sont les chances de guérison. En parallèle, le <a href="/blog/depistage-cancer-colorectal-maroc">dépistage</a> permet d'agir avant même l'apparition de tout symptôme.</p>

<hr>
<p>Des signes qui inquiètent ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const signesCCRFaq = [
  { q: "Quels sont les signes d'alerte du cancer colorectal ?", a: "Du sang dans les selles ou des selles noires, un changement durable du transit (diarrhée, constipation, alternance), des douleurs abdominales persistantes, une fatigue avec anémie ou un amaigrissement inexpliqué. Ces signes justifient de consulter, même s'ils ont souvent une cause bénigne." },
  { q: "Un saignement dans les selles est-il forcément un cancer ?", a: "Non : il a souvent une cause bénigne (hémorroïdes, fissure). Mais il ne faut jamais l'attribuer d'emblée aux hémorroïdes sans avis, surtout après 50 ans ou avec un changement du transit. Tout saignement doit être vérifié par un médecin." },
  { q: "Le cancer colorectal donne-t-il des symptômes tôt ?", a: "Non, il est longtemps silencieux, d'où l'importance du dépistage chez les personnes sans symptôme. Quand des signes apparaissent (sang, transit, anémie), ils justifient une consultation rapide pour un diagnostic le plus précoce possible." },
  { q: "Que faire en cas de changement du transit durable ?", a: "Consulter, surtout après 50 ans ou en cas d'autres signes. Un changement récent et durable du transit (diarrhée, constipation, alternance) peut avoir de nombreuses causes ; le médecin évalue et oriente si besoin vers une coloscopie." },
  { q: "Une anémie peut-elle révéler un cancer colorectal ?", a: "Oui, une anémie par carence en fer, surtout chez un homme ou une femme ménopausée, peut être due à un saignement digestif chronique et révéler un cancer colorectal. Elle justifie d'en rechercher la cause, parfois par coloscopie." },
];
const signesCCRTk = [
  "Signes d'alerte : sang dans les selles, transit modifié, douleurs, anémie, amaigrissement.",
  "Ne jamais attribuer un saignement aux hémorroïdes sans avis, surtout après 50 ans.",
  "Ces signes ont souvent une cause bénigne, mais justifient une consultation.",
  "Diagnostic précoce = meilleures chances de guérison ; le dépistage agit avant les symptômes.",
];

// ═══ CALCULS RÉNAUX ═══════════════════════════════════════════════════════════
const cColique = `<p>La colique néphrétique est la douleur violente provoquée par un <a href="/blog/calculs-renaux-maroc">calcul rénal</a> qui bloque les voies urinaires. Impressionnante, elle est rarement grave, mais impose de savoir la soulager et de repérer les signes qui en font une urgence.</p>

<h2>Reconnaître la crise</h2>
<p>Une douleur <strong>brutale et intense</strong> du bas du dos ou du flanc, d'un seul côté, irradiant vers le bas-ventre et les organes génitaux. La personne est <strong>agitée</strong>, ne trouve pas de position soulageante, avec parfois des nausées et du sang dans les urines.</p>

<h2>Que faire pendant la crise ?</h2>
<ul>
<li>Prendre le traitement antalgique prescrit (souvent un anti-inflammatoire, sauf contre-indication).</li>
<li>Ne pas se forcer à boire énormément pendant la crise aiguë ; suivre l'avis médical.</li>
<li>Beaucoup de petits calculs s'éliminent seuls dans les urines.</li>
</ul>

<h2>Quand c'est une urgence</h2>
<blockquote>Attention : consultez en urgence si la colique s'accompagne de <strong>fièvre et de frissons</strong> (risque d'infection de l'urine bloquée), d'une <strong>impossibilité d'uriner</strong>, de vomissements incoercibles ou d'une douleur non calmée par le traitement.</blockquote>

<h2>Après la crise</h2>
<p>Un bilan recherche le calcul et sa cause. Selon la taille, il s'élimine seul ou nécessite un geste (fragmentation, endoscopie). Des mesures de <a href="/blog/prevenir-calculs-renaux-maroc">prévention</a> évitent les récidives.</p>

<hr>
<p>Une colique néphrétique fébrile ou une impossibilité d'uriner ? Consultez en urgence. Hors urgence, trouvez un médecin sur SantéauMaroc.</p>`;
const coliqueFaq = [
  { q: "Comment reconnaître une colique néphrétique ?", a: "Par une douleur brutale et très intense du bas du dos ou du flanc, d'un seul côté, irradiant vers le bas-ventre et les organes génitaux, sans position soulageante, avec parfois des nausées et du sang dans les urines. C'est le signe d'un calcul qui bloque les voies urinaires." },
  { q: "Comment soulager une colique néphrétique ?", a: "En prenant le traitement antalgique prescrit (souvent un anti-inflammatoire, sauf contre-indication). Beaucoup de petits calculs s'éliminent seuls. Il ne faut pas forcément boire énormément pendant la crise aiguë : suivez l'avis médical." },
  { q: "Quand une colique néphrétique est-elle une urgence ?", a: "Quand elle s'accompagne de fièvre et de frissons (risque d'infection de l'urine bloquée), d'une impossibilité d'uriner, de vomissements incoercibles ou d'une douleur non calmée par le traitement. Il faut alors consulter en urgence." },
  { q: "Un calcul rénal s'élimine-t-il tout seul ?", a: "Souvent, oui, pour les petits calculs, qui passent dans les urines avec les antalgiques et le temps. Les calculs plus gros ou bloquants nécessitent un geste spécialisé (fragmentation par ondes de choc, endoscopie) décidé après un bilan." },
  { q: "Que faire après une colique néphrétique ?", a: "Réaliser le bilan proposé (imagerie, analyses) pour localiser le calcul et en chercher la cause, puis mettre en place des mesures de prévention (hydratation, alimentation) car les récidives sont fréquentes." },
];
const coliqueTk = [
  "La colique néphrétique est la douleur d'un calcul bloquant les voies urinaires.",
  "Douleur brutale d'un côté, sans position soulageante, avec agitation.",
  "Soulagement : antalgique prescrit ; beaucoup de petits calculs s'éliminent seuls.",
  "Fièvre + frissons ou impossibilité d'uriner = urgence.",
];

const cPrevenirCalculs = `<p>Après un premier <a href="/blog/calculs-renaux-maroc">calcul rénal</a>, le risque d'en refaire est élevé. Heureusement, des mesures simples — au premier rang desquelles bien s'hydrater — réduisent nettement ce risque.</p>

<h2>La règle n°1 : boire</h2>
<p>Une <strong>hydratation abondante</strong> (souvent au moins 1,5 à 2 litres d'eau par jour, sauf avis contraire) dilue les urines et empêche les cristaux de se former. C'est la mesure la plus efficace, à renforcer par forte chaleur et en cas d'effort.</p>

<h2>Adapter l'alimentation</h2>
<ul>
<li><strong>Réduire le sel</strong>, qui favorise les calculs.</li>
<li>Limiter l'excès de <strong>protéines animales</strong> et de boissons sucrées.</li>
<li>Ne pas supprimer le calcium alimentaire sans avis : un apport normal est plutôt protecteur.</li>
</ul>

<h2>Selon le type de calcul</h2>
<p>L'analyse du calcul éliminé permet de <strong>personnaliser</strong> les conseils (certains calculs demandent des adaptations spécifiques). Le médecin ajuste selon les résultats.</p>

<h2>Surveiller et traiter les causes</h2>
<p>Maintenir un poids sain, traiter une éventuelle maladie favorisante et faire un suivi permettent de limiter les récidives. En cas de calculs à répétition, un bilan spécialisé est utile.</p>

<hr>
<p>Des calculs à répétition ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const prevenirCalculsFaq = [
  { q: "Comment éviter les calculs rénaux ?", a: "Avant tout en buvant abondamment (souvent au moins 1,5 à 2 litres d'eau par jour), ce qui dilue les urines. En complément : réduire le sel, limiter l'excès de protéines animales et de boissons sucrées, maintenir un poids sain et traiter les causes favorisantes." },
  { q: "Combien d'eau boire pour éviter les calculs ?", a: "Souvent au moins 1,5 à 2 litres par jour, sauf avis contraire, à répartir sur la journée et à augmenter par forte chaleur ou lors d'un effort. L'objectif est d'avoir des urines claires et abondantes, ce qui empêche les cristaux de se former." },
  { q: "Faut-il arrêter le calcium pour éviter les calculs ?", a: "Non, en général : supprimer le calcium alimentaire n'est pas conseillé et peut même être contre-productif. Un apport normal en calcium est plutôt protecteur. Ce sont surtout l'hydratation et la réduction du sel qui comptent, sur avis médical." },
  { q: "Les calculs rénaux récidivent-ils souvent ?", a: "Oui, le risque de récidive après un premier calcul est élevé. C'est pourquoi les mesures de prévention (hydratation, alimentation) et, si besoin, un bilan spécialisé sont importants pour réduire ce risque." },
  { q: "L'analyse du calcul est-elle utile ?", a: "Oui, très : analyser le calcul éliminé permet d'en connaître le type et de personnaliser la prévention, certains calculs nécessitant des adaptations spécifiques. Le médecin ajuste alors les conseils selon les résultats." },
];
const prevenirCalculsTk = [
  "Après un calcul, le risque de récidive est élevé : la prévention est essentielle.",
  "Mesure n°1 : boire abondamment (souvent 1,5 à 2 L/jour) pour diluer les urines.",
  "Réduire le sel, limiter protéines animales et boissons sucrées.",
  "Ne pas supprimer le calcium sans avis ; personnaliser selon le type de calcul.",
];

const cTypesCalculs = `<p>Tous les <a href="/blog/calculs-renaux-maroc">calculs rénaux</a> ne se ressemblent pas : ils diffèrent par leur composition, ce qui influence le traitement et la prévention. Connaître le type de calcul aide à éviter les récidives.</p>

<h2>Les principaux types</h2>
<ul>
<li><strong>Calculs d'oxalate/phosphate de calcium</strong> : les plus fréquents.</li>
<li><strong>Calculs d'acide urique</strong> : liés à un excès d'<a href="/blog/acide-urique-eleve-maroc">acide urique</a> (comme dans la goutte).</li>
<li>Calculs d'infection ou plus rares (héréditaires).</li>
</ul>

<h2>Comment traite-t-on un calcul ?</h2>
<p>Cela dépend de la <strong>taille</strong> et de la localisation :</p>
<ul>
<li>Petits calculs : élimination spontanée avec antalgiques et hydratation.</li>
<li>Calculs plus gros ou bloquants : <strong>fragmentation par ondes de choc</strong> (lithotritie) ou geste par endoscopie (urétéroscopie).</li>
<li>En cas d'infection ou de blocage : prise en charge urgente.</li>
</ul>

<h2>Pourquoi connaître le type</h2>
<p>L'analyse du calcul éliminé oriente la <a href="/blog/prevenir-calculs-renaux-maroc">prévention</a> : certains calculs demandent une alimentation ou un traitement spécifiques. C'est un examen simple et précieux.</p>

<hr>
<p>Un calcul à prendre en charge ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const typesCalculsFaq = [
  { q: "Quels sont les différents types de calculs rénaux ?", a: "Les plus fréquents sont les calculs de calcium (oxalate ou phosphate). Viennent ensuite les calculs d'acide urique (liés à un excès d'acide urique, comme dans la goutte), les calculs d'infection et des formes plus rares, parfois héréditaires." },
  { q: "Comment traite-t-on un calcul rénal ?", a: "Selon sa taille et sa localisation : les petits s'éliminent seuls avec antalgiques et hydratation ; les plus gros ou bloquants nécessitent une fragmentation par ondes de choc (lithotritie) ou un geste par endoscopie. Une infection ou un blocage relève de l'urgence." },
  { q: "Qu'est-ce que la lithotritie ?", a: "C'est une technique qui fragmente le calcul par des ondes de choc, sans chirurgie, afin qu'il s'élimine ensuite en petits morceaux dans les urines. Elle est utilisée pour certains calculs trop gros pour passer spontanément." },
  { q: "Pourquoi analyser le type de calcul ?", a: "Parce que la prévention en dépend : certains calculs (acide urique, infection) demandent une alimentation ou un traitement spécifiques. Analyser le calcul éliminé permet de personnaliser les conseils pour éviter les récidives." },
  { q: "Tous les calculs nécessitent-ils une opération ?", a: "Non. Beaucoup de petits calculs s'éliminent spontanément avec des antalgiques et une bonne hydratation. Seuls les calculs plus gros, bloquants ou compliqués nécessitent un geste (lithotritie, endoscopie), décidé après un bilan." },
];
const typesCalculsTk = [
  "Les calculs diffèrent par leur composition (calcium le plus souvent, acide urique…).",
  "Traitement selon la taille : élimination spontanée ou geste (lithotritie, endoscopie).",
  "Infection ou blocage = urgence.",
  "Analyser le calcul personnalise la prévention des récidives.",
];

// ─────────────────────────────────────────────────────────────────────────────
const SATELLITES = [
  { pillarSlug:"hypothyroidie-maroc", categorySlug:"maladies-traitements", aboutEntity:"Hypothyroïdie",
    slug:"levothyroxine-traitement-thyroide-maroc", title:"Lévothyroxine : bien prendre son traitement thyroïdien",
    excerpt:"Lévothyroxine : à quoi elle sert, comment la prendre (à jeun), ce qui gêne son absorption et pourquoi la dose s'ajuste sur la TSH. Un guide clair adapté au Maroc.",
    metaTitle:"Lévothyroxine : bien prendre son traitement | Maroc",
    metaDesc:"Lévothyroxine : rôle dans l'hypothyroïdie, comment la prendre (matin à jeun), ce qui gêne l'absorption (café, fer, calcium) et ajustement sur la TSH. Adapté au Maroc.",
    readingTime:4, content:cLevo, keyTakeaways:levoTk, faq:levoFaq },
  { pillarSlug:"hypothyroidie-maroc", categorySlug:"maladies-traitements", aboutEntity:"Hypothyroïdie et grossesse",
    slug:"thyroide-grossesse-maroc", title:"Thyroïde et grossesse : un suivi renforcé",
    excerpt:"Thyroïde et grossesse : pourquoi elle compte pour le bébé, adaptation du traitement, dépistage et thyroïdite du post-partum. Un guide clair adapté au Maroc.",
    metaTitle:"Thyroïde et grossesse : suivi et traitement | Maroc",
    metaDesc:"Thyroïde et grossesse : rôle pour le développement du bébé, augmentation de la lévothyroxine, surveillance de la TSH et thyroïdite du post-partum. Guide clair adapté au Maroc.",
    readingTime:4, content:cThyroGrossesse, keyTakeaways:thyroGrossesseTk, faq:thyroGrossesseFaq },
  { pillarSlug:"hypothyroidie-maroc", categorySlug:"maladies-traitements", aboutEntity:"Hyperthyroïdie",
    slug:"hyperthyroidie-maroc", title:"Hyperthyroïdie : quand la thyroïde s'emballe",
    excerpt:"Hyperthyroïdie : symptômes (nervosité, palpitations, amaigrissement), causes, diagnostic par la TSH et traitements. L'inverse de l'hypothyroïdie, expliqué au Maroc.",
    metaTitle:"Hyperthyroïdie : symptômes, causes et traitement | Maroc",
    metaDesc:"Hyperthyroïdie : symptômes (nervosité, palpitations, amaigrissement), causes (Basedow, nodules), diagnostic (TSH basse) et traitements. Guide clair adapté au Maroc.",
    readingTime:4, content:cHyper, keyTakeaways:hyperTk, faq:hyperFaq },

  { pillarSlug:"cancer-colorectal-maroc", categorySlug:"maladies-traitements", aboutEntity:"Cancer colorectal",
    slug:"depistage-cancer-colorectal-maroc", title:"Dépistage du cancer colorectal : test et coloscopie",
    excerpt:"Dépistage du cancer colorectal : pourquoi, le test de sang dans les selles dès 50 ans, la coloscopie et qui dépister plus tôt. Un guide clair adapté au Maroc.",
    metaTitle:"Dépistage du cancer colorectal : test et coloscopie | Maroc",
    metaDesc:"Dépistage du cancer colorectal : test de recherche de sang dans les selles dès 50 ans, coloscopie, retrait des polypes et qui dépister plus tôt. Guide clair adapté au Maroc.",
    readingTime:4, content:cDepistageCCR, keyTakeaways:depistageCCRTk, faq:depistageCCRFaq },
  { pillarSlug:"cancer-colorectal-maroc", categorySlug:"maladies-traitements", aboutEntity:"Polype colorectal",
    slug:"polypes-colon-maroc", title:"Polypes du côlon : faut-il s'inquiéter ?",
    excerpt:"Polypes du côlon : ce que c'est, lesquels peuvent évoluer en cancer, comment on les retire et le suivi ensuite. Un guide clair adapté au Maroc.",
    metaTitle:"Polypes du côlon : faut-il s'inquiéter ? | Maroc",
    metaDesc:"Polypes du côlon : définition, types, risque d'évolution en cancer, retrait lors de la coloscopie (polypectomie) et surveillance. Guide clair adapté au Maroc.",
    readingTime:4, content:cPolypes, keyTakeaways:polypesTk, faq:polypesFaq },
  { pillarSlug:"cancer-colorectal-maroc", categorySlug:"maladies-traitements", aboutEntity:"Cancer colorectal",
    slug:"cancer-colorectal-signes-alerte-maroc", title:"Cancer colorectal : les signes qui doivent alerter",
    excerpt:"Cancer colorectal : sang dans les selles, transit modifié, anémie, amaigrissement… les signes qui doivent faire consulter, sans les banaliser. Adapté au Maroc.",
    metaTitle:"Cancer colorectal : les signes d'alerte | Maroc",
    metaDesc:"Cancer colorectal : signes d'alerte (sang dans les selles, transit modifié, anémie, amaigrissement), pourquoi ne pas les attribuer aux hémorroïdes, et quand consulter. Adapté au Maroc.",
    readingTime:4, content:cSignesCCR, keyTakeaways:signesCCRTk, faq:signesCCRFaq },

  { pillarSlug:"calculs-renaux-maroc", categorySlug:"maladies-traitements", aboutEntity:"Colique néphrétique",
    slug:"colique-nephretique-maroc", title:"Colique néphrétique : que faire pendant la crise",
    excerpt:"Colique néphrétique : reconnaître la crise, comment la soulager, les signes d'urgence (fièvre, blocage) et la suite. Un guide clair adapté au Maroc.",
    metaTitle:"Colique néphrétique : que faire pendant la crise | Maroc",
    metaDesc:"Colique néphrétique : reconnaître la douleur du calcul rénal, comment la soulager, les signes d'urgence (fièvre, impossibilité d'uriner) et la suite. Guide clair adapté au Maroc.",
    readingTime:4, content:cColique, keyTakeaways:coliqueTk, faq:coliqueFaq },
  { pillarSlug:"calculs-renaux-maroc", categorySlug:"maladies-traitements", aboutEntity:"Lithiase urinaire",
    slug:"prevenir-calculs-renaux-maroc", title:"Prévenir les calculs rénaux : boire et adapter son alimentation",
    excerpt:"Prévenir les calculs rénaux : l'hydratation en priorité, réduire le sel, adapter l'alimentation et personnaliser selon le type de calcul. Un guide clair adapté au Maroc.",
    metaTitle:"Prévenir les calculs rénaux : hydratation et alimentation | Maroc",
    metaDesc:"Prévenir les calculs rénaux : boire abondamment (1,5 à 2 L/jour), réduire le sel, limiter protéines animales et boissons sucrées, sans supprimer le calcium. Guide adapté au Maroc.",
    readingTime:4, content:cPrevenirCalculs, keyTakeaways:prevenirCalculsTk, faq:prevenirCalculsFaq },
  { pillarSlug:"calculs-renaux-maroc", categorySlug:"maladies-traitements", aboutEntity:"Lithiase urinaire",
    slug:"types-calculs-renaux-traitement-maroc", title:"Types de calculs rénaux et traitements",
    excerpt:"Types de calculs rénaux (calcium, acide urique…), traitements selon la taille (élimination, lithotritie, endoscopie) et intérêt d'analyser le calcul. Adapté au Maroc.",
    metaTitle:"Types de calculs rénaux et traitements | Maroc",
    metaDesc:"Types de calculs rénaux (calcium, acide urique, infection), traitements selon la taille (élimination spontanée, lithotritie, endoscopie) et intérêt d'analyser le calcul. Adapté au Maroc.",
    readingTime:4, content:cTypesCalculs, keyTakeaways:typesCalculsTk, faq:typesCalculsFaq },
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
  console.log(`\nCocons vague 6 : ${pillarSlugs.length} piliers, ${SATELLITES.length} satellites.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
