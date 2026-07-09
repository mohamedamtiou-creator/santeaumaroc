import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { casablancaTodayStr, casablancaNow } from "@/lib/utils";
import { AppointmentActions } from "./_components/AppointmentActions";
import { getMyVerificationRequest } from "@/features/praticien/verification-actions";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";

type Dash = Dictionary["dashboard"];

/* ── Status config (couleurs ; libellé via dict) ───────────── */

const STATUS_STYLE = {
  PENDING:   { badge: "bg-amber-50 text-amber-700 border border-amber-200",            dot: "bg-amber-400",      dateCol: "bg-amber-400",     dateText: "text-white"     },
  CONFIRMED: { badge: "bg-secondary-50 text-secondary-700 border border-secondary-200", dot: "bg-secondary-500", dateCol: "bg-secondary-500", dateText: "text-white"     },
  CANCELLED: { badge: "bg-red-50 text-red-600 border border-red-200",                  dot: "bg-slate-300",      dateCol: "bg-slate-100",     dateText: "text-slate-500" },
  COMPLETED: { badge: "bg-slate-100 text-slate-500 border border-slate-200",            dot: "bg-slate-300",     dateCol: "bg-slate-100",     dateText: "text-slate-500" },
} as const;

const STATUS_KEY = { PENDING: "pending", CONFIRMED: "confirmed", CANCELLED: "cancelled", COMPLETED: "completed" } as const;

/* ── Helpers ───────────────────────────────────────────────── */

// « Aujourd'hui » et bornes de semaine à l'heure du Maroc (pas le fuseau serveur).
function localToday(): string {
  return casablancaTodayStr();
}

function localWeekBounds(): { start: string; end: string } {
  const d   = casablancaNow();
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  return { start: fmt(mon), end: fmt(sun) };
}

function greeting(d: Dash): string {
  const h = casablancaNow().getHours();
  if (h < 12) return d.greetingMorning;
  if (h < 18) return d.greetingAfternoon;
  return d.greetingEvening;
}

function daysUntil(dateStr: string, today: string, d: Dash): string {
  const diff = Math.round(
    (new Date(dateStr + "T00:00:00").getTime() - new Date(today + "T00:00:00").getTime()) / 86400000
  );
  if (diff === 1) return d.tomorrow;
  if (diff <= 6) return d.inDays.replace("{n}", String(diff));
  const dt = new Date(dateStr + "T00:00:00");
  return `${d.dayShort[dt.getDay()]} ${dt.getDate()} ${d.monthShort[dt.getMonth()]}`;
}

function parseDate(s: string, d: Dash) {
  const dt = new Date(s + "T00:00:00");
  return { dayName: d.dayShort[dt.getDay()], dayNum: dt.getDate(), month: d.monthShort[dt.getMonth()] };
}

function fmtTodayDate(d: Dash): string {
  const now = casablancaNow();
  return `${d.dayFull[now.getDay()]} ${now.getDate()} ${d.monthFull[now.getMonth()]} ${now.getFullYear()}`;
}

function fmtTime(t: string) {
  const [h, m] = t.split(":");
  return m === "00" ? `${h}h` : `${h}h${m}`;
}

/* ── Icons ─────────────────────────────────────────────────── */

type IconProps = { className?: string };
const ico = (cn?: string) => cn ?? "w-5 h-5";

