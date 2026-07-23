"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignReview, decideReview, publishApproved } from "@/features/review/actions";

/**
 * Panneau de décision du relecteur médical, adapté à l'état de l'article :
 * SUBMITTED → prendre en revue ; IN_REVIEW → approuver / corrections / refuser ;
 * APPROVED → publier.
 */
export function ReviewDecision({ postId, status }: { postId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ errors?: Record<string, string> } | undefined>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.errors) setError(Object.values(res.errors).join(" "));
      else router.refresh();
    });
  }

  return (
    <div className="card p-5 space-y-4 sticky top-5">
      <h3 className="font-bold text-slate-900">Décision de relecture</h3>
      {error && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">{error}</div>}

      {status === "SUBMITTED" && (
        <button type="button" disabled={pending} onClick={() => run(() => assignReview(postId))} className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-50">
          Prendre en revue
        </button>
      )}

      {status === "IN_REVIEW" && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="note">Note au relecteur <span className="text-slate-400 font-normal">(requise pour corrections / refus)</span></label>
            <textarea id="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div className="grid gap-2">
            <button type="button" disabled={pending} onClick={() => run(() => decideReview(postId, "APPROVE", note))} className="btn-primary px-4 py-2.5 text-sm disabled:opacity-50">
              Approuver
            </button>
            <button type="button" disabled={pending} onClick={() => run(() => decideReview(postId, "CHANGES", note))} className="px-4 py-2.5 text-sm rounded-lg border border-amber-300 text-amber-700 font-medium hover:bg-amber-50 disabled:opacity-50">
              Demander des corrections
            </button>
            <button type="button" disabled={pending} onClick={() => run(() => decideReview(postId, "REJECT", note))} className="px-4 py-2.5 text-sm rounded-lg border border-red-300 text-red-700 font-medium hover:bg-red-50 disabled:opacity-50">
              Refuser
            </button>
          </div>
        </>
      )}

      {status === "APPROVED" && (
        <div className="space-y-3">
          <button type="button" disabled={pending} onClick={() => run(() => publishApproved(postId))} className="btn-primary w-full px-4 py-2.5 text-sm disabled:opacity-50">
            Publier maintenant
          </button>
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="schedule">Ou planifier la publication</label>
            <input id="schedule" type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
            <button type="button" disabled={pending || !schedule} onClick={() => run(() => publishApproved(postId, schedule))} className="btn-outline w-full px-4 py-2 text-sm mt-2 disabled:opacity-50">
              Planifier
            </button>
          </div>
        </div>
      )}

      {["PUBLISHED", "REJECTED", "CHANGES_REQUESTED", "DRAFT"].includes(status) && (
        <p className="text-sm text-slate-500">Aucune action de relecture disponible dans cet état.</p>
      )}
    </div>
  );
}
