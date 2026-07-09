"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { type Locale } from "@/lib/i18n";
import { setLocale } from "@/lib/locale-action";

const OPTIONS: { code: Locale; short: string; label: string }[] = [
  { code: "fr", short: "FR", label: "Français" },
  { code: "ar", short: "ع", label: "العربية" },
];

type Props = {
  locale: Locale;
  /** "dark" pour les fonds sombres (footer). */
  variant?: "light" | "dark";
};

/**
 * Bascule FR / العربية.
 * Écrit le cookie `locale` puis rafraîchit les composants serveur
 * (layout, navbar, footer) qui relisent le cookie → `lang`/`dir` + traductions.
 */
export function LanguageSwitcher({ locale, variant = "light" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    // Chemin sans préfixe de locale (URL FR racine).
    const bare = pathname === "/ar"
      ? "/"
      : pathname.startsWith("/ar/")
        ? pathname.slice(3)
        : pathname;
    // Cible : /ar + chemin pour l'arabe, chemin nu pour le français.
    const target = next === "ar" ? (bare === "/" ? "/ar" : `/ar${bare}`) : bare;
    startTransition(async () => {
      // On garde le cookie synchronisé : il sert de repli pour les liens internes
      // pas encore préfixés /ar (l'utilisateur reste dans sa langue).
      await setLocale(next);
      router.push(target);
      router.refresh();
    });
  }

  const isDark = variant === "dark";

  return (
    <div
      role="group"
      aria-label="Langue / اللغة"
      data-pending={isPending ? "" : undefined}
      className={`inline-flex items-center rounded-full p-0.5 text-xs font-semibold ${
        isDark ? "bg-white/10" : "bg-slate-100"
      }`}
    >
      {OPTIONS.map((opt) => {
        const active = opt.code === locale;
        return (
          <button
            key={opt.code}
            type="button"
            lang={opt.code}
            onClick={() => switchTo(opt.code)}
            aria-pressed={active}
            title={opt.label}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              active
                ? isDark
                  ? "bg-white text-primary-900"
                  : "bg-white text-primary-700 shadow-sm"
                : isDark
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {opt.short}
          </button>
        );
      })}
    </div>
  );
}
