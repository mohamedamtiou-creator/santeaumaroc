import type { Metadata } from "next";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppointmentActions } from "../_components/AppointmentActions";
import { DashHeader } from "../_components/DashHeader";
import { Pagination } from "@/components/ui/Pagination";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { casablancaTodayStr } from "@/lib/utils";

export const metadata: Metadata = { title: "Rendez-vous — SantéauMaroc" };

type SearchParams = Promise<{ tab?: string; page?: string }>;
type Dash = Dictionary["dashboard"];

/* ── Tabs ──────────────────────────────────────────────── */

const TABS = [
  { key: "pending",   labelKey: "tabPending"   as const, status: "PENDING"   },
  { key: "confirmed", labelKey: "tabConfirmed" as const, status: "CONFIRMED" },
  { key: "past",      labelKey: "tabPast"      as const, status: null        },
  { key: "cancelled", labelKey: "tabCancelled" as const, status: "CANCELLED" },
];

const PAGE_SIZE = 20;

/* ── Status config (couleurs ; libellé via dict) ───────── */

const STATUS_STYLE = {
  PENDING:   { badge: "bg-amber-50 text-amber-700 border border-amber-200",            dateCol: "bg-amber-400",      dateText: "text-white"     },
  CONFIRMED: { badge: "bg-secondary-50 text-secondary-700 border border-secondary-200", dateCol: "bg-secondary-500", dateText: "text-white"     },
  CANCELLED: { badge: "bg-red-50 text-red-600 border border-red-200",                  dateCol: "bg-red-100",        dateText: "text-red-500"   },
  COMPLETED: { badge: "bg-slate-100 text-slate-500 border border-slate-200",            dateCol: "bg-slate-100",      dateText: "text-slate-500" },
} as const;

const STATUS_KEY = { PENDING: "pending", CONFIRMED: "confirmed", CANCELLED: "cancelled", COMPLETED: "completed" } as const;

/* ── Helpers ───────────────────────────────────────────── */

// « Aujourd'hui » à l'heure du Maroc (pas le fuseau serveur).
function localToday(): string {
  return casablancaTodayStr();
}

function parseDate(s: string, d: Dash) {
  const dt = new Date(s + "T00:00:00");
  return { dayName: d.dayShort[dt.getDay()], dayNum: dt.getDate(), month: d.monthShort[dt.getMonth()] };
}

function fmtTime(t: string) {
  const [h, m] = t.split(":");
  return m === "00" ? `${h}h` : `${h}h${m}`;
}

