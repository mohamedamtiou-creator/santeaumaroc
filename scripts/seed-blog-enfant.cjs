require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 2 — Cocon « Santé de l'enfant » (pédiatrie). Nouvelle catégorie indexable
// `sante-enfant` (intro/FAQ dans blog-category-content.ts). Idempotent.
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Santé de l'enfant",
  slug: "sante-enfant",
  description: "Vaccins, fièvre, maladies courantes et suivi de l'enfant au Maroc",
  color: "rose",
};

const cPilier = `<p>De la naissance à l'adolescence, la santé de l'enfant repose sur un suivi régulier, une vaccination à jour et la capacité des parents à reconnaître les signes qui doivent amener à consulter. Ce guide réunit l'essentiel pour accompagner votre enfant sereinement, au Maroc.</p>

<h2>Le suivi médical de l'enfant</h2>
<p>Les consultations sont rapprochées la première année (croissance, développement, vaccins), puis s'espacent. À chaque visite, le médecin vérifie le poids, la taille, le développement psychomoteur et met à jour les vaccinations.</p>

<h2>La vaccination</h2>
<p>Le calendrier national de vaccination protège l'enfant contre des maladies graves dès les premiers mois. Le respecter dans les délais est l'un des gestes de prévention les plus efficaces.</p>

<h2>Reconnaître les situations courantes</h2>
<ul>
<li><strong>La fièvre</strong> : fréquente et le plus souvent bénigne, mais à surveiller chez le nourrisson.</li>
<li><strong>Les maladies infantiles</strong> : rhumes, angines, gastro-entérites, varicelle…</li>
<li><strong>Les troubles de l'alimentation et du sommeil</strong>, fréquents et souvent transitoires.</li>
</ul>

<h2>Quand consulter en urgence ?</h2>
<p>Difficulté à respirer, fièvre élevée chez un nourrisson, somnolence inhabituelle, convulsions, déshydratation, refus de boire : ces signes imposent une consultation rapide.</p>

<h2>Choisir et suivre avec un pédiatre</h2>
<p>Un pédiatre (ou un médecin généraliste formé au suivi de l'enfant) assure la continuité du suivi, connaît les antécédents et rassure les parents. La relation de confiance compte autant que la compétence.</p>

<hr>
<p>Pour le suivi de votre enfant, trouvez un pédiatre près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const cVaccins = `<p>La vaccination est la protection la plus efficace contre de nombreuses maladies graves de l'enfance. Au Maroc, le Programme national d'immunisation propose un calendrier vaccinal gratuit dans les centres de santé. Voici comment s'y retrouver.</p>

<h2>Pourquoi vacciner son enfant ?</h2>
<p>Les vaccins protègent l'enfant contre des maladies qui peuvent être graves, voire mortelles (tuberculose, poliomyélite, rougeole, coqueluche…). Ils protègent aussi les autres enfants par l'immunité collective. C'est un geste à la fois individuel et solidaire.</p>

<h2>Le calendrier vaccinal au Maroc</h2>
<p>La vaccination débute dès la naissance et se poursuit par étapes durant les premiers mois et années. Les principaux rendez-vous se situent à la naissance, puis vers 2, 3, 4 mois, autour de 9-12 mois, et avec des rappels plus tard.</p>
<table>
<thead><tr><th>Période</th><th>Repères</th></tr></thead>
<tbody>
<tr><td>Naissance</td><td>Premiers vaccins (dont BCG)</td></tr>
<tr><td>Premiers mois</td><td>Vaccins combinés et rappels rapprochés</td></tr>
<tr><td>Vers 9–12 mois</td><td>Vaccin contre la rougeole (RR)</td></tr>
<tr><td>Plus tard</td><td>Rappels selon le calendrier officiel</td></tr>
</tbody>
</table>
<p>Le calendrier officiel fait foi : demandez-le à votre centre de santé ou à votre pédiatre, qui le tient à jour.</p>

