import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { AlphaIndexNav } from "@/components/villes/AlphaIndexNav";
import { CityIcon } from "@/components/CityIcon";
import { cachedQuery } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import {
  ALPHA_INDEX_PAGE_SIZE,
  ALPHA_MIN_INDEXABLE,
  alphaIndexPath,
  getAlphaIndexCities,
  getCityLetterBuckets,
  getCityLetterDoctors,
  type LetterBucket,
} from "@/lib/city-alpha-index";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale, type Locale } from "@/lib/i18n";
import { tCity } from "@/lib/specialty-i18n";

/**
 * Index alphabétique d'une ville — `/villes/casablanca/annuaire/b[/2]`.
 *
 * Page de NAVIGATION, pas de listing : des liens compacts, pas de cartes. Son
 * rôle est de donner à chaque fiche un chemin de lien HTML depuis la page ville,
 * là où la pagination client n'en fournit aucun (cf. lib/city-alpha-index.ts).
 */

type Params = Promise<{ lang: string; slug: string; seg: string[] }>;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export const revalidate = 3600;

const COPY = {
  fr: {
    home: "Accueil",
    cities: "Villes",
    breadcrumbAria: "Fil d'Ariane",
    index: "Annuaire A–Z",
    letterHeading: (letter: string, city: string) => `Praticiens à ${city} — noms en ${letter}`,
    pageSuffix: (p: number) => `page ${p}`,
    countLine: (n: number, letter: string) =>
      `${n.toLocaleString("fr")} praticien${n > 1 ? "s" : ""} dont le nom commence par ${letter}`,
    showing: (from: number, to: number, total: number) =>
      `Praticiens ${from} à ${to} sur ${total.toLocaleString("fr")}`,
    backToCity: (city: string) => `Tous les praticiens à ${city}`,
    lead: (city: string, letter: string) =>
      `Liste complète des praticiens référencés à ${city} dont le nom de famille commence par la lettre ${letter}. Cliquez sur un nom pour consulter la fiche : spécialité, adresse, avis patients et prise de rendez-vous.`,
  },
  ar: {
    home: "الرئيسية",
    cities: "المدن",
    breadcrumbAria: "مسار التنقّل",
    index: "الدليل أ–ي",
    letterHeading: (letter: string, city: string) => `أطباء في ${city} — أسماء بحرف ${letter}`,
    pageSuffix: (p: number) => `صفحة ${p}`,
    countLine: (n: number, letter: string) => `${n.toLocaleString("fr")} طبيبًا يبدأ اسمهم بحرف ${letter}`,
    showing: (from: number, to: number, total: number) => `الأطباء من ${from} إلى ${to} من ${total.toLocaleString("fr")}`,
    backToCity: (city: string) => `كل الأطباء في ${city}`,
    lead: (city: string, letter: string) =>
      `القائمة الكاملة للأطباء المُدرَجين في ${city} والذين يبدأ اسمهم العائلي بحرف ${letter}. انقر على اسم للاطّلاع على الملف: التخصص، العنوان، آراء المرضى وحجز الموعد.`,
  },
} as const;

/* ── Résolution & validation des paramètres ──────────────────────────────── */

type Resolved = {
  citySlug: string;
  cityName: string;
  letter: string;
  letterSlug: string;
  page: number;
  bucket: LetterBucket;
  buckets: LetterBucket[];
};

function getCity(slug: string) {
  return cachedQuery(`ville:meta:${slug}`, 3600, () => prisma.city.findUnique({ where: { slug } }));
}

/**
 * Renvoie null pour toute URL qui ne doit pas exister — ville hors périmètre,
 * lettre inconnue, page hors bornes, ou `/b/1` (doublon de `/b`, dont la page 1
 * est servie à l'URL nue pour garder UNE seule URL canonique par lettre).
 */
async function resolve(citySlug: string, seg: string[]): Promise<Resolved | null> {
  if (seg.length < 1 || seg.length > 2) return null;

  const letterSlug = seg[0]?.toLowerCase() ?? "";
  if (!/^[a-z]$/.test(letterSlug)) return null;

  let page = 1;
  if (seg.length === 2) {
    if (!/^[0-9]{1,3}$/.test(seg[1])) return null;
    page = Number(seg[1]);
    if (page < 2) return null; // « /b/1 » n'existe pas : la page 1 est « /b »
  }

  const [city, eligible] = await Promise.all([getCity(citySlug), getAlphaIndexCities()]);
  if (!city) return null;
  if (!eligible.some((c) => c.slug === citySlug)) return null;

  const { buckets } = await getCityLetterBuckets(citySlug);
  const bucket = buckets.find((b) => b.slug === letterSlug);
  if (!bucket || page > bucket.pages) return null;

  return {
    citySlug,
    cityName: city.name,
    letter: bucket.letter,
    letterSlug,
    page,
    bucket,
    buckets,
  };
}

/* ── Prérendu : toutes les pages d'index des villes éligibles ───────────── */

export async function generateStaticParams() {
  const cities = await getAlphaIndexCities();
  const params: { slug: string; seg: string[] }[] = [];
  for (const city of cities) {
    const { buckets } = await getCityLetterBuckets(city.slug);
    for (const b of buckets) {
      params.push({ slug: city.slug, seg: [b.slug] });
      for (let p = 2; p <= b.pages; p++) params.push({ slug: city.slug, seg: [b.slug, String(p)] });
    }
  }
  return params;
}

