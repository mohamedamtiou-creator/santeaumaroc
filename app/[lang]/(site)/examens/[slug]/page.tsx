import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { examLocalized, isExamArReady, isExamReviewed, parseLines, parseFaq } from "@/lib/medical-exam";
import { parseSources, ArticleSources } from "@/components/blog/ArticleSources";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { EditorialReviewNote } from "@/components/health/EditorialReviewNote";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
type Params = Promise<{ lang: string; slug: string }>;

export async function generateStaticParams() {
  const exams = await prisma.medicalExam.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return exams.map((e) => ({ slug: e.slug }));
}

const getExam = cache((slug: string) =>
  prisma.medicalExam.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { specialty: { select: { slug: true, name: true } } },
  }),
);

function formatPrice(min: number | null, max: number | null): string | null {
  if (min && max) return `${min} – ${max} MAD`;
  if (min) return `${min} MAD`;
  if (max) return `${max} MAD`;
  return null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const exam = await getExam(slug);
  if (!exam) return { title: "Examen introuvable", robots: { index: false } };

  const locale = toLocale(lang);
  const L = examLocalized(exam, locale);
  const title = `${L.name} : déroulé, préparation et prix au Maroc`;
  const description = L.shortAnswer.slice(0, 160);
  const arReady = isExamArReady(exam);
  const indexable = isExamReviewed(exam) && (locale !== "ar" || arReady);

  return {
    title,
    description,
    alternates: arReady ? localizedAlternates(`/examens/${slug}`, locale) : frenchOnlyAlternates(`/examens/${slug}`),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title, description, url: `/examens/${slug}`, type: "article", locale: L.isArabic ? "ar_MA" : "fr_MA" },
  };
}

