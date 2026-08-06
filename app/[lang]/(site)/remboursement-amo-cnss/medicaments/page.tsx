import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates } from "@/lib/hreflang";
import { toLocale } from "@/lib/i18n";
import {
  MED_HUB_PATH,
  getEcartsDeBase,
  getMedLetterBuckets,
  getRemboursementStats,
} from "@/lib/medicament-remboursement";
import { MedAlphaNav } from "@/components/remboursement/MedAlphaNav";

/**
 * Hub « remboursement des médicaments ».
 *
 * Contrairement au reste du silo prix, TOUT ce qui est affiché ici vient du
 * référentiel public du médicament (base de remboursement, taux, PPV) et non
 * d'une estimation éditoriale : aucune réserve de sourcing à porter.
 */

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

export const revalidate = 604800; // TTL.STATIC

const COPY = {
  fr: {
    crumbHome: "Accueil",
    crumbParent: "Remboursement AMO / CNSS",
    crumb: "Médicaments",
    title: "Remboursement des médicaments au Maroc",
    metaTitle: "Médicaments remboursés au Maroc : taux, base de remboursement et prix",
    metaDesc:
      "Le taux de remboursement, la base de remboursement et le prix public de vente de plus de 5 900 médicaments commercialisés au Maroc. Découvrez lesquels laissent un reste à charge.",
    intro:
      "Pour chaque médicament commercialisé au Maroc, l'assurance maladie fixe une base de remboursement. Le taux s'applique à cette base, et non au prix payé en pharmacie. Quand le prix de vente dépasse la base, la différence reste intégralement à votre charge — en plus du ticket modérateur.",
    statTotal: "médicaments référencés",
    statRembourses: "remboursables à 70 %",
    statNon: "non remboursables",
    statEcart: "avec un supplément à payer",
    gapTitle: "Les médicaments qui coûtent plus que leur base de remboursement",
    gapIntro:
      "Sur ces médicaments, le prix public de vente dépasse la base sur laquelle l'assurance calcule votre remboursement. L'écart ci-dessous s'ajoute au ticket modérateur : c'est un surcoût que la plupart des patients découvrent au comptoir.",
    colMed: "Médicament",
    colDci: "DCI",
    colPpv: "Prix de vente",
    colBase: "Base de remboursement",
    colGap: "Supplément",
    gapNote: (n: number, shown: number) =>
      `${shown} médicaments affichés sur les ${n.toLocaleString("fr")} concernés, du plus gros écart au plus faible.`,
    howTitle: "Comment lire ces montants",
    how: [
      "La base de remboursement est un montant administratif : c'est l'assiette de calcul, pas un prix.",
      "Le taux de 70 % s'applique à cette base. Sur une base de 100 MAD, l'assurance rembourse 70 MAD.",
      "Le ticket modérateur est la part qui reste à votre charge dans la limite de la base.",
      "Si le prix de vente dépasse la base, ce dépassement s'ajoute au ticket modérateur et n'est jamais remboursé.",
    ],
    indexTitle: "Tous les médicaments, de A à Z",
    backGuide: "Retour au guide du remboursement AMO / CNSS",
    seeMed: "Voir la fiche",
  },
  ar: {
    crumbHome: "الرئيسية",
    crumbParent: "التعويض AMO / CNSS",
    crumb: "الأدوية",
    title: "تعويض الأدوية بالمغرب",
    metaTitle: "الأدوية المعوَّضة بالمغرب: النسبة، أساس التعويض والسعر",
    metaDesc:
      "نسبة التعويض وأساس التعويض والسعر العمومي للبيع لأكثر من 5900 دواء مسوَّق بالمغرب، مع الأدوية التي تترك مبلغاً على عاتق المريض.",
    intro:
      "لكل دواء مسوَّق بالمغرب، يحدّد التأمين الصحي أساساً للتعويض. تُطبَّق النسبة على هذا الأساس وليس على السعر المؤدى في الصيدلية. وعندما يتجاوز سعر البيع هذا الأساس، يبقى الفارق كاملاً على عاتقك.",
    statTotal: "دواء مُدرَج",
    statRembourses: "قابلة للتعويض بنسبة 70٪",
    statNon: "غير قابلة للتعويض",
    statEcart: "بمبلغ إضافي على عاتق المريض",
    gapTitle: "أدوية سعرها أعلى من أساس تعويضها",
    gapIntro:
      "في هذه الأدوية، يتجاوز السعر العمومي للبيع الأساس الذي يُحتسب عليه التعويض. يُضاف هذا الفارق إلى الحصة المتبقية على عاتقك.",
    colMed: "الدواء",
    colDci: "التسمية الدولية",
    colPpv: "سعر البيع",
    colBase: "أساس التعويض",
    colGap: "المبلغ الإضافي",
    gapNote: (n: number, shown: number) => `${shown} دواء معروض من أصل ${n.toLocaleString("fr")}، من الأكبر فارقاً إلى الأصغر.`,
    howTitle: "كيف تقرأ هذه المبالغ",
    how: [
      "أساس التعويض مبلغ إداري: هو وعاء الاحتساب وليس سعراً.",
      "تُطبَّق نسبة 70٪ على هذا الأساس. على أساس 100 درهم، يعوّض التأمين 70 درهماً.",
      "الحصة المتبقية هي ما يبقى على عاتقك في حدود الأساس.",
      "إذا تجاوز سعر البيع الأساس، يُضاف هذا التجاوز ولا يُعوَّض أبداً.",
    ],
    indexTitle: "كل الأدوية، من A إلى Z",
    backGuide: "العودة إلى دليل التعويض AMO / CNSS",
    seeMed: "عرض البطاقة",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = COPY[locale === "ar" ? "ar" : "fr"];
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: localizedAlternates(MED_HUB_PATH, locale),
    openGraph: {
      title: t.metaTitle,
      description: t.metaDesc,
      url: MED_HUB_PATH,
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

const MAD = (n: number) => n.toFixed(2);

export default async function MedicamentsRemboursementPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const isAr = locale === "ar";
  const t = COPY[isAr ? "ar" : "fr"];

  const [stats, ecarts, alpha] = await Promise.all([
    getRemboursementStats(),
    getEcartsDeBase(60),
    getMedLetterBuckets(),
  ]);

  const url = `${isAr ? `${BASE}/ar` : BASE}${MED_HUB_PATH}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": t.title,
        "description": t.metaDesc,
        "inLanguage": isAr ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}#website` },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": t.crumbHome, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.crumbParent, "item": `${BASE}/remboursement-amo-cnss` },
          { "@type": "ListItem", "position": 3, "name": t.crumb, "item": url },
        ],
      },
    ],
  };

  const thCls = "text-start px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500";
  const tdCls = "px-4 py-3 text-sm text-slate-700";

  const tiles = [
    { v: stats.total.toLocaleString("fr"), l: t.statTotal, cls: "text-slate-900" },
    { v: stats.rembourses.toLocaleString("fr"), l: t.statRembourses, cls: "text-secondary-700" },
    { v: stats.nonRembourses.toLocaleString("fr"), l: t.statNon, cls: "text-slate-600" },
    { v: stats.avecEcart.toLocaleString("fr"), l: t.statEcart, cls: "text-terra-600" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="page-outer">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap" aria-label={isAr ? "مسار التنقّل" : "Fil d'Ariane"}>
          <Link href="/" className="hover:text-primary-600 transition-colors">{t.crumbHome}</Link>
          <Chevron />
          <Link href="/remboursement-amo-cnss" className="hover:text-primary-600 transition-colors">{t.crumbParent}</Link>
          <Chevron />
          <span className="text-slate-600">{t.crumb}</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3" dir="auto">
          {t.title}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-6" dir="auto">{t.intro}</p>

        {/* ── Chiffres de tête ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {tiles.map((s) => (
            <div key={s.l} className="card p-4 flex flex-col">
              <span className={`text-2xl font-bold tabular-nums ${s.cls}`} dir="ltr">{s.v}</span>
              <span className="text-xs text-slate-500 leading-snug mt-0.5" dir="auto">{s.l}</span>
            </div>
          ))}
        </div>

        {/* ── Comment lire ── */}
        <section className="rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6 mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-3" dir="auto">{t.howTitle}</h2>
          <ul className="space-y-2">
            {t.how.map((line) => (
              <li key={line} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed" dir="auto">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-3 h-3 text-primary-500 mt-1.5 shrink-0 rtl:-scale-x-100" aria-hidden="true"
                  strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Les écarts : l'information que personne d'autre ne publie ── */}
        {ecarts.length > 0 && (
          <section aria-labelledby="ecarts-title" className="mb-10">
            <h2 id="ecarts-title" className="text-xl font-bold text-slate-900 mb-1" dir="auto">{t.gapTitle}</h2>
            <p className="text-sm text-slate-500 mb-4 max-w-3xl leading-relaxed" dir="auto">{t.gapIntro}</p>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className={thCls}>{t.colMed}</th>
                    <th className={`${thCls} hidden sm:table-cell`}>{t.colDci}</th>
                    <th className={`${thCls} text-end`}>{t.colPpv}</th>
                    <th className={`${thCls} text-end`}>{t.colBase}</th>
                    <th className={`${thCls} text-end`}>{t.colGap}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ecarts.map((m) => (
                    <tr key={m.slug} className="hover:bg-slate-50 transition-colors">
                      <td className={`${tdCls} font-medium text-slate-900`} dir="auto">
                        <Link href={`/medicaments/${m.slug}`} className="hover:text-primary-700 transition-colors">
                          {m.nom}
                        </Link>
                      </td>
                      <td className={`${tdCls} hidden sm:table-cell text-slate-500 text-xs`} dir="auto">{m.dci ?? "—"}</td>
                      <td className={`${tdCls} text-end tabular-nums whitespace-nowrap`} dir="ltr">{MAD(m.ppv)}</td>
                      <td className={`${tdCls} text-end tabular-nums whitespace-nowrap text-slate-500`} dir="ltr">{MAD(m.base)}</td>
                      <td className={`${tdCls} text-end tabular-nums whitespace-nowrap font-bold text-terra-600`} dir="ltr">
                        +{MAD(m.ecart)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-2" dir="auto">{t.gapNote(stats.avecEcart, ecarts.length)}</p>
          </section>
        )}

        {/* ── Index A–Z : le chemin de crawl des 5 916 fiches ── */}
        <MedAlphaNav buckets={alpha.buckets} locale={locale} title={t.indexTitle} />

        <div className="mt-10 pt-6 border-t border-slate-100">
          <Link href="/remboursement-amo-cnss" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-700 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-3.5 h-3.5 shrink-0 rtl:-scale-x-100" aria-hidden="true">
              <path d="m10 3-5 5 5 5" strokeLinecap="round" />
            </svg>
            {t.backGuide}
          </Link>
        </div>
      </div>
    </>
  );
}
