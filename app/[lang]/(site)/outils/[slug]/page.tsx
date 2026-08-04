import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Locale } from "@/lib/i18n";
import { TOOLS, TOOL_SLUGS, isToolSlug, type ToolSlug } from "@/lib/health-tools";
import { getToolContent } from "@/lib/tools-content";
import { TOOLS_AR_REVIEWED } from "@/lib/tools-content-ar";
import { getToolRelated } from "@/lib/health-tools-related";
import { ArticleSources } from "@/components/blog/ArticleSources";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { EditorialReviewNote } from "@/components/health/EditorialReviewNote";
import { ToolCalculator } from "@/components/outils/ToolCalculator";
import { ToolIcon } from "@/components/outils/ToolIcon";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";
const HUB = "/outils";
const GENERALIST_SLUG = "medecine-generale";

/** L'arabe n'est ni annoncé ni indexé avant relecture humaine (verrou YMYL). */
const AR_READY = TOOLS_AR_REVIEWED !== null;

type Params = Promise<{ lang: string; slug: string }>;

const abs = (locale: Locale, path: string) => `${locale === "ar" ? `${BASE}/ar` : BASE}${path}`;

// Six pages connues à l'avance : entièrement pré-rendues, aucune requête base au
// premier octet. Seuls les blocs de maillage (praticiens, fiches liées) touchent
// la base, via cache.
export function generateStaticParams() {
  return TOOL_SLUGS.map((slug) => ({ slug }));
}

/** Classes complètes (jamais concaténées) pour rester détectables par Tailwind. */
const SEVERITY_CHIP: Record<string, string> = {
  good: "bg-secondary-100 text-secondary-800 ring-secondary-300",
  watch: "bg-accent-100 text-accent-800 ring-accent-300",
  warn: "bg-terra-100 text-terra-700 ring-terra-200",
  alert: "bg-rose-100 text-rose-800 ring-rose-300",
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isToolSlug(slug)) return { title: "Page introuvable", robots: { index: false } };

  const locale = toLocale(lang);
  const content = getToolContent(slug, locale);
  const path = `${HUB}/${slug}`;
  const indexable = locale !== "ar" || AR_READY;

  return {
    title: content.metaTitle,
    description: content.metaDesc,
    alternates: AR_READY ? localizedAlternates(path, locale) : frenchOnlyAlternates(path),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: content.metaTitle,
      description: content.metaDesc,
      url: path,
      type: "article",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
    twitter: { card: "summary", title: content.metaTitle, description: content.metaDesc },
  };
}

