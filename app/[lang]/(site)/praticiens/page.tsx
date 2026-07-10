import { Suspense } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { processCache } from "@/lib/process-cache";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Locale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { PraticienCard } from "@/components/PraticienCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Pagination } from "@/components/ui/Pagination";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { getCachedDoctors, PRATICIENS_PAGE_SIZE as PAGE_SIZE } from "@/lib/praticiens-query";
import { PraticiensResults } from "@/components/praticiens/PraticiensResults";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type Params = Promise<{ lang: string }>;

// ── Cached filter dropdowns (1 h) ─────────────────────────────────────────────
// Two-layer cache:
//   1. unstable_cache → Next.js Data Cache (cross-request, tag-invalidatable)
//   2. processCache  → globalThis in-process (survives Turbopack HMR hot-reloads)
const getFiltersData = unstable_cache(
  () => {
    const clean = (s: string) => s.replace(/[\r\n\t]+/g, " ").trim();
    return processCache("praticiens:filters", 3600, async () => {
      const [specialties, cities] = await Promise.all([
        prisma.specialty.findMany({
          select: { slug: true, name: true },
          orderBy: { doctors: { _count: "desc" } },
        }),
        prisma.city.findMany({
          select: { slug: true, name: true },
          orderBy: { doctors: { _count: "desc" } },
        }),
      ]);
      return {
        specialties: specialties.map((s) => ({ ...s, name: clean(s.name) })),
        cities:      cities.map((c)      => ({ ...c, name: clean(c.name) })),
      };
    });
  },
  ["praticiens-filters"],
  { revalidate: 3600, tags: ["filters"] },
);

// ── generateMetadata ──────────────────────────────────────────────────────────
// La page est STATIQUE : le serveur ne lit plus searchParams (filtres/pagination
// gérés côté client, vues noindex). Les métadonnées ne concernent donc que la vue
// canonique de base /praticiens.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const title = "Médecins & Praticiens au Maroc — Annuaire médical";
  const description =
    "Trouvez des médecins et spécialistes partout au Maroc. Consultez les avis patients, tarifs et horaires. Prise de RDV en ligne gratuite.";
  const locale = toLocale((await params).lang);
  return {
    title,
    description,
    alternates: localizedAlternates("/praticiens", locale),
    openGraph: { title, description, url: "/praticiens", type: "website" },
    twitter:   { card: "summary_large_image", title, description },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function removeParam(
  param: "q" | "specialite" | "ville",
  q: string, specialite: string, ville: string,
) {
  const params = new URLSearchParams();
  if (param !== "q"          && q)         params.set("q",         q);
  if (param !== "specialite" && specialite) params.set("specialite", specialite);
  if (param !== "ville"      && ville)     params.set("ville",     ville);
  const qs = params.toString();
  return `/praticiens${qs ? `?${qs}` : ""}`;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-3 h-3" aria-hidden="true">
      <path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round"/>
    </svg>
  );
}

// ── Bande de réassurance (sous le H1, rendue immédiatement) ───────────────────
// Remonte les signaux de confiance du footer au moment où le visiteur scanne la
// liste. Copy réutilisée de footer.trust (pas de duplication).
function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-3.5 h-3.5 shrink-0 text-secondary-500" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 4.5 6.5 11.5 3 8" />
    </svg>
  );
}

function ReassuranceBar({ t }: { t: { secure: string; verified: string; free: string; online: string } }) {
  const items = [t.verified, t.free, t.online, t.secure];
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-slate-600">
      {items.map((label) => (
        <li key={label} className="inline-flex items-center gap-1.5">
          <CheckIcon />
          {label}
        </li>
      ))}
    </ul>
  );
}

