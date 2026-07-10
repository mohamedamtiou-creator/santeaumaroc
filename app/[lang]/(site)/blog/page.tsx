import { Suspense } from "react";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { PostCard, type PostCardData } from "@/components/blog/PostCard";
import { Pagination } from "@/components/ui/Pagination";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { BlogResults } from "@/components/blog/BlogResults";
import { NewsletterSignup } from "@/components/blog/NewsletterSignup";
import { getBlogPosts, POST_CARD_SELECT, BLOG_PER_PAGE } from "@/lib/blog-query";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type Params = Promise<{ lang: string }>;

// Page STATIQUE : le serveur ne lit plus searchParams. La vue canonique (page 1,
// sans recherche/filtre) est pré-rendue = shell SEO. Recherche `q` / pagination /
// catégorie sont gérées côté client (BlogResults → /api/blog/search), noindex.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  return {
    title: "Blog Santé — Conseils médicaux au Maroc",
    description:
      "Articles de santé rédigés et vérifiés par des professionnels : prévention, nutrition, maladies et bien-être au Maroc.",
    alternates: localizedAlternates("/blog", locale),
    openGraph: {
      title: "Blog Santé — SantéauMaroc",
      description: "Conseils médicaux vérifiés par des professionnels de santé au Maroc.",
      url: "/blog",
      type: "website",
    },
  };
}

async function getCanonicalData() {
  const [{ posts, total }, categories, featured] = await Promise.all([
    getBlogPosts(1),
    prisma.postCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
    }),
    prisma.post.findFirst({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { publishedAt: "desc" },
      select: POST_CARD_SELECT,
    }),
  ]);
  const totalPublished = categories.reduce((s, c) => s + c._count.posts, 0);
  return { posts, total, categories, featured, totalPublished };
}

export default async function BlogPage({ params }: { params: Params }) {
  const locale = toLocale((await params).lang);
  const { posts, total, categories, featured, totalPublished } = await getCanonicalData();
  const dict = getDictionary(locale);
  const tb = dict.blog;
  const totalPages = Math.ceil(total / BLOG_PER_PAGE);

  const buildUrl = (p: number) => `/blog${p > 1 ? `?page=${p}` : ""}`;

  // JSON-LD : Blog + ItemList des articles listés (vue canonique uniquement).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${BASE}/blog#blog`,
        "name": "Blog Santé — SantéauMaroc",
        "description": "Conseils médicaux, prévention et bien-être au Maroc, vérifiés par des professionnels de santé.",
        "url": `${BASE}/blog`,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "publisher": {
          "@type": "Organization",
          "name": "SantéauMaroc",
          "url": BASE,
          "logo": { "@type": "ImageObject", "url": `${BASE}/logo.svg` },
        },
      },
      ...(posts.length
        ? [{
            "@type": "ItemList",
            "itemListElement": posts.map((p, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "url": `${BASE}/blog/${p.slug}`,
              "name": p.title,
            })),
          }]
        : []),
    ],
  };

  // Vue canonique (page 1, sans filtre) rendue côté serveur : contenu du shell
  // statique (fallback <Suspense> = HTML prérendu, indexable) ET contenu affiché
  // tant qu'aucune recherche/filtre/pagination n'est active. Commence par la barre
  // de recherche (une seule barre : BlogResults la re-rend en mode filtré).
  const canonicalContent = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <BlogSearch t={tb} />
      </div>

      <nav aria-label={tb.filterAria}>
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/blog"
            aria-current="page"
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors bg-primary-600 text-white border-primary-600 shadow-sm"
          >
            {tb.all}
            <span className="ms-1.5 text-xs opacity-75">({totalPublished})</span>
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/categorie/${cat.slug}`}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${PILL_IDLE[cat.color] ?? PILL_IDLE.blue}`}
            >
              {cat.name}
              {cat._count.posts > 0 && (
                <span className="ms-1.5 text-xs opacity-50">({cat._count.posts})</span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {featured && (
        <div className="mb-10">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-accent-500" aria-hidden="true">
              <path d="M8 1l1.854 3.757L14 5.516l-3 2.924.708 4.129L8 10.5l-3.708 2.07L5 8.44 2 5.516l4.146-.759L8 1z"/>
            </svg>
            {tb.featured}
          </p>
          <PostCard post={featured as PostCardData} featured t={tb} locale={locale} />
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg font-medium">{tb.emptyTitle}</p>
          <Link href="/blog" className="mt-4 inline-block text-primary-600 underline text-sm">{tb.emptyLink}</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} t={tb} locale={locale} />
            ))}
          </div>
          <Pagination page={1} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />
        </>
      )}

      <div className="mt-14">
        <NewsletterSignup t={tb} locale={locale} source="blog" />
      </div>
    </>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero-bg py-14 sm:py-20" aria-labelledby="blog-hero-title">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v12M2 8h12M5 4a4 4 0 0 0-1 5M11 4a4 4 0 0 1 1 5"/>
            </svg>
            {tb.heroBadge}
          </div>
          <h1 id="blog-hero-title" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            {tb.heroTitle}{" "}
            <span className="text-secondary-300">{tb.heroTitleAccent}</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed mb-5">
            {tb.heroSubtitle}
          </p>
          <p className="flex items-center justify-center gap-2 text-white/70 text-xs max-w-xl mx-auto mb-8">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5 2.5 4v3.5c0 3 2.3 5.3 5.5 6.5 3.2-1.2 5.5-3.5 5.5-6.5V4L8 1.5z"/><path d="m5.8 8 1.6 1.6L10.5 6.5"/>
            </svg>
            {tb.editorialTrust}
          </p>
          <Link
            href="/praticiens"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors shadow-md"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6.5" cy="5.5" r="3"/><path d="M2 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/><path d="M12 7v4M10 9h4"/>
            </svg>
            {tb.heroCta}
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Recherche/pagination/catégorie → client (BlogResults). Fallback =
            vue canonique SSR → présente dans le HTML prérendu (SEO). */}
        <Suspense fallback={canonicalContent}>
          <BlogResults locale={locale} t={tb} paginationT={dict.pagination}>
            {canonicalContent}
          </BlogResults>
        </Suspense>
      </div>
    </>
  );
}

// Styles pill catégorie inactive (vue canonique : aucune catégorie active).
const PILL_IDLE: Record<string, string> = {
  blue:   "bg-white text-primary-700 border-primary-200 hover:bg-primary-50",
  green:  "bg-white text-secondary-700 border-secondary-200 hover:bg-secondary-50",
  amber:  "bg-white text-amber-700 border-amber-200 hover:bg-amber-50",
  rose:   "bg-white text-rose-700 border-rose-200 hover:bg-rose-50",
  indigo: "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50",
};
