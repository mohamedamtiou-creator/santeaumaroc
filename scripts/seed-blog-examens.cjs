require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie EXAMENS — nouvelle rubrique du blog (gabarit dédié). Chaque fiche :
// pourquoi réaliser l'examen, comment il se déroule, préparation, durée, douleur,
// risques, interprétation des résultats, PRIX INDICATIF au Maroc + FAQ + À retenir.
// Rappel : seul un médecin interprète les résultats.
//
// ⚠️ Les prix sont INDICATIFS (secteur privé, fourchettes larges, variables selon
// ville/centre/prescription) et à faire valider — donnée la plus sensible.
//
// Crée d'abord la catégorie `examens`, puis seede les fiches. Intro/FAQ catégorie :
// lib/blog-category-content.ts. Mappings CTA : lib/blog-related.ts. Idempotent.
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Examens médicaux",
  slug: "examens",
  description:
    "Comprendre ses examens médicaux : pourquoi ils sont prescrits, comment ils se déroulent, comment s'y préparer, s'ils sont douloureux ou risqués, comment lire les résultats et leur prix indicatif au Maroc. Une information claire qui ne remplace pas l'avis de votre médecin.",
  color: "indigo",
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRISE DE SANG
// ─────────────────────────────────────────────────────────────────────────────
const cSang = `<p>La prise de sang (ou analyse de sang) est l'examen médical le plus courant. Simple et rapide, elle apporte une foule d'informations sur le fonctionnement de l'organisme : elle sert à dépister, diagnostiquer et surveiller de nombreuses maladies. Voici comment elle se déroule et comment lire vos résultats.</p>

<h2>Pourquoi réaliser une prise de sang ?</h2>
<p>Elle permet de mesurer de nombreux paramètres selon la prescription : numération des cellules du sang (globules rouges, blancs, plaquettes), <a href="/blog/diabete-type-2-maroc">glycémie</a>, <a href="/blog/cholesterol-maroc">cholestérol</a>, fonction des reins et du foie, marqueurs d'inflammation, hormones (dont la thyroïde), sérologies, etc. C'est un outil clé de dépistage et de suivi.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Un(e) infirmier(ère) ou biologiste pose un garrot au bras, désinfecte la peau, puis prélève le sang dans un ou plusieurs tubes à l'aide d'une fine aiguille, le plus souvent au pli du coude. Les tubes sont ensuite analysés au laboratoire.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li><strong>À jeun</strong> pour certains dosages (glycémie, cholestérol, triglycérides) : ne rien manger 8 à 12 heures avant ; l'eau est autorisée.</li>
<li>Signaler ses <strong>traitements</strong> en cours, qui peuvent influencer certains résultats.</li>
<li>Pour beaucoup d'analyses, aucune préparation n'est nécessaire.</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>Le prélèvement lui-même ne prend que <strong>quelques minutes</strong>. Les résultats sont généralement disponibles en quelques heures à 48 heures selon les analyses.</p>

<h2>Est-ce douloureux ?</h2>
<p>La douleur se limite à la petite piqûre de l'aiguille, brève. Un bleu (hématome) peut apparaître au point de ponction ; comprimer quelques minutes l'évite le plus souvent.</p>

<h2>Y a-t-il des risques ?</h2>
<p>Les risques sont minimes : un petit hématome, rarement un malaise (dit vagal) à la vue du sang. Signalez-le pour être allongé pendant le prélèvement.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le compte-rendu indique vos valeurs à côté des <strong>valeurs de référence</strong> du laboratoire. Un résultat hors norme n'est pas forcément inquiétant, et un résultat normal n'exclut pas tout. <strong>Seul votre médecin interprète l'ensemble</strong> au regard de votre situation : évitez l'auto-diagnostic.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Le prix dépend des analyses demandées : de <strong>quelques dizaines à quelques centaines de dirhams</strong>. Sur prescription, une partie est prise en charge par l'assurance maladie (AMO). Ces montants sont indicatifs et varient d'un laboratoire à l'autre.</p>

<hr>
<p>Un bilan sanguin à interpréter ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const sangFaq = [
  { q: "Faut-il être à jeun pour une prise de sang ?", a: "Seulement pour certains dosages (glycémie, cholestérol, triglycérides), pour lesquels il faut ne rien manger 8 à 12 heures avant ; l'eau reste autorisée. Beaucoup d'analyses ne nécessitent aucun jeûne. Votre ordonnance ou le laboratoire le précise." },
  { q: "Une prise de sang est-elle douloureuse ?", a: "Elle se limite à la petite piqûre de l'aiguille, brève et supportable. Un bleu peut apparaître au point de ponction ; comprimer quelques minutes après le prélèvement permet de l'éviter le plus souvent." },
  { q: "En combien de temps a-t-on les résultats ?", a: "Le plus souvent en quelques heures à 48 heures selon les analyses. Certains dosages spécialisés prennent plus de temps. Le laboratoire vous indique le délai et les modalités de retrait des résultats." },
  { q: "Puis-je interpréter mes résultats moi-même ?", a: "Il est déconseillé de s'auto-diagnostiquer. Un résultat hors des valeurs de référence n'est pas toujours inquiétant, et un résultat normal n'exclut pas tout. Seul votre médecin interprète l'ensemble selon votre situation." },
  { q: "La prise de sang est-elle remboursée au Maroc ?", a: "Sur prescription médicale, une partie du coût des analyses est prise en charge par l'assurance maladie obligatoire (AMO), selon le barème en vigueur. Renseignez-vous auprès de votre organisme (CNSS, CNOPS)." },
  { q: "Peut-on prendre ses médicaments avant une prise de sang ?", a: "Cela dépend des médicaments et des analyses. Certains doivent être pris comme d'habitude, d'autres peuvent influencer les résultats. Signalez toujours vos traitements et demandez conseil à votre médecin ou au laboratoire." },
];
const sangTakeaways = [
  "La prise de sang est l'examen le plus courant : dépistage, diagnostic et suivi.",
  "Le jeûne n'est requis que pour certains dosages (glycémie, cholestérol).",
  "Le prélèvement dure quelques minutes ; les risques sont minimes.",
  "Un résultat hors norme n'est pas forcément grave : seul le médecin interprète.",
  "Sur prescription, une partie est prise en charge par l'AMO.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. IRM
// ─────────────────────────────────────────────────────────────────────────────
const cIrm = `<p>L'IRM (imagerie par résonance magnétique) est un examen d'imagerie très précis, sans rayons X. Elle offre des images détaillées des tissus mous — cerveau, articulations, colonne, organes — là où d'autres examens sont moins performants. Indolore mais impressionnante, elle inquiète parfois à tort : voici ce qu'il faut savoir.</p>

