import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./i18n";

/**
 * Locale courante (serveur uniquement).
 *
 * Priorité : header `x-locale` (injecté par proxy.ts pour les URLs préfixées
 * /ar → indexation & hreflang) puis cookie (choix explicite via le sélecteur
 * de langue sur les URLs racine), enfin la locale par défaut.
 */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const fromHeader = h.get("x-locale");
  if (isLocale(fromHeader)) return fromHeader;

  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(value)) return value;

  // Repli 1re visite (pas de cookie) : préférence du navigateur, UNIQUEMENT si
  // l'arabe est la langue de tête d'Accept-Language. Pas de redirection d'URL
  // (déconseillé par Google : les crawlers, en `en`/sans header, obtiennent le
  // FR canonique) — on ajuste seulement la langue de rendu.
  const accept = h.get("accept-language") ?? "";
  if (/^\s*ar\b/i.test(accept)) return "ar";

  return DEFAULT_LOCALE;
}
