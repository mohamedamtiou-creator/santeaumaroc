"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { bookAppointment } from "@/features/appointments/actions";
import { loginInline } from "@/features/auth/actions";
import type { FormState } from "@/lib/definitions";
import { useToast } from "@/components/ui/Toast";
import type { Dictionary } from "@/lib/i18n";

type RdvT = Dictionary["rdv"];

type Props = {
  doctorId: string;
  slug: string;
  slotsByDate: Record<string, string[]>;
  consultationDuration: number;
  isAuthenticated: boolean;
  needsPhone: boolean;
  /** Motifs de consultation propres au médecin (prioritaires sur les motifs génériques). */
  doctorMotifs?: string[];
  initialDate?: string;
  initialTime?: string;
  initialReason?: string;
  t: RdvT;
  /** Libellés du formulaire de connexion, pour l'auth inline (invité de retour). */
  authT: Dictionary["auth"]["login"]["form"];
};

const OTHER = "__other__";

/* ── Helpers ──────────────────────────────────────────────── */

/** YYYY-MM-DD in local timezone (safe for Morocco UTC+1) */
function toStr(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function addDays(d: Date, n: number): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

/** Monday of the week containing d */
function getMondayOf(d: Date): Date {
  const dt  = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const day = dt.getDay(); // 0 = Sun
  dt.setDate(dt.getDate() - (day === 0 ? 6 : day - 1));
  return dt;
}

function fmtLong(d: string, t: RdvT): string {
  const dt = new Date(d + "T00:00:00");
  return `${t.dayFull[dt.getDay()]} ${dt.getDate()} ${t.monthFull[dt.getMonth()]}`;
}

function monthLabel(start: Date, end: Date, t: RdvT): string {
  if (start.getMonth() === end.getMonth()) {
    return `${t.monthFull[start.getMonth()]} ${start.getFullYear()}`;
  }
  const s = t.monthFull[start.getMonth()].slice(0, 4) + ".";
  const e = t.monthFull[end.getMonth()].slice(0, 4) + ".";
  return `${s} – ${e} ${end.getFullYear()}`;
}

/* ── Regroupement des créneaux par moment de la journée ───── */
type Period = "morning" | "afternoon" | "evening";

function groupSlots(times: string[], t: RdvT): { key: Period; label: string; times: string[] }[] {
  const groups: { key: Period; label: string; times: string[] }[] = [
    { key: "morning",   label: t.morning,   times: [] },
    { key: "afternoon", label: t.afternoon, times: [] },
    { key: "evening",   label: t.evening,   times: [] },
  ];
  for (const time of times) {
    const h = parseInt(time.slice(0, 2), 10);
    if (h < 12)      groups[0].times.push(time);
    else if (h < 17) groups[1].times.push(time);
    else             groups[2].times.push(time);
  }
  return groups.filter((g) => g.times.length > 0);
}

function PeriodIcon({ period }: { period: Period }) {
  const cls = "w-3.5 h-3.5 shrink-0";
  if (period === "morning") {
    // lever du soleil
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="#d97706" strokeWidth="1.6"
        className={cls} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 16h14M10 11V4M6.5 7.5 10 4l3.5 3.5M1 16h1M18 16h1M5 12l-1-1M15 12l1-1"/>
      </svg>
    );
  }
  if (period === "afternoon") {
    // soleil plein
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="#ea580c" strokeWidth="1.6"
        className={cls} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="3.5"/>
        <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M16 4l-1.4 1.4M5.4 14.6 4 16"/>
      </svg>
    );
  }
  // soir — lune
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="#6366f1" strokeWidth="1.6"
      className={cls} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 11.5A6.5 6.5 0 1 1 8.5 4a5 5 0 0 0 7.5 7.5z"/>
    </svg>
  );
}

/* ── Empty state ──────────────────────────────────────────── */

