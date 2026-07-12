require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie EXAMENS — LOT 3 (catégorie créée par seed-blog-examens.cjs).
// Gabarit Examen (pourquoi, déroulé, préparation, durée, douleur, risques,
// interprétation, PRIX INDICATIF Maroc) + FAQ + À retenir. ⚠️ Prix à valider.
//   • Holter ECG          → cardiologie
//   • MAPA (Holter tension)→ cardiologie
//   • Écho-doppler        → cardiologie
//   • Fond d'œil          → médecine générale (repli, pas de page ophtalmo)
//   • Test allergologique → médecine générale (repli)
//   • EEG                 → médecine générale (repli, pas de page neuro)
// ════════════════════════════════════════════════════════════════════════════

const cHolter = `<p>Le Holter ECG (ou enregistrement ECG des 24 heures) enregistre l'activité électrique du cœur en continu, pendant la vie quotidienne. Il complète l'<a href="/blog/electrocardiogramme-ecg-maroc">électrocardiogramme</a> classique en captant des anomalies qui n'apparaissent que par moments.</p>

<h2>Pourquoi réaliser un Holter ECG ?</h2>
<p>Pour explorer des <a href="/blog/palpitations-maroc">palpitations</a>, des malaises, des vertiges ou une fatigue inexpliquée, et rechercher un trouble du rythme (comme la fibrillation auriculaire) qui survient de façon intermittente. Un ECG classique, trop court, peut passer à côté.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>De petites électrodes autocollantes sont posées sur la poitrine et reliées à un petit boîtier enregistreur porté à la ceinture ou en bandoulière. Vous rentrez chez vous et vivez normalement, en notant vos activités et vos symptômes sur un carnet.</p>

<h2>Faut-il se préparer ?</h2>
<p>Aucune préparation, sinon avoir la peau propre (les hommes très poilus peuvent être rasés localement). On évite de mouiller le boîtier (pas de douche pendant l'enregistrement selon l'appareil).</p>

<h2>Combien de temps dure-t-il ?</h2>
<p>L'enregistrement dure <strong>24 heures</strong> le plus souvent, parfois 48 heures ou davantage. La pose et le retrait ne prennent que quelques minutes.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, l'examen est totalement <strong>indolore</strong> : les électrodes ne font qu'écouter le cœur.</p>

<h2>Y a-t-il des risques ?</h2>
<p><strong>Aucun.</strong> Le Holter est sans danger et peut être répété.</p>

<h2>Comment lire les résultats ?</h2>
<p>L'enregistrement est analysé par le <strong>cardiologue</strong>, qui met en relation les anomalies du tracé avec les symptômes notés dans le carnet. Le tout est interprété selon votre situation.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 400 et 800 DH</strong> selon le centre. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs.</p>

<hr>
<p>Des palpitations ou malaises à explorer ? Sur SantéauMaroc, trouvez un cardiologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const holterFaq = [
  { q: "À quoi sert un Holter ECG ?", a: "À enregistrer le cœur en continu pendant 24 heures (ou plus) durant la vie quotidienne, pour détecter des troubles du rythme qui n'apparaissent que par moments et qu'un ECG classique, trop court, peut manquer. Il explore palpitations, malaises et vertiges." },
  { q: "Comment se passe un Holter ECG ?", a: "De petites électrodes sont collées sur la poitrine et reliées à un boîtier enregistreur que l'on porte 24 heures en vivant normalement. On note ses activités et symptômes sur un carnet, ce qui aide le cardiologue à interpréter le tracé." },
  { q: "Le Holter ECG est-il douloureux ou risqué ?", a: "Ni l'un ni l'autre : les électrodes ne font qu'écouter le cœur, sans rien envoyer dans le corps. L'examen est indolore, sans aucun risque, et peut être répété autant que nécessaire." },
  { q: "Peut-on se doucher avec un Holter ?", a: "En général non pendant l'enregistrement, pour ne pas mouiller le boîtier et les électrodes, sauf appareil étanche. L'équipe précise les consignes lors de la pose. La douche est possible juste avant et après le port de l'appareil." },
  { q: "Quelle différence entre ECG et Holter ECG ?", a: "L'ECG standard enregistre le cœur quelques secondes au repos ; le Holter l'enregistre sur 24 heures ou plus, pendant la vie normale, pour capter des anomalies intermittentes. Ils sont complémentaires selon ce que l'on recherche." },
];
const holterTk = [
  "Le Holter ECG enregistre le cœur en continu 24 h pour capter les troubles du rythme intermittents.",
  "Il explore palpitations, malaises et vertiges quand l'ECG classique est normal.",
  "Indolore et sans risque ; on note ses symptômes sur un carnet.",
  "Prix indicatif au Maroc (privé) : environ 400 à 800 DH.",
];

const cMapa = `<p>La MAPA (mesure ambulatoire de la pression artérielle), ou « Holter tensionnel », enregistre la tension automatiquement sur 24 heures. Elle donne une image bien plus fidèle de la tension réelle que la mesure au cabinet.</p>

