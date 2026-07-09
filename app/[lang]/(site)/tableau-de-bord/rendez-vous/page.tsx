import Link from "next/link";
import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDoctorInitials, casablancaTodayStr } from "@/lib/utils";
import { CancelButton } from "../_components/CancelButton";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Mes rendez-vous — SantéauMaroc" };

type SearchParams = Promise<{ tab?: string }>;
type Dash = Dictionary["dashboard"];

/* ── Helpers ──────────────────────────────────────────────── */

// « Aujourd'hui » à l'heure du Maroc (pas le fuseau serveur).
function localToday(): string {
  return casablancaTodayStr();
}

function parseApptDate(s: string, d: Dash) {
  const dt = new Date(s + "T00:00:00");
  return {
    dayName: d.dayShort[dt.getDay()],
    dayNum:  dt.getDate(),
    month:   d.monthShort[dt.getMonth()],
  };
}

function fmtTime(time: string) {
  const [h, m] = time.split(":");
  return m === "00" ? `${h}h` : `${h}h${m}`;
}

/* ── Status config (couleurs ; libellé via dict) ──────────── */

const STATUS_STYLE = {
  PENDING:   { badge: "bg-amber-50 text-amber-700 border border-amber-200",            dateCol: "bg-amber-400",     dateText: "text-white"     },
  CONFIRMED: { badge: "bg-secondary-50 text-secondary-700 border border-secondary-200", dateCol: "bg-secondary-500", dateText: "text-white"     },
  CANCELLED: { badge: "bg-red-50 text-red-600 border border-red-200",                  dateCol: "bg-slate-100",     dateText: "text-slate-500" },
  COMPLETED: { badge: "bg-slate-100 text-slate-500 border border-slate-200",            dateCol: "bg-slate-100",     dateText: "text-slate-500" },
} as const;

const STATUS_KEY = { PENDING: "pending", CONFIRMED: "confirmed", CANCELLED: "cancelled", COMPLETED: "completed" } as const;

/* ── Icons ────────────────────────────────────────────────── */

function ClockIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-3.5 h-3.5 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="6"/><path d="M7 4v3l2 1.5"/>
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-3 h-3 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1C4.79 1 3 2.79 3 5c0 3.28 4 8 4 8s4-4.72 4-8c0-2.21-1.79-4-4-4z"/>
      <circle cx="7" cy="5" r="1.25"/>
    </svg>
  );
}

/* ── Empty state ──────────────────────────────────────────── */

