"use client";

import { useEffect, useRef, useState } from "react";
import { ADS } from "@/lib/ads/config";

type AdSlotProps = {
  /** Slot ID de l'unité AdSense à afficher. */
  slot: string;
  /** Label de transparence affiché au-dessus (exigé par AdSense). */
  label?: string;
  /** Hauteur réservée en px (anti-CLS). Défaut 280 (in-article fluide). */
  minHeight?: number;
};

/**
 * Un encart publicitaire, conçu pour NE PAS dégrader les Core Web Vitals.
 *
 * — CLS : l'espace est RÉSERVÉ en dur (`minHeight` + `contain: layout`). La pub
 *   se remplit à l'intérieur du cadre déjà présent → aucun décalage de mise en page.
 * — INP/LCP : on ne pousse `adsbygoogle` (et donc on ne rend `<ins>`) QUE lorsque
 *   le slot approche du viewport, via `IntersectionObserver`. Les encarts en bas
 *   d'article ne coûtent rien tant que le lecteur ne descend pas.
 *
 * Design : cadre neutre repris du design system (rounded-2xl, border-slate-200,
 * label slate-400) → se fond dans la page sans rivaliser avec les CTA de marque.
 */
export function AdSlot({ slot, label = "Publicité", minHeight = 280 }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  // Demande à AdSense de remplir l'unité une fois <ins> monté.
  useEffect(() => {
    if (!visible) return;
    try {
      // `adsbygoogle` est injecté par AdSenseLoader ; typé large volontairement.
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // Bloqueur de pub / CSP / script indisponible → on échoue silencieusement.
    }
  }, [visible]);

  // Slot mal configuré : on ne réserve même pas d'espace (évite un cadre vide).
  if (!ADS.client || !slot) return null;

  return (
    <div ref={ref} className="my-10">
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1.5 text-center">
        {label}
      </p>
      <div
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
        style={{ minHeight, contain: "layout" }}
      >
        {visible && (
          <ins
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
