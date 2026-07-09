require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 1 — Cocon « Parcours de soin » (audience patient, P0).
// Relie à TOUTES les spécialités + RDV (pas de spécialité unique) : ces articles
// n'ont pas de `aboutEntity` (ce sont des processus, pas des pathologies) → la
// page article omet `about` et affiche le CTA générique « trouver un médecin ».
// Nouvelle catégorie indexable « Parcours de soin » (intro + FAQ via
// lib/blog-category-content.ts). Idempotent (upsert par slug).
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Parcours de soin",
  slug: "parcours-soin",
  description: "Choisir son médecin, préparer sa consultation, AMO et mutuelles au Maroc",
  color: "amber",
};

// ─── Pilier : choisir son médecin ────────────────────────────────────────────
const cChoisir = `<p>Bien choisir son médecin, c'est mettre toutes les chances de son côté pour être bien soigné. Au Maroc, l'offre est large et il n'est pas toujours simple de s'y retrouver entre généralistes et spécialistes, secteur public et privé, tarifs et délais. Ce guide vous donne les bons critères pour décider en confiance.</p>

<h2>Généraliste ou spécialiste : par qui commencer ?</h2>
<p>Dans la plupart des situations, le <strong>médecin généraliste</strong> est le bon premier interlocuteur : il pose un premier diagnostic, traite la majorité des problèmes courants et vous oriente, si nécessaire, vers le bon spécialiste. On consulte directement un spécialiste pour un suivi déjà établi (cardiologue, gynécologue, etc.) ou un motif clairement spécialisé.</p>

<h2>Les 5 critères pour bien choisir</h2>
<ul>
<li><strong>La spécialité adaptée</strong> à votre besoin réel</li>
<li><strong>La proximité</strong> : un cabinet proche facilite le suivi</li>
<li><strong>Les avis d'autres patients</strong> : un bon indicateur de l'accueil et de l'écoute</li>
<li><strong>Le tarif</strong> et la prise en charge (conventionné AMO ou non)</li>
<li><strong>La disponibilité</strong> : délai de rendez-vous, horaires, prise de RDV en ligne</li>
</ul>

<h2>Comment vérifier le sérieux d'un médecin ?</h2>
<p>Un médecin exerçant légalement au Maroc est inscrit à l'Ordre national des médecins. Une fiche professionnelle claire (spécialité, adresse, diplômes) et des avis patients cohérents sont de bons signaux de confiance. Méfiez-vous des promesses miracles ou des tarifs anormalement bas.</p>

<h2>Public ou privé ?</h2>
<table>
<thead><tr><th>Critère</th><th>Secteur public</th><th>Secteur privé</th></tr></thead>
<tbody>
<tr><td>Coût</td><td>Faible</td><td>Plus élevé</td></tr>
<tr><td>Délai</td><td>Souvent long</td><td>Plus court</td></tr>
<tr><td>Choix du médecin</td><td>Limité</td><td>Libre</td></tr>
</tbody>
</table>
<p>Beaucoup de patients combinent les deux selon le besoin et l'urgence.</p>

<h2>Préparer le premier rendez-vous</h2>
<p>Une fois votre médecin choisi, préparez votre consultation : motif clair, antécédents, liste de vos médicaments et résultats d'analyses. Vous gagnerez en efficacité et en qualité d'échange.</p>

<hr>
<p>Comparez les praticiens près de chez vous — spécialité, avis, tarifs, disponibilités — et prenez rendez-vous en ligne gratuitement sur SantéauMaroc.</p>`;

