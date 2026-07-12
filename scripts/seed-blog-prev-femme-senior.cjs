require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DENSIFICATION Prévention + COMPLÉMENTS Santé femme / Santé seniors (18 fiches).
//   • Prévention (6) → rattachées au pilier prevention-sante-guide-maroc
//   • Santé femme (6) → rattachées au pilier sante-femme-guide-maroc (gynéco)
//   • Seniors (6) → catégorie sante-senior, autonomes (médecine générale)
// Idempotent (upsert). Mappings CTA : lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

// ─── PRÉVENTION ───────────────────────────────────────────────────────────────
const cCardio = `<p>Les maladies cardiovasculaires — infarctus, <a href="/blog/avc-accident-vasculaire-cerebral-maroc">AVC</a> — sont une première cause de décès, mais elles sont en grande partie <strong>évitables</strong>. Agir sur quelques facteurs de risque protège le cœur et les artères, à tout âge.</p>

<h2>Les facteurs de risque à contrôler</h2>
<ul>
<li><a href="/blog/hypertension-arterielle-maroc">Hypertension</a>, <a href="/blog/diabete-type-2-maroc">diabète</a>, excès de <a href="/blog/cholesterol-maroc">cholestérol</a></li>
<li>Tabac (à arrêter), consommation excessive d'alcool</li>
<li>Surpoids, sédentarité, stress</li>
</ul>

<h2>Les bons réflexes</h2>
<ul>
<li>Faire contrôler régulièrement tension, glycémie et cholestérol.</li>
<li>Bouger : au moins 30 minutes de marche par jour.</li>
<li>Manger équilibré (moins de sel et de graisses saturées, plus de fruits, légumes, poisson, huile d'olive).</li>
<li>Arrêter le tabac et maintenir un poids sain.</li>
</ul>

<h2>Connaître son risque</h2>
<p>À partir de 40 ans, ou plus tôt en cas d'antécédents familiaux, un bilan permet d'évaluer son risque cardiovasculaire global et d'agir avant l'accident.</p>

<hr>
<p>Faites le point sur votre cœur : sur SantéauMaroc, trouvez un médecin ou un cardiologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const cardioFaq = [
  { q: "Comment prévenir les maladies cardiovasculaires ?", a: "En contrôlant la tension, le diabète et le cholestérol, en arrêtant le tabac, en limitant l'alcool, en bougeant au moins 30 minutes par jour, en mangeant équilibré et en maintenant un poids sain. La plupart des infarctus et AVC sont évitables." },
  { q: "Quels sont les principaux facteurs de risque du cœur ?", a: "L'hypertension, le diabète, l'excès de cholestérol, le tabac, l'alcool en excès, le surpoids, la sédentarité et le stress. Plusieurs sont modifiables : agir dessus réduit nettement le risque d'infarctus et d'AVC." },
  { q: "À partir de quand faire un bilan cardiovasculaire ?", a: "À partir de 40 ans en général, plus tôt en cas d'antécédents familiaux ou de facteurs de risque. Un bilan simple (tension, glycémie, cholestérol) permet d'évaluer le risque global et d'agir avant l'accident." },
  { q: "L'alimentation protège-t-elle le cœur ?", a: "Oui : une alimentation pauvre en sel et en graisses saturées, riche en fruits, légumes, légumineuses, poisson et huile d'olive (type méditerranéen) protège le cœur et les artères. Elle complète l'activité physique et l'arrêt du tabac." },
  { q: "Le sport est-il bon pour le cœur ?", a: "Oui, une activité physique régulière et adaptée (au moins 30 minutes de marche par jour) fait baisser la tension, améliore la glycémie et le cholestérol, et réduit le risque cardiovasculaire. Il est rarement trop tard pour s'y mettre." },
];
const cardioTk = [
  "La plupart des infarctus et AVC sont évitables.",
  "Contrôler tension, diabète, cholestérol ; arrêter le tabac.",
  "Bouger 30 min/jour, manger équilibré, poids sain.",
  "Évaluer son risque dès 40 ans (ou plus tôt si antécédents).",
];

const cPrevDiab = `<p>Le <a href="/blog/diabete-type-2-maroc">diabète de type 2</a> est en grande partie évitable. Chez les personnes à risque, un mode de vie sain peut réduire de près de moitié le risque de développer la maladie — et faire régresser un prédiabète.</p>

<h2>Qui est à risque ?</h2>
<p>Surpoids (surtout abdominal), antécédents familiaux, sédentarité, hypertension, antécédent de diabète gestationnel, âge après 45 ans. Ces personnes ont intérêt à se faire dépister.</p>

<h2>Les leviers de prévention</h2>
<ul>
<li><strong>Perdre du poids</strong> en cas de surpoids, même modestement.</li>
<li>Bouger régulièrement (marche, activité quotidienne).</li>
<li>Réduire sucres rapides et boissons sucrées ; privilégier fibres, légumes, légumineuses.</li>
</ul>

<h2>Repérer le prédiabète</h2>
<p>Une glycémie un peu élevée (prédiabète) est un signal d'alarme réversible : c'est le moment idéal pour agir. Une simple prise de sang permet de le détecter.</p>

<hr>
<p>À risque de diabète ? Faites-vous dépister. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const prevDiabFaq = [
  { q: "Peut-on éviter le diabète de type 2 ?", a: "En grande partie, oui. Chez les personnes à risque, un mode de vie sain (perte de poids, activité physique, alimentation équilibrée) peut réduire de près de moitié le risque de développer la maladie et faire régresser un prédiabète." },
  { q: "Qui devrait se faire dépister pour le diabète ?", a: "Les personnes en surpoids, avec antécédents familiaux, sédentaires, hypertendues, ayant eu un diabète gestationnel, ou après 45 ans. Une simple glycémie à jeun permet de dépister un diabète ou un prédiabète." },
  { q: "Qu'est-ce que le prédiabète ?", a: "C'est une glycémie plus élevée que la normale sans atteindre le seuil du diabète. C'est un stade réversible et un signal d'alarme : agir sur le mode de vie à ce moment permet souvent d'éviter ou de retarder le diabète." },
  { q: "Quelle alimentation pour prévenir le diabète ?", a: "Réduire les sucres rapides et les boissons sucrées, privilégier les fibres, les légumes, les légumineuses et les céréales complètes, et limiter les excès. Associée à l'activité physique et au maintien d'un poids sain, elle est très protectrice." },
  { q: "Perdre du poids réduit-il le risque de diabète ?", a: "Oui, nettement. Chez une personne en surpoids à risque, même une perte de poids modérée réduit fortement le risque de développer un diabète de type 2. C'est l'une des mesures de prévention les plus efficaces." },
];
const prevDiabTk = [
  "Le diabète de type 2 est en grande partie évitable.",
  "Leviers : perte de poids, activité physique, moins de sucres.",
  "Le prédiabète est un stade réversible : agir tôt.",
  "Se faire dépister si l'on cumule des facteurs de risque.",
];

const cDepistages = `<p>Se faire dépister permet de repérer tôt certaines maladies, avant les symptômes, quand elles se soignent le mieux. Les dépistages recommandés dépendent de l'âge, du sexe et des facteurs de risque. Voici les grands repères.</p>

<h2>Pour tous, à partir de 40-50 ans</h2>
<ul>
<li><strong>Tension artérielle</strong> : au moins une fois par an.</li>
<li><strong>Glycémie et cholestérol</strong> : selon les facteurs de risque.</li>
<li>Suivi <strong>dentaire</strong> et <strong>ophtalmologique</strong> réguliers.</li>
</ul>

<h2>Chez la femme</h2>
<ul>
<li><strong>Cancer du col</strong> : frottis à partir de 25 ans (voir <a href="/blog/cancer-col-uterus-depistage-frottis-maroc">dépistage du col</a>).</li>
<li><strong>Cancer du sein</strong> : <a href="/blog/mammographie-maroc">mammographie</a> selon l'âge et le risque.</li>
</ul>

<h2>À partir de 50 ans</h2>
<p><strong>Cancer colorectal</strong> : test de recherche de sang dans les selles, puis coloscopie si besoin (voir <a href="/blog/depistage-cancer-colorectal-maroc">dépistage colorectal</a>).</p>

<h2>Personnaliser avec son médecin</h2>
<p>Les antécédents familiaux et personnels peuvent avancer l'âge ou la fréquence des dépistages. Votre médecin établit le calendrier adapté à votre situation.</p>

<hr>
<p>Quels dépistages pour vous ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const depistagesFaq = [
  { q: "Quels dépistages faire et à quel âge ?", a: "La tension dès 40 ans (au moins une fois par an), la glycémie et le cholestérol selon les risques, le frottis du col dès 25 ans, la mammographie selon l'âge, et le dépistage du cancer colorectal dès 50 ans. Le médecin personnalise selon vos antécédents." },
  { q: "Pourquoi se faire dépister sans symptôme ?", a: "Parce que de nombreuses maladies (hypertension, diabète, cancers) sont silencieuses au début. Les dépister tôt, avant les symptômes, permet de les traiter au meilleur moment, quand les chances de guérison ou de contrôle sont les plus grandes." },
  { q: "Les dépistages sont-ils pris en charge au Maroc ?", a: "Plusieurs dépistages et la mammographie sont pris en charge sous conditions par l'assurance maladie, et des campagnes gratuites existent (par exemple pour le cancer du sein). Renseignez-vous auprès de votre organisme et de votre médecin." },
  { q: "Les antécédents familiaux changent-ils les dépistages ?", a: "Oui : des antécédents familiaux de certains cancers ou maladies peuvent avancer l'âge de début ou augmenter la fréquence des dépistages. Il est important de les signaler à votre médecin pour un calendrier adapté." },
  { q: "À quelle fréquence faire un bilan de santé ?", a: "Cela dépend de l'âge, des facteurs de risque et des résultats précédents. Un contrôle régulier de la tension, de la glycémie et du cholestérol, avec les dépistages de cancers recommandés, suffit souvent. Le médecin fixe le rythme adapté." },
];
const depistagesTk = [
  "Le dépistage repère les maladies tôt, avant les symptômes.",
  "Repères : tension dès 40 ans, frottis dès 25 ans, colorectal dès 50 ans.",
  "Mammographie et glycémie/cholestérol selon l'âge et le risque.",
  "Antécédents familiaux : calendrier à personnaliser avec le médecin.",
];

const cSommeil = `<p>Bien dormir est essentiel à la santé physique et mentale. Or le sommeil est souvent négligé. Quelques règles simples d'« hygiène du sommeil » aident à retrouver des nuits réparatrices, sans médicament.</p>

