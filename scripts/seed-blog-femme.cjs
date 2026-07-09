require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 2 — Cocon « Santé de la femme » (audience patient).
// Catégorie existante `sante-femme` (intro/FAQ déjà dans blog-category-content).
// Pilier « guide à chaque âge » + satellites (grossesse, ménopause, contraception,
// cancer du col, infertilité/PMA) + intégration de l'article cancer du sein
// existant. Tous → gynéco-obstétrique. Idempotent (upsert par slug).
// `aboutEntity` renseigné uniquement pour de vraies pathologies (ménopause,
// cancers, infertilité) ; null pour les processus (suivi grossesse, contraception).
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY_SLUG = "sante-femme";

// ─── Pilier ───────────────────────────────────────────────────────────────────
const cPilier = `<p>La santé de la femme évolue à chaque étape de la vie : adolescence, vie adulte, grossesse, ménopause. À chaque âge, des examens et un suivi adaptés permettent de prévenir, dépister tôt et vivre sereinement. Ce guide fait le tour de l'essentiel pour prendre soin de soi en confiance, au Maroc.</p>

<h2>Pourquoi un suivi gynécologique régulier ?</h2>
<p>Même en l'absence de symptôme, une consultation gynécologique régulière permet de dépister précocement des affections fréquentes (cancers du sein et du col, infections), d'accompagner la contraception, la grossesse et la ménopause. Un suivi annuel est recommandé, et plus rapproché en cas de grossesse, de symptômes ou d'antécédents.</p>

<h2>Le suivi selon l'âge</h2>
<table>
<thead><tr><th>Âge</th><th>Points d'attention</th></tr></thead>
<tbody>
<tr><td>Adolescence</td><td>Règles, information, vaccination HPV</td></tr>
<tr><td>20–40 ans</td><td>Contraception, frottis de dépistage, suivi de grossesse</td></tr>
<tr><td>40–50 ans</td><td>Mammographie de dépistage, surveillance du col</td></tr>
<tr><td>50 ans et +</td><td>Ménopause, dépistage des cancers, santé osseuse</td></tr>
</tbody>
</table>

<h2>La contraception</h2>
<p>De nombreuses méthodes existent (pilule, stérilet, implant, préservatif…). Le bon choix dépend de votre âge, de votre santé et de votre mode de vie. Un médecin vous aide à trouver la méthode la plus adaptée et la mieux tolérée.</p>

<h2>La grossesse et le suivi prénatal</h2>
<p>Une grossesse bien suivie réduit nettement les risques pour la mère et l'enfant. Le suivi prénatal comprend des consultations mensuelles, des échographies et des analyses, selon un calendrier précis.</p>

<h2>Les dépistages essentiels</h2>
<ul>
<li><strong>Cancer du sein</strong> : autopalpation, examen clinique et mammographie de dépistage dès 40 ans.</li>
<li><strong>Cancer du col de l'utérus</strong> : frottis régulier, prévenu par la vaccination HPV.</li>
</ul>
<p>Au Maroc, des campagnes comme <strong>Octobre Rose</strong> facilitent l'accès au dépistage du cancer du sein.</p>

<h2>La ménopause</h2>
<p>Étape naturelle survenant généralement autour de la cinquantaine, la ménopause peut s'accompagner de symptômes (bouffées de chaleur, troubles du sommeil). Des solutions existent pour les soulager et préserver la santé osseuse et cardiovasculaire.</p>

<hr>
<p>À chaque étape, un gynécologue vous accompagne. Trouvez un praticien près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

// ─── Satellite : suivi de grossesse ──────────────────────────────────────────
const cGrossesse = `<p>Un suivi de grossesse régulier est la meilleure protection pour la mère et le bébé. Au Maroc, il s'organise autour de consultations mensuelles, de trois échographies et d'analyses à des moments clés. Voici le calendrier à connaître.</p>

