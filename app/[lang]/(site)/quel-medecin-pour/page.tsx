import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Locale } from "@/lib/i18n";
import { isTopicArReady, isTopicReviewed, composeIntentQuestion } from "@/lib/health-topic";
import { tSpecialty } from "@/lib/specialty-i18n";
import { HubHero } from "@/components/health/HubHero";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/quel-medecin-pour";

const getIntents = () =>
  prisma.healthTopic.findMany({
    where: { intentSlug: { not: null }, status: "PUBLISHED" },
    orderBy: { term: "asc" },
    select: {
      intentSlug: true, term: true, termAr: true,
      reviewedAt: true, arReviewedAt: true, shortAnswerAr: true,
      specialty: { select: { name: true } },
    },
  });

// Libellé localisé du terme (sans tirer tous les champs du topic).
function localizedTerm(tp: { term: string; termAr: string | null; arReviewedAt: Date | null; shortAnswerAr: string | null }, locale: Locale): string {
  const ar = locale === "ar" && isTopicArReady(tp);
  return ar && tp.termAr ? tp.termAr : tp.term;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).intent;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: t.metaTitle, description: t.metaDesc, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: t.metaTitle, description: t.metaDesc },
  };
}

export default async function IntentIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const dict = getDictionary(locale);
  const t = dict.intent;
  const topics = await getIntents();

  // Regroupe par spécialité (nom localisé), trié alphabétiquement ; termes triés
  // dans chaque groupe. Chaque lien porte la question composée (riche en mots-clés).
  const groups = new Map<string, { intentSlug: string; question: string; reviewed: boolean }[]>();
  for (const tp of topics) {
    if (!tp.intentSlug) continue;
    const specName = tp.specialty ? tSpecialty(tp.specialty.name, locale) : (locale === "ar" ? "أخرى" : "Autres");
    const term = localizedTerm(tp, locale);
    const entry = { intentSlug: tp.intentSlug, question: composeIntentQuestion(term, locale), reviewed: isTopicReviewed(tp) };
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
        "itemListElement": reviewedFlat.flatMap((tp, i) =>
          tp.intentSlug ? [{
            "@type": "ListItem",
            "position": i + 1,
            "name": composeIntentQuestion(localizedTerm(tp, locale), locale),
            "url": `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}/${tp.intentSlug}`,
          }] : [],
        ),
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
          {sortedGroups.map(([specName, entries]) => (
            <section key={specName} className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-3" dir="auto">{specName}</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {entries.sort((a, b) => a.question.localeCompare(b.question, locale === "ar" ? "ar" : "fr")).map((e) => (
                  <li key={e.intentSlug}>
                    <Link
                      href={`${PATH}/${e.intentSlug}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/40 transition-colors"
                      dir="auto"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-primary-400 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                      <span>{e.question}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