/* ── Icons ─────────────────────────────────────────────── */

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-3 h-3 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3a1.333 1.333 0 0 1 1.333-1.333H4.8a.667.667 0 0 1 .645.505l.534 2.133a.667.667 0 0 1-.179.651L4.6 6.1a8.4 8.4 0 0 0 5.3 5.3l1.144-1.2a.667.667 0 0 1 .651-.179l2.133.534A.667.667 0 0 1 14.333 11.2v1.467A1.333 1.333 0 0 1 13 14h-.333C6.28 14 2 9.72 2 3.333V3z"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-3 h-3 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="6"/><path d="M7 4v3l2 1.5"/>
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default async function RendezVousPage({ searchParams }: { searchParams: SearchParams }) {
  const { tab = "pending", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const { userId } = await verifySession();
  const today = localToday();
  const dict = getDictionary(await getLocale());
  const dash = dict.dashboard;
  const tp = dash.praticien;

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true, consultationDuration: true },
  });
  if (!doctor) return null;

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  const where =
    activeTab.key === "past"
      ? {
          doctorId: doctor.id,
          OR: [
            { date: { lt: today }, status: { notIn: ["CANCELLED"] } },
            { status: "COMPLETED" },
          ],
        }
      : {
          doctorId: doctor.id,
          status: activeTab.status!,
          ...(activeTab.key !== "cancelled" ? { date: { gte: today } } : {}),
        };

  const [appointments, total, tabCounts] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: [
        { date: activeTab.key === "past" ? "desc" : "asc" },
        { time: activeTab.key === "past" ? "desc" : "asc" },
      ],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { patient: { select: { name: true, email: true, phone: true } } },
    }),
    prisma.appointment.count({ where }),
    Promise.all(
      TABS.map(async (t) => {
        const w =
          t.key === "past"
            ? {
                doctorId: doctor.id,
                OR: [
                  { date: { lt: today }, status: { notIn: ["CANCELLED"] } },
                  { status: "COMPLETED" },
                ],
              }
            : {
                doctorId: doctor.id,
                status: t.status!,
                ...(t.key !== "cancelled" ? { date: { gte: today } } : {}),
              };
        return { key: t.key, count: await prisma.appointment.count({ where: w }) };
      })
    ),
  ]);

  const counts     = Object.fromEntries(tabCounts.map((c) => [c.key, c.count]));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const ps = new URLSearchParams({ tab });
    if (p > 1) ps.set("page", String(p));
    return `/praticien/tableau-de-bord/rendez-vous?${ps}`;
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* ── En-tête ─────────────────────────────────── */}
      <DashHeader eyebrow={tp.overviewEyebrow} title={tp.rdvTitle} />

      {/* ── Onglets ─────────────────────────────────── */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
        {TABS.map((t) => {
          const isActive = activeTab.key === t.key;
          const count    = counts[t.key] ?? 0;
          return (
            <Link
              key={t.key}
              href={`?tab=${t.key}`}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isActive
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tp[t.labelKey]}
              {count > 0 && (
                <span className={`text-xs font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center tabular-nums ${
                  isActive ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Liste ───────────────────────────────────── */}
      {appointments.length === 0 ? (
        <div className="empty-state py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-8 h-8 text-slate-300" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="12" height="15" rx="2"/>
              <path d="M7 7h6M7 10.5h6M7 14h4"/>
            </svg>
          </div>
          <p className="text-slate-600 text-sm font-medium">{tp.emptyTab}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {appointments.map((appt) => {
            const status    = appt.status as keyof typeof STATUS_STYLE;
            const cfg       = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
            const statusLabel = dash.status[STATUS_KEY[status] ?? "pending"];
            const { dayName, dayNum, month } = parseDate(appt.date, dash);
            const timeLabel = fmtTime(appt.time);
            const isToday   = appt.date === today;
            const isPast    = appt.date < today || appt.status === "CANCELLED" || appt.status === "COMPLETED";
            const showActions = !isPast || appt.status === "PENDING" || appt.status === "CONFIRMED";

            return (
              <div key={appt.id} className="card overflow-hidden p-0 flex">

                {/* Colonne date colorée par statut */}
                <div className={`w-[60px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-4 ${cfg.dateCol}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wide leading-none opacity-75 ${cfg.dateText}`}>
                    {dayName}
                  </span>
                  <span className={`text-[22px] font-black leading-none tabular-nums ${cfg.dateText}`}>
                    {dayNum}
                  </span>
                  <span className={`text-xs leading-none mt-0.5 opacity-75 ${cfg.dateText}`}>
                    {month}
                  </span>
                </div>

                {/* Contenu */}
                <div className={`flex-1 p-3.5 min-w-0 ${isToday ? "bg-primary-50/30" : ""}`}>

                  {/* Ligne 1 : patient + badge */}
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="font-semibold text-sm text-slate-900 truncate leading-tight">
                      {appt.patient.name}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isToday && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-semibold border border-primary-200">
                          {tp.todayBadge}
                        </span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Ligne 2 : téléphone */}
                  {appt.patient.phone && (
                    <a href={`tel:${appt.patient.phone}`}
                      className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mb-1">
                      <PhoneIcon />
                      {appt.patient.phone}
                    </a>
                  )}

                  {/* Motif */}
                  {appt.reason && (
                    <p className="text-xs text-slate-500 italic truncate mb-1">{appt.reason}</p>
                  )}

                  {/* Heure + durée */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 tabular-nums">
                      <ClockIcon />
                      {timeLabel}
                    </span>
                    <span className="text-xs text-slate-500">
                      {doctor.consultationDuration} {dash.minSuffix}
                    </span>
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <AppointmentActions appointmentId={appt.id} status={appt.status} t={tp} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildUrl={buildUrl} t={dict.pagination} />
    </div>
  );
}