<h2>Où faire vacciner son enfant ?</h2>
<p>Les vaccins du programme national sont disponibles <strong>gratuitement</strong> dans les centres de santé publics. Ils peuvent aussi être réalisés en cabinet privé. Le <strong>carnet de santé</strong> de l'enfant garde la trace de chaque injection : conservez-le précieusement.</p>

<h2>Les vaccins ont-ils des effets secondaires ?</h2>
<p>Le plus souvent, ils sont bénins et passagers : légère fièvre, rougeur au point d'injection. Ces réactions sont normales et disparaissent en un à deux jours. Les bénéfices de la vaccination dépassent très largement ces désagréments.</p>

<h2>Et si un vaccin a été oublié ?</h2>
<p>Un retard se rattrape : il n'est généralement pas nécessaire de tout recommencer. Consultez un médecin qui adaptera un calendrier de rattrapage.</p>

<hr>
<p>Pour vérifier que votre enfant est à jour, prenez rendez-vous en ligne avec un pédiatre près de chez vous.</p>`;

const cFievre = `<p>La fièvre est l'un des premiers motifs d'inquiétude des parents. Pourtant, elle est le plus souvent le signe que l'organisme se défend contre une infection. Savoir réagir et reconnaître les signes de gravité permet d'éviter autant l'affolement que les retards de consultation.</p>

<h2>À partir de quelle température parle-t-on de fièvre ?</h2>
<p>On parle de fièvre à partir de <strong>38 °C</strong>. La mesure la plus fiable chez le jeune enfant se fait par voie rectale. La fièvre n'est pas une maladie en soi, mais un symptôme.</p>

<h2>Que faire en cas de fièvre ?</h2>
<ul>
<li><strong>Faire boire</strong> régulièrement pour éviter la déshydratation</li>
<li><strong>Ne pas trop couvrir</strong> l'enfant, aérer la pièce</li>
<li>Donner un médicament contre la fièvre (paracétamol) <strong>à la dose adaptée au poids</strong>, sur conseil médical</li>
<li>Surveiller le comportement, plus important que le chiffre du thermomètre</li>
</ul>

<h2>Quand consulter rapidement ?</h2>
<table>
<thead><tr><th>Situation</th><th>Conduite</th></tr></thead>
<tbody>
<tr><td>Nourrisson de moins de 3 mois avec fièvre</td><td>Consulter sans attendre</td></tr>
<tr><td>Fièvre > 48 h ou qui remonte</td><td>Consulter</td></tr>
<tr><td>Somnolence, refus de boire, gêne respiratoire</td><td>Urgence</td></tr>
<tr><td>Convulsions, taches sur la peau, raideur de nuque</td><td>Urgence immédiate</td></tr>
</tbody>
</table>

<h2>Les erreurs à éviter</h2>
<ul>
<li>Alterner plusieurs médicaments sans avis médical</li>
<li>Donner de l'aspirine à un enfant (déconseillée)</li>
<li>Se fier uniquement au chiffre : un enfant qui joue et boit est rassurant</li>
</ul>

<h2>Surveiller plutôt que paniquer</h2>
<p>L'objectif d'un traitement contre la fièvre n'est pas de la faire disparaître à tout prix, mais de soulager l'enfant. C'est son comportement général qui guide la décision de consulter.</p>

<hr>
<p>Un doute sur la fièvre de votre enfant ? Prenez rendez-vous en ligne avec un pédiatre près de chez vous.</p>`;

const cMaladies = `<p>Rhume, angine, gastro-entérite, varicelle : les maladies infantiles sont fréquentes et le plus souvent bénignes. Les reconnaître aide les parents à réagir calmement et à repérer les rares situations qui nécessitent un avis médical.</p>

<h2>Les infections respiratoires</h2>
<p>Le <strong>rhume</strong> (nez bouché, toux, légère fièvre) est très courant, surtout en collectivité, et guérit seul en quelques jours. L'<strong>angine</strong> provoque mal de gorge et fièvre ; certaines nécessitent un traitement, d'où l'intérêt d'un avis médical en cas de doute.</p>

