import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { tSpecialty } from "@/lib/specialty-i18n";
import { guideLocalized, isGuideArReady, isGuideReviewed } from "@/lib/specialty-guide";
import { parseLines, parseFaq } from "@/lib/health-topic";
import { parseSources, ArticleSources } from "@/components/blog/ArticleSources";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { EditorialReviewNote } from "@/components/health/EditorialReviewNote";
import { TopicClusterLinks } from "@/components/health/TopicClusterLinks";

export const revalidate = 86400; // TTL.DIRECTORY

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
type Params = Promise<{ lang: string; specialite: string }>;

// Une page « quand consulter » existe pour chaque spécialité dotée d'un guide.
export async function generateStaticParams() {
  const guides = await prisma.specialtyGuide.findMany({
    where: { status: "PUBLISHED" },
    select: { specialty: { select: { slug: true } } },
  });
  return guides.map((g) => ({ specialite: g.specialty.slug }));
}

const getGuide = cache((specialite: string) =>
  prisma.specialtyGuide.findFirst({
    where: { status: "PUBLISHED", specialty: { slug: specialite } },
    include: { specialty: { select: { slug: true, name: true } } },
  }),
);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, specialite } = await params;
  const guide = await getGuide(specialite);
  if (!guide) return { title: "Page introuvable", robots: { index: false } };

  const locale = toLocale(lang);
  const t = getDictionary(locale).whenToConsult;
  const G = guideLocalized(guide, locale);
  const specialtyName = tSpecialty(guide.specialty.name, locale);

  const arReady = isGuideArReady(guide);
  const indexable = isGuideReviewed(guide) && (locale !== "ar" || arReady);
  const path = `/quand-consulter/${specialite}`;

  return {
    title: t.metaTitle.replace("{specialty}", specialtyName),
    description: t.metaDesc.replace("{specialty}", specialtyName),
    alternates: arReady ? localizedAlternates(path, locale) : frenchOnlyAlternates(path),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: t.metaTitle.replace("{specialty}", specialtyName),
      description: G.shortAnswer.slice(0, 160),
      url: path, type: "article", locale: G.isArabic ? "ar_MA" : "fr_MA",
    },
  };
}

