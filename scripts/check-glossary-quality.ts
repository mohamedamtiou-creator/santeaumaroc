/**
 * Rapport de qualité du glossaire — recalcule ce que coûte et ce que rapporte
 * chaque règle d'indexation, pour que le durcissement du garde-fou reste une
 * décision chiffrée et non un pari.
 *
 *   npx tsx --env-file=.env scripts/check-glossary-quality.ts
 *
 * À rejouer avant d'activer `GLOSSARY_REQUIRE_ENRICHMENT` (lib/glossary-quality)
 * et après chaque lot d'enrichissement.
 */
import { prisma } from "@/lib/prisma";
import {
  GLOSSARY_MIN_WORDS,
  GLOSSARY_REQUIRE_ENRICHMENT,
  countSources,
  countWords,
  glossaryQuality,
} from "@/lib/glossary-quality";

async function main() {
  const terms = await prisma.glossaryTerm.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true, term: true, definition: true, sources: true,
      relatedSlug: true, synonyms: true, reviewedAt: true, arReviewedAt: true,
    },
    orderBy: { term: "asc" },
  });

  const reviewed = terms.filter((t) => t.reviewedAt);
  const words = reviewed.map((t) => countWords(t.definition));
  const q = (arr: number[], p: number) => {
    const s = [...arr].sort((a, b) => a - b);
    return s.length ? s[Math.floor((s.length - 1) * p)] : 0;
  };

  console.log("── ÉTAT DU GLOSSAIRE ─────────────────────────────────────");
  console.log(`publiés ${terms.length} · relus FR ${reviewed.length} · relus AR ${terms.filter((t) => t.arReviewedAt).length}`);
  if (reviewed.length === 0) return;
  console.log(`définitions (mots) : min ${Math.min(...words)} · médiane ${q(words, 0.5)} · max ${Math.max(...words)}`);

  const withSource = reviewed.filter((t) => countSources(t.sources) > 0).length;
  const withPillar = reviewed.filter((t) => t.relatedSlug).length;
  const withSynonym = reviewed.filter((t) => t.synonyms.length > 0).length;
  const withAny = reviewed.filter((t) => glossaryQuality(t).hasEnrichment).length;
  console.log(`\nenrichissement : source ${withSource} · pilier ${withPillar} · synonyme ${withSynonym} · au moins un ${withAny}`);

  console.log("\n── RÈGLE ACTIVE ──────────────────────────────────────────");
  console.log(`plancher de longueur : ${GLOSSARY_MIN_WORDS} mots`);
  console.log(`exigence d'enrichissement : ${GLOSSARY_REQUIRE_ENRICHMENT ? "ACTIVE" : "désactivée"}`);
  const blocked = reviewed.filter((t) => !glossaryQuality(t).substantial);
  console.log(`→ ${blocked.length} terme(s) relu(s) servi(s) en noindex par la règle actuelle`);
  for (const t of blocked.slice(0, 15)) {
    const g = glossaryQuality(t);
    console.log(`   ${String(g.words).padStart(3)} mots · ${g.issues.join(", ")} · ${t.slug}`);
  }

  console.log("\n── COÛT DES DURCISSEMENTS POSSIBLES ──────────────────────");
  for (const w of [26, 28, 30, 35, 40]) {
    const n = reviewed.filter((t) => countWords(t.definition) < w).length;
    console.log(`plancher ${String(w).padStart(2)} mots      → ${String(n).padStart(3)} page(s) déindexée(s)`);
  }
  console.log(`exiger un signal      → ${String(reviewed.length - withAny).padStart(3)} page(s) déindexée(s)`);
  console.log(`exiger une source     → ${String(reviewed.length - withSource).padStart(3)} page(s) déindexée(s)`);

  console.log("\n── CHANTIER D'ENRICHISSEMENT LE PLUS RENTABLE ────────────");
  const noSource = reviewed.filter((t) => countSources(t.sources) === 0);
  console.log(`${noSource.length} terme(s) relu(s) sans aucune source vérifiable — le levier E-E-A-T n° 1`);
  console.log(`${reviewed.filter((t) => !t.relatedSlug).length} terme(s) sans article pilier : autant de culs-de-sac de maillage`);
}

main().finally(() => prisma.$disconnect());