// ─── Satellite : préparer sa consultation ────────────────────────────────────
const cPreparer = `<p>Une consultation réussie se prépare. Quelques minutes d'organisation avant le rendez-vous permettent au médecin de mieux vous comprendre, de gagner du temps et d'éviter les oublis. Voici la checklist du patient bien préparé.</p>

<h2>Ce qu'il faut apporter</h2>
<ul>
<li>Votre <strong>carte d'identité</strong> et votre <strong>carte d'assurance</strong> (CNSS, CNOPS ou mutuelle)</li>
<li>Vos <strong>derniers résultats d'analyses</strong> et examens (radios, bilans)</li>
<li>La <strong>liste de vos médicaments</strong> actuels (ou les boîtes)</li>
<li>Votre <strong>carnet de santé</strong> ou vos comptes rendus précédents</li>
</ul>

<h2>Préparer ce que vous allez dire</h2>
<p>Notez à l'avance, sur votre téléphone ou un papier :</p>
<ul>
<li>Le <strong>motif principal</strong> de la consultation</li>
<li>Depuis <strong>quand</strong> les symptômes durent et comment ils évoluent</li>
<li>Vos <strong>antécédents</strong> et ceux de votre famille</li>
<li>Vos <strong>questions</strong> — les plus importantes en premier</li>
</ul>

<h2>Décrire ses symptômes efficacement</h2>
<p>Soyez précis : localisation, intensité, fréquence, facteurs qui aggravent ou soulagent. Plus votre description est claire, plus le diagnostic est rapide et fiable. N'omettez rien par gêne : le secret médical vous protège.</p>

<h2>Pendant la consultation</h2>
<ul>
<li>Posez vos questions si vous n'avez pas compris un terme ou un traitement</li>
<li>Demandez le <strong>nom et la durée</strong> du traitement prescrit</li>
<li>Vérifiez s'il faut <strong>un contrôle</strong> ou des examens complémentaires</li>
</ul>

<h2>Après la consultation</h2>
<p>Conservez l'ordonnance et le compte rendu. Respectez le traitement jusqu'au bout et reprenez rendez-vous si les symptômes persistent ou s'aggravent.</p>

<hr>
<p>Besoin de consulter ? Trouvez un médecin disponible près de chez vous et réservez en ligne, gratuitement.</p>`;

// ─── Satellite : AMO / remboursement ─────────────────────────────────────────
const cAmo = `<p>L'Assurance Maladie Obligatoire (AMO) permet de se faire rembourser une partie de ses frais de santé au Maroc. Comprendre son fonctionnement évite les mauvaises surprises et permet de récupérer ce à quoi vous avez droit.</p>

<h2>Qu'est-ce que l'AMO ?</h2>
<p>L'AMO est le régime d'assurance maladie de base au Maroc. Elle est gérée par deux principaux organismes :</p>
<table>
<thead><tr><th>Organisme</th><th>Pour qui ?</th></tr></thead>
<tbody>
<tr><td>CNSS</td><td>Salariés et retraités du secteur privé, travailleurs indépendants (AMO-TNS), et bénéficiaires de l'AMO solidaire</td></tr>
<tr><td>CNOPS</td><td>Fonctionnaires et agents du secteur public</td></tr>
</tbody>
</table>

<h2>Que rembourse l'AMO ?</h2>
<p>L'AMO couvre une partie des consultations, médicaments, analyses, hospitalisations et soins, sur la base d'un <strong>tarif national de référence (TNR)</strong>. Le remboursement correspond à un pourcentage de ce tarif — pas forcément de ce que vous avez réellement payé. Le reste à charge peut être couvert par une mutuelle complémentaire.</p>

<h2>Comment se faire rembourser ?</h2>
<ol>
<li>Demandez une <strong>feuille de soins</strong> ou la facture détaillée à votre médecin.</li>
<li>Rassemblez les justificatifs : ordonnance, vignettes des médicaments, résultats d'analyses.</li>
<li>Déposez votre dossier auprès de votre organisme (CNSS / CNOPS), en agence ou en ligne.</li>
<li>Le remboursement est versé sur votre compte, selon le barème en vigueur.</li>
</ol>

<h2>Le tiers payant</h2>
<p>Pour certains soins coûteux (hospitalisation, affections de longue durée), le <strong>tiers payant</strong> évite d'avancer les frais : l'organisme paie directement l'établissement. Renseignez-vous sur son application avant une intervention programmée.</p>

<h2>Les affections de longue durée (ALD)</h2>
<p>Certaines maladies chroniques (diabète, hypertension, cancer…) bénéficient d'une prise en charge renforcée au titre des ALD. Un dossier médical spécifique doit être validé par votre organisme.</p>

<hr>
<p>Les taux et démarches exacts dépendent de votre situation : vérifiez toujours auprès de la CNSS ou de la CNOPS. Pour consulter, trouvez un médecin et réservez en ligne près de chez vous.</p>`;

