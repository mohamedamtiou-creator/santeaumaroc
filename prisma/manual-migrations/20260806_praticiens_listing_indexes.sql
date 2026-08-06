-- Index du listing praticiens : alignement sur le tri RÉELLEMENT exécuté
-- =====================================================================
--
-- CONSTAT
-- Les quatre index composites déclarés dans schema.prisma prétendent couvrir le
-- tri du listing :
--     doctors_isActive_isVerified_averageRating_idx
--     doctors_isActive_specialtyId_isVerified_averageRating_idx
--     doctors_isActive_cityId_isVerified_averageRating_idx
--     doctors_isActive_specialtyId_reviewsCount_idx
--
-- Or le ORDER BY effectif (lib/praticiens-query.ts, lib/ville-doctors.ts,
-- lib/specialite-doctors.ts) commence TOUJOURS par "featuredUntil", puis
-- "planActivatedAt" — deux colonnes absentes de tout index. Un B-tree ne sert un
-- tri que si ses colonnes de tête correspondent aux premières clés du ORDER BY :
-- ces quatre index ne servent donc aucun tri. Postgres retombe sur un scan +
-- tri complet des ~19 800 lignes actives, même pour un LIMIT 25.
--
-- CORRECTIF
-- Index PARTIELS (WHERE "isActive") ordonnés exactement comme le ORDER BY, y
-- compris DESC NULLS LAST sur les deux colonnes nullables. Ni la clause partielle
-- ni l'ordonnancement des NULL ne sont exprimables dans schema.prisma — d'où ce
-- fichier SQL. Un bloc de commentaires les recense au-dessus du modèle Doctor.
--
-- ⚠️ PRISMA : ces index sont INVISIBLES pour Prisma. `prisma migrate dev` et
--    `prisma db push` chercheront à les supprimer (ils ne figurent pas dans le
--    schéma). Rejouer ce fichier après toute opération de ce type.
--
-- ⚠️ APPLICATION : CREATE INDEX CONCURRENTLY ne peut PAS s'exécuter dans une
--    transaction — ce fichier n'a donc volontairement ni BEGIN ni COMMIT.
--    À lancer instruction par instruction (psql sans -1). CONCURRENTLY ne pose
--    pas de verrou d'écriture : sûr en production, simplement plus lent.
--    En cas d'échec, un index reste « INVALID » : le supprimer et relancer.
--
-- APPLICATION EN DEUX TEMPS (recommandé)
--    Étape 1 → sections A et B (purement ADDITIVES, aucun risque).
--    Étape 2 → section C (DROP), seulement après avoir vérifié par EXPLAIN que
--              les nouveaux index sont bien empruntés. Voir requêtes en fin de
--              fichier.

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION A — Tri du listing (additif)
-- ─────────────────────────────────────────────────────────────────────────────

-- A1. Listing global non filtré : /praticiens
--     WHERE "isActive" ORDER BY featuredUntil DESC NULLS LAST, planActivatedAt
--     DESC NULLS LAST, isVerified DESC, averageRating DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "doctors_listing_sort_idx"
  ON "doctors" (
    "featuredUntil"   DESC NULLS LAST,
    "planActivatedAt" DESC NULLS LAST,
    "isVerified"      DESC,
    "averageRating"   DESC
  )
  WHERE "isActive";

-- A2. Listing filtré par spécialité : /specialites/[slug], /praticiens?specialite=
CREATE INDEX CONCURRENTLY IF NOT EXISTS "doctors_listing_specialty_sort_idx"
  ON "doctors" (
    "specialtyId",
    "featuredUntil"   DESC NULLS LAST,
    "planActivatedAt" DESC NULLS LAST,
    "isVerified"      DESC,
    "averageRating"   DESC
  )
  WHERE "isActive";

-- A3. Listing filtré par ville : /villes/[slug], /praticiens?ville=
CREATE INDEX CONCURRENTLY IF NOT EXISTS "doctors_listing_city_sort_idx"
  ON "doctors" (
    "cityId",
    "featuredUntil"   DESC NULLS LAST,
    "planActivatedAt" DESC NULLS LAST,
    "isVerified"      DESC,
    "averageRating"   DESC
  )
  WHERE "isActive";

