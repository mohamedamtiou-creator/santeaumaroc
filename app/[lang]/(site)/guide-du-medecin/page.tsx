import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).guideMedecin;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: localizedAlternates("/guide-du-medecin", locale),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: "/guide-du-medecin",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: t.metaTitle,
      description: t.metaDescription,
    },
  };
}

/* ── Métadonnées visuelles (icônes/couleurs) — le texte vient du dict (i18n) ──
   Chaque tableau est strictement aligné, par index, sur la clé correspondante
   du dictionnaire `guideMedecin`. */

// L'essentiel : gratuit · vérifié · données protégées · sans engagement
const ESSENTIEL_META = [
  { icon: "M20 12v9H4v-9 M2 7h20v5H2z M12 22V7 M12 7C9 7 6.5 7 6.5 5S8 2 9.5 2 12 4 12 7z M12 7c3 0 5.5 0 5.5-2S16 2 14.5 2 12 4 12 7z", bg: "bg-secondary-50 text-secondary-600" },
  { icon: "M12 2L4 5.5v6C4 16.24 7.5 20.5 12 22c4.5-1.5 8-5.76 8-10.5v-6L12 2z M9 12l2 2 4-4", bg: "bg-primary-50 text-primary-600" },
  { icon: "M6 10h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z M8 10V7a4 4 0 0 1 8 0v3 M12 15v2", bg: "bg-violet-50 text-violet-600" },
  { icon: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5", bg: "bg-accent-50 text-accent-600" },
];

// Étapes 01 → 04 (numéro + couleur alternée + capture réelle du produit).
// `img` = nom de base ; le suffixe de locale (-ar) est ajouté au rendu.
const STEP_META = [
  { n: "01", color: "bg-primary-600",   img: "step1-compte" },
  { n: "02", color: "bg-secondary-600", img: "step2-profil" },
  { n: "03", color: "bg-primary-600",   img: "step3-horaires" },
  { n: "04", color: "bg-secondary-600", img: "step4-tableau-de-bord" },
];

// À préparer : identifiant pro · photo · coordonnées · tarifs
const PREP_META = [
  { icon: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M7 8h4v4H7z M14 9h4 M14 13h4 M7 16h10", bg: "bg-primary-50 text-primary-600" },
  { icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", bg: "bg-secondary-50 text-secondary-600" },
  { icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", bg: "bg-terra-100 text-terra-600" },
  { icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01", bg: "bg-accent-50 text-accent-600" },
];

// Fonctionnalités : fiche vérifiée · agenda · SEO local · avis · Q/R · tableau de bord
const FEATURE_META = [
  { icon: "M9 12l2 2 4-4 M7.84 4.7a3.4 3.4 0 0 0 1.94-.8 3.4 3.4 0 0 1 4.44 0 3.4 3.4 0 0 0 1.94.8 3.4 3.4 0 0 1 3.14 3.14 3.4 3.4 0 0 0 .8 1.94 3.4 3.4 0 0 1 0 4.44 3.4 3.4 0 0 0-.8 1.94 3.4 3.4 0 0 1-3.14 3.14 3.4 3.4 0 0 0-1.94.8 3.4 3.4 0 0 1-4.44 0 3.4 3.4 0 0 0-1.94-.8 3.4 3.4 0 0 1-3.14-3.14 3.4 3.4 0 0 0-.8-1.94 3.4 3.4 0 0 1 0-4.44 3.4 3.4 0 0 0 .8-1.94A3.4 3.4 0 0 1 7.84 4.7z", bg: "bg-primary-50 text-primary-600" },
  { icon: "M8 2v4 M16 2v4 M3 9h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", bg: "bg-secondary-50 text-secondary-600" },
  { icon: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35", bg: "bg-accent-50 text-accent-600" },
  { icon: "M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z", bg: "bg-terra-100 text-terra-600" },
  { icon: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z", bg: "bg-violet-50 text-violet-600" },
  { icon: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z", bg: "bg-primary-50 text-primary-600" },
];

// Modes d'exercice : cabinet · clinique · hôpital public
const SECTOR_META = [
  { icon: "M3 9.5L12 3l9 6.5 M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9 M9 21v-7h6v7", bg: "bg-primary-50 text-primary-600" },
  { icon: "M3 21h18 M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16 M9 7h1 M14 7h1 M9 11h1 M14 11h1 M9 15h6", bg: "bg-secondary-50 text-secondary-600" },
  { icon: "M3 21h18 M6 21V7l6-4 6 4v14 M12 8v6 M9 11h6", bg: "bg-accent-50 text-accent-600" },
];

// Confiance : vérifiés · données (09-08) · pas de diagnostic · contrôle
const TRUST_META = [
  { icon: "M12 2L4 5.5v6C4 16.24 7.5 20.5 12 22c4.5-1.5 8-5.76 8-10.5v-6L12 2z M9 12l2 2 4-4", bg: "bg-primary-50 text-primary-600" },
  { icon: "M6 10h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z M8 10V7a4 4 0 0 1 8 0v3", bg: "bg-secondary-50 text-secondary-600" },
  { icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01", bg: "bg-violet-50 text-violet-600" },
  { icon: "M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6", bg: "bg-accent-50 text-accent-600" },
];

/* ── Icône réutilisable ──────────────────────────────────────── */
function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"
      className="w-3.5 h-3.5 shrink-0 mt-0.5 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3.5 3.5 6.5-7" />
    </svg>
  );
}

// Capture du produit encadrée façon fenêtre applicative (barre à 3 points).
function ProductShot({
  src, alt, sizes = "(max-width: 640px) 100vw, 50vw",
}: { src: string; alt: string; sizes?: string }) {
  return (
    <div className="bg-slate-100 border-b border-slate-200">
      <div className="flex items-center gap-1.5 px-3 py-2" aria-hidden="true">
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="w-2 h-2 rounded-full bg-slate-300" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={750}
        sizes={sizes}
        className="w-full h-auto block"
      />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

export default async function GuideDuMedecinPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).guideMedecin;
  const imgSuffix = locale === "ar" ? "-ar" : "";

  // JSON-LD localisé (HowTo + FAQPage + BreadcrumbList) — exploitable par Google
  // et les moteurs de réponse IA (ChatGPT, Gemini, Perplexity…).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        "@id": `${BASE}/guide-du-medecin#howto`,
        "name": t.stepsTitle,
        "description": t.metaDescription,
        "totalTime": "PT10M",
        "step": t.steps.map((s, i) => ({
          "@type": "HowToStep",
          "position": i + 1,
          "name": s.title,
          "text": s.desc,
          "url": `${BASE}/guide-du-medecin#etape-${i + 1}`,
        })),
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "MAD",
          "description": t.essentiel[0].title,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE}/guide-du-medecin#faq`,
        "mainEntity": t.faqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${BASE}/guide-du-medecin` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ── Héro ─────────────────────────────────────────── */}
      <div className="hero-bg relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          aria-hidden="true"
        />
        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="section-eyebrow text-secondary-300 mb-4">{t.eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5 tracking-tight">
            {t.heroTitleA}<br className="hidden sm:block" />
            <span className="text-secondary-300"> {t.heroTitleB}</span>
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-2xl mx-auto mb-7">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Link href="/inscription-praticien" className="btn-secondary px-6 py-3 text-sm">
              {t.heroCtaPrimary}
            </Link>
            <Link href="/connexion" className="btn-ghost-white px-6 py-3 text-sm">
              {t.heroCtaSecondary}
            </Link>
          </div>
          <p className="inline-flex items-center gap-2 text-white/70 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 text-secondary-300" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4 M12 2L4 5.5v6C4 16.24 7.5 20.5 12 22c4.5-1.5 8-5.76 8-10.5v-6L12 2z" />
            </svg>
            {t.heroTrust}
          </p>
        </div>
      </div>

      {/* ── L'essentiel ──────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100" aria-labelledby="essentiel-title">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12">
          <h2 id="essentiel-title" className="sr-only">{t.essentielTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ESSENTIEL_META.map((m, i) => (
              <div key={i} className="card-flat p-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center shrink-0`}>
                  <Icon d={m.icon} className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{t.essentiel[i].title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{t.essentiel[i].desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-outer">

        {/* ── Parcours en 4 étapes ─────────────────────── */}
        <section className="mb-14" aria-labelledby="steps-title">
          <div className="text-center mb-4">
            <p className="section-eyebrow mb-2">{t.stepsEyebrow}</p>
            <h2 id="steps-title" className="section-title mb-3">{t.stepsTitle}</h2>
            <p className="section-subtitle max-w-2xl mx-auto">{t.stepsSubtitle}</p>
          </div>
          <div className="flex justify-center mb-10">
            <span className="badge-accent inline-flex items-center gap-2 text-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
              </svg>
              {t.totalTimeNote}
            </span>
          </div>
          <ol className="grid sm:grid-cols-2 gap-6 items-start">
            {STEP_META.map((s, i) =>
              i === STEP_META.length - 1 ? (
                /* ── Étape 4 : carte pleine largeur — tableau de bord + agenda côte à côte ── */
                <li key={s.n} id={`etape-${i + 1}`} className="card p-0 overflow-hidden sm:col-span-2 scroll-mt-24">
                  <div className="grid grid-cols-2 gap-px bg-slate-200">
                    <ProductShot src={`/guide-medecin/${s.img}${imgSuffix}.webp`} alt={t.steps[i].imgAlt} sizes="(max-width: 1023px) 50vw, 500px" />
                    <ProductShot src={`/guide-medecin/step4-agenda${imgSuffix}.webp`} alt={t.agendaImgAlt} sizes="(max-width: 1023px) 50vw, 500px" />
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-white font-black text-base tabular-nums">{s.n}</span>
                      </div>
                      <span className="badge-primary text-xs tabular-nums">{t.steps[i].duration}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{t.steps[i].title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-2xl">{t.steps[i].desc}</p>
                    <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                      {t.steps[i].items.map((it, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckMark />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={s.n} id={`etape-${i + 1}`} className="card p-0 overflow-hidden flex flex-col scroll-mt-24">
                  <ProductShot src={`/guide-medecin/${s.img}${imgSuffix}.webp`} alt={t.steps[i].imgAlt} />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shrink-0 shadow-sm`}>
                        <span className="text-white font-black text-base tabular-nums">{s.n}</span>
                      </div>
                      <span className="badge-primary text-xs tabular-nums">{t.steps[i].duration}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">{t.steps[i].title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{t.steps[i].desc}</p>
                    <ul className="space-y-2 mt-auto">
                      {t.steps[i].items.map((it, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckMark />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            )}
          </ol>
        </section>

        {/* ── Séparateur ───────────────────────────────── */}
        <div className="h-px mb-14" style={{ background: "linear-gradient(90deg, #bfdbfe, #a7f3d0, transparent)" }} />

        {/* ── À préparer ───────────────────────────────── */}
        <section className="mb-14" aria-labelledby="prep-title">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">{t.prepEyebrow}</p>
            <h2 id="prep-title" className="section-title mb-3">{t.prepTitle}</h2>
            <p className="section-subtitle max-w-xl mx-auto">{t.prepSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PREP_META.map((m, i) => (
              <div key={i} className="card p-5">
                <div className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center mb-4`}>
                  <Icon d={m.icon} className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">{t.prep[i].title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.prep[i].desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Séparateur ───────────────────────────────── */}
        <div className="h-px mb-14" style={{ background: "linear-gradient(90deg, #bfdbfe, #a7f3d0, transparent)" }} />

        {/* ── Fonctionnalités ──────────────────────────── */}
        <section className="mb-14" aria-labelledby="features-title">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">{t.featuresEyebrow}</p>
            <h2 id="features-title" className="section-title mb-3">{t.featuresTitle}</h2>
            <p className="section-subtitle max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURE_META.map((m, i) => (
              <div key={i} className="card p-5">
                <div className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center mb-4`}>
                  <Icon d={m.icon} className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">{t.features[i].title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.features[i].desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Modes d'exercice (fond alterné) ──────────────── */}
      <section className="bg-section-alt py-14" aria-labelledby="sectors-title">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">{t.sectorsEyebrow}</p>
            <h2 id="sectors-title" className="section-title mb-3">{t.sectorsTitle}</h2>
            <p className="section-subtitle max-w-2xl mx-auto">{t.sectorsP1}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {SECTOR_META.map((m, i) => (
              <div key={i} className="card p-6">
                <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center mb-4`}>
                  <Icon d={m.icon} className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">{t.sectors[i].title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.sectors[i].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-outer">

        {/* ── Confiance & conformité ───────────────────── */}
        <section className="mb-14" aria-labelledby="trust-title">
          <div className="text-center mb-10">
            <p className="section-eyebrow mb-2">{t.trustEyebrow}</p>
            <h2 id="trust-title" className="section-title mb-3">{t.trustTitle}</h2>
            <p className="section-subtitle max-w-2xl mx-auto">{t.trustSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_META.map((m, i) => (
              <div key={i} className="card p-5">
                <div className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center mb-4`}>
                  <Icon d={m.icon} className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-2">{t.trust[i].title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.trust[i].desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Séparateur ───────────────────────────────── */}
        <div className="h-px mb-14" style={{ background: "linear-gradient(90deg, #bfdbfe, #a7f3d0, transparent)" }} />

        {/* ── FAQ ──────────────────────────────────────── */}
        <section className="mb-14" aria-labelledby="faq-title">
          <div className="text-center mb-8">
            <p className="section-eyebrow mb-2">{t.faqEyebrow}</p>
            <h2 id="faq-title" className="section-title">{t.faqTitle}</h2>
          </div>
          <div className="card p-6 sm:p-8 max-w-3xl mx-auto">
            <FaqAccordion faqs={t.faqs} />
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
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.ctaTitle}</h2>
              <p className="text-white/75 text-sm mb-7 max-w-md mx-auto leading-relaxed">{t.ctaSubtitle}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/inscription-praticien" className="btn-secondary px-8 py-3 text-sm">
                  {t.ctaPrimary}
                </Link>
                <Link href="/tarifs" className="btn-ghost-white px-8 py-3 text-sm">
                  {t.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
