"use client";

import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { useDoctorUser } from "./DoctorUserContext";

/* Le tunnel « preuve d'abord » gère désormais tous les cas (invité, patient,
 * praticien) sur /revendiquer : un seul lien, plus de détour par /connexion.
 * Rôle + statut de revendication lus côté client (contexte) : la fiche reste
 * statique/ISR. Par défaut (anonyme) → bouton « Revendiquer ». */
export function ClaimButton({ doctorSlug }: { doctorSlug: string }) {
  const { role: userRole, claim } = useDoctorUser();
  const claimStatus = claim?.status ?? null;
  const adminNote = claim?.adminNote ?? null;
  const claimUrl = `/praticiens/${doctorSlug}/revendiquer`;

  /* Médecin connecté : fiche déjà à lui */
  if (userRole === "DOCTOR" && claimStatus === "APPROVED") return null;

  /* Demande en cours d'examen */
  if (userRole === "DOCTOR" && claimStatus === "PENDING") {
    return (
      <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
          className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="7" /><path d="M8 5v4M8 11h.01" />
        </svg>
        <span className="font-medium leading-snug">Votre demande de revendication est en cours d&apos;examen.</span>
      </div>
    );
  }

  const rejected = claimStatus === "REJECTED";

  return (
    <div className="flex flex-col gap-2">
      {rejected && adminNote && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 leading-relaxed">
          <p className="font-semibold mb-0.5">Demande précédente refusée :</p>
          <p>{adminNote}</p>
        </div>
      )}
      <Link
        href={claimUrl}
        className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2.5 rounded-xl transition-colors w-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
          className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v12M3 2l9 3-9 4" />
        </svg>
        {rejected ? "Soumettre une nouvelle demande" : "Revendiquer cette fiche"}
      </Link>
      <p className="text-xs text-slate-500 text-center leading-snug">
        Identité confirmée, deux justificatifs — c&apos;est tout.
      </p>
    </div>
  );
}
