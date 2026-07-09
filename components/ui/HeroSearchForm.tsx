"use client";

import { useState, useRef, useEffect } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { MAJOR_CITIES } from "@/lib/utils";

/* ── Types ──────────────────────────────────────────────── */

type SelectOption = { value: string; label: string };
type QuickLink = { href: string; label: string };

type HeroSearchT = {
  searchPlaceholder: string;
  specialtyPlaceholder: string;
  cityPlaceholder: string;
  searchButton: string;
  searchLabel: string;
  specialtyLabel: string;
  cityLabel: string;
  popular: string;
  locate: string;
  locateTitle: string;
  practitionerQuestion: string;
  practitionerCta: string;
};

type Props = {
  t: HeroSearchT;
  specialtyOptions: SelectOption[];
  quickSpecialties: QuickLink[];
};

/* ── Icônes locales ─────────────────────────────────────── */

function IconSearch() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="6" />
      <path d="m14 14 4 4" strokeLinecap="round" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true">
      <path d="M10 2C7.24 2 5 4.24 5 7c0 3.94 5 11 5 11s5-7.06 5-11c0-2.76-2.24-5-5-5z" />
      <circle cx="10" cy="7" r="1.75" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 1v3M10 16v3M1 10h3M16 10h3" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-4 h-4 animate-spin" aria-hidden="true">
      <circle cx="10" cy="10" r="7" strokeOpacity="0.25" />
      <path d="M10 3a7 7 0 0 1 7 7" strokeLinecap="round" />
    </svg>
  );
}

/* ── GeoButton ──────────────────────────────────────────── */

