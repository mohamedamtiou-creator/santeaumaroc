/**
 * En-tête de page unifié pour tout l'espace praticien.
 * Même langage visuel que l'accueil du tableau de bord :
 * eyebrow « Tableau de bord » + titre de section (+ sous-titre / action optionnels),
 * sans filet dégradé — l'espacement et la première carte font la séparation.
 * Server Component (aucun hook) : utilisable directement dans les pages.
 */
/**
 * Bandeau d'accent dégradé bleu→vert en tête des cartes principales.
 * - `bleed` (défaut) : remonte/élargit en marges négatives pour une carte
 *   déjà paddée (`card p-5 sm:p-6`) → le bandeau touche les bords.
 * - `bleed={false}` : pour une carte `overflow-hidden p-0` (1er enfant direct).
 */
export function CardAccent({ bleed = true }: { bleed?: boolean }) {
  return (
    <div
      className={`h-1 ${bleed ? "-mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-5 rounded-t-2xl" : ""}`}
      style={{ background: "linear-gradient(90deg,#2563eb 0%,#059669 100%)" }}
      aria-hidden="true"
    />
  );
}

export function DashHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="section-eyebrow mb-1">{eyebrow}</p>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