<h2>Pourquoi réaliser une MAPA ?</h2>
<p>Pour confirmer une <a href="/blog/hypertension-arterielle-maroc">hypertension</a>, écarter un « effet blouse blanche » (tension élevée seulement au cabinet), dépister une hypertension masquée, ou vérifier l'efficacité d'un traitement, y compris la nuit.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Un brassard est placé au bras, relié à un petit boîtier porté à la ceinture. L'appareil gonfle automatiquement à intervalles réguliers (par exemple toutes les 15 à 30 minutes le jour, moins la nuit) et enregistre chaque mesure.</p>

<h2>Faut-il se préparer ?</h2>
<p>Aucune préparation. Il faut vivre normalement, garder le bras immobile et détendu pendant les mesures, et noter ses activités et son sommeil. Éviter de mouiller le boîtier.</p>

<h2>Combien de temps dure-t-elle ?</h2>
<p><strong>24 heures</strong>, nuit comprise (les mesures nocturnes sont importantes).</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, mais le gonflement répété du brassard peut être un peu gênant, surtout la nuit. C'est sans danger.</p>

<h2>Y a-t-il des risques ?</h2>
<p><strong>Aucun.</strong> Tout au plus une petite marque passagère au bras liée au brassard.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le médecin analyse les moyennes de tension sur la journée, la nuit et sur 24 heures. Les seuils diffèrent de ceux du cabinet ; l'interprétation tient compte de votre situation et de votre traitement.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 400 et 800 DH</strong> selon le centre. Prise en charge partielle possible par l'AMO sur prescription. Montants indicatifs.</p>

<hr>
<p>Une tension à confirmer ou à surveiller ? Sur SantéauMaroc, trouvez un cardiologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const mapaFaq = [
  { q: "À quoi sert la MAPA (Holter tensionnel) ?", a: "À enregistrer la tension automatiquement sur 24 heures, jour et nuit, pour confirmer une hypertension, écarter un « effet blouse blanche », dépister une hypertension masquée ou vérifier l'efficacité d'un traitement. Elle reflète mieux la tension réelle que la mesure au cabinet." },
  { q: "Comment se passe une MAPA ?", a: "Un brassard placé au bras, relié à un boîtier porté à la ceinture, gonfle automatiquement à intervalles réguliers pendant 24 heures. On vit normalement en gardant le bras immobile pendant les mesures et en notant ses activités et son sommeil." },
  { q: "La MAPA est-elle douloureuse ?", a: "Non, mais le gonflement répété du brassard, notamment la nuit, peut être un peu gênant et perturber légèrement le sommeil. L'examen est sans danger et laisse tout au plus une petite marque passagère au bras." },
  { q: "Pourquoi mesurer la tension sur 24 heures ?", a: "Parce que la tension varie beaucoup dans la journée et peut monter au cabinet (effet blouse blanche). La mesure sur 24 heures, nuit comprise, donne une image fidèle et aide à poser le diagnostic et à ajuster le traitement." },
  { q: "MAPA ou automesure à domicile ?", a: "Les deux évaluent la tension hors du cabinet. L'automesure se fait soi-même avec un tensiomètre sur plusieurs jours ; la MAPA enregistre automatiquement sur 24 heures, y compris la nuit. Le médecin choisit selon la situation." },
];
const mapaTk = [
  "La MAPA (Holter tensionnel) enregistre la tension sur 24 h, jour et nuit.",
  "Elle confirme l'hypertension et écarte l'« effet blouse blanche ».",
  "Sans danger ; le gonflement répété du brassard peut gêner un peu la nuit.",
  "Prix indicatif au Maroc (privé) : environ 400 à 800 DH.",
];

