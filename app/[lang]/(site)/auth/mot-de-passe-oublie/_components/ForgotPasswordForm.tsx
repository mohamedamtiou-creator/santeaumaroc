"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/features/auth/actions";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

type FormT = Dictionary["auth"]["forgotPassword"]["form"];

export function ForgotPasswordForm({ t}: { t: FormT }) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    forgotPassword,
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="fp-email" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.email}
        </label>
        <input
          id="fp-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          className="input-field h-11"
          placeholder={t.emailPlaceholder}
        />
        {state?.errors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full justify-center py-3"
      >
        {isPending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
