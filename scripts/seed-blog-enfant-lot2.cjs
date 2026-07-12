require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// COMPLÉMENT SANTÉ DE L'ENFANT — 6 fiches du brief non couvertes, rattachées au
// pilier existant du cocon enfant (sante-enfant-guide-maroc) via pillarId.
//   bronchiolite · diarrhée de l'enfant · alimentation/diversification ·
//   sommeil de l'enfant · développement/croissance · urgences pédiatriques
// Catégorie sante-enfant → pédiatrie (repli). Idempotent (upsert).
// ════════════════════════════════════════════════════════════════════════════

const PILLAR_SLUG = "sante-enfant-guide-maroc";

const cBronchiolite = `<p>La bronchiolite est une infection respiratoire virale très fréquente chez le nourrisson, surtout l'hiver. Le plus souvent bénigne, elle guérit en une à deux semaines, mais peut gêner la respiration des tout-petits : il faut savoir surveiller et réagir.</p>

<h2>Qu'est-ce que la bronchiolite ?</h2>
<p>C'est une infection virale des petites bronches, touchant surtout les bébés de moins de 2 ans. Elle débute comme un rhume, puis apparaissent une toux et une respiration sifflante ou rapide.</p>

<h2>Que faire à la maison ?</h2>
<ul>
<li><strong>Désobstruer le nez</strong> au sérum physiologique, surtout avant les repas et le coucher.</li>
<li>Proposer à boire souvent, en <strong>fractionnant</strong> les repas.</li>
<li>Coucher le bébé sur le dos, aérer, ne pas surchauffer la chambre.</li>
</ul>
<p>Les antibiotiques sont inutiles (infection virale) ; il n'y a pas de médicament miracle : les soins visent surtout le confort.</p>

<blockquote>Attention : consultez en urgence si le bébé respire vite et avec difficulté (creux entre les côtes), refuse de boire, est très pâle ou a les lèvres bleutées, est anormalement somnolent, ou a moins de couches mouillées. Chez un nourrisson de moins de 3 mois, consultez rapidement.</blockquote>

<h2>Comment protéger bébé ?</h2>
<ul>
<li>Se laver les mains, éviter les lieux très fréquentés en période d'épidémie.</li>
<li>Ne pas fumer près de l'enfant.</li>
<li>Éviter les contacts avec des personnes enrhumées.</li>
</ul>

<hr>
<p>Un bébé gêné pour respirer ? Sur SantéauMaroc, trouvez un pédiatre près de chez vous. En cas de difficulté à respirer, consultez en urgence.</p>`;
const bronchioliteFaq = [
  { q: "Qu'est-ce que la bronchiolite du nourrisson ?", a: "C'est une infection virale des petites bronches, très fréquente chez les bébés de moins de 2 ans, surtout l'hiver. Elle débute comme un rhume puis donne une toux et une respiration sifflante ou rapide. Le plus souvent bénigne, elle guérit en une à deux semaines." },
  { q: "Comment soulager un bébé qui a une bronchiolite ?", a: "En désobstruant le nez au sérum physiologique (avant les repas et le coucher), en proposant à boire souvent en fractionnant les repas, en le couchant sur le dos et en aérant sans surchauffer. Les soins visent le confort ; les antibiotiques sont inutiles car c'est viral." },
  { q: "Quand la bronchiolite est-elle une urgence ?", a: "Si le bébé respire vite et difficilement (creux entre les côtes), refuse de boire, est très pâle ou a les lèvres bleutées, est anormalement somnolent, ou a moins de couches mouillées. Chez un nourrisson de moins de 3 mois, il faut consulter rapidement." },
  { q: "Faut-il des antibiotiques pour une bronchiolite ?", a: "Non, la bronchiolite est virale : les antibiotiques sont inutiles. Le traitement repose sur les soins de confort (désobstruction du nez, hydratation, fractionnement des repas). Le médecin n'ajoute un traitement qu'en cas de complication." },
  { q: "Comment éviter la bronchiolite ?", a: "Par le lavage des mains, en évitant les lieux très fréquentés en période d'épidémie, en ne fumant pas près de l'enfant et en limitant les contacts avec des personnes enrhumées. Ces gestes barrières protègent les tout-petits." },
];
const bronchioliteTk = [
  "La bronchiolite est une infection virale fréquente du nourrisson, souvent bénigne.",
  "Soins de confort : désobstruction du nez, hydratation, repas fractionnés.",
  "Antibiotiques inutiles (virus) ; pas de médicament miracle.",
  "Difficulté à respirer, refus de boire, lèvres bleues = urgence.",
];

