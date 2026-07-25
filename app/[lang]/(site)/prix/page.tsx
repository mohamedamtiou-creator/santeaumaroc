import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { examLocalized } from "@/lib/medical-exam";
import { HubHero } from "@/components/health/HubHero";

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
  const dict = getDictionary(locale);
  const t = dict.prix;
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

      <HubHero
        eyebrow={t.breadcrumb}
        title={t.title}
        intro={t.intro}
        chips={dict.healthHub}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
          <div className="min-w-0 space-y-10">

            {/* ── Consultations ── */}
            <section aria-labelledby="consult-title">
              <h2 id="consult-title" className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2.5" dir="auto">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v5a4 4 0 0 0 8 0V2M10 11v3a4 4 0 0 0 4 4 3 3 0 0 0 3-3v-1" /><circle cx="17" cy="12" r="1.5" /></svg>
                {t.consultTitle}
              </h2>
              <p className="text-sm text-slate-500 mb-4" dir="auto">{t.consultIntro}</p>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr><th className={thCls}>{t.colType}</th><th className={`${thCls} text-end`}>{t.colPrice}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CONSULT.map((c) => (
                      <tr key={c.fr} className="hover:bg-slate-50/70 transition-colors">
                        <td className={`${tdCls} font-medium text-slate-900`} dir="auto">{isAr ? c.ar : c.fr}</td>
                        <td className={`${tdCls} text-end font-bold text-primary-700 tabular-nums whitespace-nowrap`} dir="ltr">{c.price} MAD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Examens (données réelles MedicalExam) ── */}
            {examRows.length > 0 && (
              <section aria-labelledby="exams-title">
                <h2 id="exams-title" className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2.5" dir="auto">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h9l3 3v11H4z" /><path d="M13 3v3h3M7 10h6M7 13h4" /></svg>
                  {t.examsTitle}
                </h2>
                <p className="text-sm text-slate-500 mb-4" dir="auto">{t.examsIntro}</p>

                {/* Mobile : cartes empilées (le tableau large scrollerait mal) */}
                <ul className="sm:hidden space-y-2.5">
                  {examRows.map((e) => (
                    <li key={e.slug}>
                      <Link href={`/examens/${e.slug}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50">
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-slate-900 leading-snug" dir="auto">{e.name}</span>
                          <span className="shrink-0 font-bold text-primary-700 tabular-nums whitespace-nowrap" dir="ltr">{e.price}</span>
                        </div>
                        {e.reimbursement && (
                          <p className="text-xs text-slate-500 mt-1.5" dir="auto">
                            <span className="font-semibold text-slate-600">{t.colReimbursement} :</span> {e.reimbursement}
                          </p>
                        )}
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
                          {t.seeSheet}
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Desktop : tableau */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                      <tr>
                        <th className={thCls}>{t.colExam}</th>
                        <th className={`${thCls} text-end`}>{t.colPrice}</th>
                        <th className={thCls}>{t.colReimbursement}</th>
                        <th className={thCls} aria-label="" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {examRows.map((e) => (
                        <tr key={e.slug} className="hover:bg-slate-50 transition-colors">
                          <td className={`${tdCls} font-medium text-slate-900`} dir="auto">{e.name}</td>
                          <td className={`${tdCls} text-end font-bold text-primary-700 tabular-nums whitespace-nowrap`} dir="ltr">{e.price}</td>
                          <td className={`${tdCls} text-slate-500`} dir="auto">{e.reimbursement ?? "—"}</td>
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
              <Link href="/remboursement-amo-cnss" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                {t.reimbursementTitle}
              </Link>
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

            {/* CTA conversion — visible mobile (l'aside sticky prend le relais en desktop) */}
            <Link href="/praticiens" className="lg:hidden btn-primary w-full">
              {dict.healthHub.findDoctor}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed" dir="auto">{t.disclaimer}</p>
          </div>

          {/* ── Aside de conversion (desktop) ── */}
          <aside className="hidden lg:block" aria-label={dict.healthHub.consultTitle}>
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary-600 ring-1 ring-primary-100 mb-3" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="7" r="4" /><path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7" /></svg>
                </span>
                <h2 className="font-bold text-slate-900 text-lg leading-snug">{dict.healthHub.consultTitle}</h2>
                <p className="text-sm text-slate-500 mt-1 mb-4">{dict.healthHub.consultSubtitle}</p>
                <Link href="/praticiens" className="btn-primary w-full">
                  {dict.healthHub.findDoctor}
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
