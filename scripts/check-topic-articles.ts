import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { composeIntentQuestion, composeTreatmentQuestion, composePreventionQuestion, frWithDe } from "@/lib/health-topic";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// ════════════════════════════════════════════════════════════════════════════
// Contrôle des articles français composés pour les pages d'intention
// (/quel-medecin-pour, /comment-traiter, /prevenir).
//
// Appelle les VRAIES fonctions de lib/health-topic (pas une copie) sur les 265
// libellés en base, et signale toute forme grammaticalement impossible :
// « le » ou « la » devant un pluriel, « le » devant un féminin connu, sigle
// dont la casse a été cassée (« le bPCO »), élision manquante.
//
//   npx tsx --env-file=.env scripts/check-topic-articles.ts
// ════════════════════════════════════════════════════════════════════════════

/** Marqueurs de pluriel : mot-tête en s/x hors singuliers savants. */
const SINGULIER_EN_S = new Set([
  "abcès", "anus", "herpès", "lupus", "phimosis", "pityriasis", "pouls", "prolapsus",
  "psoriasis", "reflux", "sinus", "stress", "tétanos", "torticolis", "toux", "virus",
]);

function looksPlural(term: string): boolean {
  const head = term.trim().toLowerCase().split(/[\s-]/)[0];
  return /[sx]$/.test(head) && !SINGULIER_EN_S.has(head);
}

async function main() {
  const topics = await prisma.healthTopic.findMany({
    where: { intentSlug: { not: null } },
    select: { term: true, slug: true },
    orderBy: { term: "asc" },
  });

  const problems: string[] = [];
  const counts: Record<string, number> = { le: 0, la: 0, "l'": 0, les: 0 };

  for (const t of topics) {
    const q = composeIntentQuestion(t.term, "fr");
    const rendered = q.replace(/^Quel médecin consulter pour /, "").replace(/ \?$/, "");
    const article = rendered.startsWith("l'") ? "l'" : rendered.split(" ")[0];
    if (article in counts) counts[article]++;

    // 1. pluriel annoncé au singulier
    if (looksPlural(t.term) && article !== "les") {
      problems.push(`pluriel au singulier   → « ${rendered} »  (${t.slug})`);
    }
    // 2. singulier annoncé au pluriel
    if (!looksPlural(t.term) && article === "les") {
      problems.push(`singulier au pluriel   → « ${rendered} »  (${t.slug})`);
    }
    // 3. sigle dont la casse a été abîmée : « bPCO », « tDAH »
    if (/\b[a-z][A-Z]{2,}/.test(rendered)) {
      problems.push(`casse de sigle abîmée  → « ${rendered} »  (${t.slug})`);
    }
    // 4. élision manquante devant voyelle / œ (hors pluriel légitime)
    if (article !== "les" && article !== "l'" && /^[aàâäeéèêëiîïoôöuùûüœ]/i.test(rendered.replace(/^(le|la) /, ""))) {
      problems.push(`élision manquante      → « ${rendered} »  (${t.slug})`);
    }
    // 5. cohérence des trois gabarits + forme contractée
    for (const compose of [composeTreatmentQuestion, composePreventionQuestion]) {
      const other = compose(t.term, "fr");
      if (!other.includes(rendered)) {
        problems.push(`gabarits incohérents   → « ${other} » vs « ${rendered} »  (${t.slug})`);
      }
    }
    const de = frWithDe(t.term);
    if (!/^(du |de la |de l'|des )/.test(de)) {
      problems.push(`forme contractée       → « ${de} »  (${t.slug})`);
    }
  }

  console.log(`${topics.length} fiches contrôlées — répartition : ${Object.entries(counts).map(([a, n]) => `${a}=${n}`).join("  ")}`);
  if (problems.length === 0) {
    console.log("\n✓ aucune forme fautive détectée.");
  } else {
    console.log(`\n✗ ${problems.length} forme(s) fautive(s) :\n`);
    for (const p of [...new Set(problems)]) console.log("  " + p);
    process.exitCode = 1;
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
