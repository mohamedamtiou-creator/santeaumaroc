"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  verifySubscriptionOrder,
  rejectSubscriptionOrder,
} from "@/features/subscription/order-actions";

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  function validate() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const r = await verifySubscriptionOrder(orderId);
      if (r.error) setError(r.error);
      else router.refresh();
    });
  }

  function reject() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const r = await rejectSubscriptionOrder(orderId, reason);
      if (r.error) setError(r.error);
      else {
        setRejecting(false);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
        Vérification du virement
      </h2>

      {!rejecting ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={validate}
            disabled={pending}
            className="btn-secondary py-2 text-sm disabled:opacity-60"
          >
            {pending ? "…" : "Valider et activer"}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            disabled={pending}
            className="btn-outline py-2 text-sm border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Rejeter
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Motif du refus (visible par le médecin)…"
            className="input-field text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reject}
              disabled={pending || reason.trim().length < 3}
              className="btn-outline py-2 text-sm border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {pending ? "…" : "Confirmer le refus"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRejecting(false);
                setReason("");
              }}
              disabled={pending}
              className="text-sm text-slate-500 px-3"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-slate-500">
        Valider active le plan Pro du médecin (et la mise en avant Premium si incluse) et envoie un e-mail de confirmation.
      </p>
    </div>
  );
}
