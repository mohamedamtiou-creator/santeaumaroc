import type { Metadata } from "next";
import Link from "next/link";
import { getMyVerificationRequest } from "@/features/praticien/verification-actions";
import { VerificationForm } from "./_components/VerificationForm";
import { DashHeader, CardAccent } from "../_components/DashHeader";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary, type Dictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Vérification du profil — SantéauMaroc" };

function fmtDate(d: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-MA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
}

function logLabel(action: string, t: Dictionary["dashboard"]["praticien"]): string {
  switch (action) {
    case "SUBMITTED":         return t.logSubmitted;
    case "DOCUMENTS_UPDATED": return t.logUpdated;
    case "APPROVED":          return t.logApproved;
    case "REJECTED":          return t.logRejected;
    case "REVOKED":           return t.logRevoked;
    default:                  return action;
  }
}

/* ── Stepper ─────────────────────────────────────────────── */
type StepStatus = "done" | "current" | "error" | "pending";

function StepItem({
  num, label, sublabel, status, isLast,
}: {
  num: number; label: string; sublabel?: string;
  status: StepStatus; isLast?: boolean;
}) {
  const iconCls =
    status === "done"    ? "bg-secondary-500 border-secondary-500 text-white" :
    status === "current" ? "bg-primary-600 border-primary-600 text-white" :
    status === "error"   ? "bg-red-500 border-red-500 text-white" :
                           "bg-white border-slate-200 text-slate-500";
  const labelCls =
    status === "done"    ? "text-secondary-700 font-semibold" :
    status === "current" ? "text-primary-700 font-semibold" :
    status === "error"   ? "text-red-600 font-semibold" :
                           "text-slate-500";

  return (
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${iconCls}`}>
          {status === "done" ? (
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 6l3 3 5-5"/>
            </svg>
          ) : status === "error" ? (
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 2l8 8M10 2L2 10"/>
            </svg>
          ) : num}
        </div>
        {!isLast && <div className="w-px flex-1 min-h-[24px] bg-slate-200 mt-1" aria-hidden="true" />}
      </div>
      <div className="pb-6 flex-1 min-w-0">
        <p className={`text-sm ${labelCls}`}>{label}</p>
        {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export default async function VerificationPage() {
  const locale = await getLocale();
  const tp = getDictionary(locale).dashboard.praticien;
  const data = await getMyVerificationRequest();
  const isVerified = data?.isVerified ?? false;
  const isActive   = data?.isActive   ?? false;
  const claim      = data?.claim      ?? null;
  const logs       = data?.logs       ?? [];

  /* ── Compute step statuses ── */
  const step1: StepStatus = "done"; // inscription always done

  const step2: StepStatus =
    isActive ? "done" : "current"; // admin activates

  const step3: StepStatus =
    isVerified                        ? "done"    :
    !isActive                         ? "pending" :
    claim?.status === "PENDING"       ? "current" :
    claim?.status === "REJECTED"      ? "error"   :
    "pending";

  /* ── Sublabels for stepper ── */
  const step2Sub = isActive ? tp.step2SubActive : tp.step2SubInactive;

  const step3Sub =
    isVerified                   ? tp.step3SubVerified :
    !isActive                    ? tp.step3SubInactive :
    claim?.status === "PENDING"  ? tp.step3SubPending :
    claim?.status === "REJECTED" ? tp.step3SubRejected :
    tp.step3SubDefault;

  const canSubmit = isActive && !isVerified && claim?.status !== "PENDING";

  const BENEFITS = [tp.benefit1, tp.benefit2, tp.benefit3, tp.benefit4];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <DashHeader eyebrow={tp.overviewEyebrow} title={tp.verifTitle} />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── Colonne principale ── */}
        <div className="flex flex-col gap-5">

          {/* Stepper card */}
          <div className="card overflow-hidden p-5 sm:p-6">
            <CardAccent />
            <h2 className="font-semibold text-slate-900 mb-5">{tp.stepsTitle}</h2>
            <div className="flex flex-col">
              <StepItem num={1} label={tp.step1} sublabel={tp.step1Sub} status={step1} />
              <StepItem num={2} label={tp.step2} status={step2} sublabel={step2Sub} />
              <StepItem num={3} label={tp.step3} status={step3} sublabel={step3Sub} isLast />
            </div>
          </div>

          {/* État courant — message contextuel */}
          {!isActive && (
            <div className="card p-5 border border-amber-200 bg-amber-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2"
                    className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="10" cy="10" r="8"/><path d="M10 6v5M10 14h.01"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">{tp.inactiveCardTitle}</p>
                  <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                    {tp.inactiveCardDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isActive && isVerified && (
            <div className="card p-5 border border-secondary-200 bg-secondary-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary-500 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5"
                    className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="10" cy="10" r="8"/><path d="M6.5 10l2.5 2.5L13.5 7"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-secondary-900 text-lg">{tp.verifiedCardTitle}</p>
                  <p className="text-sm text-secondary-700 mt-1 leading-relaxed">
                    {tp.verifiedCardDesc}
                  </p>
                  <Link href="/praticien/tableau-de-bord/profil"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-secondary-700 hover:text-secondary-800 hover:underline">
                    {tp.viewPublic} <span className="rtl:-scale-x-100">→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isActive && !isVerified && claim?.status === "PENDING" && (
            <div className="card p-5 border border-primary-200 bg-primary-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2"
                    className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 2"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-primary-900">{tp.pendingCardTitle}</p>
                  <p className="text-sm text-primary-800 mt-1 leading-relaxed">
                    {tp.pendingCardDesc}
                  </p>
                  {claim?.updatedAt && (
                    <p className="text-xs text-primary-600 mt-2">{tp.submittedOn} {fmtDate(claim.updatedAt, locale)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isActive && !isVerified && claim?.status === "REJECTED" && (
            <div className="card p-5 border border-red-200 bg-red-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5"
                    className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 5l10 10M15 5L5 15"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">{tp.rejectedCardTitle}</p>
                  {claim.adminNote && (
                    <div className="mt-2 bg-white rounded-lg px-3 py-2.5 border border-red-100">
                      <p className="text-xs font-semibold text-red-700 mb-1">{tp.rejectedReason}</p>
                      <p className="text-sm text-slate-700">{claim.adminNote}</p>
                    </div>
                  )}
                  <p className="text-sm text-red-800 mt-2">
                    {tp.rejectedCanResubmit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form — only when active + not verified + not pending */}
          {canSubmit && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                    className="w-4 h-4 text-primary-600" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 3h8l4 4v11H5V3z M13 3v4h4M7 11h6M7 14h4"/>
                  </svg>
                </div>
                <h2 className="font-semibold text-slate-900">
                  {claim?.status === "REJECTED" ? tp.formTitleResubmit : tp.formTitleNew}
                </h2>
              </div>
              <VerificationForm t={tp} />
            </div>
          )}
        </div>

        {/* ── Colonne droite ── */}
        <div className="flex flex-col gap-5">

          {/* Visibility status */}
          <div className={`card p-5 border ${isActive ? "border-primary-200 bg-primary-50/60" : "border-slate-200"}`}>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                className="w-4 h-4 text-primary-500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 10s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7z"/>
                <circle cx="10" cy="10" r="3"/>
              </svg>
              {tp.visibilityTitle}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-primary-500" : "bg-slate-300"}`} aria-hidden="true" />
              <p className="text-sm font-medium text-slate-700">
                {isActive ? tp.visibilityActive : tp.visibilityInactive}
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isActive ? tp.visibilityActiveDesc : tp.visibilityInactiveDesc}
            </p>
          </div>

          {/* Benefits — when not verified */}
          {!isVerified && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                  className="w-4 h-4 text-secondary-500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="10" cy="10" r="8"/><path d="M7 10l2.5 2.5L13 7"/>
                </svg>
                {tp.benefitsTitle}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"
                      className="w-3 h-3 text-secondary-500 mt-0.5 shrink-0" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 6l3 3 5-5"/>
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* History */}
          {logs.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm">{tp.historyTitle}</h3>
              <div className="relative">
                <div className="absolute start-3 top-1 bottom-1 w-px bg-slate-100" aria-hidden="true" />
                <div className="flex flex-col gap-4">
                  {logs.map((log, i) => (
                    <div key={i} className="ps-8 relative">
                      <div className={`absolute start-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        log.action === "APPROVED" ? "bg-secondary-100"
                        : log.action === "REJECTED" || log.action === "REVOKED" ? "bg-red-100"
                        : "bg-primary-100"
                      }`}>
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"
                          className={`w-3 h-3 ${
                            log.action === "APPROVED" ? "text-secondary-600"
                            : log.action === "REJECTED" || log.action === "REVOKED" ? "text-red-500"
                            : "text-primary-600"
                          }`} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          {log.action === "APPROVED"
                            ? <path d="M2 6l3 3 5-5"/>
                            : log.action === "REJECTED" || log.action === "REVOKED"
                            ? <path d="M2 2l8 8M10 2L2 10"/>
                            : <path d="M6 2v5M6 9h.01"/>
                          }
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-slate-700">{logLabel(log.action, tp)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{fmtDate(log.createdAt, locale)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
