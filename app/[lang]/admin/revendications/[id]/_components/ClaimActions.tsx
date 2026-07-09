"use client";

import { useTransition, useState } from "react";
import { approveClaim, rejectClaim } from "@/features/claims/actions";

type Props = {
  claimId: string;
};

export function ClaimActions({ claimId }: Props) {
  const [pending, start] = useTransition();
  const [mode, setMode]   = useState<"idle" | "approve" | "reject">("idle");
  const [note, setNote]   = useState("");
  const [error, setError] = useState("");

  function reset() { setMode("idle"); setNote(""); setError(""); }

  async function handleApprove() {
    setError("");
    start(async () => {
      try {
        await approveClaim(claimId);
        reset();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur inattendue.");
      }
    });
  }

  async function handleReject() {
    if (!note.trim()) { setError("Le motif de refus est obligatoire."); return; }
    setError("");
    start(async () => {
      try {
        await rejectClaim(claimId, note);
        reset();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur inattendue.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Boutons */}
      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode("approve")}
            className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 8l4 4 7-7"/>
            </svg>
            Approuver la revendication
          </button>
          <button
            onClick={() => setMode("reject")}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
            Refuser
          </button>
        </div>
      )}

      {/* Formulaire approbation */}
      {mode === "approve" && (
        <div className="border border-secondary-200 bg-secondary-50 rounded-xl p-4 flex flex-col gap-3">
          <p className="font-semibold text-sm text-secondary-800">
            Approuver cette revendication
          </p>
          <p className="text-xs text-secondary-700 leading-relaxed">
            En approuvant, la fiche médecin sera liée au compte de ce demandeur.
            Il pourra alors gérer son profil directement.
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleApprove} disabled={pending}
              className="btn-primary text-sm py-2 px-5 disabled:opacity-60">
              {pending ? "En cours…" : "Confirmer l'approbation"}
            </button>
            <button onClick={reset}
              className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Formulaire refus */}
      {mode === "reject" && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex flex-col gap-3">
          <p className="font-semibold text-sm text-red-800">Refuser la revendication</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motif du refus (obligatoire) — ex : N° d'Ordre invalide, identité non vérifiable…"
            rows={3}
            className="input-field resize-none text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleReject} disabled={pending}
              className="inline-flex items-center text-sm font-semibold px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60">
              {pending ? "En cours…" : "Confirmer le refus"}
            </button>
            <button onClick={reset}
              className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
