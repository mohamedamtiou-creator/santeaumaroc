"use client";

import { useActionState } from "react";
import { updateProfile } from "@/features/users/actions";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

type Props = { name: string; phone: string; email: string; t: Dictionary["dashboard"]["patient"] };

export function ProfileForm({ name, phone, email, t}: Props) {
  const [state, action, isPending] = useActionState<FormState, FormData>(updateProfile, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      <div>
        <label htmlFor="p-email" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.email}
        </label>
        <input
          id="p-email"
          type="email"
          value={email}
          readOnly
          className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
        />
        <p className="text-xs text-slate-500 mt-1">{t.emailNoEdit}</p>
      </div>

      <div>
        <label htmlFor="p-name" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.name}
        </label>
        <input
          id="p-name"
          name="name"
          type="text"
          defaultValue={name}
          className="input-field"
        />
        {state?.errors?.name && (
          <p className="text-xs text-red-500 mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="p-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
          {t.phone} <span className="text-slate-500 font-normal">{t.optional}</span>
        </label>
        <input
          id="p-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={phone}
          className="input-field"
        />
      </div>

      {state?.message === "ok" && (
        <p className="text-sm text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-xl px-3.5 py-2.5">
          {t.profileSaved}
        </p>
      )}
      {state?.message && state.message !== "ok" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary self-start px-6 py-2.5">
        {isPending ? t.saving : t.save}
      </button>
    </form>
  );
}
