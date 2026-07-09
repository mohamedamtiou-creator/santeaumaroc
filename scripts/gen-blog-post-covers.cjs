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
// Couverture PHOTO réelle UNIQUE PAR ARTICLE (succède à gen-blog-photo-covers,
// qui n'en mettait qu'une par catégorie → tous les articles d'un cocon se
// ressemblaient en liste). Une photo libre de droits (Unsplash, licence gratuite
// — usage commercial sans attribution ; UNIQUEMENT host images.unsplash.com, PAS
// plus.unsplash.com/premium_photo qui est payant) a été choisie par article via
// recherche par mots-clés, puis pré-validée visuellement (planche-contact).
// Pipeline perf : download (w=1600) → sharp resize 1200×675 (cover, attention) +
// jpeg(q72, mozjpeg) → public/blog-covers/post-<slug>.jpg (~40–150 Ko). next/image
// sert ensuite avif/webp responsive ; aucun appel externe au runtime. Idempotent.
//
//   node scripts/gen-blog-post-covers.cjs            # download + planche-contact (PAS de DB)
//   node scripts/gen-blog-post-covers.cjs --commit   # + met à jour Post.coverImage
// ════════════════════════════════════════════════════════════════════════════

const W = 1200, H = 675;
const SRC_W = 1600;
const OUT_DIR = path.join(__dirname, "..", "public", "blog-covers");
const SHEET = path.join(OUT_DIR, "_contact-sheet.jpg");
const COMMIT = process.argv.includes("--commit");
const ALT_ONLY = process.argv.includes("--alt-only"); // maj coverAlt sans re-télécharger
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);

