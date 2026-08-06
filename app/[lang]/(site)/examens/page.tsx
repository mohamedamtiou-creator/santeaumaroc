import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { examLocalized, isExamReviewed } from "@/lib/medical-exam";
import { TopicListBrowser, type BrowserItem } from "@/components/health/TopicListBrowser";
import { HubHero } from "@/components/health/HubHero";

export const revalidate = 86400; // TTL.DIRECTORY

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/examens";

const getExams = () =>
  prisma.medicalExam.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { name: "asc" },
    select: {
      slug: true, name: true, shortAnswer: true, synonyms: true, reviewedAt: true,
      nameAr: true, shortAnswerAr: true, arReviewedAt: true,
      // champs requis par le type de localisation (non affichés ici)
      indications: true, procedure: true, preparation: true, precautions: true, reimbursement: true, faqJson: true, sources: true,
      indicationsAr: true, procedureAr: true, preparationAr: true, precautionsAr: true, reimbursementAr: true, faqJsonAr: true, sourcesAr: true,
    },
  });

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).exams;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: t.metaTitle, description: t.metaDesc, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: t.metaTitle, description: t.metaDesc },
  };
}

export default async function ExamensPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const dict = getDictionary(locale);
  const t = dict.exams;
  const exams = await getExams();

  const items: BrowserItem[] = exams.map((e) => {
    const L = examLocalized(e, locale);
    return { slug: e.slug, title: L.name, summary: L.shortAnswer, synonyms: e.synonyms };
  });

  const reviewed = exams.filter(isExamReviewed);
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
        "itemListElement": reviewed.map((e, i) => {
          const L = examLocalized(e, locale);
          return {
            "@type": "ListItem",
            "position": i + 1,
            "name": L.name,
            "url": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}/${e.slug}`,
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
          <TopicListBrowser items={items} labels={t} basePath="/examens" />
          <p className="text-xs text-slate-400 mt-8 leading-relaxed">{t.disclaimer}</p>
        </div>
      </div>
    </>
  );
}
