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
  intentLocalized,
  composeIntentQuestion,
  composeIntentAnswer,
  isTopicArReady,
  isTopicReviewed,
  parseLines,
  parseFaq,
} from "@/lib/health-topic";
import { parseSources, ArticleSources } from "@/components/blog/ArticleSources";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { EditorialReviewNote } from "@/components/health/EditorialReviewNote";

export const revalidate = 86400; // TTL.DIRECTORY

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
type Params = Promise<{ lang: string; slug: string }>;

// Une page d'intention existe pour chaque topic dont `intentSlug` est renseigné.
// L'URL est portée par `intentSlug` (pas le slug du symptôme) → contenu adossé au
// même HealthTopic, sans dupliquer la fiche symptôme (anti-cannibalisation).
export async function generateStaticParams() {
  const topics = await prisma.healthTopic.findMany({
    where: { intentSlug: { not: null }, status: "PUBLISHED" },
    select: { intentSlug: true },
  });
  return topics.flatMap((t) => (t.intentSlug ? [{ slug: t.intentSlug }] : []));
}

const getIntent = cache((slug: string) =>
  prisma.healthTopic.findFirst({
    where: { intentSlug: slug, status: "PUBLISHED" },
    include: { specialty: { select: { slug: true, name: true } } },
  }),
);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const topic = await getIntent(slug);
  if (!topic) return { title: "Page introuvable", robots: { index: false } };

  const locale = toLocale(lang);
  const L = topicLocalized(topic, locale);
  const IW = intentLocalized(topic, locale);
  const specialtyName = topic.specialty ? tSpecialty(topic.specialty.name, locale) : null;
  // Le <title> est composé sans la glose entre parenthèses : le H1 plus bas garde
  // le libellé complet, utile au lecteur (cf. labelWithoutGloss).
  const question = IW.question ?? composeIntentQuestion(labelWithoutGloss(L.term), locale);
  const answer = IW.answer ?? composeIntentAnswer(L.term, specialtyName, locale);

  const arReady = isTopicArReady(topic);
  const indexable = isTopicReviewed(topic) && (locale !== "ar" || arReady);
  const path = `/quel-medecin-pour/${slug}`;

  return {
    title: question,
    description: answer.slice(0, 160),
    alternates: arReady ? localizedAlternates(path, locale) : frenchOnlyAlternates(path),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title: question, description: answer.slice(0, 160), url: path, type: "article", locale: L.isArabic ? "ar_MA" : "fr_MA" },
  };
}

