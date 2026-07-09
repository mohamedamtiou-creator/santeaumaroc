"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmAppointment,
  completeAppointment,
  cancelAppointmentByPraticien,
} from "@/features/appointments/actions";
import type { Dictionary } from "@/lib/i18n";

/* ── Icons ─────────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"
      className="w-3.5 h-3.5 shrink-0" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 8.5l3.5 3.5 7-7" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9"
      className="w-3.5 h-3.5 shrink-0" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14V2.5l10 3.5-10 3.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"
      className="w-3.5 h-3.5 shrink-0" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" fill="none"
      className="w-3.5 h-3.5 shrink-0 animate-spin" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-3.5 h-3.5 shrink-0" aria-hidden="true"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 13.5h13L8 2 1.5 13.5z" />
      <path d="M8 6.5v3M8 11.5h.01" />
    </svg>
  );
}

/* ── Types ──────────────────────────────────────────────────── */

type Props      = { appointmentId: string; status: string; t: Dictionary["dashboard"]["praticien"] };
type ActionKey  = "confirm" | "complete" | "cancel";

/* ── Component ──────────────────────────────────────────────── */

export function AppointmentActions({ appointmentId, status, t}: Props) {
  const [error,      setError]      = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [active,     setActive]     = useState<ActionKey | null>(null);
  const [isPending,  startTransition] = useTransition();
  const router = useRouter();

  function run(
    action: (id: string) => Promise<{ message?: string } | undefined>,
    key: ActionKey,
  ) {
    setError(null);
    setConfirming(false);
    setActive(key);
    startTransition(async () => {
      const result = await action(appointmentId);
      setActive(null);
      if (result?.message && result.message !== "ok") setError(result.message);
      else router.refresh();
    });
  }

  const canConfirm  = status === "PENDING";
  const canComplete = status === "PENDING" || status === "CONFIRMED";
  const canCancel   = status === "PENDING" || status === "CONFIRMED";

  if (!canConfirm && !canComplete && !canCancel) return null;

  return (
    <div className="w-full flex flex-col gap-2">

      {/* ── Erreur ─────────────────────────────────────────── */}
      {error && (
        <div role="alert"
          className="flex items-start gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      {/* ── Confirmation annulation ─────────────────────── */}
      {confirming ? (
        <div
          role="alertdialog"
          aria-modal="false"
          aria-label={t.cancelTitle}
          className="rounded-xl border border-red-200 bg-red-50 p-3 flex flex-col gap-2.5"
        >
          {/* Titre */}
          <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
            <AlertIcon />
            {t.cancelTitle}
          </p>

          {/* Message d'avertissement */}
          <p className="text-xs text-red-600/80 leading-relaxed">
            {t.cancelWarning}
          </p>

          {/* Boutons de confirmation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => run(cancelAppointmentByPraticien, "cancel")}
              disabled={isPending}
              aria-label={t.confirmCancel}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {active === "cancel" && isPending ? <Spinner /> : <XIcon />}
              {active === "cancel" && isPending ? t.cancelling : t.confirmCancel}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={isPending}
              aria-label={t.keep}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {t.keep}
            </button>
          </div>
        </div>

      ) : (
        /* ── Barre d'actions — ordre visuel : destructif à gauche, positif à droite ── */
        <div className="flex items-center gap-2 justify-end flex-wrap">

          {/* Annuler — action destructive, visuellement secondaire */}
          {canCancel && (
            <button
              onClick={() => setConfirming(true)}
              disabled={isPending}
              aria-label={t.cancel}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              <XIcon />
              {t.cancel}
            </button>
          )}

          {/* Terminé — action administrative, bleu médical */}
          {canComplete && (
            <button
              onClick={() => run(completeAppointment, "complete")}
              disabled={isPending}
              aria-label={t.complete}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]"
            >
              {active === "complete" && isPending ? <Spinner /> : <FlagIcon />}
              {active === "complete" && isPending ? t.completing : t.complete}
            </button>
          )}

          {/* Confirmer — action positive prioritaire, vert santé */}
          {canConfirm && (
            <button
              onClick={() => run(confirmAppointment, "confirm")}
              disabled={isPending}
              aria-label={t.confirm}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-1 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]"
            >
              {active === "confirm" && isPending ? <Spinner /> : <CheckIcon />}
              {active === "confirm" && isPending ? t.confirming : t.confirm}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
