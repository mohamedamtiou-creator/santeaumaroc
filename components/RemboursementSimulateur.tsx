"use client";

import { useState } from "react";

/**
 * Simulateur indicatif de remboursement AMO / CNSS.
 *
 * Outil « linkable » (aimant à backlinks) intégré à /remboursement-amo-cnss.
 * Le calcul est une simple arithmétique sur des valeurs SAISIES par l'utilisateur
 * (montant payé, tarif de référence TNR, taux) : aucune valeur réglementaire
 * officielle n'est codée en dur — le TNR et le taux dépendent de l'acte et du
 * régime, et sont donc éditables, avec un avertissement clair. FR + AR.
 *
 * Règle : le remboursement porte sur le Tarif National de Référence (TNR), pas
 * sur le prix réellement payé. base = min(TNR, montant payé) ; remboursement =
 * taux × base ; ticket modérateur = base − remboursement ; dépassement =
 * max(0, montant − TNR) ; reste à charge = montant − remboursement.
 */

type L = "fr" | "ar";

const COPY = {
  fr: {
    title: "Simulateur de remboursement AMO / CNSS",
    intro:
      "Estimez ce que vous pourriez récupérer et ce qui reste à votre charge. Résultat indicatif : le tarif de référence (TNR) et le taux dépendent de l'acte et de votre régime.",
    montant: "Montant payé au médecin",
    tnr: "Tarif de référence (TNR)",
    tnrHint: "Fixé par l'ANAM, variable selon l'acte. À vérifier auprès de votre caisse.",
    taux: "Taux de remboursement",
    mad: "MAD",
    resultTitle: "Estimation",
    rembourse: "Remboursement estimé",
    resteACharge: "Reste à votre charge",
    ticket: "dont ticket modérateur",
    depassement: "dont dépassement (au-dessus du TNR)",
    note:
      "Estimation indicative, hors ALD et cas particuliers. Le remboursement porte sur le TNR, pas sur le prix payé. Vérifiez les taux exacts auprès de la CNSS ou de votre organisme.",
    disclaimerA11y: "Résultats du simulateur",
  },
  ar: {
    title: "محاكي استرداد AMO / CNSS",
    intro:
      "قدّر ما يمكن أن تسترجعه وما يبقى على عاتقك. النتيجة إرشادية: تعتمد التعريفة المرجعية (TNR) والنسبة على نوع العمل وعلى نظامك.",
    montant: "المبلغ المؤدى للطبيب",
    tnr: "التعريفة المرجعية (TNR)",
    tnrHint: "تحدّدها ANAM، وتختلف حسب العمل الطبي. تحقّق لدى صندوقك.",
    taux: "نسبة الاسترداد",
    mad: "درهم",
    resultTitle: "التقدير",
    rembourse: "الاسترداد المقدَّر",
    resteACharge: "الباقي على عاتقك",
    ticket: "منه الحصّة التعديلية",
    depassement: "منه التجاوز (فوق TNR)",
    note:
      "تقدير إرشادي، خارج الأمراض المزمنة والحالات الخاصة. يقع الاسترداد على TNR وليس على المبلغ المؤدى. تحقّق من النسب الدقيقة لدى CNSS أو هيئتك.",
    disclaimerA11y: "نتائج المحاكي",
  },
} satisfies Record<L, Record<string, string>>;

const fmt = (n: number, locale: L) =>
  Math.round(n).toLocaleString(locale === "ar" ? "ar-MA" : "fr-FR");

export function RemboursementSimulateur({ locale }: { locale: L }) {
  const t = COPY[locale];
  const [montant, setMontant] = useState(150);
  const [tnr, setTnr] = useState(150);
  const [taux, setTaux] = useState(80);

  const m = Math.max(0, montant || 0);
  const ref = Math.max(0, tnr || 0);
  const base = Math.min(ref, m);
  const rembourse = Math.min(m, (taux / 100) * base);
  const ticket = base - rembourse;
  const depassement = Math.max(0, m - ref);
  const reste = Math.max(0, m - rembourse);

  const field =
    "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-400";

  return (
    <section className="card p-5 sm:p-6 mb-10">
      <h2 className="text-xl font-bold text-slate-900 mb-1">{t.title}</h2>
      <p className="text-sm text-slate-500 leading-relaxed mb-5">{t.intro}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{t.montant}</span>
          <div className="relative mt-1.5">
            <input
              type="number" min={0} inputMode="numeric" value={montant}
              onChange={(e) => setMontant(Number(e.target.value))}
              className={field + " pe-12 tabular-nums"} aria-label={t.montant}
            />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{t.mad}</span>
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{t.tnr}</span>
          <div className="relative mt-1.5">
            <input
              type="number" min={0} inputMode="numeric" value={tnr}
              onChange={(e) => setTnr(Number(e.target.value))}
              className={field + " pe-12 tabular-nums"} aria-label={t.tnr}
            />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{t.mad}</span>
          </div>
          <span className="mt-1 block text-[11px] text-slate-400 leading-snug">{t.tnrHint}</span>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{t.taux}</span>
          <select
            value={taux} onChange={(e) => setTaux(Number(e.target.value))}
            className={field + " mt-1.5"} aria-label={t.taux}
          >
            {[70, 80, 90, 100].map((v) => (
              <option key={v} value={v}>{v} %</option>
            ))}
          </select>
        </label>
      </div>

      {/* Résultats */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2" role="status" aria-label={t.disclaimerA11y}>
        <div className="rounded-xl bg-secondary-50 border border-secondary-100 px-4 py-3">
          <p className="text-2xl font-bold text-secondary-700 tabular-nums leading-tight">
            {fmt(rembourse, locale)} <span className="text-sm font-semibold">{t.mad}</span>
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{t.rembourse}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-2xl font-bold text-slate-800 tabular-nums leading-tight">
            {fmt(reste, locale)} <span className="text-sm font-semibold">{t.mad}</span>
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{t.resteACharge}</p>
          <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
            {t.ticket} : {fmt(ticket, locale)} {t.mad}
            {depassement > 0 ? ` · ${t.depassement} : ${fmt(depassement, locale)} ${t.mad}` : ""}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">{t.note}</p>
    </section>
  );
}
