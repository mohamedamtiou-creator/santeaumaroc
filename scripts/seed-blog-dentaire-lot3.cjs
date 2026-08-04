require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// VERTICAL DENTAIRE — LOT 3 : consolidation du cocon avec le socle
// informationnel du vertical (la carie), rattaché au pilier « mal de dents ».
//
// Mêmes garde-fous que les lots 1 et 2 : aucun montant en dirhams
// (lib/prix-reference.ts), aucune posologie, urgences « 141 (SAMU) ou le 15 »,
// maillage silo complet.
//
//   node scripts/seed-blog-dentaire-lot3.cjs
// ════════════════════════════════════════════════════════════════════════════

const PILLAR_SLUG = "mal-de-dents-rage-de-dents-maroc";

const content = `<p>La carie est la maladie chronique la plus répandue au monde, et elle a une particularité qui explique presque tous les dégâts qu'elle provoque : <strong>elle ne fait pas mal au début</strong>. Elle s'installe pendant des mois, parfois des années, dans un silence complet. Quand la douleur arrive, l'essentiel du travail de destruction est déjà fait, et le soin qui aurait pris quinze minutes devient une dévitalisation, une couronne, ou une extraction.</p>

<p>Au Maroc, l'enquête nationale de santé bucco-dentaire du ministère de la Santé donne la mesure du problème : <strong>92 % des adultes de 35 à 44 ans</strong> sont touchés, 81 % des enfants de 12 ans, et 27 % des adultes n'ont jamais consulté de dentiste. Cet article explique comment une carie se forme, comment la repérer avant la douleur, ce que chaque stade implique en soins, et les gestes de prévention dont l'efficacité est réellement démontrée.</p>

<h2>Comment une carie se forme</h2>

<p>Trois éléments doivent se rencontrer : des <strong>bactéries</strong>, qui vivent normalement dans la bouche et forment la plaque dentaire ; des <strong>sucres fermentescibles</strong>, qu'elles transforment en acides ; et du <strong>temps</strong>. Chaque prise de sucre déclenche une attaque acide qui dissout les minéraux de l'émail pendant une vingtaine de minutes. Entre deux attaques, la salive neutralise l'acidité et reminéralise la surface — à condition qu'on lui laisse le temps de le faire.</p>

<blockquote>C'est le point le plus mal connu, et le plus utile : ce qui compte n'est pas tant la <em>quantité</em> de sucre que la <strong>fréquence</strong> des prises. Un verre de thé très sucré siroté pendant toute la matinée entretient une acidité continue et abîme plus l'émail qu'une pâtisserie mangée d'un coup en fin de repas. Même logique pour les boissons gazeuses, les jus industriels et le grignotage.</blockquote>

<p>Quand les attaques l'emportent sur la réparation, la déminéralisation se creuse et devient une cavité. À partir de là, le processus ne s'inverse plus tout seul : la carie ne se referme pas, elle progresse.</p>

<h2>Les quatre stades, et ce que chacun coûte en soins</h2>

<table>
<thead>
<tr><th>Stade</th><th>Ce que vous ressentez</th><th>Ce que fait le dentiste</th></tr>
</thead>
<tbody>
<tr><td><strong>1. Émail</strong></td><td>Rien. Parfois une tache blanche ou brune</td><td>Reminéralisation, surveillance, ou petite obturation. Une séance courte</td></tr>
<tr><td><strong>2. Dentine</strong></td><td>Sensibilité au froid, au chaud, au sucré, qui s'arrête vite</td><td>Nettoyage de la cavité et obturation (composite). Une séance</td></tr>
<tr><td><strong>3. Pulpe (pulpite)</strong></td><td>Douleur forte, continue, qui réveille la nuit : la rage de dents</td><td><a href="/comment-traiter/carie-dentaire">Dévitalisation</a> : nettoyage et obturation des canaux, puis reconstitution, souvent une couronne. Plusieurs séances</td></tr>
<tr><td><strong>4. Nécrose et <a href="/blog/abces-dentaire-maroc">abcès</a></strong></td><td>Douleur pulsatile, dent intouchable, gonflement, parfois fièvre</td><td>Drainage puis traitement du canal, ou extraction si la dent n'est pas récupérable</td></tr>
</tbody>
</table>

<p>Ce tableau est l'argument central de la prévention : entre le stade 1 et le stade 4, ce n'est pas la même maladie qu'on traite, c'est le même problème pris à quatre moments différents — avec un écart considérable de temps, d'inconfort et de coût.</p>

<h2>Les signes qui doivent alerter</h2>

<ul>
<li>Une <a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">sensibilité nouvelle</a> au froid, au chaud ou au sucré sur une dent précise.</li>
<li>Une tache blanche crayeuse, brune ou noire sur l'émail.</li>
<li>Un aliment qui se coince toujours au même endroit, ou du fil dentaire qui s'effiloche systématiquement au même espace.</li>
<li>Une rugosité ou un « trou » que la langue détecte.</li>
<li>Une <a href="/symptomes/mauvaise-haleine">mauvaise haleine</a> localisée, un mauvais goût.</li>
<li>Une douleur à la mastication, même brève.</li>
</ul>

<p>Deux situations trompent particulièrement. La carie <strong>entre deux dents</strong> ne se voit pas dans le miroir : seule une radiographie la révèle. Et la carie <strong>sous une ancienne obturation</strong> ou sous une couronne progresse à l'abri des regards. C'est précisément à cela que sert un contrôle annuel chez quelqu'un qui n'a mal à rien.</p>

<h2>Pourquoi on ne la sent pas au début</h2>

<p>L'émail ne contient aucune terminaison nerveuse : une lésion qui y reste confinée est indolore par construction. La sensibilité n'apparaît qu'en atteignant la dentine, traversée de canalicules qui transmettent les variations de température. Et la douleur franche n'arrive qu'à la pulpe, quand l'inflammation se produit dans une cavité fermée qui ne peut pas gonfler. Autrement dit : <strong>l'ordre d'apparition des symptômes suit la profondeur de la lésion</strong>, pas sa gravité initiale. Attendre la douleur pour consulter, c'est structurellement arriver en retard.</p>

<h2>Ce que le dentiste peut faire, selon le moment</h2>

<p>Le diagnostic associe l'examen clinique et la <strong>radiographie</strong>, indispensable pour les faces cachées et pour évaluer la proximité du nerf. Le traitement suit ce qui a été trouvé : reminéralisation et surveillance sur une lésion débutante ; nettoyage puis obturation quand la cavité est constituée ; dévitalisation quand le nerf est atteint ; reconstitution prothétique quand il ne reste plus assez de dent ; extraction en dernier recours, suivie d'une discussion sur le remplacement — bridge, prothèse ou <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant</a>.</p>

<p>Sur le plan financier, la logique est simple et vérifiable : plus le stade est précoce, plus l'acte est court et léger. Les honoraires étant libres dans le privé, demandez un <strong>devis écrit</strong> avant tout acte prothétique, et une prise en charge préalable quand elle est exigée. Nos pages <a href="/prix">tarifs des actes médicaux au Maroc</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> détaillent la mécanique du reste à charge, calculé sur la tarification nationale de référence — actuellement en cours de révision — et non sur le montant facturé.</p>

<h2>Chez l'enfant : les dents de lait comptent</h2>

<p>L'idée qu'une dent de lait cariée « va tomber de toute façon » coûte cher. Une carie sur une dent de lait fait mal, gêne l'alimentation, peut s'infecter au contact du germe de la dent définitive, et la perte prématurée d'une dent de lait perturbe l'alignement des dents qui suivent.</p>

<ul>
<li><strong>Dès la première dent</strong>, nettoyage avec une brosse adaptée ; dentifrice fluoré à la dose recommandée pour l'âge, indiquée par le praticien.</li>
<li><strong>Pas de biberon sucré au coucher</strong> ni de tétine trempée dans du miel ou du sucre : la salive diminue la nuit, l'attaque acide dure jusqu'au matin.</li>
<li><strong>Brossage supervisé</strong> par un adulte jusqu'à ce que le geste soit acquis, généralement vers 7-8 ans.</li>
<li><strong>Première visite tôt</strong>, puis contrôle régulier : l'enjeu est autant le dépistage que l'habituation au cabinet, qui évite la peur du dentiste à l'âge adulte.</li>
<li>En cas de fièvre ou de gonflement, voir notre article <a href="/blog/fievre-enfant-que-faire-maroc">fièvre de l'enfant</a> et notre <a href="/blog/sante-enfant-guide-maroc">guide de la santé de l'enfant</a>.</li>
</ul>

<h2>Après 60 ans : la carie du collet</h2>

<p>Chez la personne âgée, la carie change de visage. Elle ne se forme plus au sommet de la dent mais au <strong>collet</strong>, à la limite de la gencive rétractée, sur une surface de racine moins minéralisée que l'émail et donc plus vulnérable. Trois facteurs se cumulent : la récession gingivale liée aux <a href="/blog/parodontite-dechaussement-dents-maroc">maladies parodontales</a>, la <strong>sécheresse buccale</strong> provoquée par de nombreux traitements au long cours — voir <a href="/blog/polymedication-senior-maroc">la polymédication du senior</a> —, et la difficulté croissante du geste de brossage.</p>

<p>Ces caries évoluent vite et fragilisent la dent à sa base, avec un risque de fracture. Elles justifient un rythme de contrôle resserré, des brossettes plutôt que du fil quand les espaces se sont ouverts, un dentifrice à teneur en fluor adaptée sur avis du praticien, et l'attention portée à l'alimentation — voir <a href="/blog/nutrition-personne-agee-maroc">nutrition de la personne âgée</a>.</p>

<h2>La prévention, dans l'ordre d'efficacité</h2>

<ol>
<li><strong>Deux brossages par jour, deux minutes, avec un dentifrice fluoré.</strong> C'est la mesure dont le bénéfice est le mieux établi. Le fluor protège l'émail des attaques acides et favorise sa reminéralisation. Brosse à poils souples, changée environ tous les trois mois, mouvement de la gencive vers la dent, sans oublier les faces internes ni les dernières molaires.</li>
<li><strong>Le nettoyage entre les dents, une fois par jour</strong> — fil ou brossettes, choisies avec le praticien selon vos espaces. La brosse ne nettoie pas les faces où naissent la majorité des caries invisibles.</li>
<li><strong>Espacer les prises de sucre</strong> plus encore que les réduire : limiter le grignotage, le thé très sucré siroté longuement, les boissons gazeuses et les jus. Boire de l'eau après une prise sucrée aide.</li>
<li><strong>Un contrôle une à deux fois par an</strong>, même sans douleur, avec <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">détartrage</a> selon les besoins — c'est ce qui permet de traiter au stade 1 ou 2 plutôt qu'au stade 3.</li>
<li><strong>Ne pas fumer</strong> : le tabac et la chicha favorisent les <a href="/blog/parodontite-dechaussement-dents-maroc">maladies des gencives</a>, qui exposent les collets — zones où la carie s'installe facilement. Voir <a href="/blog/arret-tabac-sevrage-maroc">arrêter de fumer</a>.</li>
<li><strong>Signaler une bouche sèche</strong> : certains médicaments et certaines maladies réduisent la salive, donc la protection naturelle. Chez la personne <a href="/blog/diabete-type-2-maroc">diabétique</a>, le risque de carie et d'infection gingivale est majoré.</li>
</ol>

<p>Pour aller plus loin : <a href="/prevenir/carie-dentaire">prévenir la carie dentaire</a>, <a href="/prevenir/gingivite">prévenir la maladie des gencives</a> et la question <a href="/questions/comment-prevenir-les-caries-et-garder-des-dents-saines">comment prévenir les caries</a>.</p>

<h2>Ce qui ne protège pas</h2>

<ul>
<li><strong>Brosser plus fort ou plus longtemps.</strong> Un brossage agressif use l'émail et abîme la gencive ; c'est la technique et la régularité qui comptent.</li>
<li><strong>Les bains de bouche seuls.</strong> Ils ne remplacent aucun geste mécanique.</li>
<li><strong>Les dentifrices « blancheur » abrasifs</strong> et le <a href="/questions/blanchiment-des-dents-est-ce-sans-danger-pour-l-email-de-mes">blanchiment</a> répété sans avis : ils n'ont aucun effet préventif sur la carie.</li>
<li><strong>Attendre la douleur.</strong> Le seul moment où une carie est simple à traiter est celui où elle ne se manifeste pas.</li>
</ul>

<h2>En résumé</h2>

<p>La carie est une maladie lente, silencieuse et évitable, dont le coût final dépend presque entièrement du moment où on la prend. Deux brossages fluorés par jour, un nettoyage interdentaire quotidien, moins de prises sucrées et un contrôle annuel suffisent à éviter la grande majorité des soins lourds. En cas de douleur installée, voir notre guide <a href="/blog/mal-de-dents-rage-de-dents-maroc">mal de dents</a> ; pour savoir qui consulter, notre page <a href="/quel-medecin-pour/mal-de-dents">quel médecin pour un mal de dents</a>.</p>

<hr>

<p>Une tache, une sensibilité, ou simplement un contrôle en retard ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a>, consultez les profils vérifiés et les avis patients, et prenez rendez-vous en ligne gratuitement.</p>`;

