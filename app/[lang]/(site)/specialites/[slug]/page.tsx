import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";
import { SpecialtyQuestionsSection } from "@/components/qa/SpecialtyQuestionsSection";
import { PraticienCard } from "@/components/PraticienCard";
import { ListingControls, FILTERABLE_LANGUAGES } from "@/components/ListingControls";
import { SpecialtyControls, SpecialtyResults as SpecialtyResultsLive } from "@/components/specialites/SpecialtyListing";
import { Pagination } from "@/components/ui/Pagination";
import { SpecialtyIcon } from "@/components/SpecialtyIcon";
import { EssentielBox } from "@/components/EssentielBox";
import { SpecialtyEditorial } from "@/components/SpecialtyEditorial";
import { getSpecialtyContent, pluralizeSynonyme } from "@/lib/specialty-content";
import { articleSlugsForSpecialty } from "@/lib/blog-related";
import { getDictionary, toLocale, type Locale, type Dictionary } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/hreflang";
import { tSpecialty, tCity } from "@/lib/specialty-i18n";
import { specialtyFamily } from "@/lib/specialty-family";
import { specialtyCityCounts } from "@/lib/specialty-cities";
import { getSpecialtyDoctors } from "@/lib/specialite-doctors";
import { PRATICIENS_PAGE_SIZE as PAGE_SIZE } from "@/lib/praticiens-query";

type Params       = Promise<{ lang: string; slug: string }>;
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

/** Date de dernière révision éditoriale du contenu spécialité (E-E-A-T + signal IA).
 *  Stable entre deux revalidations : reflète une vraie relecture, pas l'heure de build. */
const CONTENT_REVIEWED = "2026-06-28";

export const revalidate = 3600;

// Route dynamique [slug] : sans échantillons de params, l'accès à `params` force
// le rendu dynamique. On pré-rend toutes les spécialités (hubs indexés, ~100) →
// pages statiques/ISR servies par le CDN (les filtres restent gérés côté client).
export async function generateStaticParams() {
  const specialties = await prisma.specialty.findMany({ select: { slug: true } });
  return specialties.map((s) => ({ slug: s.slug }));
}

/** WHERE du listing — partagé par le compteur (coquille) et le findMany (streamé)
 *  pour éviter toute divergence de filtres. */
function buildWhere(slug: string, f: { ville: string; dispo: string; conv: string; langue: string; today: number }) {
  return {
    isActive: true as const,
    specialty: { slug },
    ...(f.ville ? { city: { slug: f.ville } } : {}),
    ...(f.dispo === "1" ? { workingHours: { some: { isActive: true, dayOfWeek: f.today } } } : {}),
    ...(f.conv === "1" ? { conventions: { isEmpty: false } } : {}),
    ...(f.langue ? { langues: { has: f.langue } } : {}),
  };
}

async function getSpecialty(slug: string) {
  return cachedQuery(`specialite:meta:${slug}`, 3600, () =>
    prisma.specialty.findUnique({ where: { slug } }),
  );
}

// Page STATIQUE : le serveur ne lit plus searchParams (filtres/tri/pagination
// gérés côté client, vues noindex). Métadonnées = vue canonique de base.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const [s, count] = await Promise.all([
    getSpecialty(slug),
    // Compteur canonique caché (mutualisé avec la coquille de la page).
    cachedQuery(`specialite:count:${slug}`, 3600, () =>
      prisma.doctor.count({ where: { isActive: true, specialty: { slug } } }),
    ),
  ]);
  if (!s) return { title: "Spécialité introuvable", robots: { index: false } };

  const content = getSpecialtyContent(slug);
  const { synonyme } = content;
  const titleName = synonyme !== "spécialiste"
    ? synonyme.charAt(0).toUpperCase() + synonyme.slice(1)
    : s.name;
  // Titre du document : le layout applique déjà le template « %s | SantéauMaroc »,
  // donc on n'ajoute PAS la marque ici (évite le doublon « … | SantéauMaroc | SantéauMaroc »).
  const title = `${titleName} au Maroc — Avis & RDV en ligne`;
  // OG/Twitter ne passent pas par le template : on ajoute la marque explicitement.
  const socialTitle = `${title} | SantéauMaroc`;

  const countFmt = count.toLocaleString("fr");
  const synPlural = count > 1 ? (content.synonymePluriel ?? pluralizeSynonyme(synonyme)) : synonyme;
  const description = count > 0
    ? `Consultez ${countFmt} ${synPlural} référencé${count > 1 ? "s" : ""} au Maroc. Avis patients vérifiés, tarifs, horaires et prise de RDV en ligne — 100 % gratuit.`
    : `Trouvez un ${synonyme} au Maroc. Avis patients vérifiés, tarifs et prise de rendez-vous en ligne — gratuit.`;
  const ogDescription = count > 0
    ? `${countFmt} ${synPlural} sur SantéauMaroc. Profils vérifiés, avis patients et RDV en ligne.`
    : `Annuaire des ${content.synonymePluriel ?? pluralizeSynonyme(synonyme)} au Maroc. Profils vérifiés, avis patients et RDV en ligne.`;

  const locale = toLocale(lang);
  return {
    title,
    description,
    alternates: localizedAlternates(`/specialites/${slug}`, locale),
    openGraph: {
      title: socialTitle,
      description: ogDescription,
      url: `/specialites/${slug}`,
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: ogDescription,
    },
  };
}

