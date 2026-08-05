/**
 * Primitives de locale — module DÉLIBÉRÉMENT MINUSCULE.
 *
 * Extrait de `lib/i18n.ts`, qui pèse ~326 KB de source (les deux dictionnaires
 * FR + AR en entier). Le composant client `LocaleLink` n'avait besoin que de
 * `localeHref`, mais l'importer depuis `lib/i18n` faisait entrer TOUT le module
 * dans le graphe client : comme `LocaleLink` est le composant de lien utilisé
 * partout, les deux dictionnaires étaient embarqués dans le bundle de CHAQUE
 * page (mesuré : les clés FR et les chaînes arabes étaient bien présentes dans
 * les chunks servis).
 *
 * RÈGLE : ne JAMAIS importer un dictionnaire ici. Ce fichier doit rester sans
 * dépendance, pour qu'un composant client puisse le prendre sans rien tirer.
 * `lib/i18n.ts` le ré-exporte : les imports existants restent valides.
 */

export const LOCALES = ["fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "ar";
}

/** Normalise le segment d'URL [lang] en locale valide (repli FR).
 *  À utiliser dans les pages/layouts : `const locale = toLocale((await params).lang)`. */
export function toLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Direction d'écriture associée à la locale. */
export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Préfixe un href interne par /ar quand la locale est l'arabe (FR = passe-plat).
 * Laisse intacts : hrefs externes/ancres/mailto/tel, hrefs déjà préfixés /ar.
 *
 * Fonction PURE (aucun `"use client"`, aucun hook) → utilisable côté serveur ET
 * client. Permet aux Server Components qui connaissent déjà la locale (via
 * `params.lang`) de rendre un `next/link` NU, sans passer par le composant client
 * `LocaleLink` (qui hydrate un îlot par lien). Voir composants à fort volume de
 * liens (PraticienCard, Footer…). En FR le href ressort inchangé.
 */
export function localeHref(locale: Locale, href: string): string {
  if (locale === "ar" && href.startsWith("/") && !href.startsWith("/ar/") && href !== "/ar") {
    return href === "/" ? "/ar" : `/ar${href}`;
  }
  return href;
}
