require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// DERNIER COCON MALADIE — Sinusite (sinusite-maroc → médecine générale).
// 3 satellites : sinusite chronique · antibiotiques (bon usage) · lavages de nez.
// Idempotent (upsert). Repli spécialiste : médecine générale (catégorie).
// ════════════════════════════════════════════════════════════════════════════

const cChronique = `<p>On parle de sinusite chronique lorsque l'inflammation des sinus dure (au-delà de plusieurs semaines) ou revient souvent. Différente de la <a href="/blog/sinusite-maroc">sinusite aiguë</a> passagère, elle justifie de rechercher une cause et parfois un avis ORL.</p>

<h2>Qu'est-ce que la sinusite chronique ?</h2>
<p>C'est une inflammation persistante ou récidivante des sinus, avec nez bouché, écoulement, pesanteur du visage et parfois baisse de l'odorat qui traînent.</p>

<h2>Les causes possibles</h2>
<ul>
<li><a href="/blog/allergie-maroc">Allergie</a> (rhinite allergique)</li>
<li>Déviation de la cloison nasale, polypes du nez</li>
<li>Problème dentaire, tabac, pollution</li>
</ul>

<h2>Que faire ?</h2>
<p>Les <a href="/blog/lavage-nez-soulager-sinusite-maroc">lavages de nez</a> réguliers et le traitement d'une allergie aident. Un avis ORL est utile pour rechercher la cause (parfois par imagerie ou examen du nez) et proposer un traitement adapté.</p>

<h2>Quand consulter ?</h2>
<p>Devant des symptômes qui durent ou reviennent souvent, gênent le quotidien, ou s'accompagnent de signes inhabituels. Repérer et traiter la cause permet souvent d'espacer nettement les épisodes.</p>

<hr>
<p>Une sinusite qui traîne ou revient ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const chroniqueFaq = [
  { q: "Qu'est-ce qu'une sinusite chronique ?", a: "C'est une inflammation des sinus qui persiste plusieurs semaines ou revient souvent, avec nez bouché, écoulement, pesanteur du visage et parfois baisse de l'odorat. Elle se distingue de la sinusite aiguë passagère et justifie de rechercher une cause." },
  { q: "Pourquoi mes sinusites reviennent-elles ?", a: "Des sinusites récidivantes peuvent être favorisées par une allergie, une déviation de la cloison nasale, des polypes du nez, un problème dentaire, le tabac ou la pollution. Un avis ORL permet d'en rechercher la cause et d'adapter le traitement." },
  { q: "Comment soigner une sinusite chronique ?", a: "Par des lavages de nez réguliers, le traitement d'une allergie éventuelle, et selon la cause, un avis ORL (parfois imagerie ou examen du nez). Repérer et traiter la cause permet souvent d'espacer nettement les épisodes." },
  { q: "Quand consulter un ORL pour une sinusite ?", a: "En cas de sinusites qui durent, reviennent souvent, gênent le quotidien ou s'accompagnent de signes inhabituels. L'ORL recherche une cause (allergie, cloison, polypes, dent) et propose un traitement adapté, parfois après imagerie." },
  { q: "La sinusite chronique est-elle grave ?", a: "Le plus souvent non, mais elle est gênante et altère la qualité de vie. Les complications sont rares. L'essentiel est d'en trouver la cause pour la traiter et éviter les récidives, plutôt que de multiplier les traitements ponctuels." },
];
const chroniqueTk = [
  "La sinusite chronique dure ou revient souvent, contrairement à la forme aiguë.",
  "Causes à rechercher : allergie, cloison, polypes, dent, tabac.",
  "Lavages de nez, traitement de l'allergie et avis ORL aident.",
  "Repérer la cause permet d'espacer nettement les épisodes.",
];

const cAntibio = `<p>Faut-il des antibiotiques pour une <a href="/blog/sinusite-maroc">sinusite</a> ? Le plus souvent non : la majorité des sinusites sont virales et guérissent seules. Les antibiotiques ne sont utiles que dans certains cas précis.</p>

<h2>La plupart des sinusites sont virales</h2>
<p>Comme le rhume, la sinusite aiguë est généralement due à un virus. Elle guérit en quelques jours avec des soins simples ; les antibiotiques n'y changent rien et exposent inutilement à des effets et à la résistance.</p>

<h2>Quand les antibiotiques sont-ils utiles ?</h2>
<p>Le médecin peut les prescrire en cas de <strong>sinusite bactérienne</strong> probable : symptômes qui s'aggravent après une amélioration, qui se prolongent au-delà d'une dizaine de jours, douleur intense d'un côté, fièvre élevée persistante.</p>

