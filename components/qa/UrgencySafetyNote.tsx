import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

const TITLE_ID = "qa-urgency-note";

/**
 * Notice de sécurité sobre pour le tunnel « poser » (option A de l'audit).
 * Volontairement discrète (ambre, compacte) — le signal FORT est l'alerte rouge
 * dynamique d'AskForm, déclenchée par les mots-clés d'urgence pendant la saisie,
 * et la bannière rouge de /questions/[slug] quand la question est URGENT.
 * Ici on garde juste un filet de sécurité accessible, sans alarmer les 95 %
 * d'utilisateurs non urgents ni repousser le formulaire.
 */
export function UrgencySafetyNote({ t }: { t: QaT }) {
  return (
    <aside
      role="region"
      aria-labelledby={TITLE_ID}
      className="rounded-xl border border-amber-200/80 bg-amber-50/50 px-3.5 py-2.5 flex items-start gap-2.5 text-sm text-slate-600"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="#b45309" strokeWidth="1.7" className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2 2 17h16L10 2z" /><path d="M10 8v4" /><circle cx="10" cy="14.5" r=".5" fill="#b45309" />
      </svg>
      <p className="leading-relaxed">
        <span id={TITLE_ID} className="font-semibold text-slate-700">{t.urgencyNote}</span>{" "}
        <span dir="ltr" className="whitespace-nowrap font-semibold text-amber-700">
          <a href="tel:15" aria-label={t.urgencyEmergency} className="hover:underline">15</a>
          {" · "}
          <a href="tel:141" aria-label={t.urgencySamu} className="hover:underline">141</a>
          {" · "}
          <a href="tel:112" aria-label={t.urgencyMobile} className="hover:underline">112</a>
        </span>
        <span className="text-slate-400"> · {t.urgencyFree}</span>
      </p>
    </aside>
  );
}
