import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/features/auth/actions";
import { prisma } from "@/lib/prisma";
import { AdminNav, AdminMobileNav, type AdminNavItem } from "./_components/AdminNav";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Administration — SantéauMaroc",
  robots: { index: false, follow: false },
};

async function getPendingCount() {
  return prisma.doctorClaim.count({ where: { status: "PENDING" } });
}

async function getOpenTicketsCount() {
  return prisma.supportTicket.count({ where: { status: "open" } });
}

async function getNewLeadsCount() {
  return prisma.subscriptionLead.count({ where: { status: "NEW" } });
}

async function getPendingOrdersCount() {
  return prisma.subscriptionOrder.count({ where: { status: "PENDING" } });
}

const NAV = [
  {
    href:  "/admin",
    label: "Tableau de bord",
    exact: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 10 3l7 7.5"/><path d="M5 9v8h4v-5h2v5h4V9"/>
      </svg>
    ),
  },
  {
    href:  "/admin/praticiens",
    label: "Praticiens",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="7" r="3.5"/><path d="M2 17c0-3.31 2.69-5.5 6-5.5s6 2.19 6 5.5"/>
        <path d="M14 9v4M12 11h4"/>
      </svg>
    ),
  },
  {
    href:  "/admin/revendications",
    label: "Revendications",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 3v14M4 3l12 4-12 5"/>
      </svg>
    ),
  },
  {
    href:  "/admin/prospection",
    label: "Prospection",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="6"/><path d="m17 17-3.5-3.5"/>
      </svg>
    ),
  },
  {
    href:  "/admin/support",
    label: "Support",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13a2 2 0 0 1-2 2H6l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8z"/>
      </svg>
    ),
  },
  {
    href:  "/admin/abonnements",
    label: "Abonnements",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4.5" width="16" height="11" rx="2"/><path d="M2 8h16M5 12h3"/>
      </svg>
    ),
  },
  {
    href:  "/admin/paiements",
    label: "Paiements",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="5" width="15" height="10" rx="2"/><path d="M2.5 8.5h15M6 12h3"/>
      </svg>
    ),
  },
  {
    href:  "/admin/contact",
    label: "Contact",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="13" rx="2"/>
        <path d="m2 7 8 5.5L18 7"/>
      </svg>
    ),
  },
  {
    href:  "/admin/blog",
    label: "Blog",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h12M4 9h8M4 13h10M4 17h6"/>
      </svg>
    ),
  },
  {
    href:  "/admin/questions",
    label: "Questions/Réponses",
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 4h14v9H7l-4 3z"/><path d="M7 7h6M7 10h4"/>
      </svg>
    ),
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingCount, openTicketsCount, newLeadsCount, pendingOrdersCount] = await Promise.all([
    getPendingCount(),
    getOpenTicketsCount(),
    getNewLeadsCount(),
    getPendingOrdersCount(),
  ]);

  const badgeFor: Record<string, number | undefined> = {
    "/admin/revendications": pendingCount,
    "/admin/support":        openTicketsCount,
    "/admin/abonnements":    newLeadsCount,
    "/admin/paiements":      pendingOrdersCount,
  };

  const items: AdminNavItem[] = NAV.map((item) => ({
    ...item,
    badge: badgeFor[item.href],
  }));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-e border-slate-200 shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100">
          <Link href="/" className="inline-flex items-center" aria-label="SantéauMaroc — accueil">
            <Logo iconSize={28} className="text-base" gradId="lm-admin" />
          </Link>
          <p className="text-[11px] text-slate-400 mt-1.5">La santé, à portée de clic.</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">Espace administration</p>
        </div>

        {/* Nav */}
        <AdminNav items={items} />

        {/* Logout */}
        <div className="px-2 py-3 border-t border-slate-100">
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-2.5 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H3"/>
              </svg>
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between gap-3 sticky top-0 z-20">
          <Link href="/admin" className="shrink-0 inline-flex items-center gap-1.5" aria-label="SantéauMaroc — Administration">
            <Logo iconSize={24} className="text-sm" gradId="lm-admin-m" />
            <span className="text-slate-400 font-medium text-xs">Admin</span>
          </Link>
          <AdminMobileNav items={items} />
        </header>

        <main className="flex-1 p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
