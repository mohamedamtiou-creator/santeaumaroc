require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie MÉDICAMENTS — LOT 2 (classes de médicaments). Fiches éditoriales de
// bon usage, DISTINCTES de l'annuaire /medicaments. Renvoi systématique au
// médecin/pharmacien. ⚠️ YMYL sensible : à faire valider. Idempotent (upsert).
//   • Antihistaminiques   → médecine générale
//   • Corticoïdes         → médecine générale
//   • Antihypertenseurs   → cardiologie
//   • Anti-inflammatoires → médecine générale
//   • Antibiotiques       → médecine générale
//   • Anticoagulants      → cardiologie
// ════════════════════════════════════════════════════════════════════════════

const DISC = `<p><em>Cette fiche est une information générale et ne remplace pas l'avis de votre médecin ou de votre pharmacien. Ne modifiez jamais un traitement sans avis, respectez la prescription et lisez la notice.</em></p>`;

const cAntihist = `<p>Les antihistaminiques soulagent les symptômes d'<a href="/blog/allergie-maroc">allergie</a> en bloquant l'action de l'histamine, la substance libérée lors des réactions allergiques. Ils sont très utilisés contre la <a href="/blog/rhinite-allergique-maroc">rhinite</a>, l'<a href="/blog/urticaire-maroc">urticaire</a> et les démangeaisons.</p>

<h2>À quoi servent-ils ?</h2>
<p>À soulager éternuements, nez qui coule, yeux qui piquent, démangeaisons et urticaire. Ils ne « guérissent » pas l'allergie mais en calment les symptômes.</p>

<h2>Deux générations</h2>
<ul>
<li><strong>Récents (2e génération)</strong> : peu ou pas de somnolence, une prise par jour — les plus utilisés.</li>
<li><strong>Anciens (1re génération)</strong> : efficaces mais souvent <strong>somnolents</strong>, à éviter avant de conduire.</li>
</ul>

<h2>Précautions et effets</h2>
<p>Somnolence (surtout anciens), bouche sèche. Prudence chez la personne âgée, en cas de conduite, de glaucome ou de troubles urinaires. Signalez vos traitements et une grossesse : certains sont préférés à d'autres, sur avis.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Privilégier les formes non somnolentes en journée.</li>
<li>Associer l'<strong>éviction de l'allergène</strong>, qui reste la mesure la plus efficace.</li>
<li>Consulter si les symptômes persistent ou s'accompagnent d'asthme.</li>
</ul>

${DISC}
<hr>
<p>Des allergies mal soulagées ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const antihistFaq = [
  { q: "À quoi servent les antihistaminiques ?", a: "À soulager les symptômes d'allergie (éternuements, nez qui coule, yeux qui piquent, démangeaisons, urticaire) en bloquant l'histamine. Ils calment les symptômes mais ne guérissent pas l'allergie ; l'éviction de l'allergène reste essentielle." },
  { q: "Les antihistaminiques donnent-ils envie de dormir ?", a: "Les anciens (1re génération) sont souvent somnolents et à éviter avant de conduire. Les plus récents (2e génération) donnent peu ou pas de somnolence et se prennent une fois par jour : ce sont les plus utilisés aujourd'hui." },
  { q: "Peut-on prendre un antihistaminique tous les jours ?", a: "Pour les allergies persistantes (acariens, saisons polliniques), un antihistaminique peut être pris quotidiennement sur une période, selon l'avis du médecin. Les formes récentes sont bien tolérées, mais un usage prolongé se discute avec un professionnel." },
  { q: "Antihistaminique et grossesse : est-ce possible ?", a: "Certains antihistaminiques sont préférés à d'autres pendant la grossesse et l'allaitement. Il ne faut pas en prendre sans avis : signalez toujours une grossesse à votre médecin ou pharmacien, qui choisira le plus adapté." },
  { q: "Les antihistaminiques traitent-ils l'asthme ?", a: "Non. Ils soulagent les symptômes allergiques du nez, des yeux et de la peau, mais ne traitent pas l'asthme, qui a ses propres traitements (inhalateurs). Un asthme associé à une allergie doit être pris en charge spécifiquement." },
];
const antihistTk = [
  "Les antihistaminiques calment les symptômes d'allergie en bloquant l'histamine.",
  "Formes récentes : peu somnolentes, une prise par jour ; anciennes : somnolentes.",
  "Ils ne guérissent pas l'allergie : l'éviction de l'allergène reste essentielle.",
  "Ils ne traitent pas l'asthme, qui a ses propres traitements.",
];

const cCortico = `<p>Les corticoïdes (« cortisone ») sont de puissants anti-inflammatoires, utilisés dans de nombreuses maladies. Très efficaces, ils demandent des précautions, surtout en traitement prolongé. On les distingue des corticoïdes locaux (crèmes, sprays), mieux tolérés.</p>

