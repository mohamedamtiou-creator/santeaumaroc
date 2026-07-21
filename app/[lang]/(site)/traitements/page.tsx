import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { treatmentLocalized, isTreatmentReviewed } from "@/lib/treatment";
import { TopicListBrowser, type BrowserItem } from "@/components/health/TopicListBrowser";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/traitements";

const getTreatments = () =>
  prisma.treatment.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { name: "asc" },
    select: {
      slug: true, name: true, shortAnswer: true, synonyms: true, reviewedAt: true,
      nameAr: true, shortAnswerAr: true, arReviewedAt: true,
      // champs requis par le type de localisation (non affichés ici)
      options: true, duration: true, sideEffects: true, redFlags: true, whenToConsult: true, faqJson: true, sources: true,
      optionsAr: true, durationAr: true, sideEffectsAr: true, redFlagsAr: true, whenToConsultAr: true, faqJsonAr: true, sourcesAr: true,
    },
  });

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).treatments;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: t.metaTitle, description: t.metaDesc, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: t.metaTitle, description: t.metaDesc },
  };
}

export default async function TraitementsPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).treatments;
  const treatments = await getTreatments();

  const items: BrowserItem[] = treatments.map((tr) => {
    const L = treatmentLocalized(tr, locale);
    return { slug: tr.slug, title: L.name, summary: L.shortAnswer, synonyms: tr.synonyms };
  });

  const reviewed = treatments.filter(isTreatmentReviewed);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}#page`,
        "name": t.metaTitle,
        "description": t.metaDesc,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}#website` },
      },
      {
        "@type": "ItemList",
        "itemListElement": reviewed.map((tr, i) => {
          const L = treatmentLocalized(tr, locale);
          return {
            "@type": "ListItem",
            "position": i + 1,
            "name": L.name,
            "url": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}/${tr.slug}`,
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
          <TopicListBrowser items={items} labels={t} basePath="/traitements" />
          <p className="text-xs text-slate-400 mt-8 leading-relaxed">{t.disclaimer}</p>
        </div>
      </main>
    </>
  );
}
