import type { Locale } from "./i18n";

/**
 * Construit les alternates SEO (canonical auto-référente + hreflang FR/AR)
 * pour une page bilingue servie à la fois sous son URL française (racine) et
 * sous le préfixe /ar (réécrit par proxy.ts vers la même route).
 *
 * @param path chemin FR sans préfixe de locale, commençant par "/" (ex "/", "/specialites/cardiologie")
 * @param locale locale de rendu courante (déduite du header x-locale via getLocale)
 */
export function localizedAlternates(path: string, locale: Locale) {
  const fr = path;
  const ar = path === "/" ? "/ar" : `/ar${path}`;
  return {
    // Chaque version se déclare canonique d'elle-même (auto-référente par langue).
    canonical: locale === "ar" ? ar : fr,
    languages: {
      "fr-MA": fr,
      "ar-MA": ar,
      "x-default": fr,
    },
  };
}

/**
 * Alternates pour une page dont le CONTENU est uniquement en français (ex.
 * contenu Q/R non encore traduit). On ne déclare volontairement AUCUNE
 * alternative arabe : le chrome arabe n'habille qu'un contenu français, et
 * l'annoncer via hreflang `ar-MA` tromperait Google (contenu mixte sur du
 * YMYL santé). Les deux locales pointent leur canonical vers l'URL française ;
 * la vue arabe doit par ailleurs être servie en `noindex` par l'appelant.
 */
export function frenchOnlyAlternates(path: string) {
  return {
    canonical: path,
    languages: {
      "fr-MA": path,
      "x-default": path,
    },
  };
}
