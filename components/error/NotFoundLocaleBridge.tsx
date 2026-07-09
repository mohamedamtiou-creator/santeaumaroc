"use client";

import { useLocaleContext } from "@/components/i18n/LocaleLink";
import NotFoundView from "./NotFoundView";

/**
 * Pont client : fournit la locale à `NotFoundView` via le contexte
 * `LocaleProvider` (posé par le layout racine), SANS appeler d'API dynamique
 * serveur (`headers()`/`cookies()`).
 *
 * CRUCIAL POUR LA PERF : `not-found.tsx` fait partie de l'arbre de rendu du
 * groupe de routes `(site)`. Toute API dynamique serveur qu'il appelle opte
 * TOUT le groupe en rendu dynamique (`ƒ`) → aucune page publique n'est plus
 * pré-rendue statiquement. En lisant la locale via le contexte client, le
 * boundary reste compatible avec la génération statique (`●`).
 *
 * Le SSR de génération statique rend chaque variante avec la bonne locale
 * (LocaleProvider = fr sous /fr, ar sous /ar), donc aucun contenu FR ne
 * « clignote » côté arabe.
 */
export default function NotFoundLocaleBridge() {
  const locale = useLocaleContext();
  return <NotFoundView locale={locale} />;
}
