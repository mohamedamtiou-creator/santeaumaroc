require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Vague 2 — Cocon « Santé mentale » (psychiatrie). Nouvelle catégorie indexable
// `sante-mentale`. Intègre l'article burn-out existant (rattaché + déplacé dans
// la catégorie). Idempotent.
// ════════════════════════════════════════════════════════════════════════════

const CATEGORY = {
  name: "Santé mentale",
  slug: "sante-mentale",
  description: "Anxiété, dépression, sommeil et bien-être psychique au Maroc",
  color: "indigo",
};

const cPilier = `<p>La santé mentale est une composante essentielle de la santé, au même titre que la santé physique. Anxiété, dépression, stress, troubles du sommeil touchent beaucoup de personnes — souvent en silence. En parler, comprendre et savoir vers qui se tourner est le premier pas vers le mieux-être.</p>

<h2>Qu'est-ce que la santé mentale ?</h2>
<p>Ce n'est pas seulement l'absence de maladie : c'est un état d'équilibre qui permet de faire face aux difficultés de la vie, de travailler et de nouer des relations. Comme la santé physique, elle peut être fragilisée — et se soigne.</p>

<h2>Les troubles les plus fréquents</h2>
<ul>
<li><strong>L'anxiété</strong> : inquiétude excessive, tension permanente</li>
<li><strong>La dépression</strong> : tristesse durable, perte d'intérêt, fatigue</li>
<li><strong>Le stress chronique et le burn-out</strong> : épuisement lié à une pression prolongée</li>
<li><strong>Les troubles du sommeil</strong>, souvent liés aux précédents</li>
</ul>

<h2>Briser le tabou</h2>
<p>Au Maroc comme ailleurs, la santé mentale reste entourée de préjugés. Pourtant, consulter pour une souffrance psychique est aussi légitime que consulter pour une douleur physique. Demander de l'aide est un signe de force, pas de faiblesse.</p>

<h2>Quand consulter ?</h2>
<p>Lorsque la souffrance dure, perturbe le quotidien (sommeil, travail, relations) ou s'accompagne d'idées noires. Il n'est jamais trop tôt pour en parler.</p>

<h2>Vers qui se tourner ?</h2>
<p>Le médecin généraliste est un bon premier interlocuteur. Le <strong>psychiatre</strong> (médecin) diagnostique et peut prescrire un traitement ; le <strong>psychologue</strong> accompagne par la parole et les thérapies. Les deux sont souvent complémentaires.</p>

<hr>
<p>Si vous traversez une période difficile, n'attendez pas. Trouvez un psychiatre près de chez vous et prenez rendez-vous en ligne, en toute confidentialité.</p>`;

const cAnxiete = `<p>L'anxiété est une réaction normale face au danger ou au stress. Elle devient un trouble lorsqu'elle est excessive, permanente et qu'elle handicape la vie quotidienne. Bonne nouvelle : les troubles anxieux se soignent très bien.</p>

<h2>Anxiété normale ou trouble anxieux ?</h2>
<p>Ressentir de l'anxiété avant un examen ou un événement important est normal. On parle de <strong>trouble anxieux</strong> quand l'inquiétude est disproportionnée, quasi permanente, difficile à contrôler et qu'elle dure plusieurs mois.</p>

<h2>Les symptômes</h2>
<ul>
<li><strong>Psychiques</strong> : inquiétude excessive, anticipation négative, irritabilité, difficultés de concentration</li>
<li><strong>Physiques</strong> : palpitations, oppression, boule au ventre, tensions musculaires, troubles du sommeil</li>
<li><strong>Crises d'angoisse</strong> : montée brutale de peur intense avec symptômes physiques marqués</li>
</ul>

<h2>Que faire au quotidien ?</h2>
<ul>
<li>Pratiquer une <strong>activité physique</strong> régulière, qui réduit la tension</li>
<li>Apprendre des techniques de <strong>respiration et de relaxation</strong></li>
<li>Limiter <strong>café, énergisants et écrans</strong> le soir</li>
<li>Préserver un <strong>sommeil régulier</strong></li>
</ul>

<h2>Les traitements qui marchent</h2>
<p>Les <strong>thérapies</strong> (notamment cognitivo-comportementales) sont très efficaces. Dans certains cas, un traitement médicamenteux peut être prescrit par un médecin, en complément. Le choix se fait au cas par cas.</p>

<h2>Quand consulter ?</h2>
<p>Si l'anxiété dure, vous empêche de travailler, de dormir ou de profiter de la vie, ou si surviennent des crises d'angoisse, parlez-en à un médecin. Une prise en charge précoce évite l'aggravation.</p>

<hr>
<p>Vous n'avez pas à affronter cela seul. Prenez rendez-vous en ligne avec un psychiatre près de chez vous, en toute confidentialité.</p>`;