function EmptyState({ isUpcoming, t }: { isUpcoming: boolean; t: Dash["patient"] }) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="w-9 h-9 text-slate-300" aria-hidden="true">
          <rect x="6" y="8" width="36" height="34" rx="4"/>
          <path d="M6 18h36M16 6v4M32 6v4" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <p className="font-semibold text-slate-700 mb-1">
          {isUpcoming ? t.noUpcoming : t.emptyPast}
        </p>
        {isUpcoming && (
          <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">
            {t.noUpcomingDesc}
          </p>
        )}
      </div>
      {isUpcoming && (
        <Link href="/praticiens" className="btn-primary text-sm px-6 py-2.5">
          {t.findDoctor}
        </Link>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default async function RendezVousPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab = "upcoming" } = await searchParams;
  const { userId } = await verifySession();
  const today = localToday();
  const isUpcoming = tab !== "past";
  const dash = getDictionary(await getLocale()).dashboard;
  const tp = dash.patient;

  const [appointments, counts] = await Promise.all([
    prisma.appointment.findMany({
      where: isUpcoming
        ? { patientId: userId, date: { gte: today }, status: { notIn: ["CANCELLED"] } }
        : { patientId: userId, OR: [{ date: { lt: today } }, { status: { in: ["CANCELLED", "COMPLETED"] } }] },
      orderBy: [
        { date: isUpcoming ? "asc" : "desc" },
        { time: isUpcoming ? "asc" : "desc" },
      ],
      include: {
        doctor: {
          select: {
            id: true, slug: true, civilite: true, prenom: true, nom: true,
            avatar: true, isVerified: true, consultationDuration: true,
            specialty: { select: { name: true } },
            city:      { select: { name: true } },
          },
        },
      },
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { patientId: userId },
      _count: true,
    }),
  ]);

  const upcomingCount = counts
    .filter((c) => c.status === "PENDING" || c.status === "CONFIRMED")
    .reduce((s, c) => s + c._count, 0);
  const pastCount = counts
    .filter((c) => c.status === "CANCELLED" || c.status === "COMPLETED")
    .reduce((s, c) => s + c._count, 0);

  return (
    <div className="flex flex-col gap-5">

      {/* ── En-tête ─────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="section-eyebrow mb-0.5">{tp.eyebrow}</p>
          <h1 className="text-xl font-bold text-slate-900">{tp.apptsTitle}</h1>
        </div>
        <Link href="/praticiens"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold
            text-primary-700 bg-primary-50 border border-primary-200 px-3 py-2 rounded-xl
            hover:bg-primary-100 transition-colors mt-1">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
            className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v10M3 8h10"/>
          </svg>
          {tp.newAppt}
        </Link>
      </header>

      <div className="h-px"
        style={{ background: "linear-gradient(90deg,#bfdbfe 0%,#a7f3d0 60%,transparent 100%)" }} />

      {/* ── Onglets ──────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200">
        {[
          { key: "upcoming", label: tp.tabUpcoming, count: upcomingCount },
          { key: "past",     label: tp.tabPast,     count: pastCount     },
        ].map(({ key, label, count }) => {
          const active = key === (isUpcoming ? "upcoming" : "past");
          return (
            <Link key={key} href={`?tab=${key}`}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium
                border-b-2 -mb-px transition-colors
                ${active
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }
              `}>
              {label}
              {count > 0 && (
                <span className={`text-xs font-bold min-w-[18px] h-[18px] px-1 rounded-full
                  flex items-center justify-center tabular-nums ${
                  active ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Liste ────────────────────────────────────────────── */}
      {appointments.length === 0 ? (
        <EmptyState isUpcoming={isUpcoming} t={tp} />
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((appt, idx) => {
            const doc        = appt.doctor;
            const doctorName = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ");
            const initials   = getDoctorInitials(doc.prenom, doc.nom);
            const status     = appt.status as keyof typeof STATUS_STYLE;
            const cfg        = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
            const statusLabel = dash.status[STATUS_KEY[status] ?? "pending"];
            const { dayName, dayNum, month } = parseApptDate(appt.date, dash);
            const timeLabel  = fmtTime(appt.time);
            const isToday    = appt.date === today;
            const isPast     = appt.date < today || appt.status === "CANCELLED" || appt.status === "COMPLETED";
            const isFirstUpcoming = isUpcoming && idx === 0;

            return (
              <div key={appt.id}>
                {/* Labels contextuels */}
                {isFirstUpcoming && (
                  <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                    <p className="text-xs font-bold uppercase tracking-wider text-secondary-600">
                      {tp.nextAppt}
                    </p>
                  </div>
                )}
                {isToday && !isFirstUpcoming && (
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1.5 px-0.5">
                    {dash.today}
                  </p>
                )}

                {/* Card */}
                <div className="card overflow-hidden p-0 flex">

                  {/* Colonne date */}
                  <div className={`w-[60px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-4 ${cfg.dateCol}`}>
                    <span className={`text-xs font-semibold uppercase tracking-wide leading-none ${cfg.dateText} opacity-75`}>
                      {dayName}
                    </span>
                    <span className={`text-[22px] font-black leading-none tabular-nums ${cfg.dateText}`}>
                      {dayNum}
                    </span>
                    <span className={`text-xs leading-none mt-0.5 ${cfg.dateText} opacity-75`}>
                      {month}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 p-3.5 min-w-0">

                    {/* Ligne 1 : nom + badge */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Avatar micro */}
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {doc.avatar
                            ? <img src={doc.avatar} alt="" className="w-full h-full object-cover" />
                            : <span className="text-primary-700 text-[8px] font-bold">{initials}</span>
                          }
                        </div>
                        <Link href={`/praticiens/${doc.slug}`}
                          className="font-semibold text-sm text-slate-900 hover:text-primary-700 transition-colors truncate leading-tight">
                          {doctorName}
                        </Link>
                        {doc.isVerified && (
                          <span
                            className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #2563eb, #10b981)" }}
                            aria-label={dash.verifiedDoctor}
                            title={dash.verifiedDoctor}
                          >
                            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
                              <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${cfg.badge}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Ligne 2 : spécialité */}
                    <p className="text-xs text-slate-500 mb-1.5">{doc.specialty.name}</p>

                    {/* Ligne 3 : heure + lieu */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 tabular-nums">
                        <ClockIcon />
                        {timeLabel}
                      </span>
                      <span className="text-xs text-slate-500">{doc.consultationDuration} {dash.minSuffix}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <PinIcon />
                        {doc.city.name}
                      </span>
                    </div>

                    {/* Motif */}
                    {appt.reason && (
                      <p className="text-xs text-slate-500 mt-1 italic truncate">{appt.reason}</p>
                    )}

                    {/* Actions */}
                    {!isPast && (
                      <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-100">
                        <CancelButton appointmentId={appt.id} t={tp} />
                        {doc.slug && (
                          <Link
                            href={`/praticiens/${doc.slug}`}
                            className="text-xs text-slate-500 hover:text-primary-600 transition-colors hover:underline"
                          >
                            {tp.seeProfile}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
