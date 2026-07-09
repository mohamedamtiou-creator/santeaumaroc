import type { EssentielFact } from "@/lib/specialty-content";
import type { Locale } from "@/lib/i18n";

/**
 * Encadré « L'essentiel » — faits chiffrés (tarifs, remboursement, fréquence)
 * affichés sous le hero. Idéal featured snippet / AI Overview.
 * Partagé entre la page spécialité racine et la page spécialité + ville
 * (la 1ʳᵉ tuile = compteur de praticiens, libellé contextualisé via `countLabel`).
 */
export function EssentielBox({
  facts,
  total,
  countLabel,
  reviewedDisplay,
  locale,
}: {
  facts: EssentielFact[];
  total: number;
  countLabel: string;
  reviewedDisplay: string;
  locale: Locale;
}) {
  return (
    <div className="card p-4 sm:p-5 mb-5 essentiel-facts">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <p className="section-eyebrow">{locale === "ar" ? "الأساسي" : "L'essentiel"}</p>
        <p className="text-xs text-slate-400">
          {locale === "ar" ? `آخر تحديث: ${reviewedDisplay}` : `Mis à jour le ${reviewedDisplay}`}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-primary-50 px-3 py-2.5">
          <p className="text-lg font-bold text-primary-700 tabular-nums leading-tight">
            {total.toLocaleString("fr")}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{countLabel}</p>
        </div>
        {facts.map((f) => (
          <div key={f.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <p className="text-base font-bold text-slate-800 leading-tight">{f.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
