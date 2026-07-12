require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// ════════════════════════════════════════════════════════════════════════════
// Réinjecte les traductions AR des piliers (produites par les sous-agents dans
// scripts/_ar_out/<slug>.cjs) dans les colonnes …Ar de Post. VERROU FERMÉ :
// arReviewedAt = null → le FR reste servi en /ar jusqu'à relecture humaine (YMYL).
// Contrôles de fidélité structurelle avant écriture (balises, FAQ, à-retenir).
//   node scripts/seed-blog-ar-pillars.cjs           # applique (avec garde-fous)
//   node scripts/seed-blog-ar-pillars.cjs --check    # vérifie seulement, n'écrit pas
// ════════════════════════════════════════════════════════════════════════════

const OUT = path.join(__dirname, "_ar_out");
const SRC = path.join(__dirname, "_ar_src");
const CHECK_ONLY = process.argv.includes("--check");

const count = (s, re) => (s.match(re) || []).length;
const tagStats = (html) => ({
  h2: count(html, /<h2[ >]/g),
  h3: count(html, /<h3[ >]/g),
  table: count(html, /<table[ >]/g),
  tr: count(html, /<tr[ >]/g),
  li: count(html, /<li[ >]/g),
  a: count(html, /<a\s/g),
  strong: count(html, /<strong[ >]/g),
});
const hrefs = (html) => (html.match(/href="([^"]*)"/g) || []).sort();

async function main() {
  if (!fs.existsSync(OUT)) throw new Error("scripts/_ar_out introuvable — les sous-agents n'ont rien produit.");
  const files = fs.readdirSync(OUT).filter((f) => f.endsWith(".cjs"));
  console.log(`${files.length} module(s) de traduction trouvés dans _ar_out/\n`);

  let applied = 0, warned = 0, failed = 0, skipped = 0;
  for (const f of files.sort()) {
    const slug = f.replace(/\.cjs$/, "");
    // On ne traite que les modules dont la source FR est présente dans _ar_src
    // (le lot courant). Les modules d'un lot déjà appliqué sont ignorés.
    if (!fs.existsSync(path.join(SRC, `${slug}.json`))) { skipped++; continue; }
    let mod, src;
    try {
      mod = require(path.join(OUT, f));
      src = JSON.parse(fs.readFileSync(path.join(SRC, `${slug}.json`), "utf8"));
    } catch (e) {
      console.log(`✗ ${slug} — chargement KO : ${e.message}`);
      failed++; continue;
    }

    // Champs présents ?
    const missing = ["titleAr", "excerptAr", "metaTitleAr", "metaDescAr", "keyTakeawaysAr", "faqAr", "contentAr"]
      .filter((k) => mod[k] == null || (typeof mod[k] === "string" && !mod[k].trim()));
    if (missing.length) { console.log(`✗ ${slug} — champs manquants: ${missing.join(", ")}`); failed++; continue; }

    // Fidélité structurelle (avertissements, non bloquants sauf href)
    const sTag = tagStats(src.content), aTag = tagStats(mod.contentAr);
    const diffs = Object.keys(sTag).filter((k) => sTag[k] !== aTag[k]).map((k) => `${k} ${sTag[k]}→${aTag[k]}`);
    const srcFaq = JSON.parse(src.faqJson || "[]");
    const srcTk = (src.keyTakeaways || "").split("\n").filter(Boolean);
    const warns = [];
    if (diffs.length) warns.push(`balises: ${diffs.join(", ")}`);
    if (mod.faqAr.length !== srcFaq.length) warns.push(`FAQ ${srcFaq.length}→${mod.faqAr.length}`);
    if (mod.keyTakeawaysAr.length !== srcTk.length) warns.push(`à-retenir ${srcTk.length}→${mod.keyTakeawaysAr.length}`);
    const srcH = hrefs(src.content), arH = hrefs(mod.contentAr);
    const hrefMismatch = JSON.stringify(srcH) !== JSON.stringify(arH);
    if (hrefMismatch) warns.push(`⚠ HREFS modifiés (${srcH.length}→${arH.length})`);

    const tag = warns.length ? "⚠" : "✓";
    console.log(`${tag} ${slug.padEnd(40)} contentAr ${String(mod.contentAr.length).padStart(6)} car · faq ${mod.faqAr.length} · tk ${mod.keyTakeawaysAr.length}${warns.length ? "  [" + warns.join(" | ") + "]" : ""}`);
    if (warns.length) warned++;

    if (!CHECK_ONLY) {
      await prisma.post.update({
        where: { slug },
        data: {
          titleAr: mod.titleAr,
          excerptAr: mod.excerptAr,
          contentAr: mod.contentAr,
          metaTitleAr: mod.metaTitleAr,
          metaDescAr: mod.metaDescAr,
          keyTakeawaysAr: mod.keyTakeawaysAr.join("\n"),
          faqJsonAr: JSON.stringify(mod.faqAr),
          arReviewedAt: null, // ← VERROU FERMÉ
        },
      });
      applied++;
    }
  }
  console.log(`\n${CHECK_ONLY ? "[CHECK] " : ""}Modules OK. Appliqués: ${applied} · avertissements: ${warned} · échecs: ${failed} · ignorés (autre lot): ${skipped}`);
  if (!CHECK_ONLY) console.log("Verrou FERMÉ sur tous (arReviewedAt=null) — le FR reste servi en /ar.");
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
