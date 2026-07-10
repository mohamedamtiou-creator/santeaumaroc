/**
 * Configuration Google AdSense — pilotage 100 % par variables d'environnement
 * (convention `NEXT_PUBLIC_*` du projet, cf. `.env.example`).
 *
 * Tout est à OFF par défaut : tant qu'on n'active pas explicitement les flags,
 * AUCUN script ni encart n'est chargé (impact zéro sur perf, SEO, conversion).
 *
 * Rappel stratégique (cf. étude d'opportunité) : la pub est cantonnée à
 * l'éditorial (blog, Q/R). Elle ne doit JAMAIS apparaître sur une page qui mène
 * à un rendez-vous (fiches, listes, tunnel, comptes, paiement). C'est garanti
 * en n'appelant `AdSlot`/`InArticleAds` que depuis les pages éditoriales.
 *
 * ⚠️ CSP : le site applique une CSP stricte dans `next.config.ts`. Sans y
 * whitelister les domaines Google Ads, le navigateur bloquera AdSense. Ne le
 * faire QUE lorsque `NEXT_PUBLIC_ADS_ENABLED=true` (surface d'attaque minimale).
 */

export const ADS = {
  /** Interrupteur maître. Une seule variable coupe toute la pub du site. */
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",

  /** Identifiant client AdSense (`ca-pub-XXXXXXXXXXXXXXXX`). Absent = pub off. */
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",

  /** Activation fine par type de page (déploiement progressif, cf. plan phases). */
  surfaces: {
    blog: process.env.NEXT_PUBLIC_ADS_BLOG === "true",
    questions: process.env.NEXT_PUBLIC_ADS_QUESTIONS === "true",
  },

  /** Slot ID de l'unité « in-article » créée dans le compte AdSense. */
  inArticleSlot: process.env.NEXT_PUBLIC_ADSENSE_INARTICLE_SLOT ?? "",
} as const;

export type AdSurface = keyof typeof ADS.surfaces;

/**
 * Garde unique réutilisée partout : ne rend un encart QUE si tout est réuni
 * — interrupteur maître ON, client renseigné, ET la surface activée.
 * À appeler dans la page avant de monter `InArticleAds`/`AdSlot`.
 */
export function adsActive(surface: AdSurface): boolean {
  return ADS.enabled && ADS.client.length > 0 && ADS.surfaces[surface];
}
