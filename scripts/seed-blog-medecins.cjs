require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Cocon B2B « Médecins » : contenus d'acquisition de praticiens (compte +
// abonnement). Catégorie dédiée, audience professionnelle (pas de disclaimer ni
// de widget RDV patient — géré par isDoctorAudience dans la page article).
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Médecins",
  slug: "medecins",
  description: "Développer sa patientèle, sa visibilité en ligne et son cabinet au Maroc",
  color: "indigo",
};

// ─── Pilier : attirer plus de patients ───────────────────────────────────────
const contentPilier = `<p>Disposer d'un excellent diplôme et d'un cabinet bien situé ne suffit plus. Au Maroc, les patients cherchent désormais leur médecin en ligne avant de décrocher leur téléphone. Pour un praticien, être trouvable, rassurant et facile à contacter sur Internet est devenu aussi important que la qualité des soins prodigués. Voici comment développer durablement votre patientèle, sans publicité agressive et dans le respect de la déontologie.</p>

<h2>Pourquoi les patients ne vous trouvent pas (encore)</h2>
<p>La majorité des nouveaux patients suivent aujourd'hui le même parcours : ils tapent « cardiologue Casablanca » ou « pédiatre près de chez moi » sur Google, comparent quelques profils, lisent les avis, puis choisissent. Si votre cabinet n'apparaît nulle part dans cette recherche, vous êtes invisible pour ces patients — quelle que soit votre réputation auprès de vos confrères.</p>
<ul>
<li>Pas de fiche en ligne = absence des résultats de recherche locaux</li>
<li>Pas d'avis visibles = perte de confiance face à un confrère mieux référencé</li>
<li>Pas de prise de rendez-vous en ligne = patients perdus en dehors des heures d'ouverture</li>
</ul>

<h2>Les 4 leviers pour attirer plus de patients</h2>

<h3>1. Être présent là où les patients cherchent</h3>
<p>Une fiche complète sur un annuaire médical de référence vous rend visible au moment exact où un patient cherche un médecin de votre spécialité, dans votre ville. C'est le canal d'acquisition le plus rentable : le patient a déjà l'intention de consulter.</p>

<h3>2. Soigner sa réputation en ligne</h3>
<p>Les avis patients pèsent lourd. Un profil affichant des évaluations positives et des réponses professionnelles inspire confiance. Encouragez vos patients satisfaits à laisser un avis : c'est la preuve sociale la plus convaincante.</p>

<h3>3. Faciliter la prise de rendez-vous</h3>
<p>Un patient qui doit appeler aux heures de bureau, tomber sur une ligne occupée puis rappeler, abandonne souvent. La prise de rendez-vous en ligne, disponible 24h/24, capte ces patients et réduit la charge du secrétariat.</p>

<h3>4. Réduire les rendez-vous manqués</h3>
<p>Les « no-shows » représentent une perte sèche de temps et de revenus. Les rappels automatiques par SMS et e-mail diminuent significativement le taux d'absentéisme.</p>

<h2>Le faire dans le respect de la déontologie</h2>
<p>Développer sa patientèle ne signifie pas faire de la publicité tapageuse — ce que le Code de déontologie médicale marocain encadre strictement. Il s'agit d'<strong>informer</strong> : indiquer clairement sa spécialité, ses horaires, son adresse et faciliter le contact. Une présence en ligne sobre et factuelle est parfaitement compatible avec l'éthique médicale.</p>

<h2>Combien de temps pour voir des résultats ?</h2>
<p>Une fiche bien renseignée commence à générer des contacts dès les premières semaines. L'effet s'amplifie avec le temps, à mesure que les avis s'accumulent et que votre référencement local se renforce.</p>

<hr>

<h2>Passez à l'action</h2>
<p>SantéauMaroc référence des milliers de patients chaque mois en quête d'un médecin. Créez votre profil gratuitement, complétez vos informations et activez la prise de rendez-vous en ligne pour transformer ces recherches en consultations.</p>`;

