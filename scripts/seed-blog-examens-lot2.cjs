require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Catégorie EXAMENS — LOT 2 (la catégorie `examens` est créée par
// seed-blog-examens.cjs). Même gabarit : pourquoi, déroulé, préparation, durée,
// douleur, risques, interprétation, PRIX INDICATIF Maroc + FAQ + À retenir.
//   • Radiographie        → médecine générale (repli)
//   • Mammographie        → gynéco-obstétrique
//   • Gastroscopie        → gastro-entérologie
//   • Spirométrie (EFR)   → pneumologie
//   • Ostéodensitométrie  → médecine générale (repli)
//   • Épreuve d'effort    → cardiologie
// Ces fiches renvoient vers les maladies déjà publiées (maillage retour).
// ⚠️ Prix INDICATIFS à faire valider. Idempotent (upsert). Mappings : blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. RADIOGRAPHIE
// ─────────────────────────────────────────────────────────────────────────────
const cRadio = `<p>La radiographie (ou « radio ») est le plus ancien et le plus courant des examens d'imagerie. Rapide, accessible et peu coûteuse, elle utilise les rayons X pour visualiser surtout les os et les poumons. C'est souvent le premier examen prescrit devant une douleur ou un traumatisme.</p>

<h2>Pourquoi réaliser une radiographie ?</h2>
<p>La radiographie visualise bien les structures denses. Elle est prescrite pour rechercher une <strong>fracture</strong> ou une atteinte osseuse, explorer les <strong>poumons</strong> (radio du thorax : infection, cœur), les articulations, les sinus, ou l'abdomen. C'est souvent un examen de première intention, complété si besoin par une échographie, un scanner ou une IRM.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Debout, assis ou allongé selon la zone, vous restez <strong>immobile</strong> quelques secondes pendant le cliché. Plusieurs incidences (angles de vue) sont parfois nécessaires. Le manipulateur se place derrière une vitre pendant le tir.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li>Retirer les objets métalliques et bijoux de la zone examinée.</li>
<li><strong>Signaler une grossesse</strong> ou un doute.</li>
<li>Aucune autre préparation dans la plupart des cas.</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>Très rapide : <strong>quelques minutes</strong>, cliché compris.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, la radiographie est <strong>indolore</strong>. Seule la position demandée peut être inconfortable en cas de douleur (fracture).</p>

<h2>Y a-t-il des risques ?</h2>
<p>La radiographie utilise des <strong>rayons X</strong> à faible dose. Le risque est minime et l'examen n'est prescrit que lorsqu'il est utile. On l'évite pendant la grossesse sauf nécessité, et un tablier de protection peut être utilisé.</p>

<h2>Comment lire les résultats ?</h2>
<p>Les clichés sont interprétés par le <strong>radiologue</strong>, qui rédige un compte-rendu. Votre médecin en tire le diagnostic et la conduite à tenir, en tenant compte de vos symptômes.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, une radiographie coûte en général <strong>entre 100 et 300 DH</strong> selon la région et le nombre de clichés. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs.</p>

<hr>
<p>Une radiographie prescrite ou des résultats à comprendre ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const radioFaq = [
  { q: "À quoi sert une radiographie ?", a: "Elle visualise surtout les structures denses : os (fractures), poumons (radio du thorax), articulations, sinus. C'est souvent l'examen de première intention devant une douleur ou un traumatisme, complété si besoin par une échographie, un scanner ou une IRM." },
  { q: "La radiographie est-elle dangereuse ?", a: "Elle utilise des rayons X à faible dose : le risque est minime et l'examen n'est prescrit que lorsqu'il est utile. On l'évite pendant la grossesse sauf nécessité, et un tablier de protection peut être utilisé pour limiter l'exposition." },
  { q: "La radiographie fait-elle mal ?", a: "Non, elle est indolore. Seule la position demandée pour le cliché peut être un peu inconfortable, notamment en cas de douleur ou de fracture. L'examen ne dure que quelques minutes." },
  { q: "Peut-on faire une radio enceinte ?", a: "On évite la radiographie pendant la grossesse en raison des rayons X, sauf si elle est vraiment nécessaire. Il faut toujours signaler une grossesse ou un doute : le médecin adaptera alors la conduite et les protections." },
  { q: "Quelle différence entre radio, scanner et IRM ?", a: "La radio donne une image simple et rapide, surtout des os et des poumons. Le scanner (rayons X) offre des coupes détaillées ; l'IRM (champ magnétique, sans rayons X) excelle pour les tissus mous. Le médecin choisit selon ce qu'il recherche." },
  { q: "La radiographie est-elle remboursée au Maroc ?", a: "Sur prescription médicale, une partie du coût peut être prise en charge par l'assurance maladie (AMO). Le reste est à votre charge dans le privé. Renseignez-vous auprès de votre organisme et du centre d'imagerie." },
];
const radioTakeaways = [
  "La radiographie utilise les rayons X, surtout pour les os et les poumons.",
  "Rapide, accessible et indolore, c'est souvent l'examen de première intention.",
  "Rayons X à faible dose : évitée pendant la grossesse sauf nécessité.",
  "Les clichés sont interprétés par le radiologue, puis par votre médecin.",
  "Prix indicatif au Maroc (privé) : environ 100 à 300 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. MAMMOGRAPHIE
// ─────────────────────────────────────────────────────────────────────────────
const cMammo = `<p>La mammographie est une radiographie des seins. C'est l'examen clé du <a href="/blog/cancer-sein-maroc-depistage-prevention">dépistage du cancer du sein</a>, qui permet de détecter des anomalies très petites, avant même qu'on puisse les sentir. Un examen court, un peu inconfortable, mais dont le bénéfice est majeur.</p>

<h2>Pourquoi réaliser une mammographie ?</h2>
<p>Elle sert au <strong>dépistage</strong> du cancer du sein (recommandé à partir de 40-50 ans, à discuter avec son médecin) et au <strong>diagnostic</strong> devant une anomalie (boule, écoulement, modification du sein). Détecter tôt un cancer du sein augmente nettement les chances de guérison.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Chaque sein est posé sur un support puis <strong>comprimé</strong> quelques secondes entre deux plaques, le temps du cliché, sous plusieurs angles. La compression, indispensable à la qualité des images, est brève. Une <strong>échographie</strong> complémentaire est souvent réalisée, notamment sur les seins denses.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li>Éviter de programmer l'examen juste avant ou pendant les règles (seins plus sensibles).</li>
<li>Ne pas appliquer de <strong>déodorant, talc ou crème</strong> le jour de l'examen (ils peuvent gêner l'interprétation).</li>
<li>Apporter les mammographies précédentes pour comparaison.</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>Environ <strong>15 à 20 minutes</strong>, échographie éventuelle comprise.</p>