<h2>La gastro-entérite</h2>
<p>Diarrhées et vomissements, souvent d'origine virale. Le principal risque est la <strong>déshydratation</strong>, surtout chez le jeune enfant. Faites boire par petites quantités régulières (solution de réhydratation) et surveillez les signes d'alerte.</p>

<h2>Les maladies éruptives</h2>
<table>
<thead><tr><th>Maladie</th><th>Signe caractéristique</th></tr></thead>
<tbody>
<tr><td>Varicelle</td><td>Boutons qui démangent, par poussées</td></tr>
<tr><td>Rougeole</td><td>Forte fièvre puis éruption (évitable par le vaccin)</td></tr>
<tr><td>Roséole</td><td>Fièvre élevée puis éruption à la décrue</td></tr>
</tbody>
</table>

<h2>Quand s'inquiéter ?</h2>
<ul>
<li>Signes de déshydratation (bouche sèche, pleurs sans larmes, couches sèches)</li>
<li>Difficulté à respirer, gêne persistante</li>
<li>Fièvre élevée chez un nourrisson</li>
<li>Éruption avec fièvre élevée ou état général altéré</li>
</ul>

<h2>Limiter la contagion</h2>
<p>Lavage des mains, mouchoirs à usage unique et éviction temporaire de la collectivité pour certaines maladies réduisent la transmission au sein de la famille et à l'école.</p>

<hr>
<p>En cas de doute sur une maladie de votre enfant, prenez rendez-vous en ligne avec un pédiatre près de chez vous.</p>`;

const cChoisirPediatre = `<p>Le pédiatre accompagne la santé de l'enfant de la naissance à l'adolescence. Bien le choisir, c'est s'assurer un suivi de qualité et une relation de confiance, précieuse dans les moments d'inquiétude.</p>

<h2>Pédiatre ou médecin généraliste ?</h2>
<p>Le <strong>pédiatre</strong> est le spécialiste de l'enfant : développement, vaccins, maladies infantiles. Le <strong>médecin généraliste</strong> peut aussi assurer le suivi, notamment là où l'accès au pédiatre est limité. Les deux sont des options valables selon votre situation et votre région.</p>

<h2>Les critères pour bien choisir</h2>
<ul>
<li><strong>La proximité</strong> : un cabinet proche facilite les consultations fréquentes des premières années</li>
<li><strong>La disponibilité</strong> : délais de rendez-vous, gestion des urgences, prise de RDV en ligne</li>
<li><strong>L'écoute</strong> : un praticien qui prend le temps d'expliquer et de rassurer</li>
<li><strong>Les avis</strong> d'autres parents</li>
</ul>

<h2>Le rythme du suivi</h2>
<p>Les consultations sont nombreuses la première année (suivi de croissance et vaccins), puis s'espacent. Un suivi régulier permet de détecter tôt un éventuel retard ou problème de développement.</p>

<h2>Bien préparer la consultation</h2>
<ul>
<li>Apportez le <strong>carnet de santé</strong> de l'enfant</li>
<li>Notez vos questions et les symptômes observés</li>
<li>Préparez l'enfant en lui expliquant simplement la visite</li>
</ul>

<h2>Construire une relation de confiance</h2>
<p>Un bon suivi pédiatrique s'inscrit dans la durée. N'hésitez pas à poser toutes vos questions : un pédiatre est aussi là pour rassurer les parents et les guider.</p>