<h2>Que faire en attendant ?</h2>
<ul>
<li><a href="/blog/lavage-nez-soulager-sinusite-maroc">Lavages de nez</a>, antalgiques contre la douleur et la fièvre.</li>
<li>Bonne hydratation, repos.</li>
</ul>

<blockquote>Attention : consultez sans délai en cas de gonflement ou rougeur autour d'un œil, de troubles de la vision, de maux de tête très violents ou de fièvre élevée avec état général altéré — signes rares de complication.</blockquote>

<hr>
<p>Une sinusite qui ne passe pas ? Sur SantéauMaroc, trouvez un médecin près de chez vous. Seul un médecin décide de la nécessité d'un antibiotique.</p>`;
const antibioSinusFaq = [
  { q: "Faut-il des antibiotiques pour une sinusite ?", a: "Le plus souvent non : la majorité des sinusites sont virales et guérissent seules en quelques jours. Les antibiotiques ne sont utiles que dans les formes bactériennes probables ou qui se prolongent, sur décision du médecin." },
  { q: "Quand une sinusite nécessite-t-elle un antibiotique ?", a: "En cas de sinusite bactérienne probable : symptômes qui s'aggravent après une amélioration, qui durent au-delà d'une dizaine de jours, douleur intense d'un côté du visage ou fièvre élevée persistante. Le médecin en juge." },
  { q: "Comment soulager une sinusite sans antibiotique ?", a: "Par des lavages de nez au sérum physiologique ou à l'eau de mer, des antalgiques contre la douleur et la fièvre, une bonne hydratation et du repos. Ces mesures suffisent pour la plupart des sinusites, qui sont virales." },
  { q: "Prendre des antibiotiques pour rien est-il risqué ?", a: "Oui : cela expose inutilement à des effets indésirables et favorise l'antibiorésistance, sans accélérer la guérison d'une sinusite virale. C'est pourquoi ils ne sont prescrits que lorsqu'ils sont vraiment utiles." },
  { q: "Quand une sinusite est-elle une urgence ?", a: "En cas de gonflement ou de rougeur autour d'un œil, de troubles de la vision, de maux de tête très violents ou de fièvre élevée avec état général altéré. Ces signes rares de complication imposent de consulter sans délai." },
];
const antibioSinusTk = [
  "La plupart des sinusites sont virales et guérissent seules.",
  "Antibiotiques réservés aux formes bactériennes probables ou prolongées.",
  "Soulager : lavages de nez, antalgiques, hydratation, repos.",
  "Gonflement autour de l'œil, troubles visuels ou forte fièvre = urgence.",
];

const cLavageNez = `<p>Le lavage de nez est le geste le plus simple et le plus efficace pour soulager une <a href="/blog/sinusite-maroc">sinusite</a>, un rhume ou une rhinite. Il dégage le nez et aide les sinus à se drainer, sans médicament.</p>

<h2>Pourquoi laver son nez ?</h2>
<p>Le lavage élimine le mucus et les sécrétions, humidifie la muqueuse et améliore la respiration. Il réduit la sensation de nez bouché et favorise le drainage des sinus.</p>

<h2>Avec quoi ?</h2>
<p>Du <strong>sérum physiologique</strong> ou de l'<strong>eau de mer</strong> (en dosettes ou spray), disponibles en pharmacie. Pour les grands volumes, des solutions de lavage adaptées existent.</p>

<h2>Comment faire ?</h2>
<ul>
<li>Pencher la tête au-dessus du lavabo, sur le côté.</li>
<li>Introduire la solution dans la narine du haut ; elle ressort par l'autre narine ou la bouche.</li>
<li>Se moucher doucement, une narine après l'autre. Répéter plusieurs fois par jour si besoin.</li>
</ul>

<h2>Chez le bébé et l'enfant</h2>
<p>Le lavage de nez au sérum physiologique est très utile chez le nourrisson (avant les repas et le coucher), en couchant l'enfant sur le côté. C'est un geste clé lors des rhumes et de la bronchiolite.</p>

<h2>Bon à savoir</h2>
<p>Utiliser une solution propre, un matériel individuel et nettoyé. Le lavage de nez complète, sans les remplacer, les traitements prescrits en cas de sinusite qui se prolonge.</p>

<hr>
<p>Une sinusite ou un nez bouché tenace ? Sur SantéauMaroc, trouvez un médecin près de chez vous et prenez rendez-vous en ligne.</p>`;
const lavageNezFaq = [
  { q: "Comment bien se laver le nez ?", a: "Penchez la tête au-dessus du lavabo, sur le côté, introduisez du sérum physiologique ou de l'eau de mer dans la narine du haut (elle ressort par l'autre narine ou la bouche), puis mouchez-vous doucement une narine après l'autre. Répétez plusieurs fois par jour si besoin." },
  { q: "Le lavage de nez soulage-t-il la sinusite ?", a: "Oui, c'est l'un des gestes les plus efficaces : il élimine le mucus, humidifie la muqueuse, améliore la respiration et favorise le drainage des sinus, sans médicament. Il complète les antalgiques et, si besoin, les traitements prescrits." },
  { q: "Avec quoi laver le nez ?", a: "Avec du sérum physiologique ou de l'eau de mer (en dosettes ou spray), disponibles en pharmacie. Pour de plus grands volumes, des solutions de lavage adaptées existent. Utilisez une solution propre et un matériel individuel." },
  { q: "Peut-on laver le nez d'un bébé ?", a: "Oui, c'est même très utile chez le nourrisson, au sérum physiologique, avant les repas et le coucher, en le couchant sur le côté. C'est un geste clé lors des rhumes et de la bronchiolite pour l'aider à mieux respirer et à téter." },
  { q: "À quelle fréquence laver son nez ?", a: "Plusieurs fois par jour pendant un rhume ou une sinusite, selon la gêne. Il n'y a pas de risque à répéter les lavages au sérum physiologique. En dehors des épisodes, un lavage n'est pas nécessaire de façon systématique." },
];
const lavageNezTk = [
  "Le lavage de nez dégage le nez et aide les sinus à se drainer, sans médicament.",
  "Utiliser du sérum physiologique ou de l'eau de mer, tête penchée sur le côté.",
  "Très utile chez le nourrisson (avant repas et coucher), sur le côté.",
  "Il complète, sans les remplacer, les traitements prescrits si besoin.",
];