<h2>À quoi servent-ils ?</h2>
<p>À réduire l'inflammation et calmer le système immunitaire : allergies sévères, <a href="/blog/asthme-maroc">asthme</a>, maladies inflammatoires et articulaires, entre autres. Ils existent en comprimés, injections, crèmes, sprays et collyres.</p>

<h2>Corticoïdes locaux ou généraux</h2>
<ul>
<li><strong>Locaux</strong> (crème, spray nasal, inhalé) : action ciblée, effets généraux limités.</li>
<li><strong>Généraux</strong> (comprimés, injections) : plus puissants, mais plus d'effets si prolongés.</li>
</ul>

<h2>Précautions et effets</h2>
<p>En traitement prolongé : prise de poids, montée de la tension et du sucre, fragilité osseuse, sensibilité aux infections, troubles du sommeil. <strong>Ne jamais arrêter brutalement</strong> un traitement prolongé : l'arrêt se fait progressivement, sur avis médical.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Respecter la dose, l'horaire (souvent le matin) et la durée prescrite.</li>
<li>Signaler diabète, hypertension, infection, grossesse.</li>
<li>Pour un corticoïde inhalé, se rincer la bouche après.</li>
</ul>

${DISC}
<hr>
<p>Un traitement par corticoïdes à comprendre ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const corticoFaq = [
  { q: "Les corticoïdes sont-ils dangereux ?", a: "Utilisés correctement et sur une courte durée, ils sont très utiles et bien tolérés. Les effets indésirables (prise de poids, tension, sucre, os, infections) surviennent surtout en traitement prolongé et à forte dose, ce qui justifie un suivi médical." },
  { q: "Peut-on arrêter la cortisone d'un coup ?", a: "Non, pas pour un traitement prolongé : l'arrêt brutal est dangereux. La dose se diminue progressivement, sur avis médical, pour laisser le corps reprendre sa production naturelle. Un traitement court peut, lui, être arrêté selon la prescription." },
  { q: "La cortisone fait-elle grossir ?", a: "En traitement prolongé, elle peut favoriser une prise de poids et une rétention d'eau, avec parfois un visage plus rond. Ces effets régressent souvent à l'arrêt. Une alimentation adaptée (moins de sel et de sucres) pendant le traitement aide à les limiter." },
  { q: "Les corticoïdes en crème ou en spray sont-ils plus sûrs ?", a: "Les corticoïdes locaux (crème, spray nasal, inhalé) ont une action ciblée et beaucoup moins d'effets généraux que les comprimés. Ils doivent tout de même être utilisés selon la prescription, sans les prolonger inutilement." },
  { q: "Corticoïdes et diabète ou hypertension : quelles précautions ?", a: "Les corticoïdes peuvent élever la glycémie et la tension. En cas de diabète ou d'hypertension, ils nécessitent une surveillance renforcée et parfois un ajustement des autres traitements. Signalez toujours ces maladies à votre médecin." },
];
const corticoTk = [
  "Les corticoïdes (« cortisone ») sont de puissants anti-inflammatoires.",
  "Formes locales (crème, spray) mieux tolérées que les comprimés.",
  "Effets surtout en traitement prolongé : poids, tension, sucre, os, infections.",
  "Ne jamais arrêter brutalement un traitement prolongé : diminution progressive.",
];

