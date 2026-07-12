require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// ════════════════════════════════════════════════════════════════════════════
// Ouvre (ou ferme) le verrou de traduction arabe d'un article, APRÈS relecture
// humaine (garde-fou YMYL). Tant que arReviewedAt est null, le site sert le FR
// en /ar. Poser la date autorise l'affichage/indexation de la version arabe.
//
//   node scripts/open-blog-ar.cjs <slug>            # ouvre (arReviewedAt = maintenant)
//   node scripts/open-blog-ar.cjs <slug> --close    # referme (repli FR)
// ════════════════════════════════════════════════════════════════════════════

const slug = process.argv[2];
const close = process.argv.includes("--close");
if (!slug) { console.error("Usage: node scripts/open-blog-ar.cjs <slug> [--close]"); process.exit(1); }

async function main() {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { slug: true, contentAr: true, arReviewedAt: true },
  });
  if (!post) throw new Error(`Article introuvable: ${slug}`);
  if (!close && !post.contentAr) throw new Error(`Pas de traduction AR (contentAr vide) pour ${slug} — rien à ouvrir.`);
  const arReviewedAt = close ? null : new Date();
  await prisma.post.update({ where: { slug }, data: { arReviewedAt } });
  console.log(close
    ? `Verrou AR REFERMÉ pour « ${slug} » (le FR sera servi en /ar).`
    : `Verrou AR OUVERT pour « ${slug} » (relu ${arReviewedAt.toISOString()} — l'arabe est désormais servi/indexé).`);
  console.log("→ Rebuild nécessaire en production pour rafraîchir le cache ISR.");
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
