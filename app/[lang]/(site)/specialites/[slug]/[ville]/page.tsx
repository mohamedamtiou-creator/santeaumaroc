import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";
import { PraticienCard } from "@/components/PraticienCard";
import { ListingControls, FILTERABLE_LANGUAGES } from "@/components/ListingControls";
import { SpecialtyControls, SpecialtyResults as SpecialtyResultsLive } from "@/components/specialites/SpecialtyListing";
import { Pagination } from "@/components/ui/Pagination";
import { SpecialtyIcon } from "@/components/SpecialtyIcon";
import { EssentielBox } from "@/components/EssentielBox";
import { SpecialtyEditorial } from "@/components/SpecialtyEditorial";
import { getSpecialtyContent, pluralizeSynonyme } from "@/lib/specialty-content";
import { getSpecialtyCityContent } from "@/lib/specialty-city-content";
import { specialtyCityCounts } from "@/lib/specialty-cities";
import { getSpecialtyDoctors } from "@/lib/specialite-doctors";
import { PRATICIENS_PAGE_SIZE as PAGE_SIZE } from "@/lib/praticiens-query";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Locale, type Dictionary } from "@/lib/i18n";
import { tSpecialty, tCity } from "@/lib/specialty-i18n";

type Params       = Promise<{ lang: string; slug: string; ville: string }>;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

/** Date de dernière révision éditoriale (E-E-A-T + signal IA). Stable entre revalidations. */
const CONTENT_REVIEWED = "2026-06-28";

// Combo ville×spécialité indexable si assez de contenu propre (near-duplicate sinon).
const MIN_INDEXABLE_DOCTORS = 3;

export const revalidate = 3600;

export async function generateStaticParams() {
  // `distinct` sur les FK → une ligne par combo (spécialité × ville), au lieu de
  // charger toute la table médecins en mémoire pour la dédupliquer. Le slug étant
  // 1:1 avec l'id, le résultat est déjà unique. Reste borné même à 40k+ médecins.
  const combos = await prisma.doctor.findMany({
    where: { isActive: true },
    select: {
      specialty: { select: { slug: true } },
      city:      { select: { slug: true } },
    },
    distinct: ["specialtyId", "cityId"],
  });
  return combos.map((c) => ({ slug: c.specialty.slug, ville: c.city.slug }));
}

async function getSpecialty(slug: string) {
  return cachedQuery(`specialite:meta:${slug}`, 3600, () =>
    prisma.specialty.findUnique({ where: { slug } }),
  );
}
async function getCity(ville: string) {
  return cachedQuery(`ville:meta:${ville}`, 3600, () =>
    prisma.city.findUnique({ where: { slug: ville } }),
  );
}
function cityCount(slug: string, ville: string) {
  return cachedQuery(`specialite:count:${slug}:${ville}`, 3600, () =>
    prisma.doctor.count({ where: { isActive: true, specialty: { slug }, city: { slug: ville } } }),
  );
}

// Page STATIQUE : le serveur ne lit plus searchParams (filtres/recherche/tri/
// pagination gérés côté client, vues noindex). Métadonnées = vue canonique.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug, ville } = await params;
  const [specialty, city, count] = await Promise.all([getSpecialty(slug), getCity(ville), cityCount(slug, ville)]);
  if (!specialty || !city) return { title: "Page introuvable", robots: { index: false } };

  const content = getSpecialtyContent(slug);
  const { synonyme } = content;
  const synPlural = content.synonymePluriel ?? pluralizeSynonyme(synonyme);
  const titleName = synonyme !== "spécialiste"
    ? synonyme.charAt(0).toUpperCase() + synonyme.slice(1)
    : specialty.name;

  // Le layout applique déjà « %s | SantéauMaroc » : on n'ajoute PAS la marque ici.
  const title = `${titleName} à ${city.name} — Avis & RDV en ligne`;
  const socialTitle = `${title} | SantéauMaroc`;

  const description = count > 0
    ? `Consultez ${count.toLocaleString("fr")} ${count > 1 ? synPlural : synonyme} à ${city.name}. Avis patients vérifiés, tarifs et prise de rendez-vous en ligne — 100 % gratuit.`
    : `Trouvez un ${synonyme} à ${city.name}. Avis patients vérifiés, tarifs et prise de rendez-vous en ligne — gratuit.`;
  const ogDescription = count > 0
    ? `${count.toLocaleString("fr")} ${count > 1 ? synPlural : synonyme} à ${city.name} sur SantéauMaroc. Profils vérifiés et RDV en ligne.`
    : `${titleName} à ${city.name} — annuaire des spécialistes. Profils vérifiés et RDV en ligne.`;

  const canonical = `/specialites/${slug}/${ville}`;
  // Noindex (follow) si contenu trop mince : un combo ville×spécialité avec 0–2
  // praticiens n'apporte pas assez de valeur propre pour être indexé.
  const indexable = count >= MIN_INDEXABLE_DOCTORS;
  const locale = toLocale(lang);
  return {
    title,
    description,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: localizedAlternates(canonical, locale),
    openGraph: { title: socialTitle, description: ogDescription, url: canonical, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary_large_image", title: socialTitle, description: ogDescription },
  };
}

