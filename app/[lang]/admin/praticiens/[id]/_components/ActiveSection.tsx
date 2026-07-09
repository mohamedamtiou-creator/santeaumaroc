"use client";

import { useTransition } from "react";
import { toggleDoctorActive } from "@/features/admin/actions";

type Props = {
  doctorId:   string;
  isActive:   boolean;
  isVerified: boolean;
};

export function ActiveSection({ doctorId, isActive, isVerified }: Props) {
  const [pending, start] = useTransition();

  function handleToggle() {
    start(async () => { await toggleDoctorActive(doctorId, isActive); });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status */}
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
        isActive ? "bg-primary-50 border-primary-200" : "bg-slate-50 border-slate-200"
      }`}>
        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isActive ? "bg-primary-500" : "bg-slate-300"
        }`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5"
            className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            {isActive
              ? <><path d="M2 8c0 3.31 2.69 6 6 6s6-2.69 6-6-2.69-6-6-6"/><path d="M1 4l3 3 3-3"/></>
              : <><path d="M3 5h10M3 8h6M3 11h4"/><path d="M13 13V9"/></>
            }
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900">
            {isActive ? "Profil visible dans l'annuaire" : "Profil non visible (inactif)"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {isActive
              ? isVerified
                ? "Visible avec le badge « Médecin vérifié »"
                : "Visible sans badge de vérification"
              : "La fiche n'apparaît pas dans les résultats de recherche"}
          </p>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={handleToggle}
        disabled={pending}
        className={`inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors ${
          isActive
            ? "border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            : "border-primary-300 bg-primary-600 text-white hover:bg-primary-700"
        }`}
      >
        {pending ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            En cours…
          </>
        ) : isActive ? (
          <>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
            Désactiver le profil
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M8 3l5 5-5 5"/>
            </svg>
            Activer le profil
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 leading-relaxed">
        L&apos;activation est indépendante du badge de vérification.
        Un médecin actif sans badge reste visible dans l&apos;annuaire.
      </p>
    </div>
  );
}