const cAntiHTA = `<p>Les médicaments antihypertenseurs font baisser la tension pour protéger le cœur, le cerveau et les reins. Il en existe plusieurs familles, souvent associées. Bien les comprendre aide à mieux les suivre — car le principal enjeu est l'<strong>observance</strong>.</p>

<h2>À quoi servent-ils ?</h2>
<p>À ramener la tension sous les seuils recommandés dans l'<a href="/blog/hypertension-arterielle-maroc">hypertension artérielle</a>, afin de prévenir l'<a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a>, l'infarctus et l'insuffisance rénale.</p>

<h2>Les grandes familles</h2>
<table>
<thead><tr><th>Famille</th><th>Action</th></tr></thead>
<tbody>
<tr><td>Diurétiques</td><td>Éliminent le sel et l'eau par les reins</td></tr>
<tr><td>IEC et sartans</td><td>Relâchent les artères (hormone vasoconstrictrice bloquée)</td></tr>
<tr><td>Inhibiteurs calciques</td><td>Dilatent les vaisseaux</td></tr>
<tr><td>Bêta-bloquants</td><td>Ralentissent le cœur</td></tr>
</tbody>
</table>

<h2>Précautions et effets</h2>
<p>Selon la famille : vertiges en cas de baisse trop rapide, toux sèche (certains IEC), gonflement des chevilles, fatigue. La plupart sont bien tolérés. <strong>Ne jamais arrêter seul</strong>, même si la tension est normale : c'est le traitement qui la maintient.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Prendre chaque jour, à heure régulière ; l'automesure aide au suivi.</li>
<li>Associer l'hygiène de vie (sel, activité, poids).</li>
<li>Signaler tout effet gênant : le médecin peut changer de famille.</li>
</ul>

${DISC}
<hr>
<p>Un traitement de la tension à ajuster ? Sur SantéauMaroc, trouvez un cardiologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const antiHTAFaq = [
  { q: "Le traitement de la tension est-il à vie ?", a: "Souvent oui, car l'hypertension est une maladie chronique. Le traitement maintient la tension normale mais ne « guérit » pas : il ne faut jamais l'arrêter sans avis, même quand les chiffres sont bons. Parfois, l'amélioration du mode de vie permet de l'alléger." },
  { q: "Pourquoi plusieurs médicaments pour la tension ?", a: "Il est fréquent d'associer deux familles ou plus, à faibles doses, pour une meilleure efficacité et moins d'effets qu'une seule à forte dose. Le médecin adapte l'association selon votre profil (diabète, reins, cœur) et votre tolérance." },
  { q: "Peut-on arrêter son traitement si la tension est normale ?", a: "Non, pas de sa propre initiative : une tension normale sous traitement montre justement qu'il fonctionne. L'arrêter expose à une remontée de la tension et à ses risques. Toute modification se décide avec le médecin." },
  { q: "Quels effets secondaires des antihypertenseurs ?", a: "Ils varient selon la famille : vertiges si la tension baisse trop vite, toux sèche avec certains IEC, gonflement des chevilles, fatigue. La plupart sont bien tolérés ; en cas d'effet gênant, le médecin peut changer de médicament." },
  { q: "Faut-il continuer l'hygiène de vie avec un traitement ?", a: "Oui, absolument. Réduire le sel, bouger, perdre du poids et limiter l'alcool renforcent l'effet des médicaments et permettent parfois d'en réduire le nombre ou la dose. Le traitement ne remplace pas ces mesures : il les complète." },
];
const antiHTATk = [
  "Les antihypertenseurs baissent la tension pour protéger cœur, cerveau et reins.",
  "Plusieurs familles (diurétiques, IEC/sartans, inhibiteurs calciques, bêta-bloquants), souvent associées.",
  "Ne jamais arrêter seul, même si la tension est normale.",
  "L'hygiène de vie complète toujours le traitement.",
];

const cAINS = `<p>Les anti-inflammatoires non stéroïdiens (AINS) — dont l'<a href="/blog/ibuprofene-maroc">ibuprofène</a> — soulagent douleur, inflammation et fièvre. Efficaces et souvent en vente libre, ils sont pourtant loin d'être anodins : ils exposent l'estomac, les reins et le cœur.</p>

