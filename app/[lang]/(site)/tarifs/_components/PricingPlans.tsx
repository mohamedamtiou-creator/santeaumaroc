"use client";

import { useState } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import type { Dictionary } from "@/lib/i18n";
import { PRO_MONTHLY, PRO_ANNUAL_PER_MONTH, PRO_ANNUAL_TOTAL } from "@/features/subscription/plans";
import { StartTrialButton } from "@/app/[lang]/(site)/praticien/tableau-de-bord/abonnement/_components/StartTrialButton";

type TarifsT = Dictionary["tarifs"];

/* Total annuel formaté pour la note "Soit {total} MAD/an" (espaces fines FR). */
const PRO_YEARLY_TOTAL = PRO_ANNUAL_TOTAL.toLocaleString("fr-FR");

/* CTA.
   Gratuit → inscription praticien ; Pro → tunnel virement self-service ;
   Cabinet → demande d'activation (lead commercial, sur devis). */
const HREF_FREE = "/inscription-praticien";
const HREF_CABINET = "/tarifs/activer?offre=cabinet";

function Check() {
  return (
    <span className="w-[18px] h-[18px] rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center shrink-0 mt-0.5">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6l3 3 5-5" />
      </svg>
    </span>
  );
}

function Cross() {
  return (
    <span className="w-[18px] h-[18px] rounded-full bg-slate-100 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2 h-2" aria-hidden="true" strokeLinecap="round">
        <path d="M3 3l6 6M9 3l-6 6" />
      </svg>
    </span>
  );
}

export function PricingPlans({
  t,
  trialEligible = false,
  trialLabel = "",
}: {
  t: TarifsT;
  trialEligible?: boolean;
  trialLabel?: string;
}) {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      {/* Toggle facturation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white border border-slate-200 rounded-full p-1.5 shadow-sm" role="group" aria-label={t.plansEyebrow}>
          <button
            type="button"
            onClick={() => setYearly(false)}
            aria-pressed={!yearly}
            className={`text-sm font-semibold px-5 py-2 rounded-full transition-colors ${!yearly ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.billingMonthly}
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            aria-pressed={yearly}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full transition-colors ${yearly ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.billingYearly}
            <span className="text-[11px] font-bold text-secondary-700 bg-secondary-50 border border-secondary-100 px-2 py-0.5 rounded-full">
              {t.billingSave}
            </span>
          </button>
        </div>
      </div>

      {/* Cartes */}
      <div className="grid md:grid-cols-3 gap-5 md:gap-4 items-start max-w-5xl mx-auto">

        {/* ── Gratuit ── */}
        <div className="card p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.freeName}</p>
            <p className="text-sm text-slate-500 mt-1.5 leading-snug min-h-[40px]">{t.freeTag}</p>
          </div>
          <div>
            <p className="flex items-end gap-1.5">
              <span className="text-[40px] font-extrabold text-slate-900 leading-none tabular-nums" dir="ltr">{t.freePrice}</span>
              <span className="text-sm font-semibold text-slate-500 mb-1">{t.currency}</span>
              <span className="text-xs text-slate-500 mb-1.5">{t.perAlways}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1.5">{t.freeNoCard}</p>
          </div>
          <Link href={HREF_FREE} className="btn-outline w-full justify-center py-3">{t.freeCta}</Link>
          <p className="text-xs text-slate-500 text-center">{t.freeCtaNote}</p>
          <ul className="flex flex-col gap-2.5">
            {t.freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug"><Check />{f}</li>
            ))}
            {t.freeMissing.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400 leading-snug"><Cross />{f}</li>
            ))}
          </ul>
        </div>

        {/* ── Pro (mis en avant) ── */}
        <div className="card p-6 pt-7 flex flex-col gap-5 relative border-2 border-secondary-500 shadow-lg md:-translate-y-3">
          <span className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bg-gradient-to-br from-secondary-600 to-secondary-500 text-white text-[11px] font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap">
            {t.badge}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-secondary-700">{t.proName}</p>
            <p className="text-sm text-slate-500 mt-1.5 leading-snug min-h-[40px]">{t.proTag}</p>
          </div>
          <div>
            <p className="flex items-end gap-1.5">
              <span className="text-[40px] font-extrabold text-slate-900 leading-none tabular-nums" dir="ltr">{yearly ? PRO_ANNUAL_PER_MONTH : PRO_MONTHLY}</span>
              <span className="text-sm font-semibold text-slate-500 mb-1">{t.currency}</span>
              <span className="text-xs text-slate-500 mb-1.5">{t.perMonth}</span>
            </p>
            <p className="text-xs text-secondary-700 font-semibold mt-1.5 min-h-[16px]">
              {yearly ? t.proNoteYear.replace("{total}", PRO_YEARLY_TOTAL) : t.proNoteMonth}
            </p>
          </div>
          <Link href={`/tarifs/souscrire?cycle=${yearly ? "annuel" : "mensuel"}`} className="btn-secondary w-full justify-center py-3">{t.proCta}</Link>
          {trialEligible && trialLabel && (
            <StartTrialButton
              label={trialLabel}
              redirectTo="/praticien/tableau-de-bord/abonnement"
              className="btn-outline w-full justify-center py-3 border-secondary-300 text-secondary-700 hover:bg-secondary-50"
            />
          )}
          <p className="text-xs text-slate-500 text-center inline-flex items-center justify-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-secondary-600 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3.5 3.5 6.5-7" /></svg>
            {t.proCtaNote}
          </p>
          <p className="text-xs font-semibold text-slate-500">{t.proLeadIn}</p>
          <ul className="flex flex-col gap-2.5">
            {t.proFeatures.map((f, i) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug">
                <Check />{i === 0 ? <strong className="font-semibold text-slate-900">{f}</strong> : f}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Cabinet / Clinique ── */}
        <div className="card p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t.clinicName}</p>
            <p className="text-sm text-slate-500 mt-1.5 leading-snug min-h-[40px]">{t.clinicTag}</p>
          </div>
          <div>
            <p className="text-[28px] font-extrabold text-slate-900 leading-none">{t.quotePrice}</p>
            <p className="text-xs text-slate-400 mt-2">{t.clinicPriceNote}</p>
          </div>
          <Link href={HREF_CABINET} className="btn-primary w-full justify-center py-3">{t.clinicCta}</Link>
          <p className="text-xs text-slate-500 text-center">{t.clinicCtaNote}</p>
          <p className="text-xs font-semibold text-slate-500">{t.clinicLeadIn}</p>
          <ul className="flex flex-col gap-2.5">
            {t.clinicFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug"><Check />{f}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
