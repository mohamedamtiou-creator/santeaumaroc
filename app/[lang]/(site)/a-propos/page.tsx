import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${BASE}/a-propos#page`,
      "name": "À propos de SantéauMaroc",
      "url": `${BASE}/a-propos`,
      "description": "La mission et les valeurs de SantéauMaroc, plateforme de santé digitale de référence au Maroc.",
      "about": {
        "@type": "Organization",
        "@id": `${BASE}/#organization`,
        "name": "SantéauMaroc",
        "url": BASE,
        "logo": `${BASE}/logo.svg`,
        "description": "Annuaire médical marocain. Trouvez des médecins, spécialistes et établissements de santé partout au Maroc.",
        "foundingDate": "2024",
        "areaServed": { "@type": "Country", "name": "Maroc", "sameAs": "https://www.wikidata.org/wiki/Q1028" },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "contact@santeaumaroc.com",
          "availableLanguage": ["French", "Arabic"],
        },
        "sameAs": [BASE],
      },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
        { "@type": "ListItem", "position": 2, "name": "À propos", "item": `${BASE}/a-propos` },
      ],
    },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "À propos — La plateforme de santé de référence au Maroc",
    description:
      "Découvrez la mission et les valeurs de SantéauMaroc, la plateforme de santé digitale de référence au Maroc. Notre mission : rendre la santé accessible à tous.",
    alternates: localizedAlternates("/a-propos", locale),
    openGraph: {
      title: "À propos — SantéauMaroc",
      description: "La mission et les valeurs de SantéauMaroc, plateforme de santé digitale au Maroc.",
      url: "/a-propos",
      type: "website",
    },
    twitter: { card: "summary", title: "À propos — SantéauMaroc", description: "La plateforme de santé digitale de référence au Maroc." },
  };
}

/* ── Données ─────────────────────────────────────────────────── */

// Métadonnées visuelles uniquement — les libellés viennent du dictionnaire (i18n).
const STAT_META = [
  { value: "20 000+", color: "text-primary-600" },
  { value: "50+",     color: "text-secondary-600" },
  { value: "100 %",   color: "text-accent-600" },
  { value: "24h/24",  color: "text-primary-600" },
];

const VALUE_META = [
  { icon: "M12 2L4 5.5v6C4 16.24 7.5 20.5 12 22c4.5-1.5 8-5.76 8-10.5v-6L12 2z M9 12l2 2 4-4", bg: "bg-primary-50",   color: "text-primary-600"   },
  { icon: "M22 12h-4l-3 9L9 3l-3 9H2",                                                          bg: "bg-secondary-50", color: "text-secondary-600" },
  { icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", bg: "bg-violet-50", color: "text-violet-600" },
  { icon: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18", bg: "bg-accent-50", color: "text-accent-600" },
];

const STEP_META = [
  { n: "01", color: "bg-primary-600"   },
  { n: "02", color: "bg-secondary-600" },
  { n: "03", color: "bg-primary-600"   },
  { n: "04", color: "bg-secondary-600" },
];

const MISSION_CARD_META = [
  { icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2", bg: "bg-primary-50 text-primary-600" },
  { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z", bg: "bg-secondary-50 text-secondary-600" },
  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0", bg: "bg-violet-50 text-violet-600" },
  { icon: "M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z", bg: "bg-accent-50 text-accent-600" },
];

/* ── Page ────────────────────────────────────────────────────── */

export default async function AProposPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = getDictionary(toLocale((await params).lang)).about;
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
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="section-eyebrow text-secondary-300 mb-4">{t.eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 tracking-tight">
            {t.heroTitle}<br className="hidden sm:block" />
            <span className="text-secondary-300"> {t.heroAccent}</span>
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/praticiens" className="btn-secondary px-6 py-3 text-sm">
              {t.ctaFind}
            </Link>
            <Link href="/inscription" className="btn-ghost-white px-6 py-3 text-sm">
              {t.ctaCreate}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STAT_META.map((s, i) => (
              <div key={i}>
                <p dir="ltr" className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${s.color}`}>{s.value}</p>
                <p className="text-sm text-slate-500 mt-1 leading-snug">{t.statsLabels[i]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="page-outer">

        {/* ── Mission ──────────────────────────────────── */}
        <section className="mb-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="section-eyebrow mb-2">{t.missionEyebrow}</p>
              <h2 className="section-title mb-4">{t.missionTitle}</h2>
              <p className="text-slate-600 leading-relaxed mb-4">{t.missionP1}</p>
              <p className="text-slate-600 leading-relaxed">{t.missionP2}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {MISSION_CARD_META.map((item, i) => (
                <div key={i} className="card p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                      className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-snug">{t.missionCards[i]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Séparateur ───────────────────────────────── */}
        <div className="h-px mb-14" style={{ background: "linear-gradient(90deg, #bfdbfe, #a7f3d0, transparent)" }} />

        {/* ── Valeurs ──────────────────────────────────── */}
        <section className="mb-14">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">{t.valuesEyebrow}</p>
            <h2 className="section-title mb-3">{t.valuesTitle}</h2>
            <p className="section-subtitle max-w-xl mx-auto">{t.valuesSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUE_META.map((v, i) => (
              <div key={i} className="card p-5">
                <div className={`w-11 h-11 rounded-xl ${v.bg} flex items-center justify-center mb-4`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                    className={`w-5 h-5 ${v.color}`} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d={v.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">{t.values[i].title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.values[i].desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Séparateur ───────────────────────────────── */}
        <div className="h-px mb-14" style={{ background: "linear-gradient(90deg, #bfdbfe, #a7f3d0, transparent)" }} />

        {/* ── Comment ça marche ────────────────────────── */}
        <section className="mb-14">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">{t.howEyebrow}</p>
            <h2 className="section-title mb-3">{t.howTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEP_META.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEP_META.length - 1 && (
                  <div className="hidden lg:block absolute top-6 start-[calc(100%-8px)] w-full h-px border-t-2 border-dashed border-slate-200 z-0 rtl:-scale-x-100" />
                )}
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <span className="text-white font-black text-base tabular-nums">{s.n}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{t.steps[i].title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.steps[i].desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Séparateur ───────────────────────────────── */}
        <div className="h-px mb-14" style={{ background: "linear-gradient(90deg, #bfdbfe, #a7f3d0, transparent)" }} />

        {/* ── Patients / Praticiens ────────────────────── */}
        <section className="mb-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="card p-7 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100">
              <div className="w-12 h-12 rounded-2xl bg-white shadow flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-6 h-6 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 5-4 9-7 10C8 18 4 14 4 9a7 7 0 0 1 8-7z" />
                  <path d="M12 8v4l2 2" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{t.patientsTitle}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{t.patientsDesc}</p>
              <Link href="/inscription" className="btn-secondary text-sm px-5 py-2.5">
                {t.patientsCta}
              </Link>
            </div>
            <div className="card p-7">
              <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-6 h-6 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{t.praticiensTitle}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{t.praticiensDesc}</p>
              <Link href="/inscription-praticien" className="btn-primary text-sm px-5 py-2.5">
                {t.praticiensCta}
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA final ────────────────────────────────── */}
        <section>
          <div
            className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 58%, #047857 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.questionTitle}</h2>
              <p className="text-white/75 text-sm mb-7 max-w-md mx-auto leading-relaxed">{t.questionDesc}</p>
              <Link href="/contact" className="btn-ghost-white px-8 py-3">
                {t.contactBtn}
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