<hr>
<p>Trouvez un pédiatre disponible près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const PILLAR = {
  title: "Santé de l'enfant au Maroc : le guide des parents",
  slug: "sante-enfant-guide-maroc",
  excerpt: "Suivi médical, vaccins, fièvre, maladies courantes et signes d'alerte : le guide complet pour accompagner la santé de votre enfant à chaque âge, au Maroc.",
  content: cPilier,
  aboutEntity: null,
  metaTitle: "Santé de l'enfant au Maroc : le guide des parents",
  metaDesc: "Le guide de la santé de l'enfant au Maroc : suivi médical, calendrier vaccinal, fièvre, maladies infantiles, signes d'alerte et choix du pédiatre.",
  readingTime: 5,
  keyTakeaways: [
    "Le suivi est rapproché la 1re année (croissance, développement, vaccins) puis s'espace.",
    "La vaccination dans les délais est l'un des gestes de prévention les plus efficaces.",
    "La fièvre est souvent bénigne, mais à surveiller de près chez le nourrisson.",
    "Gêne respiratoire, somnolence, déshydratation ou convulsions = consulter en urgence.",
  ],
  faq: [
    { q: "À quelle fréquence consulter un pédiatre ?", a: "Les consultations sont rapprochées la première année (suivi de croissance et vaccins), puis s'espacent. Un suivi régulier vérifie le développement de l'enfant et met à jour les vaccinations." },
    { q: "Quand emmener son enfant aux urgences ?", a: "En cas de fièvre élevée chez un nourrisson, de difficultés à respirer, de somnolence inhabituelle, de convulsions ou de déshydratation. Dans le doute, contactez un médecin sans attendre." },
  ],
};

