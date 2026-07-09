import type { Metadata } from "next";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppointmentActions } from "../_components/AppointmentActions";
import { DashHeader, CardAccent } from "../_components/DashHeader";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { casablancaTodayStr } from "@/lib/utils";

export const metadata: Metadata = { title: "Agenda — SantéauMaroc" };

type SearchParams = Promise<{ date?: string }>;
type Dash = Dictionary["dashboard"];

/* ── Status config (couleurs ; libellé via dict) ───────────── */

const STATUS_STYLE = {
  PENDING:   { badge: "bg-amber-50 text-amber-700 border border-amber-200",            col: "bg-amber-400",      colText: "text-white",     dim: false },
  CONFIRMED: { badge: "bg-secondary-50 text-secondary-700 border border-secondary-200", col: "bg-secondary-500", colText: "text-white",     dim: false },
  CANCELLED: { badge: "bg-red-50 text-red-600 border border-red-200",                  col: "bg-slate-100",      colText: "text-slate-500", dim: true  },
  COMPLETED: { badge: "bg-slate-100 text-slate-500 border border-slate-200",            col: "bg-slate-100",      colText: "text-slate-500", dim: false },
} as const;

const STATUS_KEY = { PENDING: "pending", CONFIRMED: "confirmed", CANCELLED: "cancelled", COMPLETED: "completed" } as const;

/* ── Helpers ───────────────────────────────────────────────── */

// « Aujourd'hui » à l'heure du Maroc (pas le fuseau serveur).
function localToday(): string {
  return casablancaTodayStr();
}

function fmtDate(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}

function getWeekDays(dateStr: string): string[] {
  const d   = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(mon);
    dt.setDate(mon.getDate() + i);
    return fmtDate(dt);
  });
}

