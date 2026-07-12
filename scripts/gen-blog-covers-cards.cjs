require("dotenv/config");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Couvertures ILLUSTRÉES générées LOCALEMENT (sharp + SVG) — aucun réseau, aucun
// quota, instantané. Carte 1200×675 par article : dégradé aux couleurs de la
// rubrique + titre (auto-wrap) + pictogramme santé + marque « SantéauMaroc ».
// Unique par article (le titre diffère), cohérente par rubrique (couleur).
//
//   node scripts/gen-blog-covers-cards.cjs                 # posts SANS image (fichiers only)
//   node scripts/gen-blog-covers-cards.cjs --commit        # + met à jour coverImage/coverAlt
//   node scripts/gen-blog-covers-cards.cjs --all --commit  # régénère TOUS les articles (uniformité)
//   node scripts/gen-blog-covers-cards.cjs --category=symptomes --commit
// ════════════════════════════════════════════════════════════════════════════

const W = 1200, H = 675;
const OUT_DIR = path.join(__dirname, "..", "public", "blog-covers");
const COMMIT = process.argv.includes("--commit");
const ALL = process.argv.includes("--all");
const CATEGORY = (process.argv.find(a => a.startsWith("--category=")) || "").split("=")[1] || null;

// Rubrique → [couleur haut, couleur bas, libellé]. Charte « Medical Clarity ».
const THEME = {
  "maladies-traitements": ["#2563eb", "#1e3a8a", "Maladie"],
  "symptomes":            ["#e11d48", "#9f1239", "Symptôme"],
  "examens":              ["#4f46e5", "#3730a3", "Examen"],
  "medicaments":          ["#0d9488", "#115e59", "Médicament"],
  "prevention-sante":     ["#16a34a", "#14532d", "Prévention"],
  "sante-femme":          ["#db2777", "#9d174d", "Santé de la femme"],
  "sante-enfant":         ["#d97706", "#92400e", "Santé de l'enfant"],
  "sante-senior":         ["#ea580c", "#9a3412", "Santé des seniors"],
  "sante-mentale":        ["#7c3aed", "#5b21b6", "Santé mentale"],
  "questions-frequentes": ["#0891b2", "#155e75", "Question fréquente"],
  "nutrition-bien-etre":  ["#65a30d", "#3f6212", "Nutrition"],
  "parcours-soin":        ["#0f766e", "#134e4a", "Parcours de soin"],
  "medecins":             ["#475569", "#1e293b", "Médecins"],
};
const DEFAULT_THEME = ["#334155", "#0f172a", "Santé"];

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }

// Découpe le titre en lignes (~20 caractères) pour un rendu SVG lisible.
function wrap(title, max = 20) {
  const words = title.split(/\s+/); const lines = []; let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4); // 4 lignes max
}

function svg(title, theme) {
  const [c1, c2, label] = theme;
  const lines = wrap(title);
  const fs2 = lines.length > 3 ? 58 : 66;         // taille selon nb de lignes
  const startY = H - 150 - (lines.length - 1) * (fs2 + 8);
  const tspans = lines.map((l, i) =>
    `<tspan x="80" y="${startY + i * (fs2 + 10)}">${esc(l)}</tspan>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <!-- pictogramme « pouls » décoratif, translucide -->
  <path d="M760 300 h70 l35 -70 l55 150 l35 -80 h150" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="1050" cy="140" r="220" fill="#ffffff" fill-opacity="0.06"/>
  <!-- marque -->
  <text x="80" y="90" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff">SantéauMaroc</text>
  <!-- chip rubrique -->
  <rect x="80" y="120" rx="20" ry="20" width="${Math.max(150, label.length * 15 + 44)}" height="40" fill="#ffffff" fill-opacity="0.18"/>
  <text x="102" y="147" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" fill="#ffffff">${esc(label)}</text>
  <!-- titre -->
  <text font-family="Segoe UI, Arial, sans-serif" font-size="${fs2}" font-weight="800" fill="#ffffff">${tspans}</text>
  <!-- filet d'accent -->
  <rect x="80" y="${H - 70}" width="120" height="8" rx="4" fill="#ffffff" fill-opacity="0.85"/>
</svg>`;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  let posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", ...(CATEGORY ? { category: { slug: CATEGORY } } : {}) },
    select: { slug: true, title: true, coverImage: true, category: { select: { slug: true, name: true } } },
    orderBy: { publishedAt: "desc" },
  });
  if (!ALL) posts = posts.filter(p => !p.coverImage);
  console.log(`${posts.length} cartes à générer${CATEGORY ? " (" + CATEGORY + ")" : ""}${ALL ? " (toutes)" : " (sans image)"}\n`);

  let ok = 0;
  for (const p of posts) {
    const theme = THEME[p.category.slug] || DEFAULT_THEME;
    const outPath = path.join(OUT_DIR, `post-${p.slug}.jpg`);
    await sharp(Buffer.from(svg(p.title, theme))).jpeg({ quality: 80, mozjpeg: true }).toFile(outPath);
    if (COMMIT) await prisma.post.update({ where: { slug: p.slug }, data: { coverImage: `/blog-covers/post-${p.slug}.jpg`, coverAlt: `${theme[2]} — ${p.title}` } });
    ok++;
    if (ok % 25 === 0) console.log(`  … ${ok}`);
  }
  console.log(`\nTerminé : ${ok} cartes générées.${COMMIT ? " (DB mise à jour)" : " (fichiers seulement)"}`);
}
main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
