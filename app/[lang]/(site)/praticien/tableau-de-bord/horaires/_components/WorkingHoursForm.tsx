"use client";

import { useActionState, useState } from "react";
import { updateWorkingHours } from "@/features/praticien/actions";
import type { FormState } from "@/lib/definitions";
import type { Dictionary } from "@/lib/i18n";

type DayHour = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type Props = {
  workingHours: DayHour[];
  t: Dictionary["dashboard"];
};

const DEFAULT_HOURS: DayHour[] = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  startTime: "09:00",
  endTime:   "17:00",
  isActive:  i >= 1 && i <= 5,
}));

export function WorkingHoursForm({ workingHours, t}: Props) {
  const tp = t.praticien;
  const [state, action, isPending] = useActionState<FormState, FormData>(
    updateWorkingHours,
    undefined
  );

  const initialHours = Array.from({ length: 7 }, (_, i) => {
    const existing = workingHours.find((wh) => wh.dayOfWeek === i);
    return existing ?? DEFAULT_HOURS[i];
  });

  const [hours, setHours] = useState<DayHour[]>(initialHours);

  function toggle(dayOfWeek: number) {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, isActive: !h.isActive } : h))
    );
  }

  function setTime(dayOfWeek: number, field: "startTime" | "endTime", value: string) {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 max-w-lg">
      {hours.map((h) => (
        <div
          key={h.dayOfWeek}
          className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
            h.isActive
              ? "border-primary-200 bg-primary-50/30"
              : "border-slate-200 bg-slate-50 opacity-60"
          }`}
        >
          {/* Hidden inputs */}
          <input type="hidden" name={`day_${h.dayOfWeek}_active`} value={h.isActive ? "1" : "0"} />
          <input type="hidden" name={`day_${h.dayOfWeek}_start`}  value={h.startTime} />
          <input type="hidden" name={`day_${h.dayOfWeek}_end`}    value={h.endTime} />

          {/* Toggle */}
          <button
            type="button"
            onClick={() => toggle(h.dayOfWeek)}
            role="switch"
            aria-checked={h.isActive}
            className={`w-10 h-5 rounded-full transition-colors shrink-0 ${h.isActive ? "bg-primary-600" : "bg-slate-300"}`}
          >
            <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${h.isActive ? "translate-x-5" : "translate-x-0"}`} />
          </button>

          <span className="w-20 text-sm font-medium text-slate-700 capitalize">{t.dayFull[h.dayOfWeek]}</span>

          {h.isActive ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={h.startTime}
                onChange={(e) => setTime(h.dayOfWeek, "startTime", e.target.value)}
                className="input-field w-auto text-sm py-1.5"
              />
              <span className="text-slate-500 text-sm">–</span>
              <input
                type="time"
                value={h.endTime}
                onChange={(e) => setTime(h.dayOfWeek, "endTime", e.target.value)}
                className="input-field w-auto text-sm py-1.5"
              />
            </div>
          ) : (
            <span className="text-sm text-slate-500 flex-1">{tp.closed}</span>
          )}
        </div>
      ))}

      {state?.message === "ok" && (
        <p className="text-sm text-secondary-700 bg-secondary-50 border border-secondary-200 rounded-xl px-3.5 py-2.5">
          {tp.hoursSaved}
        </p>
      )}
      {state?.message && state.message !== "ok" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary self-start px-8 py-2.5 mt-1">
        {isPending ? tp.saving : tp.saveHours}
      </button>
    </form>
  );
}