const cDepression = `<p>La dépression est une vraie maladie, pas une simple baisse de moral ou un manque de volonté. Elle se caractérise par une tristesse durable et une perte d'intérêt qui altèrent la vie quotidienne. Elle se soigne, et plus tôt elle est prise en charge, mieux c'est.</p>

<h2>Reconnaître les signes</h2>
<p>On évoque une dépression quand plusieurs de ces signes persistent <strong>plus de deux semaines</strong>, presque tous les jours :</p>
<ul>
<li>Tristesse, vide ou découragement permanents</li>
<li>Perte d'intérêt et de plaisir pour les activités habituelles</li>
<li>Fatigue, manque d'énergie</li>
<li>Troubles du sommeil et de l'appétit</li>
<li>Difficultés de concentration, sentiment de culpabilité ou de dévalorisation</li>
<li>Idées noires ou pensées de mort</li>
</ul>

<h2>Ce n'est pas un manque de volonté</h2>
<p>La dépression a des causes biologiques, psychologiques et sociales. Dire à une personne déprimée de « se secouer » est inutile et culpabilisant : elle a besoin de soutien et de soins, pas d'injonctions.</p>

<h2>Comment se faire aider ?</h2>
<p>Le premier pas est d'en parler — à un proche, à son médecin. La prise en charge associe selon les cas <strong>psychothérapie</strong> et, pour les formes modérées à sévères, <strong>traitement antidépresseur</strong> prescrit et suivi par un médecin. La guérison est la règle, même si elle prend du temps.</p>

<h2>Urgence : les idées suicidaires</h2>
<p>Si vous ou un proche avez des pensées de mort ou de suicide, ce n'est pas un tabou : il faut consulter en urgence ou contacter un service d'aide sans attendre. Parler peut sauver une vie.</p>

<h2>Soutenir un proche</h2>
<p>Écouter sans juger, ne pas minimiser, encourager à consulter et accompagner : le soutien de l'entourage joue un rôle important dans la guérison.</p>

<hr>
<p>La dépression se soigne. Prenez rendez-vous en ligne avec un psychiatre près de chez vous, en toute confidentialité.</p>`;

const cSommeil = `<p>Bien dormir est essentiel à la santé physique et mentale. L'insomnie — difficulté à s'endormir, réveils nocturnes ou réveil trop précoce — touche de nombreuses personnes. Souvent, des mesures simples suffisent à retrouver un bon sommeil.</p>

<h2>Qu'est-ce que l'insomnie ?</h2>
<p>C'est une difficulté à dormir malgré des conditions favorables, avec un retentissement le lendemain (fatigue, irritabilité, baisse de concentration). Elle peut être passagère (stress, événement) ou s'installer dans la durée.</p>

<h2>Les causes fréquentes</h2>
<ul>
<li><strong>Stress et anxiété</strong>, ruminations au coucher</li>
<li>Mauvaises habitudes : écrans, café, siestes longues</li>
<li>Environnement : bruit, lumière, chaleur</li>
<li>Certaines maladies ou douleurs</li>
</ul>

<h2>Les règles d'un bon sommeil</h2>
<table>
<thead><tr><th>À faire</th><th>À éviter</th></tr></thead>
<tbody>
<tr><td>Horaires de coucher et de lever réguliers</td><td>Écrans au lit</td></tr>
<tr><td>Chambre sombre, calme et fraîche</td><td>Café et thé en fin de journée</td></tr>
<tr><td>Activité physique en journée</td><td>Repas lourds le soir</td></tr>
<tr><td>Se lever si on ne dort pas après 20 min</td><td>Siestes longues en après-midi</td></tr>
</tbody>
</table>

<h2>Faut-il des somnifères ?</h2>
<p>Les somnifères ne traitent pas la cause et exposent à une dépendance : ils ne doivent être pris que sur prescription, pour une courte durée. Les thérapies du sommeil (notamment cognitivo-comportementales) sont plus efficaces sur le long terme.</p>

<h2>Quand consulter ?</h2>
<p>Si l'insomnie dure plusieurs semaines, retentit sur vos journées, ou s'accompagne d'anxiété ou de tristesse, parlez-en à un médecin. Un trouble du sommeil persistant peut être le signe d'un autre trouble à prendre en charge.</p>

<hr>
<p>Un sommeil de qualité se retrouve. Prenez rendez-vous en ligne avec un médecin près de chez vous.</p>`;

