"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointment } from "@/features/appointments/actions";
import type { Dictionary } from "@/lib/i18n";

type CancelT = Dictionary["dashboard"]["patient"];

export function CancelButton({
  appointmentId,
  t,
}: {
  appointmentId: string;
  t: CancelT;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await cancelAppointment(appointmentId);
      if (result?.message === "ok") {
        router.refresh();
      } else {
        setError(result?.message ?? t.cancelError);
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-1.5">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center gap-2">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white
              hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "…" : t.cancelConfirm}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="text-xs text-slate-500 hover:text-slate-600 transition-colors"
          >
            {t.cancelBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500
        hover:text-red-600 transition-colors"
    >
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
        className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round">
        <circle cx="7" cy="7" r="6"/><path d="M5 5l4 4M9 5l-4 4"/>
      </svg>
      {t.cancelTrigger}
    </button>
  );
}
