require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 3 — Cocon « Prévention » (médecine générale). Catégorie existante
// `prevention-sante` (intro/FAQ déjà présents). Intègre l'article alimentation
// méditerranéenne (rattaché, catégorie nutrition conservée). Idempotent.
// Articles de prévention = processus → aboutEntity null (pas de MedicalCondition).
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY_SLUG = "prevention-sante";

const cPilier = `<p>La prévention est le moyen le plus efficace — et le moins coûteux — de rester en bonne santé. Se faire vacciner, dépister tôt, bouger, bien manger et faire des bilans réguliers évite la majorité des maladies évitables. Voici les bons réflexes à adopter à chaque âge, au Maroc.</p>

<h2>Les trois niveaux de prévention</h2>
<ul>
<li><strong>Éviter</strong> la maladie : vaccination, hygiène de vie, alimentation, activité physique</li>
<li><strong>Dépister tôt</strong> : bilans, dépistages des cancers, de l'hypertension, du diabète</li>
<li><strong>Éviter les complications</strong> d'une maladie déjà installée : suivi régulier</li>
</ul>

<h2>Les piliers d'une bonne hygiène de vie</h2>
<ul>
<li><strong>Alimentation équilibrée</strong> : la cuisine méditerranéenne marocaine est un atout</li>
<li><strong>Activité physique</strong> régulière, même modérée</li>
<li><strong>Sommeil</strong> suffisant et de qualité</li>
<li><strong>Arrêt du tabac</strong> et modération de l'alcool</li>
<li><strong>Gestion du stress</strong></li>
</ul>

<h2>Les dépistages à ne pas manquer</h2>
<table>
<thead><tr><th>Dès</th><th>À surveiller</th></tr></thead>
<tbody>
<tr><td>40 ans</td><td>Tension, glycémie, cholestérol, mammographie</td></tr>
<tr><td>25 ans</td><td>Frottis (col de l'utérus)</td></tr>
<tr><td>Tout âge</td><td>Suivi dentaire et ophtalmologique réguliers</td></tr>
</tbody>
</table>

<h2>La vaccination ne concerne pas que les enfants</h2>
<p>Certains vaccins se prolongent ou se rappellent à l'âge adulte (tétanos, grippe pour les personnes à risque…). Faites le point avec votre médecin.</p>

<h2>Le bilan de santé</h2>
<p>Un bilan régulier permet de détecter tôt des anomalies silencieuses (tension, glycémie, cholestérol). Sa fréquence dépend de l'âge et des facteurs de risque.</p>

<hr>
<p>La prévention commence par une consultation. Trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const cVaccinAdulte = `<p>La vaccination n'est pas réservée aux enfants. À l'âge adulte, certains vaccins doivent être rappelés et d'autres sont recommandés selon l'âge, l'état de santé ou la profession. Faire le point évite de se retrouver non protégé.</p>

<h2>Pourquoi se faire vacciner adulte ?</h2>
<p>L'immunité conférée par certains vaccins de l'enfance diminue avec le temps : des rappels sont nécessaires. D'autres vaccins protègent les personnes plus fragiles ou exposées. La vaccination reste l'un des gestes de prévention les plus efficaces, à tout âge.</p>

<h2>Les vaccins à connaître à l'âge adulte</h2>
<ul>
<li><strong>Tétanos</strong> (souvent associé à diphtérie et poliomyélite) : rappels réguliers tout au long de la vie</li>
<li><strong>Grippe saisonnière</strong> : recommandée chaque année pour les personnes à risque (âge, maladies chroniques, femmes enceintes)</li>
<li><strong>Vaccins selon la situation</strong> : voyages, profession, état de santé particulier</li>
</ul>

<h2>Qui est particulièrement concerné ?</h2>
<table>
<thead><tr><th>Profil</th><th>Pourquoi</th></tr></thead>
<tbody>
<tr><td>Personnes âgées</td><td>Immunité plus faible, risque de complications</td></tr>
<tr><td>Maladies chroniques</td><td>Diabète, maladies cardiaques ou respiratoires</td></tr>
<tr><td>Femmes enceintes</td><td>Protection de la mère et du nourrisson</td></tr>
<tr><td>Voyageurs</td><td>Vaccins spécifiques selon la destination</td></tr>
</tbody>
</table>

<h2>Comment faire le point ?</h2>
<p>Apportez votre carnet de vaccination (ou de santé) à votre médecin : il vérifie les rappels à jour et vous conseille les vaccins utiles selon votre situation. En cas de carnet perdu, un schéma de rattrapage est possible.</p>

