"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleUpvote, toggleThank } from "@/features/qa/vote-actions";
import { acceptAnswer } from "@/features/qa/answer-actions";
import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

function useLoginRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  return () => router.push(`/connexion?callbackUrl=${encodeURIComponent(pathname)}`);
}

// ── Barre vote « utile » + remercier (optimistic) ─────────────────────────────
export function VoteThankBar({
  answerId, upvotes, thanks, voted, thanked, isAuthed, t,
}: {
  answerId: string;
  upvotes: number;
  thanks: number;
  voted: boolean;
  thanked: boolean;
  isAuthed: boolean;
  t: QaT;
}) {
  const [uState, setUState] = useState({ count: upvotes, active: voted });
  const [tState, setTState] = useState({ count: thanks, active: thanked });
  const [, start] = useTransition();
  const goLogin = useLoginRedirect();

  function onUpvote() {
    if (!isAuthed) return goLogin();
    const optimistic = { count: uState.count + (uState.active ? -1 : 1), active: !uState.active };
    setUState(optimistic);
    start(async () => {
      const res = await toggleUpvote(answerId);
      if (res.ok) setUState({ count: res.count, active: res.active });
      else setUState({ count: upvotes, active: voted });
    });
  }

  function onThank() {
    if (!isAuthed) return goLogin();
    const optimistic = { count: tState.count + (tState.active ? -1 : 1), active: !tState.active };
    setTState(optimistic);
    start(async () => {
      const res = await toggleThank(answerId);
      if (res.ok) setTState({ count: res.count, active: res.active });
      else setTState({ count: thanks, active: thanked });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onUpvote}
        aria-pressed={uState.active}
        aria-label={t.upvoteAria}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-colors ${
          uState.active
            ? "bg-primary-600 text-white border-primary-600"
            : "bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700"
        }`}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8h2.5l1-4.5c.8 0 1.5.7 1.5 1.5V7H12a1 1 0 0 1 1 1.2l-.8 3.5A1.5 1.5 0 0 1 10.7 13H4z" />
          <path d="M4 8v5H2.5A.5.5 0 0 1 2 12.5v-4a.5.5 0 0 1 .5-.5z" />
        </svg>
        {t.helpful}
        {uState.count > 0 && <span className="tabular-nums">· {uState.count}</span>}
      </button>

      <button
        type="button"
        onClick={onThank}
        aria-pressed={tState.active}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-colors ${
          tState.active
            ? "bg-rose-50 text-rose-600 border-rose-200"
            : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
        }`}
      >
        <svg viewBox="0 0 16 16" fill={tState.active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 13.5C4.5 11 2 8.7 2 6.2 2 4.4 3.4 3 5.2 3c1 0 2 .5 2.8 1.5C8.8 3.5 9.8 3 10.8 3 12.6 3 14 4.4 14 6.2c0 2.5-2.5 4.8-6 7.3z" />
        </svg>
        {tState.active ? t.thanked : t.thank}
        {tState.count > 0 && <span className="tabular-nums">· {tState.count}</span>}
      </button>
    </div>
  );
}

// ── Bouton « retenir cette réponse » (auteur de la question / admin) ──────────
export function AcceptButton({
  answerId, accepted, t,
}: {
  answerId: string;
  accepted: boolean;
  t: QaT;
}) {
  const [isAccepted, setIsAccepted] = useState(accepted);
  const [pending, start] = useTransition();

  function onClick() {
    const next = !isAccepted;
    setIsAccepted(next);
    start(async () => {
      const res = await acceptAnswer(answerId);
      if (!res.ok) setIsAccepted(accepted);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={isAccepted}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-colors ${
        isAccepted
          ? "bg-secondary-600 text-white border-secondary-600"
          : "bg-white text-secondary-700 border-secondary-200 hover:bg-secondary-50"
      }`}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3.5 8.5 3 3 6-7" />
      </svg>
      {t.acceptAnswer}
    </button>
  );
}
