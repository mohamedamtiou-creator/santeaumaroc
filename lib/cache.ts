import { unstable_cache } from "next/cache";
import { processCache } from "@/lib/process-cache";

/**
 * Requête mise en cache à DEUX niveaux — le patron de scalabilité du site
 * (déjà utilisé tel quel sur la home : getStats/getLatestPosts…), factorisé.
 *
 *  - `unstable_cache` (extérieur) = Vercel Data Cache, DURABLE : survit aux cold
 *    starts serverless et se partage entre instances. C'est LA couche qui compte
 *    en prod — `processCache` seul (adossé à globalThis) est recréé à chaque cold
 *    start, donc inopérant en serverless.
 *  - `processCache` (intérieur) = LRU mémoire per-instance : absorbe les requêtes
 *    chaudes rapprochées et évite le miss Data Cache en dev (vidé à chaque HMR).
 *
 * ⚠️ CONTRAINTE DE SÉRIALISATION — le Data Cache sérialise en JSON :
 *   - `Date`            → OK, Next révive les Date (cf. home `getLatestPosts`).
 *   - `Prisma.Decimal`  → ❌ perd son prototype à la désérialisation, ensuite
 *     `.toFixed()` / `.toNumber()` PLANTENT. Seuls champs concernés :
 *     `Doctor.prix`, `Medication.ppv/ph/prixBR`. ⇒ TOUJOURS les convertir en
 *     `number` via {@link decToNum} DANS `fn`, avant de retourner.
 *
 * @param key         Clé unique. DOIT inclure tout paramètre variable (slug,
 *                    locale, page…) : `fn` est une closure sans argument, donc
 *                    rien n'est ajouté automatiquement à la clé.
 * @param revalidate  TTL en secondes (partagé Data Cache + processCache).
 * @param fn          Producteur. Ne DOIT retourner que du JSON-safe (cf. supra).
 * @param tags        Tags d'invalidation (`revalidateTag`). Défaut : `[key]`.
 */
export function cachedQuery<T>(
  key: string,
  revalidate: number,
  fn: () => Promise<T>,
  tags?: string[],
): Promise<T> {
  return unstable_cache(
    () => processCache(key, revalidate, fn),
    [key],
    { revalidate, tags: tags ?? [key] },
  )();
}

/**
 * Prisma `Decimal` (ou number/null) → `number | null`, JSON-safe pour le cache.
 * À appliquer dans une fonction cachée sur tout champ `@db.Decimal` (Doctor.prix…)
 * avant de retourner l'objet — sinon `.toFixed()` plante après désérialisation.
 */
export function decToNum(
  v: { toNumber(): number } | number | string | null | undefined,
): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return v.toNumber();
}
