import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { topicLocalized, isTopicArReady, isTopicReviewed, parseLines, parseFaq, composeIntentQuestion, composeTreatmentQuestion, composePreventionQuestion } from "@/lib/health-topic";
import { tSpecialty } from "@/lib/specialty-i18n";
import { parseSources, ArticleSources } from "@/components/blog/ArticleSources";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { EditorialReviewNote } from "@/components/health/EditorialReviewNote";
import { DetailHero } from "@/components/health/DetailHero";
import { SpecialtyAside } from "@/components/health/SpecialtyAside";
import { TopicClusterLinks } from "@/components/health/TopicClusterLinks";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
type Params = Promise<{ lang: string; slug: string }>;

export async function generateStaticParams() {
  const topics = await prisma.healthTopic.findMany({ where: { kind: "SYMPTOM", status: "PUBLISHED" }, select: { slug: true } });
  return topics.map((t) => ({ slug: t.slug }));
}

const getTopic = cache((slug: string) =>
  prisma.healthTopic.findFirst({
    where: { slug, kind: "SYMPTOM", status: "PUBLISHED" },
    include: { specialty: { select: { slug: true, name: true } } },
  }),
);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) return { title: "Symptôme introuvable", robots: { index: false } };

  const locale = toLocale(lang);
  const L = topicLocalized(topic, locale);
  const title = `${L.term} : causes et quand consulter`;
  const description = L.shortAnswer.slice(0, 160);
  const arReady = isTopicArReady(topic);
  const indexable = isTopicReviewed(topic) && (locale !== "ar" || arReady);

  return {
    title,
    description,
    alternates: arReady ? localizedAlternates(`/symptomes/${slug}`, locale) : frenchOnlyAlternates(`/symptomes/${slug}`),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title, description, url: `/symptomes/${slug}`, type: "article", locale: L.isArabic ? "ar_MA" : "fr_MA" },
  };
}

export default async function SymptomPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.symptoms;
  const tb = dict.blog;
  const L = topicLocalized(topic, locale);

  const causes = parseLines(L.causes);
  const redFlags = parseLines(L.redFlags);
  const faqItems = parseFaq(L.faqJson);
  const sources = parseSources(L.sources);
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}/symptomes/${slug}`;

  // Maillage : articles blog + termes de glossaire liés (titres récupérés).
  const [relatedPosts, relatedTerms] = await Promise.all([
    topic.relatedSlugs.length
      ? prisma.post.findMany({ where: { slug: { in: topic.relatedSlugs }, status: "PUBLISHED" }, select: { slug: true, title: true } })
      : Promise.resolve([]),
    topic.glossarySlugs.length
      ? prisma.glossaryTerm.findMany({ where: { slug: { in: topic.glossarySlugs }, status: "PUBLISHED" }, select: { slug: true, term: true } })
      : Promise.resolve([]),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": `${L.term} — ${t.breadcrumb}`,
        "description": L.shortAnswer,
        "inLanguage": L.isArabic ? "ar-MA" : "fr-MA",
        ...(topic.reviewedAt ? {
          "lastReviewed": new Date(topic.reviewedAt).toISOString().slice(0, 10),
          "reviewedBy": { "@type": "Organization", "name": "Rédaction médicale SantéauMaroc", "url": BASE },
        } : {}),
        "mainEntity": {
          "@type": "MedicalSymptom",
          "name": L.term,
          ...(topic.synonyms.length > 0 && { "alternateName": topic.synonyms }),
          ...(causes.length > 0 && { "possibleCause": causes.map((c) => ({ "@type": "MedicalEntity", "name": c })) }),
          ...(topic.specialty && { "relevantSpecialty": { "@type": "MedicalSpecialty", "name": topic.specialty.name } }),
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
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${locale === "ar" ? `${BASE}/ar` : BASE}/symptomes` },
          { "@type": "ListItem", "position": 3, "name": L.term, "item": url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <nav aria-label={t.breadcrumb} className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/symptomes" className="hover:text-primary-700 font-medium">{t.title}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium" dir="auto">{L.term}</span>
        </nav>

        <DetailHero
          eyebrow={t.breadcrumb}
          title={L.term}
          synonyms={topic.synonyms}
          alsoCalledLabel={t.alsoCalled}
          reviewedAt={topic.reviewedAt}
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

            {/* Causes fréquentes */}
            {causes.length > 0 && (
              <section aria-labelledby="causes-title" className="mb-8">
                <h2 id="causes-title" className="text-xl font-bold text-slate-900 mb-4">{t.causesTitle}</h2>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {causes.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700" dir="auto">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><path d="m5.5 8 1.75 1.75L11 6" /></svg>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Signes d'alerte — encadré rouge (triage) */}
            {redFlags.length > 0 && (
              <section id="signes-alerte" aria-labelledby="redflags-title" className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 sm:p-6 scroll-mt-24">
                <h2 id="redflags-title" className="text-lg font-bold text-rose-800 mb-3 flex items-center gap-2">
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
              <section aria-labelledby="when-title" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 id="when-title" className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5 3 5.5v4c0 4 3 6.5 7 8 4-1.5 7-4 7-8v-4L10 2.5z" /></svg>
                  {t.whenToConsultTitle}
                </h2>
                <p className="text-slate-700 leading-relaxed" dir="auto">{L.whenToConsult}</p>
              </section>
            )}

            {/* Praticiens réservables de la spécialité (réutilise le widget blog) */}
            {topic.specialty && (
              <RelatedDoctors specialtySlug={topic.specialty.slug} specialtyLabel={topic.specialty.name} t={dict.card} tb={tb} locale={locale} />
            )}

            {/* FAQ (rend visible + JSON-LD FAQPage) */}
            <BlogFaq items={faqItems} t={tb} />

            {/* Sources */}
            <ArticleSources items={sources} t={tb} />

            {/* Signature de relecture éditoriale (honnête : si reviewedAt) + transparence */}
            <EditorialReviewNote reviewedAt={topic.reviewedAt} locale={locale} tb={tb} />

            {/* Autres angles du même sujet + sujets liés (maillage du cocon) */}
            <TopicClusterLinks
              locale={locale}
              title={dict.healthHub.relatedTopics}
              anglesTitle={dict.healthHub.moreOnTopic}
              relatedTopicSlugs={topic.relatedTopicSlugs}
              angles={[
                ...(topic.intentSlug ? [{ href: `/quel-medecin-pour/${topic.intentSlug}`, label: composeIntentQuestion(L.term, locale) }] : []),
                ...(topic.treatmentSummary ? [{ href: `/comment-traiter/${topic.slug}`, label: composeTreatmentQuestion(L.term, locale) }] : []),
                ...(topic.preventionSummary ? [{ href: `/prevenir/${topic.slug}`, label: composePreventionQuestion(L.term, locale) }] : []),
              ]}
            />

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
              <Link href="/symptomes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
                {t.backToList}
              </Link>
            </div>
          </article>

          {/* Panneau de conversion sticky (desktop) */}
          {topic.specialty && (
            <SpecialtyAside
              specialtySlug={topic.specialty.slug}
              ctaLabel={t.specialtyCta.replace("{specialty}", tSpecialty(topic.specialty.name, locale))}
              emergencyNote={t.emergencyNote}
              chips={dict.healthHub}
            />
          )}
        </div>
      </div>
    </>
  );
}