// ─── Satellite : présence en ligne ───────────────────────────────────────────
const contentPresence = `<p>« Le bouche-à-oreille a toujours suffi à remplir mon agenda. » Cette phrase, encore courante chez les praticiens marocains, devient chaque année moins vraie. Les patients — surtout les nouvelles générations urbaines — vérifient systématiquement la présence en ligne d'un médecin avant de prendre rendez-vous. Voici pourquoi être présent sur Internet n'est plus optionnel.</p>

<h2>Le comportement des patients a changé</h2>
<p>Avant de consulter, un patient marocain cherche aujourd'hui à savoir : où se trouve le cabinet, quels sont les horaires, quel est le tarif, que disent les autres patients. S'il ne trouve pas ces informations sur vous mais les trouve sur un confrère, le choix est vite fait.</p>

<h2>Ce qu'une présence en ligne vous apporte</h2>
<ul>
<li><strong>Visibilité locale</strong> : apparaître quand on cherche votre spécialité dans votre ville</li>
<li><strong>Crédibilité</strong> : une fiche structurée et des avis rassurent les nouveaux patients</li>
<li><strong>Accessibilité</strong> : un patient peut vous trouver et vous contacter à toute heure</li>
<li><strong>Maîtrise de votre image</strong> : c'est vous qui présentez votre parcours, pas un tiers</li>
</ul>

<h2>Présence en ligne ≠ publicité</h2>
<p>Beaucoup de médecins craignent un conflit avec la déontologie. Il n'en est rien : informer les patients de votre existence, de votre spécialité et de vos modalités de consultation relève de l'information de service, pas de la publicité commerciale. Une fiche factuelle sur un annuaire santé est l'équivalent moderne de la plaque sur la porte du cabinet.</p>

<h2>Par où commencer ?</h2>
<p>Inutile de créer un site web coûteux. Une fiche complète sur un annuaire médical reconnu suffit pour démarrer : photo, spécialité, adresse, horaires, et idéalement la prise de rendez-vous en ligne.</p>

<hr>

<h2>Créez votre présence en quelques minutes</h2>
<p>SantéauMaroc vous offre une fiche professionnelle visible par des milliers de patients. Créez votre profil gratuitement et reprenez le contrôle de votre visibilité.</p>`;

// ─── Satellite : no-show ──────────────────────────────────────────────────────
const contentNoShow = `<p>Chaque rendez-vous manqué est une double perte : un créneau vide qui ne sera pas facturé, et un autre patient qui aurait pu l'occuper. Au cabinet, les « no-shows » peuvent représenter une part non négligeable de l'activité. La bonne nouvelle : ce phénomène se réduit fortement avec quelques outils simples.</p>

<h2>Pourquoi les patients ne viennent pas ?</h2>
<ul>
<li>Ils ont oublié le rendez-vous pris des semaines plus tôt</li>
<li>Ils n'ont pas pu prévenir faute de pouvoir joindre le cabinet</li>
<li>Leur situation a évolué et ils n'ont pas pensé à annuler</li>
</ul>
<p>Dans la plupart des cas, il ne s'agit pas de négligence mais d'un simple oubli évitable.</p>

<h2>Les leviers qui réduisent l'absentéisme</h2>

<h3>Les rappels automatiques</h3>
<p>Un rappel par SMS ou e-mail 24 à 48 heures avant le rendez-vous diminue nettement le taux d'absence. Le patient est prévenu et peut, le cas échéant, annuler à temps pour libérer le créneau.</p>

<h3>L'annulation facile</h3>
<p>Quand un patient peut annuler en un clic, il le fait — au lieu de simplement ne pas venir. Vous récupérez ainsi le créneau pour un autre patient.</p>

<h3>La prise de rendez-vous en ligne</h3>
<p>Un agenda en ligne tenu à jour évite les doubles réservations et les erreurs de planning du secrétariat, sources fréquentes de rendez-vous fantômes.</p>

<h2>L'impact concret sur votre activité</h2>
<p>Réduire de moitié les rendez-vous manqués, c'est récupérer plusieurs heures de consultation facturables chaque semaine, et offrir un meilleur accès aux soins à vos patients en attente.</p>

<hr>

<h2>Automatisez vos rappels</h2>
<p>Avec SantéauMaroc, activez la prise de rendez-vous en ligne et les rappels automatiques pour réduire vos no-shows et optimiser votre agenda. Découvrez les fonctionnalités incluses dans nos abonnements.</p>`;

