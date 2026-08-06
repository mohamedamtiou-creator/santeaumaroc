import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Locale } from "@/lib/i18n";
import { isGuideArReady, isGuideReviewed } from "@/lib/specialty-guide";
import { tSpecialty } from "@/lib/specialty-i18n";
import { HubHero } from "@/components/health/HubHero";
import { BlogFaq } from "@/components/blog/BlogFaq";

export const revalidate = 86400; // TTL.DIRECTORY

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/quand-consulter";

const getGuides = () =>
  prisma.specialtyGuide.findMany({
    where: { status: "PUBLISHED", reviewedAt: { not: null } },
    select: {
      reviewedAt: true, arReviewedAt: true, shortAnswer: true, shortAnswerAr: true,
      specialty: { select: { slug: true, name: true } },
    },
  });

/** Accroche : 1re phrase de la réponse (localisée), tronquée pour la carte. */
function teaser(g: { shortAnswer: string; shortAnswerAr: string | null; arReviewedAt: Date | null }, locale: Locale): string {
  const ar = locale === "ar" && isGuideArReady(g);
  const src = (ar && g.shortAnswerAr ? g.shortAnswerAr : g.shortAnswer).trim();
  const firstSentence = src.split(/(?<=[.!؟?])\s/)[0] ?? src;
  return firstSentence.length > 150 ? `${firstSentence.slice(0, 147).trim()}…` : firstSentence;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).whenToConsult;
  return {
    title: t.metaTitleIndex,
    description: t.metaDescIndex,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: t.metaTitleIndex, description: t.metaDescIndex, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: t.metaTitleIndex, description: t.metaDescIndex },
  };
}

export default async function WhenToConsultIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const dict = getDictionary(locale);
  const t = dict.whenToConsult;
  const tb = dict.blog;
  const guides = (await getGuides()).filter(isGuideReviewed);

  const items = guides
    .map((g) => ({
      slug: g.specialty.slug,
      name: tSpecialty(g.specialty.name, locale),
      question: t.h1.replace("{specialty}", tSpecialty(g.specialty.name, locale)),
      teaser: teaser(g, locale),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale === "ar" ? "ar" : "fr"));

  const faqItems = t.faqItems.map((f) => ({ q: f.q, a: f.a }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}#page`,
        "name": t.metaTitleIndex,
        "description": t.metaDescIndex,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}#website` },
      },
      {
        "@type": "ItemList",
        "itemListElement": items.map((it, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": it.question,
          "url": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}/${it.slug}`,
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
        countChip={t.count.replace("{n}", String(items.length))}
        chips={dict.healthHub}
      />

      <div className="page-outer">
        <div className="max-w-4xl mx-auto">
          {/* Bloc éditorial : mode d'emploi */}
          <section aria-labelledby="howto-title" className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6">
            <h2 id="howto-title" className="text-base font-bold text-slate-900 mb-2">{t.editorialTitle}</h2>
            <p className="text-sm text-slate-600 leading-relaxed" dir="auto">{t.editorialBody}</p>
          </section>

          {/* Cartes spécialité avec accroche */}
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((it) => (
              <li key={it.slug}>
                <Link
                  href={`${PATH}/${it.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  dir="auto"
                >
                  <span className="flex items-center gap-2 font-bold text-slate-900 leading-snug group-hover:text-primary-700">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-primary-400 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                    {it.question}
                  </span>
                  <span className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">{it.teaser}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* FAQ (visible + JSON-LD FAQPage émis par le composant) */}
          <BlogFaq items={faqItems} t={tb} />
        </div>
      </div>
    </>
  );
}
