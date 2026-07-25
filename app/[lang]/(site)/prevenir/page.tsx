import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Locale } from "@/lib/i18n";
import { isTopicArReady, isTopicReviewed, composePreventionQuestion } from "@/lib/health-topic";
import { tSpecialty } from "@/lib/specialty-i18n";
import { HubHero } from "@/components/health/HubHero";
import { BlogFaq } from "@/components/blog/BlogFaq";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/prevenir";

const getTopics = () =>
  prisma.healthTopic.findMany({
    where: { preventionSummary: { not: null }, status: "PUBLISHED" },
    orderBy: { term: "asc" },
    select: {
      slug: true, term: true, termAr: true,
      reviewedAt: true, arReviewedAt: true, shortAnswerAr: true,
      preventionSummary: true, preventionSummaryAr: true,
      specialty: { select: { name: true } },
    },
  });

function localizedTerm(tp: { term: string; termAr: string | null; arReviewedAt: Date | null; shortAnswerAr: string | null }, locale: Locale): string {
  const ar = locale === "ar" && isTopicArReady(tp);
  return ar && tp.termAr ? tp.termAr : tp.term;
}

/** Accroche : 1re phrase du résumé de prévention (localisé), tronquée. */
function teaser(tp: { preventionSummary: string | null; preventionSummaryAr: string | null; arReviewedAt: Date | null; shortAnswerAr: string | null }, locale: Locale): string {
  const ar = locale === "ar" && isTopicArReady(tp);
  const src = ((ar && tp.preventionSummaryAr ? tp.preventionSummaryAr : tp.preventionSummary) ?? "").trim();
  if (!src) return "";
  const first = src.split(/(?<=[.!؟?])\s/)[0] ?? src;
  return first.length > 150 ? `${first.slice(0, 147).trim()}…` : first;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).prevent;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: t.metaTitle, description: t.metaDesc, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: t.metaTitle, description: t.metaDesc },
  };
}

export default async function PreventionIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const dict = getDictionary(locale);
  const t = dict.prevent;
  const tb = dict.blog;
  const faqItems = t.faqItems.map((f) => ({ q: f.q, a: f.a }));
  const topics = await getTopics();

  const groups = new Map<string, { slug: string; question: string; teaser: string }[]>();
  for (const tp of topics) {
    const specName = tp.specialty ? tSpecialty(tp.specialty.name, locale) : (locale === "ar" ? "أخرى" : "Autres");
    const term = localizedTerm(tp, locale);
    const entry = { slug: tp.slug, question: composePreventionQuestion(term, locale), teaser: teaser(tp, locale) };
    const arr = groups.get(specName);
    if (arr) arr.push(entry);
    else groups.set(specName, [entry]);
  }
  const sortedGroups = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], locale === "ar" ? "ar" : "fr"));

  const reviewedFlat = topics.filter(isTopicReviewed);
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
        "itemListElement": reviewedFlat.map((tp, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": composePreventionQuestion(localizedTerm(tp, locale), locale),
          "url": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}/${tp.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.listTitle, "item": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <HubHero
        eyebrow={t.breadcrumb}
        title={t.listTitle}
        intro={t.intro}
        countChip={t.count.replace("{n}", String(reviewedFlat.length))}
        chips={dict.healthHub}
      />

      <div className="page-outer">
        <div className="max-w-3xl mx-auto">
          <section aria-labelledby="howto-title" className="mb-8 rounded-2xl border border-secondary-200 bg-secondary-50/50 p-5 sm:p-6">
            <h2 id="howto-title" className="text-base font-bold text-slate-900 mb-2">{t.editorialTitle}</h2>
            <p className="text-sm text-slate-600 leading-relaxed" dir="auto">{t.editorialBody}</p>
          </section>

          {sortedGroups.map(([specName, entries]) => (
            <section key={specName} className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-secondary-600 mb-3" dir="auto">{specName}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {entries.sort((a, b) => a.question.localeCompare(b.question, locale === "ar" ? "ar" : "fr")).map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`${PATH}/${e.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-secondary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2"
                      dir="auto"
                    >
                      <span className="flex items-center gap-2 font-bold text-slate-900 leading-snug group-hover:text-secondary-700">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-secondary-400 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                        {e.question}
                      </span>
                      {e.teaser && <span className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">{e.teaser}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* FAQ (visible + JSON-LD FAQPage émis par le composant) */}
          <BlogFaq items={faqItems} t={tb} />
        </div>
      </div>
    </>
  );
}
