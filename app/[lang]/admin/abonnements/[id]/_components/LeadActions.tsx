"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "@/features/subscription/actions";

const STATUSES = [
  { value: "NEW",       label: "Nouveau",  active: "bg-amber-500 border-amber-500 text-white" },
  { value: "CONTACTED", label: "Contacté", active: "bg-primary-600 border-primary-600 text-white" },
  { value: "CONVERTED", label: "Converti", active: "bg-secondary-600 border-secondary-600 text-white" },
  { value: "CLOSED",    label: "Fermé",    active: "bg-slate-600 border-slate-600 text-white" },
];

export function LeadActions({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(next: string) {
    if (next === status || pending) return;
    startTransition(async () => {
      const r = await updateLeadStatus(leadId, next);
      if (r.error) setError(r.error);
      else { setStatus(next); setError(null); }
    });
  }

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Statut du lead</h2>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const on = s.value === status;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => change(s.value)}
              disabled={pending}
              aria-pressed={on}
              className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all disabled:opacity-60 ${
                on ? s.active : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      <p className="mt-3 text-xs text-slate-500">
        Pipeline : Nouveau → Contacté → Converti (abonné) / Fermé (sans suite).
      </p>
    </div>
  );
}
