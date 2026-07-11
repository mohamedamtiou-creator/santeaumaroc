"use client";

import { useEffect, useRef, useState } from "react";
import { ADS } from "@/lib/ads/config";

type AdSlotProps = {
  /** Slot ID de l'unité AdSense à afficher. */
  slot: string;
  /** Label de transparence affiché au-dessus (exigé par AdSense). */
  label?: string;
  /** Hauteur réservée en px (anti-CLS) pendant le chargement. Défaut 280. */
  minHeight?: number;
};

// "pending"  : en attente / en cours de chargement → on RÉSERVE l'espace (CLS 0)
// "filled"   : une annonce a été servie → on garde l'encart
// "unfilled" : aucune annonce (compte en examen, pas d'inventaire, ou bloqueur)
//              → on masque complètement l'encart (pas de boîte « Publicité » vide)
type AdStatus = "pending" | "filled" | "unfilled";

/**
 * Un encart publicitaire, conçu pour NE PAS dégrader les Core Web Vitals et pour
 * disparaître proprement quand il n'y a rien à afficher.
 *
 * — CLS : l'espace est RÉSERVÉ en dur (`minHeight` + `contain: layout`) pendant le
 *   chargement. La pub se remplit à l'intérieur du cadre déjà présent.
 * — INP/LCP : on ne pousse `adsbygoogle` (et on ne rend `<ins>`) QUE lorsque le
 *   slot approche du viewport, via `IntersectionObserver`.
 * — Repli : AdSense pose `data-ad-status` sur le `<ins>`. On l'observe ; si
 *   "unfilled" (ou si rien ne se charge après un délai — bloqueur/examen), on
 *   masque tout l'encart, label compris → aucune boîte vide en production.
 */
export function AdSlot({ slot, label = "Publicité", minHeight = 280 }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<AdStatus>("pending");

  // Révèle le slot à l'approche du viewport (pré-charge ~600px avant).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Une fois <ins> monté : demande le remplissage puis surveille data-ad-status.
  useEffect(() => {
    if (!visible) return;
    const ins = insRef.current;
    if (!ins) return;

    try {
      // `adsbygoogle` est injecté par AdSenseLoader ; typé large volontairement.
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // Script indisponible (bloqueur / CSP) → traité comme "unfilled" par le délai.
    }

    const resolve = () => {
      const st = ins.getAttribute("data-ad-status");
      if (st === "filled") setStatus("filled");
      else if (st === "unfilled") setStatus("unfilled");
    };

    // AdSense pose data-ad-status de façon asynchrone → on observe l'attribut.
    const mo = new MutationObserver(resolve);
    mo.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });

    // Filet de sécurité : si au bout de 4 s aucun statut n'est posé et que la boîte
    // est restée vide (script bloqué / jamais chargé), on considère "unfilled".
    const timer = setTimeout(() => {
      resolve();
      if (!ins.getAttribute("data-ad-status") && ins.offsetHeight === 0) {
        setStatus("unfilled");
      }
    }, 4000);

    return () => {
      mo.disconnect();
      clearTimeout(timer);
    };
  }, [visible]);

  // Slot mal configuré, ou aucune annonce servie → on ne rend rien (pas de cadre vide).
  if (!ADS.client || !slot || status === "unfilled") return null;

  return (
    <div ref={ref} className="my-10">
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1.5 text-center">
        {label}
      </p>
      <div
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
        // Espace réservé tant que le statut n'est pas connu (anti-CLS). Une fois
        // l'annonce servie, on laisse l'unité fluide définir sa hauteur réelle.
        style={{ minHeight: status === "filled" ? undefined : minHeight, contain: "layout" }}
      >
        {visible && (
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={ADS.client}
            data-ad-slot={slot}
            data-ad-format="fluid"
            data-ad-layout="in-article"
          />
        )}
      </div>
    </div>
  );
}