const cDoppler = `<p>L'écho-doppler est une échographie des vaisseaux sanguins : elle visualise la circulation dans les artères et les veines, sans rayons X ni douleur. C'est l'examen clé pour explorer les problèmes de circulation.</p>

<h2>Pourquoi réaliser un écho-doppler ?</h2>
<p>Pour explorer les <a href="/blog/varices-maroc">varices</a> et l'insuffisance veineuse, rechercher une <strong>phlébite</strong> (caillot) devant une <a href="/blog/jambes-gonflees-oedeme-maroc">jambe gonflée</a>, évaluer les artères (jambes, cou/carotides) en cas de risque cardiovasculaire, ou étudier un organe.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Comme une échographie : le médecin applique un gel et déplace une sonde sur la peau, au niveau de la zone à explorer. Le doppler traduit la circulation du sang en images et en sons.</p>

<h2>Faut-il se préparer ?</h2>
<p>En général aucune préparation. Pour certains dopplers de l'abdomen, il peut être demandé d'être à jeun. Portez des vêtements permettant de dégager facilement la zone.</p>

<h2>Combien de temps dure-t-il ?</h2>
<p>En général <strong>20 à 45 minutes</strong> selon la région explorée.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, l'examen est <strong>indolore</strong> ; le gel peut être un peu frais et la sonde exerce une légère pression.</p>

<h2>Y a-t-il des risques ?</h2>
<p><strong>Aucun</strong> : comme toute échographie, il n'utilise pas de rayons X et peut être répété, y compris pendant la grossesse.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le médecin qui réalise l'examen rédige un compte-rendu (rétrécissement, caillot, reflux veineux…). L'interprétation et la conduite reviennent à votre médecin.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 400 et 800 DH</strong> selon la zone et le centre. Prise en charge partielle possible par l'AMO sur prescription. Montants indicatifs.</p>

<hr>
<p>Un problème de circulation à explorer ? Sur SantéauMaroc, trouvez un cardiologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const dopplerFaq = [
  { q: "À quoi sert un écho-doppler ?", a: "À visualiser la circulation dans les artères et les veines. Il explore les varices et l'insuffisance veineuse, recherche une phlébite devant une jambe gonflée, évalue les artères (jambes, carotides) en cas de risque cardiovasculaire, ou étudie un organe." },
  { q: "L'écho-doppler est-il douloureux ou dangereux ?", a: "Non, il est indolore et sans danger : comme toute échographie, il utilise des ultrasons et non des rayons X. Le gel peut être un peu frais et la sonde exerce une légère pression. Il peut être répété, y compris pendant la grossesse." },
  { q: "Comment se préparer à un écho-doppler ?", a: "En général aucune préparation n'est nécessaire. Pour certains dopplers de l'abdomen, il peut être demandé d'être à jeun. Portez des vêtements permettant de dégager facilement la zone à examiner." },
  { q: "Combien de temps dure un écho-doppler ?", a: "En général de 20 à 45 minutes selon la région explorée (jambes, cou, abdomen). L'examen se fait en temps réel, et le médecin peut commenter certaines images pendant sa réalisation." },
  { q: "L'écho-doppler détecte-t-il une phlébite ?", a: "Oui, c'est l'examen de référence pour rechercher une phlébite (caillot dans une veine profonde) devant une jambe gonflée, douloureuse et chaude. Il est réalisé en urgence dans ce contexte pour confirmer ou écarter le diagnostic." },
];
const dopplerTk = [
  "L'écho-doppler est une échographie des vaisseaux, sans rayons X ni douleur.",
  "Il explore varices, phlébite, artères des jambes et du cou.",
  "Sans danger, il peut être répété, y compris pendant la grossesse.",
  "Prix indicatif au Maroc (privé) : environ 400 à 800 DH.",
];

const cFondOeil = `<p>Le fond d'œil est un examen qui permet d'observer l'arrière de l'œil (la rétine). Rapide et indolore, il dépiste des maladies des yeux, mais aussi le retentissement de maladies générales comme le <a href="/blog/diabete-type-2-maroc">diabète</a> ou l'<a href="/blog/hypertension-arterielle-maroc">hypertension</a>.</p>

