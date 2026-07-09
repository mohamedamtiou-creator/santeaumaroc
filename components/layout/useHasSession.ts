"use client";

import { useSyncExternalStore } from "react";

/**
 * Indice de session côté client, lu depuis le cookie NON httpOnly `sm_auth`
 * (posé en miroir du cookie `session` httpOnly, cf. lib/session.ts). Sert
 * uniquement à basculer l'UI du chrome (« Connexion » ↔ « Mon espace ») sans
 * forcer le rendu dynamique du layout : le SSR et le premier rendu client
 * partent de l'état déconnecté (défaut sûr), puis on ajuste après montage —
 * aucune divergence d'hydratation, aucune donnée sensible exposée.
 *
 * `useSyncExternalStore` lit le cookie (source externe mutable) : le
 * `getServerSnapshot` sert aussi au premier rendu client (hydratation stable à
 * `false`), puis React relit `getSnapshot` côté client — pas de setState dans
 * un effet, pas de cascade de rendus.
 */
const subscribe = () => () => {};
const getSnapshot = () =>
  document.cookie.split("; ").some((c) => c === "sm_auth=1");
const getServerSnapshot = () => false;

export function useHasSession(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