function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={ico(className)} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 9h14M7 3v2M13 3v2"/>
    </svg>
  );
}
function WeekIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={ico(className)} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 9h14M7 3v2M13 3v2M6 13h2M10 13h2M14 13h.5"/>
    </svg>
  );
}
function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={ico(className)} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 13h.01"/>
    </svg>
  );
}
function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
      className={className ?? "w-3.5 h-3.5"} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6"/>
    </svg>
  );
}
function StarIcon({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={className ?? "w-4 h-4"} aria-hidden="true"
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
      <path d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2 5.06 16.8l.94-5.5-4-3.9 5.53-.8z"
        strokeLinejoin="round"/>
    </svg>
  );
}
function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={ico(className)} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.59 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0z" clipRule="evenodd"/>
    </svg>
  );
}
function EmptyCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      className={ico(className)} aria-hidden="true">
      <circle cx="10" cy="10" r="7.25"/>
    </svg>
  );
}
function Chevron({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      className={`${className ?? "w-4 h-4"} rtl:-scale-x-100`} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5"/>
    </svg>
  );
}
function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className={ico(className)} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a1 1 0 0 1 1-1h2.5l1.3 3.8-1.9 1.4a10 10 0 0 0 4 4l1.4-1.9L16 12.5V15a1 1 0 0 1-1 1A11 11 0 0 1 4 5z"/>
    </svg>
  );
}
function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
      className={ico(className)} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5l1.6 4.3 4.3 1.6-4.3 1.6L10 14.3 8.4 10 4.1 8.4l4.3-1.6z"/><path d="M16 13.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>
    </svg>
  );
}
function ExternalIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
      className={`${className ?? "w-3.5 h-3.5"} rtl:-scale-x-100`} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7.5 8.5"/>
    </svg>
  );
}

/* ── Presentational sub-components ──────────────────────────── */

function StarRow({ rating, className = "w-3.5 h-3.5" }: { rating: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-accent-400" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <StarIcon key={i} className={className + (i < full ? "" : " text-slate-200")} filled />
      ))}
    </span>
  );
}

function KpiCard({
  icon, value, label, sub, tone, href,
}: {
  icon: React.ReactNode; value: React.ReactNode; label: string; sub?: string;
  tone: "primary" | "indigo" | "amber" | "accent"; href: string;
}) {
  const tones = {
    primary: { bar: "from-primary-600 to-primary-400",  chip: "bg-primary-50 text-primary-600",   val: "text-slate-900" },
    indigo:  { bar: "from-indigo-500 to-indigo-300",    chip: "bg-indigo-50 text-indigo-600",      val: "text-slate-900" },
    amber:   { bar: "from-amber-500 to-amber-300",      chip: "bg-amber-50 text-amber-600",        val: "text-amber-700" },
    accent:  { bar: "from-accent-500 to-accent-300",    chip: "bg-accent-50 text-accent-600",      val: "text-slate-900" },
  }[tone];
  return (
    <Link href={href} className="card overflow-hidden p-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-2xl">
      <div className={`h-1 bg-gradient-to-r ${tones.bar}`} />
      <div className="p-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${tones.chip}`}>
          {icon}
        </div>
        <p className={`text-2xl font-black tabular-nums leading-none ${tones.val}`}>{value}</p>
        <p className="text-xs font-semibold text-slate-700 mt-1.5 leading-tight">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 leading-tight">{sub}</p>}
      </div>
    </Link>
  );
}