<h2>Pourquoi réaliser un fond d'œil ?</h2>
<p>Pour dépister et suivre la rétinopathie du diabétique et de l'hypertendu, le glaucome, la DMLA (dégénérescence liée à l'âge) et d'autres atteintes de la rétine. Il est recommandé régulièrement chez les diabétiques.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Le médecin observe la rétine à l'aide d'un appareil lumineux. Des <strong>gouttes</strong> sont souvent instillées pour dilater la pupille et mieux voir le fond de l'œil.</p>

<h2>Faut-il se préparer ?</h2>
<p>Peu de préparation, mais si des gouttes dilatatrices sont utilisées, la vue reste <strong>floue et éblouie pendant quelques heures</strong> : il est déconseillé de conduire après l'examen ; prévoyez un accompagnant et des lunettes de soleil.</p>

<h2>Combien de temps dure-t-il ?</h2>
<p>L'examen lui-même est bref ; avec la dilatation, comptez au total <strong>30 à 45 minutes</strong> (temps d'action des gouttes).</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, il est <strong>indolore</strong> ; la lumière est éblouissante mais brève, et les gouttes peuvent picoter légèrement.</p>

<h2>Y a-t-il des risques ?</h2>
<p>Très peu. La gêne principale est l'éblouissement et la vision floue transitoires liés aux gouttes.</p>

<h2>Comment lire les résultats ?</h2>
<p>L'ophtalmologiste décrit l'état de la rétine et des vaisseaux et en tire la conduite (surveillance, traitement au laser…), en lien avec votre médecin.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Le fond d'œil est souvent réalisé lors d'une consultation d'ophtalmologie ; comptez en général <strong>entre 150 et 400 DH</strong> selon le centre. Prise en charge partielle possible par l'AMO sur prescription. Montants indicatifs.</p>

<hr>
<p>Diabétique ou hypertendu ? Le fond d'œil protège votre vue. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const fondOeilFaq = [
  { q: "À quoi sert le fond d'œil ?", a: "À observer la rétine (l'arrière de l'œil) pour dépister des maladies des yeux (glaucome, DMLA) et le retentissement de maladies générales, notamment la rétinopathie du diabète et de l'hypertension. Il est recommandé régulièrement chez les diabétiques." },
  { q: "Le fond d'œil est-il douloureux ?", a: "Non, il est indolore. La lumière de l'appareil est éblouissante mais brève, et les gouttes qui dilatent la pupille peuvent picoter légèrement. La principale gêne est ensuite la vision floue transitoire." },
  { q: "Peut-on conduire après un fond d'œil ?", a: "Pas immédiatement si des gouttes dilatatrices ont été utilisées : la vue reste floue et éblouie pendant quelques heures. Il est déconseillé de conduire ; mieux vaut prévoir un accompagnant et des lunettes de soleil." },
  { q: "Pourquoi les diabétiques doivent-ils faire un fond d'œil ?", a: "Parce que le diabète peut abîmer la rétine (rétinopathie diabétique), souvent sans symptôme au début. Un fond d'œil régulier permet de dépister ces atteintes tôt et de les traiter avant qu'elles ne menacent la vue." },
  { q: "Combien de temps dure un fond d'œil ?", a: "L'examen lui-même est bref, mais avec la dilatation de la pupille par les gouttes, il faut compter au total 30 à 45 minutes, le temps que les gouttes agissent. La vision reste ensuite floue quelques heures." },
];
const fondOeilTk = [
  "Le fond d'œil observe la rétine ; rapide et indolore.",
  "Il dépiste glaucome, DMLA et le retentissement du diabète et de l'hypertension.",
  "Les gouttes dilatatrices rendent la vue floue quelques heures : ne pas conduire après.",
  "Prix indicatif au Maroc : environ 150 à 400 DH.",
];

