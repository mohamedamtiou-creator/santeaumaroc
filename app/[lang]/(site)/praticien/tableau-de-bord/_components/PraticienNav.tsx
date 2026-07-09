"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/features/auth/actions";
import type { Dictionary } from "@/lib/i18n";

type NavT = Dictionary["dashboard"];

const NAV = [
  {
    href: "/praticien/tableau-de-bord",
    labelKey: "navOverview" as const,
    shortKey: "shortOverview" as const,
    exact: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 10 3l7 7.5"/>
        <path d="M5 9v8h4v-5h2v5h4V9"/>
      </svg>
    ),
    iconLg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 10 3l7 7.5"/>
        <path d="M5 9v8h4v-5h2v5h4V9"/>
      </svg>
    ),
  },
  {
    href: "/praticien/tableau-de-bord/agenda",
    labelKey: "navAgenda" as const,
    shortKey: "shortAgenda" as const,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="14" rx="2"/>
        <path d="M3 9h14M7 3v2M13 3v2M7 13h1M11 13h1M7 16h1"/>
      </svg>
    ),
    iconLg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="14" rx="2"/>
        <path d="M3 9h14M7 3v2M13 3v2M7 13h1M11 13h1M7 16h1"/>
      </svg>
    ),
  },
  {
    href: "/praticien/tableau-de-bord/rendez-vous",
    labelKey: "navRendezVous" as const,
    shortKey: "shortRendezVous" as const,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="12" height="15" rx="2"/>
        <path d="M7 7h6M7 10.5h6M7 14h4"/>
      </svg>
    ),
    iconLg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="12" height="15" rx="2"/>
        <path d="M7 7h6M7 10.5h6M7 14h4"/>
      </svg>
    ),
  },
  {
    href: "/praticien/tableau-de-bord/reponses",
    labelKey: "navReponses" as const,
    shortKey: null,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h12v9H8l-3 3z"/><path d="M7 7h6M7 10h4"/>
      </svg>
    ),
    iconLg: null,
  },
  {
    href: "/praticien/tableau-de-bord/rappels",
    labelKey: "navRappels" as const,
    shortKey: null,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4a1 1 0 0 1 1-1h2.5l1.3 3.8-1.9 1.4a10 10 0 0 0 4 4l1.4-1.9L16 12.5V15a1 1 0 0 1-1 1A11 11 0 0 1 4 5z"/>
      </svg>
    ),
    iconLg: null,
  },
  {
    href: "/praticien/tableau-de-bord/horaires",
    labelKey: "navHoraires" as const,
    shortKey: "shortHoraires" as const,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8"/>
        <path d="M10 6v4l3 2"/>
      </svg>
    ),
    iconLg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8"/>
        <path d="M10 6v4l3 2"/>
      </svg>
    ),
  },
  {
    href: "/praticien/tableau-de-bord/profil",
    labelKey: "navProfil" as const,
    shortKey: "shortProfil" as const,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="4"/>
        <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
      </svg>
    ),
    iconLg: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-5 h-5" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="7" r="4"/>
        <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
      </svg>
    ),
  },
  {
    href: "/praticien/tableau-de-bord/verification",
    labelKey: "navVerification" as const,
    shortKey: null,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8"/>
        <path d="M6.5 10l2.5 2.5L13.5 7"/>
      </svg>
    ),
    iconLg: null,
  },
  {
    href: "/praticien/tableau-de-bord/abonnement",
    labelKey: "navAbonnement" as const,
    shortKey: null,
    exact: false,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
        className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="5" width="15" height="10" rx="2"/>
        <path d="M2.5 8.5h15M6 12h3"/>
      </svg>
    ),
    iconLg: null,
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
export function PraticienNav({ t}: { t: NavT }) {
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
            <span className="flex-1">{t.praticien[item.labelKey]}</span>
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

/* ── Bottom nav mobile ────────────────────────────────── */
export function PraticienNavBottom({ t}: { t: NavT }) {
  const pathname = usePathname();

  // Only the first 5 items (skip Vérification)
  const items = NAV.filter((n) => n.shortKey !== null).slice(0, 5);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-stretch md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
              isActive ? "text-primary-600" : "text-slate-500 active:text-slate-600"
            }`}
          >
            {isActive && (
              <span
                className="absolute top-0 start-1/4 end-1/4 h-0.5 bg-primary-600 rounded-full"
                aria-hidden="true"
              />
            )}
            {item.iconLg}
            <span className={`text-[9px] font-semibold uppercase tracking-wide leading-none ${
              isActive ? "text-primary-600" : "text-slate-500"
            }`}>
              {item.shortKey ? t.praticien[item.shortKey] : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
