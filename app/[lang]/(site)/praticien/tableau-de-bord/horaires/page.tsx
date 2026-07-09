import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { WorkingHoursForm } from "./_components/WorkingHoursForm";
import { AbsenceManager } from "./_components/AbsenceManager";
import { BookingRulesForm } from "./_components/BookingRulesForm";
import { DashHeader, CardAccent } from "../_components/DashHeader";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
import { casablancaTodayStr } from "@/lib/utils";

export const metadata: Metadata = { title: "Configuration agenda — SantéauMaroc" };

export default async function HorairesPage() {
  const { userId } = await verifySession();

  const today = casablancaTodayStr();

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: {
      id:                   true,
      consultationDuration: true,
      bookingLeadHours:     true,
      bookingMaxDays:       true,
      workingHours: { orderBy: { dayOfWeek: "asc" } },
      absences: {
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!doctor) return null;

  const dash = getDictionary(await getLocale()).dashboard;
  const tp = dash.praticien;

  const absences = doctor.absences.map((a) => ({
    id:        a.id,
    type:      a.type,
    startDate: a.startDate,
    endDate:   a.endDate,
    allDay:    a.allDay,
    startTime: a.startTime,
    endTime:   a.endTime,
    reason:    a.reason,
  }));

  // Sort: upcoming first, then past most-recent-first
  const upcoming = absences.filter((a) => a.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past     = absences.filter((a) => a.endDate < today).sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 5);
  const sortedAbsences = [...upcoming, ...past];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">

      {/* ── En-tête ──────────────────────────────── */}
      <DashHeader eyebrow={tp.overviewEyebrow} title={tp.horairesTitle} subtitle={tp.horairesSubtitle} />

      {/* ── Section 1 : Jours & horaires ─────────── */}
      <section className="card overflow-hidden p-5 sm:p-6">
        <CardAccent />
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-secondary-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4.5 h-4.5 text-secondary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{tp.hSec1Title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{tp.hSec1Desc}</p>
          </div>
        </div>
        <WorkingHoursForm workingHours={doctor.workingHours} t={dash} />
      </section>

      {/* ── Section 2 : Absences & congés ────────── */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4.5 h-4.5 text-amber-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="14" height="14" rx="2"/>
              <path d="M3 9h14M7 3v2M13 3v2M7.5 13.5l1.5 1.5 3-3"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{tp.hSec2Title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{tp.hSec2Desc}</p>
          </div>
        </div>
        <AbsenceManager absences={sortedAbsences} t={tp} />
      </section>

      {/* ── Section 3 : Durée & règles ───────────── */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-4.5 h-4.5 text-primary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 3v14M3 10h14M5.5 5.5l9 9M14.5 5.5l-9 9"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{tp.hSec3Title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{tp.hSec3Desc}</p>
          </div>
        </div>
        <BookingRulesForm
          consultationDuration={doctor.consultationDuration}
          bookingLeadHours={doctor.bookingLeadHours}
          bookingMaxDays={doctor.bookingMaxDays}
          t={tp}
        />
      </section>

      {/* ── Note info ─────────────────────────────── */}
      <div className="card p-4 bg-primary-50 border-primary-200 flex items-start gap-3">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
          className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6.5h.01"/>
        </svg>
        <p className="text-sm text-primary-800">
          {tp.horairesNote}
        </p>
      </div>
    </div>
  );
}