export default async function ToolPage({ params }: { params: Params }) {
  const { lang, slug: rawSlug } = await params;
  if (!isToolSlug(rawSlug)) notFound();
  const slug: ToolSlug = rawSlug;

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.tools;
  const def = TOOLS[slug];
  const content = getToolContent(slug, locale);
  const related = await getToolRelated(slug, locale);

  const path = `${HUB}/${slug}`;
  const url = abs(locale, path);
  const reviewedAt = new Date(def.reviewed);
  const reviewedDate = new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(reviewedAt);

  const otherTools = TOOL_SLUGS.filter((s) => s !== slug).map((s) => ({
    slug: s,
    name: getToolContent(s, locale).name,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        "name": content.h1,
        "description": content.metaDesc,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "WebSite", "@id": `${BASE}#website` },
        "lastReviewed": def.reviewed,
        "reviewedBy": { "@type": "Organization", "name": "Rédaction médicale SantéauMaroc", "url": BASE },
        ...(related.specialty && {
          "about": { "@type": "MedicalSpecialty", "name": related.specialty.name },
        }),
        "audience": { "@type": "MedicalAudience", "audienceType": "Patient" },
        "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".tool-intro"] },
        "citation": content.sources.map((s) => ({
          "@type": "CreativeWork",
          "name": s.label,
          ...(s.publisher && { "publisher": { "@type": "Organization", "name": s.publisher } }),
          ...(s.url && { "url": s.url }),
        })),
      },
      {
        // L'outil lui-même est une application web gratuite : c'est ce qui le
        // distingue d'un article et ce qui le rend éligible aux résultats d'outils.
        "@type": "WebApplication",
        "@id": `${url}#app`,
        "name": content.name,
        "url": url,
        "applicationCategory": "HealthApplication",
        "operatingSystem": "Tout navigateur web",
        "browserRequirements": "JavaScript",
        "isAccessibleForFree": true,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "MAD" },
        "publisher": { "@type": "Organization", "name": "SantéauMaroc", "url": BASE },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.listTitle, "item": abs(locale, HUB) },
          { "@type": "ListItem", "position": 3, "name": content.name, "item": url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Le layout (site) fournit déjà le <main> — pas de second landmark. */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <nav aria-label={dict.blog.breadcrumbAria} className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href={HUB} className="hover:text-primary-700 font-medium">{t.listTitle}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium" dir="auto">{content.name}</span>
        </nav>

        {/* ── Héro ─────────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-secondary-50/40 px-6 py-8 sm:px-10 sm:py-11 mb-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-100/50 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 ring-1 ring-primary-200 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-700 mb-4">
              <ToolIcon slug={slug} className="w-3.5 h-3.5" />
              {t.eyebrow}
            </span>
            <h1 className="text-[1.7rem] leading-tight sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl" dir="auto">
              {content.h1}
            </h1>
            <p className="tool-intro mt-4 text-[17px] text-slate-600 leading-relaxed max-w-3xl" dir="auto">
              {content.intro}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5" dir="auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 ring-1 ring-secondary-200 px-3 py-1.5 text-xs font-semibold text-secondary-800">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 10.5 9.5 12.5 13 8.5" /><circle cx="10" cy="10" r="8" /></svg>
                {t.trustVerified}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10.5V7a5 5 0 0 1 10 0v3.5" /><rect x="4" y="10.5" width="12" height="7" rx="2" /></svg>
                {t.trustLocal}
              </span>
              <span className="text-xs text-slate-500">{t.updatedOn.replace("{date}", reviewedDate)}</span>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
          <article className="min-w-0">
            {/* ── Le calculateur (seul îlot client de la page) ─────────── */}
            <ToolCalculator
              slug={slug}
              locale={locale}
              t={{
                formTitle: t.formTitle,
                submit: t.submit,
                reset: t.reset,
                resultTitle: t.resultTitle,
                resultEmpty: t.resultEmpty,
                privacyNote: t.privacyNote,
                errorSummary: t.errorSummary,
                emergencyTitle: t.emergencyTitle,
                selectPlaceholder: t.selectPlaceholder,
                resultLabel: content.resultLabel,
                errors: t.errors,
                units: t.units,
                severity: t.severity,
                fields: content.fields,
                options: content.options ?? {},
                categories: content.categories,
                detailLabels: content.detailLabels,
                notes: content.notes,
                columns: content.columns,
              }}
            />

            {/* ── Table de référence : le contenu indexable, servi sans JS ── */}
            <section aria-labelledby="ref-title" className="mt-10">
              <h2 id="ref-title" className="text-xl font-bold text-slate-900 mb-4">{t.refTitle}</h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm border-collapse">
                  <caption className="caption-bottom p-4 text-xs text-slate-500 text-start leading-relaxed" dir="auto">
                    {content.refCaption}
                  </caption>
                  <thead>
                    <tr className="bg-slate-50">
                      <th scope="col" className="text-start px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                        {content.refColumns.category}
                      </th>
                      <th scope="col" className="text-start px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                        {content.refColumns.range}
                      </th>
                      <th scope="col" className="text-start px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t.refInterpretation}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {def.categories.map(({ key, severity }) => {
                      const cat = content.categories[key];
                      if (!cat) return null;
                      return (
                        <tr key={key} className="border-t border-slate-100 align-top">
                          <th scope="row" className="px-4 py-3.5 text-start font-semibold text-slate-900" dir="auto">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${SEVERITY_CHIP[severity]}`}>
                              {cat.label}
                            </span>
                          </th>
                          <td className="px-4 py-3.5 font-medium text-slate-700 tabular-nums whitespace-nowrap" dir="auto">
                            {cat.range}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 leading-relaxed" dir="auto">
                            {cat.advice}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Méthode de calcul (transparence) ────────────────────── */}
            <section aria-labelledby="howto-title" className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 id="howto-title" className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2.5">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8v4l-3 3 3 3v4H6v-4l3-3-3-3V3z" /></svg>
                {t.howToTitle}
              </h2>
              <ol className="space-y-3 list-none m-0 p-0">
                {content.howTo.map((step, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 leading-relaxed" dir="auto">
                    <span aria-hidden="true" className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700 tabular-nums">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── Limites : garde-fou YMYL, jamais masqué ─────────────── */}
            <section aria-labelledby="limits-title" className="mt-8 rounded-2xl border border-accent-200 bg-accent-50/50 p-5 sm:p-6">
              <h2 id="limits-title" className="text-lg font-bold text-accent-900 mb-3 flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 text-accent-700" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M10 6.5v4M10 13.5h.01" /></svg>
                {t.limitsTitle}
              </h2>
              <ul className="space-y-2">
                {content.limits.map((l, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-accent-900/90 leading-relaxed" dir="auto">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── Conversion : praticiens réservables de la spécialité ── */}
            {related.specialty && (
              <RelatedDoctors
                specialtySlug={related.specialty.slug}
                specialtyLabel={related.specialty.plural}
                t={dict.card}
                tb={dict.blog}
                locale={locale}
              />
            )}

            {/* ── Maillage vers le catalogue (résolu en base) ─────────── */}
            {related.topics.length > 0 && (
              <section aria-labelledby="related-topics-title" className="mt-10">
                <h2 id="related-topics-title" className="text-sm font-bold uppercase tracking-widest text-secondary-600 mb-3">
                  {t.relatedTopicsTitle}
                </h2>
                <ul className="flex flex-wrap gap-2.5">
                  {related.topics.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:border-secondary-300 hover:text-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
                        dir="auto"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {related.exams.length > 0 && (
              <section aria-labelledby="related-exams-title" className="mt-6">
                <h2 id="related-exams-title" className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
                  {t.relatedExamsTitle}
                </h2>
                <ul className="flex flex-wrap gap-2.5">
                  {related.exams.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:border-primary-300 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        dir="auto"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <BlogFaq items={content.faq} t={dict.blog} />

            <ArticleSources items={content.sources} t={dict.blog} />

            <EditorialReviewNote reviewedAt={reviewedAt} locale={locale} tb={dict.blog} />

            {/* ── Autres outils du cluster ───────────────────────────── */}
            <section aria-labelledby="other-tools-title" className="mt-10 pt-8 border-t border-slate-100">
              <h2 id="other-tools-title" className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
                {t.otherToolsTitle}
              </h2>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {otherTools.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`${HUB}/${o.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-primary-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      dir="auto"
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <ToolIcon slug={o.slug} className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-primary-700">{o.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <p className="text-xs text-slate-400 mt-10 leading-relaxed" dir="auto">{t.disclaimer}</p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link href={HUB} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
                {t.listTitle}
              </Link>
            </div>
          </article>

          {/* ══ Panneau de conversion (sticky, desktop) ══ */}
          {related.specialty && (
            <aside className="hidden lg:block" aria-label={t.asideTitle}>
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary-600 ring-1 ring-primary-100 mb-3" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v5a4 4 0 0 0 8 0V2M10 11v3a4 4 0 0 0 4 4 3 3 0 0 0 3-3v-1" /><circle cx="17" cy="12" r="1.5" /></svg>
                  </span>
                  <h2 className="font-bold text-slate-900 text-lg leading-snug">{t.asideTitle}</h2>
                  <p className="text-sm text-slate-500 mt-1 mb-4">{t.asideSubtitle}</p>
                  <Link href={`/specialites/${related.specialty.slug}`} className="btn-primary w-full">
                    {t.ctaSpecialty.replace("{specialty}", related.specialty.name)}
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                  </Link>

                  {related.altSpecialties.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {related.altSpecialties.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/specialites/${s.slug}`}
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-700"
                            dir="auto"
                          >
                            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m4 2 4 4-4 4" /></svg>
                            {t.seeSpecialty.replace("{specialty}", s.plural)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link href={`/specialites/${GENERALIST_SLUG}`} className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-700">
                    {t.asideFindGeneralist}
                  </Link>
                </div>

                {/* Rappel urgence — repère de sécurité toujours visible */}
                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex items-start gap-3">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6v5M10 14h.01M8.6 2.9 1.7 15a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L11.4 2.9a1.6 1.6 0 0 0-2.8 0z" /></svg>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{t.urgencyNote}</p>
                    <p className="text-sm text-rose-900 leading-snug mt-0.5">{dict.symptoms.emergencyNote}</p>
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
