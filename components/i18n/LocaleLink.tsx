"use client";

import NextLink from "next/link";
import { createContext, useContext, forwardRef, type ComponentProps } from "react";
import { localeHref, type Locale } from "@/lib/i18n";

/**
 * Contexte de locale fourni par le layout racine (valeur = getLocale() côté
 * serveur, autoritaire via le header x-locale pour les URLs /ar). Permet aux
 * liens internes de rester dans la bonne langue sans threader la locale en props.
 */
const LocaleContext = createContext<Locale>("fr");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext(): Locale {
  return useContext(LocaleContext);
}

type Props = ComponentProps<typeof NextLink>;

/**
 * Remplace next/link : préfixe automatiquement les hrefs internes par /ar quand
 * la locale courante est l'arabe, afin que la navigation reste sous /ar (URLs
 * indexables). Les hrefs externes (http…, mailto:, tel:), les ancres (#…) et les
 * hrefs déjà préfixés /ar sont laissés intacts. En français : passe-plat.
 */
export const LocaleLink = forwardRef<HTMLAnchorElement, Props>(
  function LocaleLink({ href, ...rest }, ref) {
    const locale = useContext(LocaleContext);
    // Logique de préfixe /ar centralisée dans lib/i18n (partagée avec les
    // Server Components qui rendent un next/link nu). Les hrefs non-string
    // (objets UrlObject) passent tels quels.
    const finalHref = typeof href === "string" ? localeHref(locale, href) : href;
    return <NextLink ref={ref} href={finalHref} {...rest} />;
  },
);