<h2>Est-ce douloureux ?</h2>
<p>La compression est <strong>inconfortable, parfois un peu douloureuse</strong>, mais très brève. Réaliser l'examen en dehors de la période des règles la rend plus supportable.</p>

<h2>Y a-t-il des risques ?</h2>
<p>La mammographie utilise des rayons X à <strong>très faible dose</strong>. Le bénéfice du dépistage dépasse largement ce risque minime. Elle n'est pas réalisée pendant la grossesse sauf indication particulière.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le radiologue classe les images selon un score standardisé (classification ACR / BI-RADS) qui oriente la conduite. Un résultat classé « normal » est rassurant ; une anomalie peut nécessiter des examens complémentaires, sans être forcément un cancer. <strong>Seul le médecin interprète</strong> le résultat.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 300 et 600 DH</strong> selon le centre, l'échographie éventuelle et la prescription. Des campagnes de dépistage (Octobre Rose) facilitent aussi l'accès. Montants indicatifs.</p>

<hr>
<p>Une mammographie à réaliser ou des résultats à comprendre ? Sur SantéauMaroc, trouvez un gynécologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const mammoFaq = [
  { q: "À partir de quel âge faire une mammographie ?", a: "Le dépistage du cancer du sein par mammographie est généralement recommandé à partir de 40 à 50 ans, à un rythme régulier, et plus tôt en cas d'antécédents familiaux ou de facteurs de risque. Votre médecin ou gynécologue personnalise ce calendrier." },
  { q: "La mammographie est-elle douloureuse ?", a: "La compression du sein entre les deux plaques est inconfortable, parfois un peu douloureuse, mais très brève. Réaliser l'examen en dehors de la période des règles, quand les seins sont moins sensibles, la rend plus supportable." },
  { q: "Mammographie ou échographie du sein ?", a: "La mammographie est l'examen de référence du dépistage ; l'échographie la complète souvent, notamment sur les seins denses ou chez la femme jeune. Les deux sont complémentaires : le médecin décide de leur association selon la situation." },
  { q: "La mammographie est-elle dangereuse à cause des rayons X ?", a: "Elle utilise une très faible dose de rayons X. Le bénéfice du dépistage précoce du cancer du sein dépasse largement ce risque minime. Elle n'est pas réalisée pendant la grossesse, sauf indication particulière." },
  { q: "Que signifie un résultat ACR ou BI-RADS ?", a: "C'est une classification standardisée du radiologue qui indique le niveau de suspicion des images et oriente la conduite (surveillance, examens complémentaires). Une anomalie n'est pas forcément un cancer : seul le médecin interprète le résultat complet." },
  { q: "Le dépistage du cancer du sein est-il pris en charge au Maroc ?", a: "La mammographie est prise en charge sous conditions par l'assurance maladie sur prescription. Des campagnes de dépistage, notamment lors d'Octobre Rose, facilitent en outre l'accès à un dépistage parfois gratuit." },
];
const mammoTakeaways = [
  "La mammographie est une radiographie des seins, examen clé du dépistage du cancer du sein.",
  "Recommandée à partir de 40-50 ans, à discuter avec son médecin.",
  "La compression est inconfortable mais brève ; l'éviter pendant les règles aide.",
  "Rayons X à très faible dose : le bénéfice du dépistage prime largement.",
  "Prix indicatif au Maroc (privé) : environ 300 à 600 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. GASTROSCOPIE
// ─────────────────────────────────────────────────────────────────────────────
const cGastro = `<p>La gastroscopie (ou fibroscopie œso-gastro-duodénale) explore l'intérieur de l'œsophage, de l'estomac et du début de l'intestin à l'aide d'une petite caméra. C'est l'examen de référence pour comprendre des <a href="/blog/ulcere-estomac-maroc">douleurs de l'estomac</a>, un <a href="/blog/reflux-gastro-oesophagien-maroc">reflux</a> compliqué ou rechercher la bactérie <em>Helicobacter pylori</em>.</p>

<h2>Pourquoi réaliser une gastroscopie ?</h2>
<p>Elle est prescrite devant des douleurs de l'estomac persistantes, un reflux avec signes d'alerte, une suspicion d'ulcère ou de gastrite, une difficulté à avaler, une anémie inexpliquée, ou pour rechercher <em>Helicobacter pylori</em>. Elle permet aussi des <strong>prélèvements (biopsies)</strong> et certains gestes.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Un tube souple muni d'une caméra (endoscope) est introduit par la <strong>bouche</strong> et descend dans l'œsophage puis l'estomac. L'examen se fait sous <strong>anesthésie locale de la gorge</strong> (spray) ou sous sédation légère pour plus de confort.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li><strong>Être à jeun</strong> (ni boire ni manger) plusieurs heures avant, pour un estomac vide.</li>
<li>Signaler ses traitements, notamment les <strong>anticoagulants</strong>.</li>
<li>Prévoir un accompagnant en cas de sédation.</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>L'examen est court : <strong>10 à 15 minutes</strong>, auxquelles s'ajoute un temps de réveil en cas de sédation.</p>

<h2>Est-ce douloureux ?</h2>
<p>La gastroscopie n'est pas douloureuse mais peut être désagréable (réflexe nauséeux au passage de la gorge). Sous sédation, elle est bien mieux tolérée et souvent non ressentie.</p>

<h2>Y a-t-il des risques ?</h2>
<p>C'est un examen sûr. Les complications (saignement, perforation) sont <strong>rares</strong>, surtout en cas de geste ou de biopsie, auxquelles s'ajoutent les risques de l'éventuelle sédation. Ils sont expliqués avant l'examen.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le gastro-entérologue remet un <strong>compte-rendu</strong> immédiat, complété par l'analyse des biopsies (dont la recherche d'<em>Helicobacter pylori</em>) quelques jours plus tard. Il explique les résultats et la conduite à tenir.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 1 000 et 2 500 DH</strong>, selon la sédation, les biopsies et le centre. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs.</p>

<hr>
<p>Une gastroscopie prescrite ou des symptômes digestifs persistants ? Sur SantéauMaroc, trouvez un gastro-entérologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const gastroFaq = [
  { q: "La gastroscopie est-elle douloureuse ?", a: "Elle n'est pas douloureuse mais peut être désagréable, avec un réflexe nauséeux au passage de la gorge. Réalisée sous sédation, elle est bien mieux tolérée et souvent non ressentie. Une anesthésie locale de la gorge est sinon utilisée." },
  { q: "Faut-il être à jeun pour une gastroscopie ?", a: "Oui, il faut être à jeun plusieurs heures avant (ni boire ni manger) pour que l'estomac soit vide, condition indispensable à un examen fiable et sûr. Signalez vos traitements, en particulier les anticoagulants." },
  { q: "Quelle différence entre gastroscopie et coloscopie ?", a: "La gastroscopie explore l'œsophage, l'estomac et le début de l'intestin par la bouche ; la coloscopie explore le gros intestin (côlon) par voie basse. Les deux utilisent une caméra souple et peuvent se faire sous sédation." },
  { q: "La gastroscopie permet-elle de détecter Helicobacter pylori ?", a: "Oui. Lors de la gastroscopie, des prélèvements (biopsies) permettent de rechercher la bactérie Helicobacter pylori, principale cause d'ulcère. D'autres tests existent aussi (test respiratoire), selon la situation." },
  { q: "Combien de temps dure une gastroscopie ?", a: "L'examen lui-même est court : 10 à 15 minutes. En cas de sédation, il faut ajouter un temps de réveil et de surveillance, et prévoir un accompagnant car la conduite est déconseillée après." },
  { q: "La gastroscopie est-elle risquée ?", a: "C'est un examen sûr. Les complications comme un saignement ou une perforation sont rares, surtout en cas de biopsie ou de geste, auxquelles s'ajoutent les risques de la sédation éventuelle. Le médecin les explique avant l'examen." },
];
const gastroTakeaways = [
  "La gastroscopie explore œsophage, estomac et duodénum par une caméra introduite par la bouche.",
  "Elle explore douleurs d'estomac, reflux compliqué, ulcère, et recherche Helicobacter pylori.",
  "Il faut être à jeun ; l'examen se fait sous anesthésie locale ou sédation.",
  "Courte (10-15 min) et peu douloureuse sous sédation ; complications rares.",
  "Prix indicatif au Maroc (privé) : environ 1 000 à 2 500 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPIROMÉTRIE (EFR)
// ─────────────────────────────────────────────────────────────────────────────
const cSpiro = `<p>La spirométrie, ou exploration fonctionnelle respiratoire (EFR), mesure le souffle. Simple et indolore, c'est l'examen de référence pour diagnostiquer et suivre l'<a href="/blog/asthme-maroc">asthme</a> et la <a href="/blog/bpco-maroc">BPCO</a>. Elle objective une gêne respiratoire là où l'examen clinique ne suffit pas.</p>

<h2>Pourquoi réaliser une spirométrie ?</h2>
<p>Elle mesure les volumes d'air et la vitesse d'expiration pour détecter une <strong>obstruction</strong> des bronches. Elle sert à diagnostiquer l'asthme et la BPCO, à en suivre l'évolution, à évaluer un essoufflement ou une toux chronique, et parfois avant une intervention chirurgicale.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Assis, un pince-nez en place, vous <strong>soufflez dans un embout</strong> relié à l'appareil en suivant les consignes (inspirer à fond, souffler fort et longtemps). L'examen est souvent répété, et parfois refait après l'inhalation d'un <strong>bronchodilatateur</strong> pour voir si le souffle s'améliore.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li>Éviter certains médicaments bronchodilatateurs avant l'examen, <strong>selon les consignes</strong> du médecin.</li>
<li>Ne pas fumer ni faire d'effort intense juste avant.</li>
<li>Éviter un repas trop copieux avant l'examen.</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>En général <strong>20 à 30 minutes</strong>, avec les répétitions nécessaires.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, la spirométrie est <strong>indolore</strong>. Les efforts d'expiration répétés peuvent être un peu fatigants et donner une brève sensation de vertige ; on vous laisse récupérer entre les tests.</p>

<h2>Y a-t-il des risques ?</h2>
<p>Il n'y a <strong>pas de risque sérieux</strong>. L'examen demande simplement une bonne coopération pour être fiable.</p>

<h2>Comment lire les résultats ?</h2>
<p>Les courbes et les valeurs (comparées à des normes selon l'âge, le sexe et la taille) sont interprétées par le <strong>pneumologue</strong> ou votre médecin. Elles précisent le type et la sévérité d'un trouble respiratoire.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 200 et 400 DH</strong> selon le centre et le type d'exploration. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs.</p>

<hr>
<p>Un essoufflement ou une toux à explorer ? Sur SantéauMaroc, trouvez un pneumologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const spiroFaq = [
  { q: "À quoi sert la spirométrie (EFR) ?", a: "Elle mesure le souffle (volumes d'air, vitesse d'expiration) pour détecter une obstruction des bronches. C'est l'examen de référence pour diagnostiquer et suivre l'asthme et la BPCO, et pour explorer un essoufflement ou une toux chronique." },
  { q: "La spirométrie est-elle douloureuse ?", a: "Non, elle est indolore. Les efforts d'expiration répétés peuvent être un peu fatigants et donner une brève sensation de vertige ; l'équipe vous laisse récupérer entre les tests. Une bonne coopération rend l'examen fiable." },
  { q: "Comment se préparer à une spirométrie ?", a: "En évitant certains bronchodilatateurs avant l'examen selon les consignes du médecin, en ne fumant pas et en ne faisant pas d'effort intense juste avant, et en évitant un repas trop copieux. Suivez les indications fournies avec le rendez-vous." },
  { q: "Qu'est-ce que le test après bronchodilatateur ?", a: "Après une première mesure, on fait parfois inhaler un bronchodilatateur puis on refait le test. Si le souffle s'améliore nettement, cela oriente vers un asthme (obstruction réversible), à la différence de la BPCO." },
  { q: "La spirométrie permet-elle de diagnostiquer l'asthme ?", a: "Elle y contribue fortement en objectivant une obstruction des bronches et sa réversibilité après bronchodilatateur. Le diagnostic final associe ces résultats aux symptômes et à l'examen, interprétés par le médecin." },
  { q: "La spirométrie est-elle remboursée au Maroc ?", a: "Sur prescription, une partie du coût peut être prise en charge par l'assurance maladie (AMO). Renseignez-vous auprès de votre organisme et du centre. L'examen est souvent réalisé au cabinet du pneumologue." },
];
const spiroTakeaways = [
  "La spirométrie (EFR) mesure le souffle : examen de référence de l'asthme et de la BPCO.",
  "On souffle dans un embout ; le test est parfois refait après un bronchodilatateur.",
  "Indolore et sans risque, elle demande une bonne coopération pour être fiable.",
  "Les résultats sont interprétés par le pneumologue selon des normes (âge, sexe, taille).",
  "Prix indicatif au Maroc (privé) : environ 200 à 400 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. OSTÉODENSITOMÉTRIE
// ─────────────────────────────────────────────────────────────────────────────
const cDMO = `<p>L'ostéodensitométrie mesure la densité des os. Simple, rapide et indolore, c'est l'examen de référence pour dépister l'<a href="/blog/osteoporose-maroc">ostéoporose</a> et évaluer le risque de fracture, en particulier après la ménopause. Elle permet d'agir avant la première fracture.</p>

<h2>Pourquoi réaliser une ostéodensitométrie ?</h2>
<p>Elle évalue la solidité des os pour dépister l'<strong>ostéoporose</strong> et estimer le risque de fracture. Elle est prescrite notamment après la ménopause, en cas de facteurs de risque (antécédents familiaux, corticoïdes au long cours, maigreur), après une fracture survenue pour un choc minime, ou pour suivre un traitement de l'os.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Vous restez <strong>allongé, habillé</strong>, sur une table pendant qu'un bras appareillé passe au-dessus de vous et mesure la densité osseuse, généralement au niveau de la <strong>hanche et de la colonne lombaire</strong>. Il utilise des rayons X à très faible dose.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li>Aucune préparation particulière.</li>
<li>Signaler un examen récent avec produit de contraste ou isotopes (à espacer).</li>
<li>Signaler une grossesse possible.</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>Environ <strong>10 à 20 minutes</strong>.</p>

<h2>Est-ce douloureux ?</h2>
<p>Non, l'examen est totalement <strong>indolore</strong> : il suffit de rester immobile.</p>

<h2>Y a-t-il des risques ?</h2>
<p>La dose de rayons X est <strong>très faible</strong>, bien inférieure à celle d'une radiographie standard. L'examen est sans risque significatif ; on l'évite néanmoins pendant la grossesse.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le résultat s'exprime par le <strong>T-score</strong> : au-dessus de −1, la densité est normale ; entre −1 et −2,5, on parle d'ostéopénie ; à −2,5 ou en dessous, d'ostéoporose. Le médecin interprète ce chiffre avec vos facteurs de risque pour décider d'un traitement.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 300 et 600 DH</strong> selon le centre. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs.</p>

<hr>
<p>Un dépistage de l'ostéoporose à envisager ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const dmoFaq = [
  { q: "À quoi sert l'ostéodensitométrie ?", a: "Elle mesure la densité des os pour dépister l'ostéoporose et évaluer le risque de fracture. Elle est surtout indiquée après la ménopause, en présence de facteurs de risque, après une fracture pour un choc minime, ou pour suivre un traitement de l'os." },
  { q: "L'ostéodensitométrie est-elle douloureuse ou dangereuse ?", a: "Elle est indolore : il suffit de rester allongé et immobile. Elle utilise une dose de rayons X très faible, bien inférieure à une radiographie standard, sans risque significatif. On l'évite néanmoins pendant la grossesse." },
  { q: "Que signifie le T-score ?", a: "C'est le résultat de l'examen : au-dessus de −1, la densité osseuse est normale ; entre −1 et −2,5, on parle d'ostéopénie (os un peu fragilisé) ; à −2,5 ou en dessous, d'ostéoporose. Le médecin l'interprète avec vos facteurs de risque." },
  { q: "Combien de temps dure l'examen ?", a: "Environ 10 à 20 minutes. Vous restez allongé et habillé pendant qu'un bras appareillé passe au-dessus de vous pour mesurer la densité osseuse, généralement à la hanche et à la colonne lombaire." },
  { q: "Qui devrait faire une ostéodensitométrie ?", a: "Principalement les femmes après la ménopause avec facteurs de risque, les personnes traitées longtemps par corticoïdes, celles ayant fait une fracture pour un traumatisme minime, ou en suivi d'un traitement de l'ostéoporose. Le médecin en pose l'indication." },
  { q: "L'ostéodensitométrie est-elle remboursée au Maroc ?", a: "Sur prescription et dans certaines indications, une partie du coût peut être prise en charge par l'assurance maladie (AMO). Renseignez-vous auprès de votre organisme et du centre pour connaître votre situation." },
];
const dmoTakeaways = [
  "L'ostéodensitométrie mesure la densité des os : examen de référence de l'ostéoporose.",
  "Indiquée surtout après la ménopause et en présence de facteurs de risque.",
  "Indolore, rapide, avec une dose de rayons X très faible.",
  "Le résultat (T-score) est interprété par le médecin avec vos facteurs de risque.",
  "Prix indicatif au Maroc (privé) : environ 300 à 600 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. ÉPREUVE D'EFFORT
// ─────────────────────────────────────────────────────────────────────────────
const cEffort = `<p>L'épreuve d'effort (ou test d'effort, ECG d'effort) enregistre le fonctionnement du cœur pendant un effort physique. Elle recherche une souffrance du cœur qui n'apparaît qu'à l'effort, utile notamment pour explorer une <a href="/blog/douleur-poitrine-maroc">douleur à la poitrine</a>. Un examen surveillé de près par un médecin.</p>

<h2>Pourquoi réaliser une épreuve d'effort ?</h2>
<p>Au repos, un cœur peut sembler normal alors qu'il souffre à l'effort. Cet examen recherche une <strong>insuffisance coronaire</strong> (artères du cœur rétrécies, à l'origine de l'angine de poitrine), évalue l'aptitude à l'effort, la tension et le rythme à l'exercice, et aide au suivi après un problème cardiaque ou chez l'hypertendu.</p>

<h2>Comment se déroule l'examen ?</h2>
<p>Muni d'<strong>électrodes</strong> (comme pour un ECG) et d'un brassard de tension, vous réalisez un effort progressif sur un <strong>tapis roulant</strong> ou un <strong>vélo</strong>, sous la surveillance constante d'un médecin. L'effort augmente par paliers jusqu'à un objectif ou l'apparition de signes.</p>

<h2>Faut-il se préparer ?</h2>
<ul>
<li>Venir en <strong>tenue de sport</strong> et chaussures adaptées.</li>
<li>Éviter un repas lourd et le tabac avant l'examen.</li>
<li>Signaler ses traitements : certains (comme les bêtabloquants) peuvent être adaptés sur avis médical.</li>
</ul>

<h2>Combien de temps dure-t-elle ?</h2>
<p>Comptez environ <strong>30 minutes</strong> au total, dont l'effort proprement dit de 10 à 15 minutes, plus une phase de récupération surveillée.</p>

<h2>Est-ce douloureux ?</h2>
<p>L'examen n'est pas douloureux, mais il est <strong>fatigant</strong> puisqu'il s'agit d'un effort soutenu. Il est immédiatement interrompu en cas de douleur, d'essoufflement important ou de malaise.</p>

<h2>Y a-t-il des risques ?</h2>
<p>Les risques sont <strong>faibles</strong> car l'examen est réalisé sous surveillance médicale étroite, avec du matériel d'urgence à proximité. De rares complications cardiaques peuvent survenir, ce qui justifie ce cadre sécurisé et le respect des contre-indications.</p>

<h2>Comment lire les résultats ?</h2>
<p>Le <strong>cardiologue</strong> analyse l'ECG, la tension et les symptômes tout au long de l'effort. Un test « normal » est rassurant ; des anomalies orientent vers des examens complémentaires. L'interprétation tient compte de l'ensemble du contexte.</p>

<h2>Combien ça coûte au Maroc ?</h2>
<p>Dans le privé, comptez en général <strong>entre 400 et 800 DH</strong> selon le centre. Une prise en charge partielle par l'AMO est possible sur prescription. Montants indicatifs.</p>

<hr>
<p>Une épreuve d'effort prescrite ou un bilan cardiaque à faire ? Sur SantéauMaroc, trouvez un cardiologue près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const effortFaq = [
  { q: "À quoi sert une épreuve d'effort ?", a: "Elle enregistre le cœur pendant un effort pour détecter une souffrance qui n'apparaît qu'à l'exercice, notamment une insuffisance coronaire (angine de poitrine). Elle évalue aussi l'aptitude à l'effort, la tension et le rythme, et aide au suivi cardiaque." },
  { q: "L'épreuve d'effort est-elle dangereuse ?", a: "Les risques sont faibles car l'examen est réalisé sous surveillance médicale étroite, avec du matériel d'urgence à proximité, et il est interrompu au moindre signe. De rares complications cardiaques peuvent survenir, d'où ce cadre sécurisé." },
  { q: "Comment se préparer à un test d'effort ?", a: "Venir en tenue de sport avec des chaussures adaptées, éviter un repas lourd et le tabac avant l'examen, et signaler ses traitements. Certains médicaments (comme les bêtabloquants) peuvent être adaptés sur avis médical avant le test." },
  { q: "Combien de temps dure une épreuve d'effort ?", a: "Environ 30 minutes au total, dont l'effort proprement dit de 10 à 15 minutes sur tapis ou vélo, plus une phase de récupération surveillée. L'effort augmente par paliers jusqu'à un objectif ou l'apparition de signes." },
  { q: "Que se passe-t-il si j'ai mal pendant l'effort ?", a: "L'examen est immédiatement interrompu en cas de douleur dans la poitrine, d'essoufflement important, de malaise ou d'anomalie sur l'ECG. C'est justement l'un des buts : observer la réaction du cœur à l'effort en toute sécurité." },
  { q: "Un test d'effort normal est-il totalement rassurant ?", a: "Un test normal est rassurant mais n'exclut pas à 100 % une maladie cardiaque. Selon les symptômes et le contexte, le cardiologue peut proposer d'autres examens complémentaires. L'interprétation tient compte de l'ensemble de la situation." },
];
const effortTakeaways = [
  "L'épreuve d'effort enregistre le cœur pendant un effort sur tapis ou vélo.",
  "Elle recherche une souffrance du cœur à l'effort (insuffisance coronaire / angine).",
  "Réalisée sous surveillance médicale étroite : risques faibles.",
  "Fatigante mais indolore ; interrompue au moindre signe.",
  "Prix indicatif au Maroc (privé) : environ 400 à 800 DH.",
];

// ─────────────────────────────────────────────────────────────────────────────
// DÉFINITION DES FICHES
// ─────────────────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    slug: "radiographie-maroc",
    aboutEntity: "Radiographie",
    title: "Radiographie : déroulé, risques et prix au Maroc",
    excerpt: "Radiographie : pourquoi cet examen, comment il se déroule, préparation, durée, absence de douleur, risques (rayons X) et prix indicatif au Maroc. Un guide clair et rassurant.",
    content: cRadio,
    metaTitle: "Radiographie au Maroc : déroulé, risques et prix",
    metaDesc: "Radiographie : pourquoi, déroulé, préparation, durée, risques (rayons X, grossesse), interprétation et prix indicatif au Maroc. Guide clair et fiable, adapté au Maroc.",
    readingTime: 5,
    keyTakeaways: radioTakeaways,
    faq: radioFaq,
  },
  {
    slug: "mammographie-maroc",
    aboutEntity: "Mammographie",
    title: "Mammographie : déroulé, âge, douleur et prix au Maroc",
    excerpt: "Mammographie : pourquoi cet examen de dépistage du cancer du sein, à quel âge, comment il se déroule, douleur, résultats (ACR/BI-RADS) et prix indicatif au Maroc. Un guide clair.",
    content: cMammo,
    metaTitle: "Mammographie au Maroc : âge, déroulé, douleur et prix",
    metaDesc: "Mammographie : dépistage du cancer du sein, à quel âge, déroulé, douleur, préparation, résultats (ACR/BI-RADS) et prix indicatif au Maroc. Guide clair, adapté au Maroc.",
    readingTime: 6,
    keyTakeaways: mammoTakeaways,
    faq: mammoFaq,
  },
  {
    slug: "gastroscopie-maroc",
    aboutEntity: "Gastroscopie",
    title: "Gastroscopie (fibroscopie) : déroulé, préparation et prix au Maroc",
    excerpt: "Gastroscopie : pourquoi cet examen de l'estomac, préparation (à jeun), déroulé sous sédation, douleur, risques, résultats et prix indicatif au Maroc. Le guide pour l'aborder sereinement.",
    content: cGastro,
    metaTitle: "Gastroscopie au Maroc : déroulé, préparation et prix",
    metaDesc: "Gastroscopie (fibroscopie) : pourquoi, préparation (à jeun), déroulé sous sédation, douleur, risques, recherche d'Helicobacter pylori et prix indicatif au Maroc. Guide clair.",
    readingTime: 6,
    keyTakeaways: gastroTakeaways,
    faq: gastroFaq,
  },
  {
    slug: "spirometrie-efr-maroc",
    aboutEntity: "Spirométrie",
    title: "Spirométrie (EFR) : déroulé, utilité et prix au Maroc",
    excerpt: "Spirométrie (EFR) : à quoi sert ce test du souffle, comment il se déroule, préparation, durée, absence de douleur, interprétation et prix indicatif au Maroc. Un guide clair.",
    content: cSpiro,
    metaTitle: "Spirométrie (EFR) au Maroc : déroulé, utilité et prix",
    metaDesc: "Spirométrie (EFR) : test du souffle pour l'asthme et la BPCO, déroulé, préparation, test après bronchodilatateur, interprétation et prix indicatif au Maroc. Guide clair.",
    readingTime: 5,
    keyTakeaways: spiroTakeaways,
    faq: spiroFaq,
  },
  {
    slug: "osteodensitometrie-maroc",
    aboutEntity: "Ostéodensitométrie",
    title: "Ostéodensitométrie : déroulé, T-score et prix au Maroc",
    excerpt: "Ostéodensitométrie : pourquoi cet examen de dépistage de l'ostéoporose, comment il se déroule, absence de douleur, interprétation du T-score et prix indicatif au Maroc. Un guide clair.",
    content: cDMO,
    metaTitle: "Ostéodensitométrie au Maroc : déroulé, T-score et prix",
    metaDesc: "Ostéodensitométrie : dépistage de l'ostéoporose, déroulé, absence de douleur, faible dose de rayons X, interprétation du T-score et prix indicatif au Maroc. Guide clair.",
    readingTime: 5,
    keyTakeaways: dmoTakeaways,
    faq: dmoFaq,
  },
  {
    slug: "epreuve-effort-cardiaque-maroc",
    aboutEntity: "Épreuve d'effort",
    title: "Épreuve d'effort (test d'effort) : déroulé, sécurité et prix au Maroc",
    excerpt: "Épreuve d'effort cardiaque : pourquoi cet examen du cœur à l'effort, comment il se déroule sous surveillance, préparation, sécurité, interprétation et prix indicatif au Maroc.",
    content: cEffort,
    metaTitle: "Épreuve d'effort au Maroc : déroulé, sécurité et prix",
    metaDesc: "Épreuve d'effort (test d'effort, ECG d'effort) : pourquoi, déroulé sur tapis ou vélo sous surveillance, préparation, sécurité, interprétation et prix indicatif au Maroc.",
    readingTime: 5,
    keyTakeaways: effortTakeaways,
    faq: effortFaq,
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.findUnique({ where: { slug: "examens" }, select: { id: true } });
  if (!cat) { console.error("Catégorie 'examens' introuvable — lancer d'abord seed-blog-examens.cjs."); process.exit(1); }

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

  console.log(`\nExamens lot 2 : ${ARTICLES.length} fiches publiées.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