const cTestAllergie = `<p>Les tests d'allergie permettent d'identifier à quoi une personne est allergique. Ils s'adressent aux personnes souffrant d'<a href="/blog/allergie-maroc">allergies</a> (rhinite, asthme, allergie alimentaire ou médicamenteuse) pour cibler l'éviction et le traitement.</p>

<h2>Pourquoi réaliser un test d'allergie ?</h2>
<p>Pour confirmer une allergie et identifier le ou les allergènes en cause (pollens, acariens, animaux, aliments, médicaments), quand les symptômes sont gênants, récidivants ou sévères.</p>

<h2>Les principaux tests</h2>
<ul>
<li><strong>Tests cutanés (prick-tests)</strong> : de petites gouttes d'allergènes sont déposées sur l'avant-bras, puis la peau est légèrement piquée ; une réaction (petite papule) apparaît en cas d'allergie.</li>
<li><strong>Dosages sanguins</strong> (IgE spécifiques) : une prise de sang mesure les anticorps dirigés contre un allergène.</li>
</ul>

<h2>Faut-il se préparer ?</h2>
<p>Pour les prick-tests, il faut souvent <strong>arrêter les antihistaminiques</strong> quelques jours avant (ils fausseraient le résultat), selon les consignes du médecin. Signalez vos traitements.</p>

<h2>Combien de temps ça dure ?</h2>
<p>Les prick-tests durent environ <strong>20 à 30 minutes</strong> (lecture rapide). La prise de sang ne prend que quelques minutes.</p>

<h2>Est-ce douloureux ?</h2>
<p>Les prick-tests provoquent de simples micro-piqûres, quasi indolores, parfois des démangeaisons passagères. La prise de sang se limite à la piqûre habituelle.</p>

<h2>Y a-t-il des risques ?</h2>
<p>Très faibles. De rares réactions plus marquées peuvent survenir lors des prick-tests, d'où leur réalisation en milieu médical équipé.</p>

<h2>Comment lire les résultats ?</h2>
<p>L'allergologue interprète les tests au regard des symptômes : un test positif n'a de valeur que s'il correspond à une réaction réelle. Il en tire l'éviction, le traitement et l'éventuelle désensibilisation.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Le prix varie selon le nombre d'allergènes testés et la technique ; il est fixé par le centre, avec une prise en charge partielle possible par l'AMO sur prescription. Montants indicatifs, à confirmer.</p>

<hr>
<p>Des allergies à explorer ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const testAllergieFaq = [
  { q: "Comment se passe un test d'allergie ?", a: "Le plus souvent par des prick-tests : de petites gouttes d'allergènes sont déposées sur l'avant-bras, puis la peau est légèrement piquée ; une petite réaction apparaît en cas d'allergie. Un dosage sanguin des IgE spécifiques peut compléter ou remplacer les prick-tests." },
  { q: "Les tests d'allergie sont-ils douloureux ?", a: "Les prick-tests se limitent à de micro-piqûres quasi indolores, avec parfois des démangeaisons passagères. Le dosage sanguin se limite à la piqûre habituelle d'une prise de sang. L'examen est donc très bien toléré." },
  { q: "Faut-il arrêter des médicaments avant un test d'allergie ?", a: "Pour les prick-tests, il faut souvent arrêter les antihistaminiques quelques jours avant, car ils fausseraient le résultat. Suivez les consignes du médecin et signalez tous vos traitements avant l'examen." },
  { q: "Un test d'allergie positif signifie-t-il que je suis allergique ?", a: "Pas toujours : un test positif n'a de valeur que s'il correspond à des symptômes réels. C'est pourquoi l'allergologue interprète toujours les tests au regard de votre histoire clinique avant de conclure et de proposer une prise en charge." },
  { q: "Quand faire un bilan allergologique ?", a: "Quand les symptômes d'allergie (rhinite, asthme, urticaire, réactions alimentaires ou médicamenteuses) sont gênants, récidivants ou sévères. Le bilan permet d'identifier les allergènes pour cibler l'éviction et, parfois, proposer une désensibilisation." },
];
const testAllergieTk = [
  "Les tests d'allergie identifient les allergènes en cause (prick-tests, IgE sanguines).",
  "Les prick-tests sont rapides et quasi indolores ; arrêter les antihistaminiques avant.",
  "Un test positif ne compte que s'il correspond à des symptômes réels.",
  "Ils ciblent l'éviction, le traitement et l'éventuelle désensibilisation.",
];

const cEeg = `<p>L'électroencéphalogramme (EEG) enregistre l'activité électrique du cerveau. Indolore et sans danger, il est surtout utilisé pour explorer les crises d'épilepsie et certains troubles neurologiques.</p>

