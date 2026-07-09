"use client";

import { useActionState, useId, useState } from "react";
import dynamic from "next/dynamic";
import { postAnswer } from "@/features/qa/answer-actions";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

// Éditeur riche chargé côté client uniquement (Tiptap nécessite le DOM).
const TiptapEditor = dynamic(
  () => import("@/components/blog/TiptapEditor").then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="border border-slate-200 rounded-xl animate-pulse bg-slate-50 h-48" /> },
);

function plainLength(html: string): number {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim().length;
}

/**
 * Composer de réponse — réservé aux médecins vérifiés (gating serveur en plus).
 * Éditeur riche Tiptap ; le HTML est assaini côté serveur (sanitizeRichText).
 */
export function AnswerComposer({ questionId, t }: { questionId: string; t: QaT }) {
  const [state, action, pending] = useActionState<FormState, FormData>(postAnswer, undefined);
  const [html, setHtml] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const uid = useId();
  const ok = state?.message === "ok";

  // Réinitialise pendant le rendu quand une nouvelle réponse est acceptée
  // (pattern React recommandé plutôt qu'un setState dans useEffect).
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.message === "ok") {
      setHtml("");
      setResetKey((k) => k + 1); // remonte l'éditeur pour le vider
    }
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby={`compose-${uid}`}>
      <h2 id={`compose-${uid}`} className="font-bold text-slate-900 text-base mb-1">{t.yourAnswer}</h2>
      <p className="text-xs text-slate-500 mb-3">{t.answerGuidelines}</p>

      {ok && (
        <p role="status" className="mb-3 text-sm text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-xl px-3.5 py-2.5">
          ✓ {t.answerSubmit}
        </p>
      )}

      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="questionId" value={questionId} />
        <input type="hidden" name="body" value={html} />
        <TiptapEditor key={resetKey} content="" onChange={setHtml} />
        {state?.errors?.body && <p role="alert" className="text-xs text-red-600">{state.errors.body[0]}</p>}
        {state?.message && state.message !== "ok" && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">{state.message}</p>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={pending || plainLength(html) < 30} className="btn-primary justify-center text-sm py-2.5 px-6">
            {pending ? "…" : t.answerSubmit}
          </button>
        </div>
      </form>
    </section>
  );
}