// ─── Satellite : mutuelle ────────────────────────────────────────────────────
const cMutuelle = `<p>L'AMO ne rembourse qu'une partie des frais de santé. Une mutuelle (assurance maladie complémentaire) prend en charge tout ou partie du reste. Voici comment elle fonctionne et comment bien la choisir au Maroc.</p>

<h2>AMO et mutuelle : quelle différence ?</h2>
<p>L'<strong>AMO</strong> est le régime de base obligatoire. La <strong>mutuelle</strong> est une couverture complémentaire, souscrite en plus, qui réduit votre reste à charge. Les deux se cumulent : la mutuelle intervient après le remboursement de l'AMO.</p>

<h2>Que couvre une mutuelle ?</h2>
<ul>
<li>Le <strong>ticket modérateur</strong> (la part non remboursée par l'AMO)</li>
<li>Les <strong>dépassements d'honoraires</strong> selon le contrat</li>
<li>Des soins peu ou pas couverts : <strong>dentaire, optique</strong>, certaines spécialités</li>
<li>Parfois une <strong>chambre individuelle</strong> en cas d'hospitalisation</li>
</ul>

<h2>Comment choisir sa mutuelle ?</h2>
<table>
<thead><tr><th>Critère</th><th>À vérifier</th></tr></thead>
<tbody>
<tr><td>Taux de couverture</td><td>Pourcentage remboursé par poste (dentaire, optique, hospitalisation)</td></tr>
<tr><td>Plafonds</td><td>Montant maximum remboursé par an et par type de soin</td></tr>
<tr><td>Délai de carence</td><td>Période avant que certaines garanties s'activent</td></tr>
<tr><td>Exclusions</td><td>Soins ou maladies non pris en charge</td></tr>
<tr><td>Cotisation</td><td>Rapport entre le prix et les garanties réelles</td></tr>
</tbody>
</table>

<h2>Mutuelle d'entreprise ou individuelle ?</h2>
<p>De nombreux salariés bénéficient d'une mutuelle collective via leur employeur, souvent avantageuse. À défaut, ou pour compléter, une mutuelle individuelle peut être souscrite auprès d'une compagnie d'assurance.</p>

<h2>Nos conseils avant de signer</h2>
<ul>
<li>Lisez attentivement les <strong>plafonds et exclusions</strong>, pas seulement les taux affichés.</li>
<li>Adaptez les garanties à vos <strong>besoins réels</strong> (famille, lunettes, soins dentaires…).</li>
<li>Comparez plusieurs offres avant de vous engager.</li>
</ul>

<hr>
<p>Quelle que soit votre couverture, l'essentiel est de consulter à temps. Trouvez un médecin près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

// ─── Satellite : généraliste ou spécialiste ──────────────────────────────────
const cGenSpe = `<p>Faut-il consulter un généraliste ou aller directement chez un spécialiste ? Bien choisir évite de perdre du temps et de l'argent. Voici comment décider selon votre situation.</p>

<h2>Le rôle du médecin généraliste</h2>
<p>Le médecin généraliste est le <strong>premier recours</strong> pour la majorité des problèmes de santé. Il connaît votre histoire médicale, traite les pathologies courantes, assure le suivi des maladies chroniques et coordonne votre parcours. C'est aussi lui qui vous oriente vers le bon spécialiste quand c'est nécessaire.</p>

