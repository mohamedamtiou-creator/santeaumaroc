"use client";

import { useActionState, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { postComment } from "@/features/qa/comment-actions";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

type QaT = Dictionary["qa"];

export function CommentForm({
  answerId, isAuthed, t,
}: {
  answerId: string;
  isAuthed: boolean;
  t: QaT;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(postComment, undefined);
  const [value, setValue] = useState("");
  const uid = useId();
  const pathname = usePathname();

  // Vide le champ pendant le rendu quand le commentaire est accepté
  // (pattern React recommandé plutôt qu'un setState dans useEffect).
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.message === "ok") setValue("");
  }

  if (!isAuthed) {
    return (
      <Link
        href={`/connexion?callbackUrl=${encodeURIComponent(pathname)}`}
        className="text-sm text-primary-700 font-medium hover:underline underline-offset-2"
      >
        {t.addComment}
      </Link>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 mt-2">
      <input type="hidden" name="answerId" value={answerId} />
      <label htmlFor={`c-${uid}`} className="sr-only">{t.addComment}</label>
      <textarea
        id={`c-${uid}`}
        name="body"
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={1000}
        placeholder={t.commentPlaceholder}
        className="input-field text-sm"
        aria-invalid={state?.errors?.body ? true : undefined}
      />
      {state?.errors?.body && <p className="text-xs text-red-600">{state.errors.body[0]}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={pending || value.trim().length < 3} className="btn-outline text-sm py-1.5 px-4">
          {t.commentSubmit}
        </button>
      </div>
    </form>
  );
}
