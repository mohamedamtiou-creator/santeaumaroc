import { Suspense } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { EstablishmentCard } from "@/components/establishments/EstablishmentCard";
import { EstablishmentResults } from "@/components/establishments/EstablishmentResults";
import { getEstablishments, getEstablishmentCities, ESTAB_PAGE_SIZE } from "@/lib/establishments-query";
import { getDictionary, type Locale } from "@/lib/i18n";

type Props = {
  types: string[];
  baseHref: string;
  showTypeBadge?: boolean;
  /** Locale portée par l'URL (params.lang), pas getLocale() — cf. audit perf. */
  locale: Locale;
};

/**
 * Listing d'établissements — STATIQUE : la vue canonique (page 1, sans filtre)
 * est rendue côté serveur (shell SEO, cache durable via getEstablishments), et la
 * recherche/ville/pagination basculent côté client (EstablishmentResults →
 * /api/etablissements/search, vues noindex). Le serveur ne lit jamais searchParams.
 */
export async function EstablishmentList({ types, baseHref, showTypeBadge = false, locale }: Props) {
  const dict = getDictionary(locale);
  const t = dict.estab;

  const [{ establishments, total }, cities] = await Promise.all([
    getEstablishments(types, "", "", 1),
    getEstablishmentCities(),
  ]);
  const totalPages = Math.ceil(total / ESTAB_PAGE_SIZE);
  const buildUrl = (p: number) => `${baseHref}${p > 1 ? `?page=${p}` : ""}`;

  // Vue canonique (page 1, sans filtre) : contenu du shell statique (fallback
  // <Suspense> = HTML prérendu, indexable) ET contenu affiché tant qu'aucun
  // filtre n'est actif. La barre de filtres est rendue par EstablishmentResults.
  const canonicalContent = (
    <>
      <p className="mb-4 text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>
        {" "}{total !== 1 ? t.countMany : t.countOne}
      </p>

      {establishments.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-8 h-8" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-700 text-base">{t.emptyTitle}</p>
          <p className="text-sm text-slate-500 max-w-xs text-center">{t.emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {establishments.map((e) => (
            <EstablishmentCard key={e.id} e={e} t={t} showTypeBadge={showTypeBadge} />
          ))}
        </div>
      )}

      <Pagination page={1} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />
    </>
  );

  return (
    <Suspense fallback={
      <>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5" style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }} />
        {canonicalContent}
      </>
    }>
      <EstablishmentResults
        types={types}
        baseHref={baseHref}
        cities={cities}
        locale={locale}
        filtersT={dict.filters}
        estabT={t}
        paginationT={dict.pagination}
        showTypeBadge={showTypeBadge}
        searchPlaceholder={t.searchPlaceholder}
      >
        {canonicalContent}
      </EstablishmentResults>
    </Suspense>
  );
}
