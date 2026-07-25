import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary } from "@/lib/i18n";

const GENERALIST_SLUG = "medecine-generale";

/**
 * Panneau de conversion sticky (desktop) des fiches santé : oriente vers la
 * spécialité adaptée (CTA principal), le généraliste (premier recours) et
 * rappelle le repère d'urgence. Masqué en mobile (le maillage spécialité +
 * RelatedDoctors reste présent dans le flux de l'article). Server component.
 */
export function SpecialtyAside({
  specialtySlug,
  ctaLabel,
  emergencyNote,
  chips,
}: {
  specialtySlug: string;
  ctaLabel: string;         // ex. « Consulter un gastro-entérologue »
  emergencyNote?: string;   // repère d'urgence localisé (141 / 15…) — omis si non pertinent
  chips: Dictionary["healthHub"];
}) {
  return (
    <aside className="hidden lg:block" aria-label={chips.consultTitle}>
      <div className="sticky top-20 space-y-4">
        <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary-600 ring-1 ring-primary-100 mb-3" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v5a4 4 0 0 0 8 0V2M10 11v3a4 4 0 0 0 4 4 3 3 0 0 0 3-3v-1" /><circle cx="17" cy="12" r="1.5" /></svg>
          </span>
          <h2 className="font-bold text-slate-900 text-lg leading-snug">{chips.consultTitle}</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">{chips.consultSubtitle}</p>
          <Link href={`/specialites/${specialtySlug}`} className="btn-primary w-full">
            {ctaLabel}
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="m6 3 5 5-5 5" /></svg>
          </Link>
          <Link href={`/specialites/${GENERALIST_SLUG}`} className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-700">
            {chips.findGeneralist}
          </Link>
        </div>

        {emergencyNote && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 flex items-start gap-3">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M10 6v5M10 14h.01M8.6 2.9 1.7 15a1.6 1.6 0 0 0 1.4 2.4h13.8a1.6 1.6 0 0 0 1.4-2.4L11.4 2.9a1.6 1.6 0 0 0-2.8 0z" /></svg>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{chips.urgencyNote}</p>
              <p className="text-sm text-rose-900 leading-snug mt-0.5">{emergencyNote}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
