"use client";

import { useState, useEffect } from "react";

/**
 * Indice de session côté client, lu depuis le cookie NON httpOnly `sm_auth`
 * (posé en miroir du cookie `session` httpOnly, cf. lib/session.ts). Sert
 * uniquement à basculer l'UI du chrome (« Connexion » ↔ « Mon espace ») sans
 * forcer le rendu dynamique du layout : le SSR et le premier rendu client
 * partent de l'état déconnecté (défaut sûr), puis on ajuste après montage —
 * aucune divergence d'hydratation, aucune donnée sensible exposée.
 */
export function useHasSession(): boolean {
  const [has, setHas] = useState(false);
  useEffect(() => {
    setHas(
      document.cookie.split("; ").some((c) => c === "sm_auth=1"),
    );
  }, []);
  return has;
}
