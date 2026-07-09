import { LocaleLink as Link } from "@/components/i18n/LocaleLink";

type Crumb = { label: string; href: string };

type Props = {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, breadcrumbs, action }: Props) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
          <Link href="/" className="hover:text-secondary-600 transition-colors">
            Accueil
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-300" aria-hidden="true">
                <path d="m6 3 5 5-5 5" strokeLinecap="round" />
              </svg>
              <Link href={crumb.href} className="hover:text-secondary-600 transition-colors">
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-4 h-px bg-slate-100" />
    </div>
  );
}