const cPsyPsy = `<p>Face à une souffrance psychique, on hésite souvent entre psychiatre et psychologue. Comprendre leurs rôles aide à s'orienter vers le bon professionnel, voire à combiner les deux.</p>

<h2>Le psychiatre</h2>
<p>C'est un <strong>médecin</strong> spécialisé en santé mentale. Il pose un diagnostic, peut <strong>prescrire des médicaments</strong> et assure le suivi médical. On le consulte notamment pour les troubles modérés à sévères (dépression, troubles anxieux importants, troubles bipolaires…).</p>

<h2>Le psychologue</h2>
<p>Ce n'est pas un médecin : il ne prescrit pas de médicaments. Il accompagne par la <strong>parole et les thérapies</strong> (soutien, thérapies cognitivo-comportementales…). On le consulte pour un accompagnement psychologique, une difficulté de vie, un travail sur soi.</p>

<h2>Tableau comparatif</h2>
<table>
<thead><tr><th></th><th>Psychiatre</th><th>Psychologue</th></tr></thead>
<tbody>
<tr><td>Médecin</td><td>Oui</td><td>Non</td></tr>
<tr><td>Prescrit des médicaments</td><td>Oui</td><td>Non</td></tr>
<tr><td>Thérapies par la parole</td><td>Possible</td><td>Oui (cœur de métier)</td></tr>
<tr><td>Remboursement AMO</td><td>Oui (consultation médicale)</td><td>Variable</td></tr>
</tbody>
</table>

<h2>Lequel consulter en premier ?</h2>
<p>En cas de doute, le <strong>médecin généraliste</strong> est un bon point de départ : il évalue la situation et oriente. Pour une souffrance intense, des idées noires ou un besoin de traitement, le psychiatre est indiqué. Pour un accompagnement par la parole, le psychologue.</p>

<h2>Les deux sont complémentaires</h2>
<p>Dans de nombreux cas, le suivi associe un traitement (psychiatre) et une thérapie (psychologue). L'essentiel est de faire le premier pas.</p>

<hr>
<p>Quel que soit votre besoin, ne restez pas seul. Prenez rendez-vous en ligne avec un psychiatre près de chez vous, en toute confidentialité.</p>`;

