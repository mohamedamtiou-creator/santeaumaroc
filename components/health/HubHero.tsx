import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary } from "@/lib/i18n";

/**
 * Héro partagé des hubs santé (symptômes, maladies, examens, traitements,
 * quel-médecin-pour). Conserve le héro de marque `hero-bg` (langage visuel du
 * site) mais l'élève avec une bande de confiance E-E-A-T : compteur de fiches,
 * « vérifié médicalement » et lien vers la méthodologie (transparence YMYL).
 * Server component — aucun état.
 */
export function HubHero({
  eyebrow,
  title,
  intro,
  countChip,
  chips,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  countChip?: string; // libellé pré-formaté, ex. « 23 symptômes »
  chips: Dictionary["healthHub"];
}) {
  return (
    <div className="hero-bg relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        aria-hidden="true"
      />
      <div className="relative max-w-3xl mx-auto px-4 py-14 sm:py-20">
        <p className="section-eyebrow text-secondary-300 mb-4">{eyebrow}</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 tracking-tight" dir="auto">{title}</h1>
        <p className="text-white/75 text-lg leading-relaxed max-w-2xl" dir="auto">{intro}</p>

        {/* Bande de confiance */}
        <div className="mt-7 flex flex-wrap items-center gap-2.5" dir="auto">
          {countChip && (
            <span className="badge-trust">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 4h7M5.5 8h7M5.5 12h7M2.5 4h.01M2.5 8h.01M2.5 12h.01" /></svg>
              {countChip}
            </span>
          )}
          <span className="badge-trust">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5 2.5 3.8v3.4c0 3.2 2.3 5.4 5.5 6.3 3.2-.9 5.5-3.1 5.5-6.3V3.8L8 1.5z" /><path d="m5.8 8 1.6 1.6L10.4 6" /></svg>
            {chips.verified}
          </span>
          <span className="badge-trust">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><path d="M8 4.5v3.5l2.2 1.3" /></svg>
            {chips.free}
          </span>
          <Link href="/methodologie" className="badge-trust hover:bg-white hover:text-primary-900 transition-colors">
            {chips.methodology}
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m4 2 4 4-4 4" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
