import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession, getCurrentUser } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { DashboardNav, DashboardNavMobile } from "./_components/DashboardNav";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Mon espace — SantéauMaroc",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  if (session.role === "DOCTOR") {
    redirect("/praticien/tableau-de-bord");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const initials = getInitials(user.name);
  const t = getDictionary(await getLocale()).dashboard;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">

      {/* ── Mobile : header + tabs ─────────────────── */}
      <div className="md:hidden mb-4 space-y-2">
        <div className="card overflow-hidden p-0">
          <div className="h-1"
            style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />
          <div className="p-3 flex items-center gap-3">
            <div className="avatar-ring w-10 h-10 shrink-0">
              <div className="avatar-ring-inner">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary-700">{initials}</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <DashboardNavMobile t={t} />
      </div>

      {/* ── Desktop : sidebar + contenu ─────────────── */}
      <div className="flex gap-6">
        <aside className="hidden md:flex md:flex-col w-60 shrink-0 gap-3">

          {/* Carte utilisateur */}
          <div className="card overflow-hidden p-0">
            <div className="h-1"
              style={{ background: "linear-gradient(90deg, #2563eb 0%, #059669 100%)" }} />
            <div className="p-4 flex items-center gap-3">
              <div className="avatar-ring w-12 h-12 shrink-0">
                <div className="avatar-ring-inner">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary-700">{initials}</span>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <DashboardNav t={t} />
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
