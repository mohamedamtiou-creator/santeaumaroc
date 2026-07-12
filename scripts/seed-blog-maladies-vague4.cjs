require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 4 — Fiches « Maladie » de référence (piliers autonomes), même gabarit :
//   • Obésité            → endocrinologie        maladies-traitements
//   • Hépatite           → gastro-entérologie    maladies-traitements
//   • Goutte             → médecine générale     maladies-traitements
//   • Ostéoporose        → endocrinologie        maladies-traitements
//   • Reflux (RGO)       → gastro-entérologie    maladies-traitements
//   • BPCO               → pneumologie           maladies-traitements
// Définition, causes, facteurs, symptômes, diagnostic, examens, complications,
// traitement, prévention, quand consulter + FAQ + À retenir. SEO/GEO/E-E-A-T.
// Idempotent (upsert + update complet). Mappings CTA dans lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. OBÉSITÉ
// ─────────────────────────────────────────────────────────────────────────────
const cObesite = `<p>L'obésité progresse rapidement au Maroc, portée par l'évolution des modes de vie et de l'alimentation. Longtemps perçue comme un simple problème d'esthétique ou de volonté, elle est reconnue comme une <strong>maladie chronique</strong> à part entière, qui augmente le risque de nombreuses autres pathologies. Bonne nouvelle : elle se prend en charge, et chaque kilo perdu compte.</p>

<h2>Qu'est-ce que l'obésité ?</h2>
<p>L'obésité est un <strong>excès de masse grasse</strong> qui retentit sur la santé. On l'évalue par l'<strong>indice de masse corporelle (IMC)</strong>, qui rapporte le poids à la taille (poids en kg ÷ taille en m²), complété par le <strong>tour de taille</strong>, reflet de la graisse abdominale, la plus dangereuse.</p>
<table>
<thead><tr><th>IMC</th><th>Interprétation</th></tr></thead>
<tbody>
<tr><td>18,5 – 24,9</td><td>Corpulence normale</td></tr>
<tr><td>25 – 29,9</td><td>Surpoids</td></tr>
<tr><td>30 – 34,9</td><td>Obésité modérée</td></tr>
<tr><td>≥ 35</td><td>Obésité sévère</td></tr>
</tbody>
</table>

<h2>Quelles sont les causes et les facteurs ?</h2>
<p>L'obésité résulte d'un déséquilibre durable entre les <strong>calories apportées</strong> et les <strong>calories dépensées</strong>, sur fond de multiples facteurs :</p>
<ul>
<li>Alimentation trop riche (sucres, graisses, boissons sucrées, plats industriels)</li>
<li>Sédentarité et manque d'activité physique</li>
<li>Prédisposition génétique et familiale</li>
<li>Manque de sommeil, stress, certains médicaments</li>
<li>Facteurs hormonaux (plus rarement) et sociaux</li>
</ul>

<h2>Quelles complications ?</h2>
<p>L'obésité n'est pas isolée : elle favorise de nombreuses maladies, ce qui en fait un enjeu de santé majeur :</p>
<ul>
<li><a href="/blog/diabete-type-2-maroc">Diabète de type 2</a>, <a href="/blog/hypertension-arterielle-maroc">hypertension</a>, excès de <a href="/blog/cholesterol-maroc">cholestérol</a></li>
<li>Maladies du cœur, apnées du sommeil</li>
<li><a href="/blog/arthrose-maroc">Arthrose</a> des genoux et des hanches</li>
<li>Certains cancers, stéatose du foie</li>
<li>Retentissement psychologique et sur la qualité de vie</li>
</ul>

<h2>Comment se prend en charge l'obésité ?</h2>
<p>Il n'y a pas de solution miracle : la prise en charge est globale, progressive et durable. Objectif réaliste : une perte de 5 à 10 % du poids améliore déjà nettement la santé.</p>
<ul>
<li><strong>Alimentation équilibrée</strong>, sans régime extrême, accompagnée si possible par une diététicienne.</li>
<li><strong>Activité physique</strong> régulière et adaptée.</li>
<li><strong>Accompagnement psychologique</strong> et travail sur les habitudes.</li>
<li><strong>Médicaments</strong> dans certains cas, sur prescription.</li>
<li><strong>Chirurgie de l'obésité (bariatrique)</strong> pour les obésités sévères, après évaluation spécialisée.</li>
</ul>
<blockquote>Bon à savoir : les régimes très restrictifs et répétés (effet « yo-yo ») sont contre-productifs. Une perte de poids lente mais durable, soutenue par un professionnel, est bien plus efficace.</blockquote>

<h2>Comment prévenir la prise de poids ?</h2>
<ul>
<li>Privilégier une alimentation maison, riche en légumes et légumineuses.</li>
<li>Limiter boissons sucrées, fritures et grignotages.</li>
<li>Bouger chaque jour (au moins 30 minutes de marche).</li>
<li>Soigner son sommeil et gérer le stress.</li>
</ul>

<h2>Obésité : quand consulter ?</h2>
<p>Consultez pour être accompagné dès qu'un surpoids s'installe ou pour prévenir ses complications. Le <a href="/specialites/medecine-generale">médecin généraliste</a> évalue votre situation et peut orienter vers un <a href="/specialites/endocrinologie-et-maladies-metaboliques">endocrinologue</a>, un nutritionniste ou une diététicienne pour un suivi personnalisé.</p>

<hr>
<p>Pour un accompagnement sûr et durable, trouvez un médecin près de chez vous sur SantéauMaroc et prenez rendez-vous en ligne, gratuitement.</p>`;