/* ── Helpers ─────────────────────────────────────────────── */

function ChevronRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
      <path d="m6 3 5 5-5 5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-3.5 h-3.5 shrink-0 rtl:-scale-x-100" aria-hidden="true">
      <path d="m10 3-5 5 5 5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Streamé : liste des praticiens (vue canonique) + pagination + JSON-LD
   ItemList ── Isolé sous <Suspense> : requête la plus lourde (findMany +
   créneaux). La coquille (héros/essentiel/contrôles = LCP) ne l'attend pas.
   Source UNIQUE partagée avec la route API client (getSpecialtyDoctors, cache
   durable) → SSR de base et filtrage client strictement cohérents. */
async function CityResults({
  slug, ville, page, total, locale, t, tCard, tPagination,
  specName, cityName, synonyme, synPlural, specialtyName, cityDisplayName, buildUrl,
}: {
  slug: string;
  ville: string;
  page: number;
  total: number;
  locale: Locale;
  t: Dictionary["directory"];
  tCard: Dictionary["card"];
  tPagination: Dictionary["pagination"];
  specName: string;
  cityName: string;
  synonyme: string;
  synPlural: string;
  specialtyName: string;
  cityDisplayName: string;
  buildUrl: (p: number) => string;
}) {
  const { doctors } = await getSpecialtyDoctors(slug, { ville, page });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const itemList = total > 0 && doctors.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${BASE}/specialites/${slug}/${ville}#doctors`,
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
          ...(d.prix != null ? { "priceRange": `${d.prix} MAD` } : {}),
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
          <p className="font-semibold text-slate-700 text-base">
            {locale === "ar" ? "لا يوجد ممارس." : "Aucun praticien référencé."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="sr-only">
            {locale === "ar" ? `${specName} ${t.in} ${cityName}` : `${synonyme !== "spécialiste" ? synPlural : specialtyName} à ${cityDisplayName}`}
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

/* ── Page (coquille) ─────────────────────────────────────── */

export default async function SpecialiteCityPage({ params }: { params: Params }) {
  const { lang, slug, ville } = await params;

  // Données de la COQUILLE uniquement (rapides / cachées), en parallèle.
  const [specialty, city, total, allCities] = await Promise.all([
    getSpecialty(slug),
    getCity(ville),
    cityCount(slug, ville),
    specialtyCityCounts(slug),
  ]);
  if (!specialty || !city) notFound();
  // La page n'existe que si la combinaison spécialité + ville référence des praticiens.
  if (total === 0) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.directory;
  const content = getSpecialtyContent(slug, locale);
  const { synonyme } = content;
  const synPlural = content.synonymePluriel ?? pluralizeSynonyme(synonyme);
  const specName = tSpecialty(specialty.name, locale);
  const cityName = tCity(city.name, locale);
  const titleName = locale === "ar"
    ? specName
    : synonyme !== "spécialiste"
    ? synonyme.charAt(0).toUpperCase() + synonyme.slice(1)
    : specialty.name;
  const h1Title = locale === "ar" ? `${specName} ${t.in} ${cityName}` : `${titleName} à ${city.name}`;

  const otherCities = allCities.filter((c) => c.slug !== ville).slice(0, 8);

  const page = 1;
  const buildUrl = (p: number) => `/specialites/${slug}/${ville}${p > 1 ? `?page=${p}` : ""}`;

  // Date de relecture : override par spécialité (content.reviewed) sinon constante globale.
  const reviewedIso = content.reviewed ?? CONTENT_REVIEWED;
  const reviewedDisplay = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(reviewedIso));

  // Contenu city-aware. Les spécialités à fort trafic configurées reçoivent un lead
  // contextualisé + des FAQ propres à la ville → sortent la page du near-duplicate.
  let lead: string;
  let faqs: { q: string; a: string }[];
  const synLower = synonyme !== "spécialiste" ? synonyme : specialty.name.toLowerCase();
  const cityEnrichment = getSpecialtyCityContent(slug, ville, cityName, total, locale);
  if (cityEnrichment) {
    lead = cityEnrichment.lead;
    faqs = [...cityEnrichment.faqs, ...content.faqs];
  } else {
    lead = locale === "ar"
      ? `يضم دليل صحة بالمغرب ${total.toLocaleString("ar-MA")} ${specName} في ${cityName}. قارن الملفات الموثّقة وآراء المرضى والمواعيد المتاحة، ثم احجز موعدك عبر الإنترنت مجانًا.`
      : `À ${city.name}, SantéauMaroc référence ${total.toLocaleString("fr")} ${total > 1 ? synPlural : synonyme}. Comparez les profils vérifiés, les avis patients et les disponibilités, puis prenez rendez-vous en ligne gratuitement.`;
    const cityFaq = {
      q: locale === "ar"
        ? `كيف أحجز موعدًا مع ${specName} في ${cityName}؟`
        : `Comment prendre rendez-vous avec un ${synLower} à ${city.name} ?`,
      a: locale === "ar"
        ? `عبر منصة صحة بالمغرب، تصفّح ${specName} المتاحين في ${cityName}، واطّلع على آراء المرضى والمواعيد، ثم احجز موعدك عبر الإنترنت مجانًا ودون رسوم تسجيل.`
        : `Sur SantéauMaroc, parcourez les ${total > 1 ? synPlural : synonyme} référencés à ${city.name}, consultez leurs avis patients et leurs disponibilités, puis réservez votre rendez-vous en ligne gratuitement — sans frais d'inscription.`,
    };
    faqs = [cityFaq, ...content.faqs];
  }

  // JSON-LD de la coquille : MedicalWebPage (référence l'ItemList émis avec la
  // liste streamée par @id) + FAQ + fil d'Ariane. Rendu dans le HTML initial.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${BASE}/specialites/${slug}/${ville}#page`,
        "name": h1Title,
        "url": `${BASE}/specialites/${slug}/${ville}`,
        "description": locale === "ar"
          ? `${total.toLocaleString("ar-MA")} ${specName} في ${cityName} على منصة صحة بالمغرب.`
          : `${total.toLocaleString("fr")} ${total > 1 ? synPlural : synonyme} référencé${total > 1 ? "s" : ""} à ${city.name} sur SantéauMaroc.`,
        "specialty": specialty.name,
        "about": { "@type": "MedicalSpecialty", "name": specialty.name },
        "spatialCoverage": { "@type": "City", "name": city.name, "addressCountry": "MA" },
        "isPartOf": { "@type": "WebSite", "url": BASE },
        "lastReviewed": reviewedIso,
        "dateModified": reviewedIso,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".essentiel-facts"] },
        ...(total > 0 ? { "mainEntity": { "@id": `${BASE}/specialites/${slug}/${ville}#doctors` } } : {}),
      },
      ...(faqs.length > 0 ? [{
        "@type": "FAQPage",
        "mainEntity": faqs.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }] : []),
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil",      "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Spécialités",  "item": `${BASE}/specialites` },
          { "@type": "ListItem", "position": 3, "name": specialty.name, "item": `${BASE}/specialites/${slug}` },
          { "@type": "ListItem", "position": 4, "name": city.name,      "item": `${BASE}/specialites/${slug}/${ville}` },
        ],
      },
    ],
  };

  // Liste de base (page 1, canonique) rendue côté serveur : contenu du shell
  // statique (fallback <Suspense> = HTML prérendu, indexable) ET contenu affiché
  // tant qu'aucun filtre/recherche n'est actif.
  const baseList = (
    <CityResults
      slug={slug}
      ville={ville}
      page={page}
      total={total}
      locale={locale}
      t={t}
      tCard={dict.card}
      tPagination={dict.pagination}
      specName={specName}
      cityName={cityName}
      synonyme={synonyme}
      synPlural={synPlural}
      specialtyName={specialty.name}
      cityDisplayName={city.name}
      buildUrl={buildUrl}
    />
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-outer">

        {/* ── Fil d'Ariane (aligné sur le JSON-LD) ── */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap"
          aria-label={t.breadcrumbAria}>
          <Link href="/" className="hover:text-primary-600 transition-colors">
            {t.home}
          </Link>
          <ChevronRight />
          <Link href="/specialites" className="hover:text-primary-600 transition-colors">
            {t.specialties}
          </Link>
          <ChevronRight />
          <Link href={`/specialites/${slug}`} className="hover:text-primary-600 transition-colors">
            {specName}
          </Link>
          <ChevronRight />
          <span className="text-slate-600">{cityName}</span>
        </nav>

        {/* ── Hero ─────────────────────────────────── */}
        <div className="card overflow-hidden p-0 mb-5">
          <div className="h-1.5"
            style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <SpecialtyIcon name={specialty.name} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="section-eyebrow mb-0.5">
                  {locale === "ar" ? specName : (synonyme !== "spécialiste" ? synonyme : specialty.name)} · {cityName}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                  {h1Title}
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                  <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>{" "}
                  {total !== 1 ? t.pracMany : t.pracOne} {total !== 1 ? t.availableMany : t.availableOne}
                </p>

                {/* Bande de réassurance (cohérente avec /praticiens et la page spécialité). */}
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
            countLabel={locale === "ar" ? `${t.doctorsInCity} ${cityName}` : `Praticiens à ${city.name}`}
            reviewedDisplay={reviewedDisplay}
            locale={locale}
          />
        )}

        {/* ── Recherche (nom) + tri + affinage — client (lit les filtres dans
            l'URL). <Suspense> requis par useSearchParams ; fallback = contrôles
            sans filtre actif (pas de CLS). ── */}
        <div
          className="bg-white rounded-2xl border border-slate-200 p-4 mb-5"
          style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}
        >
          <Suspense fallback={
            <ListingControls
              current={{ tri: "", dispo: "", conv: "", langue: "", ville: "", q: "" }}
              languages={FILTERABLE_LANGUAGES}
              showSearch
              locale={locale}
              t={dict.filters}
            />
          }>
            <SpecialtyControls
              languages={FILTERABLE_LANGUAGES}
              showSearch
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
            ville={ville}
            locale={locale}
            cardT={dict.card}
            paginationT={dict.pagination}
            t={t}
          >
            {baseList}
          </SpecialtyResultsLive>
        </Suspense>

        {/* ── Contenu éditorial city-aware (FR + AR) ── */}
        <SpecialtyEditorial
          content={content}
          synonyme={synonyme}
          specName={specName}
          specialtyName={specialty.name}
          faqs={faqs}
          locale={locale}
          t={t}
          cityName={cityName}
          lead={lead}
        />

        {/* ── Cross-links retour ────────────────────── */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
          <Link
            href={`/specialites/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 transition-colors"
          >
            <ChevronLeft />
            {locale === "ar"
              ? `${t.allOf} ${specName} ${t.inCountry}`
              : `Tous les ${synonyme !== "spécialiste" ? synPlural : `${specialty.name.toLowerCase()}s`} au Maroc`}
          </Link>
          <Link
            href={`/villes/${ville}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 transition-colors"
          >
            <ChevronLeft />
            {t.allDoctorsInCity} {cityName}
          </Link>
        </div>

        {/* ── Autres villes ─────────────────────────── */}
        {otherCities.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true">
                <path d="M8 1C5.79 1 4 2.79 4 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z"
                  strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="5" r="1.5"/>
              </svg>
              {titleName} {locale === "ar" ? t.inOtherCities : "dans d'autres villes"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/specialites/${slug}/${c.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  {titleName} {locale === "ar" ? t.in : "à"} {tCity(c.name, locale)}
                  <span className="text-xs text-slate-500 tabular-nums">({c._count.doctors})</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