<h2>Quand consulter pour la première fois ?</h2>
<p>Dès que la grossesse est confirmée, idéalement avant la fin du 3e mois. Cette première consultation permet de dater la grossesse, de prescrire les premières analyses et de donner les conseils essentiels (acide folique, hygiène de vie).</p>

<h2>Le calendrier du suivi prénatal</h2>
<table>
<thead><tr><th>Période</th><th>Examens clés</th></tr></thead>
<tbody>
<tr><td>1er trimestre</td><td>1re consultation, échographie de datation (vers 12 SA), bilan sanguin</td></tr>
<tr><td>2e trimestre</td><td>Échographie morphologique (vers 22 SA), dépistage du diabète gestationnel</td></tr>
<tr><td>3e trimestre</td><td>Échographie de croissance (vers 32 SA), consultations rapprochées, préparation à l'accouchement</td></tr>
</tbody>
</table>
<p>Une consultation par mois est recommandée, plus rapprochée en fin de grossesse.</p>

<h2>Les examens importants</h2>
<ul>
<li><strong>Échographies</strong> : trois au minimum (datation, morphologie, croissance)</li>
<li><strong>Analyses de sang</strong> : groupe sanguin, glycémie, sérologies</li>
<li><strong>Dépistage du diabète gestationnel</strong>, fréquent et important à contrôler</li>
<li><strong>Tension artérielle et poids</strong> à chaque consultation</li>
</ul>

<h2>Les signes qui imposent de consulter sans attendre</h2>
<ul>
<li>Saignements ou pertes de liquide</li>
<li>Maux de tête violents, troubles de la vision, gonflement brutal</li>
<li>Fièvre, douleurs abdominales intenses</li>
<li>Diminution nette des mouvements du bébé</li>
</ul>

<h2>Hygiène de vie pendant la grossesse</h2>
<p>Alimentation équilibrée, supplémentation prescrite (acide folique, fer si besoin), arrêt du tabac et de l'alcool, activité physique douce. Évitez l'automédication : demandez toujours l'avis d'un professionnel.</p>

<hr>
<p>Pour un suivi serein, prenez rendez-vous en ligne avec un gynécologue près de chez vous.</p>`;

// ─── Satellite : ménopause ───────────────────────────────────────────────────
const cMenopause = `<p>La ménopause est l'arrêt définitif des règles, marquant la fin de la période de fertilité. C'est une étape naturelle, généralement vers 50 ans, qui peut s'accompagner de symptômes gênants — pour lesquels des solutions existent.</p>

<h2>À quel âge survient la ménopause ?</h2>
<p>Le plus souvent entre 45 et 55 ans, avec une moyenne autour de 50 ans. On parle de ménopause confirmée après 12 mois consécutifs sans règles. La période de transition qui la précède (préménopause) peut durer plusieurs années.</p>

<h2>Les symptômes les plus fréquents</h2>
<ul>
<li><strong>Bouffées de chaleur</strong> et sueurs nocturnes</li>
<li><strong>Troubles du sommeil</strong> et de l'humeur</li>
<li><strong>Sécheresse</strong> et inconfort intime</li>
<li>Règles irrégulières pendant la transition</li>
</ul>
<p>L'intensité varie beaucoup d'une femme à l'autre : certaines ne ressentent presque rien.</p>

<h2>Quelles solutions pour soulager ?</h2>
<p>Selon les symptômes et les antécédents, plusieurs options existent : mesures d'hygiène de vie (activité physique, alimentation, gestion du stress), traitements locaux pour l'inconfort intime, et, dans certains cas, un <strong>traitement hormonal de la ménopause</strong> prescrit et surveillé par un médecin. Ce traitement n'est pas systématique : il se discute au cas par cas.</p>

<h2>Préserver sa santé après la ménopause</h2>
<p>La baisse des œstrogènes augmente le risque d'<strong>ostéoporose</strong> (fragilité osseuse) et de maladies cardiovasculaires. Les bons réflexes :</p>
<ul>
<li>Activité physique régulière (marche, renforcement)</li>
<li>Apports suffisants en calcium et vitamine D</li>
<li>Surveillance de la tension, du cholestérol et de la glycémie</li>
<li>Poursuite des dépistages (sein, col)</li>
</ul>