<h2>Pourquoi le sommeil compte</h2>
<p>Un sommeil de qualité soutient la mémoire, l'humeur, le système immunitaire et le poids. Le manque de sommeil chronique favorise fatigue, irritabilité, et à long terme certaines maladies.</p>

<h2>Les règles d'un bon sommeil</h2>
<ul>
<li>Des <strong>horaires réguliers</strong>, y compris le week-end.</li>
<li>Éviter <strong>écrans, café et repas lourds</strong> en soirée.</li>
<li>Une chambre calme, sombre et fraîche.</li>
<li>S'exposer à la lumière du jour et bouger dans la journée.</li>
<li>Réserver le lit au sommeil ; se lever si l'on ne dort pas.</li>
</ul>

<h2>Quand consulter ?</h2>
<p>Si les troubles du sommeil persistent, retentissent sur la journée, ou s'accompagnent de ronflements avec pauses respiratoires (apnées) ou d'un moral en berne (voir <a href="/blog/insomnie-maroc">insomnie</a>). Prudence avec les somnifères, à réserver au court terme et sur avis.</p>

<hr>
<p>Un sommeil de mauvaise qualité ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const sommeilFaq = [
  { q: "Comment mieux dormir naturellement ?", a: "En gardant des horaires réguliers, en évitant écrans, café et repas lourds le soir, en dormant dans une chambre calme, sombre et fraîche, en s'exposant à la lumière du jour et en bougeant en journée. Ces règles d'hygiène du sommeil sont très efficaces." },
  { q: "Combien d'heures de sommeil faut-il ?", a: "En moyenne 7 à 9 heures chez l'adulte, mais les besoins varient. L'important est de se sentir reposé dans la journée. Un sommeil un peu plus court ou fragmenté n'est pas forcément anormal s'il reste réparateur." },
  { q: "Pourquoi éviter les écrans avant de dormir ?", a: "La lumière des écrans et la stimulation qu'ils apportent retardent l'endormissement et perturbent le sommeil. Il est conseillé de les éteindre au moins une heure avant le coucher et de leur préférer une activité calme." },
  { q: "Quand consulter pour un problème de sommeil ?", a: "Si les troubles persistent plusieurs semaines, retentissent sur la journée (fatigue, humeur, concentration), ou s'accompagnent de ronflements avec pauses respiratoires ou d'un moral bas. Le médecin recherche alors la cause plutôt que de prescrire d'emblée un somnifère." },
  { q: "Les somnifères sont-ils une bonne solution ?", a: "Ils ne traitent pas la cause et exposent à une dépendance et à des effets indésirables. Ils doivent être réservés au court terme et sur avis médical. Les mesures d'hygiène du sommeil et, si besoin, les thérapies du sommeil sont plus durables." },
];
const sommeilTk = [
  "Un bon sommeil soutient mémoire, humeur, immunité et poids.",
  "Horaires réguliers, pas d'écrans/café le soir, chambre calme et fraîche.",
  "Troubles persistants ou ronflements avec pauses = consulter.",
  "Prudence avec les somnifères : court terme et sur avis.",
];

const cStress = `<p>Le stress est une réaction normale, utile face au danger. Mais lorsqu'il devient chronique, il pèse sur la santé physique et mentale. Apprendre à le gérer améliore la qualité de vie et prévient des complications.</p>

<h2>Quand le stress devient un problème</h2>
<p>Un stress prolongé peut entraîner fatigue, troubles du <a href="/blog/insomnie-maroc">sommeil</a>, irritabilité, douleurs, troubles digestifs, et favoriser de mauvaises habitudes (tabac, alimentation). Il peut aussi précéder ou accompagner une <a href="/blog/depression-maroc">dépression</a> ou de l'anxiété.</p>

<h2>Des moyens efficaces</h2>
<ul>
<li>Activité physique régulière, sommeil suffisant.</li>
<li>Techniques de relaxation, respiration, pleine conscience.</li>
<li>Organiser son temps, poser des limites, entretenir le lien social.</li>
<li>Limiter les excitants (café) et l'alcool.</li>
</ul>

<h2>Quand demander de l'aide ?</h2>
<p>Si le stress devient envahissant, s'accompagne d'angoisses, d'un mal-être durable ou d'idées noires, il ne faut pas rester seul : un médecin ou un psychologue peut aider. Demander de l'aide est un signe de force.</p>

<hr>
<p>Un stress qui pèse sur votre quotidien ? Sur SantéauMaroc, trouvez un médecin ou un psychiatre près de chez vous et prenez rendez-vous en ligne.</p>`;
const stressFaq = [
  { q: "Quels sont les effets du stress chronique sur la santé ?", a: "Il peut entraîner fatigue, troubles du sommeil, irritabilité, douleurs, troubles digestifs, et favoriser de mauvaises habitudes (tabac, alimentation). À long terme, il pèse sur la santé physique et mentale et peut accompagner anxiété ou dépression." },
  { q: "Comment gérer son stress au quotidien ?", a: "Par une activité physique régulière, un sommeil suffisant, des techniques de relaxation ou de respiration, une bonne organisation du temps, le maintien du lien social et la limitation des excitants et de l'alcool. Ces mesures réduisent efficacement le stress." },
  { q: "Le stress peut-il rendre malade ?", a: "Le stress ne « cause » pas directement toutes les maladies, mais un stress chronique fragilise, aggrave certains symptômes et favorise des comportements à risque. Bien le gérer fait partie de la prévention et du bien-être." },
  { q: "Quand consulter pour du stress ou de l'anxiété ?", a: "Lorsque le stress devient envahissant, s'accompagne d'angoisses, d'un mal-être durable, de troubles du sommeil marqués ou d'idées noires. Il ne faut pas rester seul : un médecin ou un psychologue peut aider, et demander de l'aide est un signe de force." },
  { q: "Relaxation et respiration aident-elles vraiment ?", a: "Oui, les techniques de relaxation, de respiration et de pleine conscience ont fait la preuve de leur intérêt pour réduire le stress et l'anxiété. Pratiquées régulièrement, elles complètent l'activité physique et un mode de vie équilibré." },
];
const stressTk = [
  "Le stress chronique pèse sur la santé physique et mentale.",
  "Le gérer : activité physique, sommeil, relaxation, lien social.",
  "Il peut accompagner anxiété et dépression.",
  "Stress envahissant ou idées noires : demander de l'aide.",
];

