"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./locale";

/**
 * Server Action : enregistre la locale choisie dans un cookie.
 *
 * ⚠️ NE PAS y remettre `revalidatePath("/", "layout")`. Cet appel purgeait le
 * cache ISR du SITE ENTIER — racine + tous les segments en dessous — à CHAQUE
 * clic sur le sélecteur de langue, par n'importe quel visiteur. Sur ~10 000 pages
 * pré-rendues plus les fiches praticien générées à la demande, un seul clic
 * suffisait à condamner toutes ces pages à être régénérées, c'est-à-dire autant
 * d'ISR Writes facturés — puis rebelote au clic suivant.
 *
 * Et il n'apportait rien : la locale est portée par l'URL (`/` = FR, `/ar` = AR,
 * cf. proxy.ts), donc les pages en cache sont déjà séparées par langue. AUCUNE
 * page mise en cache ne dépend de ce cookie : les seules à le lire via
 * `getLocale()` (connexion, inscription, mot de passe oublié) lisent des cookies
 * et sont donc rendues dynamiquement de toute façon.
 *
 * Le cookie reste posé comme repli pour ces pages-là. La navigation, elle, est
 * assurée par le `router.push` du sélecteur.
 */
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
