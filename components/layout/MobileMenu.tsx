"use client";

import { useState, useEffect } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { usePathname } from "next/navigation";
import { useHasSession } from "./useHasSession";

type NavLink = { href: string; label: string };
type SignupOption = { href: string; label: string; description: string };

type Props = {
  primaryLinks: NavLink[];
  signupOptions: SignupOption[];
  t: {
    searchPlaceholder: string;
    searchButton: string;
    openMenu: string;
    closeMenu: string;
    login: string;
    mySpace: string;
  };
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true" strokeLinecap="round">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-primary-50 text-primary-700 font-semibold"
          : "text-slate-700 hover:bg-primary-50 hover:text-primary-700"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-primary-600" : "bg-primary-400"}`}
        aria-hidden="true"
      />
      {label}
    </Link>
  );
}

export function MobileMenu({ primaryLinks, signupOptions, t }: Props) {
  const isLoggedIn = useHasSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Fermer le menu à chaque changement de route — ajustement d'état pendant
  // le rendu (pattern recommandé par React, sans effet ni cascade de rendus).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Bloquer le scroll body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ── Bouton hamburger ────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={open ? t.closeMenu : t.openMenu}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        {open ? <XIcon /> : <MenuIcon />}
      </button>

      {/* ── Overlay ─────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Panneau déroulant ───────────────────────── */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-label="Menu de navigation"
        className={`
          fixed start-0 end-0 top-16 z-50 lg:hidden
          bg-white border-b border-slate-200
          shadow-xl shadow-slate-900/10
          max-h-[calc(100vh-4rem)] overflow-y-auto
          transition-all duration-200 ease-out
          ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">

          {/* ── Recherche (action principale) ───────── */}
          <form action="/praticiens" method="GET" role="search" className="mb-3">
            <label htmlFor="mobile-search" className="sr-only">{t.searchPlaceholder}</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-primary-300 px-3 transition-colors">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true">
                <circle cx="9" cy="9" r="6" />
                <path d="m14 14 4 4" strokeLinecap="round" />
              </svg>
              <input
                id="mobile-search"
                name="q"
                type="search"
                placeholder={t.searchPlaceholder}
                autoComplete="off"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
              <button type="submit" aria-label={t.searchButton} className="shrink-0 px-3 py-1.5 my-1 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors">
                {t.searchButton}
              </button>
            </div>
          </form>

          {/* ── Liens principaux ────────────────────── */}
          <nav aria-label="Navigation principale">
            <ul className="space-y-0.5">
              {primaryLinks.map((link) => (
                <li key={link.href}>
                  <NavItem href={link.href} label={link.label} active={isActive(link.href)} />
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Séparateur + Auth ───────────────────── */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            {isLoggedIn ? (
              <Link
                href="/tableau-de-bord"
                className="btn-primary w-full justify-center py-2.5"
              >
                {t.mySpace}
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/connexion"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                  {t.login}
                </Link>
                <div className="flex gap-2 pt-1 pb-1">
                  {signupOptions.map((opt, i) => (
                    <Link
                      key={opt.href}
                      href={opt.href}
                      className={
                        i === 0
                          ? "btn-primary flex-1 justify-center py-2.5 text-sm"
                          : "flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-3 rounded-lg border border-secondary-300 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 transition-colors"
                      }
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
