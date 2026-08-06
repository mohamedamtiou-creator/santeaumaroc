import { revalidatePath, revalidateTag } from "next/cache";
import { LOCALES } from "@/lib/locale";

/**
 * Invalidation à la demande — point d'entrée UNIQUE des mutations.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POURQUOI CE MODULE EXISTE : `revalidatePath("/blog")` ne marchait pas
 * ─────────────────────────────────────────────────────────────────────────────
 * Les URLs publiques FR n'ont pas de préfixe de locale (`/blog`), mais `proxy.ts`
 * les réécrit vers `/fr/blog` avant le rendu. Or Next indexe le cache ISR sur le
 * chemin RÉELLEMENT rendu, pas sur celui de la barre d'adresse. Vérifié dans
 * `next/dist/server/lib/implicit-tags.js` : les tags implicites d'une page sont
 * dérivés du `pathname` de rendu — donc `_N_T_/fr/blog`, jamais `_N_T_/blog` —
 * tandis que `revalidatePath("/blog")` émet exactement `_N_T_/blog`
 * (`next/dist/server/web/spec-extension/revalidate.js`).
 *
 * Conséquence : tous les appels FR du dépôt étaient des NO-OP sur le cache ISR.
 * Seules les variantes `/ar/...` fonctionnaient (elles matchent nativement le
 * segment `[lang]=ar`). La documentation Next le dit d'ailleurs pour les
 * rewrites : « you must pass the destination path, not the source path ».
 *
 * L'effet ne se voyait pas en test manuel : `revalidatePath` positionne aussi
 * `pathWasRevalidated`, donc l'auteur de la mutation voit SON écran se
 * rafraîchir. C'est le cache servi aux AUTRES visiteurs qui restait périmé,
 * jusqu'à expiration du TTL — d'où des fenêtres de revalidation courtes (1 h)
 * qui portaient à elles seules toute la fraîcheur du site, et facturaient en
 * conséquence (chaque page pré-rendue = 13 objets réécrits par cycle).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DEUX CACHES DISTINCTS, DEUX INVALIDATIONS
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. Le cache de ROUTE (le HTML/RSC pré-rendu)  → `revalidatePath`, par locale.
 *  2. Le Data Cache (`cachedQuery` / `unstable_cache`) → `revalidateTag`.
 *
 * `revalidatePath` NE purge PAS le second : une page réinvalidée se re-rendrait
 * avec les mêmes données périmées. Les deux sont donc toujours émis ensemble par
 * les invalidateurs ci-dessous. C'est ce couplage qui rend sûr l'allongement des
 * TTL de `lib/cache-ttl.ts`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NE PAS FAIRE
 * ─────────────────────────────────────────────────────────────────────────────
 *  - `revalidatePath("/", "layout")` : purge le SITE entier (~10 000 pages), soit
 *    130 000 objets ISR réécrits pour une seule mutation. Cf. `lib/locale-action.ts`.
 *  - `revalidatePath("/sitemap.xml")` : cette route n'existe pas. Les sitemaps
 *    sont segmentés (`generateSitemaps`) et servis à `/sitemap/<id>.xml`.
 *    Utiliser {@link revalidateSitemaps}.
 */

/** Segments produits par `generateSitemaps()` dans `app/sitemap.ts`. */
const SITEMAP_SEGMENTS = ["core", "doctors", "combos", "content"] as const;

/**
 * `revalidateTag` en sémantique stale-while-revalidate.
 *
 * Le profil `"max"` est requis depuis Next 16 : l'appel à un seul argument est
 * déprécié (avertissement console) ET expire l'entrée immédiatement, ce qui rend
 * la requête suivante bloquante. Avec `"max"`, l'entrée est marquée périmée et la
 * page suivante sert l'ancienne version pendant que la fraîche se calcule en
 * tâche de fond — pas de pic de latence pour le visiteur qui tombe juste après
 * une mutation.
 *
 * `updateTag` n'est PAS utilisable ici : il lève hors Server Action, or plusieurs
 * appelants sont des Route Handlers (`app/api/upload/avatar`, la publication
 * planifiée du cron).
 */
export function revalidateData(...tags: string[]): void {
  for (const tag of tags) revalidateTag(tag, "max");
}

/**
 * Invalide le cache de route d'un chemin PUBLIC, dans les deux locales.
 *
 * @param path chemin sans préfixe de locale, commençant par « / » (« / » pour
 *             l'accueil). C'est la forme utilisée partout dans l'app ; la
 *             traduction vers `/fr/...` et `/ar/...` est faite ici.
 */
export function revalidateLocalizedPath(path: string): void {
  for (const lang of LOCALES) {
    revalidatePath(path === "/" ? `/${lang}` : `/${lang}${path}`);
  }
}

