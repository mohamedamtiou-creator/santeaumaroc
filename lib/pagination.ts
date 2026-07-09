/**
 * Helpers de pagination partagés pour le backoffice admin.
 *
 * Toutes les listes admin utilisent une pagination par offset (skip/take)
 * avec une taille de page unique. On reste volontairement simple : les
 * volumes admin tiennent largement dans une pagination offset.
 */

export const ADMIN_PER_PAGE = 25;

/** Normalise le paramètre `page` (1-based) et calcule skip/take. */
export function parsePage(raw: string | undefined, perPage: number = ADMIN_PER_PAGE) {
  const n = Number.parseInt(raw ?? "1", 10);
  const page = Number.isFinite(n) && n > 0 ? n : 1;
  return { page, skip: (page - 1) * perPage, take: perPage };
}

/** Nombre total de pages pour `total` enregistrements. */
export function totalPages(total: number, perPage: number = ADMIN_PER_PAGE) {
  return Math.max(1, Math.ceil(total / perPage));
}

/**
 * Construit une fabrique d'URL qui conserve les filtres courants et ne fait
 * que remplacer le paramètre `page`. `page=1` est omis pour des URL propres.
 */
export function buildPageUrl(
  basePath: string,
  current: Record<string, string | undefined>,
) {
  return (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(current)) {
      if (key === "page") continue;
      if (value) params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
}

/** Bornes affichées « X–Y sur N ». */
export function rangeLabel(page: number, perPage: number, total: number) {
  if (total === 0) return { from: 0, to: 0, total };
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return { from, to, total };
}
