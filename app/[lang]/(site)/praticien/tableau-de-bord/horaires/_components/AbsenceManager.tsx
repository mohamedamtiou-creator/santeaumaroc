"use client";

import { useState, useTransition } from "react";
import { createAbsence, deleteAbsence } from "@/features/praticien/agenda-actions";
import { casablancaTodayStr } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";

type PraticienT = Dictionary["dashboard"]["praticien"];

const ABSENCE_TYPES = [
  { value: "CONGE",          color: "bg-secondary-100 text-secondary-700" },
  { value: "CONGE_MALADIE",  color: "bg-red-100 text-red-700"             },
  { value: "INDISPONIBLE",   color: "bg-amber-100 text-amber-700"         },
  { value: "FORMATION",      color: "bg-primary-100 text-primary-700"     },
  { value: "AUTRE",          color: "bg-slate-100 text-slate-600"         },
] as const;

type Absence = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("fr-MA", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(d + "T00:00:00"));
}

function dayDiff(start: string, end: string) {
  const ms = new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime();
  return Math.round(ms / 86400000) + 1;
}

// « Aujourd'hui » à l'heure du Maroc (les absences sont des dates de cabinet).
function today() { return casablancaTodayStr(); }

/* ── Absence card ────────────────────────────────────────── */
function AbsenceCard({ absence, onDelete, t }: { absence: Absence; onDelete: (id: string) => void; t: PraticienT }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, start] = useTransition();

  const type = ABSENCE_TYPES.find((x) => x.value === absence.type) ?? ABSENCE_TYPES[4];
  const typeLabel = t.absenceTypes[type.value];
  const nbJours = dayDiff(absence.startDate, absence.endDate);
  const isPast = absence.endDate < today();

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
      isPast ? "border-slate-100 bg-slate-50 opacity-60" : "border-slate-200 bg-white"
    }`}>
      <div className={`mt-0.5 px-2 py-1 rounded-lg text-xs font-semibold shrink-0 ${type.color}`}>
        {typeLabel}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">
          {fmtDate(absence.startDate)}
          {absence.startDate !== absence.endDate && (
            <> → {fmtDate(absence.endDate)} <span className="text-slate-500 font-normal">({nbJours} {t.daysSuffix})</span></>
          )}
        </p>
        {!absence.allDay && absence.startTime && (
          <p className="text-xs text-slate-500 mt-0.5">{absence.startTime} – {absence.endTime}</p>
        )}
        {absence.allDay && <p className="text-xs text-slate-500 mt-0.5">{t.fullDays}</p>}
        {absence.reason && <p className="text-xs text-slate-500 mt-0.5 italic">{absence.reason}</p>}
      </div>
      {!isPast && (
        confirmDelete ? (
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => start(async () => { await deleteAbsence(absence.id); onDelete(absence.id); })}
              disabled={pending}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              {pending ? "…" : t.deleteAbsence}
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              {t.cancelAbsence}
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="text-slate-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
            aria-label={t.deleteAbsenceAria}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        )
      )}
    </div>
  );
}

/* ── New absence form ────────────────────────────────────── */
function AbsenceForm({ onSuccess, t }: { onSuccess: (a: Absence) => void; t: PraticienT }) {
  const [type, setType]           = useState("CONGE");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate]     = useState(today());
  const [allDay, setAllDay]       = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime]     = useState("17:00");
  const [reason, setReason]       = useState("");
  const [error, setError]         = useState("");
  const [pending, start]          = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (endDate < startDate) { setError(t.errAbsEnd); return; }
    if (!allDay && startTime >= endTime) { setError(t.errAbsTime); return; }
    setError("");
    start(async () => {
      try {
        await createAbsence({ type, startDate, endDate, allDay, startTime, endTime, reason });
        // return a fake absence for optimistic update
        onSuccess({
          id: `tmp-${Date.now()}`,
          type, startDate, endDate, allDay,
          startTime: allDay ? null : startTime,
          endTime:   allDay ? null : endTime,
          reason: reason.trim() || null,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-primary-200 bg-primary-50/40 rounded-xl p-4 flex flex-col gap-4">
      {/* Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{t.absTypeLabel}</label>
        <div className="flex flex-wrap gap-2">
          {ABSENCE_TYPES.map((opt) => (
            <button
              key={opt.value} type="button"
              onClick={() => setType(opt.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                type === opt.value
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >{t.absenceTypes[opt.value]}</button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t.absFrom}</label>
          <input type="date" value={startDate} min={today()}
            onChange={(e) => { setStartDate(e.target.value); if (e.target.value > endDate) setEndDate(e.target.value); }}
            className="input-field text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t.absTo}</label>
          <input type="date" value={endDate} min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field text-sm" required />
        </div>
      </div>

      {/* All day toggle */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setAllDay(!allDay)} role="switch" aria-checked={allDay}
          className={`w-10 h-5 rounded-full transition-colors shrink-0 ${allDay ? "bg-primary-600" : "bg-slate-300"}`}>
          <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${allDay ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className="text-sm text-slate-700">{t.fullDays}</span>
      </div>

      {/* Times — if not all day */}
      {!allDay && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t.absStartTime}</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
              className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t.absEndTime}</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
              className="input-field text-sm" />
          </div>
        </div>
      )}

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{t.absReason} <span className="font-normal text-slate-500">({t.optional})</span></label>
        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder={t.absReasonPlaceholder}
          maxLength={120} className="input-field text-sm" />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
          {pending ? (
            <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>{t.saving}</>
          ) : t.saveAbsence}
        </button>
      </div>
    </form>
  );
}

/* ── Main manager ────────────────────────────────────────── */
export function AbsenceManager({ absences: initial, t}: { absences: Absence[]; t: PraticienT }) {
  const [absences, setAbsences] = useState(initial);
  const [showForm, setShowForm] = useState(false);

  const upcoming = absences.filter((a) => a.endDate >= today());
  const past     = absences.filter((a) => a.endDate < today()).slice(0, 3);

  function handleNew(a: Absence) {
    setAbsences((prev) => [a, ...prev]);
    setShowForm(false);
  }
  function handleDelete(id: string) {
    setAbsences((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Upcoming absences */}
      {upcoming.length > 0 ? (
        <div className="flex flex-col gap-2">
          {upcoming.map((a) => (
            <AbsenceCard key={a.id} absence={a} onDelete={handleDelete} t={t} />
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="flex items-center gap-3 py-5 px-4 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-5 h-5 shrink-0" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 9h14M7 3v2M13 3v2"/>
            </svg>
            {t.noUpcomingAbsence}
          </div>
        )
      )}

      {/* Add form */}
      {showForm ? (
        <div>
          <AbsenceForm onSuccess={handleNew} t={t} />
          <button onClick={() => setShowForm(false)}
            className="mt-2 text-sm text-slate-500 hover:text-slate-600 transition-colors">
            {t.cancelAbsence}
          </button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary-600 hover:text-primary-700 border border-primary-200 bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-colors">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3v10M3 8h10"/>
          </svg>
          {t.addAbsence}
        </button>
      )}

      {/* Past absences — collapsed */}
      {past.length > 0 && (
        <details className="group">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-600 transition-colors list-none flex items-center gap-1.5">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-3 h-3 group-open:rotate-90 transition-transform rtl:-scale-x-100" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 2l4 4-4 4"/>
            </svg>
            {t.pastAbsences.replace("{n}", String(past.length))}
          </summary>
          <div className="flex flex-col gap-2 mt-2">
            {past.map((a) => <AbsenceCard key={a.id} absence={a} onDelete={handleDelete} t={t} />)}
          </div>
        </details>
      )}
    </div>
  );
}