const cPrevCancer = `<p>Une part importante des cancers pourrait être évitée en agissant sur le mode de vie. Sans garantie individuelle, adopter de bonnes habitudes réduit nettement le risque — et le dépistage complète cette prévention.</p>

<h2>Les leviers qui comptent</h2>
<ul>
<li><strong>Ne pas fumer</strong> : le tabac est la première cause évitable de cancers.</li>
<li><strong>Limiter l'alcool</strong>, facteur de plusieurs cancers.</li>
<li>Alimentation équilibrée, riche en fruits, légumes et fibres ; limiter charcuterie et aliments ultra-transformés.</li>
<li>Activité physique régulière et maintien d'un poids sain.</li>
<li>Se protéger du <strong>soleil</strong> (cancers de la peau).</li>
</ul>

<h2>Vaccins et infections</h2>
<p>Certains cancers sont liés à des infections évitables : la vaccination contre le <strong>HPV</strong> (cancer du col) et contre l'<a href="/blog/hepatite-b-maroc">hépatite B</a> (cancer du foie) contribue à la prévention.</p>

<h2>Le dépistage, un complément essentiel</h2>
<p>Les <a href="/blog/depistages-par-age-maroc">dépistages</a> (sein, col, côlon) permettent de détecter tôt, voire d'éviter certains cancers. Prévention et dépistage vont de pair.</p>

<hr>
<p>Réduire son risque de cancer, c'est possible. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const prevCancerFaq = [
  { q: "Peut-on réduire son risque de cancer ?", a: "Oui, en partie : ne pas fumer, limiter l'alcool, manger équilibré, bouger, maintenir un poids sain, se protéger du soleil et se faire vacciner (HPV, hépatite B). Sans garantie individuelle, ces habitudes réduisent nettement le risque, et le dépistage les complète." },
  { q: "Le tabac cause-t-il beaucoup de cancers ?", a: "Oui, le tabac est la première cause évitable de cancers (poumon et bien d'autres). Arrêter de fumer, à tout âge, réduit le risque de cancer et de nombreuses autres maladies. C'est le geste de prévention le plus efficace." },
  { q: "L'alimentation influence-t-elle le risque de cancer ?", a: "Oui. Une alimentation riche en fruits, légumes et fibres, avec peu de charcuterie et d'aliments ultra-transformés, associée à une activité physique et un poids sain, contribue à réduire le risque de plusieurs cancers, dont le cancer colorectal." },
  { q: "Les vaccins protègent-ils de certains cancers ?", a: "Oui. La vaccination contre le HPV prévient la majorité des cancers du col de l'utérus, et celle contre l'hépatite B réduit le risque de cancer du foie. Ces vaccins font partie de la prévention des cancers liés à des infections." },
  { q: "Le dépistage suffit-il à prévenir le cancer ?", a: "Le dépistage détecte tôt, voire évite certains cancers (en retirant des lésions comme les polypes), mais il ne remplace pas la prévention par le mode de vie. Les deux sont complémentaires : agir sur ses habitudes et se faire dépister." },
];
const prevCancerTk = [
  "Une part importante des cancers est évitable par le mode de vie.",
  "Ne pas fumer, limiter l'alcool, manger équilibré, bouger, se protéger du soleil.",
  "Vaccins HPV et hépatite B : prévention de cancers liés à des infections.",
  "Prévention et dépistage vont de pair.",
];

// ─── SANTÉ DE LA FEMME ────────────────────────────────────────────────────────
const cRegles = `<p>Les règles douloureuses (dysménorrhée) sont très fréquentes. Souvent bénignes, elles peuvent parfois révéler une cause à traiter, comme l'<a href="/blog/endometriose-maroc">endométriose</a>. Des solutions existent pour ne pas les subir.</p>

<h2>Pourquoi les règles font mal ?</h2>
<p>Les douleurs viennent des contractions de l'utérus pendant les règles. Elles sont dites « primaires » quand elles existent depuis les premières règles sans maladie sous-jacente, et « secondaires » quand elles apparaissent plus tard et traduisent une cause.</p>

<h2>Comment les soulager ?</h2>
<ul>
<li>Chaleur sur le bas-ventre, activité physique douce.</li>
<li>Antalgiques ou anti-inflammatoires adaptés, sur conseil.</li>
<li>Dans certains cas, une contraception hormonale peut aider, sur avis médical.</li>
</ul>

<h2>Quand consulter ?</h2>
<p>Si les douleurs sont <strong>intenses, invalidantes</strong>, résistent aux traitements habituels, s'aggravent, ou apparaissent récemment. Des douleurs sévères peuvent évoquer une endométriose, souvent diagnostiquée avec retard.</p>

<hr>
<p>Des règles douloureuses qui vous gâchent la vie ? Sur SantéauMaroc, trouvez un gynécologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const reglesFaq = [
  { q: "Pourquoi ai-je des règles douloureuses ?", a: "Les douleurs viennent des contractions de l'utérus pendant les règles. Elles peuvent être primaires (présentes depuis les premières règles, sans maladie) ou secondaires (apparues plus tard, révélant une cause comme l'endométriose). Un avis médical aide à faire la part des choses." },
  { q: "Comment soulager les règles douloureuses ?", a: "Par la chaleur sur le bas-ventre, une activité physique douce, et des antalgiques ou anti-inflammatoires adaptés sur conseil. Dans certains cas, une contraception hormonale peut réduire les douleurs, sur avis médical." },
  { q: "Quand consulter pour des règles douloureuses ?", a: "Si les douleurs sont intenses, invalidantes, résistent aux traitements habituels, s'aggravent ou apparaissent récemment. Des douleurs sévères peuvent évoquer une endométriose, qui est souvent diagnostiquée avec retard : mieux vaut consulter." },
  { q: "Les règles douloureuses sont-elles normales ?", a: "Des douleurs modérées sont fréquentes et souvent bénignes. En revanche, des douleurs qui empêchent les activités habituelles, nécessitent de manquer l'école ou le travail, ou résistent aux antalgiques ne doivent pas être banalisées : elles justifient un avis." },
  { q: "Les règles douloureuses peuvent-elles cacher une endométriose ?", a: "Oui. Des règles très douloureuses, surtout si elles s'aggravent ou s'accompagnent de douleurs pendant les rapports ou en dehors des règles, peuvent révéler une endométriose. Cette maladie fréquente est souvent diagnostiquée tardivement : en parler à un gynécologue est important." },
];
const reglesTk = [
  "Les règles douloureuses sont fréquentes, souvent bénignes.",
  "Soulager : chaleur, activité douce, antalgiques adaptés, parfois contraception.",
  "Douleurs intenses ou récentes : consulter.",
  "Des douleurs sévères peuvent révéler une endométriose (souvent diagnostiquée tard).",
];

const cAllaitement = `<p>L'allaitement maternel est recommandé pour ses nombreux bienfaits, pour le bébé comme pour la mère. Quand il est choisi, quelques repères aident à le vivre sereinement et à surmonter les difficultés fréquentes du début.</p>

<h2>Les bienfaits</h2>
<p>Le lait maternel couvre les besoins du nourrisson, le protège contre les infections et favorise le lien mère-enfant. Il présente aussi des bénéfices pour la santé de la mère.</p>

<h2>Bien démarrer</h2>
<ul>
<li>Mettre le bébé au sein tôt et souvent, à la demande.</li>
<li>Veiller à une bonne position et une bonne prise du sein.</li>
<li>Se reposer, s'hydrater et manger équilibré.</li>
</ul>

<h2>Les difficultés fréquentes</h2>
<p>Crevasses, engorgement, doute sur la quantité de lait sont courants au début et se surmontent avec de bons conseils. Une <strong>sage-femme</strong>, un médecin ou une consultante en lactation peuvent aider.</p>

<blockquote>Attention : consultez en cas de sein rouge, chaud et douloureux avec fièvre (mastite), de bébé qui ne mouille pas assez de couches ou ne prend pas de poids.</blockquote>

<h2>Allaitement et médicaments</h2>
<p>Ne prenez pas de médicament sans avis pendant l'allaitement : demandez conseil, beaucoup sont compatibles, d'autres non.</p>

<hr>
<p>Des questions sur l'allaitement ? Sur SantéauMaroc, trouvez une sage-femme, un médecin ou un pédiatre près de chez vous.</p>`;
const allaitementFaq = [
  { q: "Quels sont les bienfaits de l'allaitement maternel ?", a: "Le lait maternel couvre les besoins du nourrisson, le protège contre les infections et favorise le lien mère-enfant. Il présente aussi des bénéfices pour la santé de la mère. C'est pourquoi l'allaitement est recommandé lorsqu'il est possible et choisi." },
  { q: "Comment réussir son allaitement au début ?", a: "En mettant le bébé au sein tôt et souvent, à la demande, en veillant à une bonne position et une bonne prise du sein, et en prenant soin de soi (repos, hydratation, alimentation). Une sage-femme ou une consultante en lactation peut aider en cas de difficulté." },
  { q: "Comment savoir si bébé boit assez de lait ?", a: "Un bébé qui mouille suffisamment de couches, prend du poids régulièrement et semble apaisé après les tétées reçoit assez de lait. En cas de doute, de couches trop sèches ou de mauvaise prise de poids, il faut consulter le pédiatre ou la sage-femme." },
  { q: "Que faire en cas de crevasses ou d'engorgement ?", a: "Ces difficultés sont fréquentes au début et se surmontent avec de bons conseils sur la position et la prise du sein. Un sein rouge, chaud et douloureux avec fièvre (mastite) doit faire consulter, car il peut nécessiter un traitement." },
  { q: "Peut-on prendre des médicaments en allaitant ?", a: "Beaucoup de médicaments sont compatibles avec l'allaitement, d'autres non. Il ne faut pas se médiquer sans avis : demandez conseil à votre médecin, votre pharmacien ou votre sage-femme, qui choisiront une option adaptée." },
];
const allaitementTk = [
  "L'allaitement maternel a de nombreux bienfaits pour le bébé et la mère.",
  "Bien démarrer : au sein tôt et souvent, bonne position, prendre soin de soi.",
  "Crevasses et engorgement sont fréquents et se surmontent avec de l'aide.",
  "Sein rouge/fièvre (mastite) = consulter ; pas de médicament sans avis.",
];

