require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DENSIFICATION EN COCONS — vague 4 : Hépatite, Ostéoporose, BPCO (3 satellites
// chacun). Idempotent (upsert). Mappings : lib/blog-related.ts.
//   • Hépatite    (hepatite-maroc)    → gastro-entérologie
//   • Ostéoporose (osteoporose-maroc) → endocrinologie
//   • BPCO        (bpco-maroc)         → pneumologie
// ════════════════════════════════════════════════════════════════════════════

// ═══ HÉPATITE ═════════════════════════════════════════════════════════════════
const cHepB = `<p>L'hépatite B est une infection virale du foie qui peut devenir chronique et, à long terme, mener à la cirrhose ou au cancer du foie. Bonne nouvelle : elle est <strong>évitable par la vaccination</strong>, inscrite au calendrier vaccinal marocain.</p>

<h2>Comment se transmet-elle ?</h2>
<p>Par le <strong>sang</strong> (matériel souillé, soins non sécurisés), les <strong>rapports sexuels</strong> et de la <strong>mère à l'enfant</strong> à l'accouchement. Elle ne se transmet pas par les gestes du quotidien (serrer la main, partager un repas).</p>

<h2>Les symptômes</h2>
<p>Souvent <strong>aucun</strong>, surtout dans la forme chronique qui évolue en silence. Parfois : fatigue, jaunisse, urines foncées, nausées. C'est pourquoi le dépistage est important (voir la fiche <a href="/blog/hepatite-maroc">Hépatites</a>).</p>

<h2>Le diagnostic et le suivi</h2>
<p>Une <a href="/blog/analyse-de-sang-maroc">prise de sang</a> (sérologies) confirme l'infection et précise s'il s'agit d'une forme aiguë ou chronique. Un suivi évalue l'atteinte du foie.</p>

<h2>Traitement et prévention</h2>
<ul>
<li>Des <strong>antiviraux</strong> contrôlent le virus dans les formes chroniques, souvent au long cours.</li>
<li>La <strong>vaccination</strong> est le meilleur moyen de prévention (nourrissons, entourage d'une personne infectée, personnes à risque).</li>
<li>Rapports protégés, matériel à usage unique.</li>
</ul>

<hr>
<p>Un dépistage ou une vaccination à discuter ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const hepBFaq = [
  { q: "Comment attrape-t-on l'hépatite B ?", a: "Par le sang (matériel souillé, soins non sécurisés), les rapports sexuels et de la mère à l'enfant à l'accouchement. Elle ne se transmet pas par les gestes du quotidien comme serrer la main ou partager un repas." },
  { q: "L'hépatite B se guérit-elle ?", a: "La forme aiguë guérit souvent spontanément chez l'adulte. La forme chronique ne se guérit pas toujours mais se contrôle par des antiviraux, souvent au long cours, qui limitent le risque de cirrhose et de cancer du foie." },
  { q: "Le vaccin contre l'hépatite B est-il efficace ?", a: "Oui, il est très efficace et constitue le meilleur moyen de prévention. Il est inscrit au calendrier vaccinal marocain dès le nourrisson et recommandé pour l'entourage d'une personne infectée et les personnes à risque." },
  { q: "L'hépatite B donne-t-elle des symptômes ?", a: "Souvent aucun, surtout dans la forme chronique qui évolue en silence pendant des années. Quand ils existent, on peut observer fatigue, jaunisse, urines foncées et nausées. Le dépistage par prise de sang est donc essentiel." },
  { q: "Peut-on vivre normalement avec une hépatite B ?", a: "Oui, avec un suivi médical régulier et, si besoin, un traitement antiviral. Il faut protéger son entourage (vaccination, rapports protégés) et éviter l'alcool, toxique pour le foie. Le suivi permet de dépister tôt d'éventuelles complications." },
];
const hepBTk = [
  "L'hépatite B est une infection virale du foie, souvent silencieuse.",
  "Transmission : sang, rapports sexuels, mère-enfant — pas par les gestes du quotidien.",
  "Elle peut devenir chronique (risque de cirrhose, cancer du foie).",
  "La vaccination (calendrier marocain) est le meilleur moyen de prévention.",
];

const cHepC = `<p>L'hépatite C est une infection virale du foie longtemps silencieuse, qui peut évoluer vers la cirrhose. Grande avancée : elle se <strong>guérit aujourd'hui dans plus de 95 % des cas</strong> grâce aux traitements récents. Le dépistage est la clé.</p>

<h2>Comment se transmet-elle ?</h2>
<p>Essentiellement par le <strong>sang</strong> : matériel de soin ou d'injection souillé, soins non sécurisés, tatouage ou piercing avec du matériel non stérile. La transmission sexuelle est plus rare.</p>

<h2>Pourquoi elle est souvent découverte tard</h2>
<p>Elle ne donne le plus souvent <strong>aucun symptôme</strong> pendant des années, jusqu'à une complication. D'où l'intérêt de se faire dépister en cas de facteur de risque (voir la fiche <a href="/blog/hepatite-maroc">Hépatites</a>).</p>

<h2>Le diagnostic</h2>
<p>Une <a href="/blog/analyse-de-sang-maroc">prise de sang</a> (sérologie puis charge virale) confirme l'infection. Un bilan évalue l'état du foie.</p>

<h2>Un traitement qui guérit</h2>
<p>Les <strong>antiviraux à action directe</strong> permettent la guérison dans la grande majorité des cas, en quelques semaines, avec peu d'effets indésirables. Il n'existe pas de vaccin contre l'hépatite C, mais le traitement change tout — d'où l'importance du dépistage.</p>

<hr>
<p>Un dépistage à faire ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const hepCFaq = [
  { q: "L'hépatite C se guérit-elle vraiment ?", a: "Oui. Les antiviraux à action directe guérissent l'hépatite C dans plus de 95 % des cas, en quelques semaines, avec peu d'effets indésirables. C'est une avancée majeure : le dépistage permet d'en bénéficier avant les complications." },
  { q: "Comment attrape-t-on l'hépatite C ?", a: "Essentiellement par le sang : matériel de soin ou d'injection souillé, soins non sécurisés, tatouage ou piercing avec du matériel non stérile. La transmission sexuelle est plus rare que pour l'hépatite B." },
  { q: "Existe-t-il un vaccin contre l'hépatite C ?", a: "Non, il n'existe pas de vaccin contre l'hépatite C. En revanche, elle se guérit grâce aux traitements actuels. Le dépistage, surtout en cas de facteur de risque, est donc la meilleure façon d'agir à temps." },
  { q: "L'hépatite C donne-t-elle des symptômes ?", a: "Le plus souvent non : elle évolue en silence pendant des années. Quand ils existent, les signes sont peu spécifiques (fatigue). Elle est souvent découverte lors d'un dépistage ou d'une complication, d'où l'importance de la rechercher." },
  { q: "Qui devrait se faire dépister pour l'hépatite C ?", a: "Les personnes ayant un facteur de risque : soins ou chirurgie anciens, transfusion ancienne, matériel non stérile (tatouage, piercing), usage de drogues injectables, ou entourage atteint. Un simple test sanguin suffit ; parlez-en à votre médecin." },
];
const hepCTk = [
  "L'hépatite C est une infection virale du foie longtemps silencieuse.",
  "Transmission surtout par le sang (matériel souillé, soins non sécurisés).",
  "Elle se guérit dans plus de 95 % des cas avec les traitements actuels.",
  "Pas de vaccin : le dépistage en cas de facteur de risque est essentiel.",
];

const cSteatose = `<p>La stéatose hépatique, ou « foie gras », est l'accumulation de graisse dans le foie. De plus en plus fréquente, liée au surpoids et au diabète, elle est souvent silencieuse mais peut, à terme, enflammer et abîmer le foie. Elle se prévient et se corrige surtout par l'hygiène de vie.</p>

<h2>Qu'est-ce que le « foie gras » ?</h2>
<p>C'est un excès de graisse stockée dans les cellules du foie, sans lien avec l'alcool dans sa forme la plus courante (on parle de stéatose « non alcoolique »). Elle accompagne souvent le surpoids, le <a href="/blog/diabete-type-2-maroc">diabète</a> et l'excès de <a href="/blog/cholesterol-maroc">cholestérol</a>.</p>

<h2>Les facteurs favorisants</h2>
<ul>
<li><a href="/blog/obesite-maroc">Surpoids et obésité</a>, surtout abdominale</li>
<li>Diabète de type 2, triglycérides élevés</li>
<li>Sédentarité, alimentation riche en sucres et graisses</li>
</ul>

<h2>Les symptômes et le diagnostic</h2>
<p>Le plus souvent <strong>aucun symptôme</strong>. Elle est souvent découverte sur une échographie ou une prise de sang (foie) faite pour une autre raison. Un bilan évalue l'éventuelle inflammation du foie.</p>

<h2>Que faire ?</h2>
<ul>
<li><strong>Perdre du poids</strong> progressivement : le levier le plus efficace.</li>
<li>Réduire sucres, boissons sucrées et graisses ; bouger régulièrement.</li>
<li>Équilibrer diabète et cholestérol ; limiter l'alcool.</li>
</ul>
<p>Bien prise en charge tôt, la stéatose est souvent réversible.</p>

<hr>
<p>Un « foie gras » découvert sur un bilan ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const steatoseFaq = [
  { q: "Qu'est-ce que le foie gras (stéatose) ?", a: "C'est l'accumulation de graisse dans les cellules du foie, le plus souvent sans lien avec l'alcool (stéatose non alcoolique). Elle est liée au surpoids, au diabète et à l'excès de cholestérol, et est de plus en plus fréquente." },
  { q: "Le foie gras est-il grave ?", a: "Souvent bénin au début et silencieux, il peut à terme enflammer et abîmer le foie (jusqu'à la fibrose) chez certaines personnes. Pris en charge tôt par l'hygiène de vie, il est souvent réversible. Un suivi médical permet d'évaluer le risque." },
  { q: "Comment se débarrasser du foie gras ?", a: "Surtout par la perte de poids progressive, la réduction des sucres, boissons sucrées et graisses, une activité physique régulière, l'équilibre du diabète et du cholestérol, et la limitation de l'alcool. Il n'existe pas de médicament miracle : le mode de vie est central." },
  { q: "Le foie gras donne-t-il des symptômes ?", a: "Le plus souvent aucun. Il est généralement découvert par hasard sur une échographie ou une prise de sang faite pour une autre raison. C'est pourquoi il faut y penser chez les personnes en surpoids ou diabétiques." },
  { q: "Faut-il arrêter l'alcool en cas de foie gras ?", a: "Même dans la forme non alcoolique, il est conseillé de limiter fortement l'alcool, qui est toxique pour le foie et aggrave l'atteinte. La prise en charge repose surtout sur la perte de poids et l'amélioration du mode de vie." },
];
const steatoseTk = [
  "La stéatose (« foie gras ») est un excès de graisse dans le foie, souvent silencieux.",
  "Liée au surpoids, au diabète et au cholestérol ; de plus en plus fréquente.",
  "Elle peut à terme abîmer le foie, mais est souvent réversible si prise tôt.",
  "Le traitement est surtout l'hygiène de vie : perte de poids, moins de sucres, activité.",
];

// ═══ OSTÉOPOROSE ══════════════════════════════════════════════════════════════
const cCalciumD = `<p>Le calcium et la vitamine D sont les deux nutriments clés de la solidité des os. Des apports suffisants, à tout âge, aident à prévenir l'<a href="/blog/osteoporose-maroc">ostéoporose</a> et les fractures — surtout après la ménopause et chez le senior.</p>

<h2>Pourquoi sont-ils essentiels ?</h2>
<p>Le <strong>calcium</strong> est le principal constituant de l'os ; la <strong>vitamine D</strong> permet de l'absorber et de le fixer. L'un ne va pas sans l'autre : une carence en vitamine D limite l'utilisation du calcium.</p>

<h2>Où trouver le calcium ?</h2>
<ul>
<li>Produits laitiers (lait, yaourt, fromage)</li>
<li>Certaines eaux minérales riches en calcium</li>
<li>Légumes verts, légumineuses, fruits à coque, sardines</li>
</ul>

<h2>Et la vitamine D ?</h2>
<p>Elle est surtout fabriquée par la peau grâce au <strong>soleil</strong>. Une exposition raisonnable et régulière y contribue. L'alimentation (poissons gras) en apporte peu ; une <strong>supplémentation</strong> est fréquente, surtout chez le senior, la personne peu exposée au soleil ou en cas de carence, sur avis médical.</p>

<h2>Faut-il se supplémenter ?</h2>
<p>Pas systématiquement : cela dépend des apports, de l'âge et du dosage sanguin. Un excès de calcium ou de vitamine D n'est pas anodin. Le médecin décide de la supplémentation selon votre situation.</p>

<hr>
<p>Un doute sur vos apports ou une ostéoporose à prévenir ? Sur SantéauMaroc, trouvez un médecin près de chez vous.</p>`;
const calciumFaq = [
  { q: "Pourquoi le calcium et la vitamine D vont-ils ensemble ?", a: "Le calcium est le principal constituant de l'os, et la vitamine D permet de l'absorber et de le fixer. Une carence en vitamine D limite l'utilisation du calcium : les deux sont donc indispensables à la solidité des os." },
  { q: "Où trouver du calcium dans l'alimentation ?", a: "Dans les produits laitiers (lait, yaourt, fromage), certaines eaux minérales riches en calcium, les légumes verts, les légumineuses, les fruits à coque et les sardines. Varier les sources aide à couvrir les besoins." },
  { q: "Comment avoir assez de vitamine D ?", a: "Elle est surtout fabriquée par la peau grâce au soleil : une exposition raisonnable et régulière y contribue. L'alimentation en apporte peu (poissons gras). Une supplémentation est fréquente chez le senior ou en cas de carence, sur avis médical." },
  { q: "Faut-il prendre des compléments de calcium et vitamine D ?", a: "Pas systématiquement. Cela dépend de vos apports, de votre âge et parfois d'un dosage sanguin. Un excès n'est pas anodin. C'est le médecin qui décide d'une supplémentation adaptée à votre situation, notamment en cas d'ostéoporose." },
  { q: "Le manque de vitamine D est-il fréquent au Maroc ?", a: "La carence en vitamine D est fréquente, y compris dans les pays ensoleillés, en raison d'une exposition solaire limitée (vêtements, vie à l'intérieur) et d'apports alimentaires faibles. Un dosage sanguin permet de la dépister si le médecin le juge utile." },
];
const calciumTk = [
  "Calcium et vitamine D sont les deux nutriments clés de la solidité des os.",
  "Calcium : produits laitiers, eaux calciques, légumes verts, sardines.",
  "Vitamine D : surtout le soleil ; supplémentation fréquente chez le senior.",
  "La supplémentation n'est pas systématique : le médecin décide selon votre cas.",
];

const cOsteoMeno = `<p>La ménopause est un tournant pour les os. La baisse des œstrogènes accélère la perte osseuse et augmente le risque d'<a href="/blog/osteoporose-maroc">ostéoporose</a> et de fractures. C'est une période clé pour agir et préserver son capital osseux.</p>

<h2>Pourquoi les os se fragilisent à la ménopause</h2>
<p>Les œstrogènes protègent l'os. Leur chute à la <a href="/blog/menopause-symptomes-solutions-maroc">ménopause</a> entraîne une perte osseuse plus rapide dans les années qui suivent, d'où une fréquence accrue de l'ostéoporose chez la femme.</p>

<h2>Évaluer son risque</h2>
<p>Certains facteurs augmentent le risque : ménopause précoce, antécédents familiaux, minceur, tabac, corticoïdes. Le médecin peut proposer une <a href="/blog/osteodensitometrie-maroc">ostéodensitométrie</a> pour mesurer la solidité des os.</p>

<h2>Comment protéger ses os</h2>
<ul>
<li>Apports suffisants en <a href="/blog/calcium-vitamine-d-os-maroc">calcium et vitamine D</a>.</li>
<li>Activité physique régulière, en particulier en charge (marche).</li>
<li>Arrêt du tabac, modération de l'alcool.</li>
<li>Prévention des chutes.</li>
</ul>

<h2>Faut-il un traitement ?</h2>
<p>Selon le risque et l'ostéodensitométrie, un traitement de l'os peut être proposé. Le traitement hormonal de la ménopause, discuté au cas par cas, a aussi un effet sur l'os. Le médecin adapte à chaque situation.</p>

<hr>
<p>À la ménopause, faites le point sur vos os. Sur SantéauMaroc, trouvez un médecin ou un endocrinologue près de chez vous.</p>`;
const osteoMenoFaq = [
  { q: "Pourquoi l'ostéoporose est-elle fréquente après la ménopause ?", a: "Parce que les œstrogènes protègent l'os, et que leur chute à la ménopause accélère la perte osseuse dans les années qui suivent. Cela augmente la fréquence de l'ostéoporose et le risque de fractures chez la femme ménopausée." },
  { q: "Quand faire une ostéodensitométrie après la ménopause ?", a: "Le médecin la propose selon les facteurs de risque (ménopause précoce, antécédents familiaux, minceur, tabac, corticoïdes) ou après une fracture pour un choc minime. Cet examen mesure la densité osseuse et guide la décision d'un traitement." },
  { q: "Comment protéger ses os à la ménopause ?", a: "Par des apports suffisants en calcium et vitamine D, une activité physique régulière en charge (marche), l'arrêt du tabac, la modération de l'alcool et la prévention des chutes. Ces mesures préservent le capital osseux." },
  { q: "Le traitement hormonal protège-t-il les os ?", a: "Le traitement hormonal de la ménopause a un effet bénéfique sur l'os, mais il se discute au cas par cas selon les symptômes, les antécédents et les risques. D'autres traitements de l'ostéoporose existent : le médecin adapte à chaque situation." },
  { q: "La ménopause entraîne-t-elle toujours une ostéoporose ?", a: "Non, mais elle augmente le risque. Toutes les femmes ne développent pas une ostéoporose. Agir sur les facteurs modifiables (calcium, vitamine D, activité, tabac) et évaluer le risque permettent de prévenir la maladie et les fractures." },
];
const osteoMenoTk = [
  "La chute des œstrogènes à la ménopause accélère la perte osseuse.",
  "C'est une période clé pour évaluer son risque (ostéodensitométrie).",
  "Protéger ses os : calcium/vitamine D, activité en charge, arrêt du tabac.",
  "Un traitement de l'os est proposé selon le risque et la densité osseuse.",
];

const cOsteoTraitement = `<p>L'ostéoporose ne se limite pas au calcium : lorsque le risque de fracture est élevé, des traitements spécifiques renforcent l'os. L'objectif est clair : <strong>éviter les fractures</strong>, en particulier celle du col du fémur.</p>

<h2>Les bases : calcium, vitamine D, activité</h2>
<p>Des apports suffisants en <a href="/blog/calcium-vitamine-d-os-maroc">calcium et vitamine D</a> et une activité physique régulière sont le socle. Ils accompagnent toujours un éventuel médicament, sans le remplacer.</p>

<h2>Les médicaments de l'os</h2>
<p>Selon le risque et l'<a href="/blog/osteodensitometrie-maroc">ostéodensitométrie</a>, le médecin peut prescrire des médicaments qui freinent la perte osseuse ou renforcent l'os. Ils sont pris sur une durée définie, avec un suivi.</p>

<h2>Prévenir les chutes</h2>
<p>Puisque la fracture survient le plus souvent lors d'une chute, la <a href="/blog/prevention-chutes-personnes-agees-maroc">prévention des chutes</a> fait partie du traitement : équilibre, force, vue, domicile adapté, révision des médicaments.</p>

<h2>Le suivi</h2>
<p>Le traitement de l'ostéoporose se conçoit sur le long terme, avec des réévaluations. Ne l'arrêtez pas seul : la protection dépend de sa poursuite selon le plan du médecin.</p>

<hr>
<p>Une ostéoporose à traiter ? Sur SantéauMaroc, trouvez un médecin ou un endocrinologue près de chez vous.</p>`;
const osteoTraitFaq = [
  { q: "Comment traite-t-on l'ostéoporose ?", a: "Sur un socle de calcium, vitamine D et activité physique, on ajoute si le risque est élevé des médicaments qui freinent la perte osseuse ou renforcent l'os, sur une durée définie et avec un suivi. La prévention des chutes complète la prise en charge." },
  { q: "Le calcium suffit-il à traiter l'ostéoporose ?", a: "Non. Le calcium et la vitamine D sont indispensables mais ne suffisent pas quand le risque de fracture est élevé : des médicaments spécifiques de l'os sont alors nécessaires, en plus de l'activité physique et de la prévention des chutes." },
  { q: "Pourquoi prévenir les chutes en cas d'ostéoporose ?", a: "Parce que la fracture survient le plus souvent lors d'une chute. Renforcer l'équilibre et la force, corriger la vue, adapter le domicile et réviser les médicaments réduisent le risque de chute, donc de fracture, notamment du col du fémur." },
  { q: "Le traitement de l'ostéoporose est-il à vie ?", a: "Il se conçoit sur le long terme, avec des réévaluations régulières par le médecin, qui peut ajuster ou faire des pauses selon l'évolution. Il ne faut pas l'arrêter de sa propre initiative, car la protection dépend de sa poursuite." },
  { q: "Peut-on renforcer ses os sans médicament ?", a: "Chez les personnes à faible risque, l'hygiène de vie (calcium, vitamine D, activité physique en charge, arrêt du tabac) peut suffire à préserver les os. Les médicaments sont réservés aux situations à risque élevé de fracture, sur décision médicale." },
];
const osteoTraitTk = [
  "Objectif du traitement de l'ostéoporose : éviter les fractures.",
  "Socle : calcium, vitamine D et activité physique, toujours associés.",
  "Médicaments de l'os selon le risque et l'ostéodensitométrie.",
  "Prévenir les chutes fait partie du traitement ; ne pas l'arrêter seul.",
];

// ═══ BPCO ═════════════════════════════════════════════════════════════════════
const cSevrage = `<p>Arrêter de fumer est le geste de santé le plus bénéfique qui soit, et le traitement n°1 de la <a href="/blog/bpco-maroc">BPCO</a>. Il n'est jamais trop tard : les bénéfices commencent dès les premières heures et se poursuivent des années.</p>

<h2>Pourquoi arrêter change tout</h2>
<p>Le tabac est la première cause de BPCO, de nombreux cancers et de maladies cardiovasculaires. L'arrêt <strong>stoppe l'aggravation de la BPCO</strong> à tout stade, réduit l'essoufflement et le risque d'infarctus et d'<a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a>.</p>

<h2>Les bénéfices, très vite</h2>
<ul>
<li>En quelques heures à jours : le monoxyde de carbone s'élimine, le souffle s'améliore.</li>
<li>En quelques semaines : toux et essoufflement diminuent.</li>
<li>À long terme : le risque cardiovasculaire et de cancer baisse nettement.</li>
</ul>

<h2>Comment réussir ?</h2>
<ul>
<li>Se fixer une date, identifier ses déclencheurs, prévoir des stratégies.</li>
<li>Les <strong>substituts nicotiniques</strong> (patchs, gommes) doublent les chances de réussite.</li>
<li>Un accompagnement médical et, si besoin, un traitement d'aide au sevrage augmentent les chances.</li>
</ul>

<h2>En cas de rechute</h2>
<p>La rechute est fréquente et ne doit pas décourager : chaque tentative rapproche de la réussite. L'important est de recommencer.</p>

<hr>
<p>Envie d'arrêter de fumer ? Un accompagnement augmente vos chances. Sur SantéauMaroc, trouvez un médecin près de chez vous.</p>`;
const sevrageFaq = [
  { q: "Est-il trop tard pour arrêter de fumer ?", a: "Non, jamais. Les bénéfices commencent dès les premières heures et se poursuivent des années. Même à un âge avancé ou en cas de BPCO déjà installée, l'arrêt stoppe l'aggravation, améliore le souffle et réduit les risques cardiovasculaires et de cancer." },
  { q: "Quels sont les bénéfices de l'arrêt du tabac ?", a: "Rapidement, le souffle s'améliore et le monoxyde de carbone s'élimine ; en quelques semaines, la toux et l'essoufflement diminuent ; à long terme, le risque de cancer, d'infarctus et d'AVC baisse nettement, et l'aggravation de la BPCO est stoppée." },
  { q: "Les substituts nicotiniques sont-ils efficaces ?", a: "Oui, les patchs et gommes de nicotine doublent les chances de réussite en réduisant le manque. Associés à un accompagnement médical et, si besoin, à un traitement d'aide au sevrage, ils augmentent nettement les chances d'arrêter durablement." },
  { q: "Comment réussir à arrêter de fumer ?", a: "En se fixant une date, en identifiant ses déclencheurs, en utilisant des substituts nicotiniques et en se faisant accompagner. Les rechutes sont fréquentes et ne doivent pas décourager : chaque tentative rapproche de la réussite." },
  { q: "Prend-on du poids en arrêtant de fumer ?", a: "Une prise de poids modérée est possible, liée à la reprise de l'appétit et du goût. Elle se limite par une alimentation équilibrée et de l'activité physique. Ce risque ne doit pas faire renoncer : les bénéfices de l'arrêt dépassent largement ce désagrément." },
];
const sevrageTk = [
  "Arrêter de fumer est le traitement n°1 de la BPCO, à tout stade.",
  "Les bénéfices commencent dès les premières heures et durent des années.",
  "Les substituts nicotiniques doublent les chances de réussite.",
  "Les rechutes sont normales : chaque tentative rapproche du succès.",
];

const cExacerbation = `<p>Une exacerbation de BPCO est une aggravation brutale des symptômes respiratoires, souvent déclenchée par une infection. Fréquentes et parfois graves, ces poussées doivent être reconnues tôt pour être traitées vite.</p>

<h2>Qu'est-ce qu'une exacerbation ?</h2>
<p>C'est une majoration, sur quelques jours, de l'essoufflement, de la toux et des crachats chez une personne atteinte de <a href="/blog/bpco-maroc">BPCO</a>. Les crachats peuvent devenir plus abondants ou colorés.</p>

<h2>Les déclencheurs</h2>
<ul>
<li>Infections respiratoires (virales ou bactériennes)</li>
<li>Pollution, pics de froid</li>
<li>Arrêt du traitement de fond</li>
</ul>

<h2>Que faire ?</h2>
<p>Suivre le <strong>plan d'action</strong> convenu avec le médecin (renforcer les bronchodilatateurs, parfois traitement prévu à l'avance). Ne pas tarder à consulter si les symptômes s'aggravent.</p>

<blockquote>Attention : appelez les secours en cas d'essoufflement intense au repos, de lèvres bleues, de confusion ou de somnolence anormale, ou si le souffle s'épuise. Une exacerbation sévère peut mettre en jeu le pronostic vital.</blockquote>

<h2>Comment les prévenir ?</h2>
<ul>
<li><a href="/blog/arret-tabac-sevrage-maroc">Arrêter de fumer</a> — la mesure la plus efficace.</li>
<li>Se faire vacciner (grippe, pneumocoque).</li>
<li>Bien prendre son traitement de fond et sa <a href="/blog/bpco-vivre-avec-rehabilitation-maroc">réhabilitation respiratoire</a>.</li>
</ul>

<hr>
<p>Des poussées de BPCO à mieux gérer ? Sur SantéauMaroc, trouvez un pneumologue près de chez vous. En cas de détresse respiratoire, appelez les secours.</p>`;
const exacerbationFaq = [
  { q: "Qu'est-ce qu'une exacerbation de BPCO ?", a: "C'est une aggravation brutale, sur quelques jours, de l'essoufflement, de la toux et des crachats chez une personne atteinte de BPCO, souvent déclenchée par une infection. Ces poussées sont fréquentes et parfois graves." },
  { q: "Que faire en cas d'aggravation de la BPCO ?", a: "Suivre le plan d'action convenu avec le médecin (renforcer les bronchodilatateurs, traitement parfois prévu à l'avance) et consulter sans tarder. En cas d'essoufflement intense au repos, de lèvres bleues ou de confusion, il faut appeler les secours." },
  { q: "Quand une exacerbation de BPCO est-elle une urgence ?", a: "En cas d'essoufflement intense au repos, de lèvres bleues, de confusion ou de somnolence anormale, ou si le souffle s'épuise. Une exacerbation sévère peut mettre en jeu le pronostic vital et impose d'appeler les secours." },
  { q: "Comment éviter les exacerbations de BPCO ?", a: "En arrêtant de fumer (mesure la plus efficace), en se faisant vacciner contre la grippe et le pneumocoque, en prenant bien son traitement de fond et en suivant une réhabilitation respiratoire. Ces mesures réduisent la fréquence et la gravité des poussées." },
  { q: "Faut-il des antibiotiques à chaque exacerbation ?", a: "Pas systématiquement. Les antibiotiques ne sont utiles que lorsque l'exacerbation est d'origine bactérienne, ce que le médecin évalue (notamment sur l'aspect des crachats et les signes). Le traitement associe surtout le renforcement des bronchodilatateurs." },
];
const exacerbationTk = [
  "L'exacerbation de BPCO est une aggravation brutale, souvent due à une infection.",
  "Suivre le plan d'action du médecin et consulter sans tarder.",
  "Essoufflement intense au repos, lèvres bleues ou confusion = urgence.",
  "Prévention : arrêt du tabac, vaccins, traitement de fond, réhabilitation.",
];

const cRehab = `<p>Vivre avec une BPCO, c'est possible et cela s'organise. Au-delà des médicaments, la réhabilitation respiratoire et de bonnes habitudes permettent de garder du souffle, de l'autonomie et une bonne qualité de vie.</p>

<h2>La réhabilitation respiratoire</h2>
<p>C'est un programme associant <strong>exercice physique adapté</strong>, éducation et soutien. Il améliore l'essoufflement, l'endurance et la qualité de vie, et réduit les hospitalisations. Contrairement à une idée reçue, il faut <strong>bouger</strong>, pas s'économiser.</p>

<h2>Les piliers du quotidien</h2>
<ul>
<li><a href="/blog/arret-tabac-sevrage-maroc">Arrêt du tabac</a> : indispensable, à tout stade.</li>
<li>Bien prendre son traitement inhalé et vérifier sa technique.</li>
<li>Vaccinations (grippe, pneumocoque).</li>
<li>Activité physique régulière, adaptée à son souffle.</li>
</ul>

<h2>Gérer l'essoufflement</h2>
<p>Apprendre à doser ses efforts, à respirer lentement (freiner l'expiration), à fractionner les tâches. Un souffle limité ne signifie pas l'immobilité : l'inactivité aggrave la BPCO.</p>

<h2>Reconnaître les aggravations</h2>
<p>Savoir repérer une <a href="/blog/bpco-exacerbation-maroc">exacerbation</a> et suivre son plan d'action permet d'agir tôt. L'oxygène à domicile est réservé aux stades avancés, sur prescription.</p>

<hr>
<p>Mieux vivre avec sa BPCO ? Sur SantéauMaroc, trouvez un pneumologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const rehabFaq = [
  { q: "Qu'est-ce que la réhabilitation respiratoire ?", a: "C'est un programme associant exercice physique adapté, éducation et soutien, destiné aux personnes atteintes de BPCO. Il améliore l'essoufflement, l'endurance et la qualité de vie, et réduit les hospitalisations. Bouger, sous encadrement, est bénéfique." },
  { q: "Peut-on faire du sport avec une BPCO ?", a: "Oui, et c'est recommandé. Une activité physique adaptée à son souffle entretient les muscles et améliore l'endurance, alors que l'inactivité aggrave la BPCO. La réhabilitation respiratoire aide à reprendre en toute sécurité, sous encadrement." },
  { q: "Comment mieux gérer l'essoufflement au quotidien ?", a: "En dosant ses efforts, en respirant lentement (en freinant l'expiration), en fractionnant les tâches et en restant actif malgré tout. Ces techniques, apprises en réhabilitation respiratoire, permettent de mieux vivre avec un souffle limité." },
  { q: "Tous les patients BPCO ont-ils besoin d'oxygène ?", a: "Non. L'oxygène à domicile est réservé aux stades avancés, lorsque le taux d'oxygène dans le sang est trop bas, et sur prescription après évaluation. La majorité des personnes atteintes de BPCO n'en ont pas besoin." },
  { q: "Comment vivre le mieux possible avec une BPCO ?", a: "En arrêtant de fumer, en prenant bien son traitement inhalé, en se faisant vacciner, en restant physiquement actif (réhabilitation respiratoire) et en sachant reconnaître les aggravations pour agir tôt. Ces mesures préservent souffle et autonomie." },
];
const rehabTk = [
  "La réhabilitation respiratoire améliore souffle, endurance et qualité de vie.",
  "Il faut rester actif : l'inactivité aggrave la BPCO.",
  "Piliers : arrêt du tabac, traitement inhalé, vaccins, activité physique.",
  "L'oxygène à domicile est réservé aux stades avancés, sur prescription.",
];

// ─────────────────────────────────────────────────────────────────────────────
const SATELLITES = [
  { pillarSlug:"hepatite-maroc", categorySlug:"maladies-traitements", aboutEntity:"Hépatite B",
    slug:"hepatite-b-maroc", title:"Hépatite B : transmission, vaccin et traitement",
    excerpt:"Hépatite B : comment elle se transmet, symptômes, diagnostic, traitement et surtout la vaccination qui protège. Un guide clair adapté au Maroc.",
    metaTitle:"Hépatite B : transmission, vaccin et traitement | Maroc",
    metaDesc:"Hépatite B : transmission (sang, sexuel, mère-enfant), symptômes, diagnostic, antiviraux et vaccination (calendrier marocain). Guide clair adapté au Maroc.",
    readingTime:4, content:cHepB, keyTakeaways:hepBTk, faq:hepBFaq },
  { pillarSlug:"hepatite-maroc", categorySlug:"maladies-traitements", aboutEntity:"Hépatite C",
    slug:"hepatite-c-maroc", title:"Hépatite C : une infection qui se guérit",
    excerpt:"Hépatite C : transmission, pourquoi elle est silencieuse, dépistage et traitements qui guérissent plus de 95 % des cas. Un guide clair adapté au Maroc.",
    metaTitle:"Hépatite C : dépistage et traitement qui guérit | Maroc",
    metaDesc:"Hépatite C : transmission par le sang, maladie silencieuse, dépistage et antiviraux qui guérissent plus de 95 % des cas. Guide clair adapté au Maroc.",
    readingTime:4, content:cHepC, keyTakeaways:hepCTk, faq:hepCFaq },
  { pillarSlug:"hepatite-maroc", categorySlug:"maladies-traitements", aboutEntity:"Stéatose hépatique",
    slug:"foie-gras-steatose-maroc", title:"Foie gras (stéatose) : causes et solutions",
    excerpt:"Foie gras (stéatose hépatique) : ce que c'est, facteurs (surpoids, diabète), pourquoi il est silencieux et comment le corriger par l'hygiène de vie. Adapté au Maroc.",
    metaTitle:"Foie gras (stéatose) : causes et solutions | Maroc",
    metaDesc:"Foie gras (stéatose hépatique) : causes (surpoids, diabète, cholestérol), diagnostic souvent fortuit et comment le corriger par la perte de poids et l'hygiène de vie. Adapté au Maroc.",
    readingTime:4, content:cSteatose, keyTakeaways:steatoseTk, faq:steatoseFaq },

  { pillarSlug:"osteoporose-maroc", categorySlug:"maladies-traitements", aboutEntity:"Ostéoporose",
    slug:"calcium-vitamine-d-os-maroc", title:"Calcium et vitamine D : les alliés des os",
    excerpt:"Calcium et vitamine D : pourquoi ils sont essentiels aux os, où les trouver, le rôle du soleil et quand se supplémenter. Un guide clair adapté au Maroc.",
    metaTitle:"Calcium et vitamine D : les alliés des os | Maroc",
    metaDesc:"Calcium et vitamine D : pourquoi ils sont essentiels aux os, sources alimentaires, rôle du soleil et quand se supplémenter (sur avis). Guide clair adapté au Maroc.",
    readingTime:4, content:cCalciumD, keyTakeaways:calciumTk, faq:calciumFaq },
  { pillarSlug:"osteoporose-maroc", categorySlug:"maladies-traitements", aboutEntity:"Ostéoporose",
    slug:"osteoporose-menopause-maroc", title:"Ostéoporose et ménopause : protéger ses os",
    excerpt:"Ménopause et ostéoporose : pourquoi les os se fragilisent, comment évaluer son risque et protéger son capital osseux. Un guide clair adapté au Maroc.",
    metaTitle:"Ostéoporose et ménopause : protéger ses os | Maroc",
    metaDesc:"Ostéoporose et ménopause : rôle de la chute des œstrogènes, évaluation du risque (ostéodensitométrie), protection des os et traitements. Guide clair adapté au Maroc.",
    readingTime:4, content:cOsteoMeno, keyTakeaways:osteoMenoTk, faq:osteoMenoFaq },
  { pillarSlug:"osteoporose-maroc", categorySlug:"maladies-traitements", aboutEntity:"Ostéoporose",
    slug:"osteoporose-traitement-maroc", title:"Traitement de l'ostéoporose : éviter les fractures",
    excerpt:"Traitement de l'ostéoporose : socle calcium/vitamine D et activité, médicaments de l'os, prévention des chutes et suivi. Un guide clair adapté au Maroc.",
    metaTitle:"Traitement de l'ostéoporose : éviter les fractures | Maroc",
    metaDesc:"Traitement de l'ostéoporose : calcium, vitamine D et activité, médicaments de l'os selon le risque, prévention des chutes et suivi. Objectif : éviter les fractures. Adapté au Maroc.",
    readingTime:4, content:cOsteoTraitement, keyTakeaways:osteoTraitTk, faq:osteoTraitFaq },

  { pillarSlug:"bpco-maroc", categorySlug:"maladies-traitements", aboutEntity:"Sevrage tabagique",
    slug:"arret-tabac-sevrage-maroc", title:"Arrêter de fumer : bénéfices et solutions pour réussir",
    excerpt:"Arrêter de fumer : pourquoi c'est le meilleur geste santé, les bénéfices rapides, les substituts nicotiniques et comment réussir. Un guide clair adapté au Maroc.",
    metaTitle:"Arrêter de fumer : bénéfices et solutions | Maroc",
    metaDesc:"Arrêter de fumer : bénéfices rapides et à long terme, substituts nicotiniques, accompagnement et gestion des rechutes. Le traitement n°1 de la BPCO. Adapté au Maroc.",
    readingTime:4, content:cSevrage, keyTakeaways:sevrageTk, faq:sevrageFaq },
  { pillarSlug:"bpco-maroc", categorySlug:"maladies-traitements", aboutEntity:"Exacerbation de BPCO",
    slug:"bpco-exacerbation-maroc", title:"Exacerbation de BPCO : reconnaître et réagir",
    excerpt:"Exacerbation de BPCO : ce qu'est une poussée, ses déclencheurs, que faire, signes d'urgence et comment les prévenir. Un guide clair adapté au Maroc.",
    metaTitle:"Exacerbation de BPCO : reconnaître et réagir | Maroc",
    metaDesc:"Exacerbation de BPCO : aggravation brutale des symptômes, déclencheurs, que faire, signes d'urgence (lèvres bleues, confusion) et prévention. Guide clair adapté au Maroc.",
    readingTime:4, content:cExacerbation, keyTakeaways:exacerbationTk, faq:exacerbationFaq },
  { pillarSlug:"bpco-maroc", categorySlug:"maladies-traitements", aboutEntity:"BPCO",
    slug:"bpco-vivre-avec-rehabilitation-maroc", title:"Vivre avec une BPCO : réhabilitation et souffle",
    excerpt:"Vivre avec une BPCO : réhabilitation respiratoire, gérer l'essoufflement, piliers du quotidien et reconnaître les aggravations. Un guide clair adapté au Maroc.",
    metaTitle:"Vivre avec une BPCO : réhabilitation et souffle | Maroc",
    metaDesc:"Vivre avec une BPCO : réhabilitation respiratoire, gérer l'essoufflement, piliers du quotidien (tabac, traitement, vaccins, activité) et reconnaître les aggravations. Adapté au Maroc.",
    readingTime:4, content:cRehab, keyTakeaways:rehabTk, faq:rehabFaq },
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
  console.log(`\nCocons vague 4 : ${pillarSlugs.length} piliers, ${SATELLITES.length} satellites.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
