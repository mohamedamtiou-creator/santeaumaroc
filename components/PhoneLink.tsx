"use client";

import { type ReactNode } from "react";

/**
 * Lien d'appel (`tel:`) instrumenté, partagé entre la fiche praticien et les
 * cartes de listing.
 * Sur la quasi-totalité des fiches (non réservables en ligne), l'appel direct est
 * le seul chemin vers un RDV — mais il est autrement invisible pour la plateforme.
 * On enregistre le clic via `navigator.sendBeacon` : la requête survit à la
 * navigation vers le composeur téléphonique (contrairement à un fetch classique).
 * Fire-and-forget : aucune erreur n'affecte l'action d'appel.
 */
export function PhoneLink({
  doctorId,
  href,
  source = "profile",
  className,
  ariaLabel,
  children,
}: {
  doctorId: string;
  href: string; // numéro composable, sans le préfixe « tel: »
  source?: "profile" | "listing" | "card";
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  function track() {
    try {
      const payload = JSON.stringify({ doctorId, source });
      const url = "/api/track/phone-click";
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      } else {
        // Repli : keepalive permet à la requête d'aboutir après le changement de contexte.
        void fetch(url, {
          method: "POST",
          body: payload,
          keepalive: true,
          headers: { "Content-Type": "application/json" },
        }).catch(() => {});
      }
    } catch {
      // ne jamais bloquer l'appel
    }
  }

  return (
    <a href={`tel:${href}`} onClick={track} aria-label={ariaLabel} className={className}>
      {children}
    </a>
  );
}
