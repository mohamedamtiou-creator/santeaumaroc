require("dotenv/config");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ════════════════════════════════════════════════════════════════════════════
// Génère une image de couverture 16:9 on-brand par article publié et met à jour
// `coverImage`. Illustratif (dégradé par couleur de catégorie + icône médicale
// par thème + variation déterministe par slug) — aucune police (rasterisation
// sharp fiable), aucune dépendance externe. Idempotent. JPG -> public/blog-covers.
// ════════════════════════════════════════════════════════════════════════════

const W = 1200, H = 675;
const OUT_DIR = path.join(__dirname, "..", "public", "blog-covers");

// Dégradés sombre→moyen par couleur de catégorie (lisibilité, profondeur).
const GRAD = {
  blue:   ["#0E2A45", "#1668B0"],
  green:  ["#0A3D2E", "#0C9468"],
  amber:  ["#5C3608", "#C77A12"],
  rose:   ["#5C1E33", "#C2456A"],
  indigo: ["#2A2473", "#5B52E0"],
};
const ACCENT = {
  blue: "#7CC0F2", green: "#5FE0B0", amber: "#F2C879", rose: "#F2A0BC", indigo: "#B7B0FF",
};

// Icône médicale par catégorie (viewBox 0..100, tracé blanc).
const ICONS = {
  "maladies-traitements": `<path d="M50 80 C22 60 20 36 36 28 C45 23 50 32 50 32 C50 32 55 23 64 28 C80 36 78 60 50 80 Z"/><path d="M30 52 H42 L47 42 L54 62 L59 52 H72" fill="none"/>`,
  "nutrition-bien-etre": `<path d="M32 70 C30 42 50 28 74 28 C74 54 56 74 32 70 Z"/><path d="M34 70 L52 52" fill="none"/>`,
  "prevention-sante": `<path d="M50 20 L76 31 V53 C76 69 64 78 50 82 C36 78 24 69 24 53 V31 Z"/><path d="M39 52 l7 8 16 -18" fill="none"/>`,
  "sante-femme": `<circle cx="50" cy="38" r="17" fill="none"/><path d="M50 55 V82 M38 71 H62" fill="none"/>`,
  "sante-enfant": `<circle cx="50" cy="30" r="13" fill="none"/><path d="M30 80 C30 56 70 56 70 80" fill="none"/>`,
  "sante-mentale": `<circle cx="50" cy="46" r="26" fill="none"/><path d="M50 60 C36 50 40 36 50 38 C60 36 64 50 50 60 Z"/>`,
  "parcours-soin": `<circle cx="50" cy="50" r="29" fill="none"/><path d="M50 28 L60 60 L50 51 L40 60 Z"/>`,
  "medecins": `<rect x="27" y="40" width="46" height="34" rx="6" fill="none"/><path d="M41 40 V33 H59 V40" fill="none"/><path d="M50 50 V64 M43 57 H57" fill="none"/>`,
};
const DEFAULT_ICON = ICONS["maladies-traitements"];

// Hash déterministe d'un slug -> entier.
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

const GRAD_DIRS = [
  { x1: 0, y1: 0, x2: 1, y2: 1 },
  { x1: 0, y1: 0, x2: 1, y2: 0.55 },
  { x1: 0.15, y1: 0, x2: 1, y2: 1 },
  { x1: 0, y1: 0.2, x2: 0.85, y2: 1 },
];

function buildSvg(slug, color, catSlug) {
  const [c0, c1] = GRAD[color] || GRAD.blue;
  const accent = ACCENT[color] || ACCENT.blue;
  const icon = ICONS[catSlug] || DEFAULT_ICON;
  const h = hash(slug);
  const dir = GRAD_DIRS[h % GRAD_DIRS.length];
  // Cercles décoratifs déterministes.
  const r1 = 220 + (h % 90);
  const cx1 = 180 + (h % 240), cy1 = 120 + ((h >> 3) % 160);
  const r2 = 120 + ((h >> 5) % 80);
  const cx2 = 980 - ((h >> 7) % 220), cy2 = 540 - ((h >> 4) % 160);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="${dir.x1}" y1="${dir.y1}" x2="${dir.x2}" y2="${dir.y2}">
      <stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity="0.10" fill="none" stroke="#FFFFFF" stroke-width="2">
    <circle cx="${cx1}" cy="${cy1}" r="${r1}"/>
    <circle cx="${cx1}" cy="${cy1}" r="${r1 - 60}"/>
    <circle cx="${cx2}" cy="${cy2}" r="${r2}"/>
  </g>
  <!-- icône géante en filigrane -->
  <g transform="translate(720,150) scale(5.2)" opacity="0.08" stroke="#FFFFFF" stroke-width="4" fill="#FFFFFF" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
  <!-- barre d'accent -->
  <rect x="0" y="0" width="${W}" height="10" fill="${accent}"/>
  <!-- badge icône focal -->
  <g transform="translate(110,${H / 2 - 130})">
    <rect x="0" y="0" width="260" height="260" rx="40" fill="#FFFFFF" fill-opacity="0.12" stroke="#FFFFFF" stroke-opacity="0.30" stroke-width="2"/>
    <g transform="translate(50,50) scale(1.6)" stroke="#FFFFFF" stroke-width="5" fill="#FFFFFF" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
  </g>
  <!-- marque SantéauMaroc (logo heartbeat, vectoriel) -->
  <g transform="translate(110,${H - 96}) scale(0.46)" fill="none" stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 88 L30 40 C45 40 51 53 60 61 C69 69 75 80 90 80"/>
    <path d="M90 80 L90 40 C75 40 69 53 60 61"/>
  </g>
</svg>`;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, category: { select: { slug: true, color: true } } },
    orderBy: { publishedAt: "asc" },
  });

  let done = 0;
  for (const p of posts) {
    const svg = buildSvg(p.slug, p.category.color, p.category.slug);
    const file = path.join(OUT_DIR, `${p.slug}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
    await prisma.post.update({ where: { id: p.id }, data: { coverImage: `/blog-covers/${p.slug}.jpg` } });
    done++;
    console.log(`✓ ${p.category.slug.padEnd(22)} /blog-covers/${p.slug}.jpg`);
  }
  console.log(`\n${done} couvertures générées et assignées.`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
