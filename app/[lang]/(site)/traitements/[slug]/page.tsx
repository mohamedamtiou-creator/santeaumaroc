import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { treatmentLocalized, isTreatmentArReady, isTreatmentReviewed, parseLines, parseFaq } from "@/lib/treatment";
import { parseSources, ArticleSources } from "@/components/blog/ArticleSources";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { EditorialReviewNote } from "@/components/health/EditorialReviewNote";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
type Params = Promise<{ lang: string; slug: string }>;

export async function generateStaticParams() {
  const treatments = await prisma.treatment.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return treatments.map((tr) => ({ slug: tr.slug }));
}

const getTreatment = cache((slug: string) =>
  prisma.treatment.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { specialty: { select: { slug: true, name: true } } },
  }),
);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const treatment = await getTreatment(slug);
  if (!treatment) return { title: "Traitement introuvable", robots: { index: false } };

  const locale = toLocale(lang);
  const L = treatmentLocalized(treatment, locale);
  const title = `${L.name} : options, durée et effets`;
  const description = L.shortAnswer.slice(0, 160);
  const arReady = isTreatmentArReady(treatment);
  const indexable = isTreatmentReviewed(treatment) && (locale !== "ar" || arReady);

  return {
    title,
    description,
    alternates: arReady ? localizedAlternates(`/traitements/${slug}`, locale) : frenchOnlyAlternates(`/traitements/${slug}`),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title, description, url: `/traitements/${slug}`, type: "article", locale: L.isArabic ? "ar_MA" : "fr_MA" },
  };
}

export default async function TreatmentPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const treatment = await getTreatment(slug);
  if (!treatment) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.treatments;
  const tb = dict.blog;
  const L = treatmentLocalized(treatment, locale);

  const options = parseLines(L.options);
  const sideEffects = parseLines(L.sideEffects);
  const redFlags = parseLines(L.redFlags);
  const faqItems = parseFaq(L.faqJson);
  const sources = parseSources(L.sources);
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}/traitements/${slug}`;

  const [relatedPosts, relatedTerms] = await Promise.all([
    treatment.relatedSlugs.length
      ? prisma.post.findMany({ where: { slug: { in: treatment.relatedSlugs }, status: "PUBLISHED" }, select: { slug: true, title: true } })
      : Promise.resolve([]),
    treatment.glossarySlugs.length
      ? prisma.glossaryTerm.findMany({ where: { slug: { in: treatment.glossarySlugs }, status: "PUBLISHED" }, select: { slug: true, term: true } })
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
        ...(treatment.reviewedAt ? {
          "lastReviewed": new Date(treatment.reviewedAt).toISOString().slice(0, 10),
          "reviewedBy": { "@type": "Organization", "name": "Rédaction médicale SantéauMaroc", "url": BASE },
        } : {}),
        "mainEntity": {
          "@type": "MedicalTherapy",
          "name": L.name,
          ...(treatment.synonyms.length > 0 && { "alternateName": treatment.synonyms }),
          ...(treatment.specialty && { "relevantSpecialty": { "@type": "MedicalSpecialty", "name": treatment.specialty.name } }),
          ...(sideEffects.length > 0 && { "adverseOutcome": sideEffects.map((s) => ({ "@type": "MedicalEntity", "name": s })) }),
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
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${locale === "ar" ? `${BASE}/ar` : BASE}/traitements` },
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
            <Link href="/traitements" className="hover:text-primary-700 font-medium">{t.title}</Link>
          </nav>

          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-2">{t.breadcrumb}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3" dir="auto">{L.name}</h1>
          {treatment.synonyms.length > 0 && (
            <p className="text-sm text-slate-500 mb-6" dir="auto"><span className="font-semibold text-slate-600">{t.alsoCalled} :</span> {treatment.synonyms.join(" · ")}</p>
          )}

          {/* En bref — réponse courte (cible speakable / featured snippet) */}
          <div className="topic-shortanswer rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t.shortAnswerLabel}</p>
            <p className="text-lg text-slate-800 leading-relaxed" dir="auto">{L.shortAnswer}</p>
          </div>

          {/* Options de traitement */}
          {options.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{t.optionsTitle}</h2>
              <ul className="space-y-2">
                {options.map((c, i) => (
                  <li key={i} className="flex gap-3 text-slate-700" dir="auto">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Durée et suivi */}
          {L.duration && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{t.durationTitle}</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line" dir="auto">{L.duration}</p>
            </section>
          )}

          {/* Effets indésirables et précautions — encadré ambre */}
          {sideEffects.length > 0 && (
            <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-amber-800 mb-3">{t.sideEffectsTitle}</h2>
              <ul className="space-y-2">
                {sideEffects.map((r, i) => (
                  <li key={i} className="flex gap-3 text-amber-900" dir="auto">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Signes d'alerte — encadré rouge (triage) */}
          {redFlags.length > 0 && (
            <section className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-rose-800 mb-3 flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6v5M10 14h.01M8.6 2.9 1.7 15a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L11.4 2.9a1.6 1.6 0 0 0-2.8 0z" /></svg>
                {t.redFlagsTitle}
              </h2>
              <ul className="space-y-2">
                {redFlags.map((r, i) => (
                  <li key={i} className="flex gap-3 text-rose-900" dir="auto">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold text-rose-700 mt-4">{t.emergencyNote}</p>
            </section>
          )}

          {/* Quand consulter */}
          {L.whenToConsult && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{t.whenToConsultTitle}</h2>
              <p className="text-slate-700 leading-relaxed" dir="auto">{L.whenToConsult}</p>
            </section>
          )}

          {/* Quel médecin consulter → conversion */}
          {treatment.specialty && (
            <section className="mb-8 rounded-2xl border border-primary-100 bg-primary-50/50 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-2">{t.specialtyTitle}</p>
              <Link href={`/specialites/${treatment.specialty.slug}`} className="inline-flex items-center gap-2 text-base font-semibold text-primary-700 hover:text-primary-800">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                {t.specialtyCta.replace("{specialty}", treatment.specialty.name)}
              </Link>
            </section>
          )}

          {/* Praticiens réservables de la spécialité */}
          {treatment.specialty && (
            <RelatedDoctors specialtySlug={treatment.specialty.slug} specialtyLabel={treatment.specialty.name} t={dict.card} tb={tb} locale={locale} />
          )}

          {/* FAQ (rend visible + JSON-LD FAQPage) */}
          <BlogFaq items={faqItems} t={tb} />

          {/* Sources */}
          <ArticleSources items={sources} t={tb} />

          {/* Signature de relecture éditoriale (honnête : si reviewedAt) + transparence */}
          <EditorialReviewNote reviewedAt={treatment.reviewedAt} locale={locale} tb={tb} />

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
            <Link href="/traitements" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
              {t.backToList}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
