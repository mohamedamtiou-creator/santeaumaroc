"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useHasSession } from "@/components/layout/useHasSession";

/**
 * État personnalisé d'une question, résolu APRÈS hydratation.
 *
 * Décalque de `DoctorUserProvider` (fiche praticien) : la page `/questions/[slug]`
 * lisait la session au rendu serveur, ce qui la rendait dynamique pour tous et
 * supprimait toute mise en cache. Le rendu serveur part désormais de l'état
 * anonyme — qui est aussi ce que voient les moteurs — puis ce contexte comble les
 * données propres à l'utilisateur si un cookie `sm_auth` est présent.
 *
 * Déconnecté = aucun appel réseau : le chemin SEO ne paie rien.
 */

export type QuestionUser = {
  loggedIn: boolean;
  canAccept: boolean;
  following: boolean;
  /** Identifiants des réponses déjà votées / remerciées par l'utilisateur. */
  voted: Set<string>;
  thanked: Set<string>;
  /** Médecin vérifié n'ayant pas encore répondu à cette question. */
  showComposer: boolean;
};

const LOGGED_OUT: QuestionUser = {
  loggedIn: false,
  canAccept: false,
  following: false,
  voted: new Set(),
  thanked: new Set(),
  showComposer: false,
};

const Ctx = createContext<QuestionUser>(LOGGED_OUT);
export const useQuestionUser = () => useContext(Ctx);

export function QuestionUserProvider({ questionId, children }: { questionId: string; children: ReactNode }) {
  const hasSession = useHasSession();
  const [data, setData] = useState<QuestionUser>(LOGGED_OUT);

  useEffect(() => {
    if (!hasSession) return;
    let alive = true;
    fetch(`/api/questions/${questionId}/me`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.loggedIn) return;
        setData({
          loggedIn: true,
          canAccept: !!d.canAccept,
          following: !!d.following,
          voted: new Set<string>(d.voted ?? []),
          thanked: new Set<string>(d.thanked ?? []),
          showComposer: !!d.showComposer,
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [hasSession, questionId]);

  // Déconnecté → toujours l'état anonyme, quelle que soit la dernière réponse
  // chargée (évite un flash de contenu personnalisé après déconnexion).
  return <Ctx.Provider value={hasSession ? data : LOGGED_OUT}>{children}</Ctx.Provider>;
}

/** Rend ses enfants seulement pour un médecin vérifié éligible au composer. */
export function ComposerGate({ children }: { children: ReactNode }) {
  return useQuestionUser().showComposer ? <>{children}</> : null;
}

/** Rend ses enfants seulement pour un visiteur NON connecté (invite à se connecter). */
export function AnonymousOnly({ children }: { children: ReactNode }) {
  return useQuestionUser().loggedIn ? null : <>{children}</>;
}
