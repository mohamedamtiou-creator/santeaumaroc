import { NextResponse } from "next/server";
import { getBlogPosts, BLOG_PER_PAGE } from "@/lib/blog-query";

// Résultats filtrés/paginés du blog (recherche `q`, catégorie), consommés côté
// client par BlogResults → permet à /blog de rester STATIQUE (le serveur ne lit
// plus searchParams). Données cachées 1 h.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const { posts, total } = await getBlogPosts(
    Math.max(1, Number(searchParams.get("page")) || 1),
    (searchParams.get("categorie") ?? "").trim(),
    (searchParams.get("q") ?? "").trim(),
  );
  const totalPages = Math.ceil(total / BLOG_PER_PAGE);
  return NextResponse.json(
    { posts, total, totalPages },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } },
  );
}