const cDiarrheeEnfant = `<p>La diarrhée aiguë (gastro-entérite) est très fréquente chez l'enfant et le plus souvent virale. Le principal risque est la <strong>déshydratation</strong>, surtout chez le nourrisson : l'essentiel du traitement est donc de bien réhydrater.</p>

<h2>Que faire en priorité ?</h2>
<ul>
<li>Donner une <strong>solution de réhydratation orale (SRO)</strong>, par petites quantités et souvent (disponible en pharmacie).</li>
<li>Poursuivre l'alimentation dès que possible ; continuer l'allaitement.</li>
<li>Éviter les boissons très sucrées et les sodas.</li>
</ul>

<h2>Repérer la déshydratation</h2>
<blockquote>Attention : consultez en urgence devant des signes de déshydratation — soif intense, pleurs sans larmes, yeux ou fontanelle creusés, bouche sèche, couches sèches depuis plusieurs heures, somnolence ou difficulté à réveiller l'enfant. Chez le jeune nourrisson, la déshydratation peut être rapide.</blockquote>

<h2>Quand consulter ?</h2>
<p>Chez un nourrisson, en cas de sang dans les selles, de fièvre élevée, de vomissements empêchant de boire, d'une diarrhée qui dure au-delà de quelques jours, ou d'un enfant qui va mal.</p>

<h2>Ce qu'il ne faut pas faire</h2>
<p>Ne pas donner de médicament anti-diarrhéique sans avis médical chez l'enfant. Les antibiotiques ne sont utiles que dans certaines diarrhées bactériennes, sur décision du médecin.</p>

<h2>Prévenir la transmission</h2>
<p>Lavage soigneux des mains, hygiène des biberons et des aliments : la gastro-entérite est très contagieuse.</p>

<hr>
<p>Un enfant avec une diarrhée qui inquiète ? Sur SantéauMaroc, trouvez un pédiatre près de chez vous. Devant des signes de déshydratation, consultez en urgence.</p>`;
const diarrheeEnfantFaq = [
  { q: "Que donner à un enfant qui a la diarrhée ?", a: "Avant tout une solution de réhydratation orale (SRO), disponible en pharmacie, par petites quantités et souvent, pour éviter la déshydratation. On poursuit l'alimentation dès que possible et l'allaitement, en évitant les boissons très sucrées et les sodas." },
  { q: "Comment reconnaître la déshydratation chez un enfant ?", a: "Par une soif intense, des pleurs sans larmes, des yeux ou une fontanelle creusés, une bouche sèche, des couches sèches depuis plusieurs heures, une somnolence ou une difficulté à réveiller l'enfant. Ces signes imposent de consulter en urgence." },
  { q: "Quand consulter pour la diarrhée d'un enfant ?", a: "Chez un nourrisson, en cas de sang dans les selles, de fièvre élevée, de vomissements empêchant de boire, de diarrhée durant plus de quelques jours, ou si l'enfant va mal. Les signes de déshydratation imposent une consultation en urgence." },
  { q: "Faut-il donner un médicament anti-diarrhéique à un enfant ?", a: "Non, pas sans avis médical : les anti-diarrhéiques ne sont pas adaptés chez l'enfant. Le traitement repose sur la réhydratation orale. Les antibiotiques ne sont utiles que dans certaines diarrhées bactériennes, sur décision du médecin." },
  { q: "La gastro de l'enfant est-elle contagieuse ?", a: "Oui, très. Le lavage soigneux des mains, l'hygiène des biberons et des aliments limitent la transmission. Il vaut mieux éviter la collectivité pendant la phase aiguë pour ne pas contaminer les autres enfants." },
];
const diarrheeEnfantTk = [
  "La diarrhée de l'enfant est souvent virale ; le risque principal est la déshydratation.",
  "Priorité : solution de réhydratation orale (SRO), par petites quantités et souvent.",
  "Signes de déshydratation (pleurs sans larmes, couches sèches, somnolence) = urgence.",
  "Pas d'anti-diarrhéique sans avis ; hygiène des mains contre la contagion.",
];

