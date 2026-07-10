"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { SearchFilters } from "@/components/SearchFilters";
import { PraticienCard } from "@/components/PraticienCard";
import { PraticienCardSkeleton } from "@/components/PraticienCardSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { DoctorCardDTO } from "@/lib/praticiens-query";

type SpecialtyOpt = { slug: string; name: string };

/**
 * Bascule statique/dynamique du listing d'une ville.
 *  - Aucun filtre (pas de spécialité, page 1) → vue canonique SSR (`children`) →
 *    /villes/[slug] reste 100 % statique (le serveur ne lit jamais searchParams).
 *  - Filtre spécialité / pagination → résultats via /api/villes/[slug]/search,
 *    rendus côté client (vues noindex, hors SEO).
 * La barre de filtres (spécialité) est toujours visible et reflète l'URL.
 * Enveloppé dans <Suspense> par la page (requis pour useSearchParams en statique).
 */
export function VilleResults({
  children, slug, cityName, specialties, locale, filtersT, cardT, directoryT, paginationT,
}: {
  children: React.ReactNode;
  slug: string;
  cityName: string;
  specialties: SpecialtyOpt[];
  locale: Locale;
  filtersT: Dictionary["filters"];
  cardT: Dictionary["card"];
  directoryT: Dictionary["directory"];
  paginationT: Dictionary["pagination"];
}) {
  const sp = useSearchParams();
  const specialite = (sp.get("specialite") ?? "").trim();
  const page       = Math.max(1, Number(sp.get("page")) || 1);
  const hasFilter  = !!(specialite || page > 1);

  const key = `${specialite}|${page}`;
  const [entry, setEntry] = useState<{ key: string; doctors: DoctorCardDTO[]; total: number; totalPages: number } | null>(null);

  useEffect(() => {
    if (!hasFilter) return;
    const params = new URLSearchParams();
    if (specialite) params.set("specialite", specialite);
    if (page > 1)   params.set("page", String(page));
    const ac = new AbortController();
    fetch(`/api/villes/${slug}/search?${params.toString()}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setEntry({ key, doctors: json.doctors, total: json.total, totalPages: json.totalPages }))
      .catch((e) => { if (e.name !== "AbortError") setEntry({ key, doctors: [], total: 0, totalPages: 0 }); });
    return () => ac.abort();
  }, [hasFilter, key, slug, specialite, page]);

  const filterBar = (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5"
      style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}>
      <SearchFilters
        specialties={specialties}
        cities={[]}
        fixedVille={slug}
        currentSpecialty={specialite}
        t={filtersT}
      />
    </div>
  );

  if (!hasFilter) return <>{filterBar}{children}</>;

  const current = entry?.key === key ? entry : null;
  const loading = !current;
  const doctors = current?.doctors ?? [];
  const total = current?.total ?? 0;
  const totalPages = current?.totalPages ?? 0;
  const activeSpecialty = specialties.find((s) => s.slug === specialite);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (specialite) params.set("specialite", specialite);
    if (p > 1)      params.set("page", String(p));
    const qs = params.toString();
    return `/villes/${slug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {filterBar}

      <p className="text-slate-500 mt-2 mb-3 text-sm" role="status" aria-live="polite" aria-atomic="true">
        <span className="font-semibold text-slate-700">{total.toLocaleString(locale === "ar" ? "ar-MA" : "fr")}</span>{" "}
        {total !== 1 ? directoryT.pracMany : directoryT.pracOne}
        {activeSpecialty && <> · <span className="text-primary-700 font-medium">{activeSpecialty.name}</span></>}
        {" · "}
        <Link href={`/villes/${slug}`} className="text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium">
          {directoryT.showAll}
        </Link>
      </p>

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <PraticienCardSkeleton key={i} />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">
          <p className="font-semibold text-slate-700 text-base">
            {activeSpecialty
              ? `${directoryT.noResultPrefix} ${activeSpecialty.name.toLowerCase()} ${directoryT.in} ${cityName}`
              : directoryT.noResultFilters}
          </p>
          <Link href={`/villes/${slug}`}
            className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            {directoryT.seeAllPractitioners}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {doctors.map((d) => (
            <PraticienCard key={d.id} praticien={d} isPro={d.isPro} isFeatured={d.isFeatured}
              canBookOnline={d.canBookOnline} slots={d.slots} locale={locale} t={cardT} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={paginationT} />
      )}
    </>
  );
}