// ── Doctor results — async, streams via Suspense ──────────────────────────────
async function DoctorResults({
  q, specialite, ville, page, specialties, cities, locale,
}: {
  q: string; specialite: string; ville: string; page: number;
  specialties: { slug: string; name: string }[];
  cities:      { slug: string; name: string }[];
  locale:      Locale;
}) {
  const { doctors, total } = await getCachedDoctors(q, specialite, ville, page);
  const dict = getDictionary(locale);
  const tp = dict.praticiens;
  const totalPages     = Math.ceil(total / PAGE_SIZE);
  const activeSpecialty = specialite ? specialties.find((s) => s.slug === specialite) : null;
  const activeCity      = ville      ? cities.find((c)      => c.slug === ville)      : null;
  const hasFilter       = !!(q || activeSpecialty || activeCity);
  // hasParams : un paramètre d'URL est présent même s'il ne résout aucune entité
  // (ex. ?specialite=slug-inexistant). Sert à toujours offrir une sortie « Tout
  // afficher » plutôt qu'un cul-de-sac silencieux sur un lien cassé.
  const hasParams       = !!(q || specialite || ville);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q)          params.set("q",         q);
    if (specialite) params.set("specialite", specialite);
    if (ville)      params.set("ville",     ville);
    if (p > 1)      params.set("page",      String(p));
    const qs = params.toString();
    return `/praticiens${qs ? `?${qs}` : ""}`;
  };

  const showSchema = !hasFilter && page === 1;
  const jsonLd = showSchema ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${BASE}/praticiens#page`,
        "name": "Médecins & Praticiens au Maroc — Annuaire médical",
        "url": `${BASE}/praticiens`,
        "description": `Trouvez des médecins et spécialistes partout au Maroc. ${total.toLocaleString("fr")} praticiens référencés. Consultez les avis patients et prenez rendez-vous en ligne.`,
        "inLanguage": "fr",
        "audience": { "@type": "Patient" },
        "about": { "@type": "MedicalSpecialty", "name": "Médecine générale et spécialisée" },
        "areaServed": { "@type": "Country", "name": "Maroc" },
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}/#website`, "url": BASE, "name": "SantéauMaroc" },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Praticiens", "item": `${BASE}/praticiens` },
        ],
      },
      // ItemList : décrit la liste affichée pour des résultats enrichis (carrousel
      // de praticiens). Chaque entrée est un Physician ; aggregateRating n'est posé
      // que si le praticien a au moins un avis (cohérent avec la règle des fiches).
      {
        "@type": "ItemList",
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "numberOfItems": doctors.length,
        "itemListElement": doctors
          .filter((d) => d.slug)
          .map((d, i) => {
            const name = [d.civilite, d.prenom, d.nom].filter(Boolean).join(" ");
            return {
              "@type": "ListItem",
              "position": i + 1,
              "item": {
                "@type": "Physician",
                "name": name,
                "url": `${BASE}/praticiens/${d.slug}`,
                "medicalSpecialty": d.specialty.name,
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": d.city.name,
                  "addressCountry": "MA",
                },
                ...(d.averageRating > 0 && d._count.reviews > 0
                  ? {
                      "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": d.averageRating.toFixed(1),
                        "reviewCount": d._count.reviews,
                        "bestRating": 5,
                        "worstRating": 1,
                      },
                    }
                  : {}),
              },
            };
          }),
      },
      // FAQPage — contenu identique à la FAQ visible (exigence Google).
      {
        "@type": "FAQPage",
        "mainEntity": tp.faqs.map(({ q: question, a }) => ({
          "@type": "Question",
          "name": question,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      },
    ],
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      {/* Stat + filter chips — annoncé aux lecteurs d'écran quand le total change après filtrage */}
      <p className="text-slate-500 mt-2 text-sm leading-relaxed" role="status" aria-live="polite" aria-atomic="true">
        {hasFilter ? (
          <>
            <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>{" "}
            {total !== 1 ? tp.foundMany : tp.foundOne}
            {activeCity && ` ${tp.inCity} ${activeCity.name}`}
            {" · "}
            <Link href="/praticiens"
              className="text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium">
              {tp.showAll}
            </Link>
          </>
        ) : (
          <>
            <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>{" "}
            {tp.allSubtitle}
          </>
        )}
      </p>

      {hasFilter && (
        <div className="flex flex-wrap gap-2 mt-3">
          {q && (
            <Link href={removeParam("q", q, specialite, ville)}
              aria-label={`${tp.removeSearch} ${q}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
              <span aria-hidden="true">« {q} »</span><CloseIcon />
            </Link>
          )}
          {activeSpecialty && (
            <Link href={removeParam("specialite", q, specialite, ville)}
              aria-label={`${tp.removeSpecialty} ${activeSpecialty.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
              <span aria-hidden="true">{activeSpecialty.name}</span><CloseIcon />
            </Link>
          )}
          {activeCity && (
            <Link href={removeParam("ville", q, specialite, ville)}
              aria-label={`${tp.removeCity} ${activeCity.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-100 text-secondary-800 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
              <span aria-hidden="true">{activeCity.name}</span><CloseIcon />
            </Link>
          )}
        </div>
      )}

      <div className="mt-4 h-0.5 rounded-full"
        style={{ background: "linear-gradient(90deg, #93c5fd 0%, #6ee7b7 60%, transparent 100%)" }} />

      {/* List */}
      {doctors.length === 0 ? (
        <div className="empty-state mt-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-8 h-8 text-primary-300" aria-hidden="true"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5"/>
              <path d="M3 21v-1a9 9 0 0 1 18 0v1"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-700 text-base">{tp.emptyTitle}</p>
          <p className="text-sm text-slate-500 max-w-xs text-center">
            {tp.emptyText}
          </p>
          {hasParams && (
            <Link href="/praticiens"
              className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
              {tp.emptyCta}
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {doctors.map((d, i) => (
            <PraticienCard key={d.id} praticien={d} priority={i === 0} isPro={d.isPro} isFeatured={d.isFeatured} canBookOnline={d.canBookOnline} slots={d.slots} t={dict.card} locale={locale} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />

      {/* ── Maillage interne + éditorial + FAQ — hub canonique uniquement ──────
          Rendu seulement sur la page 1 non filtrée (= showSchema) : évite la
          duplication de contenu sur les vues filtrées (noindex) et paginées,
          et concentre le jus de liens vers /specialites et /villes. */}
      {showSchema && (
        <div className="mt-12 space-y-4">

          {/* Maillage : spécialités */}
          <section className="card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="font-semibold text-slate-900 text-base">{tp.browseSpecialties}</h2>
              <Link href="/specialites" className="text-sm font-medium text-secondary-600 hover:text-secondary-700 whitespace-nowrap">
                {tp.seeAllSpecialties} →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialties.slice(0, 14).map((s) => (
                <Link key={s.slug} href={`/specialites/${s.slug}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
                  {tSpecialty(s.name, locale)}
                </Link>
              ))}
            </div>
          </section>

          {/* Maillage : villes */}
          <section className="card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="font-semibold text-slate-900 text-base">{tp.browseCities}</h2>
              <Link href="/villes" className="text-sm font-medium text-secondary-600 hover:text-secondary-700 whitespace-nowrap">
                {tp.seeAllCities} →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.slice(0, 14).map((c) => (
                <Link key={c.slug} href={`/villes/${c.slug}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-secondary-50 text-secondary-700 hover:bg-secondary-100 transition-colors">
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          {/* Éditorial (E-E-A-T / contenu YMYL) */}
          <section className="card p-5 sm:p-6">
            <h2 className="font-semibold text-slate-900 text-base mb-3">{tp.aboutTitle}</h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>{tp.aboutP1}</p>
              <p>{tp.aboutP2}</p>
            </div>
          </section>

          {/* FAQ (accordéon + JSON-LD FAQPage déjà émis ci-dessus) */}
          <section className="card p-5 sm:p-6">
            <h2 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="7"/>
                <path d="M6 6c0-1.1.9-2 2-2s2 .9 2 2c0 1-1 1.5-2 2v.5M8 12v.5"/>
              </svg>
              {tp.faqHeading}
            </h2>
            <FaqAccordion faqs={tp.faqs} />
          </section>

        </div>
      )}
    </>
  );
}

// ── Skeleton shown while DoctorResults resolves ────────────────────────────────
// ── Page ──────────────────────────────────────────────────────────────────────
// STATIQUE (ISR via le Data Cache des requêtes) : le serveur ne lit PAS
// searchParams. La vue de base (page 1, sans filtre) est prérendue = shell SEO.
// Les filtres/recherche/pagination sont gérés côté client (PraticiensResults →
// /api/praticiens/search) ; ces vues sont noindex, hors périmètre SEO.
export default async function PraticiensPage({ params }: { params: Params }) {
  // Filters are cached — resolves without hitting DB after first request
  const { specialties, cities } = await getFiltersData();
  const locale = toLocale((await params).lang);
  const dict = getDictionary(locale);
  // Libellés de spécialités traduits pour le menu déroulant (le slug = valeur reste FR).
  const specialtiesT = locale === "ar"
    ? specialties.map((s) => ({ ...s, name: tSpecialty(s.name, locale) }))
    : specialties;

  // Vue de base (page 1, aucun filtre) rendue côté serveur. Sert à la fois de
  // contenu du shell statique (fallback <Suspense>, donc présent dans le HTML
  // prérendu = indexable) ET de contenu affiché quand aucun filtre n'est actif.
  const baseList = (
    <DoctorResults
      q="" specialite="" ville="" page={1}
      specialties={specialties} cities={cities} locale={locale}
    />
  );

  return (
    <div className="page-outer">

      <header className="mb-8">
        <p className="section-eyebrow mb-1.5">{dict.praticiens.eyebrow}</p>
        <h1 className="section-title">{dict.praticiens.defaultTitle}</h1>
        <ReassuranceBar t={dict.footer.trust} />
      </header>

      {/* Filtres — client (router.push met à jour l'URL, sans requête serveur) */}
      <div
        className="bg-white rounded-2xl border border-slate-200 p-4 mb-5"
        style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}
      >
        <SearchFilters specialties={specialtiesT} cities={cities} t={dict.filters} />
      </div>

      {/* Résultats — <Suspense> requis par useSearchParams en page statique.
          Fallback = liste de base SSR → présente dans le HTML prérendu (SEO). */}
      <Suspense fallback={baseList}>
        <PraticiensResults
          specialties={specialtiesT}
          cities={cities}
          locale={locale}
          cardT={dict.card}
          paginationT={dict.pagination}
          tp={dict.praticiens}
        >
          {baseList}
        </PraticiensResults>
      </Suspense>

    </div>
  );
}
