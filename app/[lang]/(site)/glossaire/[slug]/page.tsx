import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { labelWithoutGloss } from "@/lib/utils";
import { getDictionary, toLocale } from "@/lib/i18n";
import { glossaryLocalized, isGlossaryArReady, isGlossaryReviewed, normalizeCategory } from "@/lib/glossary";
import { isGlossaryIndexable } from "@/lib/glossary-quality";
import { tSpecialty } from "@/lib/specialty-i18n";
import { ArticleSources, parseSources } from "@/components/blog/ArticleSources";
import { DetailHero } from "@/components/health/DetailHero";

export const revalidate = 86400; // TTL.DIRECTORY

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type Params = Promise<{ lang: string; slug: string }>;

export async function generateStaticParams() {
  const terms = await prisma.glossaryTerm.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return terms.map((t) => ({ slug: t.slug }));
}

const getTerm = cache((slug: string) =>
  prisma.glossaryTerm.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { specialty: { select: { slug: true, name: true } } },
  }),
);

// @type schema.org de l'entité médicale selon la catégorie du terme.
const MEDICAL_TYPE: Record<string, string> = {
  symptome: "MedicalSymptom",
  maladie: "MedicalCondition",
  examen: "MedicalTest",
  traitement: "MedicalProcedure",
  anatomie: "AnatomicalStructure",
  general: "MedicalEntity",
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const term = await getTerm(slug);
  if (!term) return { title: "Terme introuvable", robots: { index: false } };

  const locale = toLocale(lang);
  const L = glossaryLocalized(term, locale);
  // Gabarit aligné sur la langue du CONTENU servi (cf. /maladies).
  const title = getDictionary(L.isArabic ? "ar" : "fr").glossary.itemMetaTitle.replace("{term}", labelWithoutGloss(L.term));
  const description = L.definition.slice(0, 160);

  const arReady = isGlossaryArReady(term);
  // Verrou d'indexation à deux étages :
  //  1. relecture — FR non relu → noindex ; AR non prêt → noindex de la vue AR ;
  //  2. fond — une définition trop courte pour mériter son URL reste crawlée
  //     mais non indexée (cf. lib/glossary-quality : anti-pages minces).
  const reviewLocksPass = isGlossaryReviewed(term) && (locale !== "ar" || arReady);
  const indexable = isGlossaryIndexable(term, reviewLocksPass);

  return {
    title,
    description,
    alternates: arReady ? localizedAlternates(`/glossaire/${slug}`, locale) : frenchOnlyAlternates(`/glossaire/${slug}`),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title, description, url: `/glossaire/${slug}`, type: "article", locale: L.isArabic ? "ar_MA" : "fr_MA" },
  };
}

export default async function GlossaryTermPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const term = await getTerm(slug);
  if (!term) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const t = dict.glossary;
  const tb = dict.blog;
  const L = glossaryLocalized(term, locale);
  const cat = normalizeCategory(term.category);
  const sources = parseSources(L.sources);
  const url = `${locale === "ar" ? `${BASE}/ar` : BASE}/glossaire/${slug}`;

  // Article pilier lié (maillage) — titre récupéré pour un libellé honnête.
  const relatedPost = term.relatedSlug
    ? await prisma.post.findUnique({ where: { slug: term.relatedSlug, status: "PUBLISHED" }, select: { slug: true, title: true } })
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        "@id": `${url}#term`,
        "name": L.term,
        "description": L.definition,
        "inDefinedTermSet": `${BASE}/glossaire#set`,
        "url": url,
        "inLanguage": L.isArabic ? "ar-MA" : "fr-MA",
        ...(term.synonyms.length > 0 && { "alternateName": term.synonyms }),
        "about": { "@type": MEDICAL_TYPE[cat] ?? "MedicalEntity", "name": L.term },
        ...(sources.length > 0 && {
          "citation": sources.map((s) => ({
            "@type": "CreativeWork",
            "name": s.label,
            ...(s.publisher && { "publisher": { "@type": "Organization", "name": s.publisher } }),
            ...(s.url && { "url": s.url }),
          })),
        }),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": locale === "ar" ? "الرئيسية" : "Accueil", "item": BASE },
          { "@type": "ListItem", "position": 2, "name": t.breadcrumb, "item": `${locale === "ar" ? `${BASE}/ar` : BASE}/glossaire` },
          { "@type": "ListItem", "position": 3, "name": L.term, "item": url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        {/* Fil d'Ariane */}
        <nav aria-label={t.breadcrumb} className="text-sm text-slate-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/glossaire" className="hover:text-primary-700 font-medium">{t.title}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium" dir="auto">{L.term}</span>
        </nav>

        <DetailHero
          eyebrow={t.cats[cat]}
          title={L.term}
          synonyms={term.synonyms}
          alsoCalledLabel={t.alsoCalled}
          reviewedAt={term.reviewedAt}
          locale={locale}
          chips={dict.healthHub}
        />

        {/* Définition (réponse courte extractible IA) */}
        <div className="relative rounded-2xl border border-primary-100 bg-primary-50/40 p-5 sm:p-6 mb-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600 mb-2.5">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h8l3 3v11H5z" /><path d="M13 3v3h3M8 10h5M8 13h5" /></svg>
            {t.definitionLabel}
          </p>
          <p className="text-lg text-slate-800 leading-relaxed" dir="auto">{L.definition}</p>
        </div>

        {/* Sources (réutilise le bloc article) */}
        <ArticleSources items={sources} t={tb} />

        {/* Maillage : spécialité concernée → conversion RDV */}
        {term.specialty && (
          <section className="mt-8 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-600 ring-1 ring-primary-100" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v5a4 4 0 0 0 8 0V2M10 11v3a4 4 0 0 0 4 4 3 3 0 0 0 3-3v-1" /><circle cx="17" cy="12" r="1.5" /></svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-0.5">{t.relatedSpecialtyTitle}</p>
                <p className="font-semibold text-slate-900 leading-snug" dir="auto">{tSpecialty(term.specialty.name, locale)}</p>
              </div>
            </div>
            <Link href={`/specialites/${term.specialty.slug}`} className="btn-primary shrink-0 whitespace-nowrap">
              {t.relatedSpecialtyCta.replace("{specialty}", tSpecialty(term.specialty.name, locale))}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
            </Link>
          </section>
        )}

        {/* Maillage : article de fond lié */}
        {relatedPost && (
          <section className="mt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t.relatedArticleTitle}</p>
            <Link href={`/blog/${relatedPost.slug}`} className="text-base font-semibold text-primary-700 hover:text-primary-800" dir="auto">
              {relatedPost.title}
            </Link>
          </section>
        )}

        <p className="text-xs text-slate-400 mt-10 leading-relaxed">{t.disclaimer}</p>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link href="/glossaire" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m10 3-5 5 5 5" /></svg>
            {t.backToGlossary}
          </Link>
        </div>
      </div>
    </>
  );
}