const cSuiviGyneco = `<p>Le suivi gynécologique accompagne la femme à chaque étape de la vie : contraception, grossesse, dépistages, ménopause. Même sans symptôme, des consultations régulières permettent de prévenir et de dépister tôt.</p>

<h2>Pourquoi un suivi régulier ?</h2>
<p>Il permet de dépister précocement des affections (cancers du <a href="/blog/cancer-col-uterus-depistage-frottis-maroc">col</a> et du sein, infections), d'accompagner la contraception, la <a href="/blog/suivi-grossesse-maroc">grossesse</a> et la <a href="/blog/menopause-symptomes-solutions-maroc">ménopause</a>, et de répondre aux questions de santé intime.</p>

<h2>À quelle fréquence ?</h2>
<p>Un suivi régulier (souvent annuel) est recommandé, adapté à l'âge et à la situation. Le frottis de dépistage du col suit un rythme propre, défini avec le médecin.</p>

<h2>Que fait-on lors de la consultation ?</h2>
<ul>
<li>Échange sur la contraception, les règles, la santé intime.</li>
<li>Examen si nécessaire, frottis selon le calendrier.</li>
<li>Mise à jour des dépistages et des vaccinations (dont HPV au bon âge).</li>
</ul>

<hr>
<p>Un suivi gynécologique à organiser ? Sur SantéauMaroc, trouvez un gynécologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const suiviGynecoFaq = [
  { q: "À quelle fréquence consulter un gynécologue ?", a: "Un suivi régulier, souvent annuel, est recommandé, adapté à l'âge et à la situation, et plus rapproché en cas de grossesse, de symptômes ou d'antécédents. Le frottis de dépistage du col suit un rythme propre défini avec le médecin." },
  { q: "Pourquoi un suivi gynécologique sans symptôme ?", a: "Parce qu'il permet de dépister précocement des affections souvent silencieuses (cancers du col et du sein, infections), d'accompagner la contraception, la grossesse et la ménopause, et de répondre aux questions de santé intime." },
  { q: "Que se passe-t-il lors d'une consultation gynécologique ?", a: "Un échange sur la contraception, les règles et la santé intime, un examen si nécessaire, un frottis selon le calendrier, et la mise à jour des dépistages et des vaccinations (dont le HPV au bon âge). La consultation s'adapte à vos besoins." },
  { q: "Peut-on être suivie par un médecin généraliste ?", a: "Oui, le médecin généraliste peut assurer une partie du suivi gynécologique (contraception, frottis, dépistages) et orienter vers un gynécologue si nécessaire. L'important est d'avoir un suivi régulier, quel que soit le professionnel." },
  { q: "À quel âge commencer le suivi gynécologique ?", a: "Le suivi peut commencer à l'adolescence ou au début de la vie sexuelle, notamment pour la contraception et l'information. Le frottis de dépistage du col débute généralement à partir de 25 ans. Le médecin adapte selon la situation." },
];
const suiviGynecoTk = [
  "Le suivi gynécologique accompagne chaque étape de la vie de la femme.",
  "Il dépiste tôt (col, sein, infections) et accompagne contraception/grossesse/ménopause.",
  "Un suivi régulier (souvent annuel) est recommandé, même sans symptôme.",
  "Généraliste ou gynécologue : l'essentiel est un suivi régulier.",
];

const cEndometriose = `<p>L'endométriose est une maladie fréquente et pourtant longtemps méconnue. Elle provoque des douleurs, souvent liées aux règles, qui ne doivent pas être banalisées. Mieux la connaître aide à raccourcir le délai avant le diagnostic.</p>

<h2>Qu'est-ce que l'endométriose ?</h2>
<p>C'est la présence, en dehors de l'utérus, de tissu semblable à celui qui tapisse l'utérus. Ce tissu réagit aux hormones et provoque inflammation et douleurs, notamment pendant les <a href="/blog/regles-douloureuses-maroc">règles</a>.</p>

<h2>Les symptômes</h2>
<ul>
<li>Règles très douloureuses, résistant aux antalgiques habituels</li>
<li>Douleurs pelviennes en dehors des règles, douleurs pendant les rapports</li>
<li>Parfois troubles digestifs ou urinaires rythmés par le cycle</li>
<li>Difficultés à concevoir</li>
</ul>

<h2>Le diagnostic</h2>
<p>Il repose sur l'écoute des symptômes et des examens (échographie, parfois IRM). Le délai de diagnostic est souvent long : c'est pourquoi il ne faut pas banaliser des règles très douloureuses.</p>

<h2>La prise en charge</h2>
<p>Selon les cas : traitements de la douleur, traitements hormonaux, parfois chirurgie, et accompagnement de la fertilité si besoin. La prise en charge est personnalisée.</p>

<hr>
<p>Des douleurs qui évoquent une endométriose ? Sur SantéauMaroc, trouvez un gynécologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const endometrioseFaq = [
  { q: "Qu'est-ce que l'endométriose ?", a: "C'est une maladie fréquente où un tissu semblable à celui qui tapisse l'utérus se développe en dehors de l'utérus. Réagissant aux hormones, il provoque inflammation et douleurs, souvent rythmées par les règles, et peut gêner la fertilité." },
  { q: "Quels sont les symptômes de l'endométriose ?", a: "Des règles très douloureuses résistant aux antalgiques, des douleurs pelviennes en dehors des règles, des douleurs pendant les rapports, parfois des troubles digestifs ou urinaires rythmés par le cycle, et des difficultés à concevoir." },
  { q: "Comment diagnostique-t-on l'endométriose ?", a: "Par l'écoute des symptômes et des examens (échographie, parfois IRM). Le diagnostic est souvent posé avec retard, d'où l'importance de ne pas banaliser des règles très douloureuses et d'en parler à un gynécologue." },
  { q: "L'endométriose se soigne-t-elle ?", a: "Elle ne se « guérit » pas toujours, mais se prend en charge : traitements de la douleur, traitements hormonaux, parfois chirurgie, et accompagnement de la fertilité si besoin. La prise en charge est personnalisée selon les symptômes et le projet de vie." },
  { q: "L'endométriose empêche-t-elle d'avoir des enfants ?", a: "Elle peut rendre la conception plus difficile, mais beaucoup de femmes atteintes ont des enfants, spontanément ou avec une aide médicale. Un accompagnement de la fertilité est proposé si nécessaire. En parler tôt à un spécialiste est utile." },
];
const endometrioseTk = [
  "L'endométriose est une maladie fréquente et longtemps méconnue.",
  "Signes : règles très douloureuses, douleurs pelviennes, douleurs aux rapports, infertilité.",
  "Diagnostic souvent tardif : ne pas banaliser des règles très douloureuses.",
  "Prise en charge personnalisée : douleur, hormones, parfois chirurgie, fertilité.",
];

const cSopk = `<p>Le syndrome des ovaires polykystiques (SOPK) est l'un des troubles hormonaux les plus fréquents chez la femme en âge de procréer. Il associe des règles irrégulières et des signes hormonaux, et peut retentir sur la fertilité et la santé métabolique.</p>

<h2>Qu'est-ce que le SOPK ?</h2>
<p>C'est un déséquilibre hormonal qui perturbe l'ovulation. Malgré son nom, il ne s'agit pas de vrais « kystes » mais de petits follicules nombreux visibles à l'échographie.</p>

<h2>Les signes</h2>
<ul>
<li><strong>Règles irrégulières</strong> ou absentes</li>
<li>Signes d'excès d'hormones masculines : acné, pilosité excessive</li>
<li>Difficultés à concevoir</li>
<li>Prise de poids, parfois résistance à l'insuline</li>
</ul>

<h2>Pourquoi le prendre en charge ?</h2>
<p>Au-delà des règles et de la fertilité, le SOPK augmente le risque de <a href="/blog/diabete-type-2-maroc">diabète</a> : une bonne hygiène de vie est protectrice.</p>

<h2>La prise en charge</h2>
<p>Elle est personnalisée : hygiène de vie (poids, activité), traitements pour régulariser les cycles ou l'acné, et accompagnement de la fertilité en cas de projet de grossesse.</p>

<hr>
<p>Des cycles irréguliers qui évoquent un SOPK ? Sur SantéauMaroc, trouvez un gynécologue près de chez vous et prenez rendez-vous en ligne.</p>`;
const sopkFaq = [
  { q: "Qu'est-ce que le syndrome des ovaires polykystiques (SOPK) ?", a: "C'est un trouble hormonal fréquent qui perturbe l'ovulation, associant règles irrégulières et signes d'excès d'hormones masculines (acné, pilosité). Malgré son nom, il ne s'agit pas de vrais kystes mais de petits follicules nombreux visibles à l'échographie." },
  { q: "Quels sont les symptômes du SOPK ?", a: "Des règles irrégulières ou absentes, de l'acné, une pilosité excessive, des difficultés à concevoir, une prise de poids et parfois une résistance à l'insuline. Les symptômes varient d'une femme à l'autre." },
  { q: "Le SOPK empêche-t-il d'avoir des enfants ?", a: "Il peut rendre la conception plus difficile en perturbant l'ovulation, mais beaucoup de femmes atteintes ont des enfants, avec une hygiène de vie adaptée et, si besoin, un accompagnement de la fertilité. Un avis gynécologique est utile en cas de projet de grossesse." },
  { q: "Le SOPK augmente-t-il le risque de diabète ?", a: "Oui, le SOPK est souvent associé à une résistance à l'insuline et augmente le risque de diabète de type 2. C'est pourquoi une bonne hygiène de vie (poids, activité physique, alimentation) est particulièrement importante et protectrice." },
  { q: "Comment se soigne le SOPK ?", a: "La prise en charge est personnalisée : hygiène de vie (perte de poids si besoin, activité physique), traitements pour régulariser les cycles ou traiter l'acné, et accompagnement de la fertilité en cas de désir de grossesse. Le suivi limite aussi le risque métabolique." },
];
const sopkTk = [
  "Le SOPK est un trouble hormonal fréquent perturbant l'ovulation.",
  "Signes : règles irrégulières, acné, pilosité, difficultés à concevoir.",
  "Il augmente le risque de diabète : l'hygiène de vie est protectrice.",
  "Prise en charge personnalisée (cycles, acné, fertilité).",
];