const cDiversification = `<p>L'alimentation du bébé évolue vite la première année. Du lait exclusif à la découverte des aliments, la diversification se fait progressivement, selon des repères simples et les conseils du pédiatre.</p>

<h2>Les premiers mois : le lait</h2>
<p>Le lait (maternel de préférence, ou infantile) couvre à lui seul les besoins des premiers mois. L'<strong>allaitement maternel</strong> est recommandé, idéalement exclusif au début.</p>

<h2>Quand diversifier ?</h2>
<p>La diversification débute en général <strong>entre 4 et 6 mois</strong>, selon l'enfant et l'avis du pédiatre, sans commencer trop tôt ni trop tard. On introduit les aliments un par un, en petites quantités, en variant progressivement les textures (lisse puis avec morceaux).</p>

<h2>Les bons repères</h2>
<ul>
<li>Introduire progressivement légumes, fruits, féculents, puis protéines, selon les conseils.</li>
<li><strong>Ne pas ajouter de sel ni de sucre</strong> ; éviter le miel avant 1 an.</li>
<li>Ne pas retarder inutilement les aliments potentiellement allergènes (sur conseil).</li>
<li>Respecter l'appétit de l'enfant, sans forcer.</li>
</ul>

<h2>Quand demander conseil ?</h2>
<p>En cas de réaction après un aliment (éruption, gonflement, troubles digestifs), de refus alimentaire marqué, ou de doute sur les quantités et le rythme. Le pédiatre et le carnet de santé guident cette étape.</p>

<hr>
<p>Des questions sur l'alimentation de bébé ? Sur SantéauMaroc, trouvez un pédiatre près de chez vous et prenez rendez-vous en ligne.</p>`;
const diversificationFaq = [
  { q: "À quel âge commencer la diversification alimentaire ?", a: "En général entre 4 et 6 mois, selon l'enfant et l'avis du pédiatre, sans commencer trop tôt ni trop tard. Avant, le lait (maternel de préférence) couvre les besoins. On introduit ensuite les aliments un par un, en petites quantités." },
  { q: "Faut-il saler ou sucrer les repas de bébé ?", a: "Non. Il ne faut pas ajouter de sel ni de sucre aux repas du bébé, ni donner de miel avant 1 an. Les aliments non salés et non sucrés habituent l'enfant au vrai goût et protègent sa santé." },
  { q: "Faut-il retarder les aliments allergènes ?", a: "Non, il n'est pas recommandé de retarder inutilement l'introduction des aliments potentiellement allergènes. Les repères actuels invitent à les introduire au bon moment, sur conseil du pédiatre, surtout en cas d'antécédents familiaux d'allergie." },
  { q: "L'allaitement maternel est-il recommandé ?", a: "Oui, l'allaitement maternel est recommandé, idéalement exclusif les premiers mois, car il couvre les besoins du bébé et le protège. La diversification vient ensuite le compléter progressivement, sans forcément l'arrêter." },
  { q: "Que faire si bébé refuse de manger un aliment ?", a: "Respecter son appétit et ne pas forcer : il est normal qu'un bébé refuse ou hésite devant un nouvel aliment. On peut le représenter plus tard, plusieurs fois. En cas de refus alimentaire marqué ou de doute, demandez conseil au pédiatre." },
];
const diversificationTk = [
  "Le lait (maternel de préférence) couvre les besoins des premiers mois.",
  "Diversification en général entre 4 et 6 mois, sur conseil du pédiatre.",
  "Ni sel ni sucre ; pas de miel avant 1 an ; ne pas retarder les allergènes sans raison.",
  "Respecter l'appétit ; demander conseil en cas de réaction ou de doute.",
];

