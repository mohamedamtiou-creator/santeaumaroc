require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// MAILLAGE RETOUR fiche → blog pour les verticaux dentaire et dermatologie.
//
// `HealthTopic.relatedSlugs` est le champ prévu pour qu'une fiche courte pointe
// vers le ou les articles piliers qui la développent (résolu au rendu par
// app/[lang]/(site)/maladies|symptomes/[slug]/page.tsx, qui ne garde que les
// posts PUBLISHED). Au 4 août 2026, seules 7 fiches sur 265 l'utilisaient : les
// articles dentaires et dermato n'avaient donc aucun lien entrant depuis le
// silo des fiches, alors que ce sont elles qui captent les requêtes courtes.
//
// UNION et non remplacement : on n'écrase jamais un maillage existant.
//
//   node scripts/link-topics-blog-dentaire-dermato.cjs
// ════════════════════════════════════════════════════════════════════════════

const MAP = {
  // ── dentaire ──
  "mal-de-dents":            ["mal-de-dents-rage-de-dents-maroc", "abces-dentaire-maroc"],
  "carie-dentaire":          ["carie-dentaire-maroc", "mal-de-dents-rage-de-dents-maroc"],
  "abces-dentaire":          ["abces-dentaire-maroc"],
  "dent-de-sagesse":         ["dent-de-sagesse-extraction-maroc"],
  gingivite:                 ["parodontite-dechaussement-dents-maroc"],
  "saignement-des-gencives": ["parodontite-dechaussement-dents-maroc"],
  "mauvaise-haleine":        ["parodontite-dechaussement-dents-maroc", "carie-dentaire-maroc"],
  bruxisme:                  ["mal-de-dents-rage-de-dents-maroc"],
  // ── dermatologie ──
  acne:                      ["acne-maroc"],
  "chute-de-cheveux":        ["chute-de-cheveux-maroc"],
  teigne:                    ["chute-de-cheveux-maroc"], // teigne = cause de chute chez l'enfant
};

async function main() {
  // Garde-fou : ne référencer que des articles réellement publiés.
  const wanted = [...new Set(Object.values(MAP).flat())];
  const posts = await prisma.post.findMany({ where: { slug: { in: wanted }, status: "PUBLISHED" }, select: { slug: true } });
  const published = new Set(posts.map((p) => p.slug));
  const missing = wanted.filter((s) => !published.has(s));
  if (missing.length) { console.error(`Articles absents ou non publiés : ${missing.join(", ")}`); process.exit(1); }

  let changed = 0;
  for (const [slug, add] of Object.entries(MAP)) {
    const topic = await prisma.healthTopic.findUnique({ where: { slug }, select: { id: true, relatedSlugs: true, kind: true } });
    if (!topic) { console.error(`✗ fiche « ${slug} » introuvable`); continue; }
    const merged = [...new Set([...topic.relatedSlugs, ...add])];
    if (merged.length === topic.relatedSlugs.length && add.every((s) => topic.relatedSlugs.includes(s))) {
      console.log(`= ${slug.padEnd(24)} déjà à jour`);
      continue;
    }
    await prisma.healthTopic.update({ where: { id: topic.id }, data: { relatedSlugs: merged } });
    const section = topic.kind === "DISEASE" ? "/maladies/" : "/symptomes/";
    console.log(`✓ ${section}${slug.padEnd(24)} → ${merged.join(", ")}`);
    changed++;
  }
  console.log(`\n${changed} fiche(s) mise(s) à jour sur ${Object.keys(MAP).length}.`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