<h2>Quand consulter ?</h2>
<p>Si les symptômes altèrent votre qualité de vie, ou en cas de saignements après la ménopause confirmée — ce dernier signe doit toujours amener à consulter rapidement.</p>

<hr>
<p>Un gynécologue vous aide à traverser cette étape sereinement. Prenez rendez-vous en ligne près de chez vous.</p>`;

// ─── Satellite : contraception ───────────────────────────────────────────────
const cContraception = `<p>Choisir sa contraception, c'est trouver la méthode la plus adaptée à sa santé, son âge et son mode de vie. Au Maroc, plusieurs méthodes sont disponibles et accessibles. Tour d'horizon pour décider en connaissance de cause, avec votre médecin.</p>

<h2>Les principales méthodes</h2>
<table>
<thead><tr><th>Méthode</th><th>Principe</th><th>À savoir</th></tr></thead>
<tbody>
<tr><td>Pilule</td><td>Hormonale, prise quotidienne</td><td>Efficace si bien suivie ; nécessite une prescription</td></tr>
<tr><td>Stérilet (DIU)</td><td>Dispositif intra-utérin, longue durée</td><td>Plusieurs années ; hormonal ou au cuivre</td></tr>
<tr><td>Implant</td><td>Bâtonnet sous la peau, hormonal</td><td>Jusqu'à 3 ans, sans geste quotidien</td></tr>
<tr><td>Préservatif</td><td>Barrière</td><td>Seule méthode protégeant aussi des IST</td></tr>
<tr><td>Injection / patch / anneau</td><td>Hormonale</td><td>Selon disponibilité et avis médical</td></tr>
</tbody>
</table>

<h2>Comment choisir ?</h2>
<p>Le bon choix dépend de plusieurs facteurs : votre âge, le tabagisme, vos antécédents médicaux (migraines, tension, phlébite), votre désir de grossesse à court terme et votre confort au quotidien. Une méthode parfaite pour une femme peut être déconseillée pour une autre.</p>

<h2>Contraception et tabac</h2>
<p>Associer pilule œstroprogestative et tabac augmente le risque cardiovasculaire, surtout après 35 ans. Signalez toujours votre tabagisme à votre médecin : il orientera vers une méthode plus sûre si besoin.</p>

<h2>La contraception d'urgence</h2>
<p>En cas de rapport non protégé ou d'oubli, la contraception d'urgence (« pilule du lendemain ») reste efficace si elle est prise rapidement. Disponible en pharmacie, elle ne remplace pas une contraception régulière.</p>

<h2>Protéger aussi des infections</h2>
<p>Seul le préservatif protège des infections sexuellement transmissibles. Il peut être associé à une autre méthode contraceptive pour une double protection.</p>

<hr>
<p>Pour choisir la contraception qui vous convient, consultez un gynécologue ou votre médecin. Prenez rendez-vous en ligne près de chez vous.</p>`;

// ─── Satellite : cancer du col ───────────────────────────────────────────────
const cCol = `<p>Le cancer du col de l'utérus est l'un des rares cancers que l'on peut <strong>prévenir et dépister efficacement</strong>. Grâce au frottis et à la vaccination contre le HPV, il est largement évitable. Voici l'essentiel à connaître.</p>

<h2>Qu'est-ce qui cause le cancer du col ?</h2>
<p>La quasi-totalité des cancers du col sont liés à une infection persistante par le <strong>papillomavirus humain (HPV)</strong>, très répandu et transmis lors des rapports. Dans la majorité des cas, l'infection disparaît seule ; c'est sa persistance qui peut, des années plus tard, évoluer vers des lésions précancéreuses.</p>

