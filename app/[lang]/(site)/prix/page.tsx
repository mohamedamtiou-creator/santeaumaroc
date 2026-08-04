import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { examLocalized } from "@/lib/medical-exam";
import { HubHero } from "@/components/health/HubHero";
import {
  CONSULTATIONS,
  TAUX_REMBOURSEMENT,
  estPubliable,
  formatMontant,
  mentionReserve,
} from "@/lib/prix-reference";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const PATH = "/prix";

// Les montants de consultation viennent désormais de lib/prix-reference.ts —
// source de vérité unique, chaque montant portant son registre (TNR officiel vs
// honoraires libres), sa source et son statut de validation. Ils n'ont plus le
// droit d'être codés en dur ici : c'est ce qui produisait des écarts avec les
// tables de specialty-content et le corpus blog.

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

  // Bornes numériques pour le balisage (examRows ne porte que du texte formaté).
  const examRowsLd = exams
    .filter((e) => e.priceMin != null || e.priceMax != null)
    .map((e) => ({ slug: e.slug, name: examLocalized(e, locale).name, min: e.priceMin, max: e.priceMax }));

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
      // Balisage des prix : sans lui, aucun moteur ne lit ces montants comme des
      // prix — c'était le cas de TOUT le contenu santé (PriceSpecification
      // n'existait que sur les pages d'offres commerciales du site).
      // Un ItemList de MedicalProcedure, chacun portant son PriceSpecification.
      {
        "@type": "ItemList",
        "@id": `${url}#tarifs`,
        "name": t.consultTitle,
        "itemListElement": [
          ...CONSULTATIONS.filter((a) => estPubliable(a.prive)).map((a, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "MedicalProcedure",
              "name": isAr ? a.labelAr : a.labelFr,
              "offers": {
                "@type": "Offer",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "priceCurrency": "MAD",
                  ...(a.prive!.min != null ? { "minPrice": a.prive!.min } : {}),
                  ...(a.prive!.max != null ? { "maxPrice": a.prive!.max } : {}),
                  "valueAddedTaxIncluded": true,
                },
              },
            },
          })),
          ...examRowsLd.map((e, i) => ({
            "@type": "ListItem",
            "position": CONSULTATIONS.length + i + 1,
            "item": {
              "@type": "MedicalProcedure",
              "name": e.name,
              "url": `${isAr ? `${BASE}/ar` : BASE}/examens/${e.slug}`,
              "offers": {
                "@type": "Offer",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "priceCurrency": "MAD",
                  ...(e.min != null ? { "minPrice": e.min } : {}),
                  ...(e.max != null ? { "maxPrice": e.max } : {}),
                  "valueAddedTaxIncluded": true,
                },
              },
            },
          })),
        ],
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

              {/* Deux registres, deux colonnes, jamais confondus : la base de
                  remboursement officielle (TNR) n'est PAS le prix payé au cabinet.
                  C'est la distinction que le patient doit lire pour anticiper son
                  reste à charge. */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className={thCls}>{t.colType}</th>
                      <th className={`${thCls} text-end`}>{isAr ? "أساس التعويض" : "Base de remboursement"}</th>
                      <th className={`${thCls} text-end`}>{isAr ? "القطاع الخاص" : "Secteur privé"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CONSULTATIONS.map((acte) => {
                      const tnr = formatMontant(acte.tnr, isAr ? "ar" : "fr");
                      const prive = formatMontant(acte.prive, isAr ? "ar" : "fr");
                      return (
                        <tr key={acte.slug} className="hover:bg-slate-50/70 transition-colors align-baseline">
                          <td className={`${tdCls} font-medium text-slate-900`} dir="auto">
                            {isAr ? acte.labelAr : acte.labelFr}
                          </td>
                          <td className={`${tdCls} text-end tabular-nums whitespace-nowrap`} dir="ltr">
                            {tnr ? (
                              <>
                                <span className="font-bold text-secondary-700">{tnr}</span>
                                {acte.tnr?.revisionEnCours && (
                                  <span className="block text-[11px] font-normal text-terra-600 text-end" dir="auto">
                                    {isAr ? "قيد المراجعة" : "en révision"}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className={`${tdCls} text-end font-bold text-primary-700 tabular-nums whitespace-nowrap`} dir="ltr">
                            {prive ?? <span className="font-normal text-slate-400">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Réserves : obligatoires sous tout montant non validé (YMYL). */}
              <ul className="mt-3 space-y-1">
                {[
                  CONSULTATIONS.find((a) => a.tnr)?.tnr,
                  CONSULTATIONS.find((a) => a.prive)?.prive,
                ]
                  .filter((m) => !!m)
                  .map((m) => (
                    <li key={m!.registre} className="text-xs text-slate-500 leading-relaxed" dir="auto">
                      {mentionReserve(m!, isAr ? "ar" : "fr")}
                    </li>
                  ))}
                <li className="text-xs text-slate-500 leading-relaxed" dir="auto">
                  {isAr
                    ? `نسبة التعويض في التطبيب الخارجي بين ${TAUX_REMBOURSEMENT.ambulatoireMin} و ${TAUX_REMBOURSEMENT.ambulatoireMax} بالمائة من الأساس المرجعي، وتصل إلى ${TAUX_REMBOURSEMENT.hospitalisation} بالمائة عند الاستشفاء.`
                    : `Le remboursement en ambulatoire se situe entre ${TAUX_REMBOURSEMENT.ambulatoireMin} et ${TAUX_REMBOURSEMENT.ambulatoireMax} % de la base de référence, et jusqu'à ${TAUX_REMBOURSEMENT.hospitalisation} % en hospitalisation. Le taux exact dépend de votre régime.`}
                </li>
              </ul>
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
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {/* Le silo remboursement est la donnée la plus solide du lot :
                    référentiel public du médicament, pas estimation éditoriale. */}
                <Link href="/remboursement-amo-cnss/medicaments" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                  {isAr ? "تعويض الأدوية: النسب والأسعار" : "Remboursement des médicaments : taux et prix"}
                </Link>
                <Link href="/medicaments" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-800">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                  {t.medicamentsCta}
                </Link>
              </div>
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
