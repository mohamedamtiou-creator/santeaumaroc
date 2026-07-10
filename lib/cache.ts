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
 *   - `Date`            → sérialisée en STRING ISO. Au HIT Data Cache, le champ
 *     revient donc en `string`, pas en `Date` → `.toISOString()`/`Intl.format()`
 *     PLANTENT. On les REVIVE automatiquement à la sortie ({@link reviveDates}),
 *     pour que le runtime respecte le type Prisma déclaré (`Date`). Les
 *     consommateurs n'ont RIEN à faire.
 *   - `Prisma.Decimal`  → ❌ perd son prototype à la désérialisation, ensuite
 *     `.toFixed()` / `.toNumber()` PLANTENT (et une string ISO revive à tort en
 *     Date — pas un Decimal). ⇒ TOUJOURS les convertir en `number` via
 *     {@link decToNum} DANS `fn`, avant de retourner. Champs concernés :
 *     `Doctor.prix`, `Medication.ppv/ph/prixBR`.
 *
 * @param key         Clé unique. DOIT inclure tout paramètre variable (slug,
 *                    locale, page…) : `fn` est une closure sans argument, donc
 *                    rien n'est ajouté automatiquement à la clé.
 * @param revalidate  TTL en secondes (partagé Data Cache + processCache).
 * @param fn          Producteur. `Decimal`→`number` obligatoire ; `Date` OK
 *                    (revivée en sortie).
 * @param tags        Tags d'invalidation (`revalidateTag`). Défaut : `[key]`.
 */
export async function cachedQuery<T>(
  key: string,
  revalidate: number,
  fn: () => Promise<T>,
  tags?: string[],
): Promise<T> {
  const result = await unstable_cache(
    () => processCache(key, revalidate, fn),
    [key],
    { revalidate, tags: tags ?? [key] },
  )();
  // Au HIT Data Cache, `result` est du JSON désérialisé (Date→string). Sur le
  // chemin LRU mémoire (même process), `result` garde ses vrais objets Date.
  // reviveDates normalise les deux → toujours des Date là où Prisma en promet.
  return reviveDates(result);
}

// Chaîne ISO 8601 complète (avec `T` + fuseau) telle que produite par
// `JSON.stringify(date)` sur un `Date` Prisma. Volontairement STRICTE : ne matche
// PAS une date seule « 2026-06-28 » (contenu éditorial `reviewed`…) ni un slug/texte.
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Reconvertit en `Date` les strings ISO datetime issues de la sérialisation JSON
 * du Data Cache (parcours en profondeur : objets, tableaux). Les vrais `Date`
 * (chemin LRU mémoire) et toutes les autres valeurs sont laissés intacts.
 */
function reviveDates<T>(value: T): T {
  if (typeof value === "string") {
    return (ISO_DATETIME.test(value) ? new Date(value) : value) as T;
  }
  if (value === null || typeof value !== "object" || value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = reviveDates(value[i]);
    return value;
  }
  const obj = value as Record<string, unknown>;
  for (const k in obj) obj[k] = reviveDates(obj[k]);
  return value;
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