const cMycose = `<p>Les mycoses et infections vaginales sont très fréquentes et le plus souvent bénignes. Démangeaisons, pertes inhabituelles, irritation : ces symptômes gênants ont plusieurs causes, qu'il vaut mieux faire préciser plutôt que de s'auto-traiter systématiquement.</p>

<h2>Mycose ou autre infection ?</h2>
<p>La <strong>mycose</strong> (à champignon) donne des démangeaisons et des pertes blanches épaisses. D'autres infections (vaginose, infections sexuellement transmissibles) donnent des pertes ou une gêne différentes. Le traitement n'est pas le même.</p>

<h2>Ce qui favorise les mycoses</h2>
<ul>
<li>Antibiotiques, grossesse, diabète</li>
<li>Toilette intime excessive ou agressive, vêtements serrés</li>
</ul>

<h2>Que faire ?</h2>
<ul>
<li>Éviter les toilettes intimes agressives ; préférer une hygiène douce.</li>
<li>Un traitement antifongique local peut suffire pour une mycose typique et récidivante déjà connue.</li>
<li>En cas de premier épisode, de doute, de récidives ou de signes inhabituels : consulter.</li>
</ul>

<blockquote>Attention : consultez en cas de fièvre, douleurs pelviennes, pertes malodorantes, saignements, ou si vous êtes enceinte — et ne multipliez pas les auto-traitements sans diagnostic.</blockquote>

<hr>
<p>Une gêne intime persistante ou récidivante ? Sur SantéauMaroc, trouvez un médecin ou un gynécologue près de chez vous.</p>`;
const mycoseFaq = [
  { q: "Comment reconnaître une mycose vaginale ?", a: "Elle donne typiquement des démangeaisons et des pertes blanches épaisses, sans mauvaise odeur. D'autres infections donnent des pertes ou une gêne différentes et se traitent autrement : en cas de doute ou de premier épisode, mieux vaut consulter pour préciser." },
  { q: "Qu'est-ce qui favorise les mycoses ?", a: "La prise d'antibiotiques, la grossesse, le diabète, une toilette intime excessive ou agressive et les vêtements serrés. Une hygiène intime douce et non agressive aide à les prévenir." },
  { q: "Peut-on se soigner une mycose seule ?", a: "Pour une mycose typique et récidivante déjà diagnostiquée, un traitement antifongique local peut suffire. Mais en cas de premier épisode, de doute, de récidives fréquentes ou de signes inhabituels, il faut consulter plutôt que multiplier les auto-traitements." },
  { q: "Quand consulter pour une infection vaginale ?", a: "En cas de fièvre, de douleurs pelviennes, de pertes malodorantes, de saignements, de premier épisode, de récidives, ou pendant la grossesse. Ces situations nécessitent un diagnostic précis pour un traitement adapté." },
  { q: "Les infections vaginales sont-elles graves ?", a: "Le plus souvent non : elles sont fréquentes et bénignes. Mais certaines (infections sexuellement transmissibles, infections hautes) nécessitent un traitement spécifique. C'est pourquoi il ne faut pas banaliser des symptômes qui persistent ou récidivent." },
];
const mycoseTk = [
  "Les mycoses et infections vaginales sont fréquentes et souvent bénignes.",
  "Mycose (démangeaisons, pertes blanches épaisses) ≠ autres infections : traitement différent.",
  "Éviter les toilettes intimes agressives ; ne pas multiplier les auto-traitements.",
  "Fièvre, douleurs, pertes malodorantes, grossesse = consulter.",
];

// ─── SENIORS ──────────────────────────────────────────────────────────────────
const cPolymed = `<p>Avec l'âge et les maladies chroniques, on prend souvent plusieurs médicaments. Cette « polymédication » est parfois nécessaire, mais elle augmente le risque d'effets indésirables et d'interactions. Une révision régulière est essentielle.</p>

<h2>Les risques</h2>
<ul>
<li>Interactions entre médicaments, effets indésirables (chutes, confusion, troubles digestifs)</li>
<li>Erreurs de prise, oublis, doublons</li>
<li>Médicaments devenus inutiles au fil du temps</li>
</ul>

<h2>Les bons réflexes</h2>
<ul>
<li>Tenir une <strong>liste à jour</strong> de tous ses médicaments (y compris ceux sans ordonnance).</li>
<li>Faire <strong>réviser régulièrement</strong> son traitement par le médecin (le « déprescrire » quand c'est possible).</li>
<li>Utiliser un pilulier, respecter les prises, ne pas s'auto-médiquer.</li>
<li>Signaler tout effet nouveau après un changement de traitement.</li>
</ul>

<blockquote>Attention : les <a href="/blog/anti-inflammatoires-ains-maroc">anti-inflammatoires</a>, somnifères et calmants exposent particulièrement la personne âgée aux chutes et à la confusion. À utiliser avec prudence, sur avis.</blockquote>

<hr>
<p>Trop de médicaments ? Faites le point. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const polymedFaq = [
  { q: "Qu'est-ce que la polymédication ?", a: "C'est la prise simultanée de plusieurs médicaments, fréquente chez la personne âgée avec des maladies chroniques. Parfois nécessaire, elle augmente le risque d'interactions et d'effets indésirables, d'où l'importance d'une révision régulière du traitement." },
  { q: "Comment limiter les risques de plusieurs médicaments ?", a: "En tenant une liste à jour de tous ses médicaments (y compris sans ordonnance), en faisant réviser régulièrement son traitement par le médecin, en utilisant un pilulier, en respectant les prises et en évitant l'automédication. Signalez tout effet nouveau." },
  { q: "Peut-on arrêter des médicaments devenus inutiles ?", a: "Oui, c'est le principe de la « déprescription » : le médecin peut arrêter ou réduire des médicaments devenus inutiles ou risqués au fil du temps. Cela ne se fait jamais seul, mais lors d'une révision régulière du traitement." },
  { q: "Quels médicaments sont risqués chez la personne âgée ?", a: "Les anti-inflammatoires, les somnifères et les calmants exposent particulièrement aux chutes, à la confusion et à d'autres effets indésirables chez la personne âgée. Ils doivent être utilisés avec prudence et sur avis médical." },
  { q: "Pourquoi utiliser un pilulier ?", a: "Le pilulier aide à organiser les prises, à éviter les oublis et les doublons, surtout quand on prend plusieurs médicaments. C'est un outil simple qui sécurise le traitement, en complément d'une liste à jour et d'un suivi médical." },
];
const polymedTk = [
  "La polymédication (plusieurs médicaments) augmente les risques d'interactions et d'effets.",
  "Tenir une liste à jour et faire réviser régulièrement son traitement.",
  "Pilulier, respect des prises, pas d'automédication.",
  "Anti-inflammatoires, somnifères et calmants : prudence chez le senior (chutes).",
];

const cAudition = `<p>La baisse de l'audition liée à l'âge (presbyacousie) est très fréquente après 60 ans. Progressive, elle est souvent négligée, alors qu'elle retentit sur la communication, le moral et le lien social. Elle se corrige bien.</p>

<h2>Comment se manifeste-t-elle ?</h2>
<p>On entend mais on comprend mal, surtout dans le bruit ; on fait répéter, on monte le son de la télévision, on s'isole peu à peu des conversations.</p>

<h2>Pourquoi ne pas attendre</h2>
<p>Une baisse d'audition non corrigée favorise l'<a href="/blog/isolement-moral-senior-maroc">isolement</a>, la baisse de moral et pourrait accélérer le déclin cognitif. La prendre en charge améliore nettement la qualité de vie.</p>

<h2>Que faire ?</h2>
<ul>
<li>Consulter pour un <strong>bilan auditif</strong> (audiogramme).</li>
<li>Les <strong>aides auditives</strong>, bien réglées, compensent efficacement la perte.</li>
<li>Traiter une cause simple éventuelle (bouchon de cérumen).</li>
</ul>

<blockquote>Attention : une baisse d'audition brutale, d'un seul côté, ou avec vertiges ou douleur, doit faire consulter rapidement — ce n'est pas la presbyacousie habituelle.</blockquote>

<hr>
<p>Vous entendez moins bien ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const auditionFaq = [
  { q: "Qu'est-ce que la presbyacousie ?", a: "C'est la baisse progressive de l'audition liée à l'âge, très fréquente après 60 ans. On entend mais on comprend mal, surtout dans le bruit. Souvent négligée, elle retentit sur la communication et le lien social, mais se corrige bien." },
  { q: "Pourquoi ne pas négliger une baisse d'audition ?", a: "Parce qu'une audition non corrigée favorise l'isolement, la baisse de moral et pourrait accélérer le déclin cognitif. La prendre en charge (bilan, aides auditives) améliore nettement la qualité de vie et le maintien du lien social." },
  { q: "Les aides auditives sont-elles efficaces ?", a: "Oui, bien réglées et adaptées, elles compensent efficacement la perte auditive et améliorent la compréhension, surtout dans le bruit. Un bilan auditif (audiogramme) permet de confirmer la perte et d'orienter vers la solution adaptée." },
  { q: "Quand une baisse d'audition est-elle urgente ?", a: "Une baisse d'audition brutale, survenant d'un seul côté, ou accompagnée de vertiges ou de douleur, doit faire consulter rapidement : ce n'est pas la presbyacousie habituelle et cela peut nécessiter une prise en charge urgente." },
  { q: "Un bouchon de cérumen peut-il faire baisser l'audition ?", a: "Oui, un simple bouchon de cérumen peut réduire l'audition et se traite facilement. C'est l'une des causes à rechercher devant une baisse d'audition, avant de conclure à une presbyacousie. Le médecin fait la part des choses." },
];
const auditionTk = [
  "La presbyacousie (baisse d'audition avec l'âge) est fréquente et souvent négligée.",
  "On entend mais on comprend mal, surtout dans le bruit.",
  "Non corrigée, elle favorise isolement et baisse de moral.",
  "Bilan auditif et aides auditives la compensent bien ; baisse brutale = urgence.",
];

