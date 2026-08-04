require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Ouvre l'affichage/indexation ARABE d'articles de blog APRÈS relecture (YMYL).
// Même convention que scripts/glossary-approve-ar.ts et exams-approve-ar.ts :
// pose `arReviewedAt` sur les articles dont la traduction existe (`contentAr`).
//
// Condition d'affichage AR = isBlogArReady (arReviewedAt + contentAr), cf.
// lib/blog-content.ts. Tant que ce script n'est pas passé, /ar/blog/<slug> sert
// le français et reste en noindex.
//
//   Tout ouvrir :        node scripts/blog-approve-ar.cjs
//   Une liste de slugs : node scripts/blog-approve-ar.cjs acne-maroc carie-dentaire-maroc
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  const slugs = process.argv.slice(2);
  const where = {
    contentAr: { not: null },
    arReviewedAt: null,
    ...(slugs.length ? { slug: { in: slugs } } : {}),
  };
  const candidats = await prisma.post.findMany({ where, select: { slug: true } });
  if (candidats.length === 0) {
    console.log("ℹ 0 candidat : aucun article avec traduction arabe en attente de relecture.");
    return;
  }
  const res = await prisma.post.updateMany({ where, data: { arReviewedAt: new Date() } });
  for (const c of candidats) console.log(`  ↳ /ar/blog/${c.slug}`);
  console.log(`\n✓ ${res.count} article(s) marqué(s) relu(s) AR → arabe servi et indexé (hreflang ar-MA rétabli).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
