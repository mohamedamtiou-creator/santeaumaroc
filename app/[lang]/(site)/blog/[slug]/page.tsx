import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PostCard, type PostCardData } from "@/components/blog/PostCard";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { TableOfContents, extractHeadings, addHeadingIds } from "@/components/blog/TableOfContents";
import { KeyTakeaways } from "@/components/blog/KeyTakeaways";
import { BlogFaq, type FaqItem } from "@/components/blog/BlogFaq";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { NewsletterSignup } from "@/components/blog/NewsletterSignup";
import { incrementViews } from "@/features/blog/actions";
import { relatedSpecialty, specialtyCityLinks } from "@/lib/blog-related";
import { RelatedDoctors } from "@/components/blog/RelatedDoctors";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale, type Dictionary } from "@/lib/i18n";
import { InArticleAds } from "@/components/ads/InArticleAds";
import { adsActive } from "@/lib/ads/config";

type BlogT = Dictionary["blog"];

export const revalidate = 3600;

// Pré-rend chaque article publié en HTML statique (× locales fr/ar fournies par
// le layout [lang]). Les nouveaux articles sont générés à la demande puis mis en
// cache (dynamicParams par défaut).
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type Params = Promise<{ lang: string; slug: string }>;

const getPost = cache(async (slug: string) => {
  return prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: { select: { name: true, slug: true, color: true } },
      author:   { select: { name: true, avatar: true, jobTitle: true, credentials: true, bio: true, registrationNumber: true } },
      reviewedBy: { select: { name: true, jobTitle: true, credentials: true } },
      // Cocon sémantique : pilier parent + satellites publiés
      pillar:   { select: { slug: true, title: true } },
      satellites: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: { slug: true, title: true, readingTime: true },
      },
    },
  });
});