-- A4. Spécialité + ville : /specialites/[slug]/[ville]
CREATE INDEX CONCURRENTLY IF NOT EXISTS "doctors_listing_specialty_city_sort_idx"
  ON "doctors" (
    "specialtyId",
    "cityId",
    "featuredUntil"   DESC NULLS LAST,
    "planActivatedAt" DESC NULLS LAST,
    "isVerified"      DESC,
    "averageRating"   DESC
  )
  WHERE "isActive";

-- A5. Tri « mieux notés » (tri=note) — lib/specialite-doctors.ts:55
--     ORDER BY featuredUntil DESC NULLS LAST, averageRating DESC, isVerified DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "doctors_listing_specialty_rating_idx"
  ON "doctors" (
    "specialtyId",
    "featuredUntil" DESC NULLS LAST,
    "averageRating" DESC,
    "isVerified"    DESC
  )
  WHERE "isActive";

-- A6. Tri « plus d'avis » (tri=avis) — lib/specialite-doctors.ts:57
--     ORDER BY featuredUntil DESC NULLS LAST, reviewsCount DESC, averageRating DESC
--     Remplace doctors_isActive_specialtyId_reviewsCount_idx, qui ne menait pas
--     par featuredUntil et ne servait donc pas ce tri.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "doctors_listing_specialty_reviews_idx"
  ON "doctors" (
    "specialtyId",
    "featuredUntil" DESC NULLS LAST,
    "reviewsCount"  DESC,
    "averageRating" DESC
  )
  WHERE "isActive";

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION B — Recherche texte (additif)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- lib/praticiens-query.ts génère, pour `?q=` :
--     nom ILIKE '%q%' OR prenom ILIKE '%q%' OR specialty.name ILIKE '%q%'
-- Le joker en tête interdit tout B-tree → scan séquentiel des ~19 800 lignes.
-- pg_trgm + GIN rend ces prédicats indexables.
--
-- NB : "specialties"."name" n'est PAS indexé ici — la table ne compte que ~97
-- lignes, un scan y est négligeable.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "doctors_nom_trgm_idx"
  ON "doctors" USING gin ("nom" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS "doctors_prenom_trgm_idx"
  ON "doctors" USING gin ("prenom" gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION C — Suppression des index morts (À N'EXÉCUTER QU'APRÈS VÉRIFICATION)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Chacun est strictement dominé par un index de la section A : même préfixe de
-- filtrage, et en plus le tri. Ils ne coûtent aujourd'hui que de l'écriture et du
-- stockage. Les retirer AUSSI de schema.prisma (fait dans le même commit), sinon
-- le prochain `prisma db push` les recrée.
--
-- Vérifier d'abord, sur la base cible :
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT id FROM doctors WHERE "isActive"
--   ORDER BY "featuredUntil" DESC NULLS LAST, "planActivatedAt" DESC NULLS LAST,
--            "isVerified" DESC, "averageRating" DESC
--   LIMIT 25;
--   -- attendu : « Index Scan using doctors_listing_sort_idx », SANS nœud « Sort »
--
-- Puis, si et seulement si le plan est conforme :

-- DROP INDEX CONCURRENTLY IF EXISTS "doctors_isActive_isVerified_averageRating_idx";
-- DROP INDEX CONCURRENTLY IF EXISTS "doctors_isActive_specialtyId_isVerified_averageRating_idx";
-- DROP INDEX CONCURRENTLY IF EXISTS "doctors_isActive_cityId_isVerified_averageRating_idx";
-- DROP INDEX CONCURRENTLY IF EXISTS "doctors_isActive_specialtyId_reviewsCount_idx";

-- ─────────────────────────────────────────────────────────────────────────────
-- Contrôle post-application
-- ─────────────────────────────────────────────────────────────────────────────
--   SELECT indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
--   FROM pg_stat_user_indexes WHERE relname = 'doctors' ORDER BY idx_scan;
--   -- les index de la section A doivent voir idx_scan croître ; ceux de la
--   -- section C rester à 0.