<h2>À quoi servent-ils ?</h2>
<p>À calmer les douleurs (articulaires, dentaires, règles), l'inflammation et la fièvre. Ils regroupent l'ibuprofène, le diclofénac, le kétoprofène et d'autres, en comprimés, gels ou injections.</p>

<h2>Les précautions essentielles</h2>
<ul>
<li>À la <strong>dose la plus faible, le moins longtemps possible</strong>, au cours d'un repas.</li>
<li><strong>Ne jamais associer deux AINS</strong> (ni AINS + aspirine antidouleur).</li>
<li>Prudence ou contre-indication en cas d'<a href="/blog/ulcere-estomac-maroc">ulcère</a>, de maladie des reins, du cœur, et à partir du 6e mois de grossesse.</li>
</ul>

<h2>Effets et interactions</h2>
<p>Troubles digestifs (brûlures, ulcère, saignement), atteinte des reins, élévation de la <a href="/blog/hypertension-arterielle-maroc">tension</a>. Prudence avec les anticoagulants, certains médicaments de la tension et chez la personne âgée.</p>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Préférer le <a href="/blog/paracetamol-maroc">paracétamol</a> en première intention pour une douleur ou une fièvre simple.</li>
<li>Éviter en cas de déshydratation ou d'infection non évaluée.</li>
<li>Demander conseil en cas de maladie chronique.</li>
</ul>

${DISC}
<hr>
<p>Un doute sur un anti-inflammatoire ? Demandez à votre pharmacien ou, sur SantéauMaroc, à un médecin près de chez vous.</p>`;
const ainsFaq = [
  { q: "Quels médicaments sont des anti-inflammatoires (AINS) ?", a: "L'ibuprofène, le diclofénac, le kétoprofène et d'autres. Ils soulagent douleur, inflammation et fièvre, en comprimés, gels ou injections. L'aspirine à dose antidouleur en fait aussi partie. Ils ne doivent pas être associés entre eux." },
  { q: "Les AINS sont-ils dangereux ?", a: "Bien que souvent en vente libre, ils ne sont pas anodins : ils peuvent abîmer l'estomac (ulcère, saignement) et les reins, et élever la tension, surtout à forte dose, sur une longue durée ou chez la personne âgée. On les utilise à la dose minimale efficace." },
  { q: "Peut-on associer deux anti-inflammatoires ?", a: "Non, il ne faut jamais associer deux AINS (par exemple ibuprofène + aspirine antidouleur, ou ibuprofène + diclofénac) : cela augmente les risques sans bénéfice. En cas de douleur mal soulagée, demandez conseil plutôt que de cumuler." },
  { q: "AINS ou paracétamol, que choisir ?", a: "Le paracétamol est souvent à privilégier en première intention pour une douleur ou une fièvre simple, car mieux toléré. Les AINS sont utiles pour certaines douleurs inflammatoires, mais avec plus de précautions. En cas de doute, demandez conseil." },
  { q: "Qui doit éviter les anti-inflammatoires ?", a: "Les personnes ayant un ulcère ou un antécédent de saignement digestif, une maladie des reins ou du cœur, les femmes enceintes à partir du 6e mois, et avec prudence les personnes âgées. Demandez toujours conseil en cas de maladie chronique." },
];
const ainsTk = [
  "Les AINS (ibuprofène, diclofénac…) soulagent douleur, inflammation et fièvre.",
  "Souvent en vente libre mais pas anodins : estomac, reins, cœur, tension.",
  "Dose minimale, courte durée, jamais deux AINS ensemble.",
  "Paracétamol souvent préféré en première intention.",
];

const cAntibio = `<p>Les antibiotiques sauvent des vies en traitant les infections <strong>bactériennes</strong>. Mais ils sont <strong>inutiles contre les virus</strong> (rhume, grippe, la plupart des angines et bronchites) et leur mésusage favorise l'antibiorésistance, un problème majeur de santé publique.</p>

<h2>À quoi servent-ils ?</h2>
<p>À combattre les bactéries responsables de certaines infections (urinaires, pulmonaires, ORL, cutanées…). Ils n'agissent pas sur les virus. Seul un médecin décide si une infection justifie un antibiotique.</p>

