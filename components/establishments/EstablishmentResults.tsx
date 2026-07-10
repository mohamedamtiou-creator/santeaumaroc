"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { SearchFilters } from "@/components/SearchFilters";
import { Pagination } from "@/components/ui/Pagination";
import { EstablishmentCard } from "@/components/establishments/EstablishmentCard";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { EstablishmentCardDTO } from "@/lib/establishments-query";

type FilterCity = { slug: string; name: string };

/**
 * Bascule statique/dynamique des listings d'établissements (/cliniques,
 * /pharmacies, /laboratoires).
 *  - Aucun filtre → vue canonique SSR (`children`) → page 100 % statique
 *    (le serveur ne lit jamais searchParams).
 *  - Recherche `q` / ville / pagination → résultats via /api/etablissements/search,
 *    rendus côté client (vues noindex, hors SEO).
 * La barre de filtres (SearchFilters) est toujours visible et reflète l'URL.
 * Enveloppé dans <Suspense> par la page (requis pour useSearchParams en statique).
 */
export function EstablishmentResults({
  children, types, baseHref, cities, locale, filtersT, estabT, paginationT,
  showTypeBadge = false, searchPlaceholder,
}: {
  children: React.ReactNode;
  types: string[];
  baseHref: string;
  cities: FilterCity[];
  locale: Locale;
  filtersT: Dictionary["filters"];
  estabT: Dictionary["estab"];
  paginationT: Dictionary["pagination"];
  showTypeBadge?: boolean;
  searchPlaceholder?: string;
}) {
  const sp = useSearchParams();
  const q     = (sp.get("q") ?? "").trim();
  const ville = (sp.get("ville") ?? "").trim();
  const page  = Math.max(1, Number(sp.get("page")) || 1);
  const hasFilter = !!(q || ville || page > 1);

  const key = `${q}|${ville}|${page}`;
  const [entry, setEntry] = useState<{ key: string; establishments: EstablishmentCardDTO[]; total: number; totalPages: number } | null>(null);

  useEffect(() => {
    if (!hasFilter) return;
    const params = new URLSearchParams();
    params.set("types", types.join(","));
    if (q)        params.set("q", q);
    if (ville)    params.set("ville", ville);
    if (page > 1) params.set("page", String(page));
    const ac = new AbortController();
    fetch(`/api/etablissements/search?${params.toString()}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setEntry({ key, establishments: json.establishments, total: json.total, totalPages: json.totalPages }))
      .catch((e) => { if (e.name !== "AbortError") setEntry({ key, establishments: [], total: 0, totalPages: 0 }); });
    return () => ac.abort();
  }, [hasFilter, key, types, q, ville, page]);

  const filterBar = (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5"
      style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}>
      <SearchFilters
        specialties={[]}
        cities={cities}
        topCities={6}
        placeholder={searchPlaceholder}
        currentQ={q}
        currentVille={ville}
        t={filtersT}
      />
    </div>
  );

  // Aucun filtre → vue canonique SSR (children) sous la barre de filtres.
  if (!hasFilter) {
    return <>{filterBar}{children}</>;
  }

  const current = entry?.key === key ? entry : null;
  const loading = !current;
  const establishments = current?.establishments ?? [];
  const total = current?.total ?? 0;
  const totalPages = current?.totalPages ?? 0;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q)     params.set("q", q);
    if (ville) params.set("ville", ville);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `${baseHref}${qs ? `?${qs}` : ""}`;
  };
  const cityName = cities.find((c) => c.slug === ville)?.name ?? ville;

  return (
    <>
      {filterBar}

      <p className="mb-4 text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{total.toLocaleString(locale === "ar" ? "ar-MA" : "fr")}</span>
        {" "}{total !== 1 ? estabT.countMany : estabT.countOne}
        {ville && <span className="text-slate-500"> · {cityName}</span>}
        <Link href={baseHref} className="ms-2 text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium text-xs">
          {estabT.showAll}
        </Link>
      </p>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 flex items-start gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="h-3 w-1/3 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : establishments.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-8 h-8" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-700 text-base">{estabT.emptyFilteredTitle}</p>
          <p className="text-sm text-slate-500 max-w-xs text-center">{estabT.emptyFilteredText}</p>
          <Link href={baseHref}
            className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            {estabT.showAll}
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {establishments.map((e) => (
            <EstablishmentCard key={e.id} e={e} t={estabT} showTypeBadge={showTypeBadge} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={paginationT} />
      )}
    </>
  );
}