<h2>Le frottis : le dépistage clé</h2>
<p>Le frottis cervico-utérin prélève quelques cellules du col pour détecter des anomalies <strong>avant</strong> qu'elles ne deviennent un cancer. C'est un examen simple, rapide et indolore.</p>
<table>
<thead><tr><th>Quand ?</th><th>Recommandation générale</th></tr></thead>
<tbody>
<tr><td>Début</td><td>À partir de 25 ans (vie sexuelle active)</td></tr>
<tr><td>Rythme</td><td>Tous les 3 ans environ après deux frottis normaux</td></tr>
<tr><td>Adaptation</td><td>Selon l'âge et les résultats, sur avis médical</td></tr>
</tbody>
</table>

<h2>La vaccination HPV</h2>
<p>La vaccination contre le HPV, recommandée chez les jeunes filles avant le début de la vie sexuelle, prévient les infections responsables de la majorité des cancers du col. Elle ne dispense pas du frottis ultérieur.</p>

<h2>Les signes qui doivent alerter</h2>
<p>Les lésions précoces ne donnent aucun symptôme — d'où l'importance du dépistage. Plus tard peuvent apparaître : saignements après les rapports, entre les règles ou après la ménopause, pertes inhabituelles. Ces signes imposent une consultation.</p>

<h2>Prévention : les bons réflexes</h2>
<ul>
<li>Faire ses frottis de dépistage régulièrement</li>
<li>Envisager la vaccination HPV au bon âge</li>
<li>Utiliser le préservatif, qui réduit le risque de transmission</li>
<li>Ne pas fumer (le tabac favorise la persistance du HPV)</li>
</ul>

<hr>
<p>Le dépistage sauve des vies. Prenez rendez-vous en ligne avec un gynécologue près de chez vous pour votre frottis.</p>`;

// ─── Satellite : infertilité / PMA ───────────────────────────────────────────
const cInfertilite = `<p>Ne pas réussir à concevoir après un an d'essais est une situation fréquente, qui concerne aussi bien la femme que l'homme. Au Maroc, des solutions médicales existent. Comprendre le parcours aide à consulter au bon moment et à aborder la procréation médicalement assistée (PMA) sereinement.</p>

<h2>Quand parle-t-on d'infertilité ?</h2>
<p>On évoque une infertilité après <strong>12 mois de rapports réguliers sans contraception</strong> sans grossesse — ou après 6 mois passé 35 ans. Ce n'est pas synonyme de stérilité définitive : beaucoup de couples conçoivent après une prise en charge.</p>

<h2>Les causes possibles</h2>
<p>L'infertilité peut être d'origine féminine, masculine, ou mixte :</p>
<ul>
<li><strong>Chez la femme</strong> : troubles de l'ovulation, trompes obstruées, endométriose, âge</li>
<li><strong>Chez l'homme</strong> : anomalies du sperme (nombre, mobilité)</li>
<li><strong>Inexpliquée</strong> dans une partie des cas</li>
</ul>
<p>C'est pourquoi le bilan concerne <strong>les deux partenaires</strong>.</p>

<h2>Le bilan d'infertilité</h2>
<p>Il comprend généralement, chez la femme, un bilan hormonal et une échographie, l'évaluation des trompes, et chez l'homme un spermogramme. Ces examens orientent vers la cause et le traitement adapté.</p>

<h2>Les options de PMA</h2>
<table>
<thead><tr><th>Technique</th><th>Principe</th></tr></thead>
<tbody>
<tr><td>Stimulation ovarienne</td><td>Médicaments favorisant l'ovulation</td></tr>
<tr><td>Insémination (IIU)</td><td>Dépôt du sperme préparé dans l'utérus</td></tr>
<tr><td>Fécondation in vitro (FIV)</td><td>Fécondation en laboratoire, puis transfert d'embryon</td></tr>
</tbody>
</table>
<p>Au Maroc, plusieurs centres spécialisés proposent ces techniques. Le choix dépend de la cause, de l'âge et du bilan.</p>

<h2>Optimiser ses chances naturellement</h2>
<ul>
<li>Identifier la période d'ovulation</li>
<li>Adopter une hygiène de vie saine (poids, tabac, alcool)</li>
<li>Ne pas attendre trop longtemps pour consulter, surtout après 35 ans</li>
</ul>

