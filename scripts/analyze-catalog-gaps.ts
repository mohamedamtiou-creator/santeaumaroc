/**
 * Analyse des manques du catalogue médical — la base chiffrée qui doit précéder
 * toute rédaction en volume.
 *
 * Principe : ne pas inventer une liste de sujets, mais la DÉDUIRE de ce que le
 * site réclame déjà. Un topic qui porte un angle traitement (`treatmentSummary`)
 * mais n'a pas de fiche `Treatment` est une demande interne explicite. Un topic
 * dont la spécialité n'a aucune fiche examen est un cul-de-sac de maillage.
 *
 *   npx tsx --env-file=.env scripts/analyze-catalog-gaps.ts
 */
import { prisma } from "@/lib/prisma";
import { CLUSTERS, CLUSTER_SLUGS } from "@/lib/life-clusters";
import { TOOLS, TOOL_SLUGS } from "@/lib/health-tools";

/** Slugs référencés par les outils et les dossiers : demande interne prouvée. */
function referencedSlugs(kind: "topic" | "exam" | "treatment"): Set<string> {
  const out = new Set<string>();
  if (kind !== "treatment") {
    for (const t of TOOL_SLUGS) {
      for (const s of kind === "topic" ? TOOLS[t].topicSlugs : TOOLS[t].examSlugs) out.add(s);
    }
  }
  for (const c of CLUSTER_SLUGS) {
    for (const section of CLUSTERS[c].sections) {
      for (const item of section.items) if (item.kind === kind) out.add(item.slug);
    }
  }
  return out;
}

