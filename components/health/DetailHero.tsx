import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Héro clair premium des fiches santé (symptôme, maladie, examen, traitement).
 * Même langage que la page détail « quel médecin » : dégradé bleu→émeraude sur
 * blanc, eyebrow, H1, « aussi appelé », et bande de confiance E-E-A-T honnête
 * (le badge « vérifié » n'apparaît que si une relecture a eu lieu). Server
 * component — aucun état.
 */
export function DetailHero({
  eyebrow,
  title,
  synonyms,
  alsoCalledLabel,
  reviewedAt,
  locale,
  chips,
}: {
  eyebrow: string;
  title: string;
  synonyms?: string[];
  alsoCalledLabel?: string;
  reviewedAt: Date | null;
  locale: Locale;
  chips: Dictionary["healthHub"];
}) {
  const reviewedDate = reviewedAt
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(reviewedAt))
    : null;

  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-primary-50 via-white to-secondary-50/40 px-6 py-8 sm:px-10 sm:py-11 mb-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-100/50 blur-3xl" />
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-2">{eyebrow}</p>
        <h1 className="text-[1.7rem] leading-tight sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl" dir="auto">{title}</h1>

        {synonyms && synonyms.length > 0 && (
          <p className="text-sm text-slate-500 mt-3" dir="auto">
            {alsoCalledLabel && <span className="font-semibold text-slate-600">{alsoCalledLabel} : </span>}
            {synonyms.join(" · ")}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2.5" dir="auto">
          {reviewedDate && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 ring-1 ring-secondary-200 px-3 py-1.5 text-xs font-semibold text-secondary-800">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 10.5 9.5 12.5 13 8.5" /><circle cx="10" cy="10" r="8" /></svg>
              {chips.verified}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M2.5 10h15M10 2.5c2 2.2 3 4.8 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.8-3-7.5s1-5.3 3-7.5z" /></svg>
            {chips.free}
          </span>
          {reviewedDate && (
            <span className="text-xs text-slate-500">{chips.updatedOn.replace("{date}", reviewedDate)}</span>
          )}
        </div>
      </div>
    </header>
  );
}
