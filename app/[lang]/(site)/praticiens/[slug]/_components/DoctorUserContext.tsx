"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useHasSession } from "@/components/layout/useHasSession";
import type { UserStatus, ExistingReview } from "./ReviewDialog";

type Role = "PATIENT" | "DOCTOR" | "ADMIN" | null;
export type ClaimData = { status: string; adminNote: string | null } | null;

export type DoctorUser = {
  loading: boolean;
  loggedIn: boolean;
  role: Role;
  userStatus: UserStatus;
  existingReview: ExistingReview;
  claim: ClaimData;
};

// État par défaut = déconnecté. C'est aussi le rendu SSR (statique) : la fiche
// médecin est pré-rendue pour un visiteur anonyme, puis le contexte s'hydrate
// côté client si un cookie `sm_auth` est présent.
const LOGGED_OUT: DoctorUser = {
  loading: false,
  loggedIn: false,
  role: null,
  userStatus: "not-logged-in",
  existingReview: null,
  claim: null,
};

const Ctx = createContext<DoctorUser>(LOGGED_OUT);
export const useDoctorUser = () => useContext(Ctx);

export function DoctorUserProvider({ doctorId, children }: { doctorId: string; children: ReactNode }) {
  const hasSession = useHasSession();
  const [data, setData] = useState<DoctorUser>(LOGGED_OUT);

  useEffect(() => {
    if (!hasSession) { setData(LOGGED_OUT); return; }
    let alive = true;
    setData((d) => ({ ...d, loading: true }));
    fetch(`/api/praticiens/${doctorId}/me`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d || !d.loggedIn) return;
        const role: Role = d.role ?? null;
        const userStatus: UserStatus = role === "PATIENT" || role === "ADMIN" ? "yes" : "not-patient";
        setData({
          loading: false,
          loggedIn: true,
          role,
          userStatus,
          existingReview: d.existingReview ?? null,
          claim: d.claim ?? null,
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [hasSession, doctorId]);

  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

/**
 * Masque la bannière de revendication (B2B) pour un patient connecté. Par défaut
 * (anonyme / non encore hydraté), elle reste visible — comportement SSR d'origine
 * (« visible pour tout visiteur sauf un patient connecté »).
 */
export function ClaimBannerGate({ children }: { children: ReactNode }) {
  const { role } = useDoctorUser();
  if (role === "PATIENT") return null;
  return <>{children}</>;
}