async function main() {
  const [topics, exams, treatments, specialties] = await Promise.all([
    prisma.healthTopic.findMany({
      where: { status: "PUBLISHED", reviewedAt: { not: null } },
      select: {
        slug: true, term: true, kind: true, treatmentSummary: true, preventionSummary: true,
        specialty: { select: { slug: true, name: true } },
      },
      orderBy: { term: "asc" },
    }),
    prisma.medicalExam.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, name: true, reviewedAt: true, specialty: { select: { slug: true } } },
    }),
    prisma.treatment.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, name: true, reviewedAt: true, specialty: { select: { slug: true } } },
    }),
    prisma.specialty.findMany({ select: { slug: true, name: true } }),
  ]);

  console.log("── VOLUMES ACTUELS ───────────────────────────────────────");
  console.log(`topics relus ${topics.length} · examens ${exams.length} (relus ${exams.filter((e) => e.reviewedAt).length}) · traitements ${treatments.length} (relus ${treatments.filter((t) => t.reviewedAt).length})`);

  // ── 1. Traitements manquants là où le site porte déjà l'angle traitement ──
  const treatmentBySlug = new Set(treatments.map((t) => t.slug));
  const withTreatmentAngle = topics.filter((t) => t.treatmentSummary);
  const missingTreatment = withTreatmentAngle.filter((t) => !treatmentBySlug.has(`traitement-${t.slug}`));
  console.log(`\n── TRAITEMENTS : DEMANDE INTERNE NON SERVIE ──────────────`);
  console.log(`${withTreatmentAngle.length} topics portent une page /comment-traiter, ${missingTreatment.length} n'ont pas de fiche Traitement`);
  for (const t of missingTreatment.slice(0, 25)) {
    console.log(`   traitement-${t.slug.padEnd(34)} ← ${t.term} (${t.specialty?.slug ?? "sans spécialité"})`);
  }
  if (missingTreatment.length > 25) console.log(`   … et ${missingTreatment.length - 25} autres`);

  // ── 2. Maladies fréquentes sans fiche traitement, par spécialité ──────────
  const diseases = topics.filter((t) => t.kind === "DISEASE");
  const treatmentsBySpec = new Map<string, number>();
  for (const t of treatments) if (t.specialty) treatmentsBySpec.set(t.specialty.slug, (treatmentsBySpec.get(t.specialty.slug) ?? 0) + 1);
  const diseasesBySpec = new Map<string, number>();
  for (const d of diseases) if (d.specialty) diseasesBySpec.set(d.specialty.slug, (diseasesBySpec.get(d.specialty.slug) ?? 0) + 1);

  console.log(`\n── COUVERTURE PAR SPÉCIALITÉ (maladies vs fiches) ────────`);
  const specName = new Map(specialties.map((s) => [s.slug, s.name] as const));
  const rows = [...diseasesBySpec.entries()]
    .map(([slug, nb]) => ({ slug, nb, tr: treatmentsBySpec.get(slug) ?? 0 }))
    .sort((a, b) => b.nb - a.nb || a.slug.localeCompare(b.slug));
  for (const r of rows.slice(0, 15)) {
    const deficit = r.nb - r.tr;
    console.log(`   ${String(r.nb).padStart(3)} maladies · ${String(r.tr).padStart(2)} traitements · déficit ${String(deficit).padStart(3)} · ${specName.get(r.slug) ?? r.slug}`);
  }

  // ── 3. Examens : ce que les outils et dossiers réclament déjà ─────────────
  const examBySlug = new Set(exams.map((e) => e.slug));
  const wantedExams = referencedSlugs("exam");
  const missingRefExams = [...wantedExams].filter((s) => !examBySlug.has(s));
  console.log(`\n── EXAMENS ───────────────────────────────────────────────`);
  console.log(`référencés par les outils et dossiers : ${wantedExams.size} · absents du catalogue : ${missingRefExams.length}`);
  if (missingRefExams.length) console.log(`   ${missingRefExams.join(", ")}`);
  const examsBySpec = new Map<string, number>();
  for (const e of exams) if (e.specialty) examsBySpec.set(e.specialty.slug, (examsBySpec.get(e.specialty.slug) ?? 0) + 1);
  const specsWithoutExam = rows.filter((r) => (examsBySpec.get(r.slug) ?? 0) === 0 && r.nb >= 3);
  console.log(`\nspécialités avec ≥ 3 maladies mais AUCUNE fiche examen — culs-de-sac de maillage :`);
  for (const r of specsWithoutExam.slice(0, 12)) console.log(`   ${String(r.nb).padStart(3)} maladies · ${specName.get(r.slug) ?? r.slug}`);

  // ── 4. Liste de candidats prête à élaguer ────────────────────────────────
  // Convention du projet (cf. docs/seo/intent-pages-pipeline.md) : on produit une
  // liste priorisée, l'humain l'élague, ET SEULEMENT ENSUITE on rédige.
  if (process.argv.includes("--emit")) {
    const tier = (t: (typeof topics)[number]) =>
      t.treatmentSummary ? 1 : t.kind === "DISEASE" ? 2 : 3;
    const candidates = topics
      .filter((t) => !treatmentBySlug.has(`traitement-${t.slug}`) && t.specialty)
      .map((t) => ({ slug: `traitement-${t.slug}`, topic: t.slug, name: t.term, specialty: t.specialty!.slug, tier: tier(t) }))
      .sort((a, b) => a.tier - b.tier || a.slug.localeCompare(b.slug));

    console.log(`\n── LISTE DE CANDIDATS « TRAITEMENTS » (${candidates.length}) ─────────`);
    console.log(`// Généré par scripts/analyze-catalog-gaps.ts --emit — à élaguer avant rédaction.`);
    console.log(`// tier 1 = le site porte déjà l'angle traitement (/comment-traiter) : demande interne prouvée`);
    console.log(`// tier 2 = maladie sans fiche traitement · tier 3 = symptôme (à confirmer en Search Console)`);
    console.log(`export const TREATMENT_CANDIDATES = [`);
    for (const c of candidates) {
      console.log(`  { slug: "${c.slug}", topic: "${c.topic}", name: ${JSON.stringify(c.name)}, specialty: "${c.specialty}", tier: ${c.tier} },`);
    }
    console.log(`] as const;`);
    const byTier = candidates.reduce<Record<number, number>>((a, c) => ({ ...a, [c.tier]: (a[c.tier] ?? 0) + 1 }), {});
    console.log(`// tiers T1/T2/T3 : ${byTier[1] ?? 0}/${byTier[2] ?? 0}/${byTier[3] ?? 0}`);
  } else {
    console.log(`\n(relancer avec --emit pour produire la liste de candidats à élaguer)`);
  }

  // ── 5. Prévention ────────────────────────────────────────────────────────
  const withPrevention = topics.filter((t) => t.preventionSummary).length;
  console.log(`\n── PRÉVENTION ────────────────────────────────────────────`);
  console.log(`${withPrevention}/${topics.length} topics portent un résumé de prévention → ${topics.length - withPrevention} pages possibles sans une ligne de code`);
  const preventable = diseases.filter((d) => !d.preventionSummary).slice(0, 15);
  console.log(`prochains sujets de prévention les plus évidents (maladies) :`);
  for (const d of preventable) console.log(`   ${d.slug.padEnd(36)} ${d.term}`);
}

main().finally(() => prisma.$disconnect());
