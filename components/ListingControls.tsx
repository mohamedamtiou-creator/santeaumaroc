"use client";

import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { useRouter, usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Barre unique de tri + affinage des listes de praticiens (remplace le 2ᵉ champ
 * de recherche redondant sur les pages spécialité). Client léger : ne lit PAS
 * `useSearchParams` (pas de Suspense requis) — le parent (Server Component)
 * fournit les valeurs courantes via `current`.
 *
 * Tous les paramètres produits (tri/dispo/conv/langue/ville/q) rendent la vue
 * `noindex` côté page : seule la vue canonique (aucun paramètre) est indexée.
 */

/** Langues proposées au filtre (valeurs telles que stockées en base). Source
 *  unique partagée par les pages spécialité. */
export const FILTERABLE_LANGUAGES = ["Arabe", "Darija", "Français", "Anglais", "Espagnol"];

export type ListingCurrent = {
  tri: string;
  dispo: string;
  conv: string;
  langue: string;
  ville: string;
  q: string;
};

type Props = {
  current: ListingCurrent;
  /** Villes filtrables (page spécialité racine). Absent = pas de sélecteur ville. */
  cities?: { slug: string; name: string }[];
  /** Langues filtrables (valeurs stockées en base : « Arabe », « Français »…). */
  languages: string[];
  /** Page ville : afficher la recherche par nom (`q`) au lieu du sélecteur ville. */
  showSearch?: boolean;
  locale: Locale;
  t: Dictionary["filters"];
};

const LANG_LABEL_AR: Record<string, string> = {
  Français: "الفرنسية", Arabe: "العربية", Darija: "الدارجة", Anglais: "الإنجليزية", Espagnol: "الإسبانية",
};

function SortIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M4 8h8M6 12h4" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500 pointer-events-none shrink-0" aria-hidden="true">
      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12M8 2c1.7 1.8 1.7 10.2 0 12M8 2c-1.7 1.8-1.7 10.2 0 12" strokeLinecap="round" />
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
function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5 text-slate-500 shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="6"/>
      <path d="m14 14 4 4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Styles partagés (langage « pill » cohérent : même hauteur/rayon partout) ── */
// Déclencheur de <select> stylé en pill (natif conservé : a11y + picker mobile).
const SELECT_PILL =
  "appearance-none cursor-pointer rounded-full border border-slate-200 bg-white h-10 text-sm text-slate-700 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 transition-colors";
// Bouton-bascule (toggle) : état actif = émeraude, cohérent avec les badges de dispo.
function togglePill(active: boolean) {
  return `inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 ${
    active ? "bg-secondary-50 border-secondary-300 text-secondary-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
  }`;
}

export function ListingControls({ current, cities, languages, showSearch = false, locale, t }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const triActive = !!(current.tri && current.tri !== "pertinence");
  // Nombre de filtres d'affinage actifs (hors recherche `q` et tri) → badge « Réinitialiser ».
  const activeCount =
    (current.dispo === "1" ? 1 : 0) +
    (current.conv === "1" ? 1 : 0) +
    (current.langue ? 1 : 0) +
    (triActive ? 1 : 0);
  const hasActive = activeCount > 0 || !!current.q;

  /** Reconstruit l'URL avec la valeur modifiée ; réinitialise toujours la pagination. */
  function pushWith(overrides: Partial<ListingCurrent>) {
    const m = { ...current, ...overrides };
    const params = new URLSearchParams();
    if (m.q) params.set("q", m.q);
    if (m.ville) params.set("ville", m.ville);
    if (m.tri && m.tri !== "pertinence") params.set("tri", m.tri);
    if (m.dispo === "1") params.set("dispo", "1");
    if (m.conv === "1") params.set("conv", "1");
    if (m.langue) params.set("langue", m.langue);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  const langLabel = (v: string) => (locale === "ar" ? (LANG_LABEL_AR[v] ?? v) : v);

  return (
    <div className="flex flex-col gap-3" role="group" aria-label={t.filtersAria}>

      {/* Recherche par nom (page ville uniquement) — sur sa propre ligne, pleine largeur. */}
      {showSearch && (
        <form
          onSubmit={(e) => { e.preventDefault(); pushWith({ q: (new FormData(e.currentTarget).get("q") as string | null)?.trim() ?? "" }); }}
          className="flex gap-2"
        >
          <label className="flex-1 relative flex items-center">
            <span className="absolute start-3.5 pointer-events-none"><SearchIcon /></span>
            <input
              type="search" name="q" defaultValue={current.q}
              placeholder={t.searchNamePlaceholder}
              className="input-field ps-10 pe-4 h-10 min-w-0 w-full rounded-full"
              aria-label={t.searchNamePlaceholder}
            />
          </label>
          <button type="submit" className="h-10 px-5 rounded-full bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1">
            {t.search}
          </button>
        </form>
      )}

      {/* Rangée unique : filtres à gauche · tri (+ reset) poussés à droite (ms-auto). */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Ville (page racine) */}
        {!showSearch && cities && cities.length > 0 && (
          <div className="relative flex items-center">
            <span className="absolute start-3.5 pointer-events-none"><MapPinIcon /></span>
            <select
              value={current.ville}
              onChange={(e) => pushWith({ ville: e.currentTarget.value })}
              className={`${SELECT_PILL} ps-10 pe-9 min-w-[9.5rem] max-w-[13rem] font-medium`}
              aria-label={t.filterCity}
            >
              <option value="">{t.allCities}</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <span className="absolute end-3 pointer-events-none"><ChevronIcon /></span>
          </div>
        )}

        {/* Langue */}
        {languages.length > 0 && (
          <div className="relative flex items-center">
            <span className="absolute start-3.5 pointer-events-none"><GlobeIcon /></span>
            <select
              value={current.langue}
              onChange={(e) => pushWith({ langue: e.currentTarget.value })}
              className={`${SELECT_PILL} ps-10 pe-9 min-w-[9rem] ${current.langue ? "border-secondary-300 bg-secondary-50 text-secondary-700 font-medium" : ""}`}
              aria-label={t.filterLanguage}
            >
              <option value="">{t.allLanguages}</option>
              {languages.map((v) => (
                <option key={v} value={v}>{langLabel(v)}</option>
              ))}
            </select>
            <span className="absolute end-3 pointer-events-none"><ChevronIcon /></span>
          </div>
        )}

        {/* Toggles rapides */}
        <button
          type="button"
          aria-pressed={current.dispo === "1"}
          onClick={() => pushWith({ dispo: current.dispo === "1" ? "" : "1" })}
          className={togglePill(current.dispo === "1")}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dispo === "1" ? "bg-secondary-500" : "bg-slate-300"}`} aria-hidden="true" />
          {t.filterAvailableToday}
        </button>

        <button
          type="button"
          aria-pressed={current.conv === "1"}
          onClick={() => pushWith({ conv: current.conv === "1" ? "" : "1" })}
          className={togglePill(current.conv === "1")}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1.5 3 3.5V7c0 3 2.2 5.2 5 6 2.8-.8 5-3 5-6V3.5L8 1.5z"/><path d="M5.5 7.5 7.3 9.3 10.5 6" strokeWidth="1.6"/>
          </svg>
          {t.filterConventionne}
        </button>

        {/* Tri + Réinitialiser — isolés à droite (fin de ligne). */}
        <div className="flex items-center gap-2 ms-auto">
          {hasActive && (
            <Link
              href={pathname}
              className="h-10 px-3.5 rounded-full text-sm font-medium text-slate-500 hover:text-danger-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors whitespace-nowrap inline-flex items-center gap-1"
              aria-label={t.resetAria}
            >
              {t.reset}{activeCount > 0 ? ` (${activeCount})` : ""}
            </Link>
          )}
          <div className="relative flex items-center">
            <span className="absolute start-3.5 pointer-events-none"><SortIcon /></span>
            <select
              value={current.tri || "pertinence"}
              onChange={(e) => pushWith({ tri: e.currentTarget.value })}
              className={`${SELECT_PILL} ps-10 pe-9 min-w-[10rem] font-medium`}
              aria-label={t.sortAria}
            >
              <option value="pertinence">{t.sortRelevance}</option>
              <option value="note">{t.sortRating}</option>
              <option value="avis">{t.sortReviews}</option>
            </select>
            <span className="absolute end-3 pointer-events-none"><ChevronIcon /></span>
          </div>
        </div>
      </div>
    </div>
  );
}
