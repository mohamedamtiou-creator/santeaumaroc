import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { prisma } from "@/lib/prisma";
import { tryGetSession } from "@/lib/dal";
import { getDoctorInitials } from "@/lib/utils";
import { getDictionary, toLocale, type Dictionary } from "@/lib/i18n";
import { AddToCalendarButton } from "./_components/AddToCalendarButton";

type Params = Promise<{ lang: string; slug: string }>;
type SearchParams = Promise<{ id?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return {
    // Le suffixe « | SantéauMaroc » est ajouté par le template du layout racine.
    title: getDictionary(toLocale(lang)).rdv.metaTitle,
    robots: { index: false, follow: true },
  };
}

/** Date/heure formatées selon la locale (réutilise les tableaux mois/jours du dict rdv). */
function fmtAppointmentDate(dateStr: string, timeStr: string, t: Dictionary["rdv"], locale: string) {
  const dt       = new Date(dateStr + "T00:00:00");
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const dayName  = t.dayFull[dt.getDay()];
  const dayNum   = dt.getDate();
  const month    = t.monthFull[dt.getMonth()];
  const year     = dt.getFullYear();

  let prefix = "";
  if (dt.toDateString() === today.toDateString())    prefix = t.todayPrefix;
  if (dt.toDateString() === tomorrow.toDateString()) prefix = t.tomorrowPrefix;

  // AR : format 24h « 09:00 » ; FR : « 9h » / « 9h30 ».
  const [h, m] = timeStr.split(":");
  const timeLabel = locale === "ar" ? `${h}:${m}` : (m === "00" ? `${h}h` : `${h}h${m}`);

  return { prefix, dayName, dayNum, month, year, timeLabel };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { lang } = await params;
  const { id } = await searchParams;
  if (!id) notFound();

  const locale = toLocale(lang);
  const t = getDictionary(locale).rdv;

  const session = await tryGetSession();

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: {
        include: {
          specialty: { select: { name: true, slug: true } },
          city:      { select: { name: true } },
        },
      },
    },
  });

  if (!appointment || appointment.patientId !== session?.userId) notFound();

  const doc        = appointment.doctor;
  const doctorName = [doc.civilite, doc.prenom, doc.nom].filter(Boolean).join(" ");
  const initials   = getDoctorInitials(doc.prenom, doc.nom);
  const isConfirmed = appointment.status === "CONFIRMED";
  const { prefix, dayName, dayNum, month, year, timeLabel } =
    fmtAppointmentDate(appointment.date, appointment.time, t, locale);

  return (
    <div className="page-outer max-w-md">

      {/* ── Icône d'état ───────────────────────────────────── */}
      <div className="flex flex-col items-center text-center mb-7">
        <div className="relative mb-5">
          {/* Anneaux de pulse */}
          <span className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
            isConfirmed ? "bg-secondary-100" : "bg-primary-100"
          }`} />
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
            isConfirmed ? "bg-secondary-500 shadow-secondary-200" : "bg-primary-600 shadow-primary-200"
          }`}>
            {isConfirmed ? (
              <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2.5"
                className="w-10 h-10" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 17l7 7 13-14"/>
              </svg>
            ) : (
              <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2.25"
                className="w-9 h-9" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M28 4 14 18M28 4l-9 24-5-10-10-5 24-9z"/>
              </svg>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          {isConfirmed ? t.confirmedTitle : t.pendingTitle}
        </h1>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          {isConfirmed ? t.confirmedEmailSent : t.pendingDesc}
        </p>
      </div>

      {/* ── Bandeau statut « en attente » ──────────────────── */}
      {!isConfirmed && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
          <svg viewBox="0 0 20 20" fill="none" stroke="#d97706" strokeWidth="1.75"
            className="w-4.5 h-4.5 shrink-0 mt-0.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8"/><path d="M10 5.5v4.5l3 2"/>
          </svg>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">{t.pendingBannerBold}</span> {t.pendingBannerText}
          </p>
        </div>
      )}

      {/* ── Hero date / heure ───────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden mb-4"
        style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#0ea5e9 100%)" }}>
        <div className="px-5 pt-5 pb-4 text-white">
          {/* Ligne "Aujourd'hui — " ou vide */}
          {prefix && (
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">
              {prefix}
            </p>
          )}
          <div className="flex items-end gap-3">
            {/* Numéro du jour large */}
            <span className="text-[64px] font-black leading-none tabular-nums text-white" aria-hidden="true">
              {dayNum}
            </span>
            <div className="mb-1">
              <p className="text-lg font-bold capitalize leading-tight">{dayName}</p>
              <p className="text-blue-200 text-sm capitalize">{month} {year}</p>
            </div>
          </div>
        </div>

        {/* Bandeau heure */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 px-5 py-3 flex items-center gap-3">
          <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.75"
            className="w-4.5 h-4.5 opacity-80 shrink-0" aria-hidden="true"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8"/><path d="M10 5.5v4.5l3 2"/>
          </svg>
          <span className="text-white font-bold text-lg tabular-nums">{timeLabel}</span>
          <span className="text-blue-200 text-sm">· {doc.consultationDuration} {t.minSuffix}</span>
        </div>
      </div>

      {/* ── Ajouter à l'agenda (.ics) ───────────────────────── */}
      <div className="mb-4">
        <AddToCalendarButton
          uid={appointment.id}
          title={t.icsTitle.replace("{name}", doctorName)}
          description={appointment.reason ?? t.icsDescription.replace("{name}", doctorName).replace("{specialty}", doc.specialty.name)}
          location={`${doc.adresse}, ${doc.city.name}`}
          date={appointment.date}
          time={appointment.time}
          durationMin={doc.consultationDuration}
          label={t.addToCalendar}
        />
      </div>

      {/* ── Médecin ─────────────────────────────────────────── */}
      <Link
        href={`/praticiens/${doc.slug}`}
        className="card p-4 mb-4 flex items-center gap-4 hover:border-primary-200 transition-colors group block"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="avatar-ring w-12 h-12">
            <div className="avatar-ring-inner">
              {doc.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.avatar} alt={doctorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-700 font-bold text-sm select-none">{initials}</span>
              )}
            </div>
          </div>
          {doc.isVerified && (
            <span className="absolute -bottom-0.5 -end-0.5 w-5 h-5 bg-secondary-500 rounded-full
              border-2 border-white flex items-center justify-center shadow-sm" title={t.verifiedDoctor}>
              <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
                <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors truncate">
              {doctorName}
            </p>
            {doc.isVerified && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full
                bg-secondary-50 text-secondary-700 border border-secondary-200 text-xs font-semibold shrink-0">
                <svg viewBox="0 0 10 10" fill="none" className="w-2 h-2" aria-hidden="true">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t.verifiedShort}
              </span>
            )}
          </div>
          <p className="text-xs text-primary-700 font-medium mt-0.5">{doc.specialty.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
              className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true">
              <path d="M8 1C5.79 1 4 2.79 4 5c0 3.28 4 9 4 9s4-5.72 4-9c0-2.21-1.79-4-4-4z"/>
              <circle cx="8" cy="5" r="1.5"/>
            </svg>
            <bdi>{doc.adresse}, {doc.city.name}</bdi>
          </p>
        </div>

        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className="w-4 h-4 text-slate-300 group-hover:text-primary-400 shrink-0 transition-colors rtl:-scale-x-100" aria-hidden="true">
          <path d="m6 3 5 5-5 5" strokeLinecap="round"/>
        </svg>
      </Link>

      {/* ── Motif ───────────────────────────────────────────── */}
      {appointment.reason && (
        <div className="card p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{t.reason}</p>
          <p className="text-sm text-slate-700 leading-relaxed">{appointment.reason}</p>
        </div>
      )}

      {/* ── Ce qui se passe ensuite ─────────────────────────── */}
      <div className="card p-4 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          {t.whatNext}
        </p>
        <ol className="flex flex-col gap-3">
          {[
            {
              icon: (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4 h-4 text-secondary-600" aria-hidden="true"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
                  <path d="M3 9h14M9 3v14"/>
                </svg>
              ),
              bg: "bg-secondary-50",
              text: isConfirmed ? t.nextStep1 : t.nextStep1Pending,
              done: true,
            },
            {
              icon: isConfirmed ? (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4 h-4 text-primary-600" aria-hidden="true"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2a5 5 0 015 5v3l1.5 2.5h-13L4 10V7a5 5 0 015-5zM8 16a2 2 0 004 0"/>
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4 h-4 text-primary-600" aria-hidden="true"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/>
                </svg>
              ),
              bg: "bg-primary-50",
              text: isConfirmed ? t.nextStep2 : t.nextStep2Pending,
              done: false,
            },
            {
              icon: (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4 h-4 text-amber-600" aria-hidden="true"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="14" height="15" rx="2"/>
                  <path d="M3 8h14M7 2v2M13 2v2"/>
                </svg>
              ),
              bg: "bg-amber-50",
              text: `${t.nextStep3Pre} ${dayNum} ${month} ${t.at} ${timeLabel}.`,
              done: false,
            },
          ].map(({ icon, bg, text, done }, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                {icon}
              </div>
              <p className={`text-sm leading-snug mt-1 ${done ? "text-slate-500" : "text-slate-700"}`}>
                {done && (
                  <span className="inline-flex items-center gap-1 text-secondary-600 font-semibold me-1">
                    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t.done}
                  </span>
                )}
                {text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Link href="/tableau-de-bord"
          className="btn-secondary py-3.5 w-full justify-center text-[15px] font-semibold">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
            className="w-4.5 h-4.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="14" height="15" rx="2"/>
            <path d="M3 8h14M7 2v2M13 2v2M7 12h2M11 12h2M7 15h2"/>
          </svg>
          {t.viewMyAppts}
        </Link>

        <Link href={`/praticiens/${doc.slug}`}
          className="btn-outline py-3 w-full justify-center text-sm">
          {t.backToDoctorProfile}
        </Link>

        <div className="text-center mt-1">
          <Link href="/praticiens"
            className="text-xs text-slate-500 hover:text-slate-600 transition-colors">
            {t.findAnother}
          </Link>
        </div>
      </div>

    </div>
  );
}
