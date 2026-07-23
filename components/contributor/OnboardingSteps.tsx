import type { Locale } from "@/lib/i18n";

/**
 * Fil de progression de l'onboarding auteur (Profession · Vérification · Publication).
 * Server Component pur (aucun état) — donne au médecin un repère « où j'en suis / ce
 * qui reste » à chaque étape du tunnel. Accessible : <ol> + aria-current="step".
 */
const STEPS: { fr: string; ar: string }[] = [
  { fr: "Profession", ar: "المهنة" },
  { fr: "Vérification", ar: "التحقق" },
  { fr: "Publication", ar: "النشر" },
];

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4 4 8-8" />
    </svg>
  );
}

export function OnboardingSteps({ current, locale = "fr" }: { current: 1 | 2 | 3; locale?: Locale }) {
  return (
    <ol className="flex items-center mb-8" aria-label={locale === "ar" ? "مراحل الانضمام" : "Étapes d'inscription"}>
      {STEPS.map((s, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "upcoming";
        const circle =
          state === "done"
            ? "bg-secondary-500 text-white"
            : state === "current"
              ? "bg-primary-600 text-white ring-4 ring-primary-100"
              : "bg-slate-100 text-slate-400";
        const label =
          state === "upcoming" ? "text-slate-400" : state === "current" ? "text-slate-900 font-semibold" : "text-slate-600";
        return (
          <li key={n} className="flex items-center min-w-0" aria-current={state === "current" ? "step" : undefined}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${circle}`}>
              {state === "done" ? <Check /> : n}
            </span>
            <span className={`ms-2 text-xs sm:text-sm whitespace-nowrap ${label}`} dir="auto">{locale === "ar" ? s.ar : s.fr}</span>
            {n < STEPS.length && (
              <span className={`mx-2 sm:mx-4 h-px w-6 sm:w-16 shrink ${n < current ? "bg-secondary-400" : "bg-slate-200"}`} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
