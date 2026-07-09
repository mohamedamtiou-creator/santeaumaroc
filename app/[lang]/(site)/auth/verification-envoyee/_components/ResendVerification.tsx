"use client";

import { useActionState, useState } from "react";
import { resendVerification } from "@/features/auth/actions";
import type { Dictionary } from "@/lib/i18n";

type ResendT = Dictionary["auth"]["resend"];

export function ResendVerification({
  email,
  t,
}: {
  email?: string;
  t: ResendT;
}) {
  const [state, action, pending] = useActionState(resendVerification, undefined);
  // Si on connaît déjà l'e-mail (post-inscription), renvoi en un clic ;
  // sinon on révèle un champ pour le saisir.
  const [showInput, setShowInput] = useState(!email);

  if (state?.message) {
    return (
      <div className="mt-6 p-3 rounded-xl bg-secondary-50 border border-secondary-100 text-secondary-700 text-xs leading-relaxed flex items-start gap-2 text-start">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="6.5" />
          <path d="M5 8l2 2 4-4.5" />
        </svg>
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="mt-6">
      {showInput ? (
        <div className="space-y-2">
          <input
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            defaultValue={email ?? ""}
            placeholder={t.emailPlaceholder}
            required
            className={`input-field h-10 text-sm ${state?.errors?.email ? "border-red-300 focus:ring-red-400" : ""}`}
          />
          <button
            type="submit"
            disabled={pending}
            className="btn-outline w-full py-2.5 text-sm"
          >
            {pending ? t.sending : t.resendFull}
          </button>
        </div>
      ) : (
        <>
          <input type="hidden" name="email" value={email} />
          <p className="text-xs text-slate-500">
            {t.notReceived}{" "}
            <button
              type="submit"
              disabled={pending}
              className="text-secondary-600 hover:text-secondary-700 font-semibold hover:underline disabled:opacity-50"
            >
              {pending ? t.sending : t.resend}
            </button>{" "}
            ·{" "}
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="text-slate-500 hover:text-slate-700 underline"
            >
              {t.otherAddress}
            </button>
          </p>
        </>
      )}
      {state?.errors?.email && (
        <p className="mt-1.5 text-xs text-red-600 text-start" role="alert">
          {state.errors.email[0]}
        </p>
      )}
    </form>
  );
}
