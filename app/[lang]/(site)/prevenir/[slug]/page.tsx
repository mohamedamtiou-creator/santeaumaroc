import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { labelWithoutGloss } from "@/lib/utils";
import { getDictionary, toLocale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import {
  topicLocalized,
  preventionLocalized,
  composePreventionQuestion,
  composePreventionAnswer,
  composeIntentQuestion,
  composeTreatmentQuestion,
  isTopicArReady,
  isTopicReviewed,
  parseLines,
  parseFaq,
} from "@/lib/health-topic";
import { parseSources, ArticleSources } from "@/components/blog/ArticleSources";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { ToolInsert } from "@/components/outils/ToolInsert";
import { toolsForTopic } from "@/lib/health-tools-inserts";
import { EditorialReviewNote } from "@/components/health/EditorialReviewNote";
import { TopicClusterLinks } from "@/components/health/TopicClusterLinks";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
type Params = Promise<{ lang: string; slug: string }>;

export async function generateStaticParams() {
  const topics = await prisma.healthTopic.findMany({
    where: { preventionSummary: { not: null }, status: "PUBLISHED" },
    select: { slug: true },
  });
  return topics.map((t) => ({ slug: t.slug }));
}

const getTopic = cache((slug: string) =>
  prisma.healthTopic.findFirst({
    where: { slug, preventionSummary: { not: null }, status: "PUBLISHED" },
    include: { specialty: { select: { slug: true, name: true } } },
  }),
);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) return { title: "Page introuvable", robots: { index: false } };

  const locale = toLocale(lang);
  const L = topicLocalized(topic, locale);
  const PW = preventionLocalized(topic, locale);
  // Le <title> est composé sans la glose entre parenthèses : le H1 plus bas garde
  // le libellé complet, utile au lecteur (cf. labelWithoutGloss).
  const question = composePreventionQuestion(labelWithoutGloss(L.term), locale);
  const answer = PW.summary ?? composePreventionAnswer(L.term, locale);

  const arReady = isTopicArReady(topic);
  const indexable = isTopicReviewed(topic) && (locale !== "ar" || arReady);
  const path = `/prevenir/${slug}`;

  return {
    title: question,
    description: answer.slice(0, 160),
    alternates: arReady ? localizedAlternates(path, locale) : frenchOnlyAlternates(path),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title: question, description: answer.slice(0, 160), url: path, type: "article", locale: L.isArabic ? "ar_MA" : "fr_MA" },
  };
}

