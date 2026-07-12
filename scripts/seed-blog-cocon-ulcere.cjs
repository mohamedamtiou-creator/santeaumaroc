require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// COCON ULCÈRE / GASTRITE — dernier pilier Maladie autonome (ulcere-estomac-maroc).
// 3 satellites → gastro-entérologie : Helicobacter pylori · gastrite · ulcère & AINS.
// Idempotent (upsert). Mappings : lib/blog-related.ts.
// ════════════════════════════════════════════════════════════════════════════

const cHp = `<p><em>Helicobacter pylori</em> est une bactérie très répandue qui colonise l'estomac. Souvent silencieuse, elle est la première cause d'<a href="/blog/ulcere-estomac-maroc">ulcère</a> et de gastrite, et augmente le risque de cancer de l'estomac. La détecter et la traiter change la donne.</p>

<h2>Qu'est-ce qu'Helicobacter pylori ?</h2>
<p>C'est une bactérie qui vit dans la muqueuse de l'estomac. Très fréquente, elle s'acquiert souvent dans l'enfance. Beaucoup de personnes la portent sans symptôme, mais elle peut fragiliser la paroi et provoquer gastrite et ulcère.</p>

<h2>Comment la détecte-t-on ?</h2>
<ul>
<li><strong>Test respiratoire</strong> à l'urée (simple, non invasif)</li>
<li>Recherche sur des <strong>biopsies</strong> lors d'une <a href="/blog/gastroscopie-maroc">gastroscopie</a></li>
<li>Autres tests (selles, sang) selon les situations</li>
</ul>

<h2>Le traitement d'éradication</h2>
<p>Il associe des <strong>antibiotiques</strong> et un médicament antiacide (IPP) pendant une durée définie. Il est essentiel de <strong>bien suivre le traitement jusqu'au bout</strong> pour éliminer la bactérie et éviter les résistances. Un contrôle vérifie ensuite l'éradication.</p>

<h2>Pourquoi la traiter ?</h2>
<p>Éradiquer <em>H. pylori</em> guérit la plupart des ulcères qui lui sont dus, réduit fortement les récidives et diminue le risque de cancer de l'estomac. C'est pourquoi on la recherche devant un ulcère ou certains symptômes.</p>

<hr>
<p>Un test d'Helicobacter pylori à faire ? Sur SantéauMaroc, trouvez un gastro-entérologue près de chez vous.</p>`;
const hpFaq = [
  { q: "Qu'est-ce qu'Helicobacter pylori ?", a: "C'est une bactérie très répandue qui vit dans la muqueuse de l'estomac, souvent acquise dans l'enfance. Beaucoup la portent sans symptôme, mais elle est la première cause d'ulcère et de gastrite et augmente le risque de cancer de l'estomac." },
  { q: "Comment détecte-t-on Helicobacter pylori ?", a: "Par un test respiratoire à l'urée (simple, non invasif), par des biopsies lors d'une gastroscopie, ou par d'autres tests (selles, sang) selon les situations. Le médecin choisit la méthode adaptée à votre cas." },
  { q: "Comment se débarrasser d'Helicobacter pylori ?", a: "Par un traitement d'éradication associant des antibiotiques et un antiacide (IPP) pendant une durée définie. Il faut le suivre jusqu'au bout pour éliminer la bactérie et éviter les résistances. Un contrôle vérifie ensuite que l'éradication a réussi." },
  { q: "Pourquoi traiter Helicobacter pylori ?", a: "Parce que son éradication guérit la plupart des ulcères qui lui sont dus, réduit fortement les récidives et diminue le risque de cancer de l'estomac. On la recherche donc devant un ulcère ou certains symptômes digestifs." },
  { q: "Helicobacter pylori est-elle contagieuse ?", a: "Elle se transmet surtout dans l'enfance, au sein de la famille, probablement par voie orale. À l'âge adulte, une nouvelle contamination est plus rare. L'hygiène (eau, mains) limite la transmission. Le dépistage familial peut être discuté avec le médecin." },
];
const hpTk = [
  "Helicobacter pylori est une bactérie de l'estomac, première cause d'ulcère et de gastrite.",
  "Souvent silencieuse ; elle augmente le risque de cancer de l'estomac.",
  "Détection : test respiratoire, biopsies (gastroscopie), tests selles/sang.",
  "Éradication par antibiotiques + IPP, à suivre jusqu'au bout ; contrôle ensuite.",
];

