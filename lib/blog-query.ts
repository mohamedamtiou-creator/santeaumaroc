import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";
import { Prisma } from "@prisma/client";
import type { PostCardData } from "@/components/blog/PostCard";

export const BLOG_PER_PAGE = 9;

// Sélection alignée sur PostCardData (sérialisable : aucun Decimal ; `publishedAt`
// = Date, révivée par le Data Cache et tolérée en string par PostCard côté client).
export const POST_CARD_SELECT = {
  title: true, slug: true, excerpt: true, coverImage: true, coverAlt: true,
  readingTime: true, publishedAt: true,
  titleAr: true, excerptAr: true, arReviewedAt: true, // localisation carte (repli FR)
  category: { select: { name: true, slug: true, color: true } },
  author:   { select: { name: true, avatar: true } },
} satisfies Prisma.PostSelect;

export type BlogPostsResult = { posts: PostCardData[]; total: number };

/**
 * Liste d'articles publiés (filtre catégorie / recherche `q`, paginée), mise en
 * cache durable 1 h. Source UNIQUE partagée par la vue canonique SSR de /blog ET
 * la route API client /api/blog/search → statique + filtres client cohérents.
 */
export function getBlogPosts(page: number, categorie?: string, q?: string): Promise<BlogPostsResult> {
  const p   = Math.max(1, page || 1);
  const cat = (categorie ?? "").trim();
  const query = (q ?? "").trim();
  const key = `blog-posts:${p}:${cat}:${query}`;

  return cachedQuery(key, 3600, async () => {
    const where = {
      status: "PUBLISHED" as const,
      ...(cat && !query ? { category: { slug: cat } } : {}),
      ...(query ? {
        OR: [
          { title:   { contains: query, mode: "insensitive" as const } },
          { excerpt: { contains: query, mode: "insensitive" as const } },
        ],
      } : {}),
    };
    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (p - 1) * BLOG_PER_PAGE,
        take: BLOG_PER_PAGE,
        select: POST_CARD_SELECT,
      }),
    ]);
    return { posts: posts as PostCardData[], total };
  });
}
