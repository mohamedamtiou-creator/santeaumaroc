"use client";

import { useTransition } from "react";
import { setCallbackStatus } from "@/features/praticien/callback-actions";

type Props = {
  id: string;
  status: "PENDING" | "CONTACTED";
  labels: { markDone: string; reopen: string };
};

export function CallbackActions({ id, status, labels }: Props) {
  const [isPending, startTransition] = useTransition();
  const next = status === "PENDING" ? "CONTACTED" : "PENDING";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => setCallbackStatus(id, next))}
      className={
        status === "PENDING"
          ? "inline-flex items-center gap-1.5 rounded-lg bg-secondary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-secondary-700 transition-colors disabled:opacity-60"
          : "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60"
      }
    >
      {status === "PENDING" ? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5l3.5 3.5L13 4.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 8a6 6 0 1 1 1.8 4.3M2 12.5V9h3.5" />
        </svg>
      )}
      {status === "PENDING" ? labels.markDone : labels.reopen}
    </button>
  );
}