<hr>
<p>Un gynécologue ou un spécialiste de la fertilité vous accompagne dans ce parcours. Prenez rendez-vous en ligne près de chez vous.</p>`;

const PILLAR = {
  title: "Santé de la femme au Maroc : le guide à chaque âge",
  slug: "sante-femme-guide-maroc",
  excerpt: "Suivi gynécologique, contraception, grossesse, dépistages et ménopause : le guide complet de la santé de la femme à chaque étape de la vie, au Maroc.",
  content: cPilier,
  aboutEntity: null,
  metaTitle: "Santé de la femme au Maroc : le guide à chaque âge",
  metaDesc: "Le guide de la santé de la femme au Maroc : suivi gynécologique, contraception, grossesse, dépistage des cancers du sein et du col, et ménopause, à chaque âge.",
  readingTime: 6,
  keyTakeaways: [
    "Un suivi gynécologique régulier dépiste tôt et accompagne chaque étape de la vie.",
    "Le suivi s'adapte à l'âge : contraception, grossesse, mammographie, ménopause.",
    "Deux dépistages clés : cancer du sein (mammographie) et du col (frottis + vaccin HPV).",
    "Un suivi annuel est recommandé, plus rapproché en cas de grossesse ou de symptômes.",
  ],
  faq: [
    { q: "À quelle fréquence consulter un gynécologue ?", a: "Un suivi gynécologique annuel est recommandé, et plus rapproché en cas de grossesse, de symptômes ou d'antécédents particuliers. Même sans symptôme, ce suivi permet de dépister précocement." },
    { q: "Quels dépistages sont importants pour la femme ?", a: "Le dépistage du cancer du sein (mammographie dès 40 ans) et du cancer du col de l'utérus (frottis régulier, prévenu par la vaccination HPV) sont les deux dépistages essentiels." },
  ],
};

const SATELLITES = [
  {
    title: "Suivi de grossesse au Maroc : les examens mois par mois",
    slug: "suivi-grossesse-maroc",
    excerpt: "Première consultation, calendrier des échographies, analyses, dépistage du diabète gestationnel et signes d'alerte : le guide du suivi prénatal au Maroc.",
    content: cGrossesse,
    aboutEntity: null,
    metaTitle: "Suivi de grossesse au Maroc : le calendrier des examens",
    metaDesc: "Le suivi de grossesse au Maroc mois par mois : première consultation, trois échographies, analyses, diabète gestationnel et signes qui imposent de consulter.",
    readingTime: 5,
    keyTakeaways: [
      "Consulter dès la confirmation, idéalement avant la fin du 3e mois.",
      "Trois échographies clés : datation, morphologie, croissance.",
      "Une consultation par mois, plus rapprochée en fin de grossesse.",
      "Saignements, maux de tête violents ou baisse des mouvements du bébé = consulter vite.",
    ],
    faq: [
      { q: "Quand faire sa première consultation de grossesse ?", a: "Dès que la grossesse est confirmée, idéalement avant la fin du 3e mois, pour dater la grossesse, prescrire les premières analyses et recevoir les conseils essentiels." },
      { q: "Combien d'échographies pendant la grossesse ?", a: "Au minimum trois : une de datation (vers 12 SA), une morphologique (vers 22 SA) et une de croissance (vers 32 SA), en plus des consultations mensuelles." },
    ],
  },
  {
    title: "Ménopause : symptômes, âge et solutions",
    slug: "menopause-symptomes-solutions-maroc",
    excerpt: "Âge, bouffées de chaleur, troubles du sommeil, solutions pour soulager et préserver sa santé osseuse : tout comprendre sur la ménopause.",
    content: cMenopause,
    aboutEntity: "Ménopause",
    metaTitle: "Ménopause : symptômes, âge et solutions | Maroc",
    metaDesc: "Ménopause : à quel âge, quels symptômes (bouffées de chaleur, sommeil), quelles solutions pour soulager et comment préserver sa santé osseuse et cardiovasculaire.",
    readingTime: 5,
    keyTakeaways: [
      "La ménopause survient le plus souvent entre 45 et 55 ans (moyenne ~50 ans).",
      "Symptômes fréquents : bouffées de chaleur, troubles du sommeil et de l'humeur.",
      "Des solutions existent ; le traitement hormonal se discute au cas par cas.",
      "Tout saignement après la ménopause confirmée impose de consulter rapidement.",
    ],
    faq: [
      { q: "À quel âge arrive la ménopause ?", a: "Le plus souvent entre 45 et 55 ans, avec une moyenne autour de 50 ans. On parle de ménopause confirmée après 12 mois consécutifs sans règles." },
      { q: "Comment soulager les symptômes de la ménopause ?", a: "Par l'hygiène de vie (activité physique, alimentation), des traitements locaux pour l'inconfort intime, et dans certains cas un traitement hormonal prescrit et surveillé par un médecin, qui n'est pas systématique." },
    ],
  },
  {
    title: "Contraception au Maroc : quelle méthode choisir ?",
    slug: "contraception-maroc-methodes",
    excerpt: "Pilule, stérilet, implant, préservatif : comparatif des méthodes de contraception, critères de choix, tabac et contraception d'urgence, au Maroc.",
    content: cContraception,
    aboutEntity: null,
    metaTitle: "Contraception au Maroc : quelle méthode choisir ?",
    metaDesc: "Quelle contraception choisir au Maroc ? Comparatif pilule, stérilet, implant, préservatif, critères de choix selon l'âge et la santé, tabac et pilule du lendemain.",
    readingTime: 5,
    keyTakeaways: [
      "Plusieurs méthodes : pilule, stérilet, implant, préservatif, injection/patch/anneau.",
      "Le bon choix dépend de l'âge, du tabac, des antécédents et du mode de vie.",
      "Pilule + tabac après 35 ans augmente le risque cardiovasculaire : à signaler au médecin.",
      "Seul le préservatif protège aussi des infections sexuellement transmissibles.",
    ],
    faq: [
      { q: "Quelle est la meilleure méthode de contraception ?", a: "Il n'y a pas de méthode universelle : le bon choix dépend de votre âge, de votre santé (tabac, tension, antécédents) et de votre mode de vie. Un médecin vous aide à trouver la mieux adaptée et tolérée." },
      { q: "La pilule du lendemain est-elle efficace ?", a: "Oui si elle est prise rapidement après un rapport non protégé. Disponible en pharmacie, elle dépanne mais ne remplace pas une contraception régulière." },
    ],
  },
  {
    title: "Cancer du col de l'utérus : se faire dépister par frottis",
    slug: "cancer-col-uterus-depistage-frottis-maroc",
    excerpt: "HPV, frottis, vaccination : le cancer du col est l'un des plus évitables. Quand se faire dépister, à quel rythme et comment le prévenir au Maroc.",
    content: cCol,
    aboutEntity: "Cancer du col de l'utérus",
    metaTitle: "Cancer du col de l'utérus : dépistage par frottis | Maroc",
    metaDesc: "Cancer du col de l'utérus : rôle du HPV, dépistage par frottis dès 25 ans, vaccination HPV, signes d'alerte et prévention. Un cancer largement évitable.",
    readingTime: 5,
    keyTakeaways: [
      "La quasi-totalité des cancers du col sont liés à une infection persistante au HPV.",
      "Le frottis détecte les anomalies avant le cancer : dès 25 ans, tous les 3 ans environ.",
      "La vaccination HPV avant la vie sexuelle prévient la majorité des cas.",
      "Les lésions précoces sont sans symptôme : le dépistage régulier est essentiel.",
    ],
    faq: [
      { q: "À partir de quel âge faire un frottis ?", a: "Généralement à partir de 25 ans en cas de vie sexuelle active, puis tous les 3 ans environ après deux frottis normaux. Le rythme s'adapte à l'âge et aux résultats, sur avis médical." },
      { q: "Le vaccin HPV remplace-t-il le frottis ?", a: "Non. La vaccination HPV prévient la majorité des infections responsables du cancer du col, mais ne dispense pas du dépistage par frottis, qui reste indispensable." },
    ],
  },
  {
    title: "Infertilité et PMA au Maroc : parcours et options",
    slug: "infertilite-pma-maroc",
    excerpt: "Quand consulter, causes féminines et masculines, bilan, stimulation, insémination et FIV : comprendre le parcours d'infertilité et la PMA au Maroc.",
    content: cInfertilite,
    aboutEntity: "Infertilité",
    metaTitle: "Infertilité et PMA au Maroc : parcours et options",
    metaDesc: "Infertilité : quand consulter, causes féminines et masculines, bilan du couple, et options de PMA (stimulation, insémination, FIV) disponibles au Maroc.",
    readingTime: 5,
    keyTakeaways: [
      "On parle d'infertilité après 12 mois d'essais sans grossesse (6 mois après 35 ans).",
      "Les causes peuvent être féminines, masculines ou mixtes : le bilan concerne les deux.",
      "Options de PMA : stimulation ovarienne, insémination (IIU), fécondation in vitro (FIV).",
      "Ne pas attendre trop longtemps pour consulter, surtout après 35 ans.",
    ],
    faq: [
      { q: "Au bout de combien de temps consulter pour infertilité ?", a: "Après 12 mois de rapports réguliers sans contraception et sans grossesse, ou après 6 mois si la femme a plus de 35 ans. Le bilan concerne les deux partenaires." },
      { q: "Quelles sont les options de PMA au Maroc ?", a: "Principalement la stimulation ovarienne, l'insémination intra-utérine (IIU) et la fécondation in vitro (FIV). Plusieurs centres spécialisés les proposent ; le choix dépend de la cause et de l'âge." },
    ],
  },
];

// Article existant à intégrer comme satellite (sans toucher au contenu).
const EXISTING_SATELLITES = [
  { slug: "cancer-sein-maroc-depistage-prevention", aboutEntity: "Cancer du sein" },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.findUnique({ where: { slug: CATEGORY_SLUG }, select: { id: true, name: true } });
  if (!cat) { console.error(`Catégorie ${CATEGORY_SLUG} introuvable.`); process.exit(1); }

  const now = new Date();
  const baseFields = (art) => ({
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
  });

  // 1. Pilier
  const pillar = await prisma.post.upsert({
    where: { slug: PILLAR.slug },
    update: { ...baseFields(PILLAR), pillarId: null },
    create: {
      ...baseFields(PILLAR),
      slug:        PILLAR.slug,
      authorId:    admin.id,
      status:      "PUBLISHED",
      publishedAt: now,
    },
    select: { id: true, slug: true },
  });
  console.log(`✓ Pilier  /blog/${pillar.slug}`);

  // 2. Satellites (nouveaux)
  for (const art of SATELLITES) {
    const post = await prisma.post.upsert({
      where: { slug: art.slug },
      update: { ...baseFields(art), pillarId: pillar.id },
      create: {
        ...baseFields(art),
        slug:        art.slug,
        authorId:    admin.id,
        pillarId:    pillar.id,
        status:      "PUBLISHED",
        publishedAt: now,
      },
      select: { slug: true },
    });
    console.log(`✓ Satellite /blog/${post.slug}`);
  }

  // 3. Article existant rattaché (contenu inchangé)
  for (const ex of EXISTING_SATELLITES) {
    const post = await prisma.post.update({
      where: { slug: ex.slug },
      data: { pillarId: pillar.id, aboutEntity: ex.aboutEntity },
      select: { slug: true },
    });
    console.log(`✓ Rattaché  /blog/${post.slug}  (about: ${ex.aboutEntity})`);
  }

  console.log(`\nCocon Santé de la femme : 1 pilier + ${SATELLITES.length + EXISTING_SATELLITES.length} satellites.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