<h2>Quand consulter directement un spécialiste ?</h2>
<table>
<thead><tr><th>Situation</th><th>Spécialiste</th></tr></thead>
<tbody>
<tr><td>Suivi de grossesse, santé féminine</td><td>Gynécologue</td></tr>
<tr><td>Problème de peau persistant</td><td>Dermatologue</td></tr>
<tr><td>Suivi du cœur, tension difficile à équilibrer</td><td>Cardiologue</td></tr>
<tr><td>Enfant (suivi, vaccins, maladies)</td><td>Pédiatre</td></tr>
<tr><td>Diabète, troubles hormonaux</td><td>Endocrinologue</td></tr>
<tr><td>Problème de vue</td><td>Ophtalmologue</td></tr>
</tbody>
</table>
<p>Pour un suivi déjà établi, on retourne directement chez son spécialiste. Pour un symptôme nouveau ou flou, le généraliste reste le meilleur point de départ.</p>

<h2>Les signes qui imposent de consulter sans attendre</h2>
<ul>
<li>Douleur intense ou inhabituelle</li>
<li>Fièvre élevée qui persiste</li>
<li>Symptôme qui s'aggrave rapidement</li>
<li>Tout signe d'urgence (douleur thoracique, essoufflement brutal, malaise)</li>
</ul>
<p>En cas d'urgence vitale, contactez les secours sans passer par une consultation classique.</p>

<h2>Éviter les consultations inutiles… et les retards</h2>
<p>Consulter trop tard expose à des complications ; multiplier les avis sans coordination fait perdre du temps. Le bon réflexe : un généraliste de confiance qui vous suit et vous oriente, et des spécialistes pour les besoins ciblés.</p>

