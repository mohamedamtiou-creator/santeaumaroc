import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { alphaIndexPath, type LetterBucket } from "@/lib/city-alpha-index";
import type { Locale } from "@/lib/i18n";

/**
 * Barre A–Z d'une ville — le point d'entrée du chemin de crawl.
 *
 * Les lettres découpées en plusieurs pages exposent CHAQUE sous-page ici même
 * (« B 1 · 2 · 3 · 4 ») : toutes les pages d'index restent donc à un clic de la
 * page ville, sans jamais former de chaîne de pagination.
 */
export function AlphaIndexNav({
  citySlug,
  cityName,
  buckets,
  locale,
  /** Lettre + page en cours, pour marquer l'entrée active (pages d'index). */
  activeLetter,
  activePage,
  heading = true,
}: {
  citySlug: string;
  cityName: string;
  buckets: LetterBucket[];
  locale: Locale;
  activeLetter?: string;
  activePage?: number;
  heading?: boolean;
}) {
  if (buckets.length === 0) return null;

  const ar = locale === "ar";
  const title = ar
    ? `كل الأطباء في ${cityName} حسب الحرف`
    : `Tous les praticiens à ${cityName}, par ordre alphabétique`;
  const hint = ar
    ? "تصفّح الدليل الكامل حرفًا بحرف."
    : "Parcourez l'annuaire complet, lettre par lettre.";

  const chip =
    "inline-flex items-center justify-center gap-1 min-w-9 h-9 px-2.5 rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";
  const chipIdle = `${chip} border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50`;
  const chipActive = `${chip} border-primary-500 bg-primary-50 text-primary-700 font-semibold`;

  return (
    <nav className="mt-8 pt-6 border-t border-slate-100" aria-label={title}>
      {heading && (
        <h2 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
            className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h7" />
          </svg>
          {title}
        </h2>
      )}
      <p className="text-xs text-slate-500 mb-3">{hint}</p>

      <ul className="flex flex-wrap gap-2">
        {buckets.map((b) => {
          const isActiveLetter = activeLetter?.toUpperCase() === b.letter;

          // Lettre tenant sur une page : un seul lien portant le compteur.
          if (b.pages <= 1) {
            return (
              <li key={b.slug}>
                <Link
                  href={alphaIndexPath(citySlug, b.slug)}
                  className={isActiveLetter ? chipActive : chipIdle}
                  aria-current={isActiveLetter ? "page" : undefined}
                >
                  <span>{b.letter}</span>
                  <span className="text-xs text-slate-500 tabular-nums">{b.count}</span>
                </Link>
              </li>
            );
          }

          // Lettre découpée : la lettre + chacune de ses pages, toutes à 1 clic.
          return (
            <li key={b.slug} className="inline-flex items-center gap-1">
              <span className="inline-flex items-center gap-1 h-9 px-1.5 text-sm font-semibold text-slate-700">
                {b.letter}
                <span className="text-xs font-normal text-slate-500 tabular-nums">{b.count}</span>
              </span>
              {Array.from({ length: b.pages }, (_, i) => i + 1).map((p) => {
                const isActive = isActiveLetter && (activePage ?? 1) === p;
                return (
                  <Link
                    key={p}
                    href={alphaIndexPath(citySlug, b.slug, p)}
                    className={isActive ? chipActive : chipIdle}
                    aria-label={ar ? `${b.letter} — صفحة ${p}` : `${b.letter} — page ${p}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="tabular-nums">{p}</span>
                  </Link>
                );
              })}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