function SectionCard({
  title, action, children, accent = false,
}: { title?: string; action?: React.ReactNode; children: React.ReactNode; accent?: boolean }) {
  return (
    <section className="card overflow-hidden p-0">
      {accent && <div className="h-1" style={{ background: "linear-gradient(90deg,#2563eb 0%,#059669 100%)" }} />}
      <div className="p-4 sm:p-5">
        {(title || action) && (
          <div className="flex items-center justify-between mb-4 gap-3">
            {title && <h2 className="text-sm font-bold text-slate-900">{title}</h2>}
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default async function PraticienOverviewPage() {
  const { userId } = await verifySession();
  const today = localToday();
  const now = new Date();
  const { start: weekStartStr, end: weekEndStr } = localWeekBounds();

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: {
      id: true, slug: true, nom: true, prenom: true, civilite: true,
      avatar: true, description: true, prix: true, motifs: true,
      isVerified: true, plan: true, featuredUntil: true, trialEndsAt: true,
      averageRating: true, specialtyId: true,
      _count: { select: { reviews: true } },
    },
  });
  if (!doctor) return null;

  const dash = getDictionary(await getLocale()).dashboard;
  const tp = dash.praticien;
  const { id: doctorId } = doctor;
  const firstName = doctor.prenom ?? [doctor.civilite, doctor.nom].filter(Boolean).join(" ");

  const since30d = new Date(now.getTime() - 30 * 86400000);

  const [
    todaySchedule, pendingCount, statsWeek, upcomingAppts, verif, callbackPending,
    completedCount, workingHoursCount, recentReviews, qaToAnswer, phoneClicks30d,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { doctorId, date: today, status: { notIn: ["CANCELLED"] } },
      orderBy: { time: "asc" },
      include: { patient: { select: { name: true } } },
    }),
    prisma.appointment.count({ where: { doctorId, status: "PENDING", date: { gte: today } } }),
    prisma.appointment.count({
      where: { doctorId, date: { gte: weekStartStr, lte: weekEndStr }, status: { notIn: ["CANCELLED"] } },
    }),
    prisma.appointment.findMany({
      where: { doctorId, date: { gt: today }, status: { notIn: ["CANCELLED"] } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 6,
      include: { patient: { select: { name: true, phone: true } } },
    }),
    getMyVerificationRequest(),
    prisma.callbackRequest.count({ where: { doctorId, status: "PENDING" } }),
    prisma.appointment.count({ where: { doctorId, status: "COMPLETED" } }),
    prisma.workingHours.count({ where: { doctorId, isActive: true } }),
    prisma.review.findMany({
      where: { doctorId, isPublic: true, comment: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { id: true, rating: true, comment: true, createdAt: true },
    }),
    doctor.isVerified
      ? prisma.question.count({
          where: { status: "PUBLISHED", specialtyId: doctor.specialtyId, answers: { none: { doctorId } } },
        })
      : Promise.resolve(0),
    prisma.phoneClick.count({ where: { doctorId, createdAt: { gte: since30d } } }),
  ]);

  const verifStatus =
    verif?.isVerified                     ? null          :
    !verif?.isActive                      ? "inactive"    :
    verif?.claim?.status === "PENDING"    ? "pending"     :
    verif?.claim?.status === "REJECTED"   ? "rejected"    :
    verif?.isActive && !verif?.isVerified ? "unverified"  :
    null;

  const todayTotal     = todaySchedule.length;
  const todayConfirmed = todaySchedule.filter(a => a.status === "CONFIRMED").length;

  const heroAppt  = upcomingAppts[0] ?? null;
  const restAppts = upcomingAppts.slice(1);
  const heroLabel  = heroAppt ? daysUntil(heroAppt.date, today, dash) : null;
  const heroTime   = heroAppt ? fmtTime(heroAppt.time) : null;
  const heroStatus = heroAppt ? (STATUS_STYLE[heroAppt.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.PENDING) : null;
  const heroStatusLabel = heroAppt ? dash.status[STATUS_KEY[heroAppt.status as keyof typeof STATUS_KEY] ?? "pending"] : null;

  const reviewsCount = doctor._count.reviews;
  const rating = doctor.averageRating;

  /* Plan / badges */
  const isTrial   = doctor.trialEndsAt   ? new Date(doctor.trialEndsAt)   > now : false;
  const isFeatured = doctor.featuredUntil ? new Date(doctor.featuredUntil) > now : false;
  const planLabel =
    doctor.plan === "PRO"     ? "Pro" :
    doctor.plan === "CABINET" ? "Cabinet" :
    tp.sub.planFree;

  /* Complétude du profil */
  const checks = [
    { ok: !!doctor.avatar,                 label: tp.checkPhoto,    href: "/praticien/tableau-de-bord/profil" },
    { ok: !!(doctor.description && doctor.description.trim().length > 20), label: tp.checkBio, href: "/praticien/tableau-de-bord/profil" },
    { ok: doctor.prix != null,             label: tp.checkPrice,    href: "/praticien/tableau-de-bord/profil" },
    { ok: doctor.motifs.length > 0,        label: tp.checkMotifs,   href: "/praticien/tableau-de-bord/profil" },
    { ok: workingHoursCount > 0,           label: tp.checkHours,    href: "/praticien/tableau-de-bord/horaires" },
    { ok: doctor.isVerified,               label: tp.checkVerified, href: "/praticien/tableau-de-bord/verification" },
  ];
  const doneCount = checks.filter(c => c.ok).length;
  const pct = Math.round((doneCount / checks.length) * 100);

  const publicHref = doctor.slug ? `/praticiens/${doctor.slug}` : "/praticien/tableau-de-bord/profil";
  const hasActions = pendingCount > 0 || callbackPending > 0;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* ── En-tête ───────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="section-eyebrow mb-1">{tp.overviewEyebrow}</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {greeting(dash)}, <span className="text-primary-700">{firstName}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 capitalize">{fmtTodayDate(dash)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Badges formule */}
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-100">
            {planLabel}
          </span>
          {isTrial && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              {tp.sub.trialBadge}
            </span>
          )}
          {isFeatured && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-50 text-accent-700 ring-1 ring-accent-200">
              <SparkIcon className="w-3 h-3" /> {tp.sub.premiumBadge}
            </span>
          )}
          <Link href={publicHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:text-primary-700 transition-colors">
            <ExternalIcon /> <span className="hidden sm:inline">{tp.viewPublic}</span>
          </Link>
        </div>
      </header>

      {/* ── Bannière vérification (unique, prioritaire) ────── */}
      {verifStatus === "inactive" && (
        <VerifBanner href="/praticien/tableau-de-bord/verification" tone="amber"
          title={tp.verifInactiveTitle} desc={tp.verifInactiveDesc} />
      )}
      {verifStatus === "unverified" && (
        <VerifBanner href="/praticien/tableau-de-bord/verification" tone="primary"
          title={tp.verifUnverifiedTitle} desc={tp.verifUnverifiedDesc} />
      )}
      {verifStatus === "pending" && (
        <VerifBanner tone="primary" title={tp.verifPendingTitle} desc={tp.verifPendingDesc} />
      )}
      {verifStatus === "rejected" && (
        <VerifBanner href="/praticien/tableau-de-bord/verification" tone="red"
          title={tp.verifRejectedTitle} desc={tp.verifRejectedDesc} />
      )}

      {/* ── Rangée KPI ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard tone="primary" href={`/praticien/tableau-de-bord/agenda?date=${today}`}
          icon={<CalendarIcon className="w-5 h-5" />} value={todayTotal}
          label={tp.todayUpper} sub={tp.kpiTodayConfirmed.replace("{n}", String(todayConfirmed))} />
        <KpiCard tone="indigo" href="/praticien/tableau-de-bord/agenda"
          icon={<WeekIcon className="w-5 h-5" />} value={statsWeek} label={tp.weekStat} />
        <KpiCard tone="amber" href="/praticien/tableau-de-bord/rendez-vous?tab=pending"
          icon={<AlertIcon className="w-5 h-5" />} value={pendingCount}
          label={tp.pendingStat} sub={tp.kpiPendingLabel} />
        <KpiCard tone="accent" href={publicHref}
          icon={<StarIcon className="w-5 h-5" filled />}
          value={reviewsCount > 0 ? rating.toFixed(1) : "—"}
          label={tp.kpiRatingLabel}
          sub={reviewsCount > 0 ? tp.kpiReviews.replace("{n}", String(reviewsCount)) : undefined} />
      </div>

      {/* ── Grille principale ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* ════ Colonne principale ════ */}
        <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6">

          {/* À traiter */}
          {hasActions ? (
            <SectionCard title={tp.actionTitle} accent
              action={
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold tabular-nums">
                  {pendingCount + callbackPending}
                </span>
              }>
              <div className="flex flex-col gap-2.5">
                {pendingCount > 0 && (
                  <ActionRow href="/praticien/tableau-de-bord/rendez-vous?tab=pending"
                    icon={<AlertIcon className="w-4 h-4 text-white" />}
                    title={tp.pendingAlert.replace("{n}", String(pendingCount))}
                    desc={tp.pendingAlertDesc} />
                )}
                {callbackPending > 0 && (
                  <ActionRow href="/praticien/tableau-de-bord/rappels"
                    icon={<PhoneIcon className="w-4 h-4 text-white" />}
                    title={tp.rappelsAlert.replace("{n}", String(callbackPending))}
                    desc={tp.rappelsAlertDesc} />
                )}
              </div>
            </SectionCard>
          ) : (
            <SectionCard accent>
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center shrink-0">
                  <CheckCircleIcon className="w-5 h-5 text-secondary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{tp.actionAllClear}</p>
                  <p className="text-xs text-slate-500">{tp.actionAllClearDesc}</p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Programme du jour */}
          <SectionCard title={tp.todayProgramTitle}
            action={
              <Link href={`/praticien/tableau-de-bord/agenda?date=${today}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                {tp.seeAgenda} <Chevron className="w-3.5 h-3.5" />
              </Link>
            }>
            {todaySchedule.length === 0 ? (
              <div className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500">{tp.noToday}</p>
              </div>
            ) : (
              <ol className="relative flex flex-col">
                {todaySchedule.slice(0, 6).map((appt, i, arr) => {
                  const s = STATUS_STYLE[appt.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.PENDING;
                  const sLabel = dash.status[STATUS_KEY[appt.status as keyof typeof STATUS_KEY] ?? "pending"];
                  const done = appt.status === "COMPLETED" || appt.status === "CANCELLED";
                  return (
                    <li key={appt.id} className="flex items-stretch gap-3">
                      {/* Rail timeline */}
                      <div className="flex flex-col items-center shrink-0 w-12">
                        <span className={`text-sm font-bold tabular-nums leading-none pt-0.5 ${done ? "text-slate-400" : "text-slate-900"}`}>
                          {fmtTime(appt.time)}
                        </span>
                        <span className={`w-2 h-2 rounded-full mt-2 ${s.dot}`} />
                        {i < arr.length - 1 && <span className="w-px flex-1 bg-slate-100 my-1" />}
                      </div>
                      {/* Contenu */}
                      <div className={`flex-1 min-w-0 flex items-center justify-between gap-2 ${i === arr.length - 1 ? "pb-0.5" : "pb-4"}`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <UserIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          <p className={`text-sm truncate ${done ? "text-slate-400" : "text-slate-800 font-medium"}`}>
                            {appt.patient.name}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${s.badge}`}>{sLabel}</span>
                      </div>
                    </li>
                  );
                })}
                {todaySchedule.length > 6 && (
                  <li className="text-xs text-slate-500 text-center pt-1">
                    {tp.moreOthers.replace("{n}", String(todaySchedule.length - 6))}
                  </li>
                )}
              </ol>
            )}
          </SectionCard>

          {/* Prochain patient + à venir */}
          {heroAppt && heroStatus && heroTime ? (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">{tp.upcomingTitle}</h2>
                <Link href="/praticien/tableau-de-bord/agenda"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                  {tp.seeAgenda} <Chevron className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Héro */}
              <div className="rounded-2xl overflow-hidden shadow-sm"
                style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#0ea5e9 100%)" }}>
                <div className="px-5 pt-5 pb-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">
                    {tp.nextPatient} · {heroLabel} · {heroTime}
                  </p>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-white/60 shrink-0" />
                        <p className="text-xl font-black text-white leading-tight truncate">{heroAppt.patient.name}</p>
                      </div>
                      {heroAppt.reason && (
                        <p className="text-sm mt-1.5 italic leading-snug text-blue-100">&ldquo;{heroAppt.reason}&rdquo;</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-900/30 text-white">
                      {heroStatusLabel}
                    </span>
                  </div>
                </div>
                <div className="bg-white border-t border-slate-100 px-5 py-3">
                  <AppointmentActions appointmentId={heroAppt.id} status={heroAppt.status} t={tp} />
                </div>
              </div>

              {/* Liste compacte */}
              {restAppts.length > 0 && (
                <div className="flex flex-col gap-2">
                  {restAppts.map((appt) => {
                    const s = STATUS_STYLE[appt.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.PENDING;
                    const { dayName, dayNum, month } = parseDate(appt.date, dash);
                    return (
                      <div key={appt.id} className="card overflow-hidden p-0 flex">
                        <div className={`w-[58px] shrink-0 flex flex-col items-center justify-center gap-0.5 py-3.5 ${s.dateCol}`}>
                          <span className={`text-[11px] font-semibold uppercase tracking-wide leading-none opacity-80 ${s.dateText}`}>{dayName}</span>
                          <span className={`text-xl font-black leading-none tabular-nums ${s.dateText}`}>{dayNum}</span>
                          <span className={`text-[11px] leading-none opacity-80 ${s.dateText}`}>{month}</span>
                        </div>
                        <div className="flex-1 p-3 min-w-0 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <p className="font-semibold text-sm text-slate-900 truncate">{appt.patient.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-primary-700 tabular-nums">{fmtTime(appt.time)}</span>
                              {appt.reason && <span className="text-xs text-slate-500 italic truncate">{appt.reason}</span>}
                            </div>
                          </div>
                          <AppointmentActions appointmentId={appt.id} status={appt.status} t={tp} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : todayTotal === 0 ? (
            <div className="empty-state py-10">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-primary-300" />
              </div>
              <p className="text-slate-600 text-sm font-medium">{tp.emptyTitle}</p>
              <Link href="/praticien/tableau-de-bord/horaires" className="text-xs text-primary-600 hover:underline font-medium">
                {tp.configHours} <span className="inline-block rtl:-scale-x-100">→</span>
              </Link>
            </div>
          ) : null}
        </div>

        {/* ════ Colonne secondaire ════ */}
        <aside className="flex flex-col gap-5 sm:gap-6">

          {/* Réputation */}
          <SectionCard title={tp.reputationTitle} accent
            action={doctor.slug ? (
              <Link href={`${publicHref}#avis`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                {tp.reputationSeeAll} <Chevron className="w-3.5 h-3.5" />
              </Link>
            ) : undefined}>
            {reviewsCount > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900 tabular-nums leading-none">{rating.toFixed(1)}</span>
                  <div className="flex flex-col gap-0.5 pb-0.5">
                    <StarRow rating={rating} />
                    <span className="text-xs text-slate-500">{tp.reputationReviews.replace("{n}", String(reviewsCount))}</span>
                  </div>
                </div>
                {completedCount > 0 && (
                  <p className="text-xs text-slate-500">{tp.reputationConsults.replace("{n}", String(completedCount))}</p>
                )}
                {recentReviews.length > 0 && (
                  <div className="flex flex-col gap-2.5 pt-1 border-t border-slate-100">
                    {recentReviews.map((r) => (
                      <div key={r.id} className="pt-2.5">
                        <StarRow rating={r.rating} className="w-3 h-3" />
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed" dir="auto">&ldquo;{r.comment}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                  <StarIcon className="w-5 h-5 text-accent-300" filled />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{tp.reputationEmpty}</p>
              </div>
            )}
          </SectionCard>

          {/* Contacts entrants — clics sur le numéro depuis la fiche publique */}
          <SectionCard title={tp.contactsTitle} accent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <PhoneIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex items-end gap-2 min-w-0">
                <span className="text-3xl font-black text-slate-900 tabular-nums leading-none">{phoneClicks30d}</span>
                <div className="flex flex-col gap-0.5 pb-0.5 min-w-0">
                  <span className="text-xs font-semibold text-slate-700 leading-tight">{tp.contactsPhoneLabel}</span>
                  <span className="text-xs text-slate-500 leading-tight">{tp.contactsPhoneSub}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">{tp.contactsHint}</p>
          </SectionCard>

          {/* Force du profil */}
          <SectionCard title={tp.strengthTitle} accent>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">{pct === 100 ? tp.strengthComplete : `${doneCount}/${checks.length}`}</span>
                  <span className="text-sm font-black tabular-nums text-slate-900">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"
                  role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: pct === 100 ? "#059669" : "linear-gradient(90deg,#2563eb,#059669)" }} />
                </div>
              </div>
            </div>
            {pct < 100 && <p className="text-xs text-slate-500 mb-3 leading-relaxed">{tp.strengthDesc}</p>}
            <ul className="flex flex-col gap-1.5">
              {checks.map((c) => (
                <li key={c.label}>
                  <Link href={c.href}
                    className={`flex items-center gap-2 text-xs rounded-lg -mx-1 px-1 py-1 transition-colors ${c.ok ? "text-slate-400" : "text-slate-700 hover:text-primary-700"}`}>
                    {c.ok
                      ? <CheckCircleIcon className="w-4 h-4 text-secondary-500 shrink-0" />
                      : <EmptyCircleIcon className="w-4 h-4 text-slate-300 shrink-0" />}
                    <span className={c.ok ? "line-through decoration-slate-300" : "font-medium"}>{c.label}</span>
                    {!c.ok && <Chevron className="w-3 h-3 text-slate-300 ms-auto" />}
                  </Link>
                </li>
              ))}
            </ul>
            {pct < 100 && (
              <Link href="/praticien/tableau-de-bord/profil"
                className="btn-primary w-full mt-4 text-sm py-2.5">
                {tp.strengthCta}
              </Link>
            )}
          </SectionCard>

          {/* Q/R — opportunité visibilité */}
          {qaToAnswer > 0 && (
            <section className="card overflow-hidden p-0">
              <div className="h-1" style={{ background: "linear-gradient(90deg,#059669,#34d399)" }} />
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-secondary-50 flex items-center justify-center shrink-0">
                    <SparkIcon className="w-4 h-4 text-secondary-600" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">{tp.qaTitle}</h2>
                </div>
                <p className="text-sm font-semibold text-slate-800">{tp.qaCount.replace("{n}", String(qaToAnswer))}</p>
                <p className="text-xs text-slate-500 mt-1 mb-3 leading-relaxed">{tp.qaDesc}</p>
                <Link href="/praticien/tableau-de-bord/reponses" className="btn-secondary w-full text-sm py-2.5">
                  {tp.qaCta}
                </Link>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ── Local components (server) ─────────────────────────────── */

function ActionRow({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href}
      className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors">
      <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">{title}</p>
        <p className="text-xs text-amber-700">{desc}</p>
      </div>
      <Chevron className="w-4 h-4 text-amber-500 shrink-0" />
    </Link>
  );
}

function VerifBanner({
  href, tone, title, desc,
}: { href?: string; tone: "amber" | "primary" | "red"; title: string; desc: string }) {
  const tones = {
    amber:   { wrap: "border-amber-200 bg-amber-50",     hover: "hover:bg-amber-100",     dot: "bg-amber-400",   tTitle: "text-amber-900",   tDesc: "text-amber-700",   chev: "text-amber-500" },
    primary: { wrap: "border-primary-200 bg-primary-50", hover: "hover:bg-primary-100",   dot: "bg-primary-600", tTitle: "text-primary-900", tDesc: "text-primary-700", chev: "text-primary-400" },
    red:     { wrap: "border-red-200 bg-red-50",         hover: "hover:bg-red-100",       dot: "bg-red-500",     tTitle: "text-red-900",     tDesc: "text-red-700",     chev: "text-red-400" },
  }[tone];

  const inner = (
    <>
      <div className={`w-8 h-8 rounded-full ${tones.dot} flex items-center justify-center shrink-0`}>
        <AlertIcon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${tones.tTitle}`}>{title}</p>
        <p className={`text-xs ${tones.tDesc} truncate`}>{desc}</p>
      </div>
      {href && <Chevron className={`w-4 h-4 ${tones.chev} shrink-0`} />}
    </>
  );

  return href ? (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${tones.wrap} ${tones.hover} transition-colors`}>
      {inner}
    </Link>
  ) : (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${tones.wrap}`}>{inner}</div>
  );
}