<h2>Pourquoi réaliser une IRM ?</h2>
<p>L'IRM utilise un puissant champ magnétique (et non des rayons X) pour visualiser finement les tissus mous. Elle est prescrite pour explorer le cerveau, la moelle et la colonne vertébrale, les articulations (genou, épaule), certains organes, ou pour préciser une anomalie vue à un autre examen.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Vous êtes allongé sur une table qui glisse dans un tunnel ouvert aux deux extrémités. La machine est <strong>bruyante</strong> (on vous propose un casque), et il faut rester <strong>immobile</strong> pour des images nettes. Un produit de contraste (gadolinium) est parfois injecté dans une veine.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li>Retirer tout objet métallique (bijoux, montre, cartes bancaires, appareils).</li>
<li><strong>Signaler impérativement</strong> : pacemaker ou autre dispositif implanté, éclats métalliques, grossesse, claustrophobie, allergies.</li>
<li>Parfois être à jeun si une injection est prévue.</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>En général <strong>15 à 45 minutes</strong>, selon la zone explorée et le nombre d'images.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, l'IRM est <strong>indolore</strong>. Les seules gênes sont le bruit et l'obligation de rester immobile ; l'espace fermé peut être inconfortable en cas de claustrophobie (à signaler). L'injection éventuelle se limite à une piqûre.</p>

<h2>Y a-t-il des risques ?</h2>
<p>L'IRM n'utilise pas de rayons X : elle est sans risque d'irradiation. Les contre-indications tiennent surtout aux <strong>dispositifs métalliques ou électroniques</strong> (certains pacemakers, implants). Les réactions au produit de contraste sont rares. En cas de grossesse, l'examen n'est réalisé que si nécessaire, sur avis médical.</p>

<h2>Comment lire les résultats ?</h2>
<p>Les images sont analysées par le <strong>radiologue</strong>, qui rédige un compte-rendu remis avec les clichés. C'est votre médecin, avec ce compte-rendu et votre situation, qui pose le diagnostic et décide de la suite.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le secteur privé, comptez en général <strong>entre 1 500 et 3 500 DH</strong> selon la région explorée, l'usage d'un produit de contraste et le centre. Sur prescription, une prise en charge partielle par l'AMO est possible. Montants indicatifs, à confirmer auprès du centre.</p>