<hr>
<p>Pour vérifier que vos vaccins sont à jour, prenez rendez-vous en ligne avec un médecin près de chez vous.</p>`;

const cBilan = `<p>Un bilan de santé permet de détecter tôt des anomalies qui n'entraînent encore aucun symptôme — tension élevée, diabète débutant, excès de cholestérol. Réalisé au bon rythme, c'est un investissement simple pour rester en bonne santé.</p>

<h2>À quoi sert un bilan de santé ?</h2>
<p>Il fait le point sur votre état de santé et dépiste les facteurs de risque silencieux. L'objectif n'est pas de multiplier les examens, mais de cibler ceux qui sont utiles selon votre âge, votre sexe et vos antécédents.</p>

<h2>Quels examens, à quel âge ?</h2>
<table>
<thead><tr><th>Âge</th><th>Examens utiles</th></tr></thead>
<tbody>
<tr><td>20–40 ans</td><td>Tension, poids, suivi dentaire, frottis (femmes)</td></tr>
<tr><td>40–50 ans</td><td>Tension, glycémie, cholestérol, mammographie (femmes)</td></tr>
<tr><td>50 ans et +</td><td>Bilans plus complets, dépistage des cancers, santé osseuse</td></tr>
</tbody>
</table>
<p>Ces repères sont indicatifs : votre médecin adapte le bilan à votre situation et à vos facteurs de risque.</p>

<h2>Les chiffres clés à surveiller</h2>
<ul>
<li><strong>Tension</strong> : viser moins de 14/9</li>
<li><strong>Glycémie à jeun</strong> : dépister le diabète</li>
<li><strong>Cholestérol</strong> : évaluer le risque cardiovasculaire</li>
<li><strong>Poids / tour de taille</strong> : repère du risque métabolique</li>
</ul>

<h2>À quelle fréquence ?</h2>
<p>En l'absence de problème, un point régulier (par exemple tous les 1 à 3 ans selon l'âge) suffit. Plus rapproché en cas de facteurs de risque (antécédents familiaux, surpoids, tabac, hypertension ou diabète connus).</p>

<h2>Préparer son bilan</h2>
<p>Certains examens sanguins se font à jeun : demandez les consignes à l'avance. Apportez vos résultats précédents pour permettre une comparaison.</p>

<hr>
<p>Pour faire le point sur votre santé, prenez rendez-vous en ligne avec un médecin près de chez vous.</p>`;

const cActivite = `<p>L'activité physique est l'un des meilleurs médicaments — gratuit et sans effet secondaire. Elle prévient le diabète, l'hypertension, les maladies cardiaques, l'obésité, et améliore l'humeur et le sommeil. Bonne nouvelle : nul besoin d'être sportif pour en tirer les bénéfices.</p>

<h2>Combien d'activité physique par semaine ?</h2>
<p>Les recommandations générales sont d'environ <strong>150 minutes d'activité modérée par semaine</strong> (par exemple 30 minutes de marche rapide, 5 jours sur 7), complétées idéalement par du renforcement musculaire. Tout mouvement compte : l'important est la régularité.</p>

<h2>Activité modérée ou intense ?</h2>
<table>
<thead><tr><th>Intensité</th><th>Exemples</th></tr></thead>
<tbody>
<tr><td>Modérée</td><td>Marche rapide, vélo tranquille, ménage actif</td></tr>
<tr><td>Intense</td><td>Course, natation soutenue, sport collectif</td></tr>
</tbody>
</table>
<p>Une activité modérée régulière suffit à obtenir l'essentiel des bénéfices pour la santé.</p>

<h2>Les bénéfices prouvés</h2>
<ul>
<li>Réduit le risque de diabète, d'hypertension et de maladies cardiaques</li>
<li>Aide à contrôler le poids</li>
<li>Renforce les muscles et les os</li>
<li>Améliore le sommeil, réduit le stress et l'anxiété</li>
</ul>

<h2>Bouger plus au quotidien</h2>
<ul>
<li>Préférer les escaliers à l'ascenseur</li>
<li>Marcher pour les petits trajets</li>
<li>Couper les longues périodes assises</li>
<li>Choisir une activité qui plaît, pour tenir dans la durée</li>
</ul>

<h2>Reprendre en sécurité</h2>
<p>Après une longue inactivité, à partir d'un certain âge ou en cas de maladie chronique, demandez l'avis d'un médecin avant de reprendre une activité intense. La progression doit être douce.</p>

