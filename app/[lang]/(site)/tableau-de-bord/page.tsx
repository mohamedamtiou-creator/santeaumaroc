import Link from "next/link";
import Image from "next/image";
import { verifySession } from "@/lib/dal";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDoctorInitials, casablancaTodayStr, casablancaNow } from "@/lib/utils";
import { CancelButton } from "./_components/CancelButton";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";

type Dash = Dictionary["dashboard"];

/* ── Helpers ──────────────────────────────────────────────── */

// « Aujourd'hui » à l'heure du Maroc (pas le fuseau serveur).
function localToday(): string {
  return casablancaTodayStr();
}

function parseDate(s: string, d: Dash) {
  const dt = new Date(s + "T00:00:00");
  return { dayName: d.dayShort[dt.getDay()], dayNum: dt.getDate(), month: d.monthShort[dt.getMonth()] };
}

function fmtTime(time: string) {
  const [h, m] = time.split(":");
  return m === "00" ? `${h}h` : `${h}h${m}`;
}

function daysUntil(dateStr: string, today: string, d: Dash): string {
  const diff = Math.round(
    (new Date(dateStr + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86_400_000
  );
  if (diff === 0) return d.today;
  if (diff === 1) return d.tomorrow;
  return d.inDays.replace("{n}", String(diff));
}

function greeting(d: Dash): string {
  const h = casablancaNow().getHours();
  if (h < 12) return d.greetingMorning;
  if (h < 18) return d.greetingAfternoon;
  return d.greetingEvening;
}

const STATUS_STYLE = {
  PENDING:   { badge: "bg-amber-50 text-amber-700 border border-amber-200",           dateCol: "bg-amber-400",     dateText: "text-white"     },
  CONFIRMED: { badge: "bg-secondary-50 text-secondary-700 border border-secondary-200", dateCol: "bg-secondary-500", dateText: "text-white"     },
  CANCELLED: { badge: "bg-red-50 text-red-600 border border-red-200",                 dateCol: "bg-slate-100",     dateText: "text-slate-500" },
  COMPLETED: { badge: "bg-slate-100 text-slate-500 border border-slate-200",           dateCol: "bg-slate-100",     dateText: "text-slate-500" },
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

/* ── Page ─────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const { userId } = await verifySession();
  const today = localToday();
  const dash = getDictionary(await getLocale()).dashboard;
  const tp = dash.patient;

  const [user, upcoming, stats] = await Promise.all([
    getCurrentUser(),
    prisma.appointment.findMany({
      where: {
        patientId: userId,
        date:   { gte: today },
        status: { notIn: ["CANCELLED"] },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 6,
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

  const totalAppts     = stats.reduce((s, c) => s + c._count, 0);
  const pendingCount   = stats.find((s) => s.status === "PENDING")?._count    ?? 0;
  const confirmedCount = stats.find((s) => s.status === "CONFIRMED")?._count  ?? 0;
  const completedCount = stats.find((s) => s.status === "COMPLETED")?._count  ?? 0;

  const next     = upcoming[0] ?? null;
  const rest     = upcoming.slice(1);
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-6">

      {/* ── Salutation ──────────────────────────────────────── */}
      <header>
        <p className="section-eyebrow mb-0.5">{tp.eyebrow}</p>
        <h1 className="text-xl font-bold text-slate-900">
          {greeting(dash)}, <span className="text-primary-700">{firstName}</span>
        </h1>
        <div className="mt-3 h-px"
          style={{ background: "linear-gradient(90deg,#bfdbfe 0%,#a7f3d0 60%,transparent 100%)" }} />
      </header>

      {/* ── Prochain RDV — hero ──────────────────────────────── */}
      {next ? (
        <NextAppointmentHero appt={next} today={today} d={dash} />
      ) : (
        <div className="card p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-6 h-6 text-primary-400" aria-hidden="true"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="14" height="14" rx="2"/>
              <path d="M3 9h14M7 3v2M13 3v2M10 13v-3M8.5 11.5h3"/>
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-start">
            <p className="font-semibold text-slate-800 mb-0.5">{tp.noUpcoming}</p>
            <p className="text-sm text-slate-500">{tp.noUpcomingDesc}</p>
          </div>
          <Link href="/praticiens" className="btn-primary text-sm px-5 py-2.5 shrink-0 whitespace-nowrap">
            {tp.findDoctor}
          </Link>
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: tp.statTotal,     value: totalAppts,     color: "text-slate-700",     bg: "bg-slate-50",      border: "border-slate-100" },
          { label: tp.statPending,   value: pendingCount,   color: "text-amber-700",     bg: "bg-amber-50",      border: "border-amber-100" },
          { label: tp.statConfirmed, value: confirmedCount, color: "text-secondary-700", bg: "bg-secondary-50",  border: "border-secondary-100" },
          { label: tp.statCompleted, value: completedCount, color: "text-primary-700",   bg: "bg-primary-50",    border: "border-primary-100" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${bg} ${border} px-3 py-3.5 flex flex-col items-center`}>
            <span className={`text-2xl font-black tabular-nums leading-none ${color}`}>{value}</span>
            <span className="text-xs text-slate-500 mt-1 font-medium text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Autres RDV à venir ───────────────────────────────── */}
      {rest.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 text-sm">{tp.upcomingTitle}</h2>
            <Link href="/tableau-de-bord/rendez-vous"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
              {tp.seeAll} <span className="inline-block rtl:-scale-x-100">→</span>
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {rest.map((appt) => {
              const doc        = appt.doctor;
              const doctorName = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ");
              const initials   = getDoctorInitials(doc.prenom, doc.nom);
              const status     = (appt.status as keyof typeof STATUS_STYLE);
              const cfg        = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
              const statusLabel = dash.status[STATUS_KEY[status] ?? "pending"];
              const { dayName, dayNum, month } = parseDate(appt.date, dash);
              const timeLabel  = fmtTime(appt.time);

              return (
                <div key={appt.id} className="card overflow-hidden p-0 flex">
                  {/* Colonne date */}
                  <div className={`w-[56px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-3 ${cfg.dateCol}`}>
                    <span className={`text-[9px] font-semibold uppercase tracking-wide leading-none ${cfg.dateText} opacity-75`}>{dayName}</span>
                    <span className={`text-xl font-black leading-none tabular-nums ${cfg.dateText}`}>{dayNum}</span>
                    <span className={`text-[9px] leading-none mt-0.5 ${cfg.dateText} opacity-75`}>{month}</span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 px-3 py-2.5 min-w-0 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {doc.avatar
                        ? <Image src={doc.avatar} alt="" width={28} height={28} className="w-full h-full object-cover" />
                        : <span className="text-primary-700 text-[9px] font-bold">{initials}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/praticiens/${doc.slug}`}
                        className="font-semibold text-sm text-slate-900 hover:text-primary-700 truncate block leading-tight transition-colors">
                        {doctorName}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 tabular-nums">
                          <ClockIcon />{timeLabel}
                        </span>
                        <span className="text-xs text-slate-500">{doc.specialty.name}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${cfg.badge}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── CTA praticiens ───────────────────────────────────── */}
      <Link href="/praticiens"
        className="card p-4 flex items-center justify-between gap-3 group hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-5 h-5 text-primary-600" aria-hidden="true"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="7" r="4"/>
              <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900 group-hover:text-primary-700 transition-colors">
              {tp.findDoctor}
            </p>
            <p className="text-xs text-slate-500">{tp.ctaDesc}</p>
          </div>
        </div>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-all shrink-0 rtl:-scale-x-100"
          aria-hidden="true" strokeLinecap="round">
          <path d="m6 3 5 5-5 5"/>
        </svg>
      </Link>

    </div>
  );
}

/* ── Hero prochain RDV ────────────────────────────────────── */

type ApptWithDoctor = Awaited<ReturnType<typeof prisma.appointment.findFirst>> & {
  doctor: {
    id: string; slug: string | null; civilite: string | null;
    prenom: string | null; nom: string | null; avatar: string | null;
    isVerified: boolean; consultationDuration: number;
    specialty: { name: string }; city: { name: string };
  };
};

function NextAppointmentHero({ appt, today, d }: { appt: NonNullable<ApptWithDoctor>; today: string; d: Dash }) {
  const doc        = appt.doctor;
  const tp         = d.patient;
  const doctorName = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ");
  const initials   = getDoctorInitials(doc.prenom, doc.nom);
  const status     = appt.status as keyof typeof STATUS_STYLE;
  const cfg        = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  const { dayName, dayNum, month } = parseDate(appt.date, d);
  const timeLabel  = fmtTime(appt.time);
  const whenLabel  = daysUntil(appt.date, today, d);
  const isToday    = appt.date === today;

  return (
    <div className="card overflow-hidden p-0">
      {/* Bande dégradé */}
      <div className="h-1.5"
        style={{ background: isToday
          ? "linear-gradient(90deg,#059669 0%,#10b981 100%)"
          : "linear-gradient(90deg,#2563eb 0%,#059669 100%)"
        }} />

      <div className="p-4 sm:p-5">
        {/* Label "Prochain RDV" */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isToday ? "bg-secondary-500 animate-pulse" : "bg-primary-500"}`} />
            <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-secondary-600" : "text-primary-600"}`}>
              {tp.nextAppt}
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isToday
              ? "bg-secondary-500 text-white"
              : "bg-primary-100 text-primary-700"
          }`}>
            {whenLabel}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Bloc date */}
          <div className={`w-16 h-16 rounded-2xl shrink-0 flex flex-col items-center justify-center ${cfg.dateCol}`}>
            <span className={`text-xs font-semibold uppercase tracking-wide leading-none ${cfg.dateText} opacity-75`}>{dayName}</span>
            <span className={`text-2xl font-black leading-none tabular-nums ${cfg.dateText}`}>{dayNum}</span>
            <span className={`text-xs leading-none mt-0.5 ${cfg.dateText} opacity-75`}>{month}</span>
          </div>

          {/* Infos médecin */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-primary-100 overflow-hidden flex items-center justify-center shrink-0">
                {doc.avatar
                  ? <Image src={doc.avatar} alt="" width={28} height={28} className="w-full h-full object-cover" />
                  : <span className="text-primary-700 text-[9px] font-bold">{initials}</span>
                }
              </div>
              <Link href={`/praticiens/${doc.slug}`}
                className="font-bold text-slate-900 hover:text-primary-700 transition-colors truncate text-sm leading-tight">
                {doctorName}
              </Link>
              {doc.isVerified && (
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-secondary-500 shrink-0" aria-label={d.verifiedDoctor}>
                  <circle cx="8" cy="8" r="7" fill="currentColor" opacity=".15"/>
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-2">{doc.specialty.name}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 tabular-nums">
                <ClockIcon />{timeLabel}
              </span>
              <span className="text-xs text-slate-500">{doc.consultationDuration} {d.minSuffix}</span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <PinIcon />{doc.city.name}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4 pt-3.5 border-t border-slate-100">
          <Link href={`/praticiens/${doc.slug}/rdv`}
            className="btn-primary text-xs px-4 py-2">
            {tp.modifyAppt}
          </Link>
          <CancelButton appointmentId={appt.id} t={tp} />
        </div>
      </div>
    </div>
  );
}