/* ── Streamé : liste des praticiens (vue canonique) + pagination + JSON-LD
   ItemList ── Isolé sous <Suspense> : c'est la requête la plus lourde (findMany
   + créneaux). La coquille (héros/essentiel/contrôles = LCP) ne l'attend pas.
   Source de données UNIQUE partagée avec la route API client
   (getSpecialtyDoctors, cache durable) → aucun fork de requête entre le SSR de
   base et le filtrage client, et DTO plat JSON-safe (prix Decimal→number). */
async function SpecialtyResults({
  page, total, slug, locale, t, tCard, tPagination,
  hasRefine, ville, activeCityName, specName, synonyme, synPlural, specialtyName, buildUrl,
}: {
  page: number;
  total: number;
  slug: string;
  locale: Locale;
  t: Dictionary["directory"];
  tCard: Dictionary["card"];
  tPagination: Dictionary["pagination"];
  hasRefine: boolean;
  ville: string;
  activeCityName: string | null;
  specName: string;
  synonyme: string;
  synPlural: string;
  specialtyName: string;
  buildUrl: (p: number) => string;
}) {
  // Vue canonique (aucun filtre, page demandée) : même source cachée durable que
  // la route API client → SSR de base et filtrage client strictement cohérents.
  const { doctors } = await getSpecialtyDoctors(slug, { page });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // JSON-LD ItemList (dépend des médecins → émis ici, avec la liste streamée).
  const itemList = total > 0 && doctors.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${BASE}/specialites/${slug}#doctors`,
    "numberOfItems": total,
    "itemListElement": doctors.slice(0, 8).map((d, i) => {
      const reviews = d._count.reviews;
      return {
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Physician",
          "@id": `${BASE}/praticiens/${d.slug}#physician`,
          "name": [d.civilite, d.prenom, d.nom].filter(Boolean).join(" "),
          "url": `${BASE}/praticiens/${d.slug}`,
          "medicalSpecialty": d.specialty.name,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": d.adresse,
            "addressLocality": d.city.name,
            "addressCountry": "MA",
          },
          ...(d.langues && d.langues.length > 0 ? { "availableLanguage": d.langues } : {}),
          ...(d.prix != null ? { "priceRange": `${Number(d.prix)} MAD` } : {}),
          ...(reviews >= 3 && d.averageRating > 0
            ? {
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": Number(d.averageRating.toFixed(1)),
                  "reviewCount": reviews,
                  "bestRating": 5,
                  "worstRating": 1,
                },
              }
            : {}),
        },
      };
    }),
  } : null;

  return (
    <>
      {itemList && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      )}

      {doctors.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-8 h-8 text-primary-300" aria-hidden="true"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5"/>
              <path d="M3 21v-1a9 9 0 0 1 18 0v1"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-700 text-base">
            {hasRefine
              ? t.noResultFilters
              : <>{t.noResultPrefix} {locale === "ar" ? specName : specialtyName.toLowerCase()}{activeCityName && ` ${t.in} ${activeCityName}`}</>}
          </p>
          {!hasRefine && (
            <p className="text-sm text-slate-500 max-w-xs text-center">
              {ville ? t.tryOtherCity : t.noResultSpecialty}
            </p>
          )}
          {hasRefine ? (
            <Link
              href={ville ? `/specialites/${slug}?ville=${ville}` : `/specialites/${slug}`}
              className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              {t.clearFilters}
            </Link>
          ) : ville ? (
            <Link
              href={`/specialites/${slug}`}
              className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              {t.seeAllPractitioners}
            </Link>
          ) : (
            <Link
              href="/specialites"
              className="mt-2 inline-flex items-center gap-2 border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {t.browseAllSpecialties}
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="sr-only">
            {locale === "ar"
              ? `${specName} ${activeCityName ? `${t.in} ${activeCityName}` : t.inCountry}`
              : `${synonyme !== "spécialiste" ? synPlural : specialtyName}${activeCityName ? ` à ${activeCityName}` : " au Maroc"}`}
          </h2>
          {doctors.map((d, i) => (
            <PraticienCard key={d.id} praticien={d} priority={i === 0} hideSpecialty isPro={d.isPro} isFeatured={d.isFeatured} canBookOnline={d.canBookOnline} slots={d.slots} locale={locale} t={tCard} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={tPagination} />
    </>
  );
}

/* ── Streamé : maillage bas de page (spécialités proches + articles) ──
   Requêtes DB non critiques, sous la ligne de flottaison → hors du chemin
   de rendu de la coquille. */
async function SpecialtyRelated({
  slug, specialtyName, locale, t, relatedReadTitle, readingTimeShort,
}: {
  slug: string;
  specialtyName: string;
  locale: Locale;
  t: Dictionary["directory"];
  relatedReadTitle: string;
  readingTimeShort: string;
}) {
  const relatedPostSlugs = articleSlugsForSpecialty(slug);
  const [relatedSpecialties, relatedPosts] = await Promise.all([
    cachedQuery(`specialite:related:${slug}`, 3600, async () => {
      // groupBy agrégé (1 scan) au lieu d'un `_count` corrélé par spécialité (~96
      // sous-requêtes). On exclut la spécialité courante après résolution des noms.
      const groups = await prisma.doctor.groupBy({
        by: ["specialtyId"],
        where: { isActive: true },
        _count: { specialtyId: true },
        orderBy: { _count: { specialtyId: "desc" } },
      });
      const rows = await prisma.specialty.findMany({
        where: { id: { in: groups.map((g) => g.specialtyId) } },
        select: { id: true, slug: true, name: true },
      });
      const byId = new Map(rows.map((s) => [s.id, s] as const));
      const all = groups.flatMap((g) => {
        const s = byId.get(g.specialtyId);
        return s && s.slug !== slug
          ? [{ slug: s.slug, name: s.name, _count: { doctors: g._count.specialtyId } }]
          : [];
      });
      const fam = specialtyFamily(specialtyName);
      const same = all.filter((sp) => specialtyFamily(sp.name) === fam);
      const rest = all.filter((sp) => specialtyFamily(sp.name) !== fam);
      return [...same, ...rest].slice(0, 6);
    }),
    relatedPostSlugs.length
      ? prisma.post.findMany({
          where: { status: "PUBLISHED", slug: { in: relatedPostSlugs } },
          select: { title: true, slug: true, readingTime: true },
          orderBy: { publishedAt: "desc" },
          take: 4,
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      {relatedSpecialties.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5v7A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z"/>
              <path d="M5.5 6.5h5M5.5 9.5h3"/>
            </svg>
            {t.relatedSpecialties}
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedSpecialties.map((sp) => (
              <Link
                key={sp.slug}
                href={`/specialites/${sp.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              >
                {tSpecialty(sp.name, locale)}
                <span className="text-xs text-slate-500 tabular-nums">({sp._count.doctors})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 text-secondary-400 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2h7l3 3v9H3z"/><path d="M10 2v3h3M5.5 8h5M5.5 11h5"/>
            </svg>
            {relatedReadTitle}
          </h2>
          <ul className="flex flex-col gap-2">
            {relatedPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800 font-medium"
                >
                  <span className="underline-offset-2 group-hover:underline">{p.title}</span>
                  {p.readingTime && (
                    <span className="text-xs text-slate-400 font-normal">
                      · {readingTimeShort.replace("{n}", String(p.readingTime))}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

/* ── Page (coquille) ─────────────────────────────────────────
   N'attend QUE les données rapides de la coquille (specialty, count, villes).
   Les requêtes lourdes streament via <Suspense>. */

export default async function SpecialitePage({ params }: { params: Params }) {
  const { lang, slug } = await params;

  // Page STATIQUE : vue canonique de base uniquement (aucun filtre). Les
  // filtres/tri/pagination sont gérés côté client (SpecialtyResults → API,
  // vues noindex) → le serveur ne lit jamais searchParams.
  const where = buildWhere(slug, { ville: "", dispo: "", conv: "", langue: "", today: 0 });
  const page = 1;

  // Données de la COQUILLE uniquement (rapides / cachées), en parallèle.
  const [specialty, total, cities] = await Promise.all([
    getSpecialty(slug),
    cachedQuery(`specialite:count:${slug}`, 3600, () => prisma.doctor.count({ where })),
    specialtyCityCounts(slug),
  ]);
  if (!specialty) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.directory;
  const content    = getSpecialtyContent(slug, locale);
  const { synonyme } = content;
  const specName = tSpecialty(specialty.name, locale);
  const h1Title    = synonyme !== "spécialiste"
    ? synonyme.charAt(0).toUpperCase() + synonyme.slice(1) + " au Maroc"
    : specialty.name + " au Maroc";
  const heroTitle = locale === "ar" ? `${specName} ${t.inCountry}` : h1Title;

  const reviewedIso = content.reviewed ?? CONTENT_REVIEWED;
  const reviewedDisplay = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(reviewedIso));

  const synPlural = content.synonymePluriel ?? pluralizeSynonyme(synonyme);

  // Vue canonique de base : aucun filtre → contenu riche (essentiel/éditorial/
  // maillage) affiché ; aucune ville active.
  const hasRefine = false;
  const activeCityName: string | null = null;
  const showMaillage = true;

  const buildUrl = (p: number) => `/specialites/${slug}${p > 1 ? `?page=${p}` : ""}`;

  const controlsCities = cities.map((c) => ({ slug: c.slug, name: locale === "ar" ? tCity(c.name, locale) : c.name }));

  // Liste de base (page 1, sans filtre) rendue côté serveur : sert de contenu au
  // shell statique (fallback <Suspense> = HTML prérendu, indexable) ET de contenu
  // affiché tant qu'aucun filtre n'est actif.
  const baseList = (
    <SpecialtyResults
      page={page}
      total={total}
      slug={slug}
      locale={locale}
      t={t}
      tCard={dict.card}
      tPagination={dict.pagination}
      hasRefine={hasRefine}
      ville=""
      activeCityName={activeCityName}
      specName={specName}
      synonyme={synonyme}
      synPlural={synPlural}
      specialtyName={specialty.name}
      buildUrl={buildUrl}
    />
  );

  // Chip « {spécialité} à {ville} » — réutilisée pour les villes en avant et repliées.
  const cityChip = (c: (typeof cities)[number]) => (
    <Link
      key={c.slug}
      href={`/specialites/${slug}/${c.slug}`}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
    >
      {locale === "ar"
        ? `${specName} ${t.in} ${tCity(c.name, locale)}`
        : synonyme !== "spécialiste"
        ? `${synonyme.charAt(0).toUpperCase() + synonyme.slice(1)} à ${c.name}`
        : `${specialty.name} à ${c.name}`}
      <span className="text-xs text-slate-500 tabular-nums">({c._count.doctors})</span>
    </Link>
  );
  const TOP_CITIES = 12;
  const topCities = cities.slice(0, TOP_CITIES);
  const moreCities = cities.slice(TOP_CITIES);

  // JSON-LD de la coquille : MedicalWebPage (sans l'ItemList médecins, émis avec
  // la liste streamée) + FAQ + fil d'Ariane. Rendu immédiatement dans le HTML initial.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${BASE}/specialites/${slug}#page`,
        "name": h1Title,
        "url": `${BASE}/specialites/${slug}`,
        "description": total > 0
          ? `${total.toLocaleString("fr")} ${total > 1 ? synPlural : synonyme} référencé${total > 1 ? "s" : ""} au Maroc sur SantéauMaroc.`
          : `Trouvez un ${synonyme} au Maroc sur SantéauMaroc.`,
        "specialty": specialty.name,
        "about": { "@type": "MedicalSpecialty", "name": specialty.name },
        "isPartOf": { "@type": "WebSite", "url": BASE },
        "lastReviewed": reviewedIso,
        "dateModified": reviewedIso,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".essentiel-facts"] },
        // Référence par @id vers l'ItemList émis avec la liste streamée (les blocs
        // JSON-LD de la page sont fusionnés en un seul graphe → la référence résout).
        ...(total > 0 ? { "mainEntity": { "@id": `${BASE}/specialites/${slug}#doctors` } } : {}),
      },
      ...(content.faqs.length > 0 ? [{
        "@type": "FAQPage",
        "mainEntity": content.faqs.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }] : []),
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Spécialités", "item": `${BASE}/specialites` },
          { "@type": "ListItem", "position": 3, "name": specialty.name, "item": `${BASE}/specialites/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-outer">

        {/* ── Fil d'Ariane ─────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap"
          aria-label={t.breadcrumbAria}>
          <Link href="/" className="hover:text-primary-600 transition-colors">
            {t.home}
          </Link>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
          </svg>
          <Link href="/specialites" className="hover:text-primary-600 transition-colors">
            {t.specialties}
          </Link>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
          </svg>
          <span className="text-slate-600 truncate">{specName}</span>
        </nav>

        {/* ── Hero spécialité (LCP — rendu immédiat) ── */}
        <div className="card overflow-hidden p-0 mb-5">
          <div className="h-1.5"
            style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <SpecialtyIcon name={specialty.name} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="section-eyebrow mb-0.5">{t.specialtyEyebrow}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                  <span className="font-semibold text-slate-700">
                    {total.toLocaleString("fr")}
                  </span>{" "}
                  {total !== 1 ? t.pracMany : t.pracOne} {total !== 1 ? t.availableMany : t.availableOne}
                </p>

                {/* Bande de réassurance — signaux de confiance au moment du scan. */}
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

        {/* ── L'essentiel (faits chiffrés — featured snippet / AI Overview) ── */}
        {content.essentiel && content.essentiel.length > 0 && (
          <EssentielBox
            facts={content.essentiel}
            total={total}
            countLabel={locale === "ar" ? "أطباء مُدرجون بالمغرب" : "Praticiens référencés"}
            reviewedDisplay={reviewedDisplay}
            locale={locale}
          />
        )}

        {/* ── Tri + affinage — client (lit les filtres dans l'URL). <Suspense>
            requis par useSearchParams en page statique ; fallback = contrôles
            sans filtre actif (pas de CLS). ── */}
        <div
          className="bg-white rounded-2xl border border-slate-200 p-4 mb-5"
          style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}
        >
          <Suspense fallback={
            <ListingControls
              current={{ tri: "", dispo: "", conv: "", langue: "", ville: "", q: "" }}
              cities={controlsCities}
              languages={FILTERABLE_LANGUAGES}
              locale={locale}
              t={dict.filters}
            />
          }>
            <SpecialtyControls
              cities={controlsCities}
              languages={FILTERABLE_LANGUAGES}
              locale={locale}
              t={dict.filters}
            />
          </Suspense>
        </div>

        {/* ── Résultats — base SSR (fallback = HTML statique SEO) ; le client
            bascule sur les résultats filtrés/paginés quand l'URL a des params. ── */}
        <Suspense fallback={baseList}>
          <SpecialtyResultsLive
            slug={slug}
            locale={locale}
            cardT={dict.card}
            paginationT={dict.pagination}
            t={t}
          >
            {baseList}
          </SpecialtyResultsLive>
        </Suspense>

        {/* ── Contenu éditorial & FAQ (statique, rendu immédiat) ── */}
        {showMaillage && (
          <SpecialtyEditorial
            content={content}
            synonyme={synonyme}
            specName={specName}
            specialtyName={specialty.name}
            faqs={content.faqs}
            locale={locale}
            t={t}
          />
        )}

        {/* ── Par ville (cities déjà en coquille) ──── */}
        {showMaillage && cities.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true">
                <path d="M8 1C5.79 1 4 2.79 4 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z"
                  strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="5" r="1.5"/>
              </svg>
              {locale === "ar"
                ? `${specName} ${t.byCity}`
                : synonyme !== "spécialiste"
                ? `${synonyme.charAt(0).toUpperCase() + synonyme.slice(1)} par ville au Maroc`
                : `${specialty.name} par ville`}
            </h2>
            <div className="flex flex-wrap gap-2">
              {topCities.map((c) => cityChip(c))}
            </div>
            {moreCities.length > 0 && (
              <details className="group mt-2">
                <summary className="inline-flex items-center gap-1.5 cursor-pointer list-none text-sm font-medium text-secondary-600 hover:text-secondary-700 select-none">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-3.5 h-3.5 transition-transform group-open:rotate-90 rtl:-scale-x-100 group-open:rtl:rotate-90"
                    aria-hidden="true">
                    <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {`${t.showAll} (${cities.length.toLocaleString("fr")})`}
                </summary>
                <div className="flex flex-wrap gap-2 mt-3">
                  {moreCities.map((c) => cityChip(c))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* ── Maillage bas de page (streamé) ───────── */}
        {showMaillage && (
          <Suspense fallback={null}>
            <SpecialtyRelated
              slug={slug}
              specialtyName={specialty.name}
              locale={locale}
              t={t}
              relatedReadTitle={dict.blog.relatedReadTitle}
              readingTimeShort={dict.blog.readingTimeShort}
            />
          </Suspense>
        )}

        {/* ── Maillage Q/R (streamé) ───────────────── */}
        <Suspense fallback={null}>
          <SpecialtyQuestionsSection specialtyId={specialty.id} specialtySlug={slug} specialtyName={specialty.name} locale={locale} />
        </Suspense>

      </div>
    </>
  );
}
