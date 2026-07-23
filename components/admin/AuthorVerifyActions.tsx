"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveAuthor, rejectAuthor } from "@/features/contributor/admin-actions";

export function AuthorVerifyActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    startTransition(async () => {
      try {
        await approveAuthor(userId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur.");
      }
    });
  }

  function reject() {
    setError(null);
    if (!note.trim()) { setError("Motif requis."); return; }
    startTransition(async () => {
      try {
        await rejectAuthor(userId, note);
        setRejecting(false);
        setNote("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur.");
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-700">{error}</p>}
      {!rejecting ? (
        <div className="flex gap-2">
          <button type="button" disabled={pending} onClick={approve} className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50">Valider</button>
          <button type="button" disabled={pending} onClick={() => setRejecting(true)} className="px-3 py-1.5 text-xs rounded-lg border border-red-300 text-red-700 font-medium hover:bg-red-50 disabled:opacity-50">Refuser</button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Motif du refus…" className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-primary-500 outline-none" />
          <div className="flex gap-2">
            <button type="button" disabled={pending} onClick={reject} className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50">Confirmer le refus</button>
            <button type="button" onClick={() => setRejecting(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
