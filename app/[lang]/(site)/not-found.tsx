import type { Metadata } from "next";
import NotFoundLocaleBridge from "@/components/error/NotFoundLocaleBridge";

export const metadata: Metadata = {
  title: "Page introuvable — SantéauMaroc",
  robots: { index: false, follow: true },
};

/**
 * 404 rendu DANS le chrome du site (via `notFound()` depuis une route existante).
 *
 * ⚠️ NE PAS appeler d'API dynamique serveur ici (`headers()`/`cookies()`) : ce
 * boundary appartient à l'arbre du groupe `(site)` et toute API dynamique y
 * bascule l'ENSEMBLE des pages publiques en rendu dynamique (`ƒ`), tuant la
 * génération statique. La locale est fournie via le contexte client
 * (`NotFoundLocaleBridge`), compatible avec le pré-rendu statique.
 */
export default function NotFound() {
  return <NotFoundLocaleBridge />;
}