export default async function WhenToConsultPage({ params }: { params: Params }) {
  const { lang, specialite } = await params;
  const guide = await getGuide(specialite);
  if (!guide) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.whenToConsult;
  const ts = dict.symptoms;
  const tb = dict.blog;
  const G = guideLocalized(guide, locale);
  const specialtyName = tSpecialty(guide.specialty.name, locale);

  const h1 = t.h1.replace("{specialty}", specialtyName);
  const reasons = parseLines(G.reasons);
  const redFlags = parseLines(G.redFlags);
  const faqItems = parseFaq(G.faqJson);
  const sources = parseSources(G.sources);
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}/quand-consulter/${specialite}`;

  const reviewedDate = guide.reviewedAt
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(guide.reviewedAt))
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": h1,
        "description": G.shortAnswer,
        "inLanguage": G.isArabic ? "ar-MA" : "fr-MA",
        ...(guide.reviewedAt ? {
          "lastReviewed": new Date(guide.reviewedAt).toISOString().slice(0, 10),
          "reviewedBy": { "@type": "Organization", "name": "Rédaction médicale SantéauMaroc", "url": BASE },
        } : {}),
        "mainEntity": {
          "@type": "Question",
          "name": h1,
          "acceptedAnswer": { "@type": "Answer", "text": G.shortAnswer },
        },
        "about": { "@type": "MedicalSpecialty", "name": guide.specialty.name },
        "audience": { "@type": "MedicalAudience", "audienceType": "Patient" },
        "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".intent-answer"] },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.listTitle, "item": `${locale === "ar" ? `${BASE}/ar` : BASE}/quand-consulter` },
          { "@type": "ListItem", "position": 3, "name": h1, "item": url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {/* Fil d'Ariane */}
        <nav aria-label={t.breadcrumb} className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/quand-consulter" className="hover:text-primary-700 font-medium">{t.listTitle}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <Link href={`/specialites/${guide.specialty.slug}`} className="hover:text-primary-700 font-medium" dir="auto">{specialtyName}</Link>
        </nav>

        {/* ── Héro ── */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-secondary-50/40 px-6 py-8 sm:px-10 sm:py-11 mb-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-100/50 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 ring-1 ring-primary-200 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-700 mb-4">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5 3 5.5v4c0 4 3 6.5 7 8 4-1.5 7-4 7-8v-4L10 2.5z" /></svg>
              {t.eyebrow}
            </span>
            <h1 className="text-[1.7rem] leading-tight sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl" dir="auto">{h1}</h1>

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
              {reviewedDate && <span className="text-xs text-slate-500">{t.updatedOn.replace("{date}", reviewedDate)}</span>}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
          <article className="min-w-0">
            {/* Réponse directe */}
            <div className="intent-answer relative rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6 mb-8">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600 mb-2.5">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h4l5 5v4l-5 5H8l-5-5V7l5-5z" /><path d="m8.5 10 1.5 1.5L13 8" /></svg>
                {t.answerLabel}
              </p>
              <p className="text-lg text-slate-800 leading-relaxed" dir="auto">{G.shortAnswer}</p>
            </div>

            {/* Motifs de consultation */}
            {reasons.length > 0 && (
              <section aria-labelledby="reasons-title" className="mb-8">
                <h2 id="reasons-title" className="text-xl font-bold text-slate-900 mb-4">{t.reasonsTitle}</h2>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700" dir="auto">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><path d="m5.5 8 1.75 1.75L11 6" /></svg>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Signes d'alerte */}
            {redFlags.length > 0 && (
              <section aria-labelledby="redflags-title" className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 sm:p-6">
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

            {/* Quand consulter (paragraphe) */}
            {G.whenToConsult && (
              <section aria-labelledby="when-title" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 id="when-title" className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M10 5.5V10l3 2" /></svg>
                  {ts.whenToConsultTitle}
                </h2>
                <p className="text-slate-700 leading-relaxed" dir="auto">{G.whenToConsult}</p>
              </section>
            )}

            {/* Praticiens réservables de la spécialité */}
            <RelatedDoctors specialtySlug={guide.specialty.slug} specialtyLabel={guide.specialty.name} t={dict.card} tb={tb} locale={locale} />

            <BlogFaq items={faqItems} t={tb} />
            <ArticleSources items={sources} t={tb} />
            <EditorialReviewNote reviewedAt={guide.reviewedAt} locale={locale} tb={tb} />

            {/* Symptômes et maladies liés (maillage du cocon) */}
            <TopicClusterLinks locale={locale} title={t.relatedTitle} relatedTopicSlugs={guide.relatedSlugs} />

            <p className="text-xs text-slate-400 mt-10 leading-relaxed">{ts.disclaimer}</p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link href="/quand-consulter" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
                {t.backToList}
              </Link>
            </div>
          </article>

          {/* ══ Panneau de conversion (sticky, desktop) ══ */}
          <aside className="hidden lg:block" aria-label={t.asideTitle.replace("{specialty}", specialtyName)}>
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary-600 ring-1 ring-primary-100 mb-3" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v5a4 4 0 0 0 8 0V2M10 11v3a4 4 0 0 0 4 4 3 3 0 0 0 3-3v-1" /><circle cx="17" cy="12" r="1.5" /></svg>
                </span>
                <h2 className="font-bold text-slate-900 text-lg leading-snug">{t.asideTitle.replace("{specialty}", specialtyName)}</h2>
                <p className="text-sm text-slate-500 mt-1 mb-4">{t.asideSubtitle}</p>
                <Link href={`/specialites/${guide.specialty.slug}`} className="btn-primary w-full">
                  {t.findDoctorCta.replace("{specialty}", specialtyName)}
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                </Link>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex items-start gap-3">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6v5M10 14h.01M8.6 2.9 1.7 15a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L11.4 2.9a1.6 1.6 0 0 0-2.8 0z" /></svg>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{t.urgencyNote}</p>
                  <p className="text-sm text-rose-900 leading-snug mt-0.5">{ts.emergencyNote}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
