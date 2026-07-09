import { Suspense } from "react";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { processCache } from "@/lib/process-cache";
import { MAJOR_CITIES, slugify } from "@/lib/utils";
import { getDictionary, toLocale, type Dictionary } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/hreflang";
import { CityIcon } from "@/components/CityIcon";

// Canonical + hreflang de l'accueil (auparavant canonical statique "/"). Défini
// ici et non au layout : un canonical global fuiterait vers toute page sans
// canonical propre. Locale-aware : /ar déclare sa propre canonical + alternates.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return { alternates: localizedAlternates("/", locale) };
}
import { SpecialtyIcon } from "@/components/SpecialtyIcon";
import { HeroSearchForm } from "@/components/ui/HeroSearchForm";
import { PostCard, type PostCardData } from "@/components/blog/PostCard";

/* ── Data fetching (cached 1h — home stats change slowly) ── */

const getStats = unstable_cache(
  () => processCache("home:stats", 3600, async () => {
    try {
      const [doctors, establishments, specialties, cities] = await Promise.all([
        prisma.doctor.count({ where: { isActive: true } }),
        prisma.establishment.count({ where: { isActive: true } }),
        prisma.specialty.count(),
        prisma.city.count(),
      ]);
      return { doctors, establishments, specialties, cities };
    } catch {
      return { doctors: 0, establishments: 0, specialties: 0, cities: 0 };
    }
  }),
  ["home-stats"],
  { revalidate: 3600, tags: ["home-stats"] }
);

const getTopSpecialties = unstable_cache(
  () => processCache("home:specialties", 3600, async () => {
    try {
      return await prisma.specialty.findMany({
        take: 12,
        include: { _count: { select: { doctors: true } } },
        orderBy: { doctors: { _count: "desc" } },
      });
    } catch {
      return [];
    }
  }),
  ["home-top-specialties"],
  { revalidate: 3600, tags: ["home-specialties"] }
);

// 3 derniers articles publiés — module « Conseils santé » de la home (maillage
// page la plus puissante → blog). Revalidé 1h, repli silencieux si DB absente.
const getLatestPosts = unstable_cache(
  () => processCache("home:latest-posts", 3600, async () => {
    try {
      return await prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          title: true, slug: true, excerpt: true, coverImage: true, coverAlt: true,
          readingTime: true, publishedAt: true,
          category: { select: { name: true, slug: true, color: true } },
          author:   { select: { name: true, avatar: true } },
        },
      });
    } catch {
      return [];
    }
  }),
  ["home-latest-posts"],
  { revalidate: 3600, tags: ["posts"] }
);

/* ── Icônes SVG ─────────────────────────────────────────── */

function IconDoctor() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-6 h-6" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      <path d="M12 16v3m-1.5-1.5h3" strokeLinecap="round" />
    </svg>
  );
}

function IconEstablishment() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-6 h-6" aria-hidden="true">
      <rect x="3" y="6" width="18" height="15" rx="1" />
      <path d="M3 10h18M9 10v11M15 10v11" />
      <path d="M9 2h6v4H9z" />
      <path d="M12 4v2" strokeLinecap="round" />
    </svg>
  );
}

function IconSpecialty() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-6 h-6" aria-hidden="true">
      <path d="M12 21C7 16 3 12.4 3 9a6 6 0 0 1 12 0 6 6 0 0 1 6-6c1 0 2 .3 3 1" strokeLinecap="round" />
      <path d="M19 9v6m-3-3h6" strokeLinecap="round" />
    </svg>
  );
}

function IconCity() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-6 h-6" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5 text-slate-500 shrink-0" aria-hidden="true">
      <path d="M10 2C7.24 2 5 4.24 5 7c0 3.94 5 11 5 11s5-7.06 5-11c0-2.76-2.24-5-5-5z"/>
      <circle cx="10" cy="7" r="2"/>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
    </svg>
  );
}

function IconPharmacy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-7 h-7" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

function IconMedication() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-7 h-7" aria-hidden="true">
      <path d="M10.5 2h3c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-3c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" />
      <path d="M12 8v14M8 12l8 0" strokeLinecap="round" />
      <ellipse cx="12" cy="18" rx="5" ry="3" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
      <path fillRule="evenodd" d="M10 1.5L3 4v5.5C3 13.1 6.1 16.2 10 17.5c3.9-1.3 7-4.4 7-8V4l-7-2.5zm3.3 6.8-4 4-2-2L8.7 11l1.6 1.6 2.6-2.6 1.4 1.2z" />
    </svg>
  );
}

/* ── JSON-LD ────────────────────────────────────────────── */

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

