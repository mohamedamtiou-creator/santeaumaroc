import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

const TITLE_ID = "qa-safety-note";

/**
 * Note de sécurité YMYL pour l'espace Q/R (accueil + liste).
 *
 * Signal EEAT attendu par les Quality Raters de Google sur du santé grand
 * public : rappel que les réponses sont des informations générales (≠ diagnostic)
 * + orientation urgence. Volontairement sobre (slate/ambre, une ligne) pour ne
 * pas alarmer ni casser la conversion — la vraie alerte forte reste contextuelle
 * (mots-clés d'urgence dans le tunnel poser, bannière rouge sur une question URGENT).
 */
export function QaSafetyNote({ t }: { t: QaT }) {
  return (
    <aside
      role="note"
      aria-labelledby={TITLE_ID}
      className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 flex items-start gap-2.5 text-sm text-slate-600"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" /><path d="M10 9v4.5" /><circle cx="10" cy="6.3" r=".6" fill="currentColor" />
      </svg>
      <p className="leading-relaxed">
        <span id={TITLE_ID}>{t.disclaimerNote}</span>{" "}
        <span className="font-semibold text-slate-700">{t.safetyEmergency}</span>{" "}
        <span dir="ltr" className="whitespace-nowrap font-semibold text-amber-700">
          <a href="tel:15" aria-label={t.urgencyEmergency} className="hover:underline">15</a>
          {" · "}
          <a href="tel:141" aria-label={t.urgencySamu} className="hover:underline">141</a>
          {" · "}
          <a href="tel:112" aria-label={t.urgencyMobile} className="hover:underline">112</a>
        </span>
      </p>
    </aside>
  );
}
