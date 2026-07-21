import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { PraticienCard } from "@/components/PraticienCard";
import { SearchFilters } from "@/components/SearchFilters";
import { VilleResults } from "@/components/villes/VilleResults";
import { Pagination } from "@/components/ui/Pagination";
import { CityIcon } from "@/components/CityIcon";
import { EssentielBox } from "@/components/EssentielBox";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { getCityContent, getCityFaqs } from "@/lib/city-content";
import { getVilleDoctors } from "@/lib/ville-doctors";
import { PRATICIENS_PAGE_SIZE as PAGE_SIZE } from "@/lib/praticiens-query";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { tCity, tSpecialty } from "@/lib/specialty-i18n";
import { cachedQuery } from "@/lib/cache";

type Params = Promise<{ lang: string; slug: string }>;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

/** Date de dernière révision éditoriale (E-E-A-T + signal IA). Stable entre revalidations. */
const CONTENT_REVIEWED = "2026-06-28";

export const revalidate = 3600;

export async function generateStaticParams() {
  const cities = await prisma.city.findMany({
    where:  { doctors: { some: { isActive: true } } },
    select: { slug: true },
  });
  return cities.map((c) => ({ slug: c.slug }));
}

async function getCity(slug: string) {
  // City n'a aucun champ Decimal (lat/lng = Float) → JSON-safe pour le Data Cache.
  return cachedQuery(`ville:meta:${slug}`, 3600, () =>
    prisma.city.findUnique({ where: { slug } }),
  );
}

/** Métadonnées de ville (spécialités + nb d'établissements), cachées 1 h. */
function getCityMeta(slug: string) {
  return cachedQuery(`ville:meta2:${slug}`, 3600, async () => {
    const [specialties, totalEstabs, estabsByType] = await Promise.all([
      prisma.specialty.findMany({
        where: { doctors: { some: { isActive: true, city: { slug } } } },
        select: {
          slug: true, name: true,
          _count: { select: { doctors: { where: { isActive: true, city: { slug } } } } },
        },
        orderBy: { doctors: { _count: "desc" } },
      }),
      prisma.establishment.count({ where: { isActive: true, city: { slug } } }),
      prisma.establishment.groupBy({
        by: ["type"],
        where: { isActive: true, city: { slug } },
        _count: { _all: true },
      }),
    ]);
    // Ventilation par section (mêmes règles de bucket que le sitemap).
    const estabCounts = { cliniques: 0, laboratoires: 0, pharmacies: 0 };
    for (const g of estabsByType) {
      const type = (g.type ?? "").toLowerCase();
      if (type.includes("pharma")) estabCounts.pharmacies += g._count._all;
      else if (type.includes("labo")) estabCounts.laboratoires += g._count._all;
      else estabCounts.cliniques += g._count._all;
    }
    return { specialties, totalEstabs, estabCounts };
  });
}

// Page STATIQUE : le serveur ne lit plus searchParams (filtre spécialité +
// pagination gérés côté client, vues noindex). Métadonnées = vue canonique.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const [c, count] = await Promise.all([
    getCity(slug),
    prisma.doctor.count({ where: { isActive: true, city: { slug } } }),
  ]);
  if (!c) return { title: "Ville introuvable", robots: { index: false } };

  const title = `Médecins à ${c.name} — Avis & RDV en ligne`;
  const socialTitle = `${title} | SantéauMaroc`;

  const description = count > 0
    ? `Consultez ${count.toLocaleString("fr")} médecin${count > 1 ? "s" : ""} et spécialiste${count > 1 ? "s" : ""} à ${c.name}. Avis patients vérifiés, tarifs, horaires et prise de RDV en ligne — 100 % gratuit.`
    : `Trouvez un médecin ou spécialiste à ${c.name}. Avis patients vérifiés, tarifs et prise de rendez-vous en ligne — gratuit.`;
  const ogDescription = count > 0
    ? `${count.toLocaleString("fr")} praticien${count > 1 ? "s" : ""} référencé${count > 1 ? "s" : ""} à ${c.name} — profils vérifiés, avis patients et RDV en ligne gratuit.`
    : `Annuaire médical de ${c.name}. Médecins et spécialistes vérifiés, avis patients et RDV en ligne.`;

  const locale = toLocale(lang);
  return {
    title,
    description,
    alternates: localizedAlternates(`/villes/${slug}`, locale),
    openGraph: { title: socialTitle, description: ogDescription, url: `/villes/${slug}`, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary_large_image", title: socialTitle, description: ogDescription },
  };
}