const cSommeilEnfant = `<p>Le sommeil est essentiel à la croissance et au développement de l'enfant. Ses besoins et ses rythmes évoluent avec l'âge. De bonnes habitudes dès le plus jeune âge favorisent des nuits plus sereines — pour l'enfant comme pour les parents.</p>

<h2>Des besoins qui évoluent</h2>
<p>Le nourrisson dort beaucoup, en plusieurs fois jour et nuit. Progressivement, le sommeil se regroupe la nuit, avec des siestes le jour qui s'espacent. Les besoins restent importants pendant toute l'enfance.</p>

<h2>De bonnes habitudes</h2>
<ul>
<li>Des <strong>horaires réguliers</strong> et un rituel du coucher calme et rassurant.</li>
<li>Une chambre calme, à température modérée, sans écran avant le coucher.</li>
<li>Apprendre à l'enfant à s'endormir seul, dans son lit.</li>
</ul>

<h2>La sécurité du sommeil du bébé</h2>
<blockquote>Attention : pour réduire le risque de mort inattendue du nourrisson, couchez toujours bébé <strong>sur le dos</strong>, dans une gigoteuse, sur un matelas ferme, <strong>sans oreiller, couette ni objets</strong> dans le lit, dans une chambre non surchauffée et sans tabac.</blockquote>

<h2>Réveils et difficultés</h2>
<p>Les réveils nocturnes sont normaux, surtout les premiers mois. En cas de troubles du sommeil persistants, de ronflements avec pauses respiratoires ou de fatigue diurne importante, parlez-en au pédiatre.</p>

<hr>
<p>Des nuits difficiles ? Sur SantéauMaroc, trouvez un pédiatre près de chez vous et prenez rendez-vous en ligne.</p>`;
const sommeilEnfantFaq = [
  { q: "Combien de temps un enfant doit-il dormir ?", a: "Les besoins varient avec l'âge : le nourrisson dort beaucoup, en plusieurs fois, puis le sommeil se regroupe la nuit avec des siestes qui s'espacent. Les besoins restent importants toute l'enfance. L'essentiel est que l'enfant soit reposé et en forme la journée." },
  { q: "Comment aider mon enfant à mieux dormir ?", a: "Avec des horaires réguliers, un rituel du coucher calme et rassurant, une chambre calme sans écran avant le coucher, et en l'aidant à s'endormir seul dans son lit. Ces habitudes, mises en place tôt, favorisent des nuits plus sereines." },
  { q: "Comment coucher un bébé en sécurité ?", a: "Toujours sur le dos, dans une gigoteuse, sur un matelas ferme, sans oreiller, couette ni objets dans le lit, dans une chambre non surchauffée et sans tabac. Ces règles réduisent le risque de mort inattendue du nourrisson." },
  { q: "Les réveils nocturnes de bébé sont-ils normaux ?", a: "Oui, surtout les premiers mois : le sommeil du nourrisson est fait de cycles avec des réveils. Ils s'espacent avec l'âge. Des troubles du sommeil persistants ou une fatigue diurne importante justifient d'en parler au pédiatre." },
  { q: "Quand s'inquiéter du sommeil de son enfant ?", a: "En cas de troubles du sommeil persistants, de ronflements avec pauses respiratoires (qui peuvent évoquer des apnées) ou de somnolence et de fatigue importantes en journée. Le pédiatre peut alors rechercher une cause." },
];
const sommeilEnfantTk = [
  "Les besoins de sommeil de l'enfant sont importants et évoluent avec l'âge.",
  "Bonnes habitudes : horaires réguliers, rituel calme, pas d'écran avant le coucher.",
  "Sécurité bébé : sur le dos, sans oreiller ni objets, chambre sans tabac.",
  "Réveils nocturnes normaux ; troubles persistants ou ronflements = avis pédiatre.",
];