<h2>Pourquoi réaliser un EEG ?</h2>
<p>Principalement pour explorer une suspicion d'<strong>épilepsie</strong> (après une crise, un malaise avec perte de connaissance), certains troubles neurologiques, ou pour préciser la nature de malaises. Il étudie le fonctionnement électrique du cerveau.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>De petites <strong>électrodes</strong> sont posées sur le cuir chevelu (avec un gel ou un bonnet). Vous restez allongé ou assis, détendu. On peut vous demander d'ouvrir et fermer les yeux, de respirer profondément, ou d'être exposé à une lumière clignotante pour stimuler le cerveau.</p>

<h2>Faut-il se préparer ?</h2>
<p>Venir avec des cheveux propres et secs (sans gel ni laque). Selon l'indication, un EEG « après privation de sommeil » peut être demandé (dormir peu la nuit précédente). Signalez vos traitements.</p>

<h2>Combien de temps dure-t-il ?</h2>
<p>En général <strong>20 à 40 minutes</strong>, parfois plus pour les enregistrements prolongés.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, l'EEG est totalement <strong>indolore</strong> : les électrodes ne font qu'enregistrer, elles n'envoient aucun courant.</p>

<h2>Y a-t-il des risques ?</h2>
<p><strong>Aucun.</strong> La stimulation par lumière clignotante peut rarement déclencher une gêne chez des personnes très sensibles ; elle est réalisée sous surveillance.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le tracé est analysé par le <strong>neurologue</strong>, qui recherche des anomalies. Un EEG normal n'exclut pas une épilepsie, et certaines anomalies sont sans conséquence : l'interprétation tient compte du contexte clinique.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 300 et 600 DH</strong> selon le centre et le type d'enregistrement. Prise en charge partielle possible par l'AMO sur prescription. Montants indicatifs.</p>

<hr>
<p>Un EEG prescrit ou des malaises à explorer ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const eegFaq = [
  { q: "À quoi sert un électroencéphalogramme (EEG) ?", a: "À enregistrer l'activité électrique du cerveau, surtout pour explorer une suspicion d'épilepsie (après une crise ou un malaise avec perte de connaissance) et certains troubles neurologiques. Il étudie le fonctionnement électrique du cerveau." },
  { q: "L'EEG est-il douloureux ou dangereux ?", a: "Ni l'un ni l'autre. Les électrodes posées sur le cuir chevelu ne font qu'enregistrer, sans envoyer de courant. L'examen est indolore et sans danger. La lumière clignotante utilisée est réalisée sous surveillance." },
  { q: "Comment se préparer à un EEG ?", a: "Venir avec des cheveux propres et secs, sans gel ni laque. Selon l'indication, un EEG après privation de sommeil peut être demandé (dormir peu la nuit précédente). Signalez vos traitements, qui ne sont en général pas à arrêter sans avis." },
  { q: "Un EEG normal exclut-il l'épilepsie ?", a: "Non. Un EEG peut être normal entre les crises alors qu'une épilepsie existe. À l'inverse, certaines anomalies sont sans conséquence. C'est pourquoi le neurologue interprète toujours l'EEG au regard du contexte clinique." },
  { q: "Combien de temps dure un EEG ?", a: "En général de 20 à 40 minutes, parfois davantage pour des enregistrements prolongés ou après privation de sommeil. La pose des électrodes et les consignes (yeux ouverts/fermés, respiration) font partie de l'examen." },
];
const eegTk = [
  "L'EEG enregistre l'activité électrique du cerveau ; indolore et sans danger.",
  "Il explore surtout l'épilepsie et certains malaises ou troubles neurologiques.",
  "Cheveux propres et secs ; parfois EEG après privation de sommeil.",
  "Prix indicatif au Maroc (privé) : environ 300 à 600 DH.",
];

