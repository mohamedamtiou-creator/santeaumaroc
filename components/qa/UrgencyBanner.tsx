import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

const TITLE_ID = "qa-urgency-title";

/**
 * Bannière secours — toujours visible en tête du tunnel « poser ».
 * `role="region"` (et non `alert`) : elle est permanente, pas annoncée dynamiquement.
 * L'encadré rouge déclenché à la saisie (AskForm) reste, lui, une live region.
 * Numéros vérifiés au Maroc : 15 (Protection Civile / ambulance, le plus fiable
 * partout), 141 (SAMU, grandes villes), 112 (depuis tout mobile). Gratuits, 24h/24.
 */
export function UrgencyBanner({ t }: { t: QaT }) {
  return (
    <aside
      role="region"
      aria-labelledby={TITLE_ID}
      className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 flex gap-3"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="#dc2626" strokeWidth="1.8" className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2 2 17h16L10 2z" /><path d="M10 8v4" /><circle cx="10" cy="14.5" r=".5" fill="#dc2626" />
      </svg>
      <div>
        <p id={TITLE_ID} className="font-bold text-red-800 text-sm mb-1">{t.urgencyTitle}</p>
        <p className="text-sm text-red-700 leading-relaxed mb-2.5">{t.urgencyText}</p>
        <div className="flex flex-wrap items-center gap-2" dir="ltr">
          <a href="tel:15" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-red-200 px-3 py-1.5 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors">{t.urgencyEmergency}</a>
          <a href="tel:141" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-red-200 px-3 py-1.5 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors">{t.urgencySamu}</a>
          <a href="tel:112" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-red-200 px-3 py-1.5 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors">{t.urgencyMobile}</a>
          <span className="text-xs font-medium text-red-600/90">{t.urgencyFree}</span>
        </div>
      </div>
    </aside>
  );
}
