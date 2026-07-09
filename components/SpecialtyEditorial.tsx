import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { SpecialtyContent } from "@/lib/specialty-content";
import type { Dictionary, Locale } from "@/lib/i18n";

type Faq = { q: string; a: string };

/**
 * Bloc éditorial spécialité (FR + AR) : description + « quand consulter »,
 * sections H2, tableau de prix indicatifs, FAQ accordéon.
 *
 * Source unique partagée entre `/specialites/[slug]` et `/specialites/[slug]/[ville]`
 * (fin du fork copié-collé). En mode ville, `cityName` contextualise les titres et
 * `lead` injecte un paragraphe d'introduction localisé (anti-duplicate content).
 *
 * Le tableau `faqs` est fourni par l'appelant (et non lu depuis `content`) afin que
 * le JSON-LD `FAQPage` de la page reste strictement synchronisé avec ce qui est rendu.
 */
export function SpecialtyEditorial({
  content,
  synonyme,
  specName,
  specialtyName,
  faqs,
  locale,
  t,
  cityName = null,
  lead = null,
}: {
  content: SpecialtyContent;
  synonyme: string;
  specName: string;
  specialtyName: string;
  faqs: Faq[];
  locale: Locale;
  t: Dictionary["directory"];
  cityName?: string | null;
  lead?: string | null;
}) {
  const hasSections = (content.sections?.length ?? 0) > 0;
  const hasPrix = !!(content.prix && content.prix.rows.length > 0);
  const hasIntro = !!(content.description || content.quandConsulter.length > 0 || lead);

  if (!hasIntro && !hasSections && !hasPrix && faqs.length === 0) return null;

  const synLower = synonyme !== "spécialiste" ? synonyme : specialtyName.toLowerCase();

  return (
    <div className="mt-10 space-y-4">

      {/* Description + Quand consulter (+ lead localisé en mode ville) */}
      {hasIntro && (
        <div className="card p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900 text-base mb-3 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true">
              <circle cx="8" cy="8" r="7" />
              <path d="M8 7v5M8 5v.5" strokeLinecap="round" />
            </svg>
            {locale === "ar" ? `${t.whatIs} ${specName}؟` : `Qu'est-ce qu'un ${synLower} ?`}
          </h2>
          {lead && (
            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-3">{lead}</p>
          )}
          {content.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{content.description}</p>
          )}
          {content.quandConsulter.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2.5">
                {t.whenConsult}
              </p>
              <ul className="space-y-1.5">
                {content.quandConsulter.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"
                      className="w-3 h-3 text-secondary-500 mt-0.5 shrink-0" aria-hidden="true"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Sections éditoriales (H2) */}
      {hasSections && (
        <div className="card p-5 sm:p-6 space-y-6">
          {content.sections!.map((sec) => (
            <section key={sec.h}>
              <h2 className="font-semibold text-slate-900 text-base mb-2">{sec.h}</h2>
              <div className="space-y-2">
                {sec.body.map((para, i) => (
                  <p key={i} className="text-sm text-slate-600 leading-relaxed">{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Tableau de tarifs indicatifs */}
      {hasPrix && (
        <div className="card p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900 text-base mb-3 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 1H3v6l6 6 6-6-6-6z" />
              <circle cx="5.5" cy="3.5" r=".75" />
            </svg>
            {content.prix!.title}
          </h2>
          {content.prix!.intro && (
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{content.prix!.intro}</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {content.prix!.rows.map((r) => (
                  <tr key={r.label} className="border-t border-slate-100 first:border-t-0">
                    <td className="py-2.5 pe-4 text-slate-600">{r.label}</td>
                    <td className="py-2.5 text-end font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                      {r.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {content.prix!.note && (
            <p className="text-xs text-slate-400 mt-3">{content.prix!.note}</p>
          )}
        </div>
      )}

      {/* FAQ accordéon */}
      {faqs.length > 0 && (
        <div className="card p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900 text-base mb-4 flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4 h-4 text-primary-500 shrink-0" aria-hidden="true"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="7" />
              <path d="M6 6c0-1.1.9-2 2-2s2 .9 2 2c0 1-1 1.5-2 2v.5M8 12v.5" strokeLinecap="round" />
            </svg>
            {locale === "ar"
              ? `${t.faqHeading} — ${specName}${cityName ? ` ${t.in} ${cityName}` : ""}`
              : `${t.faqHeading} — ${synLower}${cityName ? ` à ${cityName}` : ""}`}
          </h2>
          <FaqAccordion faqs={faqs} />
        </div>
      )}
    </div>
  );
}
