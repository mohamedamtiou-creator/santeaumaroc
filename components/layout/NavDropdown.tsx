"use client";

import { useState, useRef, useEffect } from "react";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; description: string };

type Props = {
  label: string;
  items: Item[];
};

export function NavDropdown({ label, items }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = items.some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`nav-link inline-flex items-center gap-1${isActive ? " nav-link-active" : ""}`}
      >
        {label}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
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
        <div className="absolute top-full start-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 group-hover:text-primary-700 transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
