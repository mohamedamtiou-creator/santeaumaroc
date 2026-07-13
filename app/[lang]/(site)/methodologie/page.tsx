import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";
import { methodologyContent, METHODOLOGY_REVIEWED } from "@/lib/methodology-content";

export const revalidate = 86400;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/methodologie";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const c = methodologyContent(locale);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: c.metaTitle, description: c.metaDesc, url: PATH, type: "article", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: c.metaTitle, description: c.metaDesc },
  };
}

export default async function MethodologiePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const c = methodologyContent(locale);
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}`;
  const reviewedFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(METHODOLOGY_REVIEWED));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": c.metaTitle,
        "description": c.metaDesc,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "url": url,
        "lastReviewed": METHODOLOGY_REVIEWED,
        "publisher": { "@type": "Organization", "name": "SantéauMaroc", "url": BASE },
        "citation": c.sources.map((s) => ({ "@type": "Organization", "name": s.name, "url": s.url })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": c.breadcrumb, "item": url },
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
          <p className="section-eyebrow text-secondary-300 mb-4">{c.breadcrumb}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 tracking-tight" dir="auto">{c.title}</h1>
          <p className="text-white/75 text-lg leading-relaxed" dir="auto">{c.intro}</p>
          <p className="text-white/50 text-sm mt-5">{c.updatedLabel} {reviewedFmt}</p>
        </div>
      </div>

      <main className="page-outer">
        <div className="max-w-2xl mx-auto">
          {/* Sections narratives */}
          {c.sections.map((s) => (
            <section key={s.id} id={s.id} className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 mb-3" dir="auto">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-slate-700 leading-relaxed mb-3" dir="auto">{p}</p>
              ))}
            </section>
          ))}

          {/* Hiérarchie des niveaux de preuve */}
          <section id="niveaux-de-preuve" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-3" dir="auto">{c.evidenceTitle}</h2>
            <p className="text-slate-700 leading-relaxed mb-5" dir="auto">{c.evidenceIntro}</p>
            <ol className="space-y-3 list-none m-0 p-0">
              {c.evidenceLevels.map((lvl) => (
                <li key={lvl.tier} className="flex gap-4 card p-4">
                  <span aria-hidden="true" className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white font-bold tabular-nums">{lvl.tier}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900" dir="auto">{lvl.label}</p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-0.5" dir="auto">{lvl.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Sources de référence */}
          <section id="sources" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-3" dir="auto">{c.sourcesTitle}</h2>
            <p className="text-slate-700 leading-relaxed mb-5" dir="auto">{c.sourcesIntro}</p>
            <ul className="grid sm:grid-cols-2 gap-4">
              {c.sources.map((s) => (
                <li key={s.url} className="card p-4">
                  <a href={s.url} target="_blank" rel="noopener" className="font-semibold text-primary-700 hover:text-primary-800 break-words" dir="auto">{s.name}</a>
                  <p className="text-sm text-slate-500 mt-1" dir="auto">{s.scope}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Signaler une erreur */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-7">
            <h2 className="text-lg font-bold text-slate-900 mb-2" dir="auto">{c.errorTitle}</h2>
            <p className="text-slate-700 leading-relaxed mb-4" dir="auto">{c.errorBody}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary px-5 py-2.5 text-sm">{c.contactCta}</Link>
              <Link href="/charte-editoriale" className="btn-outline px-5 py-2.5 text-sm">{c.charterCta}</Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
