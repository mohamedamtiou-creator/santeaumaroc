"use client";

import { useState, useTransition } from "react";
import { setDoctorPlan } from "@/features/admin/actions";

const PLANS = [
  { value: "FREE",    label: "Gratuit",          active: "bg-slate-600 border-slate-600 text-white"     },
  { value: "PRO",     label: "Pro",              active: "bg-secondary-600 border-secondary-600 text-white" },
  { value: "CABINET", label: "Cabinet / Clinique", active: "bg-primary-600 border-primary-600 text-white"  },
];

export function PlanSection({ doctorId, plan }: { doctorId: string; plan: string }) {
  const [current, setCurrent] = useState(plan);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPro = current === "PRO" || current === "CABINET";

  function change(next: string) {
    if (next === current || pending) return;
    startTransition(async () => {
      try {
        await setDoctorPlan(doctorId, next);
        setCurrent(next);
        setError(null);
      } catch {
        setError("Échec de la mise à jour du plan.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
        isPro ? "bg-secondary-50 border-secondary-200" : "bg-slate-50 border-slate-200"
      }`}>
        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isPro ? "bg-secondary-500" : "bg-slate-300"}`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4.5l6-2.5 6 2.5v3.5c0 3-2.5 5.5-6 6.5-3.5-1-6-3.5-6-6.5z" /><path d="M5.5 8l1.7 1.7L11 6" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900">
            {isPro ? "Fonctions Pro activées" : "Offre gratuite"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {isPro
              ? "Prise de rendez-vous en ligne, agenda et rappels disponibles sur la fiche."
              : "Fiche visible, mais sans prise de rendez-vous en ligne (parcours « appeler le cabinet »)."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLANS.map((p) => {
          const on = p.value === current;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => change(p.value)}
              disabled={pending}
              aria-pressed={on}
              className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all disabled:opacity-60 ${
                on ? p.active : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <p className="text-xs text-slate-500 leading-relaxed">
        À activer après conversion d&apos;un lead d&apos;abonnement. Le passage en Pro débloque immédiatement
        la prise de rendez-vous en ligne sur la fiche publique.
      </p>
    </div>
  );
}
