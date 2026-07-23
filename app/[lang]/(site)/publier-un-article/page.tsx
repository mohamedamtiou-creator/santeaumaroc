import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { publishContent } from "@/lib/publier-content";
import { PROFESSIONS, professionLabel } from "@/lib/contributor";

export const revalidate = 86400;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/publier-un-article";

/* ── Icônes (line SVG, design system) ─────────────────────────────────── */
const ICONS: Record<string, React.ReactNode> = {
  eye: <><circle cx="10" cy="10" r="2.5" /><path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10z" /></>,
  award: <><circle cx="10" cy="7" r="4.5" /><path d="M7 11l-1.5 6L10 15l4.5 2L13 11" /></>,
  "trending-up": <><path d="M2 14l4.5-4.5 3 3L17 5" /><path d="M13 5h4v4" /></>,
  users: <><circle cx="7.5" cy="7" r="3" /><path d="M2 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M14 5.2a3 3 0 0 1 0 5.6M18 17c0-2.2-1.3-4-3.2-4.6" /></>,
  building: <><rect x="4" y="2.5" width="12" height="15" rx="1.5" /><path d="M8 6h1M11 6h1M8 9h1M11 9h1M8 12h1M11 12h1M8.5 17.5v-3h3v3" /></>,
  star: <path d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 14.7l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L10 2.5z" />,
  "id-card": <><rect x="2" y="4" width="16" height="12" rx="2" /><circle cx="7" cy="9" r="2" /><path d="M4.5 14c0-1.5 1.1-2.5 2.5-2.5s2.5 1 2.5 2.5M12 8h4M12 11h4" /></>,
  "badge-check": <><path d="M10 2l2 1.6 2.5-.3 1 2.3 2.2 1.2-.6 2.5.6 2.5-2.2 1.2-1 2.3-2.5-.3L10 18l-2-1.6-2.5.3-1-2.3L2.3 13l.6-2.5L2.3 8l2.2-1.2 1-2.3L8 4.8 10 2z" /><path d="M7 10l2 2 4-4" /></>,
  check: <path d="M4 10l4 4 8-8" />,
  clock: <><circle cx="10" cy="10" r="7.5" /><path d="M10 5.5V10l3 2" /></>,
  sparkle: <path d="M10 2l1.6 5.4L17 9l-5.4 1.6L10 16l-1.6-5.4L3 9l5.4-1.6L10 2z" />,
};
function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {ICONS[name] ?? ICONS.check}
    </svg>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const c = publishContent(locale);
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: c.metaTitle, description: c.metaDesc, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDesc },
  };
}

async function getStats() {
  const [articles, authors, specialties, cities, viewsAgg] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { authorStatus: "VERIFIED" } }),
    prisma.specialty.count(),
    prisma.city.count(),
    prisma.post.aggregate({ where: { status: "PUBLISHED" }, _sum: { views: true } }),
  ]);
  return { articles, authors, specialties, cities, reads: viewsAgg._sum.views ?? 0 };
}