<hr>
<p>Une IRM prescrite ou des résultats à comprendre ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const irmFaq = [
  { q: "L'IRM est-elle dangereuse ?", a: "Non, l'IRM n'utilise pas de rayons X et n'irradie pas. Ses contre-indications concernent surtout certains dispositifs métalliques ou électroniques (pacemakers, implants), qu'il faut signaler. Les réactions au produit de contraste sont rares." },
  { q: "Quelle différence entre une IRM et un scanner ?", a: "L'IRM utilise un champ magnétique et excelle pour les tissus mous (cerveau, articulations, moelle), sans rayons X. Le scanner utilise des rayons X, est plus rapide et très utile pour les os, le thorax, l'abdomen et les urgences. Le choix dépend de ce que l'on cherche." },
  { q: "L'IRM fait-elle mal ?", a: "Non, elle est indolore. Les seules gênes sont le bruit de la machine et la nécessité de rester immobile dans un espace fermé, parfois inconfortable en cas de claustrophobie. Une éventuelle injection se limite à une petite piqûre." },
  { q: "Combien de temps dure une IRM ?", a: "En général entre 15 et 45 minutes, selon la région du corps explorée et le nombre d'images nécessaires. Il est important de rester immobile pendant l'acquisition pour obtenir des images nettes." },
  { q: "Peut-on faire une IRM avec un pacemaker ?", a: "Certains pacemakers et implants contre-indiquent l'IRM, d'autres sont compatibles sous conditions. Il est indispensable de signaler tout dispositif implanté avant l'examen : l'équipe vérifiera la compatibilité." },
  { q: "L'IRM est-elle remboursée au Maroc ?", a: "Sur prescription médicale, une partie du coût peut être prise en charge par l'assurance maladie (AMO), selon le barème. Le reste est à votre charge dans le secteur privé. Renseignez-vous auprès de votre organisme et du centre d'imagerie." },
];
const irmTakeaways = [
  "L'IRM donne des images détaillées des tissus mous, sans rayons X.",
  "Elle est indolore ; ses gênes sont le bruit et l'immobilité dans un tunnel.",
  "Signaler impérativement pacemaker, implants, grossesse et claustrophobie.",
  "Les résultats sont interprétés par le radiologue, puis par votre médecin.",
  "Prix indicatif au Maroc (privé) : environ 1 500 à 3 500 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. SCANNER
// ─────────────────────────────────────────────────────────────────────────────
const cScanner = `<p>Le scanner (ou tomodensitométrie, TDM) est un examen d'imagerie rapide qui produit des images en coupes du corps grâce aux rayons X. Précieux en urgence et pour de nombreuses régions (thorax, abdomen, os), il est très utilisé. Voici comment il se déroule et ce qu'il faut savoir sur ses précautions.</p>

<h2>Pourquoi réaliser un scanner ?</h2>
<p>Le scanner fournit des images précises et rapides des organes, des os et des vaisseaux. Il est très utile en urgence (traumatisme, douleur abdominale, suspicion d'AVC ou d'embolie), pour explorer le thorax et l'abdomen, ou pour préciser une anomalie. Un produit de contraste iodé est souvent injecté pour mieux voir les vaisseaux et certains organes.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Allongé sur une table qui glisse dans un anneau (bien plus ouvert que l'IRM), vous restez immobile quelques instants pendant l'acquisition. Si un produit de contraste est injecté, une sensation de chaleur passagère est fréquente et normale.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li>Signaler une <strong>allergie</strong> connue (notamment à l'iode), une maladie des <strong>reins</strong> et une éventuelle <strong>grossesse</strong>.</li>
<li>Parfois être à jeun quelques heures si une injection est prévue.</li>
<li>Retirer les objets métalliques de la zone examinée.</li>
</ul>

<h2>Combien de temps dure-t-il ?</h2>
<p>L'acquisition est très rapide : <strong>quelques minutes</strong>. L'installation et l'éventuelle injection allongent un peu la durée totale.</p>

<h2>Est-ce douloureux ?</h2>
<p>Le scanner est <strong>indolore</strong>. Seule l'injection éventuelle du produit de contraste se ressent (piqûre, puis chaleur brève dans le corps).</p>

<h2>Y a-t-il des risques ?</h2>
<p>Le scanner utilise des <strong>rayons X</strong> : la dose est faible mais réelle, ce qui fait éviter l'examen pendant la grossesse sauf nécessité. Le produit de contraste iodé peut, rarement, entraîner une réaction allergique et demande des précautions en cas de maladie rénale. L'indication est toujours pesée par le médecin.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le <strong>radiologue</strong> analyse les images et rédige un compte-rendu. C'est votre médecin qui, à partir de ce compte-rendu et de votre situation, établit le diagnostic et la conduite à tenir.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 800 et 2 000 DH</strong> selon la région explorée et l'injection éventuelle. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs, variables selon le centre.</p>

<hr>
<p>Un scanner prescrit ou des résultats à interpréter ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const scannerFaq = [
  { q: "Le scanner est-il dangereux à cause des rayons X ?", a: "Le scanner utilise des rayons X à faible dose. Le risque individuel est très faible et l'examen n'est prescrit que lorsqu'il apporte un bénéfice supérieur. On l'évite néanmoins pendant la grossesse, sauf nécessité, et on limite les examens répétés inutiles." },
  { q: "Quelle différence entre un scanner et une IRM ?", a: "Le scanner utilise des rayons X, est rapide et excellent pour les os, le thorax, l'abdomen et les urgences. L'IRM utilise un champ magnétique, sans rayons X, et excelle pour les tissus mous (cerveau, articulations). Le médecin choisit selon ce qu'il recherche." },
  { q: "Qu'est-ce que le produit de contraste ?", a: "C'est un produit (souvent iodé) injecté dans une veine pour mieux visualiser les vaisseaux et certains organes. Il donne souvent une sensation de chaleur passagère. Il nécessite des précautions en cas d'allergie connue ou de maladie rénale." },
  { q: "Le scanner est-il douloureux ?", a: "Non, il est indolore. Seule l'injection éventuelle du produit de contraste se ressent : une piqûre, puis une sensation de chaleur brève et normale dans le corps." },
  { q: "Peut-on faire un scanner enceinte ?", a: "On évite le scanner pendant la grossesse en raison des rayons X, sauf si l'examen est vraiment nécessaire et sans alternative. Il faut toujours signaler une grossesse ou un doute : le médecin adapte alors la conduite." },
  { q: "Combien de temps dure un scanner ?", a: "L'acquisition des images ne dure que quelques minutes. Avec l'installation et l'éventuelle injection de produit de contraste, comptez un passage total assez court, bien plus rapide qu'une IRM." },
];
const scannerTakeaways = [
  "Le scanner donne des images rapides en coupes grâce aux rayons X.",
  "Très utile en urgence et pour le thorax, l'abdomen, les os et les vaisseaux.",
  "Il utilise des rayons X (dose faible) : évité pendant la grossesse sauf nécessité.",
  "Signaler allergie à l'iode, maladie rénale et grossesse avant l'examen.",
  "Prix indicatif au Maroc (privé) : environ 800 à 2 000 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. ÉCHOGRAPHIE
// ─────────────────────────────────────────────────────────────────────────────
const cEcho = `<p>L'échographie est un examen d'imagerie simple, indolore et sans danger, qui utilise des ultrasons — les mêmes que ceux du suivi de grossesse. Rapide et sans rayons X, elle explore de nombreux organes en temps réel. C'est souvent l'un des premiers examens prescrits.</p>

<h2>Pourquoi réaliser une échographie ?</h2>
<p>L'échographie visualise en temps réel des organes et des structures : abdomen (foie, vésicule, reins), petit bassin (utérus, ovaires, prostate), thyroïde, seins, vaisseaux (écho-doppler), cœur (échocardiographie) et bien sûr le suivi de <a href="/blog/suivi-grossesse-maroc">grossesse</a>. Elle guide aussi certains gestes.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Le médecin applique un <strong>gel</strong> sur la peau puis déplace une sonde sur la zone à explorer, en visualisant les images sur un écran. Certaines échographies se font par voie interne (endovaginale ou endorectale) pour une meilleure précision.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li><strong>Vessie pleine</strong> pour une échographie du petit bassin (boire avant et ne pas uriner).</li>
<li><strong>À jeun</strong> pour une échographie de l'abdomen (foie, vésicule).</li>
<li>Aucune préparation pour beaucoup d'autres (thyroïde, seins, vaisseaux).</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>En général <strong>15 à 30 minutes</strong>, selon la région et l'indication.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, l'échographie est <strong>indolore</strong>. Le gel peut être frais et une légère pression de la sonde est parfois sentie, sans plus.</p>

<h2>Y a-t-il des risques ?</h2>
<p><strong>Aucun risque connu</strong> : l'échographie n'utilise pas de rayons X. C'est pourquoi elle est parfaitement sûre, y compris pendant la grossesse et chez l'enfant, et peut être répétée sans danger.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le médecin qui réalise l'échographie rédige un <strong>compte-rendu</strong>. L'interprétation finale et la conduite à tenir reviennent à votre médecin, en tenant compte de l'ensemble de votre situation.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 200 et 500 DH</strong> selon le type d'échographie et le centre. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs, variables.</p>

<hr>
<p>Une échographie prescrite ou des résultats à comprendre ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const echoFaq = [
  { q: "L'échographie est-elle dangereuse ?", a: "Non. L'échographie utilise des ultrasons et non des rayons X : elle n'a aucun risque connu. C'est pourquoi elle est parfaitement sûre, y compris pendant la grossesse et chez l'enfant, et peut être répétée sans danger." },
  { q: "Faut-il être à jeun ou avoir la vessie pleine ?", a: "Cela dépend de la zone : à jeun pour l'abdomen (foie, vésicule), vessie pleine pour le petit bassin (boire avant sans uriner). Beaucoup d'échographies (thyroïde, seins, vaisseaux) ne demandent aucune préparation. L'ordonnance ou le centre le précise." },
  { q: "L'échographie fait-elle mal ?", a: "Non, elle est indolore. Le gel appliqué peut être un peu frais et la sonde exerce une légère pression, sans douleur. Les échographies par voie interne peuvent être un peu inconfortables mais restent bien tolérées." },
  { q: "Quelle différence entre échographie, scanner et IRM ?", a: "L'échographie utilise des ultrasons, sans rayons X, en temps réel : simple, sûre, mais limitée par l'air et les os. Le scanner (rayons X) et l'IRM (champ magnétique) donnent des images plus complètes de zones profondes. Le choix dépend de l'indication." },
  { q: "Combien de temps dure une échographie ?", a: "En général entre 15 et 30 minutes, selon la région explorée et l'indication. L'examen se fait en temps réel, et le médecin peut vous montrer et commenter certaines images pendant sa réalisation." },
  { q: "L'échographie est-elle remboursée au Maroc ?", a: "Sur prescription médicale, une partie du coût peut être prise en charge par l'assurance maladie (AMO), selon le barème. Le reste est à votre charge dans le privé. Renseignez-vous auprès de votre organisme et du centre." },
];
const echoTakeaways = [
  "L'échographie utilise des ultrasons, sans rayons X : simple, indolore et sans danger.",
  "Elle explore de nombreux organes en temps réel, dont le suivi de grossesse.",
  "Préparation variable : à jeun (abdomen) ou vessie pleine (petit bassin).",
  "Sûre y compris pendant la grossesse et chez l'enfant ; peut être répétée.",
  "Prix indicatif au Maroc (privé) : environ 200 à 500 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. ECG (ÉLECTROCARDIOGRAMME)
// ─────────────────────────────────────────────────────────────────────────────
const cEcg = `<p>L'électrocardiogramme (ECG) enregistre l'activité électrique du cœur. Rapide, indolore et sans danger, c'est l'un des examens de base en cardiologie : il aide à explorer des symptômes comme une <a href="/blog/douleur-poitrine-maroc">douleur à la poitrine</a> ou des palpitations, et à surveiller le cœur.</p>

<h2>Pourquoi réaliser un ECG ?</h2>
<p>L'ECG explore le rythme et le fonctionnement électrique du cœur. Il est prescrit devant une douleur thoracique, des palpitations, un malaise, un essoufflement, ou dans le cadre d'un bilan (<a href="/blog/hypertension-arterielle-maroc">hypertension</a>, avant une intervention, suivi cardiaque). Il aide à repérer un trouble du rythme, une souffrance du cœur ou les séquelles d'un infarctus.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Allongé, torse dégagé, on place des <strong>électrodes</strong> (petits capteurs autocollants ou à pince) sur la poitrine, les poignets et les chevilles. L'appareil enregistre alors le tracé pendant quelques secondes, sans rien envoyer dans le corps.</p>

<h2>Faut-il se préparer ?</h2>
<p><strong>Aucune préparation</strong> n'est nécessaire. Il suffit d'avoir la peau propre ; les hommes très poilus peuvent être rasés localement pour bien fixer les électrodes.</p>

<h2>Combien de temps dure-t-il ?</h2>
<p>L'ensemble prend <strong>environ 5 minutes</strong>, dont quelques secondes seulement d'enregistrement.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, l'ECG est totalement <strong>indolore</strong>. Les électrodes ne délivrent aucun courant : elles se contentent d'écouter l'activité du cœur.</p>

<h2>Y a-t-il des risques ?</h2>
<p><strong>Aucun.</strong> L'ECG standard est sans aucun danger et peut être répété autant que nécessaire, y compris pendant la grossesse.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le tracé est interprété par le médecin ou le <strong>cardiologue</strong>. Un ECG normal est rassurant mais n'exclut pas tout ; à l'inverse, certaines anomalies sont bénignes. D'autres examens (ECG d'effort, Holter, échographie du cœur) complètent parfois le bilan. L'interprétation revient au médecin.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, un ECG coûte en général <strong>entre 100 et 250 DH</strong>, souvent inclus dans une consultation de cardiologie. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs.</p>

<hr>
<p>Un ECG à réaliser ou à interpréter ? Sur SantéauMaroc, trouvez un cardiologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const ecgFaq = [
  { q: "À quoi sert un électrocardiogramme (ECG) ?", a: "Il enregistre l'activité électrique du cœur pour explorer le rythme et son fonctionnement. Il est utile devant une douleur thoracique, des palpitations, un malaise, ou dans un bilan (hypertension, avant une opération). Il repère troubles du rythme et souffrance cardiaque." },
  { q: "L'ECG est-il douloureux ou dangereux ?", a: "Ni l'un ni l'autre. Les électrodes ne délivrent aucun courant : elles écoutent simplement le cœur. L'examen est indolore, sans aucun risque, et peut être répété autant que nécessaire, y compris pendant la grossesse." },
  { q: "Combien de temps dure un ECG ?", a: "Environ 5 minutes au total, dont quelques secondes seulement d'enregistrement. Il n'y a aucune préparation particulière : il suffit d'avoir la peau propre pour bien fixer les électrodes." },
  { q: "Un ECG normal veut-il dire que mon cœur va bien ?", a: "Un ECG normal est rassurant mais ne permet pas d'exclure toute maladie cardiaque : il donne une image à un instant donné. Selon les symptômes, d'autres examens (ECG d'effort, Holter, échographie du cœur) peuvent être nécessaires." },
  { q: "Quelle différence entre ECG, Holter et ECG d'effort ?", a: "L'ECG standard enregistre le cœur quelques secondes au repos. Le Holter l'enregistre sur 24 heures ou plus, pour repérer des anomalies intermittentes. L'ECG d'effort s'effectue pendant une activité physique, pour démasquer une souffrance à l'effort." },
  { q: "L'ECG est-il remboursé au Maroc ?", a: "Sur prescription, une partie du coût peut être prise en charge par l'assurance maladie (AMO). L'ECG est souvent réalisé au cours d'une consultation de cardiologie. Renseignez-vous auprès de votre organisme pour votre taux." },
];
const ecgTakeaways = [
  "L'ECG enregistre l'activité électrique du cœur ; il est rapide et indolore.",
  "Il explore douleurs thoraciques, palpitations, malaises et sert au bilan cardiaque.",
  "Aucune préparation, aucun risque : les électrodes ne font qu'écouter le cœur.",
  "Un ECG normal est rassurant mais n'exclut pas tout : le médecin interprète.",
  "Prix indicatif au Maroc (privé) : environ 100 à 250 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. COLOSCOPIE
// ─────────────────────────────────────────────────────────────────────────────
const cColo = `<p>La coloscopie explore l'intérieur du gros intestin (côlon) à l'aide d'une caméra. C'est l'examen de référence pour le <a href="/blog/cancer-colorectal-maroc">dépistage du cancer colorectal</a> et l'exploration des troubles digestifs. Souvent redoutée, elle se déroule sous sédation et sa préparation, bien que contraignante, est essentielle à sa réussite.</p>

<h2>Pourquoi réaliser une coloscopie ?</h2>
<p>Elle permet de rechercher et de retirer des <strong>polypes</strong> (avant qu'ils ne deviennent un cancer), de dépister le cancer colorectal, et d'explorer des symptômes : sang dans les selles, changement durable du transit, douleurs, anémie inexpliquée. Elle permet aussi des prélèvements (biopsies).</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Un tube souple muni d'une caméra (endoscope) est introduit par l'anus et progresse dans le côlon. L'examen se fait le plus souvent sous <strong>sédation</strong> ou anesthésie légère, pour votre confort. Les polypes découverts peuvent être retirés dans le même temps.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li><strong>Préparation colique indispensable</strong> : un régime sans résidus les jours précédents, puis une solution à boire pour vider complètement le côlon.</li>
<li><strong>À jeun</strong> avant l'examen.</li>
<li>Signaler ses traitements (notamment anticoagulants) et organiser un accompagnant (sédation).</li>
</ul>
<blockquote>Bon à savoir : la qualité de la préparation détermine la fiabilité de l'examen. Un côlon mal préparé peut faire manquer des lésions et obliger à recommencer. Suivez scrupuleusement les consignes.</blockquote>

<h2>Combien de temps dure-t-elle ?</h2>
<p>L'examen dure en général <strong>20 à 45 minutes</strong>, auxquelles s'ajoute un temps de réveil et de surveillance après la sédation.</p>

<h2>Est-ce douloureux ?</h2>
<p>Grâce à la sédation, la coloscopie est le plus souvent <strong>peu ou pas douloureuse</strong>. Des ballonnements passagers sont fréquents après l'examen, le temps d'évacuer l'air insufflé.</p>

<h2>Y a-t-il des risques ?</h2>
<p>La coloscopie est un examen sûr, mais non dénué de risques rares : <strong>saignement</strong> ou <strong>perforation</strong>, surtout en cas de retrait de polype, et les risques liés à l'anesthésie. Ils sont expliqués avant l'examen et restent exceptionnels au regard du bénéfice.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le gastro-entérologue remet un <strong>compte-rendu</strong> immédiat, complété par l'analyse des éventuelles biopsies quelques jours plus tard. C'est lui, avec votre médecin, qui explique les résultats et la conduite à tenir.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 1 500 et 3 500 DH</strong>, selon l'anesthésie, les gestes réalisés et le centre. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs, à confirmer.</p>

<hr>
<p>Une coloscopie prescrite ou un dépistage à organiser ? Sur SantéauMaroc, trouvez un gastro-entérologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const coloFaq = [
  { q: "La coloscopie est-elle douloureuse ?", a: "Grâce à la sédation ou à l'anesthésie légère, elle est le plus souvent peu ou pas douloureuse. Après l'examen, des ballonnements passagers sont fréquents, le temps d'évacuer l'air insufflé dans le côlon." },
  { q: "Comment se préparer à une coloscopie ?", a: "Par un régime sans résidus les jours précédents, puis une solution laxative à boire pour vider complètement le côlon, et en restant à jeun avant l'examen. Cette préparation est essentielle : un côlon mal nettoyé peut fausser l'examen et obliger à le refaire." },
  { q: "À partir de quel âge faire une coloscopie de dépistage ?", a: "Le dépistage du cancer colorectal commence généralement à 50 ans, souvent par un test de recherche de sang dans les selles ; une coloscopie est réalisée s'il est positif ou plus tôt en cas d'antécédents familiaux. Votre médecin adapte la stratégie." },
  { q: "Quels sont les risques d'une coloscopie ?", a: "C'est un examen sûr, mais des complications rares existent : saignement ou perforation, surtout si un polype est retiré, et les risques liés à l'anesthésie. Ils sont expliqués avant et restent exceptionnels au regard du bénéfice du dépistage." },
  { q: "Combien de temps dure une coloscopie ?", a: "L'examen dure en général 20 à 45 minutes, auxquelles s'ajoute un temps de réveil et de surveillance après la sédation. Il faut prévoir un accompagnant, car la conduite est déconseillée après l'anesthésie." },
  { q: "Quelle différence entre coloscopie et gastroscopie ?", a: "La coloscopie explore le gros intestin (côlon) par voie basse ; la gastroscopie (fibroscopie) explore l'œsophage, l'estomac et le début de l'intestin par la bouche. Les deux utilisent une caméra souple et peuvent être réalisées sous sédation." },
];
const coloTakeaways = [
  "La coloscopie explore le côlon par caméra : examen de référence du dépistage du cancer colorectal.",
  "Elle permet de retirer les polypes avant qu'ils ne deviennent cancéreux.",
  "La préparation (vidange du côlon) est contraignante mais indispensable.",
  "Réalisée sous sédation, elle est peu ou pas douloureuse ; les risques graves sont rares.",
  "Prix indicatif au Maroc (privé) : environ 1 500 à 3 500 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES FICHES
// ─────────────────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: "analyse-de-sang-maroc",
    aboutEntity: "Analyse de sang",
    title: "Prise de sang : déroulé, préparation et résultats",
    excerpt: "Prise de sang : pourquoi elle est prescrite, comment elle se déroule, faut-il être à jeun, douleur, résultats et prix indicatif au Maroc. Un guide clair — seul votre médecin interprète les résultats.",
    content: cSang,
    metaTitle: "Prise de sang : déroulé, à jeun, résultats et prix | Maroc",
    metaDesc: "Prise de sang : pourquoi, déroulé, faut-il être à jeun, douleur, comment lire les résultats et prix indicatif au Maroc. Guide clair et fiable, adapté au contexte marocain.",
    readingTime: 6,
    keyTakeaways: sangTakeaways,
    faq: sangFaq,
  },
  {
    slug: "irm-maroc",
    aboutEntity: "IRM",
    title: "IRM : déroulé, préparation, risques et prix au Maroc",
    excerpt: "IRM : pourquoi cet examen, comment il se déroule, préparation, durée, douleur, risques, interprétation et prix indicatif au Maroc. Un guide clair pour aborder son IRM sereinement.",
    content: cIrm,
    metaTitle: "IRM au Maroc : déroulé, préparation, risques et prix",
    metaDesc: "IRM : pourquoi, déroulé, préparation, durée, douleur, risques (pacemaker, grossesse), résultats et prix indicatif au Maroc. Guide clair et rassurant, adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: irmTakeaways,
    faq: irmFaq,
  },
  {
    slug: "scanner-maroc",
    aboutEntity: "Scanner (tomodensitométrie)",
    title: "Scanner : déroulé, préparation, risques et prix au Maroc",
    excerpt: "Scanner (TDM) : pourquoi cet examen, déroulé, préparation, durée, douleur, risques (rayons X, iode), interprétation et prix indicatif au Maroc. Un guide clair et fiable.",
    content: cScanner,
    metaTitle: "Scanner au Maroc : déroulé, risques, iode et prix",
    metaDesc: "Scanner (TDM) : pourquoi, déroulé, préparation, durée, douleur, risques (rayons X, produit de contraste iodé), résultats et prix indicatif au Maroc. Guide clair, adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: scannerTakeaways,
    faq: scannerFaq,
  },
  {
    slug: "echographie-maroc",
    aboutEntity: "Échographie",
    title: "Échographie : déroulé, préparation et prix au Maroc",
    excerpt: "Échographie : pourquoi cet examen sans danger, comment il se déroule, préparation (à jeun ou vessie pleine), durée, résultats et prix indicatif au Maroc. Un guide clair et rassurant.",
    content: cEcho,
    metaTitle: "Échographie au Maroc : déroulé, préparation et prix",
    metaDesc: "Échographie : pourquoi, déroulé, préparation (à jeun ou vessie pleine), durée, absence de risque (sans rayons X), résultats et prix indicatif au Maroc. Guide clair, adapté au Maroc.",
    readingTime: 5,
    keyTakeaways: echoTakeaways,
    faq: echoFaq,
  },
  {
    slug: "electrocardiogramme-ecg-maroc",
    aboutEntity: "Électrocardiogramme",
    title: "Électrocardiogramme (ECG) : déroulé, utilité et prix au Maroc",
    excerpt: "ECG : à quoi sert cet examen du cœur, comment il se déroule, durée, absence de douleur et de risque, interprétation et prix indicatif au Maroc. Un guide clair et rassurant.",
    content: cEcg,
    metaTitle: "Électrocardiogramme (ECG) au Maroc : déroulé et prix",
    metaDesc: "ECG (électrocardiogramme) : à quoi il sert, déroulé, durée, absence de douleur et de risque, comment lire le tracé et prix indicatif au Maroc. Guide clair, adapté au Maroc.",
    readingTime: 5,
    keyTakeaways: ecgTakeaways,
    faq: ecgFaq,
  },
  {
    slug: "coloscopie-maroc",
    aboutEntity: "Coloscopie",
    title: "Coloscopie : déroulé, préparation, risques et prix au Maroc",
    excerpt: "Coloscopie : pourquoi cet examen, préparation du côlon, déroulé sous sédation, durée, douleur, risques, résultats et prix indicatif au Maroc. Le guide complet pour l'aborder sereinement.",
    content: cColo,
    metaTitle: "Coloscopie au Maroc : préparation, déroulé et prix",
    metaDesc: "Coloscopie : pourquoi, préparation du côlon, déroulé sous sédation, durée, douleur, risques, résultats et prix indicatif au Maroc. Guide complet et rassurant, adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: coloTakeaways,
    faq: coloFaq,
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name, description: CATEGORY.description, color: CATEGORY.color },
    create: CATEGORY,
    select: { id: true, slug: true },
  });
  console.log(`✓ Catégorie  /blog/categorie/${cat.slug}  (${CATEGORY.name})`);

  const now = new Date();

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
    console.log(`✓ Examen  /blog/${post.slug}`);
  }

  console.log(`\nCatégorie Examens : ${ARTICLES.length} fiches publiées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
