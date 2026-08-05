"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleUpvote, toggleThank } from "@/features/qa/vote-actions";
import { acceptAnswer } from "@/features/qa/answer-actions";
import { useQuestionUser } from "@/components/qa/QuestionUserContext";
import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

function useLoginRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  return () => router.push(`/connexion?callbackUrl=${encodeURIComponent(pathname)}`);
}

// ── Barre vote « utile » + remercier (optimistic) ─────────────────────────────
export function VoteThankBar({
  answerId, upvotes, thanks, t,
}: {
  answerId: string;
  upvotes: number;
  thanks: number;
  t: QaT;
}) {
  // « Déjà voté / remercié » et l'état de connexion viennent du CONTEXTE, plus de
  // props : les calculer au rendu serveur imposait une lecture de session, donc
  // une page dynamique jamais mise en cache. Les compteurs restent des props —
  // données publiques, servies dans le HTML et donc indexables.
  const { loggedIn, voted, thanked } = useQuestionUser();

  // `null` = aucune interaction locale → l'affichage suit props + contexte, et se
  // met donc à jour tout seul quand le contexte se résout après hydratation. Dès
  // le premier clic, l'état optimiste prend la main ; un échec le remet à `null`,
  // ce qui rétablit la vérité sans avoir à la recopier.
  type Toggle = { count: number; active: boolean } | null;
  const [uLocal, setULocal] = useState<Toggle>(null);
  const [tLocal, setTLocal] = useState<Toggle>(null);
  const [, start] = useTransition();
  const goLogin = useLoginRedirect();

  const uState = uLocal ?? { count: upvotes, active: voted.has(answerId) };
  const tState = tLocal ?? { count: thanks, active: thanked.has(answerId) };

  function onUpvote() {
    if (!loggedIn) return goLogin();
    setULocal({ count: uState.count + (uState.active ? -1 : 1), active: !uState.active });
    start(async () => {
      const res = await toggleUpvote(answerId);
      setULocal(res.ok ? { count: res.count, active: res.active } : null);
    });
  }

  function onThank() {
    if (!loggedIn) return goLogin();
    setTLocal({ count: tState.count + (tState.active ? -1 : 1), active: !tState.active });
    start(async () => {
      const res = await toggleThank(answerId);
      setTLocal(res.ok ? { count: res.count, active: res.active } : null);
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
  // Le droit d'accepter (auteur de la question ou admin) vient du contexte : la
  // page ne peut plus le calculer au rendu sans redevenir dynamique. Le composant
  // se masque donc lui-même, au lieu d'être monté conditionnellement côté serveur.
  const { canAccept } = useQuestionUser();
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

  if (!canAccept) return null;

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