/* ── Métadonnées ─────────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug, seg } = await params;
  const locale = toLocale(lang);
  const r = await resolve(slug, seg);
  if (!r) return { title: "Page introuvable", robots: { index: false } };

  const t = COPY[locale === "ar" ? "ar" : "fr"];
  const cityName = tCity(r.cityName, locale);
  const heading = t.letterHeading(r.letter, cityName);
  const title = r.page > 1 ? `${heading} (${t.pageSuffix(r.page)})` : heading;
  const description = t.lead(cityName, r.letter);
  const canonical = alphaIndexPath(r.citySlug, r.letterSlug, r.page);

  // Une lettre trop peu fournie ne mérite pas l'index — mais reste crawlée et
  // suivie, pour que la découverte des fiches soit préservée.
  const indexable = r.bucket.count >= ALPHA_MIN_INDEXABLE;

  return {
    title,
    description,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: localizedAlternates(canonical, locale),
    openGraph: {
      title: `${title} | SantéauMaroc`,
      description,
      url: canonical,
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
  };
}

/* ── Page ────────────────────────────────────────────────────────────────── */

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
      <path d="m6 3 5 5-5 5" strokeLinecap="round" />
    </svg>
  );
}

export default async function AnnuaireLettrePage({ params }: { params: Params }) {
  const { lang, slug, seg } = await params;
  const locale: Locale = toLocale(lang);
  const r = await resolve(slug, seg);
  if (!r) notFound();

  const { entries } = await getCityLetterDoctors(r.citySlug, r.letter, r.page);
  if (entries.length === 0) notFound();

  const t = COPY[locale === "ar" ? "ar" : "fr"];
  const cityName = tCity(r.cityName, locale);
  const heading = t.letterHeading(r.letter, cityName);
  const from = (r.page - 1) * ALPHA_INDEX_PAGE_SIZE + 1;
  const to = from + entries.length - 1;
  const canonical = alphaIndexPath(r.citySlug, r.letterSlug, r.page);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${BASE}${canonical}#page`,
        "name": heading,
        "url": `${BASE}${canonical}`,
        "description": t.lead(cityName, r.letter),
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "url": BASE },
        "mainEntity": { "@id": `${BASE}${canonical}#list` },
      },
      // ListItem réduits à leur URL : la page porte déjà 300 liens, on ne
      // duplique pas chaque fiche en JSON-LD (poids inutile sur une page de
      // navigation). La fiche praticien porte son propre balisage Physician.
      {
        "@type": "ItemList",
        "@id": `${BASE}${canonical}#list`,
        "numberOfItems": r.bucket.count,
        "itemListElement": entries.map((e, i) => ({
          "@type": "ListItem",
          "position": from + i,
          "url": `${BASE}/praticiens/${e.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.home, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.cities, "item": `${BASE}/villes` },
          { "@type": "ListItem", "position": 3, "name": r.cityName, "item": `${BASE}/villes/${r.citySlug}` },
          { "@type": "ListItem", "position": 4, "name": r.letter, "item": `${BASE}${canonical}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="page-outer">

        {/* ── Fil d'Ariane ── */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap" aria-label={t.breadcrumbAria}>
          <Link href="/" className="hover:text-primary-600 transition-colors">{t.home}</Link>
          <Chevron />
          <Link href="/villes" className="hover:text-primary-600 transition-colors">{t.cities}</Link>
          <Chevron />
          <Link href={`/villes/${r.citySlug}`} className="hover:text-primary-600 transition-colors">{cityName}</Link>
          <Chevron />
          <span className="text-slate-600">
            {r.letter}{r.page > 1 ? ` · ${t.pageSuffix(r.page)}` : ""}
          </span>
        </nav>

        {/* ── En-tête ── */}
        <div className="card overflow-hidden p-0 mb-5">
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <CityIcon name={r.cityName} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="section-eyebrow mb-0.5">{t.index}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                  {heading}
                </h1>
                <p className="text-sm text-slate-500 mt-1.5">
                  {t.countLine(r.bucket.count, r.letter)}
                  {r.bucket.pages > 1 && <> · {t.showing(from, to, r.bucket.count)}</>}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-3xl">
          {t.lead(cityName, r.letter)}
        </p>

        {/* ── Liste de liens (le chemin de crawl) ── */}
        <ul className="grid gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3 border-t border-slate-100">
          {entries.map((e) => (
            <li key={e.slug} className="border-b border-slate-100">
              <Link
                href={`/praticiens/${e.slug}`}
                className="group flex flex-col py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
              >
                <span className="text-sm font-medium text-slate-800 group-hover:text-primary-700 transition-colors">
                  {e.name}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {e.specialty}
                  {e.adresse && <span className="text-slate-400"> · {e.adresse}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Barre A–Z : toutes les autres pages d'index à un clic ── */}
        <AlphaIndexNav
          citySlug={r.citySlug}
          cityName={cityName}
          buckets={r.buckets}
          locale={locale}
          activeLetter={r.letter}
          activePage={r.page}
        />

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link
            href={`/villes/${r.citySlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-3.5 h-3.5 shrink-0 rtl:-scale-x-100" aria-hidden="true">
              <path d="m10 3-5 5 5 5" strokeLinecap="round" />
            </svg>
            {t.backToCity(cityName)}
          </Link>
        </div>

      </div>
    </>
  );
}