const cVueSenior = `<p>La vue évolue avec l'âge. Plusieurs troubles fréquents peuvent réduire la vision des seniors, mais beaucoup se traitent ou se corrigent. Un suivi ophtalmologique régulier permet de dépister et d'agir tôt.</p>

<h2>Les troubles fréquents</h2>
<ul>
<li><strong>Presbytie</strong> : difficulté à voir de près (corrigée par des lunettes).</li>
<li><strong>Cataracte</strong> : opacification du cristallin, très fréquente, opérable avec d'excellents résultats.</li>
<li><strong>DMLA</strong> : atteinte de la rétine liée à l'âge, affectant la vision centrale.</li>
<li><strong>Glaucome</strong> : atteinte du nerf optique, souvent liée à une pression élevée, silencieuse au début.</li>
</ul>

<h2>Le rôle des maladies générales</h2>
<p>Le <a href="/blog/diabete-type-2-maroc">diabète</a> et l'<a href="/blog/hypertension-arterielle-maroc">hypertension</a> peuvent abîmer la rétine : un <a href="/blog/fond-d-oeil-maroc">fond d'œil</a> régulier est important chez les personnes concernées.</p>

<h2>Que faire ?</h2>
<p>Un suivi ophtalmologique régulier permet de dépister glaucome, DMLA et cataracte, souvent silencieux au début. Beaucoup de troubles se corrigent (lunettes, chirurgie) ou se stabilisent s'ils sont pris à temps.</p>

<blockquote>Attention : une baisse de vue brutale, un voile, des éclairs ou une douleur oculaire imposent de consulter en urgence.</blockquote>

<hr>
<p>Votre vue baisse ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const vueSeniorFaq = [
  { q: "Quels sont les troubles de la vue fréquents chez le senior ?", a: "La presbytie (difficulté à voir de près), la cataracte (opacification du cristallin, opérable), la DMLA (atteinte de la rétine affectant la vision centrale) et le glaucome (atteinte du nerf optique, souvent silencieuse au début). Beaucoup se traitent ou se corrigent." },
  { q: "La cataracte se soigne-t-elle ?", a: "Oui, très bien : la chirurgie de la cataracte, courante, remplace le cristallin opacifié et donne d'excellents résultats sur la vision. Elle est proposée quand la gêne visuelle devient importante, après un bilan ophtalmologique." },
  { q: "Pourquoi les diabétiques et hypertendus doivent-ils surveiller leurs yeux ?", a: "Parce que le diabète et l'hypertension peuvent abîmer la rétine (rétinopathie), souvent sans symptôme au début. Un fond d'œil régulier permet de dépister ces atteintes tôt et de les traiter avant qu'elles ne menacent la vue." },
  { q: "Le glaucome est-il dangereux ?", a: "Le glaucome abîme progressivement le nerf optique, souvent sans symptôme au début, et peut mener à une perte de vision irréversible s'il n'est pas dépisté et traité. Un suivi ophtalmologique régulier permet de le repérer tôt." },
  { q: "Quand consulter en urgence pour un problème de vue ?", a: "En cas de baisse de vue brutale, de voile devant l'œil, d'éclairs lumineux ou de douleur oculaire. Ces signes imposent de consulter en urgence, car ils peuvent traduire une atteinte nécessitant une prise en charge rapide." },
];
const vueSeniorTk = [
  "Troubles fréquents du senior : presbytie, cataracte, DMLA, glaucome.",
  "Cataracte opérable avec d'excellents résultats ; glaucome souvent silencieux.",
  "Diabète et hypertension abîment la rétine : fond d'œil régulier.",
  "Baisse de vue brutale, voile ou douleur oculaire = urgence.",
];

const cVaccinSenior = `<p>La vaccination ne concerne pas que les enfants : elle protège aussi les seniors, dont les défenses immunitaires baissent avec l'âge. Certains vaccins sont particulièrement recommandés après 65 ans.</p>

<h2>Pourquoi vacciner les seniors ?</h2>
<p>Avec l'âge, les infections sont plus fréquentes et plus graves. La vaccination réduit le risque de formes sévères, d'hospitalisation et de complications.</p>

<h2>Les vaccins recommandés</h2>
<ul>
<li><strong>Grippe saisonnière</strong> : chaque année.</li>
<li><strong>Pneumocoque</strong> : contre les infections pulmonaires graves, selon les recommandations.</li>
<li><strong><a href="/blog/vaccin-zona-maroc">Zona</a></strong> : pour réduire le risque de zona et de douleurs persistantes.</li>
<li>Rappels (tétanos, diphtérie…) à tenir à jour.</li>
</ul>

<h2>En pratique</h2>
<p>Les recommandations et la disponibilité peuvent évoluer et dépendre de l'état de santé. Votre médecin établit le calendrier vaccinal adapté à votre situation, en tenant compte de vos maladies chroniques.</p>

<hr>
<p>Vos vaccins sont-ils à jour ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const vaccinSeniorFaq = [
  { q: "Quels vaccins sont recommandés après 65 ans ?", a: "La grippe saisonnière chaque année, le pneumocoque contre les infections pulmonaires graves, le zona pour réduire ce risque et ses douleurs, ainsi que les rappels (tétanos, diphtérie…) à tenir à jour. Le médecin adapte selon l'état de santé." },
  { q: "Pourquoi vacciner les personnes âgées ?", a: "Parce que les défenses immunitaires baissent avec l'âge et que les infections sont alors plus fréquentes et plus graves. La vaccination réduit le risque de formes sévères, d'hospitalisation et de complications chez le senior." },
  { q: "Le vaccin contre la grippe est-il utile chaque année ?", a: "Oui, le vaccin contre la grippe se refait chaque année car les virus circulants changent et la protection diminue avec le temps. Il est particulièrement recommandé aux seniors et aux personnes atteintes de maladies chroniques." },
  { q: "Le vaccin contre le zona est-il recommandé aux seniors ?", a: "Oui, il est surtout recommandé chez la personne âgée pour réduire le risque de zona et de douleurs persistantes (post-zostériennes), souvent invalidantes. Votre médecin évalue s'il vous est indiqué selon votre situation." },
  { q: "Les vaccins sont-ils sûrs chez la personne âgée ?", a: "Oui, les vaccins recommandés sont sûrs et bien évalués. Ils peuvent entraîner des réactions locales passagères. Certaines situations d'immunité affaiblie nécessitent un avis : le médecin adapte le calendrier vaccinal à chaque personne." },
];
const vaccinSeniorTk = [
  "La vaccination protège aussi les seniors (défenses immunitaires en baisse).",
  "Recommandés : grippe (chaque année), pneumocoque, zona, rappels à jour.",
  "Elle réduit les formes graves et les hospitalisations.",
  "Le médecin adapte le calendrier selon l'état de santé.",
];

const cIsolement = `<p>L'isolement social est fréquent chez les personnes âgées et pèse sur la santé physique et mentale. Souvent invisible, il mérite d'être repéré, car maintenir le lien social protège le moral, la mémoire et l'autonomie.</p>

<h2>Pourquoi c'est un enjeu de santé</h2>
<p>La solitude prolongée augmente le risque de <a href="/blog/depression-maroc">dépression</a>, d'anxiété, de déclin cognitif et de perte d'<a href="/blog/autonomie-dependance-senior-maroc">autonomie</a>. Elle est aussi liée à une moins bonne santé physique.</p>

<h2>Repérer les signes</h2>
<ul>
<li>Repli sur soi, perte d'intérêt, tristesse</li>
<li>Négligence de soi ou du domicile, perte d'appétit</li>
<li>Diminution des contacts et des sorties</li>
</ul>

<h2>Comment agir ?</h2>
<ul>
<li>Maintenir des contacts réguliers, encourager les activités et les sorties.</li>
<li>Solliciter la famille, le voisinage, les associations.</li>
<li>Prendre au sérieux une tristesse durable et en parler au médecin.</li>
</ul>

<blockquote>Attention : une tristesse persistante, une perte d'intérêt ou des idées noires chez une personne âgée ne sont pas « normales avec l'âge » : ce peut être une dépression, qui se soigne. Il faut consulter.</blockquote>

<hr>
<p>Un proche âgé qui s'isole ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const isolementFaq = [
  { q: "Pourquoi l'isolement est-il dangereux pour les seniors ?", a: "La solitude prolongée augmente le risque de dépression, d'anxiété, de déclin cognitif et de perte d'autonomie, et est liée à une moins bonne santé physique. Maintenir le lien social protège le moral, la mémoire et l'autonomie." },
  { q: "Comment repérer l'isolement chez une personne âgée ?", a: "Par un repli sur soi, une perte d'intérêt, de la tristesse, une négligence de soi ou du domicile, une perte d'appétit et une diminution des contacts et des sorties. Ces signes doivent alerter l'entourage et amener à agir." },
  { q: "La tristesse est-elle normale avec l'âge ?", a: "Non. Une tristesse persistante, une perte d'intérêt ou des idées noires ne sont pas « normales avec l'âge » : elles peuvent traduire une dépression, qui se soigne bien. Il ne faut pas les banaliser et il faut consulter." },
  { q: "Comment aider un proche âgé qui s'isole ?", a: "En maintenant des contacts réguliers, en encourageant les activités et les sorties, en sollicitant la famille, le voisinage et les associations, et en prenant au sérieux une tristesse durable pour en parler au médecin. La présence et l'écoute comptent beaucoup." },
  { q: "L'isolement peut-il favoriser la dépression ?", a: "Oui, l'isolement social est un facteur de risque important de dépression chez la personne âgée. À l'inverse, une dépression peut aussi entraîner un repli sur soi. Rompre l'isolement et consulter en cas de mal-être durable sont essentiels." },
];
const isolementTk = [
  "L'isolement social des seniors pèse sur la santé physique et mentale.",
  "Il augmente le risque de dépression, de déclin cognitif et de perte d'autonomie.",
  "Repérer : repli, perte d'intérêt, négligence de soi, moins de sorties.",
  "Une tristesse durable n'est pas normale avec l'âge : consulter.",
];

const cCanicule = `<p>Les personnes âgées sont particulièrement vulnérables à la chaleur et à la déshydratation, surtout lors des fortes chaleurs de l'été marocain. Quelques précautions simples permettent de les protéger.</p>