const cDeveloppement = `<p>Chaque enfant se développe à son rythme, mais quelques grandes étapes jalonnent la croissance et le développement. Les connaître aide à suivre son enfant sereinement — et à repérer les rares situations qui méritent un avis.</p>

<h2>Le suivi de la croissance</h2>
<p>Le poids, la taille et le périmètre crânien sont notés régulièrement sur les <strong>courbes du carnet de santé</strong>. Ce qui compte, c'est moins un chiffre isolé que la <strong>régularité de la courbe</strong>. Le suivi par le pédiatre permet de vérifier que tout va bien.</p>

<h2>Les grandes étapes du développement</h2>
<ul>
<li>Tenir sa tête, sourire, suivre du regard</li>
<li>S'asseoir, attraper les objets</li>
<li>Se déplacer, puis marcher</li>
<li>Premiers mots, puis phrases</li>
</ul>
<p>Les âges d'acquisition sont indicatifs et <strong>variables d'un enfant à l'autre</strong> : il ne faut pas comparer excessivement.</p>

<h2>Quand demander un avis ?</h2>
<blockquote>Attention : parlez-en au pédiatre en cas de <strong>régression</strong> (perte d'acquis), d'absence de certaines étapes clés à un âge avancé (ne pas tenir assis, ne pas marcher, absence de langage), de perte de contact visuel ou d'inquiétude persistante. Repérer tôt permet d'accompagner au mieux.</blockquote>

<h2>Favoriser le développement</h2>
<p>Parler, jouer, lire avec son enfant, limiter les écrans chez les tout-petits et assurer un environnement rassurant soutiennent son développement.</p>

<hr>
<p>Un doute sur le développement de votre enfant ? Sur SantéauMaroc, trouvez un pédiatre près de chez vous et prenez rendez-vous en ligne.</p>`;
const developpementFaq = [
  { q: "Comment suivre la croissance de mon enfant ?", a: "Grâce aux courbes du carnet de santé (poids, taille, périmètre crânien), remplies lors des consultations. Ce qui compte est surtout la régularité de la courbe, plus qu'un chiffre isolé. Le suivi régulier par le pédiatre permet de vérifier que tout va bien." },
  { q: "À quel âge un enfant marche-t-il ou parle-t-il ?", a: "Les âges d'acquisition (s'asseoir, marcher, premiers mots) sont indicatifs et très variables d'un enfant à l'autre. Il ne faut pas comparer excessivement. En cas d'absence d'une étape clé à un âge avancé, il vaut mieux en parler au pédiatre." },
  { q: "Quand s'inquiéter du développement de son enfant ?", a: "En cas de régression (perte d'acquis), d'absence d'étapes clés à un âge avancé (ne pas tenir assis, ne pas marcher, absence de langage), de perte du contact visuel, ou d'inquiétude persistante. Un repérage précoce permet un meilleur accompagnement." },
  { q: "Faut-il s'inquiéter si mon enfant est en retard sur un point ?", a: "Pas nécessairement : les rythmes varient beaucoup. Un léger décalage isolé est souvent sans gravité. C'est l'association de plusieurs signes, une régression ou un retard marqué qui doivent amener à consulter le pédiatre pour évaluation." },
  { q: "Comment favoriser le développement de son enfant ?", a: "En lui parlant, en jouant et en lisant avec lui, en limitant les écrans chez les tout-petits et en assurant un environnement rassurant et stimulant. Ces interactions du quotidien soutiennent son développement moteur, cognitif et du langage." },
];
const developpementTk = [
  "Chaque enfant se développe à son rythme ; les âges d'acquisition sont variables.",
  "Suivre la régularité des courbes du carnet de santé, plus qu'un chiffre isolé.",
  "Régression, absence d'étapes clés ou perte de contact visuel = avis pédiatre.",
  "Parler, jouer, lire et limiter les écrans soutiennent le développement.",
];