const getCoveredCities = unstable_cache(
  () => processCache("home:covered-cities", 3600, async () => {
    try {
      return await prisma.city.findMany({
        where: { doctors: { some: { isActive: true } } },
        select: { name: true, region: true },
        orderBy: { doctors: { _count: "desc" } },
      });
    } catch {
      return [];
    }
  }),
  ["home-covered-cities"],
  { revalidate: 3600, tags: ["home-stats"] }
);

/* ── JSON-LD (streams separately — getCoveredCities is an expensive aggregation) */

async function SiteJsonLd() {
  const cities = await getCoveredCities();
  const areaServed =
    cities.length > 0
      ? cities.map((c) => ({
          "@type": "City",
          "name": c.name,
          "addressCountry": "MA",
          ...(c.region && { "containedInPlace": { "@type": "AdministrativeArea", "name": c.region } }),
        }))
      : [{ "@type": "Country", "name": "Maroc", "alternateName": "MA" }];

  // Profils officiels de la marque → sameAs (consolidation d'entité / knowledge
  // panel). Renseignés par variables d'env : rien de factice ne part tant que les
  // vrais comptes n'existent pas (étape du playbook d'autorité off-page).
  const sameAs = [
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    process.env.NEXT_PUBLIC_X_URL,
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
    process.env.NEXT_PUBLIC_WIKIDATA_URL,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE}/#organization`,
        "name": "SantéauMaroc",
        "alternateName": "Santé au Maroc",
        "url": BASE,
        "logo": { "@type": "ImageObject", "url": `${BASE}/logo.svg`, "contentUrl": `${BASE}/logo.svg` },
        "description": "Annuaire médical marocain. Trouvez des médecins, spécialistes et établissements de santé partout au Maroc.",
        "foundingDate": "2024",
        // Politiques éditoriales déclarées → E-E-A-T / GEO : la charte est la source
        // machine-lisible de nos principes, corrections et retours.
        "publishingPrinciples": `${BASE}/charte-editoriale`,
        "correctionsPolicy": `${BASE}/charte-editoriale`,
        "actionableFeedbackPolicy": `${BASE}/charte-editoriale`,
        "knowsAbout": ["Santé", "Médecins", "Prise de rendez-vous médical", "Établissements de santé", "AMO", "CNSS"],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "contact@santeaumaroc.com",
          "availableLanguage": ["French", "Arabic"],
        },
        "address": { "@type": "PostalAddress", "addressCountry": "MA" },
        "areaServed": areaServed,
        ...(sameAs.length ? { "sameAs": sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        "url": BASE,
        "name": "SantéauMaroc",
        "description": "Annuaire médical marocain — Trouvez votre médecin et prenez rendez-vous en ligne.",
        "inLanguage": "fr-MA",
        "publisher": { "@id": `${BASE}/#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": { "@type": "EntryPoint", "urlTemplate": `${BASE}/praticiens?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

/* ── Specialty section (streams separately — aggregation with _count + ORDER BY _count) */

async function SpecialtiesSection({ t }: { t: Dictionary["home"]["specialties"] }) {
  const specialties = await getTopSpecialties();
  if (specialties.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-secondary-100 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-3.5 h-3.5 text-secondary-700" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5L14 14"/>
              </svg>
            </div>
            <p className="section-eyebrow">{t.eyebrow}</p>
          </div>
          <h2 className="section-title">{t.title}</h2>
          <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2c0 2.5-2 3.5-2 6.5a4 4 0 0 0 8 0C14 5 12 3 10 2c0 1.5-1 2.5-2 4C7 5 8 3 8 2z"/>
            </svg>
            {t.subtitle}
          </p>
        </div>
        <Link
          href="/specialites"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-secondary-600 hover:text-secondary-700 transition-colors"
        >
          {t.seeAll}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100">
            <path d="m6 3 5 5-5 5" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {specialties.map((s) => (
          <Link key={s.id} href={`/specialites/${s.slug}`} className="card p-4 group">
            <SpecialtyIcon name={s.name} />
            <p className="font-semibold text-sm text-slate-800 group-hover:text-secondary-700 transition-colors leading-snug mt-3">
              {s.name}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {s._count.doctors.toLocaleString("fr")}&nbsp;{s._count.doctors !== 1 ? t.pracMany : t.pracOne}
            </p>
            <div className="mt-3 h-0.5 w-0 group-hover:w-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300" />
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link href="/specialites" className="btn-outline text-sm py-2">
          {t.seeAllMobile}
        </Link>
      </div>
    </section>
  );
}

function SpecialtiesFallback() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-8 animate-pulse">
        <div className="h-3 w-20 bg-slate-100 rounded mb-3" />
        <div className="h-7 w-64 bg-slate-100 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-100 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-slate-100 mb-3" />
            <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Composant principal ────────────────────────────────── */


export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = toLocale((await params).lang);
  // getStats() = 4 parallel COUNT queries — fast even uncached (~20ms)
  const [stats, latestPosts] = await Promise.all([getStats(), getLatestPosts()]);
  const dict = getDictionary(locale);
  const h = dict.home;

  // Options de spécialités du hero : libellé traduit, slug/href en français (DB).
  const specialtyOptions = Object.entries(dict.specialtyNames).map(([fr, label]) => ({
    value: slugify(fr),
    label,
  }));
  const quickSpecialties = Object.entries(dict.specialtyNames).slice(0, 5).map(([fr, label]) => ({
    href: `/specialites/${slugify(fr)}`,
    label,
  }));

  const STATS = [
    { label: h.stats.doctors,        value: stats.doctors.toLocaleString("fr"),        Icon: IconDoctor },
    { label: h.stats.establishments, value: stats.establishments.toLocaleString("fr"), Icon: IconEstablishment },
    { label: h.stats.specialties,    value: stats.specialties.toLocaleString("fr"),    Icon: IconSpecialty },
    { label: h.stats.cities,         value: stats.cities.toLocaleString("fr"),         Icon: IconCity },
  ];

  const SERVICES = [
    {
      href: "/cliniques",
      Icon: IconEstablishment,
      title: h.services.clinics.title,
      desc: h.services.clinics.desc,
      color: "bg-primary-50 text-primary-600 group-hover:bg-primary-100",
    },
    {
      href: "/pharmacies",
      Icon: IconPharmacy,
      title: h.services.pharmacies.title,
      desc: h.services.pharmacies.desc,
      color: "bg-secondary-50 text-secondary-700 group-hover:bg-secondary-100",
    },
    {
      href: "/medicaments",
      Icon: IconMedication,
      title: h.services.medicines.title,
      desc: h.services.medicines.desc,
      color: "bg-accent-50 text-accent-700 group-hover:bg-accent-100",
    },
  ];

  const HOW_IT_WORKS = [
    {
      step: "01",
      title: h.how.search.title,
      desc: h.how.search.desc,
      gradient: "linear-gradient(135deg, #60a5fa, #2563eb)",
      arrowColor: "text-primary-300",
    },
    {
      step: "02",
      title: h.how.compare.title,
      desc: h.how.compare.desc,
      gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      arrowColor: "text-secondary-400",
    },
    {
      step: "03",
      title: h.how.book.title,
      desc: h.how.book.desc,
      gradient: "linear-gradient(135deg, #1d4ed8, #059669)",
      arrowColor: "",
    },
  ];

  return (
    <>
      {/* JSON-LD streams in separately — getCoveredCities() is an expensive aggregation */}
      <Suspense fallback={null}>
        <SiteJsonLd />
      </Suspense>
    <div>

      {/* ════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════ */}
      <section className="hero-bg text-white">
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-14 md:pt-28 md:pb-18 text-center">

          {/* Badge de confiance */}
          <div className="flex justify-center mb-5">
            <span className="badge-trust">
              <IconShield />
              {h.hero.badgeCertified}
              <span className="opacity-30 font-light" aria-hidden="true">|</span>
              {h.hero.badgeVerified}
            </span>
          </div>

          {/* Slogan de marque */}
          <p className="flex items-center justify-center gap-2.5 text-sm sm:text-base font-medium text-white/75 tracking-wide mb-7">
            <svg viewBox="0 0 12 12" width="14" height="14" fill="#fbbf24" aria-hidden="true">
              <path d="M6,0.5 L7.23,4.3 L11.23,4.3 L8,6.65 L9.23,10.45 L6,8.1 L2.77,10.45 L4,6.65 L0.77,4.3 L4.77,4.3 Z"/>
            </svg>
            {h.hero.slogan}
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5 tracking-tight text-white">
            {h.hero.titlePre}{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #34d399, #6ee7b7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {h.hero.titleHighlight}
            </span>
            <br className="hidden sm:block" />
            {" "}{h.hero.titlePost}
          </h1>

          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {h.hero.subtitle}
          </p>

          {/* Barre de recherche — combobox ville + géolocalisation */}
          <HeroSearchForm t={dict.heroSearch} specialtyOptions={specialtyOptions} quickSpecialties={quickSpecialties} />
        </div>

        {/* Bande statistiques */}
        <div className="border-t border-white/10 bg-black/20">
          <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {STATS.map(({ label, value, Icon }) => (
              <div key={label} className="text-center px-4 py-2 group">
                <div className="flex justify-center mb-1.5 text-secondary-400 opacity-80">
                  <Icon />
                </div>
                <p dir="ltr" className="text-2xl md:text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/65 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SPÉCIALITÉS (streams — getTopSpecialties is an aggregation)
          ════════════════════════════════════════════════════ */}
      <Suspense fallback={<SpecialtiesFallback />}>
        <SpecialtiesSection t={h.specialties} />
      </Suspense>

      {/* ════════════════════════════════════════════════════
          COMMENT ÇA MARCHE
          ════════════════════════════════════════════════════ */}
      <section className="bg-section-alt border-y border-slate-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-2">{h.how.eyebrow}</p>
            <h2 className="section-title">{h.how.title}</h2>
            <p className="section-subtitle mx-auto mt-3">
              {h.how.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, gradient, arrowColor }) => (
              <div key={step} className="card-flat p-6 relative">
                <div className="step-number mb-4" style={{ background: gradient }}>{step}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                {step !== "03" && (
                  <div
                    className="hidden sm:block absolute top-8 -end-3 z-10"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-6 h-6 rtl:-scale-x-100 ${arrowColor}`}>
                      <path d="m9 5 7 7-7 7" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          VILLES
          ════════════════════════════════════════════════════ */}
      <section className="bg-white bg-pattern-moroccan border-b border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-terra-50 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                    className="w-3.5 h-3.5 text-terra-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2C5.24 2 3 4.24 3 7c0 3.94 5 9 5 9s5-5.06 5-9C13 4.24 10.76 2 8 2z"/>
                    <circle cx="8" cy="7" r="1.5"/>
                  </svg>
                </div>
                <p className="section-eyebrow-maroc">{h.cities.eyebrow}</p>
              </div>
              <h2 className="section-title">{h.cities.title}</h2>
              <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-3.5 h-3.5 text-terra-500 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6"/>
                  <path d="M8 2v12M2 8h12M4 4l8 8M12 4l-8 8"/>
                </svg>
                {h.cities.subtitle}
              </p>
            </div>
            <Link
              href="/villes"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-secondary-600 hover:text-secondary-700 transition-colors"
            >
              {h.cities.seeAll}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100">
                <path d="m6 3 5 5-5 5" strokeLinecap="round" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {MAJOR_CITIES.map((city) => (
              <Link
                key={city}
                href={`/villes/${slugify(city)}`}
                className="card p-3.5 flex items-center gap-2.5 group"
              >
                <CityIcon name={city} size="sm" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-secondary-700 transition-colors truncate">
                  {city}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SERVICES
          ════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="section-eyebrow mb-2">{h.services.eyebrow}</p>
          <h2 className="section-title">{h.services.title}</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {SERVICES.map(({ href, Icon, title, desc, color }) => (
            <Link key={href} href={href} className="card p-6 group flex flex-col">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200 ${color}`}>
                <Icon />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-primary-700 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:gap-2 transition-all duration-200">
                {h.services.explore}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 rtl:-scale-x-100">
                  <path d="m6 3 5 5-5 5" strokeLinecap="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CONSEILS SANTÉ (blog) — maillage home → blog
          ════════════════════════════════════════════════════ */}
      {latestPosts.length > 0 && (
        <section className="bg-section-alt border-y border-slate-100 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="section-eyebrow mb-2">{dict.blog.heroBadge}</p>
                <h2 className="section-title">{dict.blog.heroTitle} {dict.blog.heroTitleAccent}</h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:gap-2.5 transition-all whitespace-nowrap"
              >
                {dict.blog.emptyLink}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 rtl:-scale-x-100" aria-hidden="true">
                  <path d="m6 3 5 5-5 5" strokeLinecap="round" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <PostCard key={post.slug} post={post as PostCardData} t={dict.blog} locale={locale} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/blog" className="btn-outline px-6 py-2.5 text-sm">{dict.blog.emptyLink}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          CTA PRATICIEN
          ════════════════════════════════════════════════════ */}
      <section className="hero-bg text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="section-eyebrow text-secondary-300 mb-4">
            {h.practitionerCta.eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 tracking-tight text-white">
            {h.practitionerCta.title}
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
            {h.practitionerCta.subtitle}
          </p>

          <ul className="flex flex-col sm:flex-row justify-center gap-4 mb-10 text-sm text-white/80">
            {[
              h.practitionerCta.feat1,
              h.practitionerCta.feat2,
              h.practitionerCta.feat3,
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2 justify-center">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-secondary-400 shrink-0">
                  <path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {feat}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/inscription-praticien" className="btn-secondary px-8 py-3 text-base">
              <IconCalendar />
              {h.practitionerCta.create}
            </Link>
            <Link href="/praticiens" className="btn-ghost-white px-8 py-3 text-base">
              {h.practitionerCta.browse}
            </Link>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
