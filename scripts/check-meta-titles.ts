import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDictionary, type Locale } from "@/lib/i18n";
import { composeIntentQuestion, composeTreatmentQuestion, composePreventionQuestion } from "@/lib/health-topic";
import { labelWithoutGloss } from "@/lib/utils";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// ════════════════════════════════════════════════════════════════════════════
// Contrôle des <title> composés du silo santé, FR et AR, sur les 8 rubriques
// (maladies, symptômes, examens, traitements, glossaire, quel-medecin-pour,
// comment-traiter, prevenir).
//
// Reproduit EXACTEMENT ce que rend la production : mêmes gabarits de dictionnaire,
// mêmes fonctions de composition, et même retrait de la glose par
// `labelWithoutGloss`. Vérifie deux régressions constatées le 4 août 2026 :
//
//  1. MÉLANGE DE LANGUES — un titre arabe ne doit pas contenir les mots du
//     gabarit français (« حبّ الشباب : causes, symptômes et quand consulter »).
//     C'est une ERREUR : sortie en échec.
//  2. LONGUEUR SERP — le gabarit de layout ajoute « | SantéauMaroc » (15 car.),
//     facile à oublier. Au-delà de 60 caractères, Google tronque. C'est un
//     AVERTISSEMENT : la longueur restante dépend des gabarits eux-mêmes, dont le
//     raccourcissement est un arbitrage de mots-clés, pas un correctif technique.
//
//   npx tsx --env-file=.env scripts/check-meta-titles.ts
// ════════════════════════════════════════════════════════════════════════════

const SUFFIX = " | SantéauMaroc".length;
const LIMIT = 60;
const FR_TEMPLATE_WORDS = /\b(causes|symptômes|quand|consulter|déroulé|préparation|prix|options|durée|effets|définition|médecin|traiter|prévenir)\b/i;
const AR_CHARS = /[؀-ۿ]/;

type Row = { silo: string; slug: string; lang: Locale; title: string };

const rows: Row[] = [];
const push = (silo: string, slug: string, lang: Locale, title: string) => rows.push({ silo, slug, lang, title });

async function main() {
  const topics = await prisma.healthTopic.findMany({
    select: { slug: true, kind: true, term: true, termAr: true, arReviewedAt: true, intentSlug: true, treatmentSummary: true, preventionSummary: true },
  });
  for (const t of topics) {
    const ns = t.kind === "DISEASE" ? "diseases" : "symptoms";
    const silo = t.kind === "DISEASE" ? "maladies" : "symptomes";
    for (const lang of ["fr", "ar"] as const) {
      // Le libellé arabe n'est servi que si la relecture est validée (verrou YMYL).
      const arServed = lang === "ar" && !!t.arReviewedAt && !!t.termAr;
      const label = arServed ? t.termAr! : t.term;
      const dictLang: Locale = arServed ? "ar" : "fr";
      push(silo, t.slug, lang, getDictionary(dictLang)[ns].itemMetaTitle.replace("{term}", labelWithoutGloss(label)));
      const short = labelWithoutGloss(label);
      if (t.intentSlug) push("quel-medecin-pour", t.slug, lang, composeIntentQuestion(short, dictLang));
      if (t.treatmentSummary) push("comment-traiter", t.slug, lang, composeTreatmentQuestion(short, dictLang));
      if (t.preventionSummary) push("prevenir", t.slug, lang, composePreventionQuestion(short, dictLang));
    }
  }

  for (const [silo, model, ns, key] of [
    ["examens", "medicalExam", "exams", "name"],
    ["traitements", "treatment", "treatments", "name"],
    ["glossaire", "glossaryTerm", "glossary", "term"],
  ] as const) {
    const items = await (prisma as never as Record<string, { findMany: (a: unknown) => Promise<Record<string, string | Date | null>[]> }>)[model].findMany({
      select: { slug: true, [key]: true, [`${key}Ar`]: true, arReviewedAt: true },
    });
    for (const it of items) {
      for (const lang of ["fr", "ar"] as const) {
        const arServed = lang === "ar" && !!it.arReviewedAt && !!it[`${key}Ar`];
        const label = String(arServed ? it[`${key}Ar`] : it[key]);
        const dictLang: Locale = arServed ? "ar" : "fr";
        push(silo, String(it.slug), lang, getDictionary(dictLang)[ns].itemMetaTitle.replace("{term}", labelWithoutGloss(label)));
      }
    }
  }

  const mixed = rows.filter((r) => AR_CHARS.test(r.title) && FR_TEMPLATE_WORDS.test(r.title));
  const tooLong = rows.filter((r) => r.title.length + SUFFIX > LIMIT);

  console.log(`${rows.length} titres composés (8 rubriques × FR/AR) — limite SERP ${LIMIT} car., suffixe « | SantéauMaroc » inclus\n`);
  if (mixed.length === 0) console.log("✓ aucun mélange de langues");
  else {
    console.log(`✗ ${mixed.length} titre(s) mélangeant les langues :`);
    for (const r of mixed.slice(0, 10)) console.log(`  ${r.silo}/${r.slug} → « ${r.title} »`);
    process.exitCode = 1;
  }

  const byTemplate = new Map<string, number>();
  for (const r of tooLong) byTemplate.set(r.silo, (byTemplate.get(r.silo) ?? 0) + 1);
  console.log(`\n⚠ ${tooLong.length} titre(s) au-delà de ${LIMIT} car. (${Math.round((tooLong.length / rows.length) * 100)} %), par rubrique :`);
  for (const [silo, n] of [...byTemplate.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${silo}`);
  console.log("\n  Le reste vient de la LONGUEUR DES GABARITS, pas des libellés : les");
  console.log("  raccourcir revient à retirer des mots-clés (« symptômes », « au Maroc »)");
  console.log("  — arbitrage éditorial, cf. docs. Aucune action automatique ici.");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
