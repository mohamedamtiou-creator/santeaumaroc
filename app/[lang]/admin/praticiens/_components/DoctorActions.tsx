"use client";

import { useTransition } from "react";
import { toggleDoctorActive } from "@/features/admin/actions";

export function ActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await toggleDoctorActive(id, isActive); })}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
        isActive
          ? "bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100"
          : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
      }`}
    >
      {pending ? "…" : isActive ? "Actif" : "Désactivé"}
    </button>
  );
}
