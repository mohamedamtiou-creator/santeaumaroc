"use client";

import { useActionState } from "react";
import { resetPassword } from "@/features/auth/actions";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

type FormT = Dictionary["auth"]["resetPassword"]["form"];

export function ResetPasswordForm({
  token,
  t,
}: {
  token: string;
  t: FormT;
}) {
  const boundAction = resetPassword.bind(null, token);
  const [state, action, isPending] = useActionState<FormState, FormData>(
    boundAction,
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="rp-password" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.password}
        </label>
        <input
          id="rp-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="input-field h-11"
          placeholder={t.passwordPlaceholder}
        />
        {state?.errors?.password && (
          <ul className="mt-1 space-y-0.5">
            {state.errors.password.map((e) => (
              <li key={e} className="text-xs text-red-600">— {e}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="rp-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.confirm}
        </label>
        <input
          id="rp-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="input-field h-11"
          placeholder={t.confirmPlaceholder}
        />
        {state?.errors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{state.errors.confirmPassword[0]}</p>
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
