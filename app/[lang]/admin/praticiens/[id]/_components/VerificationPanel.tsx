"use client";

import { useTransition, useState } from "react";
import { approveVerification, rejectVerification, revokeVerification } from "@/features/admin/actions";

type Props = {
  doctorId:   string;
  isVerified: boolean;
  isActive:   boolean;
  hasPending: boolean;
};

export function VerificationPanel({ doctorId, isVerified, isActive, hasPending }: Props) {
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<"idle" | "approve" | "reject" | "revoke">("idle");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function reset() { setMode("idle"); setNote(""); setError(""); }

  async function handleApprove() {
    setError("");
    start(async () => {
      try { await approveVerification(doctorId, note || undefined); reset(); }
      catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur"); }
    });
  }

  async function handleReject() {
    if (!note.trim()) { setError("Le motif est obligatoire."); return; }
    setError("");
    start(async () => {
      try { await rejectVerification(doctorId, note); reset(); }
      catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur"); }
    });
  }

  async function handleRevoke() {
    setError("");
    start(async () => {
      try { await revokeVerification(doctorId, note); reset(); }
      catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur"); }
    });
  }

  /* Guard: can only verify an active doctor */
  const canVerify = isActive;

  return (
    <div className="flex flex-col gap-4">
      {/* Current verification status */}
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
        isVerified
          ? "bg-secondary-50 border-secondary-200"
          : hasPending
          ? "bg-amber-50 border-amber-200"
          : "bg-slate-50 border-slate-200"
      }`}>
        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isVerified ? "bg-secondary-500" : hasPending ? "bg-amber-400" : "bg-slate-300"
        }`}>
          <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5"
            className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            {isVerified
              ? <><circle cx="8" cy="8" r="7"/><path d="M4.5 8l2.5 2.5L11.5 5"/></>
              : hasPending
              ? <><circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11h.01"/></>
              : <><circle cx="8" cy="8" r="7"/><path d="M5 8h6"/></>
            }
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-900">
            {isVerified
              ? "Badge « Médecin vérifié » actif"
              : hasPending
              ? "Demande en attente d'examen"
              : "Aucune demande de vérification"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isVerified
              ? "Le badge est affiché sur la fiche publique du médecin"
              : hasPending
              ? "Des documents ont été soumis pour vérification"
              : "Le médecin n'a pas encore soumis de dossier"}
          </p>
        </div>
      </div>

      {/* Blocker when doctor is not active */}
      {!isActive && !isVerified && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4 shrink-0 text-slate-500" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="7"/><path d="M8 5v4M8 11h.01"/>
          </svg>
          Activez d&apos;abord le profil avant d&apos;accorder le badge de vérification.
        </div>
      )}

      {/* Action buttons */}
      {mode === "idle" && (
        <div className="flex flex-wrap gap-2">
          {hasPending && !isVerified && canVerify && (
            <button onClick={() => setMode("approve")}
              className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8l4 4 7-7"/>
              </svg>
              Approuver
            </button>
          )}
          {hasPending && !isVerified && canVerify && (
            <button onClick={() => setMode("reject")}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l10 10M13 3L3 13"/>
              </svg>
              Refuser
            </button>
          )}
          {!hasPending && !isVerified && canVerify && (
            <button onClick={() => setMode("approve")}
              className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8l4 4 7-7"/>
              </svg>
              Vérifier manuellement
            </button>
          )}
          {isVerified && (
            <button onClick={() => setMode("revoke")}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
              Révoquer le badge
            </button>
          )}
        </div>
      )}

      {/* Approve form */}
      {mode === "approve" && (
        <div className="border border-secondary-200 bg-secondary-50 rounded-xl p-4 flex flex-col gap-3">
          <p className="font-semibold text-sm text-secondary-800">Approuver le badge « Médecin vérifié »</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Note pour le praticien (facultatif)…"
            rows={3} className="input-field resize-none text-sm" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleApprove} disabled={pending} className="btn-primary text-sm py-2 px-5">
              {pending ? "En cours…" : "Confirmer l'approbation"}
            </button>
            <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2">Annuler</button>
          </div>
        </div>
      )}

      {/* Reject form */}
      {mode === "reject" && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex flex-col gap-3">
          <p className="font-semibold text-sm text-red-800">Refuser la demande de vérification</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Motif du refus (obligatoire) — ex : Diplôme illisible, document manquant…"
            rows={3} className="input-field resize-none text-sm" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleReject} disabled={pending}
              className="inline-flex items-center text-sm font-semibold px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">
              {pending ? "En cours…" : "Confirmer le refus"}
            </button>
            <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2">Annuler</button>
          </div>
        </div>
      )}

      {/* Revoke form */}
      {mode === "revoke" && (
        <div className="border border-slate-200 bg-white rounded-xl p-4 flex flex-col gap-3">
          <p className="font-semibold text-sm text-slate-800">Révoquer le badge de vérification</p>
          <p className="text-xs text-slate-500">Le profil restera visible dans l&apos;annuaire mais sans le badge vérifié.</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Raison de la révocation (facultatif)…"
            rows={2} className="input-field resize-none text-sm" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleRevoke} disabled={pending}
              className="inline-flex items-center text-sm font-semibold px-5 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors">
              {pending ? "En cours…" : "Révoquer le badge"}
            </button>
            <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
