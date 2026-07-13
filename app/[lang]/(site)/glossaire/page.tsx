import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { glossaryLocalized, isGlossaryReviewed, normalizeCategory } from "@/lib/glossary";
import { GlossaryBrowser, type GlossaryItem } from "@/components/glossary/GlossaryBrowser";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/glossaire";

const getTerms = () =>
  prisma.glossaryTerm.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { term: "asc" },
    select: {
      slug: true, term: true, definition: true, category: true, synonyms: true,
      termAr: true, definitionAr: true, sources: true, sourcesAr: true,
      arReviewedAt: true, reviewedAt: true,
    },
  });

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).glossary;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: t.metaTitle, description: t.metaDesc, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: t.metaTitle, description: t.metaDesc },
  };
}

export default async function GlossairePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).glossary;
  const terms = await getTerms();

  const items: GlossaryItem[] = terms.map((tm) => {
    const L = glossaryLocalized(tm, locale);
    return {
      slug: tm.slug,
      term: L.term,
      definition: L.definition,
      category: normalizeCategory(tm.category),
      synonyms: tm.synonyms,
    };
  });

  // JSON-LD DefinedTermSet — on n'y déclare que les termes RELUS (indexables),
  // pour ne pas exposer d'URL noindex dans les données structurées.
  const reviewed = terms.filter(isGlossaryReviewed);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTermSet",
        "@id": `${BASE}${PATH}#set`,
        "name": t.title,
        "description": t.metaDesc,
        "url": locale === "ar" ? `${BASE}/ar${PATH}` : `${BASE}${PATH}`,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "hasDefinedTerm": reviewed.map((tm) => {
          const L = glossaryLocalized(tm, locale);
          return {
            "@type": "DefinedTerm",
            "name": L.term,
            "url": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}/${tm.slug}`,
          };
        }),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="hero-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20">
          <p className="section-eyebrow text-secondary-300 mb-4">{t.breadcrumb}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 tracking-tight" dir="auto">{t.title}</h1>
          <p className="text-white/75 text-lg leading-relaxed" dir="auto">{t.intro}</p>
        </div>
      </div>

      <main className="page-outer">
        <div className="max-w-3xl mx-auto">
          <GlossaryBrowser items={items} t={t} />
          <p className="text-xs text-slate-400 mt-8 leading-relaxed">{t.disclaimer}</p>
        </div>
      </main>
    </>
  );
}
