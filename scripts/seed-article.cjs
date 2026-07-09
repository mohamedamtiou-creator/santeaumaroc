require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, email: true },
  });
  if (!admin) { console.error("Aucun admin actif trouvé."); process.exit(1); }

  const cat = await prisma.postCategory.findFirst({
    where: { slug: "prevention-sante" },
    select: { id: true },
  });
  if (!cat) { console.error("Catégorie introuvable."); process.exit(1); }

  const content = `<h2>Qu'est-ce que l'hypertension artérielle ?</h2>
<p>L'hypertension artérielle (HTA) est l'une des maladies chroniques les plus répandues au Maroc, touchant près d'un adulte sur trois. Elle se définit par une pression sanguine trop élevée dans les artères — au-delà de <strong>140/90 mmHg</strong> de façon persistante.</p>
<p>Le problème majeur : l'hypertension ne fait <em>pas mal</em>. On l'appelle le « tueur silencieux » car elle progresse sans symptômes pendant des années, tout en augmentant considérablement le risque d'accident vasculaire cérébral (AVC) et d'infarctus.</p>

<h2>Les facteurs de risque à connaître</h2>
<p>Plusieurs éléments favorisent l'apparition d'une hypertension :</p>
<ul>
<li><strong>L'alimentation trop salée</strong> : le sel retient l'eau et augmente la pression artérielle.</li>
<li><strong>Le surpoids et l'obésité</strong> : le cœur travaille davantage pour irriguer un corps plus grand.</li>
<li><strong>Le tabagisme</strong> : la nicotine contracte les vaisseaux sanguins.</li>
<li><strong>Le manque d'activité physique</strong> : un mode de vie sédentaire fragilise le système cardiovasculaire.</li>
<li><strong>Le stress chronique</strong> : il provoque des pics de pression réguliers.</li>
<li><strong>L'hérédité</strong> : si vos parents sont hypertendus, votre risque est plus élevé.</li>
</ul>

<h2>Comment se faire dépister ?</h2>
<p>Le dépistage est simple, rapide et indolore : il suffit de mesurer votre tension artérielle chez votre médecin, en pharmacie ou avec un tensiomètre à domicile. La mesure doit être réalisée au repos, après 5 minutes d'assise, sans avoir fumé ni bu de café dans l'heure précédente.</p>
<blockquote>À partir de 40 ans, il est recommandé de contrôler sa tension au moins une fois par an, même en l'absence de symptômes.</blockquote>

<h2>Les traitements disponibles</h2>
<p>Une fois diagnostiquée, l'hypertension se traite efficacement. Le médecin peut recommander :</p>
<ol>
<li><strong>Des mesures hygiéno-diététiques</strong> en première intention : réduire le sel, faire 30 minutes de marche par jour, perdre du poids.</li>
<li><strong>Un traitement médicamenteux</strong> si nécessaire (inhibiteurs de l'enzyme de conversion, bêta-bloquants, diurétiques…), à prendre <em>à vie</em> et sans jamais l'interrompre sans avis médical.</li>
</ol>

<h2>Conclusion</h2>
<p>L'hypertension artérielle se contrôle très bien quand elle est dépistée tôt. N'attendez pas de ressentir des symptômes : consultez votre médecin, mesurez régulièrement votre tension, et adoptez une hygiène de vie saine. Votre cœur vous remerciera.</p>`;

  const post = await prisma.post.upsert({
    where: { slug: "hypertension-arterielle-maroc" },
    update: {},
    create: {
      title:       "Hypertension artérielle au Maroc : comprendre, dépister et traiter",
      slug:        "hypertension-arterielle-maroc",
      excerpt:     "L'hypertension touche 1 adulte sur 3 au Maroc. Souvent silencieuse, elle est pourtant l'une des principales causes d'AVC et d'infarctus. Tout ce qu'il faut savoir pour se protéger.",
      content,
      coverImage:  null,
      categoryId:  cat.id,
      authorId:    admin.id,
      status:      "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 4,
      featured:    true,
      metaTitle:   "Hypertension artérielle au Maroc — Comprendre et prévenir",
      metaDesc:    "L'hypertension touche 1 adulte sur 3 au Maroc. Dépistage, facteurs de risque et traitements expliqués par des professionnels de santé.",
    },
  });

  console.log("Article créé :", post.title);
  console.log("URL          : /blog/" + post.slug);
  console.log("Auteur       :", admin.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
