import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { medIndexPath, type MedLetterBucket } from "@/lib/medicament-remboursement";
import type { Locale } from "@/lib/i18n";

/**
 * Barre A–Z du silo remboursement des médicaments.
 *
 * Même patron que components/villes/AlphaIndexNav : les lettres découpées en
 * plusieurs pages exposent CHACUNE de leurs sous-pages ici, de sorte que les
 * 5 916 fiches restent à deux clics du hub sans jamais former de chaîne de
 * pagination.
 */
export function MedAlphaNav({
  buckets,
  locale,
  title,
  activeLetter,
  activePage,
}: {
  buckets: MedLetterBucket[];
  locale: Locale;
  title: string;
  activeLetter?: string;
  activePage?: number;
}) {
  if (buckets.length === 0) return null;
  const ar = locale === "ar";

  const chip =
    "inline-flex items-center justify-center gap-1 min-w-9 h-9 px-2.5 rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";
  const idle = `${chip} border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50`;
  const active = `${chip} border-primary-500 bg-primary-50 text-primary-700 font-semibold`;

  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2" dir="auto">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
          className="w-4 h-4 text-primary-400 shrink-0" aria-hidden="true"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h7" />
        </svg>
        {title}
      </h2>

      <ul className="flex flex-wrap gap-2">
        {buckets.map((b) => {
          const isActiveLetter = activeLetter === b.slug;

          if (b.pages <= 1) {
            return (
              <li key={b.slug}>
                <Link
                  href={medIndexPath(b.slug)}
                  className={isActiveLetter ? active : idle}
                  aria-current={isActiveLetter ? "page" : undefined}
                >
                  <span>{b.letter}</span>
                  <span className="text-xs text-slate-500 tabular-nums">{b.count}</span>
                </Link>
              </li>
            );
          }

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
                    href={medIndexPath(b.slug, p)}
                    className={isActive ? active : idle}
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