const PILLAR = {
  title: "Santé mentale au Maroc : comprendre et agir",
  slug: "sante-mentale-guide-maroc",
  excerpt: "Anxiété, dépression, stress, sommeil : comprendre la santé mentale, briser le tabou et savoir quand et qui consulter au Maroc. Le guide pour aller mieux.",
  content: cPilier,
  aboutEntity: null,
  metaTitle: "Santé mentale au Maroc : comprendre et agir",
  metaDesc: "Le guide de la santé mentale au Maroc : anxiété, dépression, stress, troubles du sommeil, quand consulter et différence psychiatre / psychologue. Briser le tabou.",
  readingTime: 5,
  keyTakeaways: [
    "La santé mentale se soigne, comme la santé physique.",
    "Troubles fréquents : anxiété, dépression, burn-out, troubles du sommeil.",
    "Consulter dès que la souffrance dure, perturbe le quotidien ou s'accompagne d'idées noires.",
    "Le psychiatre (médecin) diagnostique et traite ; le psychologue accompagne par la parole.",
  ],
  faq: [
    { q: "Quand consulter pour un problème de santé mentale ?", a: "Lorsque la souffrance dure, perturbe le quotidien (sommeil, travail, relations) ou s'accompagne d'idées noires. Il n'est jamais trop tôt : consulter est un signe de force, pas de faiblesse." },
    { q: "Quelle différence entre psychiatre et psychologue ?", a: "Le psychiatre est un médecin : il diagnostique et peut prescrire un traitement. Le psychologue accompagne par la parole et les thérapies. Les deux sont souvent complémentaires." },
  ],
};

