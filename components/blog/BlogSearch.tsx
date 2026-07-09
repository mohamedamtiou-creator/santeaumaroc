import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary } from "@/lib/i18n";

/**
 * Recherche d'articles — formulaire GET natif (aucun JS, navigation complète).
 * Soumet vers /blog?q=… ; la page rend les résultats en noindex.
 */
export function BlogSearch({ q, t }: { q?: string; t: Dictionary["blog"] }) {
  return (
    <form action="/blog" method="get" role="search" className="relative flex-1 min-w-[200px] max-w-md">
      <label htmlFor="blog-search" className="sr-only">{t.searchAria}</label>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="7" r="5"/><path d="m11 11 3 3"/>
      </svg>
      <input
        id="blog-search"
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder={t.searchPlaceholder}
        className="w-full rounded-xl border border-slate-200 bg-white ps-9 pe-20 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
      />
      <button
        type="submit"
        className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
      >
        {t.searchButton}
      </button>
      {q && (
        <Link
          href="/blog"
          className="absolute -bottom-6 start-0 text-xs text-slate-400 hover:text-slate-600 underline"
        >
          {t.searchClear}
        </Link>
      )}
    </form>
  );
}