export default async function ExamPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const exam = await getExam(slug);
  if (!exam) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.exams;
  const tb = dict.blog;
  const L = examLocalized(exam, locale);

  const indications = parseLines(L.indications);
  const procedure = parseLines(L.procedure);
  const precautions = parseLines(L.precautions);
  const faqItems = parseFaq(L.faqJson);
  const sources = parseSources(L.sources);
  const priceStr = formatPrice(exam.priceMin, exam.priceMax);
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}/examens/${slug}`;

  const [relatedPosts, relatedTerms] = await Promise.all([
    exam.relatedSlugs.length
      ? prisma.post.findMany({ where: { slug: { in: exam.relatedSlugs }, status: "PUBLISHED" }, select: { slug: true, title: true } })
      : Promise.resolve([]),
    exam.glossarySlugs.length
      ? prisma.glossaryTerm.findMany({ where: { slug: { in: exam.glossarySlugs }, status: "PUBLISHED" }, select: { slug: true, term: true } })
      : Promise.resolve([]),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": `${L.name} — ${t.breadcrumb}`,
        "description": L.shortAnswer,
        "inLanguage": L.isArabic ? "ar-MA" : "fr-MA",
        ...(exam.reviewedAt ? {
          "lastReviewed": new Date(exam.reviewedAt).toISOString().slice(0, 10),
          "reviewedBy": { "@type": "Organization", "name": "Rédaction médicale SantéauMaroc", "url": BASE },
        } : {}),
        "mainEntity": {
          "@type": "MedicalTest",
          "name": L.name,
          ...(exam.synonyms.length > 0 && { "alternateName": exam.synonyms }),
          ...(exam.specialty && { "relevantSpecialty": { "@type": "MedicalSpecialty", "name": exam.specialty.name } }),
        },
        "audience": { "@type": "MedicalAudience", "audienceType": "Patient" },
        ...(sources.length > 0 && {
          "citation": sources.map((s) => ({ "@type": "CreativeWork", "name": s.label, ...(s.publisher && { "publisher": { "@type": "Organization", "name": s.publisher } }), ...(s.url && { "url": s.url }) })),
        }),
        "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".topic-shortanswer"] },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${locale === "ar" ? `${BASE}/ar` : BASE}/examens` },
          { "@type": "ListItem", "position": 3, "name": L.name, "item": url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <main className="page-outer">
        <div className="max-w-2xl mx-auto">
          <nav aria-label={t.breadcrumb} className="text-sm text-slate-500 mb-6">
            <Link href="/examens" className="hover:text-primary-700 font-medium">{t.title}</Link>
          </nav>

          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-2">{t.breadcrumb}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3" dir="auto">{L.name}</h1>
          {exam.synonyms.length > 0 && (
            <p className="text-sm text-slate-500 mb-6" dir="auto"><span className="font-semibold text-slate-600">{t.alsoCalled} :</span> {exam.synonyms.join(" · ")}</p>
          )}

          {/* En bref — réponse courte (cible speakable / featured snippet) */}
          <div className="topic-shortanswer rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t.shortAnswerLabel}</p>
            <p className="text-lg text-slate-800 leading-relaxed" dir="auto">{L.shortAnswer}</p>
          </div>

          {/* Bloc pratique — durée, prix, remboursement */}
          {(exam.durationMin || priceStr || L.reimbursement) && (
            <section className="mb-8 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">{t.practicalTitle}</h2>
              <dl className="grid sm:grid-cols-3 gap-4">
                {exam.durationMin ? (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{t.durationLabel}</dt>
                    <dd className="text-base font-semibold text-slate-800 tabular-nums">{exam.durationMin} {t.minutesUnit}</dd>
                  </div>
                ) : null}
                {priceStr ? (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{t.priceLabel}</dt>
                    <dd className="text-base font-semibold text-slate-800 tabular-nums" dir="ltr">{priceStr}</dd>
                  </div>
                ) : null}
                {L.reimbursement ? (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{t.reimbursementLabel}</dt>
                    <dd className="text-base font-semibold text-slate-800" dir="auto">{L.reimbursement}</dd>
                  </div>
                ) : null}
              </dl>
              {priceStr && <p className="text-xs text-slate-500 mt-4" dir="auto">{t.priceNote}</p>}
            </section>
          )}

          {/* Indications — pourquoi cet examen */}
          {indications.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{t.indicationsTitle}</h2>
              <ul className="space-y-2">
                {indications.map((c, i) => (
                  <li key={i} className="flex gap-3 text-slate-700" dir="auto">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Déroulé — comment ça se passe */}
          {procedure.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{t.procedureTitle}</h2>
              <ul className="space-y-2">
                {procedure.map((c, i) => (
                  <li key={i} className="flex gap-3 text-slate-700" dir="auto">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary-400" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Préparation */}
          {L.preparation && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{t.preparationTitle}</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line" dir="auto">{L.preparation}</p>
            </section>
          )}

          {/* Précautions / contre-indications — encadré ambre */}
          {precautions.length > 0 && (
            <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-amber-800 mb-3">{t.precautionsTitle}</h2>
              <ul className="space-y-2">
                {precautions.map((r, i) => (
                  <li key={i} className="flex gap-3 text-amber-900" dir="auto">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Spécialité concernée → conversion */}
          {exam.specialty && (
            <section className="mb-8 rounded-2xl border border-primary-100 bg-primary-50/50 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-2">{t.specialtyTitle}</p>
              <Link href={`/specialites/${exam.specialty.slug}`} className="inline-flex items-center gap-2 text-base font-semibold text-primary-700 hover:text-primary-800">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                {t.specialtyCta.replace("{specialty}", exam.specialty.name)}
              </Link>
            </section>
          )}

          {/* Praticiens réservables de la spécialité */}
          {exam.specialty && (
            <RelatedDoctors specialtySlug={exam.specialty.slug} specialtyLabel={exam.specialty.name} t={dict.card} tb={tb} locale={locale} />
          )}

          {/* FAQ (rend visible + JSON-LD FAQPage) */}
          <BlogFaq items={faqItems} t={tb} />

          {/* Sources */}
          <ArticleSources items={sources} t={tb} />

          {/* Signature de relecture éditoriale (honnête : si reviewedAt) + transparence */}
          <EditorialReviewNote reviewedAt={exam.reviewedAt} locale={locale} tb={tb} />

          {/* Maillage : articles + glossaire */}
          {relatedPosts.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">{t.relatedArticlesTitle}</h2>
              <ul className="space-y-2">
                {relatedPosts.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="text-primary-700 hover:text-primary-800 font-medium" dir="auto">{p.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {relatedTerms.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">{t.relatedGlossaryTitle}</h2>
              <div className="flex flex-wrap gap-2">
                {relatedTerms.map((g) => (
                  <Link key={g.slug} href={`/glossaire/${g.slug}`} className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200" dir="auto">{g.term}</Link>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs text-slate-400 mt-10 leading-relaxed">{t.disclaimer}</p>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link href="/examens" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
              {t.backToList}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
