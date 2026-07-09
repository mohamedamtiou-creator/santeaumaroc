/**
 * In-process cache borné (LRU + TTL) adossé à globalThis.
 *
 * WHY globalThis : Next.js dev (Turbopack) vide son LRU interne (`unstable_cache`
 * / `'use cache'`) à chaque hot-reload → cache-miss = aller-retour DB complet sur
 * chaque requête chaude en dev (1,4–1,7 s observés). `globalThis` survit aux
 * re-évaluations de module (même pattern que le singleton Prisma).
 *
 * WHY borné : les clés incluent slug × ville × page × tri × filtres × jour →
 * espace combinatoire énorme. Sans borne, la Map ne fait que croître en prod
 * (process long-vécu, `revalidate 3600`), chaque entrée retenant des objets
 * Doctor complets (avec Decimal) → fuite mémoire. On plafonne + éviction LRU.
 *
 * Production : `unstable_cache` / `'use cache'` par-dessus fourniraient
 * l'invalidation par tag et la déduplication cross-requête — hors périmètre ici
 * (les Decimal casseraient la sérialisation JSON de `unstable_cache`).
 */

const MAX_ENTRIES = Number(process.env.PROCESS_CACHE_MAX) || 1000;

type Entry = { v: unknown; exp: number };

// Map (et non Record) : itère dans l'ordre d'INSERTION → la 1re clé est la moins
// récemment utilisée, d'où une éviction LRU O(1). delete/get/set en O(1).
const _g = globalThis as unknown as { __santeProcessCache?: Map<string, Entry> };
// Garde de transition : une ancienne version stockait un Record. Après un HMR,
// globalThis peut encore le porter → on le remplace par une Map (sinon .get/.set
// n'existent pas et la requête suivante crashe). En prod (process neuf) : no-op.
if (!(_g.__santeProcessCache instanceof Map)) {
  _g.__santeProcessCache = new Map<string, Entry>();
}
const store = _g.__santeProcessCache;

/**
 * Retourne la valeur en cache (non expirée) ou exécute `fn`, la stocke et la retourne.
 *
 * @param key      Clé unique — inclure toutes les entrées qui influent sur le résultat.
 * @param ttlSec   Durée de vie en secondes.
 * @param fn       Producteur async appelé en cas de miss.
 */
export async function processCache<T>(
  key: string,
  ttlSec: number,
  fn: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit) {
    if (now < hit.exp) {
      // LRU « touch » : réinsère en fin de Map = marqué comme plus récent.
      store.delete(key);
      store.set(key, hit);
      return hit.v as T;
    }
    store.delete(key); // expiré → purge paresseuse
  }

  const v = await fn();
  store.set(key, { v, exp: now + ttlSec * 1_000 });

  // Éviction : au-delà de la borne, retire les entrées les plus anciennes
  // (têtes de Map = moins récemment utilisées).
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) break;
    store.delete(oldest);
  }

  return v;
}

/** Invalide manuellement une ou plusieurs clés (ex. après une mutation admin). */
export function invalidateProcessCache(...keys: string[]) {
  for (const k of keys) store.delete(k);
}
