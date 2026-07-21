import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { examLocalized } from "@/lib/medical-exam";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/prix";

// Repères de consultation : fourchettes éditoriales indicatives (secteur privé,
// Maroc). Aucune donnée par praticien en base → pas de grille par ville (éviterait
// du contenu dupliqué). Ces repères sont volontairement nationaux et disclaimer.
const CONSULT: { fr: string; ar: string; price: string }[] = [
  { fr: "Médecine générale", ar: "الطب العام", price: "100 – 250" },
  { fr: "Consultation spécialiste", ar: "استشارة أخصائي", price: "200 – 500" },
  { fr: "Consultation dentaire", ar: "استشارة الأسنان", price: "150 – 400" },
  { fr: "Psychiatrie / psychologie", ar: "الطب النفسي", price: "250 – 600" },
];

function formatPrice(min: number | null, max: number | null): string | null {
  if (min && max) return `${min} – ${max} MAD`;
  if (min) return `${min} MAD`;
  if (max) return `${max} MAD`;
  return null;
}

const getExams = () =>
  prisma.medicalExam.findMany({
    where: { status: "PUBLISHED", OR: [{ priceMin: { not: null } }, { priceMax: { not: null } }] },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      slug: true, name: true, priceMin: true, priceMax: true, reimbursement: true,
      nameAr: true, reimbursementAr: true, arReviewedAt: true,
      // champs requis par examLocalized (non affichés)
      shortAnswer: true, indications: true, procedure: true, preparation: true, precautions: true,
      faqJson: true, sources: true,
      shortAnswerAr: true, indicationsAr: true, procedureAr: true, preparationAr: true, precautionsAr: true,
      faqJsonAr: true, sourcesAr: true,
    },
  });

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).prix;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: localizedAlternates(PATH, locale),
    openGraph: { title: t.metaTitle, description: t.metaDesc, url: PATH, type: "website", locale: locale === "ar" ? "ar_MA" : "fr_MA" },
    twitter: { card: "summary", title: t.metaTitle, description: t.metaDesc },
  };
}

export default async function PrixPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const t = getDictionary(locale).prix;
  const isAr = locale === "ar";
  const exams = await getExams();

  const examRows = exams
    .map((e) => {
      const L = examLocalized(e, locale);
      return { slug: e.slug, name: L.name, price: formatPrice(e.priceMin, e.priceMax), reimbursement: L.reimbursement };
    })
    .filter((r) => r.price);

  const url = `${isAr ? `${BASE}/ar` : BASE}${PATH}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": t.metaTitle,
        "description": t.metaDesc,
        "inLanguage": isAr ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}#website` },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": isAr ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": url },
        ],
      },
    ],
  };

  const thCls = "text-start px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500";
  const tdCls = "px-4 py-3 text-sm text-slate-700";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="hero-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20">
          <p className="section-eyebrow text-secondary-300 mb-4">{t.breadcrumb}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 tracking-tight" dir="auto">{t.title}</h1>
          <p className="text-white/75 text-lg leading-relaxed" dir="auto">{t.intro}</p>
        </div>
      </div>

      <main className="page-outer">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* ── Consultations ── */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-1" dir="auto">{t.consultTitle}</h2>
            <p className="text-sm text-slate-500 mb-4" dir="auto">{t.consultIntro}</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[420px] border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr><th className={thCls}>{t.colType}</th><th className={`${thCls} text-end`}>{t.colPrice}</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CONSULT.map((c) => (
                    <tr key={c.fr}>
                      <td className={tdCls} dir="auto">{isAr ? c.ar : c.fr}</td>
                      <td className={`${tdCls} text-end font-semibold tabular-nums whitespace-nowrap`} dir="ltr">{c.price} MAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Examens (données réelles MedicalExam) ── */}
          {examRows.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-1" dir="auto">{t.examsTitle}</h2>
              <p className="text-sm text-slate-500 mb-4" dir="auto">{t.examsIntro}</p>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className={thCls}>{t.colExam}</th>
                      <th className={`${thCls} text-end`}>{t.colPrice}</th>
                      <th className={`${thCls} hidden sm:table-cell`}>{t.colReimbursement}</th>
                      <th className={thCls} aria-label="" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {examRows.map((e) => (
                      <tr key={e.slug} className="hover:bg-slate-50 transition-colors">
                        <td className={`${tdCls} font-medium text-slate-900`} dir="auto">{e.name}</td>
                        <td className={`${tdCls} text-end font-semibold tabular-nums whitespace-nowrap`} dir="ltr">{e.price}</td>
                        <td className={`${tdCls} hidden sm:table-cell text-slate-500`} dir="auto">{e.reimbursement ?? "—"}</td>
                        <td className={`${tdCls} text-end`}>
                          <Link href={`/examens/${e.slug}`} className="text-primary-600 hover:text-primary-800 font-medium text-xs whitespace-nowrap">{t.seeSheet} →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Remboursement ── */}
          <section className="rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2" dir="auto">{t.reimbursementTitle}</h2>
            <p className="text-sm text-slate-700 leading-relaxed" dir="auto">{t.reimbursementText}</p>
          </section>

          {/* ── Médicaments ── */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2" dir="auto">{t.medicamentsTitle}</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3" dir="auto">{t.medicamentsText}</p>
            <Link href="/medicaments" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
              {t.medicamentsCta}
            </Link>
          </section>

          <p className="text-xs text-slate-400 leading-relaxed" dir="auto">{t.disclaimer}</p>
        </div>
      </main>
    </>
  );
}