<hr>
<p>Généraliste ou spécialiste, trouvez le bon praticien près de chez vous et prenez rendez-vous en ligne, gratuitement.</p>`;

const PILLAR = {
  title: "Comment choisir son médecin au Maroc : le guide complet",
  slug: "choisir-son-medecin-maroc",
  excerpt: "Généraliste ou spécialiste, public ou privé, critères de choix et vérifications : le guide pour choisir le bon médecin et bien préparer son parcours de soin au Maroc.",
  content: cChoisir,
  metaTitle: "Comment choisir son médecin au Maroc : guide complet",
  metaDesc: "Bien choisir son médecin au Maroc : généraliste ou spécialiste, public ou privé, critères de choix, avis patients et tarifs. Le guide du parcours de soin.",
  readingTime: 5,
  featured: false,
  keyTakeaways: [
    "Le généraliste est le bon premier interlocuteur dans la plupart des situations.",
    "Cinq critères : spécialité adaptée, proximité, avis, tarif/AMO, disponibilité.",
    "Public = peu coûteux mais délais ; privé = plus rapide mais plus cher.",
    "Préparez votre premier rendez-vous : motif, antécédents, médicaments, analyses.",
  ],
  faq: [
    { q: "Faut-il voir un généraliste ou un spécialiste en premier ?", a: "Dans la plupart des cas, le généraliste est le bon premier interlocuteur : il diagnostique, traite les problèmes courants et vous oriente vers le bon spécialiste si nécessaire. On consulte directement un spécialiste pour un suivi établi ou un motif clairement spécialisé." },
    { q: "Comment vérifier qu'un médecin est sérieux au Maroc ?", a: "Un médecin exerçant légalement est inscrit à l'Ordre national des médecins. Une fiche claire (spécialité, adresse, diplômes) et des avis patients cohérents sont de bons signaux. Méfiez-vous des promesses miracles et des tarifs anormalement bas." },
    { q: "Comment prendre rendez-vous rapidement ?", a: "Un annuaire médical en ligne permet de comparer spécialité, avis, tarifs et disponibilités, puis de réserver un créneau en ligne, sans appel ni attente." },
  ],
};

const SATELLITES = [
  {
    title: "Bien préparer sa consultation médicale : la checklist",
    slug: "preparer-sa-consultation-medicale-maroc",
    excerpt: "Documents à apporter, symptômes à décrire, questions à poser : la checklist pour réussir sa consultation et gagner un temps précieux avec son médecin.",
    content: cPreparer,
    metaTitle: "Préparer sa consultation médicale : la checklist patient",
    metaDesc: "Comment bien préparer sa consultation au Maroc : documents et carte d'assurance à apporter, décrire ses symptômes, questions à poser et suivi après le rendez-vous.",
    readingTime: 4,
    keyTakeaways: [
      "Apportez pièce d'identité, carte d'assurance, analyses récentes et liste de médicaments.",
      "Notez à l'avance le motif, l'évolution des symptômes et vos questions clés.",
      "Décrivez vos symptômes précisément : localisation, intensité, fréquence.",
      "Demandez le nom, la durée du traitement et s'il faut un contrôle.",
    ],
    faq: [
      { q: "Que faut-il apporter à une consultation médicale ?", a: "Votre pièce d'identité, votre carte d'assurance (CNSS, CNOPS ou mutuelle), vos derniers résultats d'analyses et examens, la liste de vos médicaments actuels et vos comptes rendus précédents." },
      { q: "Comment bien décrire ses symptômes au médecin ?", a: "Soyez précis : localisation, intensité, fréquence, depuis quand, et ce qui aggrave ou soulage. N'omettez rien par gêne, le secret médical vous protège. Une description claire accélère et fiabilise le diagnostic." },
    ],
  },
  {
    title: "AMO : comment se faire rembourser ses soins au Maroc",
    slug: "amo-remboursement-consultation-maroc",
    excerpt: "CNSS, CNOPS, tarif de référence, feuille de soins, tiers payant et ALD : comprendre l'AMO et récupérer ce à quoi vous avez droit sur vos frais de santé.",
    content: cAmo,
    metaTitle: "AMO Maroc : remboursement des consultations et soins",
    metaDesc: "Comment fonctionne l'AMO au Maroc : CNSS et CNOPS, tarif national de référence, feuille de soins, tiers payant et affections de longue durée. Démarches de remboursement.",
    readingTime: 5,
    keyTakeaways: [
      "L'AMO est le régime de base : CNSS (privé, indépendants, solidaire) ou CNOPS (public).",
      "Le remboursement se calcule sur un tarif de référence, pas sur ce que vous avez payé.",
      "Conservez feuille de soins, ordonnance et vignettes pour constituer votre dossier.",
      "Le tiers payant et les ALD allègent les frais pour les soins coûteux et chroniques.",
    ],
    faq: [
      { q: "Qui gère l'AMO au Maroc ?", a: "La CNSS pour les salariés et retraités du privé, les indépendants (AMO-TNS) et les bénéficiaires de l'AMO solidaire ; la CNOPS pour les fonctionnaires et agents du secteur public." },
      { q: "L'AMO rembourse-t-elle la totalité de la consultation ?", a: "Non. L'AMO rembourse un pourcentage d'un tarif national de référence, qui peut être inférieur à ce que vous avez réellement payé. Le reste à charge peut être couvert par une mutuelle complémentaire." },
      { q: "Comment se faire rembourser ?", a: "Demandez une feuille de soins ou la facture détaillée, rassemblez ordonnance, vignettes et résultats, puis déposez le dossier auprès de la CNSS ou de la CNOPS (agence ou en ligne). Les taux dépendent de votre situation." },
    ],
  },
  {
    title: "Mutuelle santé au Maroc : comprendre et bien choisir",
    slug: "mutuelle-sante-maroc-guide",
    excerpt: "Différence avec l'AMO, ce qu'elle couvre, critères de choix (plafonds, carence, exclusions), entreprise ou individuelle : le guide de la mutuelle santé au Maroc.",
    content: cMutuelle,
    metaTitle: "Mutuelle santé au Maroc : guide pour bien choisir",
    metaDesc: "Mutuelle santé au Maroc : différence avec l'AMO, garanties (dentaire, optique, hospitalisation), plafonds, délai de carence et conseils pour bien choisir sa complémentaire.",
    readingTime: 5,
    keyTakeaways: [
      "La mutuelle complète l'AMO : elle réduit votre reste à charge après remboursement de base.",
      "Elle couvre surtout dentaire, optique, dépassements et confort hospitalier.",
      "Comparez taux, plafonds, délai de carence et exclusions — pas seulement le prix.",
      "La mutuelle d'entreprise est souvent plus avantageuse qu'une offre individuelle.",
    ],
    faq: [
      { q: "Quelle différence entre l'AMO et une mutuelle ?", a: "L'AMO est le régime de base obligatoire ; la mutuelle est une couverture complémentaire facultative qui intervient après l'AMO pour réduire votre reste à charge. Les deux se cumulent." },
      { q: "Que couvre une mutuelle santé ?", a: "Principalement le ticket modérateur (part non remboursée par l'AMO), certains dépassements d'honoraires, et des soins peu couverts comme le dentaire et l'optique, parfois une chambre individuelle à l'hôpital." },
      { q: "Comment bien choisir sa mutuelle ?", a: "Vérifiez les taux de couverture par poste, les plafonds annuels, le délai de carence et les exclusions, puis comparez le rapport garanties/cotisation de plusieurs offres avant de signer." },
    ],
  },
  {
    title: "Généraliste ou spécialiste : qui consulter et quand ?",
    slug: "generaliste-ou-specialiste-quand-consulter-maroc",
    excerpt: "Rôle du généraliste, situations qui justifient un spécialiste, signes d'alerte à ne pas négliger : savoir vers qui se tourner pour ne pas perdre de temps.",
    content: cGenSpe,
    metaTitle: "Généraliste ou spécialiste : qui consulter au Maroc ?",
    metaDesc: "Faut-il voir un généraliste ou un spécialiste ? Rôle du médecin traitant, situations qui justifient un spécialiste et signes d'alerte à ne pas négliger au Maroc.",
    readingTime: 4,
    keyTakeaways: [
      "Le généraliste est le premier recours : il traite, suit et oriente.",
      "On va directement chez un spécialiste pour un suivi établi ou un motif ciblé.",
      "Douleur intense, fièvre persistante ou aggravation rapide imposent de consulter vite.",
      "En cas d'urgence vitale, contactez les secours sans passer par une consultation.",
    ],
    faq: [
      { q: "Quand consulter un généraliste plutôt qu'un spécialiste ?", a: "Pour tout symptôme nouveau ou flou, le généraliste est le meilleur point de départ : il diagnostique, traite et oriente. On consulte directement un spécialiste pour un suivi déjà établi ou un motif clairement spécialisé." },
      { q: "Quels signes imposent de consulter rapidement ?", a: "Une douleur intense ou inhabituelle, une fièvre élevée persistante, un symptôme qui s'aggrave vite, ou tout signe d'urgence (douleur thoracique, essoufflement brutal, malaise). En cas d'urgence vitale, appelez les secours." },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  // 1. Catégorie « Parcours de soin »
  const cat = await prisma.postCategory.upsert({
    where: { slug: CATEGORY.slug },
    update: { name: CATEGORY.name, description: CATEGORY.description, color: CATEGORY.color },
    create: CATEGORY,
  });
  console.log(`✓ Catégorie : ${cat.name} (${cat.color})`);

  const now = new Date();

  // 2. Pilier
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
    reviewedById: admin.id,
    reviewedAt:   now,
  });

  const pillar = await prisma.post.upsert({
    where: { slug: PILLAR.slug },
    update: { ...baseFields(PILLAR), pillarId: null },
    create: {
      ...baseFields(PILLAR),
      slug:        PILLAR.slug,
      authorId:    admin.id,
      featured:    PILLAR.featured,
      status:      "PUBLISHED",
      publishedAt: now,
    },
    select: { id: true, slug: true },
  });
  console.log(`✓ Pilier  /blog/${pillar.slug}`);

  // 3. Satellites rattachés au pilier
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

  console.log(`\nCocon Parcours de soin : 1 pilier + ${SATELLITES.length} satellites publiés.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
