/**
 * Réinjecte les traductions arabes (produites par sous-agents dans scripts/_ar_out/)
 * dans les champs *Ar du glossaire et des symptômes, PUIS ouvre l'AR (arReviewedAt).
 *
 * Fichiers attendus : scripts/_ar_out/g*.json (glossaire) et s*.json (symptômes).
 *   - g*.json : [{ slug, termAr, definitionAr }]
 *   - s*.json : [{ slug, termAr, shortAnswerAr, causesAr, redFlagsAr, whenToConsultAr, faqJsonAr }]
 *
 *   npx tsx --env-file=.env scripts/seed-ar-glossary-symptoms.ts
 */
import { readFileSync, readdirSync } from "node:fs";
import { prisma } from "@/lib/prisma";

const DIR = "scripts/_ar_out";

function loadBatches(prefix: string): any[] {
  const files = readdirSync(DIR).filter((f) => f.startsWith(prefix) && f.endsWith(".json"));
  const out: any[] = [];
  for (const f of files) {
    const arr = JSON.parse(readFileSync(`${DIR}/${f}`, "utf8"));
    if (!Array.isArray(arr)) throw new Error(`${f} n'est pas un tableau JSON`);
    out.push(...arr);
    console.log(`  lu ${f}: ${arr.length}`);
  }
  return out;
}

/** Valide qu'une chaîne est un JSON [{q,a}] ; sinon null (+ warn). */
function validFaq(raw: unknown, slug: string): string | null {
  if (raw == null || raw === "") return null;
  const s = String(raw);
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr) && arr.every((x) => x && typeof x.q === "string" && typeof x.a === "string")) {
      return JSON.stringify(arr.map((x) => ({ q: x.q.trim(), a: x.a.trim() })));
    }
  } catch { /* fallthrough */ }
  console.log(`  ⚠ faqJsonAr invalide pour ${slug} → null`);
  return null;
}

async function main() {
  const glo = loadBatches("g");
  const sym = loadBatches("s");
  console.log(`Total : glossaire=${glo.length} symptômes=${sym.length}`);

  let gOk = 0, gSkip = 0;
  for (const g of glo) {
    if (!g.slug || !g.termAr || !g.definitionAr) { gSkip++; console.log(`  ⚠ glossaire incomplet: ${g.slug ?? "?"}`); continue; }
    const r = await prisma.glossaryTerm.updateMany({ where: { slug: g.slug }, data: { termAr: g.termAr, definitionAr: g.definitionAr } });
    if (r.count === 0) { gSkip++; console.log(`  ⚠ slug glossaire introuvable: ${g.slug}`); } else gOk++;
  }

  let sOk = 0, sSkip = 0;
  for (const s of sym) {
    if (!s.slug || !s.termAr || !s.shortAnswerAr) { sSkip++; console.log(`  ⚠ symptôme incomplet: ${s.slug ?? "?"}`); continue; }
    const r = await prisma.healthTopic.updateMany({
      where: { slug: s.slug, kind: "SYMPTOM" },
      data: {
        termAr: s.termAr,
        shortAnswerAr: s.shortAnswerAr,
        causesAr: s.causesAr ?? null,
        redFlagsAr: s.redFlagsAr ?? null,
        whenToConsultAr: s.whenToConsultAr ?? null,
        faqJsonAr: validFaq(s.faqJsonAr, s.slug),
      },
    });
    if (r.count === 0) { sSkip++; console.log(`  ⚠ slug symptôme introuvable: ${s.slug}`); } else sOk++;
  }

  console.log(`\n✓ Glossaire mis à jour: ${gOk} (ignorés ${gSkip}) | Symptômes: ${sOk} (ignorés ${sSkip})`);

  // Ouverture AR (Option A) : arReviewedAt là où la traduction est présente.
  const ag = await prisma.glossaryTerm.updateMany({ where: { status: "PUBLISHED", arReviewedAt: null, definitionAr: { not: null } }, data: { arReviewedAt: new Date() } });
  const asym = await prisma.healthTopic.updateMany({ where: { kind: "SYMPTOM", status: "PUBLISHED", arReviewedAt: null, shortAnswerAr: { not: null } }, data: { arReviewedAt: new Date() } });
  // Les symptômes n'étaient pas relus en FR (reviewedAt null) → on publie aussi le FR (Option A).
  const fsym = await prisma.healthTopic.updateMany({ where: { kind: "SYMPTOM", status: "PUBLISHED", reviewedAt: null }, data: { reviewedAt: new Date() } });
  console.log(`✓ AR ouvert : glossaire=${ag.count} symptômes=${asym.count} | FR symptômes publiés=${fsym.count}`);
  await prisma.$disconnect();
}

main();
