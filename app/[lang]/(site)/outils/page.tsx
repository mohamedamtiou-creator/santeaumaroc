import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Locale } from "@/lib/i18n";
import { TOOL_LIST } from "@/lib/health-tools";
import { getToolContent } from "@/lib/tools-content";
import { TOOLS_AR_REVIEWED } from "@/lib/tools-content-ar";
import { HubHero } from "@/components/health/HubHero";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { ToolIcon } from "@/components/outils/ToolIcon";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/outils";

/** L'arabe n'est ni annoncé ni indexé avant relecture humaine (verrou YMYL). */
const AR_READY = TOOLS_AR_REVIEWED !== null;

const abs = (locale: Locale, path: string) => `${locale === "ar" ? `${BASE}/ar` : BASE}${path}`;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).tools;
  const indexable = locale !== "ar" || AR_READY;

  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: AR_READY ? localizedAlternates(PATH, locale) : frenchOnlyAlternates(PATH),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDesc,
      url: PATH,
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
    twitter: { card: "summary", title: t.metaTitle, description: t.metaDesc },
  };
}

export default async function ToolsHubPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const dict = getDictionary(locale);
  const t = dict.tools;

  const tools = TOOL_LIST.map((def) => ({ def, content: getToolContent(def.slug, locale) }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${abs(locale, PATH)}#page`,
        "name": t.metaTitle,
        "description": t.metaDesc,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}#website` },
      },
      {
        "@type": "ItemList",
        "itemListElement": tools.map(({ def, content }, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": content.name,
          "url": abs(locale, `${PATH}/${def.slug}`),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.listTitle, "item": abs(locale, PATH) },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <HubHero
        eyebrow={t.eyebrow}
        title={t.listTitle}
        intro={t.intro}
        countChip={t.count.replace("{n}", String(tools.length))}
        chips={dict.healthHub}
      />

      <div className="page-outer">
        <div className="max-w-4xl mx-auto">
          <section aria-labelledby="howto-title" className="mb-8 rounded-2xl border border-secondary-200 bg-secondary-50/50 p-5 sm:p-6">
            <h2 id="howto-title" className="text-base font-bold text-slate-900 mb-2">{t.editorialTitle}</h2>
            <p className="text-sm text-slate-600 leading-relaxed" dir="auto">{t.editorialBody}</p>
          </section>

          <ul className="grid gap-4 sm:grid-cols-2">
            {tools.map(({ def, content }) => (
              <li key={def.slug}>
                <Link
                  href={`${PATH}/${def.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  dir="auto"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-3.5 transition-colors group-hover:bg-primary-100">
                    <ToolIcon slug={def.slug} className="w-6 h-6" />
                  </span>
                  <span className="font-bold text-slate-900 text-lg leading-snug group-hover:text-primary-700">
                    {content.name}
                  </span>
                  <span className="mt-1.5 text-sm text-slate-500 leading-relaxed">{content.teaser}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                    {t.openTool}
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100 transition-transform group-hover:translate-x-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 3 5 5-5 5" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Retour vers les hubs éditoriaux : les outils ne vivent pas isolés du catalogue. */}
          <nav aria-label={dict.healthHub.relatedTopics} className="mt-10 flex flex-wrap gap-2.5">
            {[
              { href: "/symptomes", label: dict.symptoms.title },
              { href: "/maladies", label: dict.diseases.title },
              { href: "/examens", label: dict.exams.title },
              { href: "/prevenir", label: dict.prevent.listTitle },
              { href: "/quel-medecin-pour", label: dict.intent.listTitle },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <BlogFaq items={t.faqItems.map((f) => ({ q: f.q, a: f.a }))} t={dict.blog} />

          <p className="mt-10 text-xs text-slate-400 leading-relaxed" dir="auto">{t.disclaimer}</p>
        </div>
      </div>
    </>
  );
}
