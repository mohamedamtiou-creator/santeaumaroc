import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { topicLocalized, isTopicReviewed } from "@/lib/health-topic";
import { TopicListBrowser, type BrowserItem } from "@/components/health/TopicListBrowser";
import { HubHero } from "@/components/health/HubHero";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/maladies";

const getTopics = () =>
  prisma.healthTopic.findMany({
    where: { kind: "DISEASE", status: "PUBLISHED" },
    orderBy: { term: "asc" },
    select: {
      slug: true, term: true, shortAnswer: true, synonyms: true, reviewedAt: true,
      termAr: true, shortAnswerAr: true, arReviewedAt: true,
      causes: true, redFlags: true, whenToConsult: true, faqJson: true, sources: true,
      causesAr: true, redFlagsAr: true, whenToConsultAr: true, faqJsonAr: true, sourcesAr: true,
    },
  });

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).diseases;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: t.metaTitle, description: t.metaDesc, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: t.metaTitle, description: t.metaDesc },
  };
}

export default async function MaladiesPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const dict = getDictionary(locale);
  const t = dict.diseases;
  const topics = await getTopics();

  const items: BrowserItem[] = topics.map((tp) => {
    const L = topicLocalized(tp, locale);
    return { slug: tp.slug, title: L.term, summary: L.shortAnswer, synonyms: tp.synonyms };
  });

  const reviewed = topics.filter(isTopicReviewed);
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
        "itemListElement": reviewed.map((tp, i) => {
          const L = topicLocalized(tp, locale);
          return {
            "@type": "ListItem",
            "position": i + 1,
            "name": L.term,
            "url": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}/${tp.slug}`,
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

      <HubHero
        eyebrow={t.breadcrumb}
        title={t.title}
        intro={t.intro}
        countChip={t.count.replace("{n}", String(reviewed.length))}
        chips={dict.healthHub}
      />

      <div className="page-outer">
        <div className="max-w-3xl mx-auto">
          <TopicListBrowser items={items} labels={t} basePath="/maladies" />
          <p className="text-xs text-slate-400 mt-8 leading-relaxed">{t.disclaimer}</p>
        </div>
      </div>
    </>
  );
}