export default async function PreventionPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const topic = await getTopic(slug);
  if (!topic) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.prevent;
  const ts = dict.symptoms;
  const tb = dict.blog;
  const L = topicLocalized(topic, locale);
  const PW = preventionLocalized(topic, locale);

  const specialtyName = topic.specialty ? tSpecialty(topic.specialty.name, locale) : null;
  const question = composePreventionQuestion(L.term, locale);
  const answer = PW.summary ?? composePreventionAnswer(L.term, locale);

  const steps = parseLines(PW.steps);
  const redFlags = parseLines(L.redFlags);
  const faqItems = parseFaq(L.faqJson);
  const sources = parseSources(L.sources);
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}/prevenir/${slug}`;

  const hubHref = topic.kind === "DISEASE" ? "/maladies" : "/symptomes";
  const hubLabel = topic.kind === "DISEASE" ? dict.diseases.title : ts.title;
  const ficheHref = `${hubHref}/${topic.slug}`;
  const ficheUrl = `${locale === "ar" ? `${BASE}/ar` : BASE}${ficheHref}`;
  const GENERALIST_SLUG = "medecine-generale";

  const reviewedDate = topic.reviewedAt
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(topic.reviewedAt))
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": question,
        "description": answer,
        "inLanguage": L.isArabic ? "ar-MA" : "fr-MA",
        ...(topic.reviewedAt ? {
          "lastReviewed": new Date(topic.reviewedAt).toISOString().slice(0, 10),
          "reviewedBy": { "@type": "Organization", "name": "Rédaction médicale SantéauMaroc", "url": BASE },
        } : {}),
        "mainEntity": {
          "@type": "Question",
          "name": question,
          "acceptedAnswer": { "@type": "Answer", "text": answer },
        },
        "about": { "@type": "MedicalCondition", "name": L.term },
        "audience": { "@type": "MedicalAudience", "audienceType": "Patient" },
        "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".intent-answer"] },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": hubLabel, "item": `${locale === "ar" ? `${BASE}/ar` : BASE}${hubHref}` },
          { "@type": "ListItem", "position": 3, "name": L.term, "item": ficheUrl },
          { "@type": "ListItem", "position": 4, "name": t.breadcrumb, "item": url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <nav aria-label={ts.breadcrumb} className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href={hubHref} className="hover:text-primary-700 font-medium">{hubLabel}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <Link href={ficheHref} className="hover:text-primary-700 font-medium" dir="auto">{L.term}</Link>
        </nav>

        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-secondary-50 via-white to-primary-50/40 px-6 py-8 sm:px-10 sm:py-11 mb-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-secondary-100/50 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 ring-1 ring-secondary-200 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-secondary-700 mb-4">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5 3 5.5v4c0 4 3 6.5 7 8 4-1.5 7-4 7-8v-4L10 2.5z" /><path d="m7.5 9.5 1.8 1.8 3.2-3.6" /></svg>
              {t.eyebrow}
            </span>
            <h1 className="text-[1.7rem] leading-tight sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl" dir="auto">{question}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-2.5" dir="auto">
              {reviewedDate && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 ring-1 ring-secondary-200 px-3 py-1.5 text-xs font-semibold text-secondary-800">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 10.5 9.5 12.5 13 8.5" /><circle cx="10" cy="10" r="8" /></svg>
                  {t.trustVerified}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-secondary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M2.5 10h15M10 2.5c2 2.2 3 4.8 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.8-3-7.5s1-5.3 3-7.5z" /></svg>
                {t.trustFree}
              </span>
              {reviewedDate && <span className="text-xs text-slate-500">{t.updatedOn.replace("{date}", reviewedDate)}</span>}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
          <article className="min-w-0">
            <div className="intent-answer relative rounded-2xl border border-secondary-100 bg-secondary-50/40 p-5 sm:p-6 mb-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary-600 mb-2.5">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h4l5 5v4l-5 5H8l-5-5V7l5-5z" /><path d="m8.5 10 1.5 1.5L13 8" /></svg>
                {t.answerLabel}
              </p>
              <p className="text-lg text-slate-800 leading-relaxed" dir="auto">{answer}</p>
            </div>

            {steps.length > 0 && (
              <section aria-labelledby="steps-title" className="mb-8">
                <h2 id="steps-title" className="text-xl font-bold text-slate-900 mb-4">{t.stepsTitle}</h2>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700" dir="auto">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0 text-secondary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><path d="m5.5 8 1.75 1.75L11 6" /></svg>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Maillage retour vers /outils : la prévention est le contexte où un
                score de risque ou une mesure prend le plus de sens. */}
            <ToolInsert slugs={toolsForTopic(topic.slug)} locale={locale} t={dict.tools} />

            {topic.specialty && (
              <RelatedDoctors specialtySlug={topic.specialty.slug} specialtyLabel={topic.specialty.name} t={dict.card} tb={tb} locale={locale} />
            )}

            <BlogFaq items={faqItems} t={tb} />
            <ArticleSources items={sources} t={tb} />
            <EditorialReviewNote reviewedAt={topic.reviewedAt} locale={locale} tb={tb} />

            {/* Autres angles du même sujet + sujets liés (maillage du cocon) */}
            <TopicClusterLinks
              locale={locale}
              title={t.relatedTopicsTitle}
              anglesTitle={dict.healthHub.moreOnTopic}
              relatedTopicSlugs={topic.relatedTopicSlugs}
              angles={[
                ...(topic.treatmentSummary ? [{ href: `/comment-traiter/${topic.slug}`, label: composeTreatmentQuestion(L.term, locale) }] : []),
                ...(topic.intentSlug ? [{ href: `/quel-medecin-pour/${topic.intentSlug}`, label: composeIntentQuestion(L.term, locale) }] : []),
              ]}
            />

            <Link href={ficheHref} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
              {t.seeFullSymptom.replace("{term}", L.term)}
            </Link>

            <p className="text-xs text-slate-400 mt-10 leading-relaxed">{ts.disclaimer}</p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link href="/prevenir" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
                {t.breadcrumb}
              </Link>
            </div>
          </article>

          {topic.specialty && (
            <aside className="hidden lg:block" aria-label={t.asideTitle}>
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl border border-secondary-100 bg-gradient-to-br from-secondary-50 to-white p-5 shadow-sm">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-secondary-600 ring-1 ring-secondary-100 mb-3" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5 3 5.5v4c0 4 3 6.5 7 8 4-1.5 7-4 7-8v-4L10 2.5z" /></svg>
                  </span>
                  <h2 className="font-bold text-slate-900 text-lg leading-snug">{t.asideTitle}</h2>
                  <p className="text-sm text-slate-500 mt-1 mb-4">{t.asideSubtitle}</p>
                  <Link href={`/specialites/${topic.specialty.slug}`} className="btn-primary w-full">
                    {ts.specialtyCta.replace("{specialty}", specialtyName ?? topic.specialty.name)}
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                  </Link>
                  <Link href={`/specialites/${GENERALIST_SLUG}`} className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-700">
                    {t.asideFindGeneralist}
                  </Link>
                </div>

                {redFlags.length > 0 && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex items-start gap-3">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6v5M10 14h.01M8.6 2.9 1.7 15a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L11.4 2.9a1.6 1.6 0 0 0-2.8 0z" /></svg>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{t.urgencyNote}</p>
                      <p className="text-sm text-rose-900 leading-snug mt-0.5">{ts.emergencyNote}</p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
