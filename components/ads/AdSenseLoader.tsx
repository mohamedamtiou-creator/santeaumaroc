import Script from "next/script";
import { ADS } from "@/lib/ads/config";

/**
 * Charge le script AdSense UNE seule fois, après hydratation
 * (`strategy="afterInteractive"`) → il n'entre pas en concurrence réseau avec
 * le LCP (image de couverture de l'article, qui garde `priority`).
 * `next/script` déduplique via l'`id`, même monté dans un layout partagé.
 *
 * Où le monter : dans `app/[lang]/layout.tsx`, juste avant `</body>`. Il reste
 * INERTE tant qu'aucun `AdSlot` n'appelle `window.adsbygoogle.push({})` — donc
 * aucun encart ne s'affiche sur les pages sans `AdSlot` (pages transactionnelles).
 *
 * ⚠️ Ne se rend que si `ADS.enabled` ET `ADS.client` sont posés. Ne pas oublier
 * d'assouplir la CSP (`next.config.ts`) pour les domaines Google Ads en parallèle.
 */
export function AdSenseLoader() {
  if (!ADS.enabled || !ADS.client) return null;

  return (
    <Script
      id="adsense"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}`}
    />
  );
}