const SATELLITES = [
  {
    title: "Anxiété et troubles anxieux : symptômes et solutions",
    slug: "anxiete-troubles-anxieux-maroc",
    excerpt: "Anxiété normale ou trouble anxieux, symptômes psychiques et physiques, crises d'angoisse, solutions au quotidien et traitements efficaces.",
    content: cAnxiete,
    aboutEntity: "Trouble anxieux",
    metaTitle: "Anxiété et troubles anxieux : symptômes et solutions",
    metaDesc: "Anxiété ou trouble anxieux ? Symptômes psychiques et physiques, crises d'angoisse, gestes au quotidien et traitements efficaces (thérapies). Quand consulter au Maroc.",
    readingTime: 5,
    keyTakeaways: [
      "L'anxiété devient un trouble quand elle est excessive, permanente et handicapante.",
      "Symptômes psychiques (inquiétude) et physiques (palpitations, tensions, sommeil).",
      "Activité physique, respiration, sommeil régulier et moins de café aident.",
      "Les thérapies (TCC) sont très efficaces, parfois associées à un traitement.",
    ],
    faq: [
      { q: "Comment différencier anxiété normale et trouble anxieux ?", a: "L'anxiété est normale face à un stress ponctuel. On parle de trouble quand l'inquiétude est disproportionnée, quasi permanente, difficile à contrôler et qu'elle dure plusieurs mois en handicapant le quotidien." },
      { q: "Comment soigner l'anxiété ?", a: "Les thérapies, notamment cognitivo-comportementales, sont très efficaces. Des mesures d'hygiène de vie (activité physique, respiration, sommeil) aident, et un traitement peut être prescrit par un médecin dans certains cas." },
    ],
  },
  {
    title: "Dépression : reconnaître les signes et se faire aider",
    slug: "depression-symptomes-aide-maroc",
    excerpt: "La dépression est une maladie qui se soigne. Reconnaître les signes, comprendre que ce n'est pas un manque de volonté et savoir comment se faire aider.",
    content: cDepression,
    aboutEntity: "Dépression",
    metaTitle: "Dépression : reconnaître les signes et se faire aider",
    metaDesc: "Dépression : symptômes à reconnaître (tristesse durable, perte d'intérêt, fatigue), pourquoi ce n'est pas un manque de volonté et comment se faire aider au Maroc.",
    readingTime: 5,
    keyTakeaways: [
      "La dépression est une maladie, pas un manque de volonté ; elle se soigne.",
      "Signes durant plus de 2 semaines : tristesse, perte d'intérêt, fatigue, troubles du sommeil.",
      "Prise en charge : psychothérapie et, si besoin, antidépresseur suivi par un médecin.",
      "Idées suicidaires = urgence : consulter ou contacter un service d'aide sans attendre.",
    ],
    faq: [
      { q: "Quels sont les signes d'une dépression ?", a: "Une tristesse ou un vide durable, une perte d'intérêt et de plaisir, de la fatigue, des troubles du sommeil et de l'appétit, des difficultés de concentration, persistant plus de deux semaines presque tous les jours." },
      { q: "La dépression se soigne-t-elle ?", a: "Oui. La prise en charge associe psychothérapie et, pour les formes modérées à sévères, un traitement antidépresseur prescrit et suivi par un médecin. La guérison est la règle, même si elle prend du temps." },
    ],
  },
  {
    title: "Troubles du sommeil et insomnie : que faire",
    slug: "troubles-sommeil-insomnie-maroc",
    excerpt: "Causes de l'insomnie, règles d'un bon sommeil, place des somnifères et quand consulter : retrouver un sommeil de qualité, au Maroc.",
    content: cSommeil,
    aboutEntity: "Insomnie",
    metaTitle: "Insomnie et troubles du sommeil : que faire au Maroc",
    metaDesc: "Insomnie : causes, règles d'un bon sommeil, pourquoi limiter les somnifères et quand consulter. Retrouver un sommeil de qualité par des mesures simples.",
    readingTime: 4,
    keyTakeaways: [
      "L'insomnie a un retentissement le lendemain : fatigue, irritabilité, concentration.",
      "Stress, écrans, café et environnement sont des causes fréquentes.",
      "Horaires réguliers, chambre fraîche et sombre, pas d'écran au lit.",
      "Les somnifères ne traitent pas la cause : sur prescription et courte durée seulement.",
    ],
    faq: [
      { q: "Comment retrouver le sommeil naturellement ?", a: "Gardez des horaires réguliers, une chambre sombre, calme et fraîche, évitez les écrans au lit et le café en fin de journée, faites de l'activité physique en journée et levez-vous si vous ne dormez pas après 20 minutes." },
      { q: "Les somnifères sont-ils une bonne solution ?", a: "Ils ne traitent pas la cause et exposent à une dépendance. Ils ne doivent être pris que sur prescription et pour une courte durée. Les thérapies du sommeil sont plus efficaces sur le long terme." },
    ],
  },
  {
    title: "Psychiatre ou psychologue : qui consulter et quand",
    slug: "psychiatre-ou-psychologue-maroc",
    excerpt: "Rôles, différences, remboursement et lequel consulter en premier : bien s'orienter entre psychiatre et psychologue au Maroc.",
    content: cPsyPsy,
    aboutEntity: null,
    metaTitle: "Psychiatre ou psychologue : qui consulter au Maroc ?",
    metaDesc: "Psychiatre ou psychologue : quelles différences, qui prescrit, remboursement AMO et lequel consulter en premier selon votre situation au Maroc.",
    readingTime: 4,
    keyTakeaways: [
      "Le psychiatre est un médecin : il diagnostique et peut prescrire un traitement.",
      "Le psychologue accompagne par la parole et les thérapies, sans prescrire.",
      "En cas de doute, le généraliste évalue et oriente.",
      "Les deux sont souvent complémentaires : l'essentiel est de faire le premier pas.",
    ],
    faq: [
      { q: "Faut-il voir un psychiatre ou un psychologue ?", a: "Pour une souffrance intense, des idées noires ou un besoin de traitement, le psychiatre (médecin) est indiqué. Pour un accompagnement par la parole, le psychologue. En cas de doute, le généraliste oriente." },
      { q: "Le psychologue est-il remboursé au Maroc ?", a: "La consultation chez le psychiatre, en tant qu'acte médical, est prise en charge par l'AMO selon le barème. Le remboursement des séances de psychologue est plus variable : renseignez-vous auprès de votre organisme." },
    ],
  },
];

// Article existant à intégrer (rattaché + déplacé dans la catégorie santé mentale).
const EXISTING = [
  { slug: "stress-chronique-burn-out-maroc", aboutEntity: "Burn-out", moveCategory: true },
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

  for (const ex of EXISTING) {
    const post = await prisma.post.update({
      where: { slug: ex.slug },
      data: { pillarId: pillar.id, aboutEntity: ex.aboutEntity, ...(ex.moveCategory && { categoryId: cat.id }) },
      select: { slug: true },
    });
    console.log(`✓ Rattaché  /blog/${post.slug}  (about: ${ex.aboutEntity})`);
  }

  console.log(`\nCocon Santé mentale : 1 pilier + ${SATELLITES.length + EXISTING.length} satellites.`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
