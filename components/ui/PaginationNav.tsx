"use client";

import { useRouter } from "next/navigation";
// `@/lib/locale` pour `localeHref` ; le TYPE seul vient de `@/lib/i18n` (effacé à
// la compilation, donc sans coût). Un import de VALEUR depuis `@/lib/i18n` — tel
// l'ancien défaut `getDictionary("fr").pagination` — embarquait les deux
// dictionnaires (~326 KB de source) dans le bundle client.
import { localeHref } from "@/lib/locale";
import type { Dictionary } from "@/lib/i18n";
import { useLocaleContext } from "@/components/i18n/LocaleLink";

type Props = {
  page: number;
  totalPages: number;
  /**
   * Chemin de la vue canonique, SANS paramètre de page (ex. `/villes/casablanca`).
   * L'URL de destination est assemblée ici — un `buildUrl` ne peut pas être passé
   * en prop, une fonction ne traverse pas la frontière serveur → client.
   */
  basePath: string;
  /** Obligatoire : un défaut via `getDictionary()` tirerait tout le dictionnaire côté client. */
  t: Dictionary["pagination"];
};

/**
 * Pagination SANS URL crawlable — pour les listings STATIQUES.
 *
 * POURQUOI. `/villes/[slug]`, `/specialites/[slug]` et `/specialites/[slug]/[ville]`
 * ne lisent jamais `searchParams` côté serveur (choix assumé : la page reste
 * 100 % statique). Une requête sur `?page=2` renvoie donc le HTML de la page 1.
 * Les `<a href>` de {@link Pagination} annonçaient ainsi des milliers d'URL en
 * doublon EXACT — du crawl dépensé pour zéro contenu neuf.
 *
 * Ici les contrôles sont des `<button>` : rien à crawler. La navigation reste
 * identique pour l'utilisateur (`router.push` écrit la même URL, qui reste
 * partageable), et le composant client du listing prend le relais pour afficher
 * la page demandée. Aucune régression : sans JavaScript, ces liens ne rendaient
 * déjà PAS la page 2.
 *
 * La découverte des fiches profondes par les moteurs passe par l'index
 * alphabétique de la ville (cf. lib/city-alpha-index.ts), pas par la pagination.
 *
 * ⚠️ Ne pas utiliser sur `/praticiens` : cette page lit bien `searchParams` côté
 * serveur, sa pagination est réelle et ses URL doivent rester crawlables.
 */
export function PaginationNav({ page, totalPages, basePath, t }: Props) {
  const router = useRouter();
  const locale = useLocaleContext();

  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);
  const href = (p: number) => `${basePath}${p > 1 ? `?page=${p}` : ""}`;
  const go = (p: number) => router.push(localeHref(locale, href(p)), { scroll: true });

  const arrowClass = "flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl text-sm font-medium transition-colors";
  const arrowActive = `${arrowClass} text-slate-600 hover:bg-primary-50 hover:text-primary-700 border border-slate-200 hover:border-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`;
  const arrowDisabled = `${arrowClass} text-slate-300 border border-slate-100 cursor-not-allowed`;

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label={t.nav}>

      {/* ← Précédent */}
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={page > 1 ? arrowActive : arrowDisabled}
        aria-label={page > 1 ? t.prevAria : t.prevDisabledAria}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true">
          <path d="m10 3-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">{t.prev}</span>
      </button>

      {/* Numéros de page — desktop */}
      <div className="hidden sm:flex items-center gap-1" role="list" aria-label={t.pageList}>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`dots-${i}`}
              role="listitem"
              aria-label={t.morePages}
              className="w-9 h-10 flex items-center justify-center text-slate-500 text-sm select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              role="listitem"
              onClick={() => go(p as number)}
              aria-label={`${t.pageNum} ${p}${p === page ? ` ${t.currentPage}` : ""}`}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "w-9 h-10 flex items-center justify-center rounded-xl text-sm font-semibold bg-primary-600 text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                  : "w-9 h-10 flex items-center justify-center rounded-xl text-sm font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              }
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Compteur — mobile uniquement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${t.pageNum} ${page} ${t.pageOf} ${totalPages}`}
        className="sm:hidden px-4 h-10 flex items-center text-sm text-slate-500 font-medium tabular-nums"
      >
        <span className="font-semibold text-slate-800" aria-hidden="true">{page}</span>
        <span className="mx-1" aria-hidden="true">/</span>
        <span aria-hidden="true">{totalPages}</span>
      </div>

      {/* Suivant → */}
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className={page < totalPages ? arrowActive : arrowDisabled}
        aria-label={page < totalPages ? t.nextAria : t.nextDisabledAria}
      >
        <span className="hidden sm:inline">{t.next}</span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true">
          <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

    </nav>
  );
}

/** Même fenêtre de pages que {@link Pagination} — comportement visuel identique. */
function buildPages(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 4, "…", total];
  if (page >= total - 2) return [1, "…", total - 3, total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
}