// ── Helpers parsing des champs GEO ──────────────────────────────────────────
function parseTakeaways(s: string | null): string[] {
  if (!s) return [];
  return s.split(/\r?\n/).map((l) => l.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
}
function parseFaq(s: string | null): FaqItem[] {
  if (!s) return [];
  try {
    const arr = JSON.parse(s);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.q === "string" && typeof x.a === "string")
      .map((x) => ({ q: x.q.trim(), a: x.a.trim() }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article introuvable", robots: { index: false } };

  const title       = post.metaTitle || post.title;
  const description = post.metaDesc  || post.excerpt;

  const locale = toLocale(lang);
  return {
    title,
    description,
    alternates: localizedAlternates(`/blog/${slug}`, locale),
    // og:image / twitter:image sont fournis par opengraph-image.tsx (carte
    // dynamique : titre + catégorie + badge relecture sur la cover).
    openGraph: {
      title,
      description,
      url: `/blog/${slug}`,
      type: "article",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
      publishedTime:  post.publishedAt?.toISOString(),
      modifiedTime:   post.updatedAt.toISOString(),
      section: post.category.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function fmtDate(d: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(d));
}

const COLOR_MAP: Record<string, string> = {
  blue:   "bg-primary-50 text-primary-700 border-primary-200",
  green:  "bg-secondary-50 text-secondary-700 border-secondary-200",
  amber:  "bg-amber-50 text-amber-700 border-amber-200",
  rose:   "bg-rose-50 text-rose-700 border-rose-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

// ── Sub-components ──────────────────────────────────────────────────────────

function MedicalReviewedBadge({ t }: { t: BlogT }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-700 bg-secondary-50 border border-secondary-200 px-2.5 py-1 rounded-full">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5 2.5 4v3.5c0 3 2.3 5.3 5.5 6.5 3.2-1.2 5.5-3.5 5.5-6.5V4L8 1.5z"/><path d="m5.8 8 1.6 1.6L10.5 6.5"/>
      </svg>
      {t.medicallyReviewed}
    </span>
  );
}

function MedicalDisclaimer({ t }: { t: BlogT }) {
  return (
    <aside
      role="note"
      aria-label={t.disclaimerAria}
      className="mt-10 p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl flex gap-3"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2 2 17h16L10 2z"/><path d="M10 8v4"/><circle cx="10" cy="14.5" r=".5" fill="currentColor"/>
      </svg>
      <div>
        <p className="text-xs font-bold text-amber-800 mb-1">{t.disclaimerTitle}</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          {t.disclaimerBody}
        </p>
      </div>
    </aside>
  );
}

function DoctorCTA({
  categoryName, t, locale, specialtySlug, specialtyLabel,
}: {
  categoryName: string; t: BlogT; locale: string;
  specialtySlug: string | null; specialtyLabel: string | null;
}) {
  const [pre, post] = t.ctaText.split("{category}");
  const href = specialtySlug ? `/specialites/${specialtySlug}` : "/praticiens";
  const cta = specialtySlug && specialtyLabel
    ? t.seeSpecialists.replace("{specialty}", specialtyLabel)
    : t.heroCta;
  return (
    <div className="mt-10 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 p-6 sm:p-8 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-bold text-lg mb-1">{t.ctaTitle}</p>
          <p className="text-white/80 text-sm leading-relaxed">
            {pre}<strong className="text-white">{categoryName}</strong>{post}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors shadow-sm"
        >
          {cta}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 3 5 5-5 5"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// CTA B2B : articles de la catégorie « Médecins » → recrutement praticiens.
function DoctorRecruitCTA({ t }: { t: BlogT }) {
  return (
    <div className="mt-10 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary-600 to-primary-600 p-6 sm:p-8 text-white">
      <p className="font-bold text-lg mb-1">{t.recruitCtaTitle}</p>
      <p className="text-white/85 text-sm leading-relaxed mb-5 max-w-xl">{t.recruitCtaText}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/inscription-praticien"
          className="inline-flex items-center gap-2 bg-white text-secondary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors shadow-sm"
        >
          {t.recruitCtaPrimary}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5"/></svg>
        </Link>
        <Link
          href="/tarifs"
          className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/25 transition-colors"
        >
          {t.recruitCtaSecondary}
        </Link>
      </div>
    </div>
  );
}

// Maillage local : liens « {spécialité} à {ville} » vers /specialites/[slug]/[ville]
function SpecialtyCityLinks({
  links, specialty, tb,
}: {
  links: { href: string; city: string }[]; specialty: string; tb: BlogT;
}) {
  if (links.length === 0) return null;
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="city-links-title">
      <h2 id="city-links-title" className="font-bold text-slate-900 text-base mb-1">
        {tb.inCitiesTitle.replace("{specialty}", specialty)}
      </h2>
      <p className="text-sm text-slate-500 mb-4">{tb.inCitiesSubtitle}</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-secondary-50 text-secondary-700 hover:bg-secondary-100 transition-colors"
          >
            {tb.seeInCity.replace("{specialty}", specialty).replace("{city}", l.city)}
          </Link>
        ))}
      </div>
    </section>
  );
}

// Cocon — bannière satellite → pilier : « Cet article fait partie du dossier : … »
function PillarBanner({ pillar, tb }: { pillar: { slug: string; title: string }; tb: BlogT }) {
  return (
    <aside className="mb-8 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3.5 flex items-center gap-3" aria-label={tb.coconPillarLabel}>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 shrink-0 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h7l1.5 1.5H14V13H2z"/>
      </svg>
      <p className="text-sm text-slate-600 leading-snug">
        {tb.coconPillarIntro}{" "}
        <Link href={`/blog/${pillar.slug}`} className="font-semibold text-primary-700 hover:text-primary-800 underline-offset-2 hover:underline">
          {pillar.title}
        </Link>
      </p>
    </aside>
  );
}

// Cocon — bloc pilier → satellites : « Dans ce dossier »
function CoconFolder({
  satellites, tb,
}: {
  satellites: { slug: string; title: string; readingTime: number | null }[]; tb: BlogT;
}) {
  if (satellites.length === 0) return null;
  return (
    <section className="mt-10 rounded-2xl border border-primary-200 bg-primary-50/60 p-5 sm:p-6" aria-labelledby="cocon-title">
      <h2 id="cocon-title" className="flex items-center gap-2 font-bold text-slate-900 text-base mb-1">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h7l1.5 1.5H14V13H2z"/>
        </svg>
        {tb.coconFolderTitle}
      </h2>
      <p className="text-sm text-slate-500 mb-4">{tb.coconFolderSubtitle}</p>
      <ul className="flex flex-col divide-y divide-primary-100">
        {satellites.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/blog/${s.slug}`}
              className="group flex items-center justify-between gap-3 py-2.5 text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              <span className="underline-offset-2 group-hover:underline">{s.title}</span>
              {s.readingTime && (
                <span className="text-xs text-slate-400 font-normal whitespace-nowrap">
                  {tb.readingTimeShort.replace("{n}", String(s.readingTime))}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-300 shrink-0" aria-hidden="true">
      <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const locale = toLocale(lang);
  const dict = getDictionary(locale);
  const tb = dict.blog;

  const related = await prisma.post.findMany({
    where: { status: "PUBLISHED", category: { slug: post.category.slug }, slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      title: true, slug: true, excerpt: true, coverImage: true, coverAlt: true,
      readingTime: true, publishedAt: true,
      category: { select: { name: true, slug: true, color: true } },
      author:   { select: { name: true, avatar: true } },
    },
  });

  void incrementViews(slug);

  const headings      = extractHeadings(post.content);
  const contentHtml   = addHeadingIds(post.content);
  const hasToc        = headings.length >= 2;
  const colorCls      = COLOR_MAP[post.category.color] ?? COLOR_MAP.blue;
  const initial       = post.author.name.charAt(0).toUpperCase();
  const articleUrl    = `${BASE}/blog/${slug}`;

  const takeaways = parseTakeaways(post.keyTakeaways);
  const faqItems  = parseFaq(post.faqJson);
  const relSpec   = relatedSpecialty(slug, post.category.slug);
  const specLabel = relSpec ? (locale === "ar" ? relSpec.labelAr : relSpec.labelFr) : null;
  // Cocon B2B : les articles « Médecins » ciblent les praticiens, pas les patients.
  // On y substitue le widget RDV / disclaimer patient par un CTA de recrutement.
  const isDoctorAudience = post.category.slug === "medecins";

  // Publicité in-article : uniquement si activée (flags) ET audience patient.
  // Les articles B2B « médecins » ciblent le recrutement praticien → pas de pub.
  const showAds = adsActive("blog") && !isDoctorAudience;

  // Dates : publication, mise à jour, vérification médicale
  const showUpdated =
    post.publishedAt && post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000;

  // ── JSON-LD : Article + MedicalWebPage (E-E-A-T / YMYL) + BreadcrumbList ──
  const articleNode: Record<string, unknown> = {
    "@type": ["Article", "MedicalWebPage"],
    "@id": `${articleUrl}#article`,
    "headline": post.title,
    "description": post.excerpt,
    "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
    "datePublished": post.publishedAt?.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "author": {
      "@type": "Person",
      "name": post.author.name,
      ...(post.author.jobTitle && { "jobTitle": post.author.jobTitle }),
      ...(post.author.credentials && { "description": post.author.credentials }),
      "knowsAbout": post.category.name,
    },
    "publisher": {
      "@type": "Organization",
      "name": "SantéauMaroc",
      "url": BASE,
      "logo": { "@type": "ImageObject", "url": `${BASE}/logo.svg` },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": articleUrl },
    "articleSection": post.category.name,
    // `about: MedicalCondition` uniquement si une vraie entité médicale est
    // renseignée — les articles de parcours / B2B ne sont pas des pathologies.
    ...(post.aboutEntity && {
      "about": { "@type": "MedicalCondition", "name": post.aboutEntity },
    }),
    ...(post.reviewedAt && { "lastReviewed": post.reviewedAt.toISOString() }),
    ...(post.reviewedBy && {
      "reviewedBy": {
        "@type": "Person",
        "name": post.reviewedBy.name,
        ...(post.reviewedBy.jobTitle && { "jobTitle": post.reviewedBy.jobTitle }),
      },
    }),
    ...(post.coverImage && { "image": post.coverImage }),
    // Régions les plus « lisibles à voix haute » / extractibles par les IA :
    // le titre et l'encadré « À retenir » (TL;DR placé en tête).
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".blog-takeaways"],
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      articleNode,
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil",    "item": BASE },
          { "@type": "ListItem", "position": 2, "name": "Blog Santé", "item": `${BASE}/blog` },
          { "@type": "ListItem", "position": 3, "name": post.category.name, "item": `${BASE}/blog/categorie/${post.category.slug}` },
          { "@type": "ListItem", "position": 4, "name": post.title,   "item": articleUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Barre de progression de lecture */}
      <ReadingProgress />

      {/* ── Layout principal ─────────────────────────────── */}
      <div className="max-w-2xl xl:max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className={hasToc ? "xl:flex xl:gap-10" : ""}>

          {/* ── Colonne article ────────────────────────── */}
          <article className="flex-1 min-w-0">

            {/* Fil d'Ariane */}
            <nav aria-label={tb.breadcrumbAria} className="flex items-center gap-1.5 text-sm text-slate-500 mb-8 flex-wrap">
              <Link href="/" className="hover:text-secondary-600 transition-colors">{tb.home}</Link>
              <Chevron />
              <Link href="/blog" className="hover:text-secondary-600 transition-colors">{tb.heroBadge}</Link>
              <Chevron />
              <Link href={`/blog/categorie/${post.category.slug}`} className="hover:text-secondary-600 transition-colors">
                {post.category.name}
              </Link>
            </nav>

            {/* Header article */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${colorCls}`}>
                  {post.category.name}
                </span>
                {post.reviewedAt && <MedicalReviewedBadge t={tb} />}
                {post.readingTime && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                    {tb.readingTimeLong.replace("{n}", String(post.readingTime))}
                  </span>
                )}
              </div>

              <h1 dir="auto" className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
                {post.title}
              </h1>
              <p dir="auto" className="text-lg text-slate-600 leading-relaxed mb-6">{post.excerpt}</p>

              {/* Auteur + relecteur + dates */}
              <div className="flex items-start gap-4 flex-wrap border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2.5">
                  {post.author.avatar ? (
                    <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0" aria-hidden="true">
                      <span className="text-sm font-bold text-primary-700">{initial}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      <span className="text-slate-400 font-normal">{tb.writtenBy} </span>
                      {post.author.name}
                    </p>
                    {post.author.jobTitle && (
                      <p className="text-xs text-slate-500">{post.author.jobTitle}</p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5 sm:ms-auto sm:text-end">
                  {post.publishedAt && (
                    <p>
                      <time dateTime={post.publishedAt.toISOString()}>
                        {tb.publishedOn.replace("{date}", fmtDate(post.publishedAt, locale))}
                      </time>
                    </p>
                  )}
                  {showUpdated && (
                    <p>
                      <time dateTime={post.updatedAt.toISOString()}>
                        {tb.updatedOn.replace("{date}", fmtDate(post.updatedAt, locale))}
                      </time>
                    </p>
                  )}
                  {post.reviewedBy ? (
                    <p className="text-secondary-700 font-medium">
                      {tb.reviewedByLabel} {post.reviewedBy.name}
                      {post.reviewedBy.jobTitle ? ` · ${post.reviewedBy.jobTitle}` : ""}
                    </p>
                  ) : post.reviewedAt && (
                    <p className="text-secondary-700 font-medium">
                      <time dateTime={post.reviewedAt.toISOString()}>
                        {tb.reviewedOn.replace("{date}", fmtDate(post.reviewedAt, locale))}
                      </time>
                    </p>
                  )}
                </div>
              </div>
            </header>

            {/* Sommaire mobile (collapsible) */}
            {hasToc && (
              <details className="xl:hidden mb-8 rounded-xl border border-slate-200 bg-white overflow-hidden group">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-slate-700 [&::-webkit-details-marker]:hidden list-none select-none">
                  <span className="flex items-center gap-2">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-slate-500" aria-hidden="true" strokeLinecap="round"><path d="M2 4h12M2 8h8M2 12h10"/></svg>
                    {tb.tocMobile.replace("{n}", String(headings.length))}
                  </span>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m4 6 4 4 4-4"/>
                  </svg>
                </summary>
                <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                  <TableOfContents headings={headings} t={tb} />
                </div>
              </details>
            )}

            {/* Image de couverture */}
            {post.coverImage && (
              <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 relative">
                <Image src={post.coverImage} alt={post.coverAlt || post.title} fill sizes="(max-width: 768px) 100vw, 768px" quality={65} className="object-cover" priority />
              </div>
            )}

            {/* À retenir (TL;DR) — placé en tête pour l'extraction IA */}
            <KeyTakeaways items={takeaways} t={tb} />

            {/* Cocon : rattachement au pilier (article satellite) */}
            {post.pillar && <PillarBanner pillar={post.pillar} tb={tb} />}

            {/* Contenu — encarts AdSense interleavés entre les H2 si la pub est
                active (sinon rendu identique : un seul bloc `blog-prose`). */}
            <InArticleAds html={contentHtml} active={showAds} />

            {/* Cocon : « Dans ce dossier » (article pilier → satellites) */}
            <CoconFolder satellites={post.satellites} tb={tb} />

            {/* Maillage annuaire : praticiens réservables de la spécialité associée
                — placé juste après la lecture, au moment d'agir (article → RDV).
                Masqué pour les articles B2B (audience médecin). */}
            {!isDoctorAudience && relSpec && specLabel && (
              <RelatedDoctors
                specialtySlug={relSpec.slug}
                specialtyLabel={specLabel}
                t={dict.card}
                tb={tb}
                locale={locale}
              />
            )}

            {/* FAQ (visible + JSON-LD FAQPage) */}
            <BlogFaq items={faqItems} t={tb} />

            {/* Disclaimer médical légal — non pertinent pour les articles médecins */}
            {!isDoctorAudience && <MedicalDisclaimer t={tb} />}

            {isDoctorAudience ? (
              /* Cocon Médecins : CTA recrutement (profil + abonnement) */
              <DoctorRecruitCTA t={tb} />
            ) : relSpec && specLabel ? (
              /* Maillage local : « {spécialité} à {ville} » vers les pages ville */
              <SpecialtyCityLinks links={specialtyCityLinks(relSpec)} specialty={specLabel} tb={tb} />
            ) : (
              /* Repli générique : bannière « trouver un médecin » (articles non mappés) */
              <DoctorCTA
                categoryName={post.category.name}
                t={tb}
                locale={locale}
                specialtySlug={null}
                specialtyLabel={null}
              />
            )}

            {/* À propos de l'auteur (E-E-A-T) */}
            <AuthorBio author={post.author} t={tb} />

            {/* Capture newsletter (CRO) */}
            <div className="mt-10">
              <NewsletterSignup t={tb} locale={locale} source={`article:${slug}`} compact />
            </div>

            {/* Footer article : retour + partage */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-700 transition-colors"
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m10 3-5 5 5 5"/>
                  </svg>
                  {tb.backToBlog}
                </Link>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>
                  {tb.views.replace("{n}", String(post.views))}
                </span>
              </div>
              <ShareButtons title={post.title} url={articleUrl} t={tb} />
            </div>

          </article>

          {/* ── TOC desktop sidebar ─────────────────── */}
          {hasToc && (
            <aside className="hidden xl:block w-52 shrink-0" aria-label={tb.tocTitle}>
              <div className="sticky top-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <TableOfContents headings={headings} t={tb} />
              </div>
            </aside>
          )}

        </div>
      </div>

      {/* ── Articles similaires ───────────────────── */}
      {related.length > 0 && (
        <section className="bg-slate-50 py-12 mt-4" aria-labelledby="related-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="related-title" className="text-xl font-bold text-slate-900 mb-6">
              {tb.related}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <PostCard key={r.slug} post={r as PostCardData} t={tb} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
