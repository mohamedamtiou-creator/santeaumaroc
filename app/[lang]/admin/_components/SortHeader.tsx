import Link from "next/link";

export type SortDir = "asc" | "desc";

/** Normalise le paramètre `dir` (défaut asc). */
export function parseDir(raw: string | undefined): SortDir {
  return raw === "desc" ? "desc" : "asc";
}

/** Flèche de tri : pleine (asc/desc) si actif, double-chevron atténué sinon. */
export function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg viewBox="0 0 12 12" className="w-3 h-3 text-slate-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3.5 5 2.5-2.5L8.5 5" /><path d="m3.5 7 2.5 2.5L8.5 7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 12 12" className="w-3 h-3 text-primary-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      {dir === "asc" ? <path d="m3 7.5 3-3 3 3" /> : <path d="m3 4.5 3 3 3-3" />}
    </svg>
  );
}

/**
 * En-tête de colonne triable, partagé par les tables admin.
 * Bascule asc⇄desc au clic, conserve les filtres passés dans `params`,
 * et repart à la page 1 (le paramètre `page` n'est jamais propagé).
 *
 * Chaque page définit sa propre map de tris (clé → orderBy Prisma) ; ce
 * composant ne gère que l'URL et l'indicateur visuel.
 */
export function SortableTh({
  col,
  label,
  basePath,
  tri,
  dir,
  params = {},
  className = "",
}: {
  col: string;
  label: string;
  basePath: string;
  tri?: string;
  dir: SortDir;
  params?: Record<string, string | undefined>;
  className?: string;
}) {
  const active = tri === col;
  const nextDir: SortDir = active && dir === "asc" ? "desc" : "asc";

  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k === "page" || k === "tri" || k === "dir") continue;
    if (v) sp.set(k, v);
  }
  sp.set("tri", col);
  sp.set("dir", nextDir);

  return (
    <th
      className={className}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <Link
        href={`${basePath}?${sp.toString()}`}
        scroll={false}
        className={`inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${
          active ? "text-slate-700" : "hover:text-slate-700"
        }`}
        title={`Trier par ${label}${active ? (dir === "asc" ? " (croissant)" : " (décroissant)") : ""}`}
      >
        {label}
        <SortArrow active={active} dir={dir} />
      </Link>
    </th>
  );
}