<h2>Pourquoi les seniors sont plus à risque</h2>
<p>Avec l'âge, la sensation de <strong>soif diminue</strong> et le corps régule moins bien sa température. Certaines maladies et médicaments (diurétiques) augmentent encore le risque de déshydratation et de coup de chaleur.</p>

<h2>Les gestes de prévention</h2>
<ul>
<li><strong>Boire régulièrement</strong>, sans attendre d'avoir soif ; proposer de l'eau souvent.</li>
<li>Rester au frais aux heures chaudes, aérer aux heures fraîches, se rafraîchir (linge humide).</li>
<li>Manger des aliments riches en eau (fruits, légumes, soupes).</li>
<li>Éviter les efforts et les sorties aux heures les plus chaudes.</li>
</ul>

<h2>Reconnaître la déshydratation et le coup de chaleur</h2>
<blockquote>Attention : bouche sèche, urines rares et foncées, faiblesse, vertiges, confusion, fièvre avec peau chaude — surtout par forte chaleur — imposent de rafraîchir, faire boire et consulter, voire d'appeler les secours en cas de malaise ou de confusion.</blockquote>

<hr>
<p>Protégez vos proches âgés de la chaleur. Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const caniculeFaq = [
  { q: "Pourquoi les personnes âgées se déshydratent-elles plus facilement ?", a: "Parce qu'avec l'âge la sensation de soif diminue et le corps régule moins bien sa température. Certaines maladies et médicaments (comme les diurétiques) augmentent encore le risque de déshydratation et de coup de chaleur, surtout par forte chaleur." },
  { q: "Comment protéger un senior de la canicule ?", a: "En le faisant boire régulièrement sans attendre la soif, en le gardant au frais aux heures chaudes, en aérant aux heures fraîches, en le rafraîchissant (linge humide), en proposant des aliments riches en eau et en évitant les efforts aux heures les plus chaudes." },
  { q: "Quels sont les signes de déshydratation chez la personne âgée ?", a: "Bouche sèche, urines rares et foncées, faiblesse, vertiges, confusion, et parfois fièvre avec peau chaude. Ces signes, surtout par forte chaleur, imposent de rafraîchir, de faire boire et de consulter, voire d'appeler les secours si malaise ou confusion." },
  { q: "Combien un senior doit-il boire par temps chaud ?", a: "Il doit boire régulièrement tout au long de la journée, même sans soif, en augmentant les apports par forte chaleur. L'eau est la meilleure boisson ; les aliments riches en eau (fruits, légumes, soupes) complètent les apports. Le médecin adapte en cas de maladie particulière." },
  { q: "Quand la chaleur devient-elle une urgence chez le senior ?", a: "En cas de confusion, de malaise, d'une forte fièvre avec peau chaude et sèche (coup de chaleur), ou de signes de déshydratation sévère. Il faut alors rafraîchir la personne, la faire boire si elle est consciente et appeler les secours." },
];
const caniculeTk = [
  "Les seniors sont vulnérables à la chaleur (soif diminuée, régulation moins bonne).",
  "Prévention : boire régulièrement sans attendre la soif, rester au frais.",
  "Signes : bouche sèche, urines foncées, faiblesse, confusion.",
  "Confusion, malaise ou coup de chaleur = appeler les secours.",
];

