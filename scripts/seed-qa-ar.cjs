require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// ════════════════════════════════════════════════════════════════════════════
// Réinjecte les traductions AR des 75 Q/R d'origine (modules _qa_out/<slug>.cjs
// produits par les sous-agents) → colonnes …Ar de Question + bodyAr des Answer.
// VERROU OUVERT (arReviewedAt = maintenant) sur question ET réponses, sur
// décision explicite de l'utilisateur (publication AR non relue — YMYL assumé).
//   node scripts/seed-qa-ar.cjs            # applique
//   node scripts/seed-qa-ar.cjs --check     # vérifie sans écrire
// ════════════════════════════════════════════════════════════════════════════

const OUT = path.join(__dirname, "_qa_out");
const SRC = path.join(__dirname, "_qa_src");
const CHECK = process.argv.includes("--check");

async function main() {
  const files = fs.readdirSync(OUT).filter((f) => f.endsWith(".cjs"));
  const now = new Date();
  let ok = 0, fail = 0, skipped = 0;

  for (const f of files.sort()) {
    const slug = f.replace(/\.cjs$/, "");
    const srcPath = path.join(SRC, `${slug}.json`);
    if (!fs.existsSync(srcPath)) { skipped++; continue; }
    let mod, src;
    try {
      mod = require(path.join(OUT, f));
      src = JSON.parse(fs.readFileSync(srcPath, "utf8"));
    } catch (e) { console.log(`✗ ${slug} — chargement KO: ${e.message}`); fail++; continue; }

    const missing = ["titleAr", "bodyAr", "metaTitleAr", "metaDescAr", "aiSummaryAr", "answers"]
      .filter((k) => mod[k] == null || (typeof mod[k] === "string" && !mod[k].trim()));
    if (missing.length) { console.log(`✗ ${slug} — champs manquants: ${missing.join(", ")}`); fail++; continue; }

    // Les réponses AR doivent couvrir exactement les ids source.
    const srcIds = src.answers.map((a) => a.id).sort();
    const modIds = mod.answers.map((a) => a.id).sort();
    const idsOk = JSON.stringify(srcIds) === JSON.stringify(modIds) && mod.answers.every((a) => a.bodyAr && a.bodyAr.trim());
    if (!idsOk) { console.log(`✗ ${slug} — réponses: ids/bodyAr incohérents (src ${srcIds.length}, mod ${modIds.length})`); fail++; continue; }

    console.log(`✓ ${slug.padEnd(55)} body ${String(mod.bodyAr.length).padStart(5)} · ${mod.answers.length} rép`);
    if (!CHECK) {
      await prisma.question.update({
        where: { slug },
        data: {
          titleAr: mod.titleAr, bodyAr: mod.bodyAr,
          metaTitleAr: mod.metaTitleAr, metaDescAr: mod.metaDescAr,
          aiSummaryAr: mod.aiSummaryAr, arReviewedAt: now,
        },
      });
      for (const a of mod.answers) {
        await prisma.answer.update({ where: { id: a.id }, data: { bodyAr: a.bodyAr, arReviewedAt: now } });
      }
    }
    ok++;
  }
  console.log(`\n${CHECK ? "[CHECK] " : ""}OK: ${ok} · échecs: ${fail} · ignorés (autre lot): ${skipped}`);
  if (!CHECK) console.log("Verrous OUVERTS (questions + réponses). Rebuild + redémarrer next start.");
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
