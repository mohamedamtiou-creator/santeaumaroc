import type { ReactNode } from "react";

/**
 * En-tête de page unifié de l'espace patient : eyebrow + titre + action
 * optionnelle, refermé par un filet dégradé bleu→émeraude (langage de marque).
 * Server component — aucun état, réutilisé sur les 4 pages pour une cohérence
 * visuelle premium (fini les en-têtes ad hoc divergents d'une page à l'autre).
 */
export function DashboardHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-1">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight" dir="auto">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1.5" dir="auto">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div
        className="mt-4 h-px bg-gradient-to-r from-primary-200 via-secondary-200/60 to-transparent rtl:bg-gradient-to-l"
        aria-hidden="true"
      />
    </header>
  );
}
