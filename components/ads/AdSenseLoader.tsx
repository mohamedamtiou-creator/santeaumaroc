import Script from "next/script";
import { ADS } from "@/lib/ads/config";

/**
 * Charge le script AdSense UNE seule fois, en `strategy="lazyOnload"` → il ne
 * démarre qu'une fois la page chargée (pendant l'idle du navigateur), donc il
 * n'entre JAMAIS en concurrence réseau/CPU avec le LCP. Le script (~190 KB avec
 * ses dépendances show_ads_impl + Funding Choices) est ce qui pénalisait le plus
 * le LCP mobile 4G ; `lazyOnload` le repousse hors du chemin critique.
 * `next/script` déduplique via l'`id`.
 *
 * Où le monter : UNIQUEMENT là où un encart s'affiche réellement, c.-à-d. depuis
 * `InArticleAds` (pages blog, quand `adsActive("blog")`). NE PAS le remettre dans
 * le layout racine : il se chargerait alors sur les 20 000+ fiches / listings
 * (aucune pub servie) et rebrancherait le drag LCP sur tout le site.
 *
 * `AdSlot` fonctionne avec `lazyOnload` : ses `push({})` s'empilent dans le
 * tableau `window.adsbygoogle` (créé avant le script) et sont drainés au chargement.
 *
 * ⚠️ Ne se rend que si `ADS.enabled` ET `ADS.client` sont posés. Ne pas oublier
 * d'assouplir la CSP (`next.config.ts`) pour les domaines Google Ads en parallèle.
 */
export function AdSenseLoader() {
  if (!ADS.enabled || !ADS.client) return null;

  return (
    <Script
      id="adsense"
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}`}
    />
  );
}
