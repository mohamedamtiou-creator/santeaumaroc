"use client";

import { useActionState } from "react";
import { changePassword } from "@/features/users/actions";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

export function PasswordForm({ t}: { t: Dictionary["dashboard"]["patient"] }) {
  const [state, action, isPending] = useActionState<FormState, FormData>(changePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      <div>
        <label htmlFor="pw-current" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.currentPassword}
        </label>
        <input
          id="pw-current"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="input-field"
          placeholder="••••••••"
        />
        {state?.errors?.currentPassword && (
          <p className="text-xs text-red-500 mt-1">{state.errors.currentPassword[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="pw-new" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.newPassword}
        </label>
        <input
          id="pw-new"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className="input-field"
          placeholder={t.passwordPlaceholder8}
        />
        {state?.errors?.newPassword && (
          <p className="text-xs text-red-500 mt-1">{state.errors.newPassword[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="pw-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.confirmNewPassword}
        </label>
        <input
          id="pw-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="input-field"
          placeholder="••••••••"
        />
        {state?.errors?.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {state?.message === "ok" && (
        <p className="text-sm text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-xl px-3.5 py-2.5">
          {t.passwordSaved}
        </p>
      )}
      {state?.message && state.message !== "ok" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary self-start px-6 py-2.5">
        {isPending ? t.changingPassword : t.changePasswordBtn}
      </button>
    </form>
  );
}
