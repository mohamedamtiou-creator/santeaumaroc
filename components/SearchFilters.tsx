"use client";

import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { useRouter, usePathname } from "next/navigation";
import { FilterCombobox } from "@/components/filters/FilterCombobox";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  /** Listes d'options. Un tableau VIDE sur /praticiens signifie « charge-les à la
   *  demande » (cf. `lazy`) — les 97 spécialités et 247 villes ne sont ni rendues
   *  ni sérialisées tant que le visiteur n'ouvre pas le filtre. */
  specialties:      { slug: string; name: string }[];
  cities:           { slug: string; name: string }[];
  /** Charge les listes depuis /api/praticiens/filters au premier focus, au lieu de
   *  les recevoir en props. Réservé aux listings qui portent le référentiel complet. */
  lazy?:            boolean;
  fixedSpecialty?:  string;
  fixedVille?:      string;
  /** Current filter values — provided by the parent server component so this
   *  component does NOT need useSearchParams (no Suspense boundary required). */
  currentQ?:        string;
  currentSpecialty?: string;
  currentVille?:    string;
  topSpecialties?:  number;
  topCities?:       number;
  placeholder?:     string;
  /** Traductions de filtres. Défaut FR (pour les pages non encore traduites). */
  t:               Dictionary["filters"];
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5 text-slate-500 shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="6"/>
      <path d="m14 14 4 4" strokeLinecap="round"/>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5 text-slate-500 shrink-0" aria-hidden="true">
      <path d="M3 5h14M6 10h8M9 15h2" strokeLinecap="round"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5 text-slate-500 shrink-0" aria-hidden="true">
      <path d="M10 2C7.24 2 5 4.24 5 7c0 3.94 5 11 5 11s5-7.06 5-11c0-2.76-2.24-5-5-5z"/>
      <circle cx="10" cy="7" r="2"/>
    </svg>
  );
}

export function SearchFilters({
  specialties, cities,
  fixedSpecialty, fixedVille,
  currentQ = "", currentSpecialty = "", currentVille = "",
  lazy = false,
  t,
  placeholder = t.placeholder,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  const hasActiveFilter = !!(currentQ || currentSpecialty || currentVille);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data       = new FormData(e.currentTarget);
    const q          = (data.get("q")         as string | null) ?? "";
    const specialite = (data.get("specialite") as string | null) ?? "";
    const ville      = (data.get("ville")      as string | null) ?? "";
    const params = new URLSearchParams();
    if (q)         params.set("q",          q);
    if (specialite) params.set("specialite", specialite);
    if (ville)     params.set("ville",      ville);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">

      {/* ── Champ recherche texte ────────────────── */}
      <div className="flex-1 flex gap-2">
        <label className="flex-1 relative flex items-center">
          <span className="absolute start-3.5 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="search"
            name="q"
            placeholder={placeholder}
            defaultValue={currentQ}
            className="input-field ps-10 pe-4 h-11 min-w-0 w-full"
            aria-label={t.searchAria}
          />
        </label>
        <button
          type="submit"
          className="h-11 px-4 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label={t.searchSubmit}
        >
          {t.search}
        </button>
      </div>

      {/* ── Filtre spécialité ────────────────────── */}
      {!fixedSpecialty && (lazy || specialties.length > 0) && (
        <FilterCombobox
          name="specialite"
          className="sm:w-52"
          label={t.filterSpecialty}
          allLabel={t.allSpecialties}
          placeholder={t.allSpecialties}
          value={currentSpecialty}
          options={lazy ? null : specialties}
          source="specialties"
          icon={<FilterIcon />}
          loadingLabel={t.comboLoading}
          emptyLabel={t.comboEmpty}
          moreLabel={(n) => `+${n} · ${t.comboMore}`}
        />
      )}

      {/* ── Filtre ville ─────────────────────────── */}
      {!fixedVille && (
        <FilterCombobox
          name="ville"
          className="sm:w-44"
          label={t.filterCity}
          allLabel={t.allCities}
          placeholder={t.allCities}
          value={currentVille}
          options={lazy ? null : cities}
          source="cities"
          icon={<MapPinIcon />}
          loadingLabel={t.comboLoading}
          emptyLabel={t.comboEmpty}
          moreLabel={(n) => `+${n} · ${t.comboMore}`}
        />
      )}

      {/* ── Réinitialiser (si filtre actif) ─────── */}
      {hasActiveFilter && (
        <Link
          href={pathname}
          className="h-11 px-4 rounded-lg text-sm font-medium text-slate-500 hover:text-danger-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors whitespace-nowrap inline-flex items-center"
          aria-label={t.resetAria}
        >
          {t.reset}
        </Link>
      )}
    </form>
  );
}
