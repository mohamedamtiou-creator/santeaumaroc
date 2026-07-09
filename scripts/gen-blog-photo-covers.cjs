require("dotenv/config");
const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Couvertures PHOTO réelles, optimisées pour la performance :
//   télécharge 1 photo libre (Unsplash, usage commercial sans attribution) par
//   catégorie → recadre 1200×675 + compresse (sharp, JPEG mozjpeg q72) → héberge
//   en local (public/blog-covers/cat-<slug>.jpg). next/image génère ensuite
//   avif/webp responsive. Aucun appel externe au runtime. Idempotent.
// Les photos ont été pré-validées visuellement (pertinence par thème).
// ════════════════════════════════════════════════════════════════════════════

const OUT_DIR = path.join(__dirname, "..", "public", "blog-covers");
const SRC_W = 1600; // largeur source téléchargée (qualité avant recadrage)

// catégorie -> photo Unsplash validée (id stable images.unsplash.com)
const PHOTOS = {
  "maladies-traitements": "1576091160550-2173dba999ef", // stéthoscope + ordinateur
  "nutrition-bien-etre":  "1490645935967-10de6ba17061", // bol de légumes sain
  "prevention-sante":     "1538805060514-97d9cc17730c", // activité physique
  "sante-femme":          "1493894473891-10fc1e5dbd22", // grossesse (mains en cœur)
  "sante-enfant":         "1503454537195-1dcabb73ffb9", // enfant souriant
  "sante-mentale":        "1506126613408-eca07ce68773", // méditation / sérénité
  "parcours-soin":        "1666214280557-f1b5022eb634", // médecin expliquant au patient
  "medecins":             "1612349317150-e413f6a5b16d", // médecin (portrait)
};

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location));
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode} for ${url}`)); res.resume(); return; }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. Télécharge + optimise une cover par catégorie utilisée.
  const usedCats = await prisma.postCategory.findMany({
    where: { posts: { some: { status: "PUBLISHED" } } },
    select: { slug: true },
  });

  const coverPath = {};
  for (const { slug } of usedCats) {
    const id = PHOTOS[slug];
    if (!id) { console.log(`! pas de photo pour ${slug} (ignoré)`); continue; }
    const url = `https://images.unsplash.com/photo-${id}?w=${SRC_W}&q=80&fm=jpg&fit=max`;
    const src = await fetchBuffer(url);
    const out = path.join(OUT_DIR, `cat-${slug}.jpg`);
    await sharp(src)
      .resize(1200, 675, { fit: "cover", position: "attention" })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    coverPath[slug] = `/blog-covers/cat-${slug}.jpg`;
    console.log(`✓ ${slug.padEnd(22)} cat-${slug}.jpg (${kb} Ko)`);
  }

  // 2. Assigne la cover de catégorie à chaque article.
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  });
  let assigned = 0;
  for (const p of posts) {
    const cp = coverPath[p.category.slug];
    if (!cp) continue;
    await prisma.post.update({ where: { id: p.id }, data: { coverImage: cp } });
    assigned++;
  }
  console.log(`\n${Object.keys(coverPath).length} photos de catégorie · ${assigned} articles mis à jour.`);

  // 3. Nettoie les anciennes illustrations par slug (garde uniquement cat-*.jpg).
  let removed = 0;
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith(".jpg") && !f.startsWith("cat-")) { fs.unlinkSync(path.join(OUT_DIR, f)); removed++; }
  }
  console.log(`${removed} anciennes illustrations supprimées.`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
