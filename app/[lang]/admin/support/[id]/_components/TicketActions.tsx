"use client";

import { useState, useTransition } from "react";
import { replyToTicket, updateTicketStatus } from "@/features/support/actions";

const STATUS_BUTTONS = [
  { status: "open",        label: "Ouverte",     cls: "border-amber-300 text-amber-700 hover:bg-amber-50"         },
  { status: "in_progress", label: "En cours",    cls: "border-primary-300 text-primary-700 hover:bg-primary-50"   },
  { status: "resolved",    label: "Résolue",     cls: "border-secondary-300 text-secondary-700 hover:bg-secondary-50" },
  { status: "closed",      label: "Fermée",      cls: "border-slate-300 text-slate-600 hover:bg-slate-50"          },
] as const;

export function TicketActions({
  ticketId,
  currentStatus,
  existingReply,
}: {
  ticketId: string;
  currentStatus: string;
  existingReply?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [reply, setReply]           = useState(existingReply ?? "");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState(false);

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setReplyError(null);
    setReplySuccess(false);
    startTransition(async () => {
      const r = await replyToTicket(ticketId, reply);
      if (r.error) setReplyError(r.error);
      else setReplySuccess(true);
    });
  }

  function handleStatus(status: string) {
    startTransition(async () => {
      await updateTicketStatus(ticketId, status);
    });
  }

  return (
    <div className="space-y-5">

      {/* Statut */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">Changer le statut</p>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_BUTTONS.map((btn) => (
            <button
              key={btn.status}
              type="button"
              disabled={isPending || currentStatus === btn.status}
              onClick={() => handleStatus(btn.status)}
              className={`text-xs font-semibold py-2 px-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                currentStatus === btn.status
                  ? "border-current opacity-50 cursor-default"
                  : btn.cls
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Répondre */}
      <form onSubmit={handleReply} className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Réponse admin</p>

        {replySuccess && (
          <div className="rounded-lg bg-secondary-50 border border-secondary-200 px-3 py-2 text-xs text-secondary-700">
            Réponse envoyée et e-mail expédié.
          </div>
        )}
        {replyError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
            {replyError}
          </div>
        )}

        <textarea
          value={reply}
          onChange={(e) => { setReply(e.target.value); setReplySuccess(false); }}
          rows={5}
          placeholder="Rédigez votre réponse…"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition resize-none"
        />

        <button
          type="submit"
          disabled={isPending || !reply.trim()}
          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-3.5 h-3.5 animate-spin" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
              </svg>
              Envoi…
            </>
          ) : (
            "Envoyer la réponse"
          )}
        </button>
      </form>
    </div>
  );
}