const keyTakeaways = [
  "Une carie ne fait pas mal au début : l'émail n'a pas de nerf. Attendre la douleur, c'est arriver au stade de la dévitalisation.",
  "Ce qui abîme l'émail, c'est la fréquence des prises de sucre plus que la quantité : le thé très sucré siroté toute la matinée est pire qu'un dessert.",
  "Une carie constituée ne se referme jamais seule ; seul le stade débutant peut être reminéralisé.",
  "Les caries entre les dents et sous les anciennes obturations ne se voient qu'à la radiographie : c'est l'utilité du contrôle annuel sans symptôme.",
  "Chez l'enfant, une dent de lait cariée doit être soignée : elle fait mal, peut s'infecter et sa perte précoce dérègle l'alignement.",
  "Prévention par ordre d'efficacité : brossage fluoré 2 × 2 min, fil ou brossettes chaque jour, moins de prises sucrées, contrôle annuel.",
];

const faq = [
  { q: "Une carie peut-elle guérir toute seule ?", a: "Seule une lésion très débutante, limitée à l'émail, peut être reminéralisée grâce au fluor et à une hygiène rigoureuse. Dès qu'une cavité est constituée, le processus ne s'inverse plus : la carie progresse et nécessite un soin. C'est pourquoi le dépistage précoce change tout." },
  { q: "Comment savoir si j'ai une carie sans douleur ?", a: "Par des signes indirects : une tache blanche, brune ou noire, une sensibilité nouvelle au froid ou au sucré sur une dent, un aliment qui se coince toujours au même endroit, une rugosité détectée par la langue. Les caries entre les dents, elles, ne se voient qu'à la radiographie — d'où l'intérêt du contrôle annuel." },
  { q: "Combien de temps met une carie à atteindre le nerf ?", a: "C'est très variable : de quelques mois à plusieurs années, selon l'alimentation, l'hygiène, la qualité de la salive et la localisation de la lésion. Une carie peut évoluer rapidement chez un enfant ou en cas de bouche sèche, et rester longtemps stable chez quelqu'un dont l'hygiène est excellente." },
  { q: "Le sucre est-il vraiment la seule cause des caries ?", a: "C'est le carburant principal : les bactéries transforment les sucres en acides qui dissolvent l'émail. Mais d'autres facteurs pèsent : la fréquence des prises, l'hygiène, la quantité et la qualité de la salive, la position des dents, le tabac, certaines maladies et certains médicaments qui assèchent la bouche." },
  { q: "Le fluor est-il dangereux ?", a: "Aux doses des dentifrices, le fluor est efficace et sûr : c'est la mesure de prévention de la carie la mieux documentée. Le risque concerne les surdosages chez le jeune enfant, d'où l'importance d'utiliser une quantité adaptée à l'âge, indiquée par le chirurgien-dentiste, et de superviser le brossage." },
  { q: "Faut-il soigner une carie sur une dent de lait ?", a: "Oui. Une dent de lait cariée est douloureuse, peut s'infecter au contact du germe de la dent définitive, et sa perte prématurée perturbe l'alignement des dents suivantes. L'argument « elle va tomber de toute façon » conduit régulièrement à des soins plus lourds ensuite." },
  { q: "Une dent dévitalisée peut-elle encore se carier ?", a: "La dent ne ressent plus la douleur, mais elle peut se carier sur ses parties restantes, notamment sous une couronne ou au niveau du collet, et l'infection peut réapparaître à la pointe de la racine. Une dent dévitalisée demande donc la même hygiène et la même surveillance que les autres, sinon davantage." },
  { q: "À quelle fréquence faut-il voir le dentiste sans douleur ?", a: "Une à deux fois par an pour la plupart des adultes, avec un détartrage selon les besoins. Le rythme est resserré en cas de risque élevé : diabète, tabac, bouche sèche, maladie des gencives, antécédents de caries multiples, grossesse, ou appareil orthodontique." },
];

