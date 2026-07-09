"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type AdminNavItem = {
  href: string;
  label: string;
  exact: boolean;
  icon: ReactNode;
  badge?: number;
};

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/** Liste de navigation de la sidebar (desktop) avec surlignage du lien actif. */
export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
      {items.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg transition-colors group ${
              active
                ? "bg-primary-50 text-primary-700 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className={active ? "text-primary-600" : "text-slate-500 group-hover:text-slate-600 transition-colors"}>
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barre de navigation mobile (icônes) avec surlignage du lien actif. */
export function AdminMobileNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={`relative p-2 rounded-lg transition-colors shrink-0 ${
              active ? "text-primary-700 bg-primary-50" : "text-slate-500 hover:text-primary-700"
            }`}
          >
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 end-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