// ─────────────────────────────────────────────────────────────────────────────
const GROUPS = [
  { pillarSlug: "prevention-sante-guide-maroc", categorySlug: "prevention-sante", items: [
    { slug:"prevention-cardiovasculaire-maroc", aboutEntity:"Prévention cardiovasculaire", title:"Prévenir les maladies du cœur : les gestes qui comptent", excerpt:"Prévenir infarctus et AVC : contrôler tension, diabète et cholestérol, arrêter le tabac, bouger et bien manger. Les gestes qui protègent le cœur, adaptés au Maroc.", metaTitle:"Prévenir les maladies cardiovasculaires | Maroc", metaDesc:"Prévention cardiovasculaire : contrôler tension, diabète, cholestérol, arrêter le tabac, bouger et manger équilibré pour éviter infarctus et AVC. Adapté au Maroc.", readingTime:4, content:cCardio, keyTakeaways:cardioTk, faq:cardioFaq },
    { slug:"prevention-diabete-maroc", aboutEntity:"Prévention du diabète", title:"Prévenir le diabète de type 2", excerpt:"Prévenir le diabète de type 2 : qui est à risque, les leviers (poids, activité, alimentation) et l'intérêt de dépister le prédiabète. Un guide adapté au Maroc.", metaTitle:"Prévenir le diabète de type 2 | Maroc", metaDesc:"Prévenir le diabète de type 2 : facteurs de risque, perte de poids, activité physique, alimentation et dépistage du prédiabète. Une maladie en grande partie évitable, au Maroc.", readingTime:4, content:cPrevDiab, keyTakeaways:prevDiabTk, faq:prevDiabFaq },
    { slug:"depistages-par-age-maroc", aboutEntity:"Dépistage", title:"Quels dépistages faire et à quel âge ?", excerpt:"Dépistages recommandés selon l'âge et le sexe : tension, glycémie, cholestérol, cancers du sein, du col et colorectal. Les repères pour ne rien oublier, au Maroc.", metaTitle:"Quels dépistages faire et à quel âge ? | Maroc", metaDesc:"Dépistages selon l'âge : tension, glycémie, cholestérol, cancers du sein, du col et colorectal. Les grands repères pour se faire dépister au bon moment, au Maroc.", readingTime:4, content:cDepistages, keyTakeaways:depistagesTk, faq:depistagesFaq },
    { slug:"hygiene-du-sommeil-maroc", aboutEntity:"Hygiène du sommeil", title:"Bien dormir : les règles d'un bon sommeil", excerpt:"Hygiène du sommeil : pourquoi bien dormir compte, les règles pour des nuits réparatrices sans médicament, et quand consulter. Un guide clair adapté au Maroc.", metaTitle:"Bien dormir : les règles d'un bon sommeil | Maroc", metaDesc:"Hygiène du sommeil : pourquoi le sommeil compte, les règles pour mieux dormir sans médicament (horaires, écrans, chambre) et quand consulter. Guide clair adapté au Maroc.", readingTime:4, content:cSommeil, keyTakeaways:sommeilTk, faq:sommeilFaq },
    { slug:"gerer-son-stress-maroc", aboutEntity:"Gestion du stress", title:"Gérer son stress au quotidien", excerpt:"Gérer son stress : quand il devient un problème, les moyens efficaces pour le réduire et quand demander de l'aide. Un guide clair adapté au Maroc.", metaTitle:"Gérer son stress au quotidien | Maroc", metaDesc:"Gérer son stress : effets du stress chronique, moyens efficaces (activité, sommeil, relaxation, lien social) et quand demander de l'aide. Guide clair adapté au Maroc.", readingTime:4, content:cStress, keyTakeaways:stressTk, faq:stressFaq },
    { slug:"prevention-cancer-mode-de-vie-maroc", aboutEntity:"Prévention des cancers", title:"Réduire son risque de cancer par le mode de vie", excerpt:"Réduire son risque de cancer : tabac, alcool, alimentation, activité, soleil, vaccins (HPV, hépatite B) et dépistages. Prévention et dépistage vont de pair, au Maroc.", metaTitle:"Réduire son risque de cancer : mode de vie | Maroc", metaDesc:"Prévention des cancers par le mode de vie : ne pas fumer, limiter l'alcool, manger équilibré, bouger, se protéger du soleil, vaccins HPV et hépatite B, et dépistages. Adapté au Maroc.", readingTime:4, content:cPrevCancer, keyTakeaways:prevCancerTk, faq:prevCancerFaq },
  ]},
  { pillarSlug: "sante-femme-guide-maroc", categorySlug: "sante-femme", items: [
    { slug:"regles-douloureuses-maroc", aboutEntity:"Dysménorrhée", title:"Règles douloureuses : causes et solutions", excerpt:"Règles douloureuses : pourquoi elles font mal, comment les soulager et quand consulter (endométriose). Ne pas subir ses règles, un guide adapté au Maroc.", metaTitle:"Règles douloureuses : causes et solutions | Maroc", metaDesc:"Règles douloureuses (dysménorrhée) : causes, comment les soulager (chaleur, antalgiques, contraception) et quand consulter, notamment pour l'endométriose. Adapté au Maroc.", readingTime:4, content:cRegles, keyTakeaways:reglesTk, faq:reglesFaq },
    { slug:"allaitement-maroc", aboutEntity:"Allaitement maternel", title:"Allaitement maternel : bienfaits et conseils", excerpt:"Allaitement maternel : bienfaits, comment bien démarrer, surmonter les difficultés (crevasses, engorgement) et quand consulter. Un guide adapté au Maroc.", metaTitle:"Allaitement maternel : bienfaits et conseils | Maroc", metaDesc:"Allaitement maternel : bienfaits pour bébé et mère, bien démarrer, surmonter les difficultés (crevasses, engorgement, mastite) et médicaments. Guide adapté au Maroc.", readingTime:4, content:cAllaitement, keyTakeaways:allaitementTk, faq:allaitementFaq },
    { slug:"suivi-gynecologique-maroc", aboutEntity:"Suivi gynécologique", title:"Suivi gynécologique : pourquoi et à quelle fréquence", excerpt:"Suivi gynécologique : pourquoi consulter régulièrement, à quelle fréquence et ce qui se passe lors de la consultation. Un guide clair adapté au Maroc.", metaTitle:"Suivi gynécologique : pourquoi et à quelle fréquence | Maroc", metaDesc:"Suivi gynécologique : intérêt d'un suivi régulier (dépistages, contraception, ménopause), fréquence et déroulé de la consultation. Guide clair adapté au Maroc.", readingTime:4, content:cSuiviGyneco, keyTakeaways:suiviGynecoTk, faq:suiviGynecoFaq },
    { slug:"endometriose-maroc", aboutEntity:"Endométriose", title:"Endométriose : reconnaître et prendre en charge", excerpt:"Endométriose : ce que c'est, ses symptômes (règles très douloureuses), pourquoi le diagnostic est souvent tardif et comment elle se prend en charge. Adapté au Maroc.", metaTitle:"Endométriose : symptômes et prise en charge | Maroc", metaDesc:"Endométriose : définition, symptômes (règles très douloureuses, douleurs pelviennes, infertilité), diagnostic souvent tardif et prise en charge. Guide clair adapté au Maroc.", readingTime:4, content:cEndometriose, keyTakeaways:endometrioseTk, faq:endometrioseFaq },
    { slug:"syndrome-ovaires-polykystiques-sopk-maroc", aboutEntity:"Syndrome des ovaires polykystiques", title:"SOPK (ovaires polykystiques) : symptômes et prise en charge", excerpt:"SOPK : trouble hormonal fréquent, signes (règles irrégulières, acné, fertilité), lien avec le diabète et prise en charge. Un guide clair adapté au Maroc.", metaTitle:"SOPK (ovaires polykystiques) : symptômes et solutions | Maroc", metaDesc:"Syndrome des ovaires polykystiques (SOPK) : symptômes (règles irrégulières, acné, difficultés à concevoir), lien avec le diabète et prise en charge. Adapté au Maroc.", readingTime:4, content:cSopk, keyTakeaways:sopkTk, faq:sopkFaq },
    { slug:"mycose-vaginale-infections-maroc", aboutEntity:"Infection vaginale", title:"Mycoses et infections vaginales : que faire ?", excerpt:"Mycoses et infections vaginales : reconnaître, ce qui les favorise, quand un traitement suffit et quand consulter. Ne pas s'auto-traiter à tort, adapté au Maroc.", metaTitle:"Mycoses et infections vaginales : que faire ? | Maroc", metaDesc:"Mycoses et infections vaginales : reconnaître (démangeaisons, pertes), facteurs favorisants, quand un traitement local suffit et quand consulter. Guide clair adapté au Maroc.", readingTime:4, content:cMycose, keyTakeaways:mycoseTk, faq:mycoseFaq },
  ]},
  { pillarSlug: null, categorySlug: "sante-senior", items: [
    { slug:"polymedication-senior-maroc", aboutEntity:"Polymédication", title:"Plusieurs médicaments : bien gérer son traitement au grand âge", excerpt:"Polymédication du senior : risques de plusieurs médicaments, bons réflexes (liste, révision, pilulier) et médicaments à surveiller. Un guide clair adapté au Maroc.", metaTitle:"Plusieurs médicaments chez le senior : bien gérer | Maroc", metaDesc:"Polymédication du senior : risques d'interactions et d'effets, bons réflexes (liste à jour, révision, pilulier) et médicaments à surveiller (AINS, somnifères). Adapté au Maroc.", readingTime:4, content:cPolymed, keyTakeaways:polymedTk, faq:polymedFaq },
    { slug:"audition-presbyacousie-senior-maroc", aboutEntity:"Presbyacousie", title:"Baisse d'audition du senior : ne pas la négliger", excerpt:"Presbyacousie : la baisse d'audition liée à l'âge, pourquoi ne pas attendre, le bilan auditif et les aides auditives. Un guide clair adapté au Maroc.", metaTitle:"Baisse d'audition du senior (presbyacousie) | Maroc", metaDesc:"Presbyacousie : baisse d'audition liée à l'âge, retentissement sur le lien social, bilan auditif, aides auditives et signes d'urgence. Guide clair adapté au Maroc.", readingTime:4, content:cAudition, keyTakeaways:auditionTk, faq:auditionFaq },
    { slug:"vue-senior-maroc", aboutEntity:"Troubles de la vision", title:"La vue après 60 ans : troubles fréquents et suivi", excerpt:"Vue du senior : presbytie, cataracte, DMLA, glaucome, rôle du diabète et de l'hypertension, et importance du suivi. Un guide clair adapté au Maroc.", metaTitle:"La vue après 60 ans : troubles et suivi | Maroc", metaDesc:"Vue du senior : presbytie, cataracte (opérable), DMLA, glaucome, rôle du diabète et de l'hypertension, suivi ophtalmologique et signes d'urgence. Adapté au Maroc.", readingTime:4, content:cVueSenior, keyTakeaways:vueSeniorTk, faq:vueSeniorFaq },
    { slug:"vaccination-senior-maroc", aboutEntity:"Vaccination du senior", title:"Vaccins du senior : lesquels et pourquoi", excerpt:"Vaccination du senior : pourquoi elle protège, les vaccins recommandés (grippe, pneumocoque, zona, rappels) et comment tenir son calendrier à jour. Adapté au Maroc.", metaTitle:"Vaccins du senior : lesquels et pourquoi | Maroc", metaDesc:"Vaccination du senior : grippe, pneumocoque, zona et rappels, pourquoi vacciner après 65 ans et comment tenir son calendrier à jour selon l'état de santé. Adapté au Maroc.", readingTime:4, content:cVaccinSenior, keyTakeaways:vaccinSeniorTk, faq:vaccinSeniorFaq },
    { slug:"isolement-moral-senior-maroc", aboutEntity:"Isolement social", title:"Isolement et moral du senior : repérer et agir", excerpt:"Isolement de la personne âgée : pourquoi c'est un enjeu de santé, repérer les signes, agir, et ne pas banaliser une tristesse durable. Un guide adapté au Maroc.", metaTitle:"Isolement et moral du senior : repérer et agir | Maroc", metaDesc:"Isolement de la personne âgée : risques (dépression, déclin cognitif), signes à repérer, comment agir et pourquoi une tristesse durable n'est pas normale avec l'âge. Adapté au Maroc.", readingTime:4, content:cIsolement, keyTakeaways:isolementTk, faq:isolementFaq },
    { slug:"deshydratation-canicule-senior-maroc", aboutEntity:"Déshydratation", title:"Chaleur et déshydratation du senior : prévenir le coup de chaleur", excerpt:"Personnes âgées et chaleur : pourquoi elles sont vulnérables, les gestes de prévention et reconnaître la déshydratation et le coup de chaleur. Adapté au Maroc.", metaTitle:"Chaleur et déshydratation du senior : prévenir | Maroc", metaDesc:"Seniors et canicule : pourquoi ils sont vulnérables, gestes de prévention (boire, rester au frais) et reconnaître la déshydratation et le coup de chaleur. Adapté au Maroc.", readingTime:4, content:cCanicule, keyTakeaways:caniculeTk, faq:caniculeFaq },
  ]},
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cats = await prisma.postCategory.findMany({ select: { id: true, slug: true } });
  const catId = (s) => { const c = cats.find(x=>x.slug===s); if(!c) throw new Error("cat "+s); return c.id; };
  const now = new Date();
  let total = 0;
  for (const g of GROUPS) {
    let pid = null;
    if (g.pillarSlug) { const p = await prisma.post.findUnique({ where:{slug:g.pillarSlug}, select:{id:true} }); pid = p ? p.id : null; }
    console.log(`\n[${g.categorySlug}]${g.pillarSlug?" → pilier "+g.pillarSlug:""}`);
    for (const art of g.items) {
      const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:catId(g.categorySlug), metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, pillarId:pid, reviewedById:admin.id, reviewedAt:now };
      const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
      console.log(`  ✓ ${post.slug}`); total++;
    }
  }
  console.log(`\nTotal : ${total} fiches publiées.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
