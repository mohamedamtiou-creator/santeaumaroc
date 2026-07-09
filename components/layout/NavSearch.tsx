"use client";

import { usePathname } from "next/navigation";

/**
 * Recherche persistante de la Navbar.
 * — Action principale du produit : toujours accessible quelle que soit la page.
 * — Soumise en GET vers /praticiens (mêmes paramètres que HeroSearchForm : `q`).
 * — Masquée sur l'accueil ("/") où le grand champ du hero joue déjà ce rôle.
 */
type Props = { placeholder: string; buttonLabel: string };

export function NavSearch({ placeholder, buttonLabel }: Props) {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <form
      action="/praticiens"
      method="GET"
      role="search"
      className="hidden md:flex items-center w-full max-w-md group rounded-full border border-slate-200 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-colors"
    >
      <label htmlFor="nav-search" className="sr-only">
        {placeholder}
      </label>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4 text-slate-500 shrink-0 ms-3.5"
        aria-hidden="true"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 4 4" strokeLinecap="round" />
      </svg>
      <input
        id="nav-search"
        name="q"
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 min-w-0 bg-transparent py-2 px-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 m-1 px-3 py-1.5 rounded-full bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