const ARTICLES = [
  { slug:"holter-ecg-maroc", aboutEntity:"Holter ECG",
    title:"Holter ECG (24 h) : pourquoi, déroulé et prix au Maroc",
    excerpt:"Holter ECG : pourquoi enregistrer le cœur sur 24 h, comment se déroule l'examen, absence de douleur et de risque, interprétation et prix indicatif au Maroc.",
    metaTitle:"Holter ECG (24 h) : déroulé et prix | Maroc",
    metaDesc:"Holter ECG : enregistrement du cœur sur 24 h pour détecter les troubles du rythme intermittents, déroulé, absence de douleur, interprétation et prix indicatif au Maroc.",
    readingTime:5, content:cHolter, keyTakeaways:holterTk, faq:holterFaq },
  { slug:"mapa-holter-tensionnel-maroc", aboutEntity:"MAPA",
    title:"MAPA (Holter tensionnel) : mesurer sa tension sur 24 h",
    excerpt:"MAPA ou Holter tensionnel : pourquoi mesurer la tension sur 24 h, déroulé, préparation, interprétation et prix indicatif au Maroc. Un guide clair.",
    metaTitle:"MAPA (Holter tensionnel) : déroulé et prix | Maroc",
    metaDesc:"MAPA (Holter tensionnel) : mesure de la tension sur 24 h pour confirmer une hypertension et écarter l'effet blouse blanche, déroulé, interprétation et prix indicatif au Maroc.",
    readingTime:5, content:cMapa, keyTakeaways:mapaTk, faq:mapaFaq },
  { slug:"echo-doppler-maroc", aboutEntity:"Écho-doppler",
    title:"Écho-doppler : examen des vaisseaux, déroulé et prix",
    excerpt:"Écho-doppler : pourquoi cet examen des vaisseaux (varices, phlébite, artères), comment il se déroule, absence de risque et prix indicatif au Maroc.",
    metaTitle:"Écho-doppler : examen des vaisseaux et prix | Maroc",
    metaDesc:"Écho-doppler : échographie des vaisseaux (varices, phlébite, artères des jambes et du cou), déroulé, absence de douleur et de risque, et prix indicatif au Maroc.",
    readingTime:5, content:cDoppler, keyTakeaways:dopplerTk, faq:dopplerFaq },
  { slug:"fond-d-oeil-maroc", aboutEntity:"Fond d'œil",
    title:"Fond d'œil : pourquoi, déroulé et prix au Maroc",
    excerpt:"Fond d'œil : pourquoi cet examen de la rétine (diabète, hypertension, glaucome), déroulé, gouttes dilatatrices, et prix indicatif au Maroc.",
    metaTitle:"Fond d'œil : déroulé, gouttes et prix | Maroc",
    metaDesc:"Fond d'œil : examen de la rétine pour dépister glaucome, DMLA et le retentissement du diabète et de l'hypertension, déroulé, gouttes dilatatrices et prix indicatif au Maroc.",
    readingTime:5, content:cFondOeil, keyTakeaways:fondOeilTk, faq:fondOeilFaq },
  { slug:"test-allergie-prick-test-maroc", aboutEntity:"Test allergologique",
    title:"Tests d'allergie (prick-tests) : déroulé et interprétation",
    excerpt:"Tests d'allergie : pourquoi, prick-tests et dosages sanguins, préparation (arrêt des antihistaminiques), interprétation et prix au Maroc. Un guide clair.",
    metaTitle:"Tests d'allergie (prick-tests) : déroulé | Maroc",
    metaDesc:"Tests d'allergie : prick-tests et dosages sanguins (IgE), pourquoi, préparation (arrêt des antihistaminiques), interprétation et prix au Maroc. Guide clair.",
    readingTime:5, content:cTestAllergie, keyTakeaways:testAllergieTk, faq:testAllergieFaq },
  { slug:"eeg-electroencephalogramme-maroc", aboutEntity:"Électroencéphalogramme",
    title:"EEG (électroencéphalogramme) : déroulé, utilité et prix",
    excerpt:"EEG : pourquoi enregistrer l'activité du cerveau (épilepsie, malaises), déroulé, absence de douleur et de risque, interprétation et prix indicatif au Maroc.",
    metaTitle:"EEG (électroencéphalogramme) : déroulé et prix | Maroc",
    metaDesc:"EEG : enregistrement de l'activité électrique du cerveau (épilepsie, malaises), déroulé, préparation, absence de douleur et de risque, interprétation et prix indicatif au Maroc.",
    readingTime:5, content:cEeg, keyTakeaways:eegTk, faq:eegFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.findUnique({ where: { slug: "examens" }, select: { id: true } });
  if (!cat) { console.error("Catégorie 'examens' introuvable."); process.exit(1); }
  const now = new Date();
  for (const art of ARTICLES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:cat.id, metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`✓ Examen  /blog/${post.slug}`);
  }
  console.log(`\nExamens lot 3 : ${ARTICLES.length} fiches publiées.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
