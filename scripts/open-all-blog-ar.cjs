require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// ════════════════════════════════════════════════════════════════════════════
// Ouvre EN MASSE le verrou AR de tous les articles publiés déjà traduits
// (contentAr non nul) → l'arabe est servi/indexé en /ar. ⚠️ Publie des
// traductions NON relues par un praticien (décision YMYL assumée).
//   node scripts/open-all-blog-ar.cjs           # ouvre tout
//   node scripts/open-all-blog-ar.cjs --close    # referme tout (repli FR)
// ════════════════════════════════════════════════════════════════════════════

const close = process.argv.includes("--close");

async function main() {
  const now = new Date();
  const res = await prisma.post.updateMany({
    where: { status: "PUBLISHED", contentAr: { not: null } },
    data: { arReviewedAt: close ? null : now },
  });
  const open = await prisma.post.count({ where: { arReviewedAt: { not: null } } });
  console.log(close
    ? `Verrous AR REFERMÉS : ${res.count} articles (le FR sera servi en /ar).`
    : `Verrous AR OUVERTS : ${res.count} articles (relu ${now.toISOString()}). L'arabe est désormais servi/indexé.`);
  console.log(`Total verrous ouverts en base : ${open}`);
  console.log("→ Rebuild nécessaire (route SSG/ISR) puis redémarrer next start.");
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
