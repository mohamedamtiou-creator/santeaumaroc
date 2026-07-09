require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cats = [
    { name: "Prévention & Santé",     slug: "prevention-sante",    description: "Conseils préventifs, vaccins et dépistage",      color: "green" },
    { name: "Nutrition & Bien-être",  slug: "nutrition-bien-etre",  description: "Alimentation, régimes et santé métabolique",     color: "amber" },
    { name: "Maladies & Traitements", slug: "maladies-traitements", description: "Comprendre les pathologies et leurs traitements", color: "blue"  },
    { name: "Santé de la femme",      slug: "sante-femme",          description: "Grossesse, gynécologie et ménopause",            color: "rose"  },
  ];
  for (const cat of cats) {
    await prisma.postCategory.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
    console.log("  ✓", cat.name);
  }
  console.log("Catégories blog créées !");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