const cUrgencesPed = `<p>Face à un enfant malade, il n'est pas toujours facile de savoir s'il faut consulter en urgence. Certains signes, eux, ne trompent pas et imposent d'agir sans attendre. Ce guide aide les parents à reconnaître les vraies urgences pédiatriques.</p>

<h2>Appeler les secours immédiatement</h2>
<blockquote>Appelez les secours (au Maroc, SAMU 141 ou protection civile 15) devant : une <strong>difficulté à respirer</strong> (respiration rapide, creux entre les côtes, lèvres bleues), un enfant <strong>inconscient ou difficile à réveiller</strong>, une <strong>convulsion</strong>, un étouffement (corps étranger), un malaise grave, ou des <strong>taches rouges/violacées qui ne s'effacent pas à la pression</strong> avec fièvre (méningite).</blockquote>

<h2>Consulter en urgence (sans forcément appeler les secours)</h2>
<ul>
<li><strong>Fièvre chez un nourrisson de moins de 3 mois</strong></li>
<li>Signes de <strong>déshydratation</strong> (voir la <a href="/blog/diarrhee-enfant-gastro-maroc">diarrhée de l'enfant</a>)</li>
<li>Vomissements répétés, refus total de boire</li>
<li>Douleur intense, pâleur, somnolence inhabituelle</li>
<li>Chute ou traumatisme important, notamment de la tête</li>
</ul>

<h2>Garder son calme et bien décrire</h2>
<p>Notez l'heure de début, la température, les symptômes et les traitements donnés. Ces informations aident les soignants. Ne donnez pas d'aspirine à un enfant fiévreux (voir <a href="/blog/aspirine-maroc">aspirine</a>).</p>

<h2>En cas de doute</h2>
<p>Mieux vaut consulter « pour rien » que passer à côté d'une urgence : n'hésitez jamais à demander un avis médical, de jour comme de nuit.</p>

<hr>
<p>Un enfant qui inquiète ? Sur SantéauMaroc, trouvez un pédiatre près de chez vous. Devant un signe de gravité, appelez immédiatement les secours.</p>`;
const urgencesPedFaq = [
  { q: "Quand emmener son enfant aux urgences ?", a: "Devant une difficulté à respirer, un enfant inconscient ou difficile à réveiller, une convulsion, un étouffement, un malaise grave, ou des taches qui ne s'effacent pas avec fièvre : appelez les secours. Consultez en urgence pour une fièvre chez un nourrisson de moins de 3 mois, une déshydratation ou un traumatisme important." },
  { q: "Une fièvre chez le bébé est-elle une urgence ?", a: "Chez un nourrisson de moins de 3 mois, toute fièvre justifie une consultation rapide. À tout âge, une fièvre avec difficulté à respirer, somnolence, raideur de la nuque, taches cutanées ou refus de boire impose de consulter en urgence." },
  { q: "Que faire en cas de convulsion chez l'enfant ?", a: "Allonger l'enfant sur le côté, éloigner les objets dangereux, ne rien mettre dans sa bouche, noter l'heure et la durée, et appeler les secours. La plupart des convulsions fébriles sont brèves et bénignes, mais elles imposent un avis médical." },
  { q: "Comment reconnaître une méningite chez l'enfant ?", a: "Des signes évocateurs sont une fièvre avec maux de tête violents, une raideur de la nuque, une somnolence, et surtout des taches rouges ou violacées qui ne s'effacent pas quand on appuie dessus. C'est une urgence vitale : appelez immédiatement les secours." },
  { q: "En cas de doute, faut-il consulter ?", a: "Oui. Mieux vaut consulter « pour rien » que de passer à côté d'une urgence. N'hésitez jamais à demander un avis médical pour un enfant qui vous inquiète, de jour comme de nuit. Noter les symptômes et l'heure aide les soignants." },
];
const urgencesPedTk = [
  "Difficulté à respirer, inconscience, convulsion, étouffement = appeler les secours.",
  "Fièvre chez un nourrisson de moins de 3 mois = consulter en urgence.",
  "Taches qui ne s'effacent pas + fièvre = urgence (méningite).",
  "En cas de doute, toujours demander un avis : ne pas donner d'aspirine à un enfant fiévreux.",
];

