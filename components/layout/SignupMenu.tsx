"use client";

import { useState, useRef, useEffect } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";

/**
 * CTA d'inscription unique.
 * — Un seul bouton primaire « S'inscrire » au lieu de deux CTA concurrents.
 * — La segmentation Patient / Praticien se fait APRÈS le clic (loi de Hick),
 *   au moment où l'utilisateur en a besoin, sans créer de nouvelle route.
 */
type Option = { href: string; label: string; description: string };

type Props = {
  label: string;
  options: Option[];
};

export function SignupMenu({ label, options }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="btn-primary text-sm py-2 px-4"
      >
        {label}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3.5 h-3.5 -me-0.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full end-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50"
        >
          {options.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
            >
              <span
                className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center"
                aria-hidden="true"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="5" r="2.5" />
                  <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5" />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-medium text-slate-800 group-hover:text-primary-700 transition-colors">
                  {opt.label}
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">{opt.description}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
