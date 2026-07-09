import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { getDictionary, type Dictionary } from "@/lib/i18n";

type Props = {
  page:       number;
  totalPages: number;
  buildUrl:   (p: number) => string;
  /** Traductions. Défaut FR (pour les pages non encore traduites). */
  t?:         Dictionary["pagination"];
};

function buildPages(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3)  return [1, 2, 3, 4, "…", total];
  if (page >= total - 2) return [1, "…", total - 3, total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
}

export function Pagination({ page, totalPages, buildUrl, t = getDictionary("fr").pagination }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  const arrowClass = "flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl text-sm font-medium transition-colors";
  const arrowActive   = `${arrowClass} text-slate-600 hover:bg-primary-50 hover:text-primary-700 border border-slate-200 hover:border-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`;
  const arrowDisabled = `${arrowClass} text-slate-300 border border-slate-100 cursor-not-allowed`;

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label={t.nav}>

      {/* ← Précédent */}
      {page > 1 ? (
        <Link href={buildUrl(page - 1)} className={arrowActive} aria-label={t.prevAria}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true">
            <path d="m10 3-5 5 5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="hidden sm:inline">{t.prev}</span>
        </Link>
      ) : (
        <button type="button" disabled className={arrowDisabled} aria-label={t.prevDisabledAria}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true">
            <path d="m10 3-5 5 5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="hidden sm:inline" aria-hidden="true">{t.prev}</span>
        </button>
      )}

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
            <Link
              key={p}
              role="listitem"
              href={buildUrl(p as number)}
              aria-label={`${t.pageNum} ${p}${p === page ? ` ${t.currentPage}` : ""}`}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "w-9 h-10 flex items-center justify-center rounded-xl text-sm font-semibold bg-primary-600 text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
                  : "w-9 h-10 flex items-center justify-center rounded-xl text-sm font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              }
            >
              {p}
            </Link>
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
      {page < totalPages ? (
        <Link href={buildUrl(page + 1)} className={arrowActive} aria-label={t.nextAria}>
          <span className="hidden sm:inline">{t.next}</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      ) : (
        <button type="button" disabled className={arrowDisabled} aria-label={t.nextDisabledAria}>
          <span className="hidden sm:inline" aria-hidden="true">{t.next}</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true">
            <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

    </nav>
  );
}
