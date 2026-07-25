/**
 * Seed des fiches HealthTopic générées par le workflow (draft-intent-fiches),
 * lues depuis scripts/data/generated/*.json. BILINGUE, upsert par slug,
 * **reviewedAt/arReviewedAt=null → noindex** jusqu'à relecture humaine (YMYL).
 * `intentSlug` NON posé ici (attaché après relecture via seed-intent-pages.ts).
 *
 * Valide chaque fichier ; ignore et signale les fiches incomplètes/invalides.
 *
 *   npx tsx --env-file=.env scripts/seed-generated.ts
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";

const DIR = join(process.cwd(), "scripts", "data", "generated");

type Faq = { q: string; a: string };
type Gen = {
  slug: string; term: string; kind: string; specialty: string;
  synonyms?: string[];
  shortAnswer: string; causes: string[]; redFlags: string[]; whenToConsult: string; faq: Faq[]; intentAnswer: string;
  termAr: string; shortAnswerAr: string; causesAr: string[]; redFlagsAr: string[]; whenToConsultAr: string; faqAr: Faq[]; intentAnswerAr: string;
};

const str = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const arr = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string" && x.trim());
const faqOk = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every((x) => x && str((x as Faq).q) && str((x as Faq).a));

function validate(g: Record<string, unknown>): string | null {
  if (!str(g.slug)) return "slug manquant";
  if (g.kind !== "SYMPTOM" && g.kind !== "DISEASE") return "kind invalide";
  for (const f of ["term", "shortAnswer", "whenToConsult", "intentAnswer", "termAr", "shortAnswerAr", "whenToConsultAr", "intentAnswerAr", "specialty"] as const)
    if (!str(g[f])) return `champ FR/AR manquant: ${f}`;
  for (const f of ["causes", "redFlags", "causesAr", "redFlagsAr"] as const)
    if (!arr(g[f])) return `liste manquante: ${f}`;
  if (!faqOk(g.faq) || !faqOk(g.faqAr)) return "faq/faqAr invalide";
  return null;
}

async function main() {
  if (!existsSync(DIR)) { console.error(`✗ dossier introuvable: ${DIR}`); return; }
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  const specialties = await prisma.specialty.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(specialties.map((s) => [s.slug, s.id]));

  let done = 0;
  const skipped: string[] = [];
  const missingSpec = new Set<string>();

  for (const file of files) {
    let g: Record<string, unknown>;
    try { g = JSON.parse(readFileSync(join(DIR, file), "utf8")); }
    catch { skipped.push(`${file} (JSON invalide)`); continue; }

    const err = validate(g);
    if (err) { skipped.push(`${file} (${err})`); continue; }
    const t = g as unknown as Gen;

    const specialtyId = bySlug.get(t.specialty) ?? null;
    if (!specialtyId) missingSpec.add(t.specialty);

    const data = {
      kind: t.kind,
      term: t.term,
      shortAnswer: t.shortAnswer,
      causes: t.causes.join("\n"),
      redFlags: t.redFlags.join("\n"),
      whenToConsult: t.whenToConsult,
      faqJson: JSON.stringify(t.faq),
      synonyms: Array.isArray(t.synonyms) ? t.synonyms.filter((s) => typeof s === "string") : [],
      specialtyId,
      sources: null,
      intentAnswer: t.intentAnswer,
      intentAnswerAr: t.intentAnswerAr,
      termAr: t.termAr,
      shortAnswerAr: t.shortAnswerAr,
      causesAr: t.causesAr.join("\n"),
      redFlagsAr: t.redFlagsAr.join("\n"),
      whenToConsultAr: t.whenToConsultAr,
      faqJsonAr: JSON.stringify(t.faqAr),
      status: "PUBLISHED",
      // reviewedAt / arReviewedAt volontairement non posés → noindex.
    };
    await prisma.healthTopic.upsert({ where: { slug: t.slug }, create: { slug: t.slug, ...data }, update: data });
    done++;
  }

  console.log(`✓ ${done}/${files.length} fiche(s) générée(s) semée(s) FR+AR (noindex).`);
  if (missingSpec.size) console.warn(`⚠️ spécialités introuvables : ${[...missingSpec].join(", ")}`);
  if (skipped.length) { console.warn(`⚠️ ${skipped.length} fichier(s) ignoré(s) :`); for (const s of skipped) console.warn(`   - ${s}`); }
}

main().finally(() => prisma.$disconnect());