const obesiteFaq = [
  { q: "À partir de quel IMC parle-t-on d'obésité ?", a: "L'obésité est définie par un indice de masse corporelle (IMC) supérieur ou égal à 30 ; le surpoids correspond à un IMC entre 25 et 29,9. Le tour de taille complète l'évaluation, car la graisse abdominale est la plus à risque." },
  { q: "L'obésité est-elle une maladie ?", a: "Oui. L'obésité est reconnue comme une maladie chronique, et non un simple manque de volonté. Elle a des causes multiples (alimentation, sédentarité, génétique, hormones, sommeil) et augmente le risque de nombreuses autres pathologies." },
  { q: "Combien de poids faut-il perdre pour être en meilleure santé ?", a: "Il n'est pas nécessaire de revenir à un poids « idéal ». Une perte de 5 à 10 % du poids initial améliore déjà nettement la tension, la glycémie, le cholestérol et les articulations. L'objectif est une perte lente et durable." },
  { q: "Les régimes stricts sont-ils efficaces ?", a: "Non sur le long terme. Les régimes très restrictifs entraînent souvent une reprise de poids (effet yo-yo) et peuvent être délétères. Un rééquilibrage alimentaire durable, accompagné par un professionnel, est bien plus efficace." },
  { q: "Qu'est-ce que la chirurgie bariatrique ?", a: "C'est une chirurgie de l'obésité (comme la sleeve ou le bypass) réservée aux obésités sévères, après échec d'une prise en charge médicale et une évaluation spécialisée complète. Elle nécessite un suivi à vie." },
  { q: "L'obésité de l'enfant est-elle préoccupante ?", a: "Oui, car elle a tendance à se poursuivre à l'âge adulte et à favoriser tôt des complications. Elle se prévient et se prend en charge en famille, par de bonnes habitudes alimentaires et une activité physique régulière, avec l'aide du médecin." },
];
const obesiteTakeaways = [
  "L'obésité est une maladie chronique définie par un IMC ≥ 30, à ne pas réduire à un manque de volonté.",
  "Elle favorise diabète, hypertension, cholestérol, apnées, arthrose et certains cancers.",
  "Perdre 5 à 10 % du poids améliore déjà nettement la santé.",
  "La prise en charge est globale : alimentation, activité, soutien psychologique, parfois chirurgie.",
  "Les régimes extrêmes sont contre-productifs : viser une perte lente et durable.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. HÉPATITE
// ─────────────────────────────────────────────────────────────────────────────
const cHepatite = `<p>« Hépatite » signifie inflammation du foie. Certaines formes guérissent seules, d'autres — surtout les hépatites virales B et C — peuvent évoluer silencieusement pendant des années vers la cirrhose ou le cancer du foie. Or elles se dépistent par une simple prise de sang, se préviennent (vaccin) et, pour l'hépatite C, se guérissent aujourd'hui dans la quasi-totalité des cas.</p>

<h2>Qu'est-ce qu'une hépatite ?</h2>
<p>L'hépatite est une <strong>inflammation du foie</strong>, organe essentiel qui filtre le sang, stocke l'énergie et fabrique de nombreuses substances. Elle peut être aiguë (passagère) ou chronique (durable). Les causes principales :</p>
<ul>
<li><strong>Hépatites virales</strong> : A, B, C, E (les plus fréquentes).</li>
<li><strong>Hépatite alcoolique</strong> (consommation excessive d'alcool).</li>
<li><strong>Hépatite médicamenteuse</strong> ou toxique.</li>
<li><strong>Stéatose (« foie gras »)</strong> liée au surpoids et au diabète.</li>
</ul>

<h2>Comment se transmettent les hépatites virales ?</h2>
<table>
<thead><tr><th>Virus</th><th>Transmission</th><th>Évolution</th></tr></thead>
<tbody>
<tr><td>Hépatite A et E</td><td>Eau et aliments souillés</td><td>Guérison le plus souvent spontanée</td></tr>
<tr><td>Hépatite B</td><td>Sang, rapports sexuels, mère-enfant</td><td>Peut devenir chronique</td></tr>
<tr><td>Hépatite C</td><td>Sang (matériel souillé, soins non sécurisés)</td><td>Souvent chronique</td></tr>
</tbody>
</table>

<h2>Quels sont les symptômes ?</h2>
<p>Souvent <strong>aucun</strong>, surtout pour les hépatites B et C chroniques, qui évoluent en silence. Quand des signes existent, on peut observer : fatigue, jaunisse (peau et yeux jaunes), urines foncées, nausées, douleurs du côté droit du ventre, perte d'appétit. L'absence de symptôme explique pourquoi tant de personnes s'ignorent — d'où l'intérêt du dépistage.</p>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Par une <strong>prise de sang</strong> : dosage des enzymes du foie (transaminases) et surtout <strong>sérologies virales</strong> (recherche des virus B et C). En cas d'infection, la charge virale et un bilan du foie (dont une mesure de la fibrose) précisent la gravité.</p>

<h2>Quelles complications ?</h2>
<p>Une hépatite chronique non traitée abîme progressivement le foie et peut évoluer vers la <strong>cirrhose</strong> (foie durci et cicatriciel), puis vers le <strong>cancer du foie</strong>. C'est tout l'enjeu d'un dépistage et d'un traitement précoces.</p>

<h2>Quels traitements ?</h2>
<ul>
<li><strong>Hépatites A et E</strong> : guérison le plus souvent spontanée, avec du repos.</li>
<li><strong>Hépatite B</strong> : des antiviraux contrôlent le virus, souvent au long cours.</li>
<li><strong>Hépatite C</strong> : les traitements récents (antiviraux à action directe) permettent la <strong>guérison dans plus de 95 % des cas</strong> en quelques semaines.</li>
</ul>

<h2>Comment prévenir les hépatites ?</h2>
<ul>
<li><strong>Vaccination contre l'hépatite B</strong>, inscrite au calendrier vaccinal marocain (nourrisson) et recommandée pour les personnes à risque.</li>
<li>Hygiène de l'eau et des aliments (hépatites A et E).</li>
<li>Rapports protégés, matériel médical et de tatouage à usage unique.</li>
<li>Limiter l'alcool et prévenir le surpoids (foie gras).</li>
</ul>
<blockquote>Bon à savoir : il n'existe pas de vaccin contre l'hépatite C, mais elle se guérit désormais. Se faire dépister, surtout en cas de facteur de risque, est la meilleure façon d'agir à temps.</blockquote>

<h2>Hépatite : quand consulter ?</h2>
<p>Consultez pour un dépistage en cas de facteur de risque (soins ou chirurgie anciens, transfusion, entourage atteint), ou devant une fatigue inexpliquée ou une jaunisse. Le <a href="/specialites/medecine-generale">médecin généraliste</a> prescrit le bilan et oriente vers un <a href="/specialites/gastro-enterologie">gastro-entérologue-hépatologue</a> si nécessaire.</p>

<hr>
<p>Un doute, un dépistage à faire ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const hepatiteFaq = [
  { q: "Quelles sont les différentes hépatites ?", a: "Les hépatites virales (A, B, C, E) sont les plus connues, mais le foie peut aussi s'enflammer à cause de l'alcool, de médicaments ou du « foie gras » lié au surpoids. Les hépatites B et C sont les plus préoccupantes car elles peuvent devenir chroniques." },
  { q: "L'hépatite C se guérit-elle ?", a: "Oui. Grâce aux traitements récents (antiviraux à action directe), l'hépatite C guérit dans plus de 95 % des cas, en quelques semaines de traitement. Le dépistage est essentiel car la maladie est souvent silencieuse." },
  { q: "Comme attrape-t-on l'hépatite B ou C ?", a: "L'hépatite B se transmet par le sang, les rapports sexuels et de la mère à l'enfant ; l'hépatite C surtout par le sang (matériel souillé, soins non sécurisés). Les hépatites A et E, elles, se transmettent par l'eau et les aliments souillés." },
  { q: "Existe-t-il un vaccin contre l'hépatite ?", a: "Oui contre l'hépatite B (inscrite au calendrier vaccinal marocain dès le nourrisson) et l'hépatite A. Il n'existe pas de vaccin contre l'hépatite C, mais celle-ci se guérit grâce aux traitements actuels." },
  { q: "L'hépatite donne-t-elle des symptômes ?", a: "Souvent non, surtout les formes chroniques B et C qui évoluent en silence pendant des années. Quand ils existent, les signes sont la fatigue, la jaunisse, les urines foncées et des douleurs du ventre. D'où l'importance du dépistage." },
  { q: "Qu'est-ce que le « foie gras » ?", a: "C'est l'accumulation de graisse dans le foie (stéatose), liée au surpoids, au diabète et au syndrome métabolique. De plus en plus fréquente, elle peut aussi conduire à une inflammation du foie. Elle se prévient par l'hygiène de vie." },
];
const hepatiteTakeaways = [
  "L'hépatite est une inflammation du foie ; les formes virales B et C peuvent devenir chroniques.",
  "Elles évoluent souvent en silence vers la cirrhose ou le cancer du foie.",
  "Le diagnostic repose sur une prise de sang (transaminases, sérologies).",
  "L'hépatite C se guérit aujourd'hui dans plus de 95 % des cas ; l'hépatite B se prévient par le vaccin.",
  "Le dépistage en cas de facteur de risque est la clé pour agir à temps.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. GOUTTE
// ─────────────────────────────────────────────────────────────────────────────
const cGoutte = `<p>Une douleur brutale et intense au gros orteil, souvent la nuit, une articulation rouge, chaude et gonflée : c'est le tableau typique d'une crise de goutte. Cette forme d'arthrite, liée à un excès d'acide urique, est fréquente et souvent liée à l'alimentation. Bien prise en charge, elle se contrôle parfaitement.</p>

<h2>Qu'est-ce que la goutte ?</h2>
<p>La goutte est une <strong>arthrite</strong> (inflammation d'une articulation) provoquée par un excès d'<strong>acide urique</strong> dans le sang (hyperuricémie). Quand ce taux est trop élevé, des microcristaux se déposent dans les articulations et déclenchent des crises très douloureuses.</p>

<h2>Quelles sont les causes et les facteurs ?</h2>
<ul>
<li><strong>Alimentation riche en purines</strong> : viandes rouges, abats, charcuterie, certains poissons et fruits de mer.</li>
<li><strong>Alcool</strong> (surtout la bière) et <strong>boissons sucrées</strong>.</li>
<li><strong>Surpoids</strong>, hérédité, âge, sexe masculin.</li>
<li><strong>Insuffisance rénale</strong> et certains médicaments (diurétiques).</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<p>La <strong>crise de goutte</strong> apparaît brutalement, souvent la nuit : une articulation — le plus souvent le <strong>gros orteil</strong> — devient rouge, chaude, gonflée et extrêmement douloureuse, au point que le moindre contact est insupportable. La crise dure quelques jours, puis cède. Entre les crises, tout redevient normal, mais l'acide urique reste élevé.</p>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Le tableau clinique est souvent évocateur. Le médecin confirme par un dosage de l'<strong>acide urique</strong> dans le sang et, parfois, par l'analyse du liquide articulaire (ponction) qui met en évidence les cristaux.</p>

<h2>Quelles complications ?</h2>
<p>Non traitée, la goutte peut donner des crises de plus en plus fréquentes, des dépôts sous la peau (tophus), et favoriser des <strong>calculs rénaux</strong> ainsi qu'une atteinte des reins.</p>

<h2>Comment traite-t-on la goutte ?</h2>
<ul>
<li><strong>En crise</strong> : anti-inflammatoires ou colchicine pour calmer rapidement la douleur, sur prescription.</li>
<li><strong>Au long cours</strong> : en cas de crises répétées, un traitement pour <strong>faire baisser l'acide urique</strong> (comme l'allopurinol) prévient les récidives.</li>
<li><strong>Mesures alimentaires</strong> : indispensables en complément.</li>
</ul>
<blockquote>Bon à savoir : le traitement de fond ne se commence pas pendant la crise et ne s'arrête pas dès qu'on va mieux. Pris régulièrement, il fait disparaître les crises sur le long terme.</blockquote>

<h2>Comment prévenir les crises ?</h2>
<ul>
<li>Limiter viandes rouges, abats, charcuterie et fruits de mer.</li>
<li>Réduire fortement l'alcool (surtout la bière) et les boissons sucrées.</li>
<li>Boire beaucoup d'eau et maintenir un poids sain.</li>
</ul>

<h2>Goutte : quand consulter ?</h2>
<p>Consultez dès la première crise, et pour un suivi si les crises se répètent. Le <a href="/specialites/medecine-generale">médecin généraliste</a> pose le diagnostic, soulage la crise et met en place le traitement de fond ; il oriente vers un rhumatologue si nécessaire.</p>

<hr>
<p>Une articulation brutalement douloureuse ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const goutteFaq = [
  { q: "Qu'est-ce qui provoque une crise de goutte ?", a: "Un excès d'acide urique dans le sang, dont les cristaux se déposent dans une articulation. Les crises sont souvent déclenchées par un repas riche (viandes, abats, fruits de mer), l'alcool (surtout la bière) ou les boissons sucrées." },
  { q: "Quels aliments éviter en cas de goutte ?", a: "Les aliments riches en purines : viandes rouges, abats, charcuterie, certains poissons et fruits de mer. Il faut aussi limiter fortement l'alcool (surtout la bière) et les boissons sucrées, et boire beaucoup d'eau." },
  { q: "La goutte touche-t-elle seulement le gros orteil ?", a: "Le gros orteil est l'articulation la plus souvent touchée, mais la goutte peut atteindre la cheville, le genou, le poignet ou d'autres articulations. La crise se traduit par une articulation rouge, chaude, gonflée et très douloureuse." },
  { q: "La goutte se guérit-elle ?", a: "On ne « guérit » pas la tendance à l'hyperuricémie, mais on contrôle parfaitement la goutte : un traitement de fond qui abaisse l'acide urique, associé à des mesures alimentaires, fait disparaître les crises sur le long terme." },
  { q: "Faut-il prendre un traitement entre les crises ?", a: "Oui, en cas de crises répétées. Le traitement de fond (comme l'allopurinol) se prend chaque jour, en dehors des crises, pour maintenir un acide urique bas et éviter les récidives. Il ne faut pas l'arrêter dès qu'on se sent mieux." },
  { q: "La goutte peut-elle abîmer les reins ?", a: "Oui, un acide urique élevé et non traité favorise les calculs rénaux et peut, à terme, retentir sur les reins. C'est une raison de plus de la prendre en charge, au-delà de la douleur des crises." },
];
const goutteTakeaways = [
  "La goutte est une arthrite due à un excès d'acide urique qui cristallise dans les articulations.",
  "Crise typique : gros orteil brutalement rouge, chaud, gonflé et très douloureux, souvent la nuit.",
  "Facteurs : alimentation riche (viandes, fruits de mer), alcool, boissons sucrées, surpoids.",
  "Traitement de la crise (anti-inflammatoires, colchicine) et de fond (baisser l'acide urique).",
  "Non traitée, elle peut favoriser calculs et atteinte des reins.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. OSTÉOPOROSE
// ─────────────────────────────────────────────────────────────────────────────
const cOsteoporose = `<p>L'ostéoporose fragilise les os en silence et se révèle trop souvent par une fracture. Fréquente après la ménopause, elle n'est pas une fatalité : elle se dépiste, se prévient et se traite. Préserver son capital osseux se joue à tout âge, bien avant l'apparition des premiers problèmes.</p>

<h2>Qu'est-ce que l'ostéoporose ?</h2>
<p>L'ostéoporose est une maladie qui rend les os <strong>poreux et fragiles</strong>. La densité et la qualité de l'os diminuent, ce qui augmente le risque de <strong>fractures</strong>, parfois pour un traumatisme minime. C'est une maladie silencieuse : elle ne fait pas mal tant qu'il n'y a pas de fracture.</p>

<h2>Quels sont les facteurs de risque ?</h2>
<ul>
<li><strong>Âge</strong> et <strong>ménopause</strong> : la baisse des œstrogènes accélère la perte osseuse chez la femme.</li>
<li><strong>Sexe féminin</strong>, minceur excessive, hérédité.</li>
<li><strong>Carence en calcium et en vitamine D</strong>, sédentarité.</li>
<li><strong>Tabac</strong> et consommation excessive d'alcool.</li>
<li>Certaines maladies et la prise prolongée de <strong>corticoïdes</strong>.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<p>Aucun avant la fracture — d'où son surnom de « maladie silencieuse ». Elle se révèle par une <strong>fracture</strong> (poignet, vertèbres, col du fémur) survenant après une chute banale, ou par des tassements de vertèbres qui entraînent une <strong>perte de taille</strong> et un dos voûté.</p>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Par l'<strong>ostéodensitométrie</strong> (mesure de la densité osseuse), un examen simple et indolore. Son résultat, le <strong>T-score</strong>, situe la solidité de l'os par rapport à la référence.</p>
<table>
<thead><tr><th>T-score</th><th>Interprétation</th></tr></thead>
<tbody>
<tr><td>≥ −1</td><td>Densité osseuse normale</td></tr>
<tr><td>entre −1 et −2,5</td><td>Ostéopénie (os un peu fragilisé)</td></tr>
<tr><td>≤ −2,5</td><td>Ostéoporose</td></tr>
</tbody>
</table>

<h2>Quelles complications ?</h2>
<p>Les fractures sont la véritable menace. La <strong>fracture du col du fémur</strong>, en particulier, est grave chez la personne âgée : elle peut entraîner une perte d'autonomie durable. Prévenir les fractures est donc l'objectif central de la prise en charge.</p>

<h2>Comment traite-t-on l'ostéoporose ?</h2>
<ul>
<li><strong>Calcium et vitamine D</strong> en quantité suffisante (alimentation, soleil, suppléments si besoin).</li>
<li><strong>Activité physique</strong> régulière, en particulier en charge (marche), qui renforce l'os.</li>
<li><strong>Médicaments</strong> qui freinent la perte osseuse ou renforcent l'os, en cas d'ostéoporose avérée ou de fracture.</li>
<li><strong>Prévention des chutes</strong> : correction de la vue, aménagement du domicile, chaussage adapté.</li>
</ul>

<h2>Comment prévenir l'ostéoporose ?</h2>
<ul>
<li>Assurer des apports en calcium (produits laitiers, eaux riches en calcium, légumes verts).</li>
<li>S'exposer raisonnablement au soleil pour la vitamine D.</li>
<li>Pratiquer une activité physique régulière dès le plus jeune âge.</li>
<li>Ne pas fumer et limiter l'alcool.</li>
</ul>

<h2>Ostéoporose : quand consulter ?</h2>
<p>Parlez-en à votre médecin après la <a href="/blog/menopause-symptomes-solutions-maroc">ménopause</a>, en cas d'antécédent familial, de fracture pour un choc minime ou de perte de taille. Le <a href="/specialites/medecine-generale">médecin généraliste</a> évalue le risque, prescrit l'ostéodensitométrie et oriente vers un <a href="/specialites/endocrinologie-et-maladies-metaboliques">endocrinologue</a> ou un rhumatologue si nécessaire.</p>

<hr>
<p>Pour évaluer la santé de vos os, trouvez un médecin près de chez vous sur SantéauMaroc et prenez rendez-vous en ligne, gratuitement.</p>`;

const osteoporoseFaq = [
  { q: "Qu'est-ce que l'ostéoporose ?", a: "C'est une maladie qui rend les os poreux et fragiles, augmentant le risque de fractures. Elle est silencieuse : elle ne provoque aucun symptôme jusqu'à la survenue d'une fracture, souvent au poignet, aux vertèbres ou au col du fémur." },
  { q: "Comme dépiste-t-on l'ostéoporose ?", a: "Par l'ostéodensitométrie, un examen simple et indolore qui mesure la densité des os. Son résultat, le T-score, indique s'il s'agit d'une densité normale, d'une ostéopénie ou d'une ostéoporose (T-score inférieur ou égal à −2,5)." },
  { q: "Pourquoi les femmes ménopausées sont-elles plus touchées ?", a: "À la ménopause, la baisse des œstrogènes accélère la perte osseuse. Les femmes perdent alors plus rapidement de la densité osseuse, ce qui explique une fréquence plus élevée de l'ostéoporose et des fractures après 50 ans." },
  { q: "Comment renforcer ses os naturellement ?", a: "En assurant des apports suffisants en calcium (produits laitiers, légumes verts, eaux calciques) et en vitamine D (soleil), en pratiquant une activité physique régulière en charge (marche), et en évitant le tabac et l'excès d'alcool." },
  { q: "L'ostéoporose se soigne-t-elle ?", a: "Oui. Outre le calcium, la vitamine D et l'activité physique, des médicaments freinent la perte osseuse ou renforcent l'os en cas d'ostéoporose avérée ou de fracture. La prévention des chutes complète la prise en charge." },
  { q: "La fracture du col du fémur est-elle grave ?", a: "Oui, surtout chez la personne âgée : elle peut entraîner une perte d'autonomie durable et nécessite souvent une chirurgie. Prévenir les chutes et traiter l'ostéoporose permet de réduire ce risque." },
];
const osteoporoseTakeaways = [
  "L'ostéoporose fragilise les os en silence et se révèle souvent par une fracture.",
  "Facteurs majeurs : âge, ménopause, carence en calcium/vitamine D, tabac, corticoïdes.",
  "Le diagnostic repose sur l'ostéodensitométrie (T-score ≤ −2,5).",
  "Prévention : calcium, vitamine D, activité physique et prévention des chutes.",
  "La fracture du col du fémur est la complication la plus grave chez la personne âgée.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. REFLUX (RGO)
// ─────────────────────────────────────────────────────────────────────────────
const cReflux = `<p>Cette sensation de brûlure qui remonte derrière le sternum après le repas, ou des remontées acides quand on s'allonge : c'est le reflux gastro-œsophagien (RGO), un trouble très répandu. Le plus souvent bénin et gênant, il se soulage bien par quelques mesures simples et, si besoin, un traitement.</p>

<h2>Qu'est-ce que le reflux gastro-œsophagien ?</h2>
<p>Le RGO est la <strong>remontée du contenu acide de l'estomac vers l'œsophage</strong>. Normalement, un muscle en anneau (le sphincter) empêche ce reflux. Quand il se relâche trop, l'acide remonte et irrite l'œsophage, provoquant les symptômes bien connus de brûlure.</p>

<h2>Quelles sont les causes et les facteurs ?</h2>
<ul>
<li>Relâchement du sphincter, parfois <strong>hernie hiatale</strong> (remontée d'une partie de l'estomac).</li>
<li><strong>Surpoids</strong> et <strong>grossesse</strong> (pression sur l'estomac).</li>
<li>Repas gras, copieux, épicés, chocolat, café.</li>
<li><strong>Tabac</strong> et <strong>alcool</strong>.</li>
<li>Position allongée après le repas.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li><strong>Brûlure</strong> remontant derrière le sternum (pyrosis), surtout après les repas et en position allongée</li>
<li><strong>Régurgitations acides</strong> dans la bouche</li>
<li>Parfois toux chronique, voix rauque, gêne dans la gorge</li>
</ul>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Le diagnostic est le plus souvent <strong>clinique</strong> : les symptômes typiques suffisent. Une <strong>fibroscopie</strong> (endoscopie) est indiquée en cas de signes d'alerte ou après 50 ans, pour vérifier l'état de l'œsophage.</p>
<blockquote>Attention : consultez sans tarder en cas de difficulté à avaler, d'amaigrissement, de vomissements de sang, de selles noires ou d'anémie. Ces signes imposent une fibroscopie et ne doivent pas être mis sur le compte d'un simple reflux.</blockquote>

<h2>Quelles complications ?</h2>
<p>Un reflux fréquent et prolongé peut irriter l'œsophage (œsophagite), voire, à long terme, entraîner des lésions de la muqueuse (œsophage de Barrett) qui justifient une surveillance. La plupart des reflux, toutefois, restent bénins.</p>

<h2>Comment soulager le reflux ?</h2>
<p>Les mesures d'hygiène de vie sont souvent très efficaces :</p>
<ul>
<li>Éviter les repas copieux, gras et tardifs ; ne pas s'allonger juste après manger.</li>
<li>Surélever la tête du lit ; perdre du poids si nécessaire.</li>
<li>Limiter café, alcool, tabac et aliments déclencheurs.</li>
</ul>
<p>Si cela ne suffit pas, des médicaments <strong>antiacides</strong>, en particulier les inhibiteurs de la pompe à protons (IPP), réduisent l'acidité (voir aussi notre fiche sur l'<a href="/blog/ulcere-estomac-maroc">ulcère de l'estomac</a>). La chirurgie est réservée à de rares cas.</p>

<h2>Reflux : quand consulter ?</h2>
<p>Consultez si le reflux est fréquent, persiste malgré les mesures simples, ou s'accompagne de signes d'alerte. Le <a href="/specialites/medecine-generale">médecin généraliste</a> évalue et oriente vers un <a href="/specialites/gastro-enterologie">gastro-entérologue</a> pour une fibroscopie si nécessaire.</p>

<hr>
<p>Des brûlures ou remontées acides qui reviennent ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const refluxFaq = [
  { q: "Qu'est-ce que le reflux gastro-œsophagien (RGO) ?", a: "C'est la remontée du contenu acide de l'estomac vers l'œsophage, à cause d'un relâchement du sphincter qui les sépare. Il provoque des brûlures derrière le sternum et des régurgitations acides, surtout après les repas et en position allongée." },
  { q: "Comment soulager le reflux naturellement ?", a: "Éviter les repas copieux, gras et tardifs, ne pas s'allonger juste après manger, surélever la tête du lit, perdre du poids si besoin et limiter café, alcool et tabac. Ces mesures suffisent souvent à réduire nettement les symptômes." },
  { q: "Le reflux est-il dangereux ?", a: "La plupart du temps, il est bénin mais gênant. Un reflux fréquent et prolongé peut toutefois irriter l'œsophage. Des signes d'alerte (difficulté à avaler, amaigrissement, saignement) imposent une fibroscopie et ne doivent pas être négligés." },
  { q: "Quand faut-il faire une fibroscopie pour un reflux ?", a: "En cas de signes d'alerte (difficulté à avaler, amaigrissement, vomissements de sang, selles noires, anémie), après 50 ans, ou si le reflux persiste malgré le traitement. La fibroscopie vérifie l'état de l'œsophage et de l'estomac." },
  { q: "Reflux et grossesse : est-ce normal ?", a: "Oui, le reflux est fréquent pendant la grossesse en raison de la pression sur l'estomac et des changements hormonaux. Il est généralement sans gravité et disparaît après l'accouchement ; des mesures simples et certains traitements adaptés soulagent." },
  { q: "Quelle est la différence entre reflux et ulcère ?", a: "Le reflux est une remontée d'acide dans l'œsophage, donnant des brûlures qui remontent. L'ulcère est une plaie de la paroi de l'estomac ou du duodénum, donnant plutôt une douleur au creux de l'estomac. Les deux peuvent coexister et relèvent d'un avis médical." },
];
const refluxTakeaways = [
  "Le RGO est la remontée d'acide de l'estomac vers l'œsophage, donnant brûlures et régurgitations.",
  "Facteurs fréquents : surpoids, grossesse, repas gras et tardifs, tabac, alcool.",
  "Le diagnostic est clinique ; la fibroscopie est réservée aux signes d'alerte ou après 50 ans.",
  "Les mesures d'hygiène de vie soulagent souvent ; les IPP réduisent l'acidité si besoin.",
  "Difficulté à avaler, amaigrissement ou saignement imposent une fibroscopie.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. BPCO
// ─────────────────────────────────────────────────────────────────────────────
const cBpco = `<p>La bronchopneumopathie chronique obstructive (BPCO) est une maladie respiratoire grave et pourtant méconnue, principalement causée par le tabac. Elle s'installe lentement, réduisant peu à peu le souffle. On ne guérit pas la BPCO, mais on peut stopper son aggravation — et le premier traitement, décisif, est l'arrêt du tabac.</p>

<h2>Qu'est-ce que la BPCO ?</h2>
<p>La BPCO est une maladie chronique des bronches et des poumons, caractérisée par une <strong>obstruction progressive et durable</strong> du passage de l'air. Contrairement à l'<a href="/blog/asthme-maroc">asthme</a>, où l'obstruction est réversible, celle de la BPCO ne l'est pas complètement et tend à s'aggraver avec le temps.</p>

<h2>Quelles sont les causes ?</h2>
<ul>
<li><strong>Tabac</strong> : de très loin la première cause (tabagisme actif, parfois passif).</li>
<li><strong>Pollution</strong> de l'air et expositions professionnelles (poussières, produits chimiques).</li>
<li>Fumées de combustion domestique (bois, charbon), dans certains contextes.</li>
</ul>

<h2>Quels sont les symptômes ?</h2>
<ul>
<li><strong>Toux chronique</strong>, souvent avec crachats, surtout le matin</li>
<li><strong>Essoufflement</strong> d'abord à l'effort, puis pour des activités de plus en plus légères</li>
<li><strong>Bronchites à répétition</strong></li>
</ul>
<p>Ces signes, longtemps attribués au tabac ou à l'âge (« bronchite du fumeur »), sont souvent banalisés, ce qui retarde le diagnostic.</p>

<h2>Comment fait-on le diagnostic ?</h2>
<p>Par la <strong>spirométrie (EFR)</strong>, un test du souffle simple qui mesure l'obstruction et confirme la BPCO. Elle est recommandée chez tout fumeur ou ancien fumeur présentant une toux ou un essoufflement.</p>

<h2>Quelles complications ?</h2>
<p>La BPCO évolue vers une <strong>insuffisance respiratoire</strong>, avec un essoufflement invalidant et un manque d'oxygène. Elle est ponctuée d'<strong>exacerbations</strong> (aggravations aiguës, souvent lors d'infections) qui peuvent nécessiter une hospitalisation, et retentit sur le cœur.</p>

<h2>Comment traite-t-on la BPCO ?</h2>
<ul>
<li><strong>Arrêt du tabac</strong> : la mesure la plus importante ; elle stoppe l'aggravation à tout stade.</li>
<li><strong>Bronchodilatateurs inhalés</strong> pour ouvrir les bronches et améliorer le souffle.</li>
<li><strong>Réhabilitation respiratoire</strong> (exercice, kiné) pour regagner en capacité.</li>
<li><strong>Vaccinations</strong> (grippe, pneumocoque) pour limiter les infections.</li>
<li><strong>Oxygène</strong> aux stades avancés.</li>
</ul>
<blockquote>Attention : il n'est jamais trop tard pour arrêter de fumer. Même à un stade avancé, l'arrêt du tabac ralentit la maladie et améliore la qualité de vie. Un accompagnement au sevrage augmente nettement les chances de réussite.</blockquote>

<h2>BPCO : quand consulter ?</h2>
<p>Consultez si vous êtes fumeur (ou ancien fumeur) et présentez une toux qui traîne, des crachats ou un essoufflement à l'effort. Le <a href="/specialites/medecine-generale">médecin généraliste</a> ou le <a href="/specialites/pneumo-phtisiologie">pneumologue</a> confirme le diagnostic par la spirométrie et met en place la prise en charge.</p>

<hr>
<p>Un souffle qui diminue, une toux de fumeur qui persiste ? Sur SantéauMaroc, trouvez un médecin généraliste ou un pneumologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const bpcoFaq = [
  { q: "Quelle est la différence entre la BPCO et l'asthme ?", a: "Dans l'asthme, l'obstruction des bronches est réversible et survient par crises. Dans la BPCO, l'obstruction est permanente et progressive, principalement causée par le tabac, et touche surtout les fumeurs après 40 ans. Les deux se confirment par une spirométrie." },
  { q: "Quels sont les premiers signes de la BPCO ?", a: "Une toux chronique avec crachats (surtout le matin), des bronchites à répétition et un essoufflement à l'effort qui s'aggrave progressivement. Ces signes sont souvent banalisés sous le nom de « bronchite du fumeur », ce qui retarde le diagnostic." },
  { q: "La BPCO se guérit-elle ?", a: "Non, on ne guérit pas la BPCO, mais on peut stopper son aggravation, surtout par l'arrêt du tabac, et améliorer le souffle et la qualité de vie grâce aux bronchodilatateurs, à la réhabilitation respiratoire et aux vaccinations." },
  { q: "Arrêter de fumer sert-il encore quand on a une BPCO ?", a: "Oui, absolument, et à tout stade. L'arrêt du tabac est le seul geste qui ralentit réellement l'évolution de la maladie. Même tardif, il améliore le souffle et réduit les aggravations. Un accompagnement au sevrage augmente les chances de réussite." },
  { q: "Comment diagnostique-t-on la BPCO ?", a: "Par la spirométrie (EFR), un test du souffle simple qui mesure l'obstruction des bronches. Elle est recommandée chez tout fumeur ou ancien fumeur présentant une toux persistante ou un essoufflement à l'effort." },
  { q: "La BPCO est-elle grave ?", a: "Elle peut le devenir : non prise en charge, elle évolue vers une insuffisance respiratoire invalidante et des aggravations aiguës parfois hospitalisées. Prise à temps, avec l'arrêt du tabac, son évolution peut être nettement freinée." },
];
const bpcoTakeaways = [
  "La BPCO est une obstruction chronique et progressive des bronches, surtout causée par le tabac.",
  "Contrairement à l'asthme, son obstruction n'est pas complètement réversible.",
  "Signes : toux chronique avec crachats, essoufflement à l'effort, bronchites répétées.",
  "Le diagnostic repose sur la spirométrie (test du souffle).",
  "L'arrêt du tabac est le traitement décisif : il stoppe l'aggravation à tout stade.",
];

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES PILIERS
// ─────────────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    slug: "obesite-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Obésité",
    title: "Obésité au Maroc : causes, complications et prise en charge",
    excerpt: "L'obésité est une maladie chronique qui augmente le risque de diabète, d'hypertension et bien d'autres. IMC, causes, complications et prise en charge durable, expliqués et adaptés au Maroc.",
    content: cObesite,
    metaTitle: "Obésité au Maroc : causes, risques et prise en charge",
    metaDesc: "Obésité : définition (IMC), causes, complications (diabète, hypertension, arthrose) et prise en charge (alimentation, activité, chirurgie), expliquées et adaptées au Maroc.",
    readingTime: 6,
    keyTakeaways: obesiteTakeaways,
    faq: obesiteFaq,
  },
  {
    slug: "hepatite-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Hépatite virale",
    title: "Hépatites au Maroc : B, C, transmission, dépistage et traitement",
    excerpt: "Les hépatites B et C évoluent souvent en silence vers la cirrhose ou le cancer du foie. Transmission, symptômes, dépistage, vaccination et traitements (l'hépatite C se guérit), adaptés au Maroc.",
    content: cHepatite,
    metaTitle: "Hépatites au Maroc : B, C, dépistage et traitement",
    metaDesc: "Hépatites virales : différences A, B, C, E, transmission, symptômes, dépistage par prise de sang, vaccination et traitements. L'hépatite C se guérit désormais. Guide adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: hepatiteTakeaways,
    faq: hepatiteFaq,
  },
  {
    slug: "goutte-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Goutte",
    title: "Goutte au Maroc : causes, crise, alimentation et traitement",
    excerpt: "La goutte est une arthrite due à l'excès d'acide urique, avec des crises très douloureuses (souvent au gros orteil). Causes, alimentation, traitement de la crise et de fond, adaptés au Maroc.",
    content: cGoutte,
    metaTitle: "Goutte au Maroc : causes, crise et traitement",
    metaDesc: "Goutte : causes (acide urique, alimentation, alcool), crise typique au gros orteil, diagnostic, aliments à éviter et traitement de la crise et de fond, expliqués et adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: goutteTakeaways,
    faq: goutteFaq,
  },
  {
    slug: "osteoporose-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Ostéoporose",
    title: "Ostéoporose au Maroc : facteurs, dépistage et prévention",
    excerpt: "L'ostéoporose fragilise les os en silence et expose aux fractures, surtout après la ménopause. Facteurs de risque, ostéodensitométrie, traitement et prévention, expliqués et adaptés au Maroc.",
    content: cOsteoporose,
    metaTitle: "Ostéoporose au Maroc : dépistage, traitement et prévention",
    metaDesc: "Ostéoporose : facteurs de risque (âge, ménopause, calcium, vitamine D), dépistage par ostéodensitométrie, fractures, traitement et prévention, expliqués et adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: osteoporoseTakeaways,
    faq: osteoporoseFaq,
  },
  {
    slug: "reflux-gastro-oesophagien-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Reflux gastro-œsophagien",
    title: "Reflux gastro-œsophagien (RGO) au Maroc : causes et solutions",
    excerpt: "Brûlures derrière le sternum, remontées acides : le reflux gastro-œsophagien est fréquent et gênant. Causes, signes d'alerte, mesures simples et traitements pour le soulager, adaptés au Maroc.",
    content: cReflux,
    metaTitle: "Reflux gastro-œsophagien (RGO) au Maroc : causes et solutions",
    metaDesc: "Reflux gastro-œsophagien : causes, symptômes (brûlures, régurgitations), signes d'alerte, mesures d'hygiène de vie et traitements (IPP) pour le soulager, adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: refluxTakeaways,
    faq: refluxFaq,
  },
  {
    slug: "bpco-maroc",
    categorySlug: "maladies-traitements",
    aboutEntity: "Bronchopneumopathie chronique obstructive",
    title: "BPCO au Maroc : symptômes, tabac et traitement",
    excerpt: "La BPCO est une maladie respiratoire grave, surtout causée par le tabac, qui réduit peu à peu le souffle. Symptômes, diagnostic par spirométrie, complications et traitement, adaptés au Maroc.",
    content: cBpco,
    metaTitle: "BPCO au Maroc : symptômes, causes et traitement",
    metaDesc: "BPCO : différence avec l'asthme, symptômes (toux, essoufflement), rôle du tabac, diagnostic par spirométrie, complications et traitement (dont l'arrêt du tabac), adaptés au Maroc.",
    readingTime: 6,
    keyTakeaways: bpcoTakeaways,
    faq: bpcoFaq,
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

  console.log(`\nVague 4 : ${PILLARS.length} fiches Maladie publiées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