function EmptyState({ t }: { t: RdvT }) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="w-9 h-9 text-slate-300" aria-hidden="true">
          <rect x="6" y="8" width="36" height="34" rx="4"/>
          <path d="M6 18h36M16 6v4M32 6v4" strokeLinecap="round"/>
          <path d="M24 28v.5M24 33h.01" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="font-semibold text-slate-700">{t.emptyTitle}</p>
      <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed">
        {t.emptyDesc}
      </p>
    </div>
  );
}

/* ── BookingForm ──────────────────────────────────────────── */

export function BookingForm({
  doctorId,
  slug,
  slotsByDate,
  consultationDuration,
  isAuthenticated,
  needsPhone,
  doctorMotifs,
  initialDate,
  initialTime,
  initialReason,
  t,
  authT,
}: Props) {
  const [formState, action, isPending] = useActionState<FormState, FormData>(
    bookAppointment, undefined
  );
  const { toast } = useToast();
  const toastFiredRef = useRef(false);

  useEffect(() => {
    if (formState?.message === "ok" && !toastFiredRef.current) {
      toastFiredRef.current = true;
      toast(t.toastConfirmed, "success");
    }
  }, [formState?.message, toast, t.toastConfirmed]);

  /* ── Auth inline (invité de retour) ─────────────────────────
     La connexion se fait sans quitter la page : `loginInline` crée la session
     puis on `router.refresh()`. Le Server Component se re-rend avec
     isAuthenticated=true tandis que l'état client (créneau, motif) est préservé
     → la confirmation apparaît directement, sans re-choisir le créneau. */
  const router = useRouter();
  const [loginState, loginAction, loginPending] = useActionState<FormState, FormData>(
    loginInline, undefined
  );
  const [showPw, setShowPw] = useState(false);
  const loginDoneRef = useRef(false);

  useEffect(() => {
    if (loginState?.message === "ok" && !loginDoneRef.current) {
      loginDoneRef.current = true;
      router.refresh();
    }
  }, [loginState?.message, router]);

  const sortedDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);
  const todayDate = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const todayStr  = toStr(todayDate);
  const firstSlotDate = sortedDates[0];

  /* État initial — restauré depuis l'URL après un retour de connexion */
  const startDate =
    initialDate && slotsByDate[initialDate] ? initialDate
    : slotsByDate[todayStr]                 ? todayStr
    : firstSlotDate ?? null;

  const [weekStart, setWeekStart] = useState<Date>(() =>
    getMondayOf(startDate ? new Date(startDate + "T00:00:00") : todayDate)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(startDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(
    () => (initialTime && startDate && slotsByDate[startDate]?.includes(initialTime)) ? initialTime : null
  );

  /* Motif : chip prédéfini, « Autre » (texte libre), ou aucun.
     Les motifs saisis par le médecin (spécifiques à sa pratique) priment sur les
     motifs génériques — meilleur contexte de réservation et longue traîne. */
  const reasonChips = (doctorMotifs && doctorMotifs.length > 0)
    ? doctorMotifs.slice(0, 8)
    : t.reasonChips;
  const [reasonChoice, setReasonChoice] = useState<string | null>(() => {
    if (!initialReason) return null;
    return reasonChips.includes(initialReason) ? initialReason : OTHER;
  });
  const [otherText, setOtherText] = useState<string>(
    () => (initialReason && !reasonChips.includes(initialReason)) ? initialReason : ""
  );
  const otherRef = useRef<HTMLInputElement>(null);

  const slotsRef   = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  if (sortedDates.length === 0) return <EmptyState t={t} />;

  const weekDays    = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd     = weekDays[6];
  const minMonday   = getMondayOf(todayDate);
  const canPrev     = weekStart.getTime() > minMonday.getTime();
  const firstTime   = firstSlotDate ? slotsByDate[firstSlotDate]?.[0] : null;

  const finalReason = reasonChoice === OTHER ? otherText.trim() : (reasonChoice ?? "");

  /* URL de retour qui préserve le créneau choisi à travers la connexion */
  const callbackUrl = (() => {
    const qs = new URLSearchParams();
    if (selectedDate) qs.set("date", selectedDate);
    if (selectedTime) qs.set("time", selectedTime);
    if (finalReason)  qs.set("reason", finalReason);
    return `/praticiens/${slug}/rdv?${qs.toString()}`;
  })();
  const encodedCb = encodeURIComponent(callbackUrl);

  function goWeek(delta: -1 | 1) {
    const next = addDays(weekStart, delta * 7);
    setWeekStart(next);
    if (selectedDate) {
      const ns = toStr(next);
      const ne = toStr(addDays(next, 6));
      if (selectedDate < ns || selectedDate > ne) {
        setSelectedDate(null);
        setSelectedTime(null);
      }
    }
  }

  function jumpToFirst() {
    if (!firstSlotDate) return;
    setWeekStart(getMondayOf(new Date(firstSlotDate + "T00:00:00")));
    setSelectedDate(firstSlotDate);
    setSelectedTime(null);
    setTimeout(() => {
      slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      slotsRef.current?.focus();
    }, 60);
  }

  function pickDate(str: string) {
    if (!slotsByDate[str]) return;
    setSelectedDate(str);
    setSelectedTime(null);
    // Déplace le focus vers les créneaux (clavier + lecteur d'écran), pas seulement le scroll
    setTimeout(() => {
      slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      slotsRef.current?.focus();
    }, 60);
  }

  function pickTime(time: string) {
    setSelectedTime(time);
    // Déplacer le focus sur le panneau de confirmation (pas seulement le scroll) :
    // un lecteur d'écran annonce ainsi le récap au moment du choix du créneau.
    setTimeout(() => {
      confirmRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      confirmRef.current?.focus();
    }, 80);
  }

  function selectReason(value: string) {
    setReasonChoice(value);
    if (value === OTHER) {
      setTimeout(() => otherRef.current?.focus(), 40);
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Titre de l'étape ───────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 leading-tight">{t.chooseSlot}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t.chooseSlotHint}</p>
      </div>

      {/* ── Prochaine disponibilité (raccourci) ────────────── */}
      {firstSlotDate && firstTime && (
        <button
          type="button"
          onClick={jumpToFirst}
          className="flex items-center gap-3 w-full text-start rounded-2xl border border-secondary-200 bg-secondary-50/60 px-4 py-3
            hover:bg-secondary-50 hover:border-secondary-300 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
        >
          <span className="w-9 h-9 rounded-xl bg-secondary-500 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.75"
              className="w-4.5 h-4.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="8"/><path d="M10 5.5v4.5l3 2"/>
            </svg>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-secondary-700 uppercase tracking-wide">
              {t.nextAvailable}
            </span>
            <span className="block text-sm font-bold text-slate-900 leading-snug truncate first-letter:uppercase">
              {fmtLong(firstSlotDate, t)} {t.at} {firstTime}
            </span>
          </span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-4 h-4 text-secondary-500 shrink-0 rtl:-scale-x-100" aria-hidden="true" strokeLinecap="round">
            <path d="m6 3 5 5-5 5"/>
          </svg>
        </button>
      )}

      {/* ── Calendrier semaine ─────────────────────────────── */}
      <div className="card p-3 sm:p-5">

        {/* Navigation */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            type="button"
            onClick={() => goWeek(-1)}
            disabled={!canPrev}
            aria-label={t.prevWeek}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors rtl:-scale-x-100 ${
              canPrev
                ? "text-slate-600 hover:bg-slate-100"
                : "text-slate-200 cursor-default"
            }`}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 3L5 8l5 5"/>
            </svg>
          </button>

          <p className="text-sm font-semibold text-slate-800 first-letter:uppercase">
            {monthLabel(weekDays[0], weekEnd, t)}
          </p>

          <button
            type="button"
            onClick={() => goWeek(1)}
            aria-label={t.nextWeek}
            className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors rtl:-scale-x-100"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3l5 5-5 5"/>
            </svg>
          </button>
        </div>

        {/* 7 jours — colonnes égales qui peuvent rétrécir (min-w-0) pour ne jamais déborder sur mobile */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekDays.map((day) => {
            const str      = toStr(day);
            const slots    = slotsByDate[str] ?? [];
            const hasSlots = slots.length > 0;
            const isPast   = str < todayStr;
            const isToday  = str === todayStr;
            const active   = selectedDate === str;
            const disabled = isPast || !hasSlots;

            const ariaLabel = (hasSlots
              ? (slots.length > 1 ? t.ariaAvailable : t.ariaAvailableOne).replace("{n}", String(slots.length))
              : t.ariaUnavailable
            )
              .replace("{day}", t.dayFull[day.getDay()])
              .replace("{date}", String(day.getDate()))
              .replace("{month}", t.monthFull[day.getMonth()]);

            return (
              <button
                key={str}
                type="button"
                onClick={() => pickDate(str)}
                disabled={disabled}
                aria-label={ariaLabel}
                aria-pressed={active}
                className={`
                  flex flex-col items-center justify-center min-w-0 overflow-hidden
                  py-2 px-0.5 rounded-xl border
                  transition-all duration-150 select-none
                  ${active
                    ? "bg-primary-600 border-primary-600 shadow-sm"
                    : disabled
                      ? "border-transparent cursor-default"
                      : isToday
                        ? "bg-primary-50 border-primary-200 hover:bg-primary-100 active:scale-95"
                        : "bg-white border-slate-200 hover:border-primary-300 hover:bg-primary-50 active:scale-95"
                  }
                `}
              >
                {/* Nom du jour : Lun, Mar… */}
                <span className={`text-[10px] sm:text-xs font-semibold uppercase leading-none mb-1 whitespace-nowrap ${
                  active    ? "text-primary-200"
                  : disabled  ? "text-slate-300"
                  : isToday   ? "text-primary-500"
                  : "text-slate-500"
                }`}>
                  {t.dayShort[day.getDay()]}
                </span>

                {/* Numéro */}
                <span className={`text-[15px] sm:text-[17px] font-black leading-none tabular-nums ${
                  active    ? "text-white"
                  : disabled  ? "text-slate-300"
                  : isToday   ? "text-primary-700"
                  : "text-slate-900"
                }`}>
                  {day.getDate()}
                </span>

                {/* Pastille disponibilité */}
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  active && hasSlots  ? "bg-primary-300"
                  : hasSlots          ? "bg-secondary-500"
                  : "bg-transparent"
                }`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Créneaux du jour sélectionné ───────────────────── */}
      {selectedDate && slotsByDate[selectedDate] && (
        <div ref={slotsRef} tabIndex={-1} aria-live="polite" className="flex flex-col gap-4 scroll-mt-4 focus:outline-none">

          <p className="text-sm font-semibold text-slate-700 px-0.5">
            <span className="first-letter:uppercase">{fmtLong(selectedDate, t)}</span>
            <span className="ms-2 text-xs font-normal text-slate-500">
              {(slotsByDate[selectedDate].length > 1 ? t.slotsCountDash : t.slotsCountDashOne).replace("{n}", String(slotsByDate[selectedDate].length))}
            </span>
          </p>

          {/* Créneaux regroupés par moment de la journée */}
          {groupSlots(slotsByDate[selectedDate], t).map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 px-0.5">
                <PeriodIcon period={group.key} />
                {group.label}
                <span className="font-normal text-slate-400">· {group.times.length}</span>
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {group.times.map((time) => {
                  const active = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => pickTime(time)}
                      aria-pressed={active}
                      aria-label={t.slotAria.replace("{time}", time)}
                      className={`
                        h-11 rounded-xl border text-sm font-semibold tabular-nums
                        transition-all duration-150 active:scale-95
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
                        ${active
                          ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-800 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                        }
                      `}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Panneau de confirmation ─────────────────────────── */}
      {selectedDate && selectedTime && (
        <div ref={confirmRef} tabIndex={-1} role="group" aria-label={t.yourAppt}
          className="rounded-2xl border border-primary-200 bg-gradient-to-b from-primary-50/50 to-white p-4 sm:p-5 scroll-mt-4 focus:outline-none">

          {/* Récap */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4.5 h-4.5 text-primary-600" aria-hidden="true"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="14" height="15" rx="2"/>
                  <path d="M3 8h14M7 2v2M13 2v2M7 13l2 2 4-4"/>
                </svg>
              </div>
              <div aria-live="polite" aria-atomic="true">
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                  {t.yourAppt}
                </p>
                <p className="text-sm font-bold text-slate-900 leading-snug mt-0.5 first-letter:uppercase">
                  {fmtLong(selectedDate, t)} {t.at} {selectedTime}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.estimatedDuration} {consultationDuration} {t.minSuffix}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedTime(null); }}
              aria-label={t.changeSlot}
              className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center
                text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-3 h-3" aria-hidden="true" strokeLinecap="round">
                <path d="M2 2l8 8M10 2l-8 8"/>
              </svg>
            </button>
          </div>

          {/* Motif — chips de sélection rapide */}
          <fieldset className="mb-4">
            <legend className="text-xs font-semibold text-slate-700 mb-2">
              {t.reasonLabel} <span className="font-normal text-slate-400">· {t.reasonOptional}</span>
            </legend>
            {/* Vrais boutons radio : mono-choix annoncé aux lecteurs d'écran +
                navigation aux flèches native. Re-cliquer le choix actif le
                désélectionne (le motif reste facultatif). Cible tactile ≥44px. */}
            <div className="flex flex-wrap gap-2">
              {[...reasonChips, OTHER].map((value) => {
                const on = reasonChoice === value;
                const label = value === OTHER ? t.reasonOther : value;
                return (
                  <label key={value} className="cursor-pointer select-none">
                    <input
                      type="radio"
                      name="rdv-reason-choice"
                      value={value}
                      checked={on}
                      onChange={() => selectReason(value)}
                      onClick={() => { if (on) setReasonChoice(null); }}
                      className="peer sr-only"
                    />
                    <span
                      className="inline-flex items-center justify-center min-h-[2.75rem] px-4 rounded-full text-xs font-semibold border transition-colors
                        border-slate-200 bg-white text-slate-600
                        peer-hover:border-primary-300 peer-hover:bg-primary-50
                        peer-checked:bg-primary-600 peer-checked:border-primary-600 peer-checked:text-white
                        peer-checked:peer-hover:bg-primary-700 peer-checked:peer-hover:border-primary-700 peer-checked:peer-hover:text-white
                        peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400 peer-focus-visible:ring-offset-1"
                    >
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
            {reasonChoice === OTHER && (
              <input
                ref={otherRef}
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder={t.reasonOtherPlaceholder}
                maxLength={200}
                className="input-field text-sm bg-white mt-2"
              />
            )}
          </fieldset>

          {isAuthenticated ? (
            /* ── Confirmation directe (connecté) ── */
            <form action={action} className="flex flex-col gap-3">
              <input type="hidden" name="doctorId" value={doctorId} />
              <input type="hidden" name="date"     value={selectedDate} />
              <input type="hidden" name="time"     value={selectedTime} />
              <input type="hidden" name="reason"   value={finalReason} />

              {needsPhone && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rdv-phone" className="text-xs font-semibold text-slate-700">
                    {t.phoneLabel} <span className="font-normal text-slate-400">· {t.phoneHint}</span>
                  </label>
                  <input
                    id="rdv-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder={t.phonePlaceholder}
                    className="input-field text-sm bg-white"
                  />
                </div>
              )}

              {formState?.message && formState.message !== "ok" && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                  {formState.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="btn-secondary py-3.5 w-full justify-center text-[15px] font-semibold"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4 me-2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {t.confirming}
                  </>
                ) : t.confirm}
              </button>

              <p className="text-center text-xs text-slate-500">
                {t.immediateSms}
              </p>
            </form>
          ) : loginState?.message === "ok" ? (
            /* ── Connexion réussie : router.refresh() en cours → la confirmation
                   va apparaître (isAuthenticated repasse à true, créneau préservé). ── */
            <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary-50 border border-secondary-200 px-3.5 py-3.5 text-sm font-semibold text-secondary-700"
              role="status" aria-live="polite">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {t.confirming}
            </div>
          ) : (
            /* ── Auth tardive INLINE : le créneau est choisi ; l'invité de retour
                   se connecte sans quitter la page. Un nouveau compte reste une
                   redirection (la vérification e-mail précède toute réservation). ── */
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 rounded-xl bg-white border border-slate-200 px-3.5 py-3">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4.5 h-4.5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="9" width="12" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/>
                </svg>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.authTitle}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{t.authDesc}</p>
                </div>
              </div>

              {/* Erreur globale de connexion (identifiants, compte non vérifié…) */}
              {loginState?.message && loginState.message !== "ok" && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 flex flex-col gap-2" role="alert">
                  <span>{loginState.message}</span>
                  {loginState.code === "UNVERIFIED" && (
                    <Link href="/auth/verification-envoyee"
                      className="font-semibold text-red-800 underline underline-offset-2 hover:text-red-900 w-fit">
                      {authT.resendVerification}
                    </Link>
                  )}
                </div>
              )}

              {/* Formulaire de connexion inline */}
              <form action={loginAction} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rdv-auth-email" className="text-xs font-semibold text-slate-700">{authT.email}</label>
                  <input
                    id="rdv-auth-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    aria-invalid={loginState?.errors?.email ? true : undefined}
                    placeholder={authT.emailPlaceholder}
                    className="input-field text-sm bg-white"
                  />
                  {loginState?.errors?.email && <p className="text-xs text-red-600" role="alert">{loginState.errors.email[0]}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="rdv-auth-pw" className="text-xs font-semibold text-slate-700">{authT.password}</label>
                    <Link href="/auth/mot-de-passe-oublie" className="text-xs text-secondary-600 hover:text-secondary-700 hover:underline font-medium">
                      {authT.forgot}
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="rdv-auth-pw"
                      name="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      aria-invalid={loginState?.errors?.password ? true : undefined}
                      placeholder={authT.passwordPlaceholder}
                      className="input-field text-sm bg-white pe-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? authT.hidePassword : authT.showPassword}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                    >
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="w-[18px] h-[18px]" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 10s3.2-6 8-6 8 6 8 6-3.2 6-8 6-8-6-8-6z"/><circle cx="10" cy="10" r="2.5"/>
                        {showPw && <path d="M3 3l14 14"/>}
                      </svg>
                    </button>
                  </div>
                  {loginState?.errors?.password && <p className="text-xs text-red-600" role="alert">{loginState.errors.password[0]}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loginPending}
                  className="btn-secondary py-3.5 w-full justify-center text-[15px] font-semibold"
                >
                  {loginPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4 me-2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      {authT.submitting}
                    </>
                  ) : authT.submit}
                </button>
              </form>

              {/* Pas de compte → inscription (redirection : le créneau est préservé
                  via callbackUrl, la vérification e-mail précède la réservation). */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <p className="text-center text-xs text-slate-500 uppercase tracking-wide font-medium">{authT.noAccount}</p>
                <Link
                  href={`/inscription?callbackUrl=${encodedCb}`}
                  className="btn-outline py-2.5 w-full justify-center text-sm"
                >
                  {t.authRegister}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