const SATELLITES = [
  {
    title: "Calendrier vaccinal de l'enfant au Maroc",
    slug: "calendrier-vaccinal-enfant-maroc",
    excerpt: "Pourquoi et quand vacciner, les principaux rendez-vous, où faire les vaccins gratuitement et comment rattraper un retard : le guide du calendrier vaccinal au Maroc.",
    content: cVaccins,
    aboutEntity: null,
    metaTitle: "Calendrier vaccinal de l'enfant au Maroc : le guide",
    metaDesc: "Le calendrier vaccinal de l'enfant au Maroc : pourquoi vacciner, les principaux rendez-vous, vaccins gratuits en centre de santé et rattrapage en cas de retard.",
    readingTime: 5,
    keyTakeaways: [
      "Les vaccins protègent l'enfant et les autres par l'immunité collective.",
      "La vaccination débute à la naissance et se poursuit par étapes les premiers mois.",
      "Les vaccins du programme national sont gratuits dans les centres de santé publics.",
      "Un retard se rattrape sans tout recommencer : consultez pour un calendrier adapté.",
    ],
    faq: [
      { q: "Les vaccins de l'enfant sont-ils gratuits au Maroc ?", a: "Oui, les vaccins du Programme national d'immunisation sont disponibles gratuitement dans les centres de santé publics. Ils peuvent aussi être réalisés en cabinet privé." },
      { q: "Que faire si un vaccin a été oublié ?", a: "Un retard se rattrape : il n'est généralement pas nécessaire de tout recommencer. Consultez un médecin ou un pédiatre qui établira un calendrier de rattrapage adapté." },
    ],
  },
  {
    title: "Fièvre chez l'enfant : que faire et quand consulter",
    slug: "fievre-enfant-que-faire-maroc",
    excerpt: "À partir de quelle température, comment réagir, les doses, les signes de gravité et les erreurs à éviter : le guide de la fièvre de l'enfant pour les parents.",
    content: cFievre,
    aboutEntity: "Fièvre",
    metaTitle: "Fièvre chez l'enfant : que faire et quand consulter",
    metaDesc: "Fièvre de l'enfant : à partir de quelle température, comment réagir, hydratation et paracétamol, signes de gravité et quand consulter en urgence au Maroc.",
    readingTime: 5,
    keyTakeaways: [
      "On parle de fièvre à partir de 38 °C ; c'est un symptôme, pas une maladie.",
      "Faire boire, ne pas trop couvrir, paracétamol à la dose adaptée au poids.",
      "Le comportement de l'enfant compte plus que le chiffre du thermomètre.",
      "Nourrisson < 3 mois, somnolence, gêne respiratoire ou convulsions = urgence.",
    ],
    faq: [
      { q: "À partir de quelle température un enfant a-t-il de la fièvre ?", a: "On parle de fièvre à partir de 38 °C. La mesure rectale est la plus fiable chez le jeune enfant. La fièvre est un symptôme de défense, pas une maladie en soi." },
      { q: "Quand consulter pour la fièvre d'un enfant ?", a: "Sans attendre chez un nourrisson de moins de 3 mois, ou si la fièvre dépasse 48 h, remonte, ou s'accompagne de somnolence, de refus de boire, de gêne respiratoire ou de convulsions." },
    ],
  },
  {
    title: "Maladies infantiles courantes : reconnaître les symptômes",
    slug: "maladies-infantiles-courantes-maroc",
    excerpt: "Rhume, angine, gastro-entérite, varicelle, rougeole : reconnaître les maladies fréquentes de l'enfant, réagir et repérer les signes qui doivent alerter.",
    content: cMaladies,
    aboutEntity: null,
    metaTitle: "Maladies infantiles courantes : symptômes et conduite",
    metaDesc: "Reconnaître les maladies infantiles courantes : rhume, angine, gastro-entérite, varicelle, rougeole. Comment réagir, signes d'alerte et prévention de la contagion.",
    readingTime: 5,
    keyTakeaways: [
      "La plupart des maladies infantiles sont bénignes et guérissent seules.",
      "Le principal risque de la gastro-entérite est la déshydratation : faire boire souvent.",
      "Déshydratation, gêne respiratoire ou fièvre élevée du nourrisson doivent alerter.",
      "Lavage des mains et éviction temporaire limitent la contagion.",
    ],
    faq: [
      { q: "Comment reconnaître une déshydratation chez l'enfant ?", a: "Les signes sont une bouche sèche, des pleurs sans larmes, des couches sèches, une somnolence ou un enfant qui refuse de boire. En cas de doute, consultez rapidement." },
      { q: "La varicelle est-elle grave ?", a: "Le plus souvent bénigne chez l'enfant, elle se manifeste par des boutons qui démangent par poussées. Consultez en cas de fièvre élevée, de surinfection des lésions ou d'état général altéré." },
    ],
  },
  {
    title: "Choisir un pédiatre et bien suivre son enfant",
    slug: "choisir-pediatre-suivi-enfant-maroc",
    excerpt: "Pédiatre ou généraliste, critères de choix, rythme du suivi et préparation des consultations : bien accompagner la santé de son enfant au Maroc.",
    content: cChoisirPediatre,
    aboutEntity: null,
    metaTitle: "Choisir un pédiatre au Maroc : le guide des parents",
    metaDesc: "Comment choisir un pédiatre au Maroc : pédiatre ou généraliste, critères (proximité, écoute, disponibilité), rythme du suivi et préparation des consultations.",
    readingTime: 4,
    keyTakeaways: [
      "Pédiatre ou généraliste : les deux peuvent assurer le suivi selon votre région.",
      "Critères : proximité, disponibilité, écoute et avis d'autres parents.",
      "Le suivi est intense la 1re année puis s'espace.",
      "Apportez le carnet de santé et notez vos questions avant la consultation.",
    ],
    faq: [
      { q: "Faut-il un pédiatre ou un généraliste pour son enfant ?", a: "Le pédiatre est le spécialiste de l'enfant, mais un médecin généraliste peut aussi assurer le suivi, notamment là où l'accès au pédiatre est limité. Les deux sont des options valables." },
      { q: "Comment bien préparer la consultation pédiatrique ?", a: "Apportez le carnet de santé de l'enfant, notez vos questions et les symptômes observés, et expliquez simplement la visite à l'enfant pour le rassurer." },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name, description: CATEGORY.description, color: CATEGORY.color },
    create: CATEGORY,
  });
  console.log(`✓ Catégorie : ${cat.name} (${cat.color})`);

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

  console.log(`\nCocon Santé de l'enfant : 1 pilier + ${SATELLITES.length} satellites.`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
