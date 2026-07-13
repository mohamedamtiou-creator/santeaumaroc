/**
 * Seed des sources / références médicales sur les articles piliers.
 *
 * Chaque entrée = référence institutionnelle RÉELLE et VÉRIFIÉE (fiches OMS,
 * FR + AR). On ne seed JAMAIS de source non vérifiée sur du contenu YMYL.
 * Étendre ce mapping au fil de la relecture éditoriale (HAS, ANAM, Ministère
 * de la Santé MA, PubMed…). Le champ `sources`/`sourcesAr` est du JSON :
 *   [{ label, url, publisher?, year? }]
 *
 * Lancer :  npx tsx --env-file=.env scripts/seed-blog-sources.ts
 */
import { prisma } from "@/lib/prisma";

type Src = { label: string; url: string; publisher?: string; year?: string };

const WHO_FR = (slug: string) => `https://www.who.int/fr/news-room/fact-sheets/detail/${slug}`;
const WHO_AR = (slug: string) => `https://www.who.int/ar/news-room/fact-sheets/detail/${slug}`;

// pillier -> { who: slug OMS, fr: libellé FR, ar: libellé AR, year }
const MAP: Record<string, { who: string; fr: string; ar: string; year: string }> = {
  "hypertension-arterielle-maroc":            { who: "hypertension",                 fr: "Hypertension artérielle",     ar: "ارتفاع ضغط الدم",              year: "2025" },
  "diabete-type-2-maroc":                     { who: "diabetes",                     fr: "Diabète",                     ar: "داء السكري",                   year: "2024" },
  "asthme-maroc":                             { who: "asthma",                       fr: "Asthme",                      ar: "الربو",                        year: "2026" },
  "obesite-maroc":                            { who: "obesity-and-overweight",       fr: "Obésité et surpoids",         ar: "السمنة وزيادة الوزن",          year: "2025" },
  "depression-maroc":                         { who: "depression",                   fr: "Trouble dépressif (dépression)", ar: "الاكتئاب",                  year: "2025" },
  "hepatite-maroc":                           { who: "hepatitis-b",                  fr: "Hépatite B",                  ar: "التهاب الكبد B",               year: "2026" },
  "cancer-colorectal-maroc":                  { who: "colorectal-cancer",            fr: "Cancer colorectal",           ar: "سرطان القولون والمستقيم",       year: "2026" },
  "avc-accident-vasculaire-cerebral-maroc":   { who: "cardiovascular-diseases-(cvds)", fr: "Maladies cardiovasculaires", ar: "أمراض القلب والأوعية الدموية", year: "2025" },
  "cholesterol-maroc":                        { who: "cardiovascular-diseases-(cvds)", fr: "Maladies cardiovasculaires", ar: "أمراض القلب والأوعية الدموية", year: "2025" },
};

async function main() {
  let done = 0;
  for (const [slug, m] of Object.entries(MAP)) {
    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!post) {
      console.warn(`⚠️  article introuvable : ${slug} (ignoré)`);
      continue;
    }
    const fr: Src[] = [
      { label: `Organisation mondiale de la Santé — « ${m.fr} »`, url: WHO_FR(m.who), publisher: "OMS", year: m.year },
    ];
    const ar: Src[] = [
      { label: `منظمة الصحة العالمية — «${m.ar}»`, url: WHO_AR(m.who), publisher: "منظمة الصحة العالمية", year: m.year },
    ];
    await prisma.post.update({
      where: { id: post.id },
      data: { sources: JSON.stringify(fr), sourcesAr: JSON.stringify(ar) },
    });
    done++;
    console.log(`✓ ${slug}`);
  }
  console.log(`\n${done}/${Object.keys(MAP).length} articles piliers sourcés.`);
}

main().finally(() => prisma.$disconnect());
