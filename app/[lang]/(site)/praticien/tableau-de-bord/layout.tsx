import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDoctorInitials } from "@/lib/utils";
import { PraticienNav, PraticienNavBottom } from "./_components/PraticienNav";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Espace praticien — SantéauMaroc",
  robots: { index: false, follow: false },
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
      className="w-2.5 h-2.5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5l2 2 4-4"/>
    </svg>
  );
}

export default async function PraticienDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (session.role !== "DOCTOR") redirect("/tableau-de-bord");

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.userId },
    select: {
      nom:        true,
      prenom:     true,
      civilite:   true,
      avatar:     true,
      isVerified: true,
      specialty:    { select: { name: true } },
    },
  });

  if (!doctor) redirect("/tableau-de-bord");

  const fullName = [doctor.civilite, doctor.prenom, doctor.nom].filter(Boolean).join(" ");
  const initials = getDoctorInitials(doctor.prenom, doctor.nom);
  const t = getDictionary(await getLocale()).dashboard;

  return (
    <>
      {/* ── Page content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-24 md:py-8">

        {/* ── Mobile : doctor header (no tabs – bottom nav) ────── */}
        <div className="md:hidden mb-4">
          <div className="card overflow-hidden p-0">
            <div className="h-1"
              style={{ background: "linear-gradient(90deg,#2563eb 0%,#059669 100%)" }} />
            <div className="p-3.5 flex items-center gap-3">

              {/* Avatar */}
              <div className="avatar-ring w-11 h-11 shrink-0">
                <div className="avatar-ring-inner">
                  {doctor.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doctor.avatar} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary-700">{initials}</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-900 truncate">{fullName}</p>
                <p className="text-xs text-slate-500 truncate">{doctor.specialty.name}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                {doctor.isVerified && (
                  <span className="badge-verified inline-flex items-center gap-1 text-xs">
                    <CheckIcon />
                    {t.praticien.verifiedBadge}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Desktop : sidebar + contenu ──────────────────────── */}
        <div className="flex gap-6">
          <aside className="hidden md:flex md:flex-col w-60 shrink-0 gap-3">

            {/* Carte praticien */}
            <div className="card overflow-hidden p-0">
              <div className="h-1"
                style={{ background: "linear-gradient(90deg,#2563eb 0%,#059669 100%)" }} />
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="avatar-ring w-12 h-12 shrink-0">
                    <div className="avatar-ring-inner">
                      {doctor.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={doctor.avatar} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary-700">{initials}</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{doctor.specialty.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {doctor.isVerified && (
                    <span className="badge-verified inline-flex items-center gap-1 text-xs">
                      <CheckIcon />
                      Vérifié
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Nav sidebar */}
            <PraticienNav t={t} />
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* ── Bottom nav (mobile only, fixed) ───────────────────── */}
      <PraticienNavBottom t={t} />
    </>
  );
}