const cGastrite = `<p>La gastrite est une inflammation de la muqueuse de l'estomac. Fréquente, souvent bénigne, elle peut être passagère ou durable. À distinguer de l'<a href="/blog/ulcere-estomac-maroc">ulcère</a>, qui est une plaie plus profonde de la paroi.</p>

<h2>Qu'est-ce que la gastrite ?</h2>
<p>C'est une irritation ou une inflammation de la paroi interne de l'estomac. Elle peut être aiguë (brève) ou chronique (installée), et n'entraîne pas toujours de symptôme.</p>

<h2>Les causes</h2>
<ul>
<li>La bactérie <a href="/blog/helicobacter-pylori-maroc"><em>Helicobacter pylori</em></a></li>
<li>Les <a href="/blog/ulcere-ains-prevention-maroc">anti-inflammatoires (AINS)</a> et l'aspirine, l'alcool, le tabac</li>
<li>Le stress aggrave les symptômes</li>
</ul>

<h2>Les symptômes</h2>
<p>Souvent aucun. Sinon : douleurs ou brûlures au creux de l'estomac, nausées, digestion difficile, ballonnements. Ces signes ne sont pas spécifiques.</p>

<h2>Que faire ?</h2>
<p>Éviter les facteurs irritants (AINS sans protection, alcool, tabac), et selon les cas un traitement antiacide (IPP) et la recherche d'<em>H. pylori</em>. Une <a href="/blog/gastroscopie-maroc">gastroscopie</a> est proposée en cas de signes d'alerte ou après 50 ans.</p>

<blockquote>Attention : consultez en urgence en cas de vomissements de sang ou de selles noires (hémorragie), signes de complication.</blockquote>

<hr>
<p>Des douleurs d'estomac persistantes ? Sur SantéauMaroc, trouvez un gastro-entérologue près de chez vous.</p>`;
const gastriteFaq = [
  { q: "Quelle différence entre gastrite et ulcère ?", a: "La gastrite est une inflammation de la muqueuse de l'estomac ; l'ulcère est une plaie plus profonde qui creuse la paroi de l'estomac ou du duodénum. L'ulcère est généralement plus douloureux et peut se compliquer, mais les deux partagent des causes communes." },
  { q: "Quelles sont les causes de la gastrite ?", a: "Le plus souvent la bactérie Helicobacter pylori et les anti-inflammatoires (AINS) ou l'aspirine, ainsi que l'alcool et le tabac. Le stress aggrave les symptômes sans en être, à lui seul, la cause principale." },
  { q: "Quels sont les symptômes de la gastrite ?", a: "Souvent aucun. Quand ils existent : douleurs ou brûlures au creux de l'estomac, nausées, digestion difficile, ballonnements. Ces signes ne sont pas spécifiques et peuvent avoir d'autres causes, d'où l'intérêt d'un avis médical s'ils persistent." },
  { q: "Comment soigner une gastrite ?", a: "En évitant les facteurs irritants (anti-inflammatoires sans protection, alcool, tabac), avec selon les cas un traitement antiacide (IPP) et la recherche puis l'éradication d'Helicobacter pylori. Une gastroscopie est proposée en cas de signes d'alerte ou après 50 ans." },
  { q: "La gastrite est-elle grave ?", a: "Le plus souvent non : elle est fréquente et bénigne. Elle peut toutefois être gênante et, si la cause persiste, favoriser un ulcère. Des vomissements de sang ou des selles noires imposent une consultation en urgence (hémorragie)." },
];
const gastriteTk = [
  "La gastrite est une inflammation de l'estomac ; l'ulcère, une plaie plus profonde.",
  "Causes principales : Helicobacter pylori, anti-inflammatoires (AINS), alcool, tabac.",
  "Souvent sans symptôme ; sinon douleurs/brûlures au creux de l'estomac.",
  "Sang dans les vomissements ou selles noires = urgence.",
];