<h2>Le bon usage, en quelques règles</h2>
<ul>
<li><strong>Uniquement sur prescription</strong>, à la dose et pour la durée indiquées.</li>
<li><strong>Terminer la cure</strong>, même si l'on se sent mieux.</li>
<li>Ne jamais réutiliser un antibiotique « qui reste » ni prendre celui d'un proche.</li>
</ul>

<h2>Pourquoi c'est important : la résistance</h2>
<p>À force d'être mal utilisés, les antibiotiques deviennent moins efficaces : des bactéries résistantes apparaissent, rendant certaines infections difficiles à traiter. Le bon usage protège leur efficacité, pour vous et pour tous.</p>

<h2>Effets et précautions</h2>
<p>Effets fréquents : troubles digestifs (diarrhée), allergies. Signalez toute allergie (notamment aux pénicillines comme l'<a href="/blog/amoxicilline-maroc">amoxicilline</a>) et vos traitements. Toute réaction (éruption, gonflement, gêne à respirer) impose d'arrêter et de consulter en urgence.</p>

${DISC}
<hr>
<p>Une infection à évaluer ? Seul un médecin décide d'un antibiotique. Sur SantéauMaroc, trouvez un médecin près de chez vous.</p>`;
const antibioFaq = [
  { q: "Les antibiotiques soignent-ils le rhume et la grippe ?", a: "Non. Le rhume, la grippe et la plupart des angines et bronchites sont des infections virales, contre lesquelles les antibiotiques sont inutiles. Ils n'agissent que sur les bactéries. Les prendre « pour aller plus vite » est inefficace et favorise les résistances." },
  { q: "Pourquoi faut-il terminer une cure d'antibiotique ?", a: "Pour éliminer complètement la bactérie et éviter une rechute et l'apparition de résistances. Il faut suivre la durée prescrite même si l'on se sent mieux avant la fin, et ne jamais raccourcir ni arrêter une cure sans avis médical." },
  { q: "Qu'est-ce que l'antibiorésistance ?", a: "C'est la perte d'efficacité des antibiotiques face à des bactéries devenues résistantes, favorisée par leur mésusage (prises inutiles, cures non terminées). Elle rend certaines infections difficiles à traiter : le bon usage des antibiotiques la limite." },
  { q: "Peut-on prendre un antibiotique sans ordonnance ?", a: "Non. Les antibiotiques ne doivent être pris que sur prescription médicale : le choix, la dose et la durée dépendent de l'infection. Se les procurer ou réutiliser un ancien traitement expose à un mésusage dangereux et favorise les résistances." },
  { q: "Que faire en cas d'allergie à un antibiotique ?", a: "Signalez toute allergie connue (notamment aux pénicillines) avant toute prescription. En cas de réaction pendant le traitement (éruption, gonflement du visage, gêne à respirer), il faut arrêter et consulter en urgence, car certaines réactions peuvent être graves." },
];
const antibioTk = [
  "Les antibiotiques traitent les bactéries : inutiles contre les virus.",
  "Uniquement sur prescription ; terminer la cure même si l'on va mieux.",
  "Le mésusage favorise l'antibiorésistance, un enjeu de santé publique.",
  "Ne jamais réutiliser un antibiotique ancien ni celui d'un proche.",
];

const cAnticoag = `<p>Les anticoagulants « fluidifient » le sang pour empêcher la formation de caillots. Ils protègent contre la phlébite, l'embolie pulmonaire et l'<a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a> (notamment en cas de fibrillation auriculaire), mais exposent à un risque de saignement : ils demandent rigueur et suivi.</p>

<h2>À quoi servent-ils ?</h2>
<p>À prévenir ou traiter les caillots : après une phlébite ou une embolie, en cas de trouble du rythme cardiaque (fibrillation), ou de certaines prothèses. Ils diffèrent des antiagrégants (comme l'<a href="/blog/aspirine-maroc">aspirine</a> à faible dose).</p>

<h2>Deux grands types</h2>
<ul>
<li><strong>Anticoagulants classiques (AVK)</strong> : nécessitent des <strong>prises de sang régulières (INR)</strong> pour ajuster la dose ; sensibles à l'alimentation et aux interactions.</li>
<li><strong>Anticoagulants oraux directs (AOD)</strong> : sans surveillance sanguine de routine, mais dose à respecter strictement.</li>
</ul>

<h2>Le risque principal : le saignement</h2>
<blockquote>Attention : signes d'alerte à connaître — saignements qui ne s'arrêtent pas, sang dans les urines ou les selles (selles noires), vomissements de sang, bleus inhabituels, maux de tête violents après un choc. Consultez sans tarder.</blockquote>

<h2>Conseils d'utilisation</h2>
<ul>
<li>Prendre à heure régulière, ne jamais oublier ni doubler une dose sans avis.</li>
<li>Signaler l'anticoagulant à tout soignant (dentiste, chirurgien) avant un geste.</li>
<li>Prudence avec les <a href="/blog/anti-inflammatoires-ains-maroc">anti-inflammatoires</a> et l'automédication ; porter une carte de traitement.</li>
</ul>

${DISC}
<hr>
<p>Un traitement anticoagulant à comprendre ? Sur SantéauMaroc, trouvez un médecin ou un cardiologue près de chez vous.</p>`;
const anticoagFaq = [
  { q: "À quoi servent les anticoagulants ?", a: "À empêcher la formation de caillots dans le sang. Ils préviennent ou traitent la phlébite, l'embolie pulmonaire et l'AVC (notamment en cas de fibrillation auriculaire) ou protègent certaines prothèses. Ils diffèrent des antiagrégants comme l'aspirine à faible dose." },
  { q: "Quel est le principal risque des anticoagulants ?", a: "Le saignement. Il faut consulter sans tarder en cas de saignement qui ne s'arrête pas, de sang dans les urines ou les selles (selles noires), de vomissements de sang, de bleus inhabituels ou de maux de tête violents après un choc." },
  { q: "Quelle différence entre AVK et anticoagulants oraux directs ?", a: "Les AVK nécessitent des prises de sang régulières (INR) pour ajuster la dose et sont sensibles à l'alimentation et aux interactions. Les anticoagulants oraux directs (AOD) ne demandent pas de surveillance sanguine de routine, mais la dose doit être respectée strictement." },
  { q: "Peut-on prendre des anti-inflammatoires avec un anticoagulant ?", a: "C'est à éviter sans avis : les anti-inflammatoires (AINS) augmentent le risque de saignement chez une personne sous anticoagulant. Le paracétamol est généralement préféré pour la douleur. Demandez toujours conseil à votre médecin ou pharmacien." },
  { q: "Faut-il signaler un anticoagulant avant une opération ou chez le dentiste ?", a: "Oui, systématiquement. Tout soignant (dentiste, chirurgien) doit savoir que vous prenez un anticoagulant avant un geste, pour adapter la conduite et prévenir les saignements. Porter une carte de traitement est recommandé." },
];
const anticoagTk = [
  "Les anticoagulants empêchent la formation de caillots (phlébite, embolie, AVC).",
  "AVK (surveillance INR) ou anticoagulants oraux directs (dose stricte).",
  "Risque principal : le saignement — connaître les signes d'alerte.",
  "Signaler le traitement avant tout geste ; prudence avec les AINS.",
];

const ARTICLES = [
  { slug:"antihistaminiques-maroc", aboutEntity:"Antihistaminiques",
    title:"Antihistaminiques : à quoi servent-ils et comment les utiliser",
    excerpt:"Antihistaminiques : rôle contre l'allergie, générations (somnolents ou non), précautions et conseils. Fiche d'information adaptée au Maroc.",
    metaTitle:"Antihistaminiques : usage et précautions | Maroc",
    metaDesc:"Antihistaminiques : rôle contre l'allergie (rhinite, urticaire), différence entre générations (somnolence), précautions et conseils. Information claire adaptée au Maroc.",
    readingTime:4, content:cAntihist, keyTakeaways:antihistTk, faq:antihistFaq },
  { slug:"corticoides-maroc", aboutEntity:"Corticoïdes",
    title:"Corticoïdes (cortisone) : usage et précautions",
    excerpt:"Corticoïdes : à quoi ils servent, formes locales et générales, effets en traitement prolongé et pourquoi ne pas les arrêter brutalement. Adapté au Maroc.",
    metaTitle:"Corticoïdes (cortisone) : usage et précautions | Maroc",
    metaDesc:"Corticoïdes (cortisone) : indications, formes locales et générales, effets en traitement prolongé (poids, tension, os) et arrêt progressif. Information claire adaptée au Maroc.",
    readingTime:4, content:cCortico, keyTakeaways:corticoTk, faq:corticoFaq },
  { slug:"antihypertenseurs-maroc", aboutEntity:"Antihypertenseurs",
    title:"Médicaments de la tension : les familles d'antihypertenseurs",
    excerpt:"Antihypertenseurs : à quoi ils servent, les grandes familles, précautions, effets et pourquoi ne pas les arrêter seul. Fiche adaptée au Maroc.",
    metaTitle:"Médicaments de la tension : les antihypertenseurs | Maroc",
    metaDesc:"Antihypertenseurs : rôle, grandes familles (diurétiques, IEC/sartans, inhibiteurs calciques, bêta-bloquants), effets et importance de l'observance. Adapté au Maroc.",
    readingTime:4, content:cAntiHTA, keyTakeaways:antiHTATk, faq:antiHTAFaq },
  { slug:"anti-inflammatoires-ains-maroc", aboutEntity:"Anti-inflammatoires non stéroïdiens",
    title:"Anti-inflammatoires (AINS) : efficaces mais pas anodins",
    excerpt:"Anti-inflammatoires (AINS) : à quoi ils servent, précautions essentielles (estomac, reins, cœur), interactions et quand préférer le paracétamol. Adapté au Maroc.",
    metaTitle:"Anti-inflammatoires (AINS) : précautions et bon usage | Maroc",
    metaDesc:"Anti-inflammatoires (AINS) : indications, précautions (estomac, reins, cœur, grossesse), interactions et quand préférer le paracétamol. Information claire adaptée au Maroc.",
    readingTime:4, content:cAINS, keyTakeaways:ainsTk, faq:ainsFaq },
  { slug:"antibiotiques-maroc", aboutEntity:"Antibiotiques",
    title:"Antibiotiques : bon usage et antibiorésistance",
    excerpt:"Antibiotiques : à quoi ils servent, pourquoi ils sont inutiles contre les virus, le bon usage (terminer la cure) et l'enjeu de la résistance. Adapté au Maroc.",
    metaTitle:"Antibiotiques : bon usage et résistance | Maroc",
    metaDesc:"Antibiotiques : efficaces sur les bactéries, inutiles contre les virus, règles de bon usage (prescription, terminer la cure) et enjeu de l'antibiorésistance. Adapté au Maroc.",
    readingTime:4, content:cAntibio, keyTakeaways:antibioTk, faq:antibioFaq },
  { slug:"anticoagulants-maroc", aboutEntity:"Anticoagulants",
    title:"Anticoagulants : bien les gérer au quotidien",
    excerpt:"Anticoagulants : à quoi ils servent, types (AVK, AOD), le risque de saignement, signes d'alerte et conseils de sécurité. Fiche adaptée au Maroc.",
    metaTitle:"Anticoagulants : usage, risques et sécurité | Maroc",
    metaDesc:"Anticoagulants : rôle (phlébite, embolie, AVC), types (AVK avec INR, AOD), risque de saignement, signes d'alerte et conseils de sécurité. Information claire adaptée au Maroc.",
    readingTime:5, content:cAnticoag, keyTakeaways:anticoagTk, faq:anticoagFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.findUnique({ where: { slug: "medicaments" }, select: { id: true } });
  if (!cat) { console.error("Catégorie 'medicaments' introuvable."); process.exit(1); }
  const now = new Date();
  for (const art of ARTICLES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:cat.id, metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`✓ Médicament  /blog/${post.slug}`);
  }
  console.log(`\nMédicaments lot 2 : ${ARTICLES.length} fiches publiées.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