/** Idem pour plusieurs chemins d'un coup. */
export function revalidateLocalizedPaths(...paths: string[]): void {
  for (const path of paths) revalidateLocalizedPath(path);
}

/**
 * Invalide les quatre segments de sitemap. À appeler quand une URL entre ou sort
 * du périmètre indexable (publication, dépublication, suppression) — pas sur une
 * simple édition de contenu, qui ne change pas la liste des URLs.
 */
export function revalidateSitemaps(): void {
  for (const id of SITEMAP_SEGMENTS) revalidatePath(`/sitemap/${id}.xml`);
}

/* ══════════════════════════════════════════════════════════════════════════
   Invalidateurs par domaine
   Chacun couvre les DEUX caches et les DEUX locales. Les clés de tag doivent
   rester alignées sur les clés `cachedQuery` correspondantes — elles sont
   rappelées en commentaire au-dessus de chaque fonction.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Fiche praticien. Tag de données : `doctor:{slug}`
 * (cf. `app/[lang]/(site)/praticiens/[slug]/page.tsx`).
 *
 * Les listings ne sont PAS invalidés ici : ils portent le tag `doctors`, qui
 * couvre des dizaines de milliers d'entrées paginées. Une modification de fiche
 * ne justifie pas de les purger — leur TTL (`TTL.LISTING`) s'en charge.
 */
export function revalidateDoctor(slug: string | null | undefined): void {
  if (!slug) return;
  revalidateData(`doctor:${slug}`);
  revalidateLocalizedPaths(`/praticiens/${slug}`, `/praticiens/${slug}/rdv`);
}

/**
 * Compteurs et listes d'un couple spécialité × ville. Tags de données :
 * `specialite:*`, `ville:*` (cf. les pages spécialité/ville et
 * `lib/specialty-cities.ts`, `lib/city-alpha-index.ts`).
 *
 * Appelé quand un médecin est activé, désactivé ou change de rattachement —
 * c'est ce qui fait bouger les compteurs affichés et l'indexabilité des combos.
 */
export function revalidateDirectory(
  specialtySlug?: string | null,
  citySlug?: string | null,
): void {
  if (specialtySlug) {
    revalidateData(
      `specialite:meta:${specialtySlug}`,
      `specialite:count:${specialtySlug}`,
      `specialite:related:${specialtySlug}`,
      `specialite:cities:${specialtySlug}`,
    );
    revalidateLocalizedPath(`/specialites/${specialtySlug}`);
  }
  if (citySlug) {
    revalidateData(
      `ville:meta:${citySlug}`,
      `ville:meta2:${citySlug}`,
      `ville:alpha:buckets:${citySlug}`,
    );
    revalidateLocalizedPath(`/villes/${citySlug}`);
  }
  if (specialtySlug && citySlug) {
    revalidateData(`specialite:count:${specialtySlug}:${citySlug}`);
    revalidateLocalizedPath(`/specialites/${specialtySlug}/${citySlug}`);
  }
}

/** Article de blog. Tag de données : `posts` (index + articles liés). */
export function revalidateBlogPost(slug: string, opts?: { indexChanged?: boolean }): void {
  revalidateData("posts", `blog-post:${slug}`);
  revalidateLocalizedPaths("/blog", `/blog/${slug}`, "/");
  if (opts?.indexChanged) revalidateSitemaps();
}

/** Question / réponse. Tag de données : `qa-home` (compteurs de l'index). */
export function revalidateQuestion(slug: string, opts?: { indexChanged?: boolean }): void {
  revalidateData("qa-home", `question:${slug}`);
  revalidateLocalizedPaths("/questions", `/questions/${slug}`);
  if (opts?.indexChanged) revalidateSitemaps();
}

/**
 * Contenu santé éditorial (glossaire, symptômes, maladies, examens,
 * traitements, pages intention/prévention). `paths` = chemins publics touchés.
 */
export function revalidateHealthContent(
  paths: string[],
  opts?: { tags?: string[]; indexChanged?: boolean },
): void {
  if (opts?.tags?.length) revalidateData(...opts.tags);
  revalidateLocalizedPaths(...paths);
  if (opts?.indexChanged) revalidateSitemaps();
}

/** Fiche établissement (clinique, pharmacie, laboratoire). */
export function revalidateEstablishment(section: string, slug: string): void {
  revalidateData(`establishment:${slug}`);
  revalidateLocalizedPath(`/${section}/${slug}`);
}

/** Fiche médicament. */
export function revalidateMedication(slug: string): void {
  revalidateData(`medication:${slug}`);
  revalidateLocalizedPath(`/medicaments/${slug}`);
}

/** Page auteur (signature éditoriale). */
export function revalidateAuthor(authorSlug: string | null | undefined): void {
  if (!authorSlug) return;
  revalidateLocalizedPaths("/auteur", `/auteur/${authorSlug}`);
}