// slug d'article -> [id Unsplash (host gratuit images.unsplash.com), alt SEO FR
// décrivant l'image]. L'alt décrit le CONTENU de la photo (pas le titre) →
// `Post.coverAlt`. Ordre = ordre de la planche-contact (8 col.), par catégorie.
const MAP = [
  // maladies-traitements
  ["diabete-ramadan-jeune-maroc",              "photo-1773314863076-835e0bdbe3ea", "Table de rupture du jeûne garnie de dattes pendant le Ramadan"],
  ["diabete-symptomes-signes-maroc",           "photo-1624454002429-40ed87a5ec04", "Lecteur de glycémie et stylo autopiqueur pour dépister le diabète"],
  ["diabete-type-2-maroc",                     "photo-1487956382158-bb926046304a", "Marche en plein air pour prévenir et gérer le diabète de type 2"],
  ["prix-consultation-endocrinologue-maroc",   "photo-1631217868264-e5b90bb7e133", "Consultation médicale entre une patiente et son médecin au cabinet"],
  ["symptomes-hypertension-arterielle-maroc",  "photo-1615486511484-92e172cc4fe0", "Mesure de la tension artérielle au bras avec un tensiomètre"],
  // medecins
  ["attirer-plus-de-patients-cabinet-maroc",   "photo-1758654860024-9e352f70d1f9", "Salle d'attente d'un cabinet médical"],
  ["presence-en-ligne-medecin-maroc",          "photo-1675270855267-3c73bfd13849", "Médecin travaillant sur un ordinateur portable"],
  ["reduire-rendez-vous-manques-no-show-maroc","photo-1633526543814-9718c8922b7a", "Calendrier de rendez-vous avec des dates marquées"],
  // nutrition-bien-etre
  ["alimentation-anti-hypertension-maroc",     "photo-1512621776951-a57141f2eefd", "Bol de légumes frais pour une alimentation pauvre en sel"],
  ["alimentation-diabete-cuisine-marocaine",   "photo-1661083098412-054431ab7112", "Plat de légumes mijotés de la cuisine marocaine traditionnelle"],
  ["alimentation-mediterraneenne-maroc",       "photo-1523071290596-8ad02685dcc0", "Assiette équilibrée d'inspiration méditerranéenne"],
  // parcours-soin
  ["amo-remboursement-consultation-maroc",     "photo-1603796846097-bee99e4a601f", "Signature de documents administratifs de remboursement de soins"],
  ["choisir-son-medecin-maroc",                "photo-1686771416282-3888ddaf249b", "Poignée de main de confiance entre un médecin et son patient"],
  ["generaliste-ou-specialiste-quand-consulter-maroc", "photo-1532938911079-1b06ac7ceec7", "Médecin généraliste tenant un stéthoscope"],
  ["mutuelle-sante-maroc-guide",               "photo-1597524678053-5e6fef52d8a3", "Famille avec un enfant, symbole de la protection santé d'une mutuelle"],
  ["preparer-sa-consultation-medicale-maroc",  "photo-1743385779431-45d26d9775b1", "Prise de notes pour préparer sa consultation médicale"],
  // prevention-sante
  ["activite-physique-sante-maroc",            "photo-1486739985386-d4fae04ca6f7", "Personne s'étirant en plein air avant une activité physique"],
  ["bilan-de-sante-quand-faire-maroc",         "photo-1606206591513-adbfbdd7a177", "Tubes d'analyses sanguines au laboratoire pour un bilan de santé"],
  ["hypertension-arterielle-maroc",            "photo-1624727828489-a1e03b79bba8", "Mains formant un cœur, symbole de la santé cardiovasculaire"],
  ["mesurer-tension-arterielle-maroc",         "photo-1780461159687-281752b8a85a", "Tensiomètre pour mesurer sa tension artérielle à domicile"],
  ["prevention-sante-guide-maroc",             "photo-1774793152799-1b3c24540d5b", "Personne active en plein air adoptant de bons réflexes santé"],
  ["vaccination-adulte-maroc",                 "photo-1611694449252-02453c27856a", "Préparation d'un vaccin avec une seringue"],
  // sante-enfant
  ["calendrier-vaccinal-enfant-maroc",         "photo-1632053002928-1919605ee6f7", "Vaccination d'un bébé tenu par sa mère"],
  ["choisir-pediatre-suivi-enfant-maroc",      "photo-1676313030076-4ac0b37050fd", "Pédiatre examinant un jeune enfant lors d'une consultation"],
  ["fievre-enfant-que-faire-maroc",            "photo-1584650000640-a70adafd062e", "Prise de température d'un enfant fiévreux"],
  ["maladies-infantiles-courantes-maroc",      "photo-1517912707202-5dd698d629a8", "Parent réconfortant son enfant malade"],
  ["sante-enfant-guide-maroc",                 "photo-1502086223501-7ea6ecd79368", "Enfants en bonne santé jouant en plein air"],
  // sante-femme
  ["cancer-col-uterus-depistage-frottis-maroc","photo-1691934338603-af553029aaa3", "Consultation gynécologique pour le dépistage par frottis"],
  ["cancer-sein-maroc-depistage-prevention",   "photo-1769029269082-ff4c66d64764", "Ruban rose, symbole du dépistage du cancer du sein"],
  ["contraception-maroc-methodes",             "photo-1576065435202-e0a7979b93e3", "Plaquette de pilules contraceptives"],
  ["infertilite-pma-maroc",                    "photo-1528218635780-5952720c9729", "Couple regardant une échographie, parcours de procréation médicalement assistée"],
  ["menopause-symptomes-solutions-maroc",      "photo-1566616213894-2d4e1baee5d8", "Femme souriante d'âge mûr en bonne santé"],
  ["sante-femme-guide-maroc",                  "photo-1461468611824-46457c0e11fd", "Femme sereine dans la lumière, bien-être féminin"],
  ["suivi-grossesse-maroc",                    "photo-1457342813143-a1ae27448a82", "Femme enceinte tenant son ventre arrondi"],
  // sante-mentale
  ["anxiete-troubles-anxieux-maroc",           "photo-1542662803-2f01b9f541db", "Mains jointes traduisant l'anxiété et le stress"],
  ["depression-symptomes-aide-maroc",          "photo-1530650450572-bd8713d69d2f", "Personne pensive et isolée près d'une fenêtre"],
  ["psychiatre-ou-psychologue-maroc",          "photo-1573497620053-ea5300f94f21", "Séance de thérapie entre un patient et un professionnel de santé mentale"],
  ["sante-mentale-guide-maroc",                "photo-1522075782449-e45a34f1ddfb", "Silhouette apaisée au coucher du soleil, bien-être mental"],
  ["stress-chronique-burn-out-maroc",          "photo-1456406644174-8ddd4cd52a06", "Personne épuisée, tête dans la main, devant son ordinateur"],
  ["troubles-sommeil-insomnie-maroc",          "photo-1768946131530-358c52c4c42d", "Lit et oreillers évoquant les troubles du sommeil et l'insomnie"],
];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return resolve(fetchBuffer(res.headers.location));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function main() {
  // Mode rapide : ne met à jour que coverAlt (les images existent déjà).
  if (ALT_ONLY) {
    let n = 0;
    for (const [slug, , alt] of MAP) {
      const r = await prisma.post.updateMany({ where: { slug }, data: { coverAlt: alt } });
      n += r.count;
    }
    console.log(`[ALT-ONLY] ${n} articles mis à jour (Post.coverAlt).`);
    return;
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // garde-fou : ids tous uniques
  const ids = MAP.map(([, id]) => id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) { console.error("! IDs dupliqués :", [...new Set(dup)]); process.exit(1); }

  // 1. download + optimise + collecte un thumbnail pour la planche-contact
  const THUMB_W = 240, THUMB_H = 135, COLS = 8;
  const composites = [];
  let i = 0;
  for (const [slug, id] of MAP) {
    if (ONLY && slug !== ONLY) { i++; continue; }
    const url = `https://images.unsplash.com/${id}?w=${SRC_W}&q=80&fm=jpg&fit=max`;
    let src;
    try { src = await fetchBuffer(url); }
    catch (e) { console.error(`✗ ${slug.padEnd(42)} ${id} — ${e.message}`); i++; continue; }
    const out = path.join(OUT_DIR, `post-${slug}.jpg`);
    const base = sharp(src).resize(W, H, { fit: "cover", position: "attention" });
    await base.clone().jpeg({ quality: 72, mozjpeg: true }).toFile(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    const thumb = await sharp(src).resize(THUMB_W, THUMB_H, { fit: "cover", position: "attention" }).jpeg({ quality: 70 }).toBuffer();
    composites.push({ input: thumb, left: (i % COLS) * THUMB_W, top: Math.floor(i / COLS) * THUMB_H });
    console.log(`✓ ${String(i).padStart(2)} ${slug.padEnd(42)} ${kb} Ko`);
    i++;
  }

  // 2. planche-contact (8 colonnes) — pour validation visuelle manuelle
  const rows = Math.ceil(MAP.length / COLS);
  await sharp({ create: { width: COLS * THUMB_W, height: rows * THUMB_H, channels: 3, background: "#fff" } })
    .composite(composites).jpeg({ quality: 80 }).toFile(SHEET);
  console.log(`\nPlanche-contact → ${SHEET} (${composites.length} vignettes, ${COLS}×${rows})`);

  // 3. (--commit) met à jour Post.coverImage + Post.coverAlt
  if (COMMIT) {
    let n = 0;
    for (const [slug, , alt] of MAP) {
      const r = await prisma.post.updateMany({ where: { slug }, data: { coverImage: `/blog-covers/post-${slug}.jpg`, coverAlt: alt } });
      n += r.count;
    }
    console.log(`\n[COMMIT] ${n} articles mis à jour (Post.coverImage + coverAlt).`);
  } else {
    console.log(`\n(dry-run : DB non modifiée. Relancer avec --commit après validation de la planche.)`);
  }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
