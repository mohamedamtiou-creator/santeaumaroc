import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { localizedAlternates, frenchOnlyAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";
import { glossaryLocalized, isGlossaryArReady, isGlossaryReviewed, normalizeCategory } from "@/lib/glossary";
import { ArticleSources, parseSources } from "@/components/blog/ArticleSources";

export const revalidate = 3600;

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
  const title = `${L.term} : définition`;
  const description = L.definition.slice(0, 160);

  const arReady = isGlossaryArReady(term);
  // Verrou d'indexation : FR non relu → noindex ; AR non prêt → noindex de la vue AR.
  const indexable = isGlossaryReviewed(term) && (locale !== "ar" || arReady);

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
  const t = getDictionary(locale).glossary;
  const tb = getDictionary(locale).blog;
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

      <main className="page-outer">
        <div className="max-w-2xl mx-auto">
          {/* Fil d'Ariane */}
          <nav aria-label={t.breadcrumb} className="text-sm text-slate-500 mb-6">
            <Link href="/glossaire" className="hover:text-primary-700 font-medium">{t.title}</Link>
          </nav>

          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-2">{t.cats[cat]}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3" dir="auto">{L.term}</h1>
          {term.synonyms.length > 0 && (
            <p className="text-sm text-slate-500 mb-6" dir="auto">
              <span className="font-semibold text-slate-600">{t.alsoCalled} :</span> {term.synonyms.join(" · ")}
            </p>
          )}

          {/* Définition (réponse courte extractible IA) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t.definitionLabel}</p>
            <p className="text-lg text-slate-800 leading-relaxed" dir="auto">{L.definition}</p>
          </div>

          {/* Sources (réutilise le bloc article) */}
          <ArticleSources items={sources} t={tb} />

          {/* Maillage : spécialité concernée → conversion RDV */}
          {term.specialty && (
            <section className="mt-8 rounded-2xl border border-primary-100 bg-primary-50/50 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-2">{t.relatedSpecialtyTitle}</p>
              <Link
                href={`/specialites/${term.specialty.slug}`}
                className="inline-flex items-center gap-2 text-base font-semibold text-primary-700 hover:text-primary-800"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
                {t.relatedSpecialtyCta.replace("{specialty}", term.specialty.name)}
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
      </main>
    </>
  );
}
