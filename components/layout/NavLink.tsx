"use client";

import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`nav-link${isActive ? " nav-link-active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
