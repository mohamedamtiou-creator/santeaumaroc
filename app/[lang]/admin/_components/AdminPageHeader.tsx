import type { ReactNode } from "react";

/**
 * En-tête standard d'une page admin : eyebrow + titre + sous-titre optionnel,
 * avec une zone d'actions alignée à droite.
 */
export function AdminPageHeader({
  title,
  subtitle,
  eyebrow = "Administration",
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">{eyebrow}</p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