export default async function PublishLandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const c = publishContent(locale);
  const stats = await getStats();
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}${PATH}`;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA");
  const isAr = locale === "ar";

  const statItems = [
    { value: stats.reads, label: c.statLabels.readers },
    { value: stats.articles, label: c.statLabels.articles },
    { value: stats.authors, label: c.statLabels.authors },
    { value: stats.specialties, label: c.statLabels.specialties },
    { value: stats.cities, label: c.statLabels.cities },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#page`, name: c.metaTitle, description: c.metaDesc, inLanguage: isAr ? "ar-MA" : "fr-MA", url, publisher: { "@type": "Organization", name: "SantéauMaroc", url: BASE } },
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Accueil", item: BASE },
        { "@type": "ListItem", position: 2, name: c.breadcrumb, item: url },
      ] },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ══ HERO ══ */}
      <section className="hero-bg relative overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "26px 26px" }} aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Colonne texte */}
          <div>
            <p className="section-eyebrow text-secondary-300 mb-4">{c.hero.eyebrow}</p>
            <h1 id="hero-title" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5" dir="auto">
              {c.hero.titleLead} <span className="text-secondary-300">{c.hero.titleAccent}</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-7" dir="auto">{c.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/devenir-auteur" className="btn-primary bg-white text-primary-800 hover:bg-white/90 px-6 py-3.5 text-base font-semibold justify-center">
                {c.hero.ctaPrimary}
              </Link>
              <Link href="/auteur" className="btn-outline border-white/40 text-white hover:bg-white/10 px-6 py-3.5 text-base justify-center">
                {c.hero.ctaSecondary}
              </Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2" aria-label={isAr ? "مزايا" : "Avantages inclus"}>
              {c.hero.trust.map((t) => (
                <li key={t} className="flex items-center gap-1.5 text-sm text-white/75">
                  <Icon name="check" className="w-4 h-4 text-secondary-300" />
                  <span dir="auto">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne visuelle — aperçu « votre page auteur » */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="rounded-2xl bg-white shadow-2xl shadow-primary-950/40 p-5 rotate-1">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">Dr. •••••••</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-secondary-50 text-secondary-700"><Icon name="badge-check" className="w-3 h-3" />{isAr ? "موثَّق" : "Vérifié"}</span>
                  </div>
                  <div className="h-2 w-24 rounded bg-slate-100 mt-1.5" />
                </div>
              </div>
              <div className="py-4 space-y-2">
                <div className="h-3 w-3/4 rounded bg-slate-200" />
                <div className="h-2 w-full rounded bg-slate-100" />
                <div className="h-2 w-11/12 rounded bg-slate-100" />
                <div className="h-2 w-2/3 rounded bg-slate-100" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                {[["312k", isAr ? "مشاهدات" : "vues"], ["18", isAr ? "مقالات" : "articles"], ["4,9", isAr ? "تقييم" : "note"]].map(([n, l]) => (
                  <div key={l} className="text-center"><div className="text-base font-bold text-primary-700 tabular-nums">{n}</div><div className="text-[10px] text-slate-400">{l}</div></div>
                ))}
              </div>
            </div>
            {/* Badge promesse — effort en moins (relecture + SEO pris en charge) */}
            <div className="absolute -bottom-4 -start-4 rounded-xl bg-secondary-500 text-white shadow-xl px-4 py-3 flex items-center gap-2.5 -rotate-2">
              <Icon name="badge-check" className="w-5 h-5" />
              <div><div className="text-[10px] uppercase tracking-wide opacity-80">{c.hero.promiseLabel}</div><div className="font-bold text-base leading-none">{c.hero.promiseValue}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PREUVE SOCIALE (stats réelles) ══ */}
      <section className="border-b border-slate-100 bg-white" aria-labelledby="proof-title">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h2 id="proof-title" className="text-center text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6" dir="auto">{c.proofTitle}</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-6 gap-x-4">
            {statItems.map((s) => (
              <div key={s.label} className="text-center">
                <dd className="text-2xl sm:text-3xl font-bold text-primary-700 tabular-nums">{nf.format(s.value)}</dd>
                <dt className="text-xs sm:text-sm text-slate-500 mt-1" dir="auto">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main className="page-outer !pt-14 sm:!pt-16 pb-28 lg:pb-16">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">

          {/* ══ BÉNÉFICES ══ */}
          <section aria-labelledby="benefits-title">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 id="benefits-title" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2" dir="auto">{c.benefitsTitle}</h2>
              <p className="text-slate-600" dir="auto">{c.benefitsSubtitle}</p>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none m-0 p-0">
              {c.benefits.map((b) => (
                <li key={b.title} className="card p-5 hover:border-primary-200 hover:shadow-md transition-all">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-3"><Icon name={b.icon} /></span>
                  <h3 className="font-bold text-slate-900 mb-1" dir="auto">{b.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed" dir="auto">{b.desc}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* ══ 5 MIN / ON S'OCCUPE DU RESTE ══ */}
          <section aria-labelledby="steps-title">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 id="steps-title" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2" dir="auto">{c.stepsTitle}</h2>
              <p className="text-slate-600" dir="auto">{c.stepsSubtitle}</p>
            </div>
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Ce que vous faites */}
              <ol className="lg:col-span-3 space-y-3 list-none m-0 p-0">
                {c.steps.map((s, i) => (
                  <li key={i} className="card p-4 flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white font-bold tabular-nums" aria-hidden="true">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900" dir="auto">{s.title}</h3>
                        {s.time && <span className="shrink-0 inline-flex items-center text-xs font-semibold text-secondary-700 bg-secondary-50 px-2.5 py-0.5 rounded-full" dir="auto">{s.time}</span>}
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5" dir="auto">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {/* Ce dont on s'occupe */}
              <aside className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="sparkle" className="w-5 h-5 text-secondary-200" />
                  <h3 className="font-bold text-lg" dir="auto">{c.weHandleTitle}</h3>
                </div>
                <ul className="space-y-2.5 list-none m-0 p-0">
                  {c.weHandle.map((w) => (
                    <li key={w} className="flex items-start gap-2.5 text-sm text-white/90"><Icon name="check" className="w-4 h-4 mt-0.5 shrink-0 text-secondary-200" /><span dir="auto">{w}</span></li>
                  ))}
                </ul>
              </aside>
            </div>
          </section>

          {/* ══ APERÇU ÉDITEUR ══ */}
          <section aria-labelledby="editor-title" className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 id="editor-title" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2" dir="auto">{c.editorTitle}</h2>
              <p className="text-slate-600 mb-5" dir="auto">{c.editorSubtitle}</p>
              <ul className="space-y-2.5 list-none m-0 p-0">
                {c.editorFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5"><span className="flex h-5 w-5 mt-0.5 shrink-0 items-center justify-center rounded-full bg-secondary-50 text-secondary-600"><Icon name="check" className="w-3 h-3" /></span><span className="text-sm text-slate-700" dir="auto">{f}</span></li>
                ))}
              </ul>
            </div>
            {/* Mockup éditeur */}
            <div className="card p-0 overflow-hidden shadow-lg" aria-hidden="true">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 text-primary-700">FR</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded text-slate-400">العربية</span>
                <span className="w-px h-4 bg-slate-200 mx-1" />
                {["B", "H2", "H3", "🔗", "“”"].map((x) => <span key={x} className="text-xs text-slate-400 px-1.5">{x}</span>)}
              </div>
              <div className="p-4 space-y-2.5">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-2.5 w-full rounded bg-slate-100" />
                <div className="h-2.5 w-11/12 rounded bg-slate-100" />
                <div className="flex gap-2 pt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700">✓ 2 sources</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">SEO 92/100</span>
                </div>
              </div>
            </div>
          </section>

          {/* ══ QUI PEUT PUBLIER ══ */}
          <section aria-labelledby="who-title">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 id="who-title" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2" dir="auto">{c.whoTitle}</h2>
              <p className="text-slate-600" dir="auto">{c.whoIntro}</p>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 list-none m-0 p-0">
              {PROFESSIONS.map((p) => (
                <li key={p.kind} className="card px-4 py-3 flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary-500 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-800" dir="auto">{professionLabel(p.kind, locale)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ══ CONFIANCE ══ */}
          <section aria-labelledby="trust-title" className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-10 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-secondary-600 shadow-sm mb-4"><Icon name="badge-check" className="w-6 h-6" /></span>
            <h2 id="trust-title" className="text-xl sm:text-2xl font-bold text-slate-900 mb-2" dir="auto">{c.trustTitle}</h2>
            <p className="text-slate-700 leading-relaxed max-w-2xl mx-auto" dir="auto">{c.trustBody}</p>
            <div className="mt-5 flex flex-wrap gap-3 justify-center">
              <Link href="/methodologie" className="btn-outline px-5 py-2.5 text-sm">{c.methodologyCta}</Link>
              <Link href="/charte-editoriale" className="btn-outline px-5 py-2.5 text-sm">{c.charterCta}</Link>
            </div>
          </section>

          {/* ══ FAQ ══ */}
          <section aria-labelledby="faq-title">
            <h2 id="faq-title" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center" dir="auto">{c.faqTitle}</h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {c.faq.map((f, i) => (
                <details key={i} className="card p-0 group">
                  <summary className="flex justify-between items-center gap-4 cursor-pointer list-none font-semibold text-slate-900 px-5 py-4" dir="auto">
                    {f.q}
                    <span aria-hidden="true" className="text-primary-600 text-xl leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-slate-700 leading-relaxed px-5 pb-5 -mt-1" dir="auto">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ══ CTA FINAL ══ */}
          <section className="hero-bg rounded-3xl overflow-hidden text-center px-6 py-12 sm:py-16 relative" aria-labelledby="final-title">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} aria-hidden="true" />
            <div className="relative">
              <h2 id="final-title" className="text-2xl sm:text-3xl font-bold text-white mb-3" dir="auto">{c.finalTitle}</h2>
              <p className="text-white/80 leading-relaxed max-w-xl mx-auto mb-7" dir="auto">{c.finalBody}</p>
              <Link href="/devenir-auteur" className="btn-primary bg-white text-primary-800 hover:bg-white/90 px-7 py-3.5 text-base font-semibold">{c.finalCta}</Link>
            </div>
          </section>
        </div>
      </main>

      {/* ══ BARRE CTA STICKY (mobile) ══ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 safe-area-bottom">
        <Link href="/devenir-auteur" className="btn-primary w-full justify-center py-3 text-base font-semibold">{c.stickyCta}</Link>
      </div>
    </>
  );
}