const SATELLITES = [
  { slug:"sinusite-chronique-maroc", aboutEntity:"Sinusite chronique",
    title:"Sinusite chronique : causes et prise en charge",
    excerpt:"Sinusite chronique : ce qui la distingue de la forme aiguë, ses causes (allergie, cloison, polypes), comment la prendre en charge et quand voir un ORL. Adapté au Maroc.",
    metaTitle:"Sinusite chronique : causes et traitement | Maroc",
    metaDesc:"Sinusite chronique : différence avec la forme aiguë, causes (allergie, déviation, polypes, dent), prise en charge et quand consulter un ORL. Guide clair adapté au Maroc.",
    readingTime:4, content:cChronique, keyTakeaways:chroniqueTk, faq:chroniqueFaq },
  { slug:"sinusite-antibiotiques-maroc", aboutEntity:"Sinusite",
    title:"Sinusite : faut-il des antibiotiques ?",
    excerpt:"Sinusite et antibiotiques : pourquoi la plupart sont virales, quand les antibiotiques sont utiles, comment soulager en attendant et les signes d'urgence. Adapté au Maroc.",
    metaTitle:"Sinusite : faut-il des antibiotiques ? | Maroc",
    metaDesc:"Sinusite et antibiotiques : la plupart des sinusites sont virales, quand les antibiotiques sont utiles, comment soulager sans, et signes d'urgence. Guide clair adapté au Maroc.",
    readingTime:4, content:cAntibio, keyTakeaways:antibioSinusTk, faq:antibioSinusFaq },
  { slug:"lavage-nez-soulager-sinusite-maroc", aboutEntity:"Sinusite",
    title:"Lavage de nez : bien le faire pour soulager sinusite et rhume",
    excerpt:"Lavage de nez : pourquoi et comment le faire au sérum physiologique ou à l'eau de mer, chez l'adulte et le bébé, pour soulager sinusite, rhume et rhinite. Adapté au Maroc.",
    metaTitle:"Lavage de nez : bien le faire pour soulager | Maroc",
    metaDesc:"Lavage de nez : pourquoi et comment le faire (sérum physiologique, eau de mer), chez l'adulte et le nourrisson, pour soulager sinusite, rhume et rhinite. Guide clair adapté au Maroc.",
    readingTime:4, content:cLavageNez, keyTakeaways:lavageNezTk, faq:lavageNezFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.findUnique({ where: { slug: "maladies-traitements" }, select: { id: true } });
  const pilier = await prisma.post.update({ where: { slug: "sinusite-maroc" }, data: { pillarId: null }, select: { id: true, slug: true } });
  console.log(`◆ ${pilier.slug}`);
  const now = new Date();
  for (const art of SATELLITES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:cat.id, metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, pillarId:pilier.id, reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`  ↳ ${post.slug}`);
  }
  console.log(`\nCocon Sinusite : ${SATELLITES.length} satellites publiés.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
