import { getContributorUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { toLocale } from "@/lib/i18n";
import { espaceContent } from "@/lib/espace-content";
import { isVerifiedAuthor, requiredLicenseKinds, professionLabel, AUTHOR_STATUS } from "@/lib/contributor";
import { LicenseForm } from "@/components/contributor/LicenseForm";
import { OnboardingSteps } from "@/components/contributor/OnboardingSteps";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5l6 2v4.5c0 4-2.7 6.7-6 8-3.3-1.3-6-4-6-8V4.5l6-2z" /><path d="M7.5 10l1.8 1.8L13 8" />
    </svg>
  );
}

export default async function VerificationPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = toLocale((await params).lang);
  const c = espaceContent(locale);
  const t = c.verification;
  const user = await getContributorUser();
  const licenses = await prisma.medicalLicense.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, kind: true, status: true, documentName: true, adminNote: true, createdAt: true, ordreNumber: true },
  });
  const verified = isVerifiedAuthor(user.authorStatus);
  const pending = user.authorStatus === AUTHOR_STATUS.PENDING;
  const required = requiredLicenseKinds(user.professionKind);
  const lastRejected = licenses.find((l) => l.status === "REJECTED");

  return (
    <div className="space-y-6">
      <OnboardingSteps current={verified ? 3 : 2} locale={locale} />

      <div>
        <h2 className="text-xl font-bold text-slate-900" dir="auto">{t.title}</h2>
        <p className="text-sm text-slate-500 mt-1" dir="auto">
          {t.professionDeclared} <strong>{professionLabel(user.professionKind, locale) || "—"}</strong>
        </p>
      </div>

      {verified ? (
        <div className="rounded-xl bg-secondary-50 border border-secondary-200 text-secondary-800 px-4 py-3 flex items-center gap-2.5">
          <span className="text-secondary-600"><ShieldIcon /></span>
          <p className="text-sm font-medium" dir="auto">{t.verifiedMsg}</p>
        </div>
      ) : pending ? (
        <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3">
          <p className="text-sm font-medium" dir="auto">{t.pendingMsg}</p>
          <p className="text-sm text-blue-700/80 mt-0.5" dir="auto">{t.pendingMsg2}</p>
        </div>
      ) : null}

      {!verified && (
        <div className="grid sm:grid-cols-3 gap-3">
          {t.reassure.map((r) => (
            <div key={r.title} className="card p-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 mb-2"><ShieldIcon /></span>
              <p className="font-semibold text-slate-900 text-sm" dir="auto">{r.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5" dir="auto">{r.desc}</p>
            </div>
          ))}
        </div>
      )}

      {licenses.length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-700 mb-2" dir="auto">{t.submittedDocs}</p>
          <ul className="space-y-1.5 list-none m-0 p-0">
            {licenses.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-700" dir="auto">
                  {c.kindLabels[l.kind] ?? l.kind}
                  {l.documentName ? <span className="text-slate-400"> — {l.documentName}</span> : null}
                  {l.ordreNumber ? <span className="text-slate-400"> (n° {l.ordreNumber})</span> : null}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.status === "APPROVED" ? "bg-secondary-50 text-secondary-700" : l.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {t.statusLabels[l.status] ?? l.status}
                </span>
              </li>
            ))}
          </ul>
          {lastRejected?.adminNote && (
            <p className="text-sm text-red-700 mt-3 bg-red-50 rounded-lg px-3 py-2" dir="auto"><strong>{t.rejectReason}</strong> {lastRejected.adminNote}</p>
          )}
        </div>
      )}

      {!verified && (
        <div className="card p-5 sm:p-6">
          <p className="text-sm font-semibold text-slate-700 mb-4" dir="auto">{pending ? t.updateDossier : t.submitDossier}</p>
          <LicenseForm requiredKinds={required} locale={locale} />
        </div>
      )}
    </div>
  );
}