/* ── Icônes ─────────────────────────────────────────────── */

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className ?? "w-4 h-4"} aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="14" height="10" rx="1"/>
      <path d="M1 9h14M5 9V7M8 9V7M11 9V7M3 15v-3h3v3M10 15v-3h3v3"/>
    </svg>
  );
}

/* ── Page (coquille) ────────────────────────────────────── */

export default async function VillePage({ params }: { params: Params }) {
  const { lang, slug } = await params;

  const [city, { doctors, total }, meta] = await Promise.all([
    getCity(slug),
    getVilleDoctors(slug, "", 1),
    getCityMeta(slug),
  ]);
  if (!city) notFound();

  const { specialties, totalEstabs, estabCounts } = meta;
  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.directory;
  const content = getCityContent(slug, locale);
  const cityName = tCity(city.name, locale);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildUrl = (p: number) => `/villes/${slug}${p > 1 ? `?page=${p}` : ""}`;

  const reviewedDisplay = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(CONTENT_REVIEWED));

  const essentielFacts = [
    { value: specialties.length.toLocaleString("fr"), label: locale === "ar" ? "تخصصات متاحة" : "Spécialités couvertes" },
    ...(totalEstabs > 0
      ? [{ value: totalEstabs.toLocaleString("fr"), label: locale === "ar" ? "عيادات ومختبرات" : "Cliniques & labos" }]
      : []),
    { value: "100 – 250 MAD", label: locale === "ar" ? "استشارة طب عام" : "Consultation généraliste" },
  ];

  const cityFaqs = getCityFaqs(locale, { cityName, total, specialtiesCount: specialties.length });

  const specialtiesForFilter = locale === "ar"
    ? specialties.map((s) => ({ slug: s.slug, name: tSpecialty(s.name, locale) }))
    : specialties.map((s) => ({ slug: s.slug, name: s.name }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${BASE}/villes/${slug}#page`,
        "name": `Médecins à ${city.name}`,
        "url": `${BASE}/villes/${slug}`,
        "description": total > 0
          ? `${total.toLocaleString("fr")} médecin${total > 1 ? "s" : ""} et spécialiste${total > 1 ? "s" : ""} référencé${total > 1 ? "s" : ""} à ${city.name} sur SantéauMaroc.`
          : `Trouvez un médecin ou spécialiste à ${city.name} sur SantéauMaroc.`,
        "about": {
          "@type": "City",
          "name": city.name,
          "addressCountry": "MA",
          ...(city.region && { "containedInPlace": { "@type": "AdministrativeArea", "name": city.region } }),
          ...(city.latitude != null && city.longitude != null && {
            "geo": { "@type": "GeoCoordinates", "latitude": city.latitude, "longitude": city.longitude },
          }),
        },
        "isPartOf": { "@type": "WebSite", "url": BASE },
        "lastReviewed": CONTENT_REVIEWED,
        "dateModified": CONTENT_REVIEWED,
        ...(total > 0 ? { "mainEntity": { "@id": `${BASE}/villes/${slug}#doctors` } } : {}),
      },
      ...(cityFaqs.length > 0 ? [{
        "@type": "FAQPage",
        "mainEntity": cityFaqs.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }] : []),
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Villes",  "item": `${BASE}/villes` },
          { "@type": "ListItem", "position": 3, "name": city.name, "item": `${BASE}/villes/${slug}` },
        ],
      },
    ],
  };

  const baseList = (
    <>
      {total > 0 && doctors.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${BASE}/villes/${slug}#doctors`,
          "numberOfItems": total,
          "itemListElement": doctors.slice(0, 8).map((d, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "Physician",
              "@id": `${BASE}/praticiens/${d.slug}#physician`,
              "name": [d.civilite, d.prenom, d.nom].filter(Boolean).join(" "),
              "url": `${BASE}/praticiens/${d.slug}`,
              "medicalSpecialty": d.specialty.name,
              "address": { "@type": "PostalAddress", "streetAddress": d.adresse, "addressLocality": d.city.name, "addressCountry": "MA" },
              ...(d._count.reviews >= 3 && d.averageRating > 0
                ? { "aggregateRating": { "@type": "AggregateRating", "ratingValue": Number(d.averageRating.toFixed(1)), "reviewCount": d._count.reviews, "bestRating": 5, "worstRating": 1 } }
                : {}),
            },
          })),
        }) }} />
      )}
      {doctors.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-8 h-8 text-primary-300" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5"/><path d="M3 21v-1a9 9 0 0 1 18 0v1"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-700 text-base">{t.noPractitionerInCity} {cityName}</p>
          <p className="text-sm text-slate-500 max-w-xs text-center">{t.noneRegisteredCity}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="sr-only">{t.doctorsInCity} {cityName}</h2>
          {doctors.map((d, i) => (
            <PraticienCard key={d.id} praticien={d} priority={i === 0} isPro={d.isPro} isFeatured={d.isFeatured} canBookOnline={d.canBookOnline} slots={d.slots} locale={locale} t={dict.card} />
          ))}
        </div>
      )}
      <Pagination page={1} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />
    </>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-outer">

        {/* ── Fil d'Ariane ── */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap"
          aria-label={t.breadcrumbAria}>
          <Link href="/" className="hover:text-primary-600 transition-colors">{t.home}</Link>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
          </svg>
          <Link href="/villes" className="hover:text-primary-600 transition-colors">{t.cities}</Link>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
          </svg>
          <span className="text-slate-600 truncate">{cityName}</span>
        </nav>

        {/* ── Hero ville ── */}
        <div className="card overflow-hidden p-0 mb-5">
          <div className="h-1.5"
            style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <CityIcon name={city.name} size="lg" />
              <div className="flex-1 min-w-0">
                {city.region && (
                  <p className="section-eyebrow mb-0.5">{city.region}</p>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                  {t.doctorsInCity} {cityName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                      className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true"
                      strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="5" r="3.5"/>
                      <path d="M1.5 14.5a6.5 6.5 0 0 1 13 0"/>
                    </svg>
                    <span>
                      <span className="font-semibold text-slate-800">{total.toLocaleString("fr")}</span>{" "}
                      {total !== 1 ? t.pracMany : t.pracOne}
                    </span>
                  </span>

                  {totalEstabs > 0 && (
                    <Link
                      href={`/cliniques?ville=${slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-700 transition-colors group/estab"
                    >
                      <BuildingIcon className="w-4 h-4 text-slate-500 group-hover/estab:text-primary-400 transition-colors" />
                      <span>
                        <span className="font-semibold text-slate-700">{totalEstabs}</span>{" "}
                        {totalEstabs !== 1 ? t.estabMany : t.estabOne}
                      </span>
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                        className="w-3 h-3 text-slate-300 group-hover/estab:text-primary-400 group-hover/estab:translate-x-0.5 transition-all rtl:-scale-x-100" aria-hidden="true">
                        <path d="m4 2 4 4-4 4" strokeLinecap="round"/>
                      </svg>
                    </Link>
                  )}
                </div>

                <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs sm:text-sm text-slate-600">
                  {[dict.footer.trust.verified, dict.footer.trust.free, dict.footer.trust.online, dict.footer.trust.secure].map((label) => (
                    <li key={label} className="inline-flex items-center gap-1.5">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                        className="w-3.5 h-3.5 shrink-0 text-secondary-500" aria-hidden="true"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13.5 4.5 6.5 11.5 3 8" />
                      </svg>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── L'essentiel ── */}
        <EssentielBox
          facts={essentielFacts}
          total={total}
          countLabel={locale === "ar" ? `${t.doctorsInCity} ${cityName}` : `Praticiens à ${city.name}`}
          reviewedDisplay={reviewedDisplay}
          locale={locale}
        />

        {/* ── Filtres + résultats — client (filtre spécialité + pagination). ──
            <Suspense> requis (useSearchParams) ; fallback = filtre inerte +
            liste de base SSR (HTML prérendu = SEO). */}
        <Suspense fallback={
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5" style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}>
              <SearchFilters specialties={specialtiesForFilter} cities={[]} fixedVille={slug} t={dict.filters} />
            </div>
            {baseList}
          </>
        }>
          <VilleResults
            slug={slug}
            cityName={cityName}
            specialties={specialtiesForFilter}
            locale={locale}
            filtersT={dict.filters}
            cardT={dict.card}
            directoryT={t}
            paginationT={dict.pagination}
          >
            {baseList}
          </VilleResults>
        </Suspense>

        {/* ── Contenu éditorial (FR + AR) ── */}
        <div className="mt-10 card p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900 text-base mb-3 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true">
              <path d="M8 1C5.79 1 4 2.79 4 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z"
                strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="5" r="1.5"/>
            </svg>
            {t.careInCity} {cityName}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{content.description}</p>
          {content.highlights.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {content.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"
                    className="w-3 h-3 text-secondary-500 mt-0.5 shrink-0" aria-hidden="true"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── FAQ city-aware (FR + AR) ── */}
        {cityFaqs.length > 0 && (
          <div className="mt-4 card p-5 sm:p-6">
            <h2 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="7"/>
                <path d="M6 6c0-1.1.9-2 2-2s2 .9 2 2c0 1-1 1.5-2 2v.5M8 12v.5" strokeLinecap="round"/>
              </svg>
              {`${t.faqHeading} — ${cityName}`}
            </h2>
            <FaqAccordion faqs={cityFaqs} />
          </div>
        )}

        {/* ── Services de santé (établissements par type + prix) ── */}
        {(estabCounts.cliniques + estabCounts.laboratoires + estabCounts.pharmacies) > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <BuildingIcon className="w-4 h-4 text-primary-400 shrink-0" />
              {locale === "ar" ? `خدمات صحية في ${cityName}` : `Services de santé à ${city.name}`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { n: estabCounts.cliniques,    fr: "Cliniques",    ar: "عيادات",  href: `/cliniques?ville=${slug}` },
                { n: estabCounts.laboratoires, fr: "Laboratoires", ar: "مختبرات", href: `/laboratoires?ville=${slug}` },
                { n: estabCounts.pharmacies,   fr: "Pharmacies",   ar: "صيدليات", href: `/pharmacies?ville=${slug}` },
              ].filter((s) => s.n > 0).map((s) => (
                <Link key={s.href} href={s.href} className="card p-4 flex flex-col hover:border-primary-300 transition-colors">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">{s.n.toLocaleString("fr")}</span>
                  <span className="text-sm text-slate-600" dir="auto">{locale === "ar" ? s.ar : s.fr}</span>
                </Link>
              ))}
              <Link href="/prix" className="card p-4 flex flex-col justify-center hover:border-primary-300 transition-colors">
                <span className="text-base font-bold text-primary-700" dir="auto">{locale === "ar" ? "الأسعار" : "Prix des soins"}</span>
                <span className="text-xs text-slate-500 mt-0.5" dir="auto">{locale === "ar" ? "استشارات وفحوصات" : "Consultations & examens"}</span>
              </Link>
            </div>
          </div>
        )}

        {/* ── Spécialités disponibles ── */}
        {specialties.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8h12M8 2v12"/>
                <circle cx="8" cy="8" r="7"/>
              </svg>
              {t.specialtiesInCity} {cityName}
            </h2>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s) => (
                <Link
                  key={s.slug}
                  href={`/specialites/${s.slug}/${slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  {tSpecialty(s.name, locale)} {t.in} {cityName}
                  <span className="text-xs text-slate-500 tabular-nums">({s._count.doctors})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
