import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { PraticienCard } from "@/components/PraticienCard";
import { ListingControls, FILTERABLE_LANGUAGES } from "@/components/ListingControls";
import { Pagination } from "@/components/ui/Pagination";
import { SpecialtyIcon } from "@/components/SpecialtyIcon";
import { EssentielBox } from "@/components/EssentielBox";
import { SpecialtyEditorial } from "@/components/SpecialtyEditorial";
import { getSpecialtyContent, pluralizeSynonyme } from "@/lib/specialty-content";
import { getSpecialtyCityContent } from "@/lib/specialty-city-content";
import { specialtyCityCounts } from "@/lib/specialty-cities";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { tSpecialty, tCity } from "@/lib/specialty-i18n";
import { isProPlan, isFeaturedActive, hasProAccess } from "@/lib/plan";
import { generateAvailableSlots } from "@/lib/utils";

type Params       = Promise<{ lang: string; slug: string; ville: string }>;
type SearchParams = Promise<{ page?: string; q?: string; tri?: string; dispo?: string; conv?: string; langue?: string }>;

const PAGE_SIZE = 15;
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

/** Jour de la semaine à l'heure marocaine (convention JS getDay : 0=dimanche). */
function casablancaWeekday(): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Casablanca", weekday: "short" }).format(new Date());
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as const)[wd as "Sun"] ?? 0;
}

/** Date de dernière révision éditoriale (E-E-A-T + signal IA). Stable entre revalidations. */
const CONTENT_REVIEWED = "2026-06-28";

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

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { lang, slug, ville } = await params;
  const { page: pageStr = "1", q = "", tri = "", dispo = "", conv = "", langue = "" } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const [specialty, city, count] = await Promise.all([
    prisma.specialty.findUnique({ where: { slug } }),
    prisma.city.findUnique({ where: { slug: ville } }),
    prisma.doctor.count({
      where: { isActive: true, specialty: { slug }, city: { slug: ville } },
    }),
  ]);

  if (!specialty || !city) return { title: "Page introuvable", robots: { index: false } };

  const content = getSpecialtyContent(slug);
  const { synonyme } = content;
  const synPlural = content.synonymePluriel ?? pluralizeSynonyme(synonyme);
  const titleName = synonyme !== "spécialiste"
    ? synonyme.charAt(0).toUpperCase() + synonyme.slice(1)
    : specialty.name;

  // Le layout applique déjà « %s | SantéauMaroc » : on n'ajoute PAS la marque ici
  // (évite le doublon « … | SantéauMaroc | SantéauMaroc »).
  const title = `${titleName} à ${city.name} — Avis & RDV en ligne`;
  // OG/Twitter ne passent pas par le template : marque ajoutée explicitement.
  const socialTitle = `${title} | SantéauMaroc`;

  const description = count > 0
    ? `Consultez ${count.toLocaleString("fr")} ${count > 1 ? synPlural : synonyme} à ${city.name}. Avis patients vérifiés, tarifs et prise de rendez-vous en ligne — 100 % gratuit.`
    : `Trouvez un ${synonyme} à ${city.name}. Avis patients vérifiés, tarifs et prise de rendez-vous en ligne — gratuit.`;
  const ogDescription = count > 0
    ? `${count.toLocaleString("fr")} ${count > 1 ? synPlural : synonyme} à ${city.name} sur SantéauMaroc. Profils vérifiés et RDV en ligne.`
    : `${titleName} à ${city.name} — annuaire des spécialistes. Profils vérifiés et RDV en ligne.`;

  const canonical = `/specialites/${slug}/${ville}`;
  // Noindex (follow) si : vue filtrée/paginée OU contenu trop mince. Un combo
  // ville×spécialité avec 0–2 praticiens n'apporte pas assez de valeur propre
  // pour être indexé (near-duplicate template) — on garde le suivi des liens
  // pour laisser remonter le jus vers la spécialité / la ville.
  const MIN_INDEXABLE_DOCTORS = 3;
  const indexable = page === 1 && !q && !tri && !dispo && !conv && !langue && count >= MIN_INDEXABLE_DOCTORS;
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

/* ── Page ────────────────────────────────────────────────── */

