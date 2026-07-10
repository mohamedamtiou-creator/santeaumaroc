"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { Pagination } from "@/components/ui/Pagination";
import { MedicationCard } from "@/components/medicaments/MedicationCard";
import { MedicationFilterBar } from "@/components/medicaments/MedicationFilterBar";
import type { FormeFilter, MedicationCardDTO } from "@/lib/medications-query";

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className ?? "w-5 h-5"} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/>
    </svg>
  );
}

/**
 * Bascule statique/dynamique de /medicaments.
 *  - Aucun filtre (page 1, sans recherche/forme) → vue canonique SSR (`children`)
 *    → la page reste 100 % statique (le serveur ne lit jamais searchParams).
 *  - Recherche `q` / forme / pagination → résultats via /api/medicaments/search,
 *    rendus côté client (vues noindex, hors SEO).
 * La barre de recherche + les chips de forme sont toujours visibles (reflètent l'URL).
 * Enveloppé dans <Suspense> par la page (requis pour useSearchParams en statique).
 */
export function MedicationResults({
  children, formes,
}: {
  children: React.ReactNode;
  formes: FormeFilter[];
}) {
  const sp = useSearchParams();
  const q     = (sp.get("q") ?? "").trim();
  const forme = (sp.get("forme") ?? "").trim();
  const page  = Math.max(1, Number(sp.get("page")) || 1);
  const hasFilter = !!(q || forme || page > 1);

  const key = `${q}|${forme}|${page}`;
  const [entry, setEntry] = useState<{ key: string; medications: MedicationCardDTO[]; total: number; totalPages: number } | null>(null);

  useEffect(() => {
    if (!hasFilter) return;
    const params = new URLSearchParams();
    if (q)        params.set("q", q);
    if (forme)    params.set("forme", forme);
    if (page > 1) params.set("page", String(page));
    const ac = new AbortController();
    fetch(`/api/medicaments/search?${params.toString()}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setEntry({ key, medications: json.medications, total: json.total, totalPages: json.totalPages }))
      .catch((e) => { if (e.name !== "AbortError") setEntry({ key, medications: [], total: 0, totalPages: 0 }); });
    return () => ac.abort();
  }, [hasFilter, key, q, forme, page]);

  const filterBar = <MedicationFilterBar q={q} forme={forme} formes={formes} />;

  if (!hasFilter) return <>{filterBar}{children}</>;

  const current = entry?.key === key ? entry : null;
  const loading = !current;
  const medications = current?.medications ?? [];
  const total = current?.total ?? 0;
  const totalPages = current?.totalPages ?? 0;
  const formeLabel = formes.find((f) => f.query === forme)?.label ?? forme;

  const buildUrl = (p: number) => {
    const ps = new URLSearchParams();
    if (q)     ps.set("q", q);
    if (forme) ps.set("forme", forme);
    if (p > 1) ps.set("page", String(p));
    const qs = ps.toString();
    return `/medicaments${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {filterBar}

      <p className="mb-4 text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{total.toLocaleString("fr")}</span>
        {" "}résultat{total !== 1 ? "s" : ""}
        {forme && <> pour <span className="font-medium text-primary-700">&ldquo;{formeLabel}&rdquo;</span></>}
        {q && <> · <span className="font-medium text-primary-700">&ldquo;{q}&rdquo;</span></>}
        {" · "}
        <Link href="/medicaments" className="text-secondary-600 hover:text-secondary-700 underline underline-offset-2 font-medium">
          Tout afficher
        </Link>
      </p>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card p-4 flex items-start gap-3 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-slate-100 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : medications.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center">
            <PillIcon className="w-8 h-8 text-accent-400" />
          </div>
          <p className="font-semibold text-slate-700 text-base">Aucun médicament trouvé</p>
          <p className="text-sm text-slate-500 max-w-xs text-center">
            Essayez un autre nom ou DCI, ou supprimez les filtres actifs.
          </p>
          <Link href="/medicaments"
            className="mt-2 inline-flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
            Voir tous les médicaments
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {medications.map((m) => <MedicationCard key={m.id} m={m} />)}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} />
    </>
  );
}
