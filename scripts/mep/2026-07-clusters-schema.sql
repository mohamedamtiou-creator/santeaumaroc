-- =============================================================================
-- MEP « Clusters de contenu santé » — SCHÉMA (DDL)
-- PostgreSQL. Idempotent (IF NOT EXISTS / garde d'exception sur la FK).
-- À lancer UNE fois sur la base PROD avant le script de données.
-- Équivalent SQL de `prisma db push` pour ces changements.
-- =============================================================================

-- 1) Angles « comment traiter » / « comment prévenir » + maillage topic↔topic
ALTER TABLE "health_topics"
  ADD COLUMN IF NOT EXISTS "treatmentSummary"    TEXT,
  ADD COLUMN IF NOT EXISTS "treatmentSteps"      TEXT,
  ADD COLUMN IF NOT EXISTS "treatmentSummaryAr"  TEXT,
  ADD COLUMN IF NOT EXISTS "treatmentStepsAr"    TEXT,
  ADD COLUMN IF NOT EXISTS "preventionSummary"   TEXT,
  ADD COLUMN IF NOT EXISTS "preventionSteps"     TEXT,
  ADD COLUMN IF NOT EXISTS "preventionSummaryAr" TEXT,
  ADD COLUMN IF NOT EXISTS "preventionStepsAr"   TEXT,
  ADD COLUMN IF NOT EXISTS "relatedTopicSlugs"   TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2) Guides « Quand consulter un [spécialité] ? »
CREATE TABLE IF NOT EXISTS "specialty_guides" (
  "id"              TEXT NOT NULL,
  "specialtyId"     TEXT NOT NULL,
  "shortAnswer"     TEXT NOT NULL,
  "reasons"         TEXT NOT NULL,
  "redFlags"        TEXT NOT NULL,
  "whenToConsult"   TEXT,
  "faqJson"         TEXT,
  "sources"         TEXT,
  "relatedSlugs"    TEXT[] DEFAULT ARRAY[]::TEXT[],
  "shortAnswerAr"   TEXT,
  "reasonsAr"       TEXT,
  "redFlagsAr"      TEXT,
  "whenToConsultAr" TEXT,
  "faqJsonAr"       TEXT,
  "sourcesAr"       TEXT,
  "arReviewedAt"    TIMESTAMP(3),
  "reviewedAt"      TIMESTAMP(3),
  "status"          TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "specialty_guides_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "specialty_guides_specialtyId_key"
  ON "specialty_guides" ("specialtyId");

DO $$ BEGIN
  ALTER TABLE "specialty_guides"
    ADD CONSTRAINT "specialty_guides_specialtyId_fkey"
    FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