<hr>
<p>Avant de vous (re)mettre au sport, un avis médical peut être utile. Prenez rendez-vous en ligne avec un médecin près de chez vous.</p>`;

const PILLAR = {
  title: "Prévention santé au Maroc : les bons réflexes à chaque âge",
  slug: "prevention-sante-guide-maroc",
  excerpt: "Vaccination, dépistages, alimentation, activité physique et bilans : les bons réflexes de prévention pour rester en bonne santé à chaque âge, au Maroc.",
  content: cPilier,
  aboutEntity: null,
  metaTitle: "Prévention santé au Maroc : les bons réflexes",
  metaDesc: "Le guide de la prévention santé au Maroc : vaccination, dépistages des cancers, du diabète et de l'hypertension, hygiène de vie et bilans de santé à chaque âge.",
  readingTime: 5,
  keyTakeaways: [
    "La prévention est le moyen le plus efficace et le moins coûteux de rester en santé.",
    "Hygiène de vie : alimentation, activité physique, sommeil, arrêt du tabac.",
    "Dépistages clés dès 40 ans : tension, glycémie, cholestérol, mammographie ; frottis dès 25 ans.",
    "La vaccination concerne aussi l'adulte (rappels, grippe pour les personnes à risque).",
  ],
  faq: [
    { q: "Quels dépistages faire et à quel âge au Maroc ?", a: "Tension, glycémie et cholestérol dès 40 ans, mammographie à partir de 40 ans, frottis dès 25 ans, et un suivi dentaire et ophtalmologique régulier. Votre médecin adapte ce calendrier à votre situation." },
    { q: "La prévention est-elle prise en charge par l'AMO ?", a: "Plusieurs actes de dépistage et la vaccination sont pris en charge sous conditions par l'assurance maladie obligatoire. Renseignez-vous auprès de votre organisme (CNSS, CNOPS) ou de votre médecin." },
  ],
};

const SATELLITES = [
  {
    title: "Vaccination de l'adulte : quels vaccins et quand",
    slug: "vaccination-adulte-maroc",
    excerpt: "Tétanos, grippe, vaccins selon l'âge et la situation : pourquoi et comment faire le point sur ses vaccins à l'âge adulte, au Maroc.",
    content: cVaccinAdulte,
    aboutEntity: null,
    metaTitle: "Vaccination de l'adulte au Maroc : quels vaccins ?",
    metaDesc: "Vaccination de l'adulte : pourquoi se faire vacciner, tétanos et grippe, qui est concerné (personnes âgées, maladies chroniques, femmes enceintes) et comment faire le point.",
    readingTime: 4,
    keyTakeaways: [
      "L'immunité de certains vaccins de l'enfance diminue : des rappels sont nécessaires.",
      "Tétanos : rappels réguliers ; grippe : chaque année pour les personnes à risque.",
      "Personnes âgées, maladies chroniques, femmes enceintes et voyageurs sont concernés.",
      "Apportez votre carnet à votre médecin pour faire le point ; un rattrapage est possible.",
    ],
    faq: [
      { q: "Les adultes ont-ils besoin de vaccins ?", a: "Oui. L'immunité de certains vaccins diminue avec le temps (rappels tétanos), et d'autres sont recommandés selon l'âge, l'état de santé ou la profession (grippe pour les personnes à risque, vaccins de voyage)." },
      { q: "Comment savoir si mes vaccins sont à jour ?", a: "Apportez votre carnet de vaccination ou de santé à votre médecin : il vérifie les rappels et conseille les vaccins utiles. En cas de carnet perdu, un schéma de rattrapage est possible." },
    ],
  },
  {
    title: "Bilan de santé : quels examens et à quel âge",
    slug: "bilan-de-sante-quand-faire-maroc",
    excerpt: "À quoi sert un bilan, quels examens selon l'âge, les chiffres clés à surveiller et à quelle fréquence : le guide du bilan de santé au Maroc.",
    content: cBilan,
    aboutEntity: null,
    metaTitle: "Bilan de santé au Maroc : quels examens et à quel âge",
    metaDesc: "Bilan de santé : à quoi il sert, quels examens selon l'âge, chiffres clés (tension, glycémie, cholestérol) et fréquence recommandée. Détecter tôt au Maroc.",
    readingTime: 4,
    keyTakeaways: [
      "Le bilan détecte tôt des anomalies silencieuses (tension, diabète, cholestérol).",
      "Les examens utiles dépendent de l'âge, du sexe et des antécédents.",
      "Chiffres clés : tension < 14/9, glycémie à jeun, cholestérol, tour de taille.",
      "Fréquence tous les 1 à 3 ans, plus rapprochée en cas de facteurs de risque.",
    ],
    faq: [
      { q: "À quelle fréquence faire un bilan de santé ?", a: "En l'absence de problème, un point tous les 1 à 3 ans selon l'âge suffit, plus rapproché en cas de facteurs de risque (antécédents familiaux, surpoids, tabac, hypertension ou diabète connus)." },
      { q: "Quels examens dans un bilan de santé ?", a: "Selon l'âge et le profil : tension, glycémie, cholestérol, poids et tour de taille, suivi dentaire, frottis et mammographie chez la femme. Votre médecin cible les examens utiles." },
    ],
  },
  {
    title: "Activité physique et santé : combien et comment",
    slug: "activite-physique-sante-maroc",
    excerpt: "Combien d'activité par semaine, modérée ou intense, bénéfices prouvés et conseils pour bouger plus au quotidien et reprendre en sécurité.",
    content: cActivite,
    aboutEntity: null,
    metaTitle: "Activité physique et santé : combien et comment",
    metaDesc: "Activité physique : combien par semaine (150 min), modérée ou intense, bénéfices prouvés contre diabète et hypertension, et conseils pour bouger plus au quotidien.",
    readingTime: 4,
    keyTakeaways: [
      "Viser environ 150 minutes d'activité modérée par semaine ; la régularité prime.",
      "Une activité modérée (marche rapide) suffit à l'essentiel des bénéfices.",
      "Elle prévient diabète, hypertension et maladies cardiaques, et améliore le moral.",
      "Après une longue inactivité ou une maladie chronique, demander un avis médical.",
    ],
    faq: [
      { q: "Combien d'activité physique par semaine ?", a: "Environ 150 minutes d'activité modérée par semaine, par exemple 30 minutes de marche rapide 5 jours sur 7, idéalement complétées par du renforcement musculaire. La régularité compte plus que l'intensité." },
      { q: "Faut-il un avis médical avant de reprendre le sport ?", a: "Après une longue inactivité, à partir d'un certain âge ou en cas de maladie chronique, un avis médical est recommandé avant une activité intense, avec une reprise progressive." },
    ],
  },
];

// Article existant à intégrer (rattaché ; catégorie nutrition conservée).
const EXISTING = [
  { slug: "alimentation-mediterraneenne-maroc", aboutEntity: null },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.findUnique({ where: { slug: CATEGORY_SLUG }, select: { id: true } });
  if (!cat) { console.error(`Catégorie ${CATEGORY_SLUG} introuvable.`); process.exit(1); }

  const now = new Date();
  const baseFields = (art) => ({
    title: art.title, excerpt: art.excerpt, content: art.content, categoryId: cat.id,
    metaTitle: art.metaTitle, metaDesc: art.metaDesc, readingTime: art.readingTime,
    keyTakeaways: art.keyTakeaways.join("\n"), faqJson: JSON.stringify(art.faq),
    aboutEntity: art.aboutEntity, reviewedById: admin.id, reviewedAt: now,
  });

  const pillar = await prisma.post.upsert({
    where: { slug: PILLAR.slug },
    update: { ...baseFields(PILLAR), pillarId: null },
    create: { ...baseFields(PILLAR), slug: PILLAR.slug, authorId: admin.id, status: "PUBLISHED", publishedAt: now },
    select: { id: true, slug: true },
  });
  console.log(`✓ Pilier  /blog/${pillar.slug}`);

  for (const art of SATELLITES) {
    const post = await prisma.post.upsert({
      where: { slug: art.slug },
      update: { ...baseFields(art), pillarId: pillar.id },
      create: { ...baseFields(art), slug: art.slug, authorId: admin.id, pillarId: pillar.id, status: "PUBLISHED", publishedAt: now },
      select: { slug: true },
    });
    console.log(`✓ Satellite /blog/${post.slug}`);
  }

  for (const ex of EXISTING) {
    const post = await prisma.post.update({
      where: { slug: ex.slug },
      data: { pillarId: pillar.id, aboutEntity: ex.aboutEntity },
      select: { slug: true },
    });
    console.log(`✓ Rattaché  /blog/${post.slug}`);
  }

  console.log(`\nCocon Prévention : 1 pilier + ${SATELLITES.length + EXISTING.length} satellites.`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