const ARTICLES = [
  { slug:"bronchiolite-nourrisson-maroc", aboutEntity:"Bronchiolite",
    title:"Bronchiolite du nourrisson : que faire et quand s'inquiéter",
    excerpt:"Bronchiolite du bébé : ce que c'est, les gestes à la maison, les signes d'urgence et comment protéger son nourrisson. Un guide rassurant pour les parents, au Maroc.",
    metaTitle:"Bronchiolite du nourrisson : que faire | Maroc",
    metaDesc:"Bronchiolite du nourrisson : infection virale fréquente, gestes à la maison (désobstruction du nez, hydratation), signes d'urgence et prévention. Guide pour les parents, au Maroc.",
    readingTime:4, content:cBronchiolite, keyTakeaways:bronchioliteTk, faq:bronchioliteFaq },
  { slug:"diarrhee-enfant-gastro-maroc", aboutEntity:"Gastro-entérite de l'enfant",
    title:"Diarrhée de l'enfant : éviter la déshydratation",
    excerpt:"Diarrhée (gastro) de l'enfant : la réhydratation en priorité, reconnaître la déshydratation, quand consulter et ce qu'il ne faut pas faire. Un guide pour les parents, au Maroc.",
    metaTitle:"Diarrhée de l'enfant : éviter la déshydratation | Maroc",
    metaDesc:"Diarrhée (gastro) de l'enfant : réhydratation orale (SRO) en priorité, signes de déshydratation, quand consulter et erreurs à éviter. Guide pour les parents, au Maroc.",
    readingTime:4, content:cDiarrheeEnfant, keyTakeaways:diarrheeEnfantTk, faq:diarrheeEnfantFaq },
  { slug:"alimentation-bebe-diversification-maroc", aboutEntity:"Diversification alimentaire",
    title:"Alimentation de bébé : réussir la diversification",
    excerpt:"Alimentation de bébé : du lait à la diversification, quand et comment introduire les aliments, les repères (sans sel ni sucre) et quand demander conseil. Adapté au Maroc.",
    metaTitle:"Alimentation de bébé : la diversification | Maroc",
    metaDesc:"Diversification alimentaire de bébé : quand commencer (4-6 mois), comment introduire les aliments, repères (ni sel ni sucre, pas de miel avant 1 an) et conseils. Adapté au Maroc.",
    readingTime:4, content:cDiversification, keyTakeaways:diversificationTk, faq:diversificationFaq },
  { slug:"sommeil-enfant-maroc", aboutEntity:"Sommeil de l'enfant",
    title:"Sommeil de l'enfant : bonnes habitudes et sécurité",
    excerpt:"Sommeil de l'enfant : besoins par âge, bonnes habitudes, sécurité du sommeil du bébé (sur le dos) et quand consulter. Un guide pratique pour les parents, au Maroc.",
    metaTitle:"Sommeil de l'enfant : habitudes et sécurité | Maroc",
    metaDesc:"Sommeil de l'enfant : besoins selon l'âge, bonnes habitudes (horaires, rituel, écrans), sécurité du sommeil du bébé (sur le dos) et quand consulter. Guide pour les parents, au Maroc.",
    readingTime:4, content:cSommeilEnfant, keyTakeaways:sommeilEnfantTk, faq:sommeilEnfantFaq },
  { slug:"developpement-croissance-enfant-maroc", aboutEntity:"Développement de l'enfant",
    title:"Développement de l'enfant : les étapes et quand consulter",
    excerpt:"Développement de l'enfant : suivi de la croissance, grandes étapes (marche, langage), variabilité normale et signaux d'alerte. Un guide rassurant pour les parents, au Maroc.",
    metaTitle:"Développement de l'enfant : étapes et repères | Maroc",
    metaDesc:"Développement de l'enfant : suivi des courbes de croissance, grandes étapes (s'asseoir, marcher, parler), variabilité normale et signaux d'alerte. Guide pour les parents, au Maroc.",
    readingTime:4, content:cDeveloppement, keyTakeaways:developpementTk, faq:developpementFaq },
  { slug:"urgences-pediatriques-maroc", aboutEntity:"Urgences pédiatriques",
    title:"Urgences pédiatriques : quand consulter pour son enfant",
    excerpt:"Urgences pédiatriques : les signes qui imposent d'appeler les secours ou de consulter en urgence pour son enfant, et les bons réflexes. Un guide essentiel pour les parents, au Maroc.",
    metaTitle:"Urgences pédiatriques : quand consulter | Maroc",
    metaDesc:"Urgences pédiatriques : signes qui imposent d'appeler les secours (difficulté à respirer, convulsion, taches) ou de consulter en urgence, et bons réflexes. Guide pour les parents, au Maroc.",
    readingTime:4, content:cUrgencesPed, keyTakeaways:urgencesPedTk, faq:urgencesPedFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.findUnique({ where: { slug: "sante-enfant" }, select: { id: true } });
  if (!cat) { console.error("Catégorie 'sante-enfant' introuvable."); process.exit(1); }
  const pilier = await prisma.post.findUnique({ where: { slug: PILLAR_SLUG }, select: { id: true } });
  const pillarId = pilier ? pilier.id : null;
  console.log(pilier ? `Pilier cocon enfant trouvé (rattachement).` : `Pilier ${PILLAR_SLUG} absent → fiches autonomes.`);
  const now = new Date();
  for (const art of ARTICLES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:cat.id, metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, pillarId, reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`✓ Enfant  /blog/${post.slug}`);
  }
  console.log(`\nSanté de l'enfant lot 2 : ${ARTICLES.length} fiches publiées.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
