import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { MedicationCardDTO } from "@/lib/medications-query";

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={className ?? "w-5 h-5"} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="4"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 12 12" fill={filled ? "#fbbf24" : "none"} stroke={filled ? "#fbbf24" : "#d1d5db"}
      strokeWidth="1" className="w-3 h-3" aria-hidden="true">
      <path d="M6 .5l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 7.5l-2.78 1.55.53-3.09L1.5 3.77l3.11-.45z"/>
    </svg>
  );
}

function StarsRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-px" aria-label={`Note : ${rating} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < Math.round(rating)} />)}
    </div>
  );
}

function ratingColor(r: number): string {
  if (r >= 4) return "text-emerald-600";
  if (r >= 3) return "text-amber-600";
  return "text-rose-500";
}

/** Carte médicament — présentationnelle (client-safe), partagée par la vue
 *  canonique SSR et la vue filtrée client. */
export function MedicationCard({ m }: { m: MedicationCardDTO }) {
  const dosageLabel = [m.dosage, m.uniteDosage].filter(Boolean).join(" ");
  return (
    <Link href={`/medicaments/${m.slug}`} className="card group flex items-start gap-3 p-4">
      <div className="w-11 h-11 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center shrink-0 group-hover:bg-accent-100 transition-colors">
        <PillIcon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-slate-900 text-sm leading-snug truncate group-hover:text-primary-700 transition-colors">
          {m.nom}
        </h2>
        {m.dci && (
          <p className="text-[12px] text-slate-500 italic truncate mt-0.5">{m.dci}</p>
        )}

        {(m.forme || dosageLabel || m.princepsGenerique) && (
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {m.forme && (
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200 capitalize">
                {m.forme}
              </span>
            )}
            {dosageLabel && (
              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {dosageLabel}
              </span>
            )}
            {m.princepsGenerique === "P" && (
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                Princeps
              </span>
            )}
            {m.princepsGenerique === "G" && (
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-100">
                Générique
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-2">
          <StarsRow rating={m.avg} />
          {m.avg > 0 ? (
            <>
              <span className={`text-xs font-bold tabular-nums ${ratingColor(m.avg)}`}>
                {m.avg.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">· {m.reviewsCount} avis</span>
            </>
          ) : (
            <span className="text-xs text-slate-500">Aucun avis</span>
          )}
        </div>
      </div>

      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
        className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors shrink-0 mt-0.5" aria-hidden="true">
        <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
      </svg>
    </Link>
  );
}
