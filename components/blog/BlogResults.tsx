"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { PostCard, type PostCardData } from "@/components/blog/PostCard";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { Pagination } from "@/components/ui/Pagination";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Bascule statique/dynamique du blog (index /blog ET pages catégorie).
 *  - Aucun paramètre actif → vue canonique SSR (`children`) → la page reste
 *    100 % statique (le serveur ne lit jamais searchParams).
 *  - Recherche `q` / pagination / catégorie → résultats via /api/blog/search,
 *    rendus côté client (vues noindex, hors SEO).
 *
 * `fixedCategorie` : page catégorie (catégorie dans le chemin d'URL, pas un
 * filtre) — seule la pagination bascule côté client. `showSearch` : barre de
 * recherche + ligne « résultats pour » (index /blog uniquement).
 * Enveloppé dans <Suspense> par la page (requis pour useSearchParams en statique).
 */
export function BlogResults({
  children, locale, t, paginationT, fixedCategorie, showSearch = true,
}: {
  children: React.ReactNode;
  locale: Locale;
  t: Dictionary["blog"];
  paginationT: Dictionary["pagination"];
  fixedCategorie?: string;
  showSearch?: boolean;
}) {
  const sp = useSearchParams();
  const q         = showSearch ? (sp.get("q") ?? "").trim() : "";
  const urlCat    = (sp.get("categorie") ?? "").trim();
  const categorie = fixedCategorie ?? urlCat;
  const page      = Math.max(1, Number(sp.get("page")) || 1);
  const catFilter = !fixedCategorie && !!urlCat;
  const hasFilter = !!(q || catFilter || page > 1);

  const basePath = fixedCategorie ? `/blog/categorie/${fixedCategorie}` : "/blog";

  const key = `${q}|${categorie}|${page}`;
  const [entry, setEntry] = useState<{ key: string; posts: PostCardData[]; total: number; totalPages: number } | null>(null);

  useEffect(() => {
    if (!hasFilter) return;
    const params = new URLSearchParams();
    if (q)         params.set("q", q);
    if (categorie) params.set("categorie", categorie);
    if (page > 1)  params.set("page", String(page));
    const ac = new AbortController();
    fetch(`/api/blog/search?${params.toString()}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setEntry({ key, posts: json.posts, total: json.total, totalPages: json.totalPages }))
      .catch((e) => { if (e.name !== "AbortError") setEntry({ key, posts: [], total: 0, totalPages: 0 }); });
    return () => ac.abort();
  }, [hasFilter, key, q, categorie, page]);

  if (!hasFilter) return <>{children}</>;

  const current = entry?.key === key ? entry : null;
  const loading = !current;
  const posts = current?.posts ?? [];
  const total = current?.total ?? 0;
  const totalPages = current?.totalPages ?? 0;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q)         params.set("q", q);
    if (catFilter) params.set("categorie", categorie);
    if (p > 1)     params.set("page", String(p));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {showSearch && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <BlogSearch q={q} t={t} />
          </div>
          {q && (
            <p className="text-sm text-slate-600 mb-6">
              {t.searchResultsFor.replace("{q}", q)} <span className="text-slate-400">({total})</span>
            </p>
          )}
        </>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg font-medium">{q ? t.searchEmpty : t.emptyTitle}</p>
          <Link href="/blog" className="mt-4 inline-block text-primary-600 underline text-sm">{t.emptyLink}</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} t={t} locale={locale} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={paginationT} />
        </>
      )}
    </>
  );
}
