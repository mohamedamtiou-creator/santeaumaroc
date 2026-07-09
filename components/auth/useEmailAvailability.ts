"use client";

import { useCallback, useRef, useState } from "react";
import { checkEmailAvailable } from "@/features/auth/actions";

export type EmailStatus = "idle" | "checking" | "available" | "taken";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Vérifie au blur si une adresse e-mail est déjà utilisée, pour donner un
 * retour immédiat plutôt qu'un échec après remplissage complet du tunnel.
 * Un compteur de séquence ignore les réponses obsolètes (course réseau).
 */
export function useEmailAvailability() {
  const [status, setStatus] = useState<EmailStatus>("idle");
  const seq = useRef(0);

  const check = useCallback(async (email: string) => {
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("idle");
      return;
    }
    const id = ++seq.current;
    setStatus("checking");
    try {
      const { available } = await checkEmailAvailable(value);
      if (id !== seq.current) return; // réponse obsolète
      setStatus(available ? "available" : "taken");
    } catch {
      if (id === seq.current) setStatus("idle");
    }
  }, []);

  const reset = useCallback(() => {
    seq.current++; // invalide toute requête en vol
    setStatus("idle");
  }, []);

  return { status, check, reset };
}
