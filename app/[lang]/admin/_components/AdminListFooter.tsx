import Link from "next/link";
import { rangeLabel, ADMIN_PER_PAGE } from "@/lib/pagination";

/** Construit la séquence de pages avec ellipses (1 … 4 5 6 … 12). */
function buildPages(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 4, "…", total];
  if (page >= total - 2) return [1, "…", total - 3, total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
}

/**
 * Pied de liste admin : « X–Y sur N » à gauche, pagination compacte à droite.
 * Pensé pour vivre à l'intérieur d'une carte/table (densité admin), à la
 * différence du composant public `Pagination` (large, centré).
 *
 * `noun` : nom au pluriel de l'entité listée (« praticiens », « tickets »…).
 */
export function AdminListFooter({
  page,
  total,
  perPage = ADMIN_PER_PAGE,
  buildUrl,
  noun = "résultats",
}: {
  page: number;
  total: number;
  perPage?: number;
  buildUrl: (p: number) => string;
  noun?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const { from, to } = rangeLabel(page, perPage, total);

  const numCls =
    "min-w-8 h-8 px-1.5 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors";
  const arrowCls =
    "h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors";
  const arrowOff =
    "h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-100 text-slate-300 cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/40">
      <p className="text-xs text-slate-500 tabular-nums order-2 sm:order-1">
        {total === 0 ? (
          <>Aucun {noun}</>
        ) : (
          <>
            <span className="font-semibold text-slate-700">{from}–{to}</span> sur{" "}
            <span className="font-semibold text-slate-700">{total}</span> {noun}
          </>
        )}
      </p>

      {pages > 1 && (
        <nav className="flex items-center gap-1 order-1 sm:order-2" aria-label="Pagination">
          {page > 1 ? (
            <Link href={buildUrl(page - 1)} className={arrowCls} aria-label="Page précédente">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true">
                <path d="m10 3-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : (
            <span className={arrowOff} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100">
                <path d="m10 3-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}

          {buildPages(page, pages).map((p, i) =>
            p === "…" ? (
              <span key={`dots-${i}`} className="w-7 h-8 inline-flex items-center justify-center text-slate-400 text-sm select-none">…</span>
            ) : (
              <Link
                key={p}
                href={buildUrl(p as number)}
                aria-current={p === page ? "page" : undefined}
                className={
                  p === page
                    ? `${numCls} bg-primary-600 text-white`
                    : `${numCls} text-slate-600 hover:bg-slate-100`
                }
              >
                {p}
              </Link>
            ),
          )}

          {page < pages ? (
            <Link href={buildUrl(page + 1)} className={arrowCls} aria-label="Page suivante">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true">
                <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : (
            <span className={arrowOff} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100">
                <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
