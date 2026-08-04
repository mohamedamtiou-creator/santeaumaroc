import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale, type Locale } from "@/lib/i18n";
import { MedAlphaNav } from "@/components/remboursement/MedAlphaNav";
import {
  MED_HUB_PATH,
  MED_INDEX_PAGE_SIZE,
  MED_MIN_INDEXABLE,
  MED_OTHER_SLUG,
  getMedByLetter,
  getMedLetterBuckets,
  medIndexPath,
  type MedLetterBucket,
} from "@/lib/medicament-remboursement";

/**
 * Index alphabétique du silo remboursement des médicaments.
 * `/remboursement-amo-cnss/medicaments/a` et `…/a/2`.
 *
 * Page de NAVIGATION chiffrée : chaque ligne porte prix, base de remboursement,
 * taux et supplément éventuel. C'est ce qui donne aux 5 916 fiches un chemin de
 * lien HTML — la leçon du chantier crawl, appliquée dès la conception.
 */

type Params = Promise<{ lang: string; seg: string[] }>;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export const revalidate = 86400;

const COPY = {
  fr: {
    crumbHome: "Accueil",
    crumbParent: "Remboursement AMO / CNSS",
    crumbHub: "Médicaments",
    heading: (l: string) => `Médicaments en ${l} — remboursement et prix`,
    headingOther: "Médicaments commençant par un chiffre — remboursement et prix",
    pageSuffix: (p: number) => `page ${p}`,
    count: (n: number, l: string) =>
      `${n.toLocaleString("fr")} médicament${n > 1 ? "s" : ""} dont le nom commence par ${l}`,
    lead: (l: string) =>
      `Prix public de vente, base de remboursement et taux appliqué pour les médicaments commercialisés au Maroc dont le nom commence par ${l}. Un supplément signalé signifie que le prix dépasse la base : la différence reste à votre charge.`,
    colMed: "Médicament",
    colDci: "DCI",
    colPpv: "Prix",
    colBase: "Base",
    colTaux: "Taux",
    colGap: "Supplément",
    indexTitle: "Toutes les lettres",
    backHub: "Retour au remboursement des médicaments",
    none: "Non remboursable",
  },
  ar: {
    crumbHome: "الرئيسية",
    crumbParent: "التعويض AMO / CNSS",
    crumbHub: "الأدوية",
    heading: (l: string) => `أدوية بحرف ${l} — التعويض والأسعار`,
    headingOther: "أدوية تبدأ برقم — التعويض والأسعار",
    pageSuffix: (p: number) => `صفحة ${p}`,
    count: (n: number, l: string) => `${n.toLocaleString("fr")} دواء يبدأ اسمه بحرف ${l}`,
    lead: (l: string) =>
      `السعر العمومي للبيع وأساس التعويض والنسبة المطبَّقة للأدوية المسوَّقة بالمغرب التي يبدأ اسمها بحرف ${l}. المبلغ الإضافي يعني أن السعر يتجاوز الأساس ويبقى الفارق على عاتقك.`,
    colMed: "الدواء",
    colDci: "التسمية الدولية",
    colPpv: "السعر",
    colBase: "الأساس",
    colTaux: "النسبة",
    colGap: "إضافي",
    indexTitle: "كل الحروف",
    backHub: "العودة إلى تعويض الأدوية",
    none: "غير قابل للتعويض",
  },
} as const;

type Resolved = { bucket: MedLetterBucket; page: number; buckets: MedLetterBucket[] };

/** null pour toute URL qui ne doit pas exister (dont `/a/1`, doublon de `/a`). */
async function resolve(seg: string[]): Promise<Resolved | null> {
  if (seg.length < 1 || seg.length > 2) return null;

  const letterSlug = (seg[0] ?? "").toLowerCase();
  if (!/^[a-z]$/.test(letterSlug) && letterSlug !== MED_OTHER_SLUG) return null;

  let page = 1;
  if (seg.length === 2) {
    if (!/^[0-9]{1,3}$/.test(seg[1])) return null;
    page = Number(seg[1]);
    if (page < 2) return null;
  }

  const { buckets } = await getMedLetterBuckets();
  const bucket = buckets.find((b) => b.slug === letterSlug);
  if (!bucket || page > bucket.pages) return null;

  return { bucket, page, buckets };
}

export async function generateStaticParams() {
  const { buckets } = await getMedLetterBuckets();
  const params: { seg: string[] }[] = [];
  for (const b of buckets) {
    params.push({ seg: [b.slug] });
    for (let p = 2; p <= b.pages; p++) params.push({ seg: [b.slug, String(p)] });
  }
  return params;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, seg } = await params;
  const locale = toLocale(lang);
  const r = await resolve(seg);
  if (!r) return { title: "Page introuvable", robots: { index: false } };

  const t = COPY[locale === "ar" ? "ar" : "fr"];
  const isOther = r.bucket.slug === MED_OTHER_SLUG;
  const heading = isOther ? t.headingOther : t.heading(r.bucket.letter);
  const title = r.page > 1 ? `${heading} (${t.pageSuffix(r.page)})` : heading;
  const canonical = medIndexPath(r.bucket.slug, r.page);

  return {
    title,
    description: t.lead(r.bucket.letter),
    // Même règle que l'index des villes : une lettre trop peu fournie reste
    // crawlée et suivie, mais n'entre pas à l'index.
    robots: r.bucket.count >= MED_MIN_INDEXABLE ? { index: true, follow: true } : { index: false, follow: true },
    alternates: localizedAlternates(canonical, locale),
    openGraph: {
      title: `${title} | SantéauMaroc`,
      description: t.lead(r.bucket.letter),
      url: canonical,
      type: "website",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
  };
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-3.5 h-3.5 text-slate-300 shrink-0 rtl:-scale-x-100" aria-hidden="true">
      <path d="m6 3 5 5-5 5" strokeLinecap="round" />
    </svg>
  );
}