const cUlcereAins = `<p>Les anti-inflammatoires (AINS) et l'aspirine sont, avec <a href="/blog/helicobacter-pylori-maroc"><em>Helicobacter pylori</em></a>, la principale cause d'<a href="/blog/ulcere-estomac-maroc">ulcère</a> et de gastrite. Bien les utiliser permet de protéger son estomac.</p>

<h2>Pourquoi les AINS abîment l'estomac</h2>
<p>Les <a href="/blog/anti-inflammatoires-ains-maroc">anti-inflammatoires</a> (ibuprofène, diclofénac…) et l'aspirine fragilisent la muqueuse qui protège l'estomac de l'acidité. Résultat : gastrite, ulcère, voire saignement, surtout en usage prolongé ou à forte dose.</p>

<h2>Qui est le plus à risque ?</h2>
<ul>
<li>Antécédent d'ulcère ou de saignement digestif</li>
<li>Personnes âgées, usage prolongé ou de plusieurs médicaments à risque</li>
<li>Association avec un anticoagulant ou de l'aspirine</li>
</ul>

<h2>Comment protéger son estomac ?</h2>
<ul>
<li>Utiliser les AINS à la <strong>dose la plus faible, le moins longtemps possible</strong>, au cours d'un repas.</li>
<li>Privilégier le <a href="/blog/paracetamol-maroc">paracétamol</a> quand il suffit.</li>
<li>Chez les personnes à risque, le médecin peut associer un <strong>protecteur (IPP)</strong>.</li>
</ul>

<blockquote>Attention : douleurs d'estomac, vomissements de sang ou selles noires sous anti-inflammatoire imposent d'arrêter et de consulter rapidement.</blockquote>

<hr>
<p>Des douleurs d'estomac sous anti-inflammatoires ? Sur SantéauMaroc, trouvez un médecin ou un gastro-entérologue près de chez vous.</p>`;
const ulcereAinsFaq = [
  { q: "Pourquoi les anti-inflammatoires donnent-ils des ulcères ?", a: "Les AINS (ibuprofène, diclofénac…) et l'aspirine fragilisent la muqueuse qui protège l'estomac de l'acidité. Cela peut provoquer une gastrite, un ulcère, voire un saignement, surtout en usage prolongé, à forte dose ou chez les personnes à risque." },
  { q: "Comment protéger son estomac sous anti-inflammatoires ?", a: "En utilisant les AINS à la dose la plus faible et le moins longtemps possible, au cours d'un repas, en préférant le paracétamol quand il suffit. Chez les personnes à risque, le médecin peut associer un protecteur de l'estomac (IPP)." },
  { q: "Qui risque un ulcère avec les anti-inflammatoires ?", a: "Les personnes ayant un antécédent d'ulcère ou de saignement digestif, les personnes âgées, celles en usage prolongé ou associant plusieurs médicaments à risque (anticoagulant, aspirine). Pour elles, une protection de l'estomac est souvent nécessaire." },
  { q: "Peut-on prendre des anti-inflammatoires avec un antécédent d'ulcère ?", a: "Avec prudence et sur avis médical seulement : l'antécédent d'ulcère est un facteur de risque important. Le médecin privilégie d'autres antalgiques (paracétamol) ou, si un AINS est nécessaire, y associe un protecteur de l'estomac." },
  { q: "Quels signes doivent alerter sous anti-inflammatoire ?", a: "Des douleurs d'estomac, des vomissements de sang (rouge ou « marc de café ») ou des selles noires imposent d'arrêter l'anti-inflammatoire et de consulter rapidement : ce sont des signes possibles d'ulcère ou d'hémorragie." },
];
const ulcereAinsTk = [
  "AINS et aspirine sont, avec H. pylori, la principale cause d'ulcère et de gastrite.",
  "Ils fragilisent la muqueuse protectrice de l'estomac.",
  "Protéger : dose minimale, courte durée, au repas ; paracétamol si possible.",
  "Chez les personnes à risque, associer un protecteur (IPP) sur avis médical.",
];