const sources = [
  { label: "Symptômes et évolution de la carie dentaire", url: "https://www.ameli.fr/assure/sante/themes/carie-dentaire/symptomes-diagnostic", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Prévenir les caries dentaires", url: "https://www.ameli.fr/assure/sante/themes/carie-dentaire/prevention", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Comment bien se brosser les dents ?", url: "https://www.ameli.fr/assure/sante/bons-gestes/quotidien/brosser-dents", publisher: "Assurance Maladie (ameli.fr)" },
  { label: "Santé bucco-dentaire — principaux repères", url: "https://www.who.int/fr/news-room/fact-sheets/detail/oral-health", publisher: "Organisation mondiale de la Santé (OMS)", year: "2025" },
  { label: "Enquête nationale de santé bucco-dentaire : prévalence de la carie au Maroc", url: "https://aujourdhui.ma/societe/les-marocains-negligent-leur-hygiene-bucco-dentaire", publisher: "Ministère de la Santé (via Aujourd'hui le Maroc)", year: "2018" },
];

const ARTICLE = {
  slug: "carie-dentaire-maroc",
  categorySlug: "maladies-traitements",
  aboutEntity: "Carie dentaire",
  title: "Carie dentaire : la repérer avant la douleur et éviter la dévitalisation",
  excerpt:
    "La carie ne fait pas mal au début, et c'est tout le problème. Comment elle se forme, comment la repérer avant la rage de dents, ce que chaque stade implique en soins, et les gestes de prévention réellement efficaces. Un guide complet adapté au Maroc.",
  metaTitle: "Carie dentaire : signes, soins, prévention",
  metaDesc:
    "Carie dentaire : les quatre stades et les soins associés, les signes à repérer sans douleur, l'enfant et la prévention. Adapté au Maroc.",
  // Doit rester ALIGNÉ sur l'entrée MAP de scripts/gen-blog-post-covers.cjs.
  coverAlt: "Brossage des dents avec une brosse souple et un dentifrice fluoré",
};

function words(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  // Signature de relecture : compte de rédaction dédié, pas le compte technique
  // d'administration (cf. scripts/seed-editorial-reviewer.cjs).
  const reviewer = await prisma.user.findUnique({ where: { email: "redaction@santeaumaroc.com" }, select: { id: true } });
  if (!reviewer) { console.error("Compte de rédaction absent : lancer d'abord scripts/seed-editorial-reviewer.cjs"); process.exit(1); }

  const pillar = await prisma.post.findUnique({ where: { slug: PILLAR_SLUG }, select: { id: true } });
  if (!pillar) { console.error(`Pilier « ${PILLAR_SLUG} » introuvable : lancer d'abord seed-blog-dentaire.cjs.`); process.exit(1); }

  const cat = await prisma.postCategory.findUnique({ where: { slug: ARTICLE.categorySlug }, select: { id: true } });
  if (!cat) { console.error(`Catégorie « ${ARTICLE.categorySlug} » introuvable.`); process.exit(1); }

  const n = words(content);
  const now = new Date();
  const data = {
    title: ARTICLE.title, excerpt: ARTICLE.excerpt, content, categoryId: cat.id,
    metaTitle: ARTICLE.metaTitle, metaDesc: ARTICLE.metaDesc, coverAlt: ARTICLE.coverAlt,
    readingTime: Math.max(1, Math.round(n / 200)),
    keyTakeaways: keyTakeaways.join("\n"),
    faqJson: JSON.stringify(faq),
    sources: JSON.stringify(sources),
    aboutEntity: ARTICLE.aboutEntity,
    pillarId: pillar.id,
    reviewedById: reviewer.id, reviewedAt: now,
  };
  const post = await prisma.post.upsert({
    where: { slug: ARTICLE.slug },
    update: data,
    create: { ...data, slug: ARTICLE.slug, authorId: admin.id, status: "PUBLISHED", publishedAt: now },
    select: { slug: true, readingTime: true },
  });
  console.log(`  ↳ /blog/${post.slug}`);
  console.log(`     ${n} mots · ${post.readingTime} min · ${faq.length} FAQ · ${sources.length} sources · ${(content.match(/href="/g) || []).length} liens`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
