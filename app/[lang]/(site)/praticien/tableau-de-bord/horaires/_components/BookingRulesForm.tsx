"use client";

import { useState, useTransition } from "react";
import { updateBookingRules } from "@/features/praticien/agenda-actions";
import type { Dictionary } from "@/lib/i18n";

const DURATIONS = [
  { value: 10,  label: "10 min" },
  { value: 15,  label: "15 min" },
  { value: 20,  label: "20 min" },
  { value: 30,  label: "30 min" },
  { value: 45,  label: "45 min" },
  { value: 60,  label: "1 h"    },
  { value: 90,  label: "1h30"   },
];

function OptionGroup<T extends number>({
  label, options, value, onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`text-sm font-medium px-3.5 py-2 rounded-xl border transition-colors ${
              value === o.value
                ? "bg-primary-600 border-primary-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = {
  consultationDuration: number;
  bookingLeadHours: number;
  bookingMaxDays: number;
  t: Dictionary["dashboard"]["praticien"];
};

export function BookingRulesForm({ consultationDuration: initDur, bookingLeadHours: initLead, bookingMaxDays: initMax, t}: Props) {
  const LEAD_OPTIONS = [
    { value: 0,  label: t.leadImmediate },
    { value: 1,  label: "1 h"  },
    { value: 2,  label: "2 h"  },
    { value: 6,  label: "6 h"  },
    { value: 24, label: "24 h" },
    { value: 48, label: "48 h" },
  ];
  const HORIZON_OPTIONS = [
    { value: 7,   label: t.horizon7 },
    { value: 14,  label: t.horizon14 },
    { value: 30,  label: t.horizon30 },
    { value: 60,  label: t.horizon60 },
    { value: 90,  label: t.horizon90 },
  ];
  const [duration, setDuration] = useState(initDur);
  const [leadHours, setLeadHours] = useState(initLead);
  const [maxDays, setMaxDays] = useState(initMax);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function handleSave() {
    setSaved(false); setError("");
    start(async () => {
      try {
        await updateBookingRules({ consultationDuration: duration, bookingLeadHours: leadHours, bookingMaxDays: maxDays });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  const changed = duration !== initDur || leadHours !== initLead || maxDays !== initMax;

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <OptionGroup
        label={t.ruleDuration}
        options={DURATIONS}
        value={duration as typeof DURATIONS[number]["value"]}
        onChange={(v) => setDuration(v)}
      />
      <OptionGroup
        label={t.ruleLead}
        options={LEAD_OPTIONS}
        value={leadHours}
        onChange={(v) => setLeadHours(v)}
      />
      <OptionGroup
        label={t.ruleHorizon}
        options={HORIZON_OPTIONS}
        value={maxDays}
        onChange={(v) => setMaxDays(v)}
      />

      {/* Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600">
        {t.previewPre}{" "}
        <strong>{DURATIONS.find((d) => d.value === duration)?.label ?? `${duration} min`}</strong>,{" "}
        {t.previewBetween} <strong>{LEAD_OPTIONS.find((l) => l.value === leadHours)?.label ?? `${leadHours}h`} </strong>
        {t.previewAnd} <strong>{HORIZON_OPTIONS.find((h) => h.value === maxDays)?.label ?? `${maxDays} j`}</strong> {t.previewSuffix}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={pending || !changed}
        className={`btn-primary self-start px-8 py-2.5 transition-opacity ${(!changed && !pending) ? "opacity-50 cursor-default" : ""}`}
      >
        {pending ? t.saving : saved ? t.rulesSaved : t.saveRules}
      </button>
    </div>
  );
}
