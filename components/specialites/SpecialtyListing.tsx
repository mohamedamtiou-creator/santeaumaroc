"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { ListingControls, type ListingCurrent } from "@/components/ListingControls";
import { PraticienCard } from "@/components/PraticienCard";
import { PraticienCardSkeleton } from "@/components/PraticienCardSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { DoctorCardDTO } from "@/lib/praticiens-query";

/* Barre de tri/affinage : lit les filtres courants dans l'URL (côté client) →
   permet aux pages /specialites/[slug] et /specialites/[slug]/[ville] de rester
   statiques. Enveloppée dans <Suspense>. `showSearch` → recherche par nom (page
   ville) au lieu du sélecteur de ville. */
export function SpecialtyControls({
  cities, languages, showSearch = false, locale, t,
}: {
  cities?: { slug: string; name: string }[];
  languages: string[];
  showSearch?: boolean;
  locale: Locale;
  t: Dictionary["filters"];
}) {
  const sp = useSearchParams();
  const current: ListingCurrent = {
    tri: sp.get("tri") ?? "", dispo: sp.get("dispo") ?? "", conv: sp.get("conv") ?? "",
    langue: sp.get("langue") ?? "", ville: sp.get("ville") ?? "", q: sp.get("q") ?? "",
  };
  return <ListingControls current={current} cities={cities} languages={languages} showSearch={showSearch} locale={locale} t={t} />;
}

/* Résultats : aucun filtre → liste de base SSR (`children`) ; sinon → fetch API
   + rendu client (vues noindex). Enveloppée dans <Suspense> (useSearchParams).
   `ville` (optionnel) = ville fixée par la route (/specialites/[slug]/[ville]) :
   elle n'est PAS un filtre (fait partie de la vue canonique) et reste dans le
   chemin d'URL. Sans `ville`, la ville vient de l'URL (page racine spécialité). */
export function SpecialtyResults({
  children, slug, ville: fixedVille, locale, cardT, paginationT, t,
}: {
  children: React.ReactNode;
  slug: string;
  ville?: string;
  locale: Locale;
  cardT: Dictionary["card"];
  paginationT: Dictionary["pagination"];
  t: Dictionary["directory"];
}) {
  const sp = useSearchParams();
  const urlVille = (sp.get("ville") ?? "").trim();
  // Ville fixée par la route l'emporte sur l'URL ; elle est envoyée à l'API mais
  // ne compte pas comme filtre déclencheur (c'est la vue canonique de la page).
  const ville   = fixedVille ?? urlVille;
  const q       = (sp.get("q") ?? "").trim();
  const tri     = (sp.get("tri") ?? "").trim();
  const dispo   = (sp.get("dispo") ?? "").trim();
  const conv    = (sp.get("conv") ?? "").trim();
  const langue  = (sp.get("langue") ?? "").trim();
  const page    = Math.max(1, Number(sp.get("page")) || 1);
  const villeFilter = !fixedVille && !!urlVille;
  const hasFilter = !!(q || (tri && tri !== "pertinence") || dispo === "1" || conv === "1" || langue || page > 1 || villeFilter);

  const basePath = fixedVille ? `/specialites/${slug}/${fixedVille}` : `/specialites/${slug}`;

  const key = `${ville}|${q}|${tri}|${dispo}|${conv}|${langue}|${page}`;
  const [entry, setEntry] = useState<{ key: string; doctors: DoctorCardDTO[]; totalPages: number } | null>(null);

  useEffect(() => {
    if (!hasFilter) return;
    const params = new URLSearchParams();
    if (ville)  params.set("ville", ville);
    if (q)      params.set("q", q);
    if (tri && tri !== "pertinence") params.set("tri", tri);
    if (dispo === "1") params.set("dispo", "1");
    if (conv === "1")  params.set("conv", "1");
    if (langue) params.set("langue", langue);
    if (page > 1) params.set("page", String(page));
    const ac = new AbortController();
    fetch(`/api/specialites/${slug}/search?${params.toString()}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setEntry({ key, doctors: json.doctors, totalPages: json.totalPages }))
      .catch((e) => { if (e.name !== "AbortError") setEntry({ key, doctors: [], totalPages: 0 }); });
    return () => ac.abort();
  }, [hasFilter, key, slug, ville, q, tri, dispo, conv, langue, page]);

  if (!hasFilter) return <>{children}</>;

  const current = entry?.key === key ? entry : null;
  const loading = !current;
  const doctors = current?.doctors ?? [];
  const totalPages = current?.totalPages ?? 0;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (villeFilter && ville) params.set("ville", ville);
    if (q)      params.set("q", q);
    if (tri && tri !== "pertinence") params.set("tri", tri);
    if (dispo === "1") params.set("dispo", "1");
    if (conv === "1")  params.set("conv", "1");
    if (langue) params.set("langue", langue);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };
  const clearHref = villeFilter && ville ? `/specialites/${slug}?ville=${ville}` : basePath;

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => <PraticienCardSkeleton key={i} />)}
      </div>
    );
  }
  if (doctors.length === 0) {
    return (
      <div className="empty-state">
        <p className="font-semibold text-slate-700 text-base">{t.noResultFilters}</p>
        <Link href={clearHref}
          className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
          {t.clearFilters}
        </Link>
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-col gap-3">
        {doctors.map((d) => (
          <PraticienCard key={d.id} praticien={d} hideSpecialty isPro={d.isPro} isFeatured={d.isFeatured}
            canBookOnline={d.canBookOnline} slots={d.slots} t={cardT} locale={locale} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={paginationT} />
      )}
    </>
  );
}
