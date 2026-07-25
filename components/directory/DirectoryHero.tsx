/**
 * Héro clair premium des annuaires (villes, spécialités). Contrairement aux
 * hubs santé (héro de marque sombre `hero-bg`), les annuaires adoptent l'esthé-
 * tique claire de la page détail (dégradé bleu→émeraude sur blanc) et exposent
 * leurs chiffres réels en « stat-chips » — signal de couverture/autorité.
 * Server component — aucun état.
 */
export function DirectoryHero({
  eyebrow,
  title,
  stats,
  freeLabel,
}: {
  eyebrow: string;
  title: string;
  stats: { value: string; label: string }[];
  freeLabel?: string;
}) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-secondary-50/40 px-6 py-8 sm:px-10 sm:py-11 mb-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-100/50 blur-3xl" />
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-2">{eyebrow}</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight" dir="auto">{title}</h1>

        <div className="mt-6 flex flex-wrap items-center gap-2.5" dir="auto">
          {stats.map((s) => (
            <span key={s.label} className="inline-flex items-baseline gap-1.5 rounded-full bg-white ring-1 ring-slate-200 px-3.5 py-1.5 text-sm text-slate-600">
              <span className="font-bold text-slate-900 tabular-nums">{s.value}</span>
              {s.label}
            </span>
          ))}
          {freeLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 ring-1 ring-secondary-200 px-3.5 py-1.5 text-sm font-semibold text-secondary-800">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5" /></svg>
              {freeLabel}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