function weekLabel(weekDays: string[], d: Dash): string {
  const first = new Date(weekDays[0] + "T00:00:00");
  const last  = new Date(weekDays[6] + "T00:00:00");
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${d.monthFull[first.getMonth()]} ${first.getFullYear()}`;
  }
  return `${first.getDate()} ${d.monthShort[first.getMonth()]} – ${last.getDate()} ${d.monthShort[last.getMonth()]} ${last.getFullYear()}`;
}

function fmtDayFull(dateStr: string, d: Dash): string {
  const dt = new Date(dateStr + "T00:00:00");
  return `${d.dayFull[dt.getDay()]} ${dt.getDate()} ${d.monthFull[dt.getMonth()]} ${dt.getFullYear()}`;
}

function fmtTime(t: string) {
  const [h, m] = t.split(":");
  return m === "00" ? `${h}h` : `${h}h${m}`;
}

/* ── Icons ─────────────────────────────────────────────────── */

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-4 h-4" aria-hidden="true" strokeLinecap="round">
      <path d="m10 3-5 5 5 5"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className="w-4 h-4" aria-hidden="true" strokeLinecap="round">
      <path d="m6 3 5 5-5 5"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-3 h-3 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3a1.333 1.333 0 0 1 1.333-1.333H4.8a.667.667 0 0 1 .645.505l.534 2.133a.667.667 0 0 1-.179.651L4.6 6.1a8.4 8.4 0 0 0 5.3 5.3l1.144-1.2a.667.667 0 0 1 .651-.179l2.133.534A.667.667 0 0 1 14.333 11.2v1.467A1.333 1.333 0 0 1 13 14h-.333C6.28 14 2 9.72 2 3.333V3z"/>
    </svg>
  );
}

function CalendarEmptyIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-10 h-10 text-slate-300" aria-hidden="true">
      <rect x="6" y="8" width="36" height="34" rx="4"/>
      <path d="M6 18h36M16 6v4M32 6v4" strokeLinecap="round"/>
      <path d="M24 28v.5M24 33h.01" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default async function AgendaPage({ searchParams }: { searchParams: SearchParams }) {
  const { date: dateParam } = await searchParams;
  const today        = localToday();
  const selectedDate = dateParam ?? today;

  const { userId } = await verifySession();
  const dash = getDictionary(await getLocale()).dashboard;
  const tp = dash.praticien;
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true, consultationDuration: true },
  });
  if (!doctor) return null;

  const weekDays   = getWeekDays(selectedDate);
  const prevWeek   = addDays(weekDays[0], -7);
  const nextWeek   = addDays(weekDays[0], 7);
  const prevDay    = addDays(selectedDate, -1);
  const nextDay    = addDays(selectedDate, 1);
  const isToday    = selectedDate === today;

  const [dayAppts, weekCounts] = await Promise.all([
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, date: selectedDate },
      orderBy: { time: "asc" },
      include: { patient: { select: { name: true, phone: true } } },
    }),
    prisma.appointment.groupBy({
      by: ["date"],
      where: { doctorId: doctor.id, date: { in: weekDays }, status: { notIn: ["CANCELLED"] } },
      _count: true,
    }),
  ]);

  const countByDate = Object.fromEntries(weekCounts.map((r) => [r.date, r._count]));
  const activeCount = dayAppts.filter((a) => a.status !== "CANCELLED").length;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* ── En-tête ─────────────────────────────────── */}
      <DashHeader eyebrow={tp.overviewEyebrow} title={tp.agendaTitle} />

      {/* ── Navigation semaine ──────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <CardAccent bleed={false} />
        {/* Barre de navigation */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
          <Link href={`?date=${prevWeek}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors rtl:-scale-x-100"
            aria-label={tp.prevWeek}>
            <ChevronLeftIcon />
          </Link>

          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800 tabular-nums">
              {weekLabel(weekDays, dash)}
            </p>
          </div>

          <Link href={`?date=${nextWeek}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors rtl:-scale-x-100"
            aria-label={tp.nextWeek}>
            <ChevronRightIcon />
          </Link>
        </div>

        {/* Grille 7 jours */}
        <div className="grid grid-cols-7 gap-1 p-2">
          {weekDays.map((day) => {
            const count      = countByDate[day] ?? 0;
            const isSelected = day === selectedDate;
            const isTodayDay = day === today;

            return (
              <Link
                key={day}
                href={`?date=${day}`}
                className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-colors ${
                  isSelected
                    ? "bg-primary-600 text-white"
                    : isTodayDay
                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span className={`font-medium text-xs uppercase tracking-wide leading-none ${
                  isSelected ? "text-primary-200" : isTodayDay ? "text-primary-500" : "text-slate-500"
                }`}>
                  {dash.dayShort[new Date(day + "T00:00:00").getDay()]}
                </span>
                <span className={`text-base font-bold leading-none tabular-nums ${
                  isSelected ? "text-white" : "text-slate-900"
                }`}>
                  {new Date(day + "T00:00:00").getDate()}
                </span>
                {count > 0 ? (
                  <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold leading-none ${
                    isSelected ? "bg-white/90 text-primary-700" : "bg-primary-600 text-white"
                  }`}>
                    {count}
                  </span>
                ) : (
                  <span className="w-4 h-4" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── En-tête du jour ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`?date=${prevDay}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200 rtl:-scale-x-100"
            aria-label={tp.prevDay}>
            <ChevronLeftIcon />
          </Link>

          <div>
            <h2 className="font-semibold text-slate-900 capitalize text-sm">
              {isToday && <span className="text-primary-600 me-1">{tp.todayUpper} ·</span>}
              {fmtDayFull(selectedDate, dash)}
            </h2>
          </div>

          <Link href={`?date=${nextDay}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200 rtl:-scale-x-100"
            aria-label={tp.nextDay}>
            <ChevronRightIcon />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!isToday && (
            <Link href={`?date=${today}`}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
              {tp.todayLink}
            </Link>
          )}
          <span className={`text-xs font-semibold tabular-nums px-2 py-1 rounded-full ${
            activeCount > 0 ? "bg-primary-50 text-primary-700" : "text-slate-500"
          }`}>
            {activeCount} {tp.rdvSuffix}
          </span>
        </div>
      </div>

      {/* ── Liste du jour ───────────────────────────── */}
      {dayAppts.length === 0 ? (
        <div className="empty-state py-14">
          <CalendarEmptyIcon />
          <p className="text-slate-500 text-sm font-medium">{tp.emptyDay}</p>
          <Link href={`?date=${today}`}
            className="text-xs text-primary-600 hover:underline font-medium">
            {tp.backToToday}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {dayAppts.map((appt) => {
            const status = appt.status as keyof typeof STATUS_STYLE;
            const s = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
            const statusLabel = dash.status[STATUS_KEY[status] ?? "pending"];
            const [th, tm] = appt.time.split(":");
            const timeLabel = fmtTime(appt.time);

            return (
              <div
                key={appt.id}
                className={`card overflow-hidden p-0 flex ${s.dim ? "opacity-60" : ""}`}
              >
                {/* Colonne heure colorée par statut */}
                <div className={`w-[60px] shrink-0 flex flex-col items-center justify-center gap-0 py-5 ${s.col}`}>
                  <span className={`text-[24px] font-black leading-none tabular-nums ${s.colText}`}>
                    {th}
                  </span>
                  <span className={`text-xs font-semibold leading-none ${s.colText} opacity-80`}>
                    h{tm}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex-1 p-4 min-w-0">

                  {/* Ligne 1 : patient + badge */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-slate-900 truncate leading-tight">
                      {appt.patient.name}
                    </p>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${s.badge}`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Téléphone */}
                  {appt.patient.phone && (
                    <a href={`tel:${appt.patient.phone}`}
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mb-1">
                      <PhoneIcon />
                      {appt.patient.phone}
                    </a>
                  )}

                  {/* Motif */}
                  {appt.reason && (
                    <p className="text-xs text-slate-500 italic truncate mb-1">
                      &ldquo;{appt.reason}&rdquo;
                    </p>
                  )}

                  {/* Durée */}
                  <p className="text-xs text-slate-500">
                    {timeLabel} · {doctor.consultationDuration} {dash.minSuffix}
                  </p>

                  {/* Actions */}
                  {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                      <AppointmentActions appointmentId={appt.id} status={appt.status} t={tp} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