function GeoButton({ onCity, label, title }: { onCity: (city: string) => void; label: string; title: string }) {
  const [loading, setLoading] = useState(false);

  async function locate() {
    if (!navigator.geolocation) return;
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
      );
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=fr`,
        { headers: { "User-Agent": "SantéMaroc/1.0" } }
      );
      const data = await res.json();
      const city: string =
        data.address?.city ||
        data.address?.town ||
        data.address?.municipality ||
        data.address?.county ||
        "";
      if (city) onCity(city);
    } catch {
      /* permission refusée ou timeout — silencieux */
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={locate}
      disabled={loading}
      aria-label={label}
      title={title}
      className="shrink-0 p-1.5 rounded-md text-slate-500 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-40 transition-colors"
    >
      {loading ? <IconSpinner /> : <IconTarget />}
    </button>
  );
}

/* ── CityCombobox ───────────────────────────────────────── */

function CityCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered =
    value.length >= 1
      ? MAJOR_CITIES.filter((c) =>
          c.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8)
      : MAJOR_CITIES.slice(0, 6);

  /* Fermer sur clic extérieur */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter" && highlighted >= 0 && open) {
      e.preventDefault();
      onChange(filtered[highlighted]);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const listboxId = "hero-cities-listbox";

  return (
    <div ref={containerRef} className="relative flex-1 flex items-center min-w-0">
      <input
        id="hero-ville"
        name="ville"
        type="text"
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && filtered.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={highlighted >= 0 ? `hero-city-${highlighted}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full py-3.5 sm:py-4 text-slate-900 bg-transparent focus:outline-none text-base placeholder:text-slate-500 min-w-0"
      />
      {open && filtered.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={placeholder}
          className="absolute top-full start-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl mt-1 py-1.5 min-w-[176px] max-h-60 overflow-y-auto"
        >
          {filtered.map((city, i) => (
            <li
              key={city}
              id={`hero-city-${i}`}
              role="option"
              aria-selected={i === highlighted}
              className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 transition-colors ${
                i === highlighted
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(city);
                setOpen(false);
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <svg viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="w-2.5 h-3 text-slate-300 shrink-0" aria-hidden="true">
                <path d="M6 1C3.79 1 2 2.79 2 5c0 3.28 4 9 4 9s4-5.72 4-9C10 2.79 8.21 1 6 1z"/>
              </svg>
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── HeroSearchForm (export) ────────────────────────────── */

export function HeroSearchForm({ t, specialtyOptions, quickSpecialties }: Props) {
  const [ville, setVille] = useState("");

  return (
    <>
      {/* Labels accessibles */}
      <label htmlFor="hero-search" className="sr-only">{t.searchLabel}</label>
      <label htmlFor="hero-specialite" className="sr-only">{t.specialtyLabel}</label>
      <label htmlFor="hero-ville" className="sr-only">{t.cityLabel}</label>

      <form
        action="/praticiens"
        method="GET"
        className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-white/15"
        style={{ boxShadow: "0 20px 60px -10px rgb(30 58 138 / 0.45), 0 0 0 1px rgb(255 255 255 / 0.08)" }}
      >
        <div className="flex flex-col sm:flex-row">

          {/* Champ recherche */}
          <div className="flex-1 flex items-center bg-white gap-3 px-5 min-w-0 border-b border-slate-100 sm:border-b-0">
            <IconSearch />
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder={t.searchPlaceholder}
              className="flex-1 py-3.5 sm:py-4 text-slate-900 bg-transparent focus:outline-none text-base placeholder:text-slate-500 min-w-0"
            />
          </div>

          <div className="hidden sm:block w-px bg-slate-200 shrink-0" aria-hidden="true" />

          {/* Sélecteur spécialité */}
          <div className="relative flex items-center bg-white sm:w-52 sm:shrink-0 border-b border-slate-100 sm:border-b-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute start-4 w-4.5 h-4.5 text-slate-500 pointer-events-none shrink-0 z-10" aria-hidden="true">
              <path d="M3 5h14M6 10h8M9 15h2" strokeLinecap="round"/>
            </svg>
            <select
              id="hero-specialite"
              name="specialite"
              defaultValue=""
              className="w-full ps-10 pe-8 py-3.5 sm:py-4 text-slate-700 bg-transparent focus:outline-none text-sm appearance-none cursor-pointer"
            >
              <option value="">{t.specialtyPlaceholder}</option>
              {specialtyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute end-3 w-4 h-4 text-slate-500 pointer-events-none shrink-0" aria-hidden="true">
              <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="hidden sm:block w-px bg-slate-200 shrink-0" aria-hidden="true" />

          {/* Champ ville — combobox + géolocalisation */}
          <div className="flex items-center bg-white gap-2 px-4 sm:w-44 sm:shrink-0 border-b border-slate-100 sm:border-b-0">
            <IconLocation />
            <CityCombobox value={ville} onChange={setVille} placeholder={t.cityPlaceholder} />
            <GeoButton onCity={setVille} label={t.locate} title={t.locateTitle} />
          </div>

          {/* Bouton soumettre */}
          <button
            type="submit"
            aria-label={t.searchButton}
            className="bg-secondary-600 text-white font-semibold px-7 py-3.5 sm:py-4 transition-colors hover:bg-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400 focus-visible:ring-inset rounded-b-xl sm:rounded-b-none sm:rounded-e-xl"
          >
            {t.searchButton}
          </button>

        </div>
      </form>

      {/* Raccourcis spécialités */}
      <div className="flex flex-wrap justify-center gap-x-1 gap-y-1.5 mt-5">
        <span className="text-sm text-white/60 me-1">{t.popular}</span>
        {quickSpecialties.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="text-sm text-white/75 hover:text-white transition-colors px-2 py-0.5 rounded-full hover:bg-white/10"
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* CTA praticien */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <Link
          href="/inscription-praticien"
          className="inline-flex items-center gap-2 text-sm text-white/65 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
            className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="5" r="2.5"/>
            <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5"/>
            <path d="M11 9v3M9.5 10.5h3"/>
          </svg>
          {t.practitionerQuestion}
          <span className="text-secondary-300 font-semibold">{t.practitionerCta}</span>
        </Link>
      </div>
    </>
  );
}
