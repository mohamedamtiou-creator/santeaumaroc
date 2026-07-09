"use client";

import { useActionState } from "react";
import { updateBankSettings } from "@/features/subscription/order-actions";

type Bank = { holder: string; bank: string; rib: string; iban: string; swift: string };

function Field({
  name,
  label,
  value,
  mono,
}: {
  name: keyof Bank;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <input
        name={name}
        defaultValue={value}
        className={`input-field text-sm ${mono ? "font-mono" : ""}`}
        dir="ltr"
      />
    </label>
  );
}

export function BankSettingsForm({ initial }: { initial: Bank }) {
  const [state, action, pending] = useActionState(
    updateBankSettings,
    {} as { error?: string; ok?: boolean },
  );

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field name="holder" label="Titulaire" value={initial.holder} />
        <Field name="bank" label="Banque" value={initial.bank} />
        <Field name="rib" label="RIB" value={initial.rib} mono />
        <Field name="iban" label="IBAN" value={initial.iban} mono />
        <Field name="swift" label="SWIFT / BIC" value={initial.swift} mono />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary py-2 text-sm disabled:opacity-60">
          {pending ? "…" : "Enregistrer"}
        </button>
        {state.ok && <span className="text-xs font-semibold text-secondary-700">Coordonnées enregistrées ✓</span>}
        {state.error && <span className="text-xs text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