export default async function SpecialiteCityPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { lang, slug, ville } = await params;
  const { page: pageStr = "1", q = "", tri = "", dispo = "", conv = "", langue = "" } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const query = q.trim();
  const hasQuery = query.length > 0;

  const [specialty, city] = await Promise.all([
    prisma.specialty.findUnique({ where: { slug } }),
    prisma.city.findUnique({ where: { slug: ville } }),
  ]);

  if (!specialty || !city) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.directory;
  const content = getSpecialtyContent(slug, locale);
  const { synonyme } = content;
  const synPlural = content.synonymePluriel ?? pluralizeSynonyme(synonyme);
  const synLower = synonyme !== "spécialiste" ? synonyme : specialty.name.toLowerCase();
  const specName = tSpecialty(specialty.name, locale);
  const cityName = tCity(city.name, locale);
  const titleName = locale === "ar"
    ? specName
    : synonyme !== "spécialiste"
    ? synonyme.charAt(0).toUpperCase() + synonyme.slice(1)
    : specialty.name;
  const h1Title = locale === "ar" ? `${specName} ${t.in} ${cityName}` : `${titleName} à ${city.name}`;

  const today = casablancaWeekday();
  const where = {
    isActive: true,
    specialty: { slug },
    city: { slug: ville },
    ...(dispo === "1" ? { workingHours: { some: { isActive: true, dayOfWeek: today } } } : {}),
    ...(conv === "1" ? { conventions: { isEmpty: false } } : {}),
    ...(langue ? { langues: { has: langue } } : {}),
    ...(hasQuery
      ? {
          OR: [
            { nom:    { contains: query, mode: "insensitive" as const } },
            { prenom: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // Tri : pertinence (défaut) · mieux notés · plus d'avis.
  const orderBy =
    tri === "note"
      ? [{ featuredUntil: { sort: "desc" as const, nulls: "last" as const } }, { averageRating: "desc" as const }, { isVerified: "desc" as const }]
      : tri === "avis"
      ? [{ featuredUntil: { sort: "desc" as const, nulls: "last" as const } }, { reviewsCount: "desc" as const }, { averageRating: "desc" as const }]
      : [{ featuredUntil: { sort: "desc" as const, nulls: "last" as const } }, { planActivatedAt: { sort: "desc" as const, nulls: "last" as const } }, { isVerified: "desc" as const }, { averageRating: "desc" as const }];

  const [doctors, total, allCities] = await Promise.all([
    prisma.doctor.findMany({
      where,
      include: {
        specialty:    { select: { name: true, slug: true } },
        city:         { select: { name: true, slug: true } },
        _count:       { select: { reviews: true } },
        workingHours: { select: { dayOfWeek: true, startTime: true, endTime: true }, where: { isActive: true } },
      },
      orderBy,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.doctor.count({ where }),
    // groupBy agrégé caché (cf. lib/specialty-cities.ts) au lieu d'une sous-requête
    // corrélée par ville. On exclut la ville courante et on garde le top 8.
    specialtyCityCounts(slug),
  ]);
  const otherCities = allCities.filter((c) => c.slug !== ville).slice(0, 8);

  // Filtres qui RESTREIGNENT l'ensemble (le tri seul ne compte pas → contenu riche
  // et compteur restent valides quand on ne fait que trier).
  const hasRefine = !!(dispo || conv || langue);

  // La page n'existe que si la combinaison spécialité + ville référence des praticiens.
  // (Une recherche `q` ou un filtre sans résultat ne déclenche PAS un 404 : état vide.)
  if (!hasQuery && !hasRefine && total === 0) notFound();

  // Créneaux réservables inline (puces sur la carte). Requête ciblée sur les seules
  // fiches à accès Pro + horaires → aucun coût quand la page n'en contient aucune
  // (cas courant : données migrées sans agenda). Fenêtre courte (14 j) : on n'affiche
  // que les prochaines disponibilités, pas tout l'agenda.
  const bookableIds = doctors
    .filter((d) => hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt) && d.workingHours.length > 0)
    .map((d) => d.id);
  const slotsByDoctor: Record<string, { date: string; time: string }[]> = {};
  if (bookableIds.length > 0) {
    const sched = await prisma.doctor.findMany({
      where: { id: { in: bookableIds } },
      select: {
        id: true,
        consultationDuration: true,
        bookingLeadHours: true,
        bookingMaxDays: true,
        workingHours: true,
        blockedSlots: { select: { date: true, time: true } },
        absences: { select: { startDate: true, endDate: true, allDay: true, startTime: true, endTime: true } },
        appointments: { where: { status: { notIn: ["CANCELLED"] } }, select: { date: true, time: true } },
      },
    });
    for (const d of sched) {
      const booked = d.appointments.map((a) => ({ date: a.date, time: a.time }));
      const all = generateAvailableSlots(booked, d.workingHours, d.consultationDuration, d.absences, {
        leadHours: d.bookingLeadHours,
        maxDays: Math.min(d.bookingMaxDays, 14),
      });
      const blockedSet = new Set(d.blockedSlots.map((b) => `${b.date}-${b.time}`));
      slotsByDoctor[d.id] = all
        .filter((s) => s.available && !blockedSet.has(`${s.date}-${s.time}`))
        .slice(0, 4)
        .map((s) => ({ date: s.date, time: s.time }));
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const buildUrl = (p: number) => {
    const ps = new URLSearchParams();
    if (hasQuery) ps.set("q", query);
    if (tri && tri !== "pertinence") ps.set("tri", tri);
    if (dispo === "1") ps.set("dispo", "1");
    if (conv === "1") ps.set("conv", "1");
    if (langue) ps.set("langue", langue);
    if (p > 1) ps.set("page", String(p));
    const qs = ps.toString();
    return `/specialites/${slug}/${ville}${qs ? `?${qs}` : ""}`;
  };

  // Contenu riche (éditorial, essentiel, maillage) uniquement sur la vue canonique.
  const showRich = page === 1 && !hasQuery && !hasRefine;

  // Date de relecture : override par spécialité (content.reviewed) sinon constante globale.
  const reviewedIso = content.reviewed ?? CONTENT_REVIEWED;
  const reviewedDisplay = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(reviewedIso));

  // Contenu city-aware. Les spécialités à fort trafic configurées (médecine générale,
  // cardiologie, pédiatrie…) reçoivent un lead contextualisé (tarif local + ancrage
  // géographique) et des FAQ propres à la ville → sortent la page du near-duplicate.
  // Les autres conservent le patron générique (lead + 1 FAQ « comment prendre RDV »).
  let lead: string;
  let faqs: { q: string; a: string }[];
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
        ...(total > 0 && {
          "mainEntity": {
            "@type": "ItemList",
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
          },
        }),
      },
      ...(showRich && faqs.length > 0 ? [{
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page-outer">

        {/* ── Fil d'Ariane (aligné sur le JSON-LD : Accueil → Spécialités → Spécialité → Ville) ── */}
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
        {showRich && content.essentiel && content.essentiel.length > 0 && (
          <EssentielBox
            facts={content.essentiel}
            total={total}
            countLabel={locale === "ar" ? `${t.doctorsInCity} ${cityName}` : `Praticiens à ${city.name}`}
            reviewedDisplay={reviewedDisplay}
            locale={locale}
          />
        )}

        {/* ── Recherche (nom) + tri + affinage (dispo · conventionné · langue) ── */}
        <div
          className="bg-white rounded-2xl border border-slate-200 p-4 mb-5"
          style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}
        >
          <ListingControls
            current={{ tri, dispo, conv, langue, ville: "", q: query }}
            showSearch
            languages={FILTERABLE_LANGUAGES}
            locale={locale}
            t={dict.filters}
          />
        </div>

        {/* ── Liste praticiens ──────────────────────── */}
        {doctors.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-8 h-8 text-primary-300" aria-hidden="true"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700 text-base">
              {hasRefine && !hasQuery
                ? t.noResultFilters
                : locale === "ar" ? "لا يوجد ممارس يطابق بحثك." : "Aucun praticien ne correspond à votre recherche."}
            </p>
            <Link
              href={`/specialites/${slug}/${ville}`}
              className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              {hasRefine && !hasQuery ? t.clearFilters : t.showAll}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="sr-only">
              {locale === "ar" ? `${specName} ${t.in} ${cityName}` : `${synonyme !== "spécialiste" ? synPlural : specialty.name} à ${city.name}`}
            </h2>
            {doctors.map((d, i) => (
              <PraticienCard key={d.id} praticien={d} priority={i === 0} hideSpecialty isPro={isProPlan(d.plan, d.planExpiresAt)} isFeatured={isFeaturedActive(d.featuredUntil)} canBookOnline={hasProAccess(d.plan, d.planExpiresAt, d.trialEndsAt)} slots={slotsByDoctor[d.id]} locale={locale} t={dict.card} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />

        {/* ── Contenu éditorial city-aware (FR + AR) ── */}
        {showRich && (
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
        )}

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
        {showRich && otherCities.length > 0 && (
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
