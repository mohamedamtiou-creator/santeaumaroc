"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/features/auth/actions";
import type { Dictionary } from "@/lib/i18n";

type NavT = Dictionary["dashboard"];

const NAV = [
  {
    href: "/tableau-de-bord",
    key: "navOverview" as const,
    exact: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 10 3l7 7.5"/>
        <path d="M5 9v8h4v-5h2v5h4V9"/>
      </svg>
    ),
  },
  {
    href: "/tableau-de-bord/rendez-vous",
    key: "navAppointments" as const,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="14" rx="2"/>
        <path d="M3 9h14M7 3v2M13 3v2M7 13h2M11 13h2"/>
      </svg>
    ),
  },
  {
    href: "/tableau-de-bord/questions",
    key: "navQuestions" as const,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h12v9H8l-3 3z"/><path d="M7 7h6M7 10h4"/>
      </svg>
    ),
  },
  {
    href: "/tableau-de-bord/profil",
    key: "navProfile" as const,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="4"/>
        <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
      </svg>
    ),
  },
];

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
      className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H3"/>
    </svg>
  );
}

/* ── Sidebar desktop ──────────────────────────────────── */
export function DashboardNav({ t}: { t: NavT }) {
  const pathname = usePathname();

  return (
    <nav className="card overflow-hidden">
      {NAV.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 px-4 py-2.5 text-sm border-b border-slate-100 last:border-0 transition-colors overflow-hidden ${
              isActive
                ? "bg-primary-50/80 text-primary-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {isActive && (
              <span className="absolute start-0 inset-y-0 w-0.5 bg-primary-600" aria-hidden="true" />
            )}
            <span className={isActive ? "text-primary-600" : "text-slate-500"}>
              {item.icon}
            </span>
            <span className="flex-1">{t.patient[item.key]}</span>
          </Link>
        );
      })}

      <form action={logout}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogoutIcon />
          <span>{t.logout}</span>
        </button>
      </form>
    </nav>
  );
}

/* ── Tabs mobiles ─────────────────────────────────────── */
export function DashboardNavMobile({ t}: { t: NavT }) {
  const pathname = usePathname();

  return (
    <div className="card overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-none">
        {NAV.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className={isActive ? "text-primary-600" : "text-slate-500"}>
                {item.icon}
              </span>
              {t.patient[item.key]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
