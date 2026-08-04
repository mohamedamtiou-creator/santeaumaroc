import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { labelWithoutGloss } from "@/lib/utils";
import { getDictionary, toLocale } from "@/lib/i18n";
import { examLocalized, isExamArReady, isExamReviewed, parseLines, parseFaq } from "@/lib/medical-exam";
import { tSpecialty } from "@/lib/specialty-i18n";
import { parseSources, ArticleSources } from "@/components/blog/ArticleSources";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { ToolInsert } from "@/components/outils/ToolInsert";
import { toolsForExam } from "@/lib/health-tools-inserts";
import { EditorialReviewNote } from "@/components/health/EditorialReviewNote";
import { DetailHero } from "@/components/health/DetailHero";
import { SpecialtyAside } from "@/components/health/SpecialtyAside";

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
  // Gabarit aligné sur la langue du CONTENU servi (cf. /maladies).
  const title = getDictionary(L.isArabic ? "ar" : "fr").exams.itemMetaTitle.replace("{term}", labelWithoutGloss(L.name));
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
          // Balisage du prix : la fourchette est affichée depuis toujours dans le
          // héros, mais aucun moteur ne pouvait la lire COMME un prix. Fourchette
          // → minPrice/maxPrice ; honoraires libres, donc jamais un prix unique.
          ...((exam.priceMin != null || exam.priceMax != null) && {
            "offers": {
              "@type": "Offer",
              "areaServed": { "@type": "Country", "name": "Maroc" },
              "priceSpecification": {
                "@type": "PriceSpecification",
                "priceCurrency": "MAD",
                ...(exam.priceMin != null ? { "minPrice": exam.priceMin } : {}),
                ...(exam.priceMax != null ? { "maxPrice": exam.priceMax } : {}),
                "valueAddedTaxIncluded": true,
                "description": L.isArabic
                  ? "الأتعاب حرة في القطاع الخاص: مبالغ إرشادية."
                  : "Honoraires libres dans le privé : fourchette indicative.",
              },
            },
          }),
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

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <nav aria-label={t.breadcrumb} className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/examens" className="hover:text-primary-700 font-medium">{t.title}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium" dir="auto">{L.name}</span>
        </nav>

        <DetailHero
          eyebrow={t.breadcrumb}
          title={L.name}
          synonyms={exam.synonyms}
          alsoCalledLabel={t.alsoCalled}
          reviewedAt={exam.reviewedAt}
          locale={locale}
          chips={dict.healthHub}
        />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
          <article className="min-w-0">
            {/* En bref — réponse courte (cible speakable / featured snippet) */}
            <div className="topic-shortanswer relative rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6 mb-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600 mb-2.5">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h4l5 5v4l-5 5H8l-5-5V7l5-5z" /><path d="m8.5 10 1.5 1.5L13 8" /></svg>
                {t.shortAnswerLabel}
              </p>
              <p className="text-lg text-slate-800 leading-relaxed" dir="auto">{L.shortAnswer}</p>
            </div>

            {/* Bloc pratique — durée, prix, remboursement */}
            {(exam.durationMin || priceStr || L.reimbursement) && (
              <section aria-label={t.practicalTitle} className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {exam.durationMin ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{t.durationLabel}</p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">{exam.durationMin} {t.minutesUnit}</p>
                  </div>
                ) : null}
                {priceStr ? (
                  <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-1">{t.priceLabel}</p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums" dir="ltr">{priceStr}</p>
                  </div>
                ) : null}
                {L.reimbursement ? (
                  <div className="rounded-2xl border border-secondary-100 bg-secondary-50/40 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-secondary-600 mb-1">{t.reimbursementLabel}</p>
                    <p className="text-sm font-semibold text-slate-800 leading-snug" dir="auto">{L.reimbursement}</p>
                  </div>
                ) : null}
                {priceStr && <p className="text-xs text-slate-500 sm:col-span-3" dir="auto">{t.priceNote}</p>}
              </section>
            )}

            {/* Indications — pourquoi cet examen */}
            {indications.length > 0 && (
              <section aria-labelledby="indic-title" className="mb-8">
                <h2 id="indic-title" className="text-xl font-bold text-slate-900 mb-4">{t.indicationsTitle}</h2>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {indications.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700" dir="auto">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><path d="m5.5 8 1.75 1.75L11 6" /></svg>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Déroulé — comment ça se passe */}
            {procedure.length > 0 && (
              <section aria-labelledby="proc-title" className="mb-8">
                <h2 id="proc-title" className="text-xl font-bold text-slate-900 mb-4">{t.procedureTitle}</h2>
                <ol className="space-y-2.5">
                  {procedure.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700" dir="auto">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-50 text-secondary-700 text-xs font-bold tabular-nums" aria-hidden="true">{i + 1}</span>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Préparation */}
            {L.preparation && (
              <section aria-labelledby="prep-title" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 id="prep-title" className="text-xl font-bold text-slate-900 mb-3">{t.preparationTitle}</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line" dir="auto">{L.preparation}</p>
              </section>
            )}

            {/* Précautions / contre-indications — encadré ambre */}
            {precautions.length > 0 && (
              <section aria-labelledby="prec-title" className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
                <h2 id="prec-title" className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6.5v4M10 13.5h.01M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z" /></svg>
                  {t.precautionsTitle}
                </h2>
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

            {/* Maillage retour vers /outils (registre inversé, aucune requête) */}
            <ToolInsert slugs={toolsForExam(exam.slug)} locale={locale} t={dict.tools} />

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

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link href="/examens" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
                {t.backToList}
              </Link>
            </div>
          </article>

          {/* Panneau de conversion sticky (desktop) */}
          {exam.specialty && (
            <SpecialtyAside
              specialtySlug={exam.specialty.slug}
              ctaLabel={t.specialtyCta.replace("{specialty}", tSpecialty(exam.specialty.name, locale))}
              chips={dict.healthHub}
            />
          )}
        </div>
      </div>
    </>
  );
}