const MAD = (n: number | null) => (n == null ? "—" : n.toFixed(2));

export default async function MedicamentsLettrePage({ params }: { params: Params }) {
  const { lang, seg } = await params;
  const locale: Locale = toLocale(lang);
  const isAr = locale === "ar";
  const r = await resolve(seg);
  if (!r) notFound();

  const { rows } = await getMedByLetter(r.bucket.slug, r.page);
  if (rows.length === 0) notFound();

  const t = COPY[isAr ? "ar" : "fr"];
  const isOther = r.bucket.slug === MED_OTHER_SLUG;
  const heading = isOther ? t.headingOther : t.heading(r.bucket.letter);
  const canonical = medIndexPath(r.bucket.slug, r.page);
  const from = (r.page - 1) * MED_INDEX_PAGE_SIZE + 1;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${BASE}${canonical}#page`,
        "name": heading,
        "url": `${BASE}${canonical}`,
        "description": t.lead(r.bucket.letter),
        "inLanguage": isAr ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "url": BASE },
        "mainEntity": { "@id": `${BASE}${canonical}#list` },
      },
      {
        "@type": "ItemList",
        "@id": `${BASE}${canonical}#list`,
        "numberOfItems": r.bucket.count,
        "itemListElement": rows.map((m, i) => ({
          "@type": "ListItem",
          "position": from + i,
          "url": `${BASE}/medicaments/${m.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.crumbHome, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.crumbParent, "item": `${BASE}/remboursement-amo-cnss` },
          { "@type": "ListItem", "position": 3, "name": t.crumbHub, "item": `${BASE}${MED_HUB_PATH}` },
          { "@type": "ListItem", "position": 4, "name": r.bucket.letter, "item": `${BASE}${canonical}` },
        ],
      },
    ],
  };

  const thCls = "text-start px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500";
  const tdCls = "px-3 py-2.5 text-sm text-slate-700";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="page-outer">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap" aria-label={isAr ? "مسار التنقّل" : "Fil d'Ariane"}>
          <Link href="/" className="hover:text-primary-600 transition-colors">{t.crumbHome}</Link>
          <Chevron />
          <Link href="/remboursement-amo-cnss" className="hover:text-primary-600 transition-colors">{t.crumbParent}</Link>
          <Chevron />
          <Link href={MED_HUB_PATH} className="hover:text-primary-600 transition-colors">{t.crumbHub}</Link>
          <Chevron />
          <span className="text-slate-600">
            {r.bucket.letter}{r.page > 1 ? ` · ${t.pageSuffix(r.page)}` : ""}
          </span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight" dir="auto">
          {heading}
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 mb-4" dir="auto">{t.count(r.bucket.count, r.bucket.letter)}</p>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-6" dir="auto">{t.lead(r.bucket.letter)}</p>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className={thCls}>{t.colMed}</th>
                <th className={`${thCls} hidden md:table-cell`}>{t.colDci}</th>
                <th className={`${thCls} text-end`}>{t.colPpv}</th>
                <th className={`${thCls} text-end`}>{t.colBase}</th>
                <th className={`${thCls} text-end`}>{t.colTaux}</th>
                <th className={`${thCls} text-end`}>{t.colGap}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((m) => (
                <tr key={m.slug} className="hover:bg-slate-50 transition-colors">
                  <td className={`${tdCls} font-medium text-slate-900`} dir="auto">
                    <Link href={`/medicaments/${m.slug}`} className="hover:text-primary-700 transition-colors">
                      {m.nom}
                    </Link>
                    {(m.dosage || m.forme) && (
                      <span className="block md:hidden text-xs text-slate-400">
                        {[m.dosage, m.forme].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className={`${tdCls} hidden md:table-cell text-xs text-slate-500`} dir="auto">{m.dci ?? "—"}</td>
                  <td className={`${tdCls} text-end tabular-nums whitespace-nowrap`} dir="ltr">{MAD(m.ppv)}</td>
                  <td className={`${tdCls} text-end tabular-nums whitespace-nowrap text-slate-500`} dir="ltr">{MAD(m.base)}</td>
                  <td className={`${tdCls} text-end whitespace-nowrap`} dir="ltr">
                    {m.taux === "0%" || !m.taux ? (
                      <span className="text-xs text-slate-400" dir="auto">{t.none}</span>
                    ) : (
                      <span className="font-semibold text-secondary-700 tabular-nums">{m.taux}</span>
                    )}
                  </td>
                  <td className={`${tdCls} text-end tabular-nums whitespace-nowrap`} dir="ltr">
                    {m.ecart != null ? <span className="font-bold text-terra-600">+{MAD(m.ecart)}</span> : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100">
          <MedAlphaNav
            buckets={r.buckets}
            locale={locale}
            title={t.indexTitle}
            activeLetter={r.bucket.slug}
            activePage={r.page}
          />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link href={MED_HUB_PATH} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-3.5 h-3.5 shrink-0 rtl:-scale-x-100" aria-hidden="true">
              <path d="m10 3-5 5 5 5" strokeLinecap="round" />
            </svg>
            {t.backHub}
          </Link>
        </div>
      </div>
    </>
  );
}