export default async function IntentPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const topic = await getIntent(slug);
  if (!topic) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.intent;
  const ts = dict.symptoms;
  const tb = dict.blog;
  const L = topicLocalized(topic, locale);
  const IW = intentLocalized(topic, locale);

  const specialtyName = topic.specialty ? tSpecialty(topic.specialty.name, locale) : null;
  const question = IW.question ?? composeIntentQuestion(L.term, locale);
  const answer = IW.answer ?? composeIntentAnswer(L.term, specialtyName, locale);

  const redFlags = parseLines(L.redFlags);
  const causes = parseLines(L.causes);
  const faqItems = parseFaq(L.faqJson);
  const sources = parseSources(L.sources);
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}/quel-medecin-pour/${slug}`;

  // Hub du symptôme/maladie selon le type (cohérent avec le maillage du cocon).
  // ⚠️ /symptomes/[slug] filtre kind=SYMPTOM et /maladies/[slug] kind=DISEASE :
  // router selon le type évite un 404 sur la fiche complète.
  const hubHref = topic.kind === "DISEASE" ? "/maladies" : "/symptomes";
  const hubLabel = topic.kind === "DISEASE" ? dict.diseases.title : ts.title;
  const ficheHref = `${hubHref}/${topic.slug}`;
  const ficheUrl = `${locale === "ar" ? `${BASE}/ar` : BASE}${ficheHref}`;
  const GENERALIST_SLUG = "medecine-generale";

  // Signature de relecture (honnête) — n'apparaît que si une relecture a eu lieu.
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
        // Question directe → cible featured snippet / AI Overview.
        "mainEntity": {
          "@type": "Question",
          "name": question,
          "acceptedAnswer": { "@type": "Answer", "text": answer },
        },
        ...(topic.specialty && { "about": { "@type": "MedicalSpecialty", "name": topic.specialty.name } }),
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

      {/* Le layout (site) fournit déjà le <main> — on n'imbrique pas un 2ᵉ landmark. */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Fil d'Ariane */}
        <nav aria-label={ts.breadcrumb} className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href={hubHref} className="hover:text-primary-700 font-medium">{hubLabel}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <Link href={ficheHref} className="hover:text-primary-700 font-medium" dir="auto">{L.term}</Link>
        </nav>

        {/* ── Héro : question + réassurance de confiance ──────────────────── */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-secondary-50/40 px-6 py-8 sm:px-10 sm:py-11 mb-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-100/50 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 ring-1 ring-primary-200 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-700 mb-4">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5 3 5.5v4c0 4 3 6.5 7 8 4-1.5 7-4 7-8v-4L10 2.5z" /></svg>
              {t.eyebrow}
            </span>
            <h1 className="text-[1.7rem] leading-tight sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl" dir="auto">{question}</h1>

            {/* Bandeau de confiance — E-E-A-T + réassurance CRO */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5" dir="auto">
              {reviewedDate && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 ring-1 ring-secondary-200 px-3 py-1.5 text-xs font-semibold text-secondary-800">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 10.5 9.5 12.5 13 8.5" /><circle cx="10" cy="10" r="8" /></svg>
                  {t.trustVerified}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M2.5 10h15M10 2.5c2 2.2 3 4.8 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.8-3-7.5s1-5.3 3-7.5z" /></svg>
                {t.trustFree}
              </span>
              {reviewedDate && (
                <span className="text-xs text-slate-500">{t.updatedOn.replace("{date}", reviewedDate)}</span>
              )}
            </div>
          </div>
        </header>

        {/* ── Corps : article (gauche) + panneau de conversion sticky (droite) ── */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
          {/* ══ Colonne article ══ */}
          <article className="min-w-0">
            {/* Réponse directe (cible speakable / featured snippet / AI Overview) */}
            <div className="intent-answer relative rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6 mb-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600 mb-2.5">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h4l5 5v4l-5 5H8l-5-5V7l5-5z" /><path d="m8.5 10 1.5 1.5L13 8" /></svg>
                {t.answerLabel}
              </p>
              <p className="text-lg text-slate-800 leading-relaxed" dir="auto">{answer}</p>
            </div>

            {/* ── L'essentiel : triage en un coup d'œil ── */}
            {topic.specialty && (
              <section aria-labelledby="glance-title" className="mb-8">
                <h2 id="glance-title" className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">{t.glanceTitle}</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {/* Spécialiste conseillé — action primaire */}
                  <Link href={`/specialites/${topic.specialty.slug}`} className="group flex flex-col rounded-2xl border border-primary-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-3" aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v5a4 4 0 0 0 8 0V2M10 11v3a4 4 0 0 0 4 4 3 3 0 0 0 3-3v-1" /><circle cx="17" cy="12" r="1.5" /></svg>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{t.specialistLabel}</span>
                    <span className="mt-0.5 font-bold text-slate-900 leading-snug group-hover:text-primary-700" dir="auto">{specialtyName ?? topic.specialty.name}</span>
                  </Link>
                  {/* Premier recours — généraliste */}
                  <Link href={`/specialites/${GENERALIST_SLUG}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-secondary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary-50 text-secondary-600 mb-3" aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="6" r="3.25" /><path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" /></svg>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{t.firstRecourseLabel}</span>
                    <span className="mt-0.5 font-bold text-slate-900 leading-snug group-hover:text-secondary-700" dir="auto">{t.generalist}</span>
                  </Link>
                  {/* Quand s'inquiéter — ancre vers les signes d'alerte */}
                  <a href={redFlags.length > 0 ? "#signes-alerte" : undefined} className={`group flex flex-col rounded-2xl border p-4 transition-all ${redFlags.length > 0 ? "border-rose-200 bg-rose-50/40 hover:border-rose-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2" : "border-slate-200 bg-white"}`}>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-3" aria-hidden="true">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6.5v4M10 13.5h.01M8.6 3 1.9 14.5a1.6 1.6 0 0 0 1.4 2.4h13.4a1.6 1.6 0 0 0 1.4-2.4L11.4 3a1.6 1.6 0 0 0-2.8 0z" /></svg>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{t.urgencyLabel}</span>
                    <span className="mt-0.5 font-bold text-slate-900 leading-snug" dir="auto">{redFlags.length > 0 ? t.urgencyRedFlags : t.urgencyNone}</span>
                  </a>
                </div>
              </section>
            )}

            {/* Signes d'alerte — triage (repris du hub) */}
            {redFlags.length > 0 && (
              <section id="signes-alerte" aria-labelledby="redflags-title" className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 sm:p-6 scroll-mt-24">
                <h2 id="redflags-title" className="text-lg font-bold text-rose-800 mb-3 flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6v5M10 14h.01M8.6 2.9 1.7 15a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L11.4 2.9a1.6 1.6 0 0 0-2.8 0z" /></svg>
                  {ts.redFlagsTitle}
                </h2>
                <ul className="space-y-2">
                  {redFlags.map((r, i) => (
                    <li key={i} className="flex gap-3 text-rose-900" dir="auto">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-rose-700 mt-4">{ts.emergencyNote}</p>
              </section>
            )}

            {/* Causes et facteurs de risque */}
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

            {/* Quand consulter */}
            {L.whenToConsult && (
              <section aria-labelledby="when-title" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 id="when-title" className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M10 5.5V10l3 2" /></svg>
                  {ts.whenToConsultTitle}
                </h2>
                <p className="text-slate-700 leading-relaxed" dir="auto">{L.whenToConsult}</p>
              </section>
            )}

            {/* Praticiens réservables de la spécialité (widget de conversion partagé) */}
            {topic.specialty && (
              <RelatedDoctors specialtySlug={topic.specialty.slug} specialtyLabel={topic.specialty.name} t={dict.card} tb={tb} locale={locale} />
            )}

            {/* FAQ (visible + JSON-LD FAQPage) */}
            <BlogFaq items={faqItems} t={tb} />

            {/* Sources */}
            <ArticleSources items={sources} t={tb} />

            {/* Signature de relecture éditoriale (honnête) */}
            <EditorialReviewNote reviewedAt={topic.reviewedAt} locale={locale} tb={tb} />

            {/* Vers la fiche complète (maillage du cocon) */}
            <Link href={ficheHref} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
              {t.seeFullSymptom.replace("{term}", L.term)}
            </Link>

            <p className="text-xs text-slate-400 mt-10 leading-relaxed">{ts.disclaimer}</p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link href={hubHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
                {ts.backToList}
              </Link>
            </div>
          </article>

          {/* ══ Panneau de conversion (sticky, desktop) ══ */}
          {topic.specialty && (
            <aside className="hidden lg:block" aria-label={t.asideTitle}>
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary-600 ring-1 ring-primary-100 mb-3" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v5a4 4 0 0 0 8 0V2M10 11v3a4 4 0 0 0 4 4 3 3 0 0 0 3-3v-1" /><circle cx="17" cy="12" r="1.5" /></svg>
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

                {/* Rappel urgence — repère de sécurité toujours visible */}
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex items-start gap-3">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6v5M10 14h.01M8.6 2.9 1.7 15a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L11.4 2.9a1.6 1.6 0 0 0-2.8 0z" /></svg>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{t.urgencyNote}</p>
                    <p className="text-sm text-rose-900 leading-snug mt-0.5">{ts.emergencyNote}</p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
