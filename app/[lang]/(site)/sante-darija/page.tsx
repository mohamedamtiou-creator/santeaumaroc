import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";
import { DARIJA_CATEGORIES, DARIJA_TERM_COUNT, DARIJA_FAQ } from "@/lib/darija-content";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/sante-darija";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "الصحة بالدارجة — قاموس المصطلحات الطبية",
    description:
      "قاموس صحي بالدارجة المغربية: شنو كيعني كل مرض وكل طبيب مختص، مع الترجمة بالفرنسية والعربية والتوجيه نحو الطبيب المناسب. Glossaire santé en darija marocaine.",
    alternates: localizedAlternates(PATH, locale),
    openGraph: {
      title: "الصحة بالدارجة — قاموس المصطلحات الطبية | SantéauMaroc",
      description: "شنو كيعني كل مرض وكل طبيب مختص بالدارجة، مع التوجيه نحو الطبيب المناسب.",
      url: PATH,
      type: "website",
      locale: "ar_MA",
    },
    twitter: {
      card: "summary",
      title: "الصحة بالدارجة — قاموس المصطلحات الطبية",
      description: "قاموس صحي بالدارجة المغربية مع التوجيه نحو الطبيب المناسب.",
    },
  };
}

export default async function SanteDarijaPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang) === "ar" ? "ar" : "fr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTermSet",
        "@id": `${BASE}${PATH}#glossaire`,
        "name": "قاموس الصحة بالدارجة المغربية",
        "url": `${BASE}${PATH}`,
        "inLanguage": "ar-MA",
        "hasDefinedTerm": DARIJA_CATEGORIES.flatMap((cat) =>
          cat.terms.map((term) => ({
            "@type": "DefinedTerm",
            "name": term.darija,
            "description": `${term.explication} (${term.fr})`,
            "inDefinedTermSet": `${BASE}${PATH}#glossaire`,
            "url": `${BASE}${term.href}`,
          })),
        ),
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE}${PATH}#faq`,
        "inLanguage": "ar-MA",
        "mainEntity": DARIJA_FAQ.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "الصحة بالدارجة", "item": `${BASE}${PATH}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="hero-bg relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20" dir="rtl" lang="ar">
          <p className="section-eyebrow text-secondary-300 mb-4">القاموس الصحي</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 tracking-tight">
            الصحة بالدارجة
          </h1>
          <p className="text-white/75 text-lg leading-relaxed">
            بزّاف ديال المغاربة كيقلّبو على الصحة بالدارجة. هنا كنشرحو لك المصطلحات الطبية بلغة اللي كتهضر بيها كل يوم،
            مع الترجمة بالفرنسية والعربية، وكنوجّهوك للطبيب المناسب.
          </p>
        </div>
      </div>

      <main className="page-outer">
        <div className="max-w-3xl mx-auto" dir="rtl" lang="ar">
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            {DARIJA_TERM_COUNT} مصطلح صحي بالدارجة. هاد المحتوى تعريفي فقط وما كيعوّضش استشارة طبيب.
          </p>

          {DARIJA_CATEGORIES.map((cat) => (
            <section key={cat.slug} id={cat.slug} className="mb-10 scroll-mt-24">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{cat.titre}</h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {cat.terms.map((term, i) => (
                  <li key={i} className="card p-4 flex flex-col">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span className="text-lg font-bold text-slate-900">{term.darija}</span>
                      <span className="text-xs font-semibold text-primary-600" dir="ltr">{term.fr}</span>
                    </div>
                    {term.variantes && term.variantes.length > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {term.variantes.join(" · ")}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 leading-relaxed mt-2 flex-1">{term.explication}</p>
                    <Link
                      href={term.href}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                        className="w-4 h-4 shrink-0 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 3 5 5-5 5" />
                      </svg>
                      لقا طبيب
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* ── FAQ darija ──────────────────────────────── */}
          <section id="faq" className="mb-10 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-900 mb-4">أسئلة مكرّرة</h2>
            <div className="space-y-3">
              {DARIJA_FAQ.map((f, i) => (
                <details key={i} className="card p-4 group">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-semibold text-slate-900">
                    <span>{f.q}</span>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                      className="w-4 h-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 6 4 4 4-4" />
                    </svg>
                  </summary>
                  <p className="text-sm text-slate-600 leading-relaxed mt-3">{f.a}</p>
                  {f.href && (
                    <Link href={f.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                        className="w-4 h-4 shrink-0 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 3 5 5-5 5" />
                      </svg>
                      {f.hrefLabel ?? "المزيد"}
                    </Link>
                  )}
                </details>
              ))}
            </div>
          </section>

          {/* ── CTA ─────────────────────────────────────── */}
          <section>
            <div
              className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 58%, #047857 100%)" }}
            >
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">باغي تلقا طبيب قريب منك؟</h2>
                <p className="text-white/75 text-sm mb-7 max-w-md mx-auto leading-relaxed">
                  قارن الأطباء فمدينتك وخذ موعد عبر الإنترنت، بلاش.
                </p>
                <Link href="/praticiens" className="btn-ghost-white px-8 py-3">استكشف الأطباء</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
