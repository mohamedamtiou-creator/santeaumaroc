import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { FormeFilter } from "@/lib/medications-query";

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="6"/>
      <path d="m14 14 4 4" strokeLinecap="round"/>
    </svg>
  );
}

const CHIP_ACTIVE   = "inline-flex items-center shrink-0 h-9 px-4 rounded-full text-sm font-semibold bg-primary-600 text-white capitalize whitespace-nowrap transition-all";
const CHIP_INACTIVE = "inline-flex items-center shrink-0 h-9 px-4 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-primary-300 hover:text-primary-700 capitalize whitespace-nowrap transition-all";

/** Barre de recherche + chips de forme — présentationnelle (client-safe),
 *  partagée par le fallback statique et la vue client MedicationResults. */
export function MedicationFilterBar({ q, forme, formes }: { q: string; forme: string; formes: FormeFilter[] }) {
  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5"
        style={{ boxShadow: "0 1px 4px 0 rgb(0 0 0 / 0.06)" }}>
        <form method="GET" action="/medicaments">
          <div className="flex gap-2.5">
            <label className="flex-1 relative flex items-center">
              <span className="absolute start-3.5 pointer-events-none"><SearchIcon /></span>
              <input type="search" name="q" defaultValue={q} placeholder="Nom du médicament, DCI…"
                className="input-field ps-11 h-12 w-full" />
              {forme && <input type="hidden" name="forme" value={forme} />}
            </label>
            <button type="submit" className="btn-primary h-12 px-5 shrink-0 rounded-xl">Rechercher</button>
          </div>
        </form>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        <Link href={q ? `/medicaments?q=${encodeURIComponent(q)}` : "/medicaments"} className={!forme ? CHIP_ACTIVE : CHIP_INACTIVE}>
          Toutes formes
        </Link>
        {formes.map((f) => {
          const ps = new URLSearchParams();
          if (q) ps.set("q", q);
          ps.set("forme", f.query);
          return (
            <Link key={f.query} href={`/medicaments?${ps.toString()}`} className={forme === f.query ? CHIP_ACTIVE : CHIP_INACTIVE}>
              {f.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
