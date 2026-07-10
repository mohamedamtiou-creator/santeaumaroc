import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostCard, type PostCardData } from "@/components/blog/PostCard";
import { Pagination } from "@/components/ui/Pagination";
import { BlogFaq } from "@/components/blog/BlogFaq";
import { NewsletterSignup } from "@/components/blog/NewsletterSignup";
import { categoryIntro, categoryFaq } from "@/lib/blog-category-content";
import { localizedAlternates } from "@/lib/hreflang";
import { getDictionary, toLocale } from "@/lib/i18n";

export const revalidate = 3600;

const PER_PAGE = 9;
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://santeaumaroc.com";

type Params = Promise<{ lang: string; slug: string }>;
type SearchParams = Promise<{ page?: string }>;

const POST_SELECT = {
  title: true, slug: true, excerpt: true, coverImage: true, coverAlt: true,
  readingTime: true, publishedAt: true,
  category: { select: { name: true, slug: true, color: true } },
  author:   { select: { name: true, avatar: true } },
} as const;

export async function generateStaticParams() {
  // Les catégories sont peu nombreuses (créées par l'admin) ; `take` = simple
  // garde-fou pour rester borné quoi qu'il arrive.
  const cats = await prisma.postCategory.findMany({ select: { slug: true }, take: 500 });
  return cats.map((c) => ({ slug: c.slug }));
}

async function getCategory(slug: string) {
  return prisma.postCategory.findUnique({
    where: { slug },
    select: { name: true, slug: true, description: true, color: true },
  });
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const [{ lang, slug }, { page: pageStr }] = await Promise.all([params, searchParams]);
  const cat = await getCategory(slug);
  if (!cat) return { title: "Catégorie introuvable", robots: { index: false } };

  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const canonical = page > 1 ? `/blog/categorie/${slug}?page=${page}` : `/blog/categorie/${slug}`;
  const description = cat.description
    ? `${cat.description} — articles santé vérifiés par des professionnels au Maroc.`
    : "Articles de santé vérifiés par des professionnels au Maroc.";

  const locale = toLocale(lang);
  return {
    title: `${cat.name} — Blog Santé Maroc`,
    description,
    alternates: localizedAlternates(canonical, locale),
    openGraph: {
      title: `${cat.name} — Blog Santé · SantéauMaroc`,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ lang, slug }, { page: pageStr }] = await Promise.all([params, searchParams]);
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const cat = await getCategory(slug);
  if (!cat) notFound();

  const locale = toLocale(lang);
  const tb = getDictionary(locale).blog;
  const dict = getDictionary(locale);

  const [total, posts, categories] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED", category: { slug } } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", category: { slug } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: POST_SELECT,
    }),
    prisma.postCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        name: true, slug: true, color: true,
        _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const intro = categoryIntro(slug, locale, cat.description ?? "");
  const faqItems = categoryFaq(slug, locale);
  const canonicalUrl = `${BASE}/blog/categorie/${slug}`;

  const buildUrl = (p: number) => `/blog/categorie/${slug}${p > 1 ? `?page=${p}` : ""}`;

  // JSON-LD : CollectionPage + ItemList + BreadcrumbList
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#page`,
        "name": `${cat.name} — Blog Santé`,
        "description": intro,
        "url": canonicalUrl,
        "inLanguage": locale === "ar" ? "ar-MA" : "fr-MA",
        "isPartOf": { "@type": "Blog", "@id": `${BASE}/blog#blog`, "url": `${BASE}/blog` },
      },
      ...(posts.length
        ? [{
            "@type": "ItemList",
            "itemListElement": posts.map((p, i) => ({
              "@type": "ListItem",
              "position": (page - 1) * PER_PAGE + i + 1,
              "url": `${BASE}/blog/${p.slug}`,
              "name": p.title,
            })),
          }]
        : []),
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": tb.home, "item": BASE },
          { "@type": "ListItem", "position": 2, "name": tb.heroBadge, "item": `${BASE}/blog` },
          { "@type": "ListItem", "position": 3, "name": cat.name, "item": canonicalUrl },
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Fil d'Ariane */}
        <nav aria-label={tb.breadcrumbAria} className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-secondary-600 transition-colors">{tb.home}</Link>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <Link href="/blog" className="hover:text-secondary-600 transition-colors">{tb.heroBadge}</Link>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-slate-700 font-medium">{cat.name}</span>
        </nav>

        {/* En-tête éditorial */}
        <header className="mb-8 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">{cat.name}</h1>
          {intro && <p className="text-lg text-slate-600 leading-relaxed">{intro}</p>}
          <p className="text-sm text-slate-400 mt-3">
            {total} {tb.categoryArticles.toLowerCase()}
          </p>
        </header>

        {/* Grille d'articles */}
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg font-medium">{tb.emptyTitle}</p>
            <Link href="/blog" className="mt-4 inline-block text-primary-600 underline text-sm">{tb.emptyLink}</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post as PostCardData} t={tb} locale={locale} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />
          </>
        )}

        {/* FAQ catégorie (visible + JSON-LD FAQPage émis par BlogFaq) */}
        {faqItems.length > 0 && (
          <div className="mt-14 max-w-3xl">
            <BlogFaq items={faqItems} t={tb} />
          </div>
        )}

        {/* Maillage : autres catégories */}
        <section className="mt-14" aria-labelledby="other-cats-title">
          <h2 id="other-cats-title" className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
            {tb.otherCategories}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/blog"
              className="px-4 py-2 rounded-xl text-sm font-semibold border bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              {tb.all}
            </Link>
            {categories
              .filter((c) => c.slug !== slug && c._count.posts > 0)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/blog/categorie/${c.slug}`}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  {c.name}
                  <span className="ms-1.5 text-xs opacity-50">({c._count.posts})</span>
                </Link>
              ))}
          </div>
        </section>

        {/* Newsletter */}
        <div className="mt-14">
          <NewsletterSignup t={tb} locale={locale} source={`category:${slug}`} />
        </div>

      </div>
    </>
  );
}