const ARTICLES = [
  {
    title:       "Comment attirer plus de patients dans votre cabinet au Maroc",
    slug:        "attirer-plus-de-patients-cabinet-maroc",
    excerpt:     "Visibilité en ligne, avis patients, prise de rendez-vous : les leviers concrets et déontologiques pour développer durablement votre patientèle au Maroc.",
    content:     contentPilier,
    metaTitle:   "Attirer plus de patients au Maroc : le guide du médecin",
    metaDesc:    "Comment développer votre patientèle au Maroc : présence en ligne, e-réputation, RDV en ligne et réduction des no-shows, dans le respect de la déontologie.",
    readingTime: 6,
    featured:    false,
    keyTakeaways: [
      "Les patients cherchent leur médecin en ligne avant d'appeler : être trouvable est devenu essentiel.",
      "Quatre leviers : visibilité locale, avis patients, RDV en ligne, réduction des no-shows.",
      "Une présence en ligne factuelle est compatible avec le Code de déontologie marocain.",
      "Une fiche complète génère des contacts dès les premières semaines.",
    ],
    faq: [
      { q: "Est-ce déontologique de référencer son cabinet en ligne ?", a: "Oui. Informer les patients de votre spécialité, vos horaires et votre adresse relève de l'information de service, pas de la publicité commerciale prohibée. Une fiche factuelle est l'équivalent moderne de la plaque du cabinet." },
      { q: "Combien de temps pour attirer de nouveaux patients ?", a: "Une fiche bien renseignée génère des premiers contacts dès les premières semaines. L'effet s'amplifie à mesure que les avis s'accumulent et que le référencement local se renforce." },
      { q: "Faut-il créer un site web ?", a: "Pas nécessairement. Une fiche complète sur un annuaire médical reconnu, avec prise de rendez-vous en ligne, suffit pour démarrer efficacement." },
    ],
  },
  {
    title:       "Pourquoi être présent sur Internet quand on est médecin au Maroc",
    slug:        "presence-en-ligne-medecin-maroc",
    excerpt:     "Le bouche-à-oreille ne suffit plus : les patients vérifient votre présence en ligne avant de consulter. Pourquoi c'est devenu indispensable, et comment commencer.",
    content:     contentPresence,
    metaTitle:   "Présence en ligne du médecin au Maroc : pourquoi c'est clé",
    metaDesc:    "Pourquoi tout médecin doit être visible sur Internet au Maroc : visibilité locale, crédibilité, accessibilité. Sans conflit avec la déontologie.",
    readingTime: 4,
    featured:    false,
    keyTakeaways: [
      "Les patients vérifient la présence en ligne d'un médecin avant de prendre rendez-vous.",
      "Une fiche en ligne apporte visibilité locale, crédibilité et accessibilité 24h/24.",
      "Informer n'est pas faire de la publicité : c'est compatible avec la déontologie.",
      "Une fiche sur un annuaire reconnu suffit pour démarrer, sans site web coûteux.",
    ],
    faq: [
      { q: "Le bouche-à-oreille ne suffit-il plus ?", a: "De moins en moins. Même recommandés, les patients vérifient désormais votre fiche, vos horaires et vos avis en ligne avant de confirmer leur choix." },
      { q: "Une présence en ligne est-elle compatible avec la déontologie ?", a: "Oui. Une fiche factuelle (spécialité, adresse, horaires, contact) relève de l'information de service, pas de la publicité commerciale encadrée par le Code de déontologie." },
    ],
  },
  {
    title:       "Réduire les rendez-vous manqués (no-show) au cabinet médical",
    slug:        "reduire-rendez-vous-manques-no-show-maroc",
    excerpt:     "Les rendez-vous manqués coûtent du temps et des revenus. Rappels automatiques, annulation facile et agenda en ligne réduisent fortement l'absentéisme.",
    content:     contentNoShow,
    metaTitle:   "Réduire les no-shows au cabinet médical au Maroc",
    metaDesc:    "Comment réduire les rendez-vous manqués au cabinet : rappels SMS automatiques, annulation en un clic et prise de rendez-vous en ligne. Impact concret sur l'activité.",
    readingTime: 4,
    featured:    false,
    keyTakeaways: [
      "Les no-shows sont surtout des oublis évitables, pas de la négligence.",
      "Les rappels automatiques par SMS/e-mail réduisent nettement l'absentéisme.",
      "L'annulation facile et l'agenda en ligne libèrent les créneaux à temps.",
      "Diviser ses no-shows par deux récupère plusieurs heures facturables par semaine.",
    ],
    faq: [
      { q: "Les rappels automatiques sont-ils efficaces ?", a: "Oui. Un rappel envoyé 24 à 48 heures avant le rendez-vous diminue significativement le taux d'absence en évitant les simples oublis." },
      { q: "Comment récupérer un créneau annulé ?", a: "Avec une annulation en ligne en un clic, le patient annule au lieu de ne pas venir, ce qui libère le créneau pour un autre patient en attente." },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, email: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  // 1. Catégorie « Médecins »
  const cat = await prisma.postCategory.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name, description: CATEGORY.description, color: CATEGORY.color },
    create: CATEGORY,
  });
  console.log(`✓ Catégorie : ${cat.name} (${cat.color})`);

  // 2. Articles
  for (const art of ARTICLES) {
    const post = await prisma.post.upsert({
      where: { slug: art.slug },
      update: {
        keyTakeaways: art.keyTakeaways.join("\n"),
        faqJson:      JSON.stringify(art.faq),
      },
      create: {
        title:        art.title,
        slug:         art.slug,
        excerpt:      art.excerpt,
        content:      art.content,
        coverImage:   null,
        categoryId:   cat.id,
        authorId:     admin.id,
        status:       "PUBLISHED",
        publishedAt:  new Date(),
        readingTime:  art.readingTime,
        featured:     art.featured,
        metaTitle:    art.metaTitle,
        metaDesc:     art.metaDesc,
        keyTakeaways: art.keyTakeaways.join("\n"),
        faqJson:      JSON.stringify(art.faq),
      },
    });
    console.log(`✓ ${CATEGORY.name.padEnd(12)} /blog/${post.slug}`);
  }
  console.log(`\nCocon Médecins : ${ARTICLES.length} articles publiés.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