const SATELLITES = [
  { slug:"helicobacter-pylori-maroc", aboutEntity:"Infection à Helicobacter pylori",
    title:"Helicobacter pylori : la bactérie de l'estomac",
    excerpt:"Helicobacter pylori : ce qu'est cette bactérie, comment on la détecte, le traitement d'éradication et pourquoi la traiter (ulcère, cancer de l'estomac). Adapté au Maroc.",
    metaTitle:"Helicobacter pylori : détection et traitement | Maroc",
    metaDesc:"Helicobacter pylori : bactérie de l'estomac, première cause d'ulcère, détection (test respiratoire, biopsies), traitement d'éradication (antibiotiques + IPP) et enjeux. Adapté au Maroc.",
    readingTime:4, content:cHp, keyTakeaways:hpTk, faq:hpFaq },
  { slug:"gastrite-maroc", aboutEntity:"Gastrite",
    title:"Gastrite : causes, symptômes et traitement",
    excerpt:"Gastrite : inflammation de l'estomac, différence avec l'ulcère, causes (H. pylori, AINS), symptômes, traitement et signes d'urgence. Un guide clair adapté au Maroc.",
    metaTitle:"Gastrite : causes, symptômes et traitement | Maroc",
    metaDesc:"Gastrite : inflammation de l'estomac, différence avec l'ulcère, causes (Helicobacter pylori, anti-inflammatoires), symptômes, traitement et signes d'urgence. Adapté au Maroc.",
    readingTime:4, content:cGastrite, keyTakeaways:gastriteTk, faq:gastriteFaq },
  { slug:"ulcere-ains-prevention-maroc", aboutEntity:"Ulcère gastroduodénal",
    title:"Ulcère et anti-inflammatoires : protéger son estomac",
    excerpt:"Ulcère et AINS : pourquoi les anti-inflammatoires abîment l'estomac, qui est à risque, comment se protéger et les signes d'alerte. Un guide clair adapté au Maroc.",
    metaTitle:"Ulcère et anti-inflammatoires : protéger son estomac | Maroc",
    metaDesc:"Ulcère et anti-inflammatoires (AINS, aspirine) : pourquoi ils abîment l'estomac, qui est à risque, comment se protéger (dose, IPP) et signes d'alerte. Adapté au Maroc.",
    readingTime:4, content:cUlcereAins, keyTakeaways:ulcereAinsTk, faq:ulcereAinsFaq },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }
  const cat = await prisma.postCategory.findUnique({ where: { slug: "maladies-traitements" }, select: { id: true } });
  const pilier = await prisma.post.update({ where: { slug: "ulcere-estomac-maroc" }, data: { pillarId: null }, select: { id: true, slug: true } });
  console.log(`◆ ${pilier.slug}`);
  const now = new Date();
  for (const art of SATELLITES) {
    const data = { title:art.title, excerpt:art.excerpt, content:art.content, categoryId:cat.id, metaTitle:art.metaTitle, metaDesc:art.metaDesc, readingTime:art.readingTime, keyTakeaways:art.keyTakeaways.join("\n"), faqJson:JSON.stringify(art.faq), aboutEntity:art.aboutEntity, pillarId:pilier.id, reviewedById:admin.id, reviewedAt:now };
    const post = await prisma.post.upsert({ where:{slug:art.slug}, update:data, create:{...data, slug:art.slug, authorId:admin.id, status:"PUBLISHED", publishedAt:now}, select:{slug:true} });
    console.log(`  ↳ ${post.slug}`);
  }
  console.log(`\nCocon Ulcère/gastrite : ${SATELLITES.length} satellites publiés.`);
}
main().then(()=>prisma.$disconnect()).catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
