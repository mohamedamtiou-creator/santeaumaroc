-- =============================================================================
-- MEP « Clusters de contenu santé » — SCHÉMA (DDL) — version COMPLÈTE & idempotente
-- PostgreSQL. Aligne health_topics sur le schéma courant (comble aussi les colonnes
-- des sessions antérieures non déployées : intentSlug, blocs AR, etc.) + crée
-- specialty_guides. `ADD COLUMN IF NOT EXISTS` = n'ajoute que le manquant, sans risque.
--
-- ⚠️ RECOMMANDÉ : si tu as accès à Prisma sur la prod, préfère `npx prisma db push`
--    (config prod) → réconcilie TOUT le schéma (toutes tables), pas seulement
--    health_topics. Ce script SQL ne corrige que health_topics + specialty_guides ;
--    d'autres tables (MedicalExam, Treatment, GlossaryTerm…) peuvent aussi être en
--    retard en prod et provoquer des erreurs P2022 similaires.
-- =============================================================================

-- 1) health_topics : toutes les colonnes du modèle courant (idempotent)
ALTER TABLE "health_topics"
  ADD COLUMN IF NOT EXISTS "kind" TEXT,
  ADD COLUMN IF NOT EXISTS "term" TEXT,
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "shortAnswer" TEXT,
  ADD COLUMN IF NOT EXISTS "causes" TEXT,
  ADD COLUMN IF NOT EXISTS "redFlags" TEXT,
  ADD COLUMN IF NOT EXISTS "whenToConsult" TEXT,
  ADD COLUMN IF NOT EXISTS "faqJson" TEXT,
  ADD COLUMN IF NOT EXISTS "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "specialtyId" TEXT,
  ADD COLUMN IF NOT EXISTS "relatedSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "glossarySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "sources" TEXT,
  ADD COLUMN IF NOT EXISTS "termAr" TEXT,
  ADD COLUMN IF NOT EXISTS "shortAnswerAr" TEXT,
  ADD COLUMN IF NOT EXISTS "causesAr" TEXT,
  ADD COLUMN IF NOT EXISTS "redFlagsAr" TEXT,
  ADD COLUMN IF NOT EXISTS "whenToConsultAr" TEXT,
  ADD COLUMN IF NOT EXISTS "faqJsonAr" TEXT,
  ADD COLUMN IF NOT EXISTS "sourcesAr" TEXT,
  ADD COLUMN IF NOT EXISTS "arReviewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PUBLISHED',
  ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "intentSlug" TEXT,
  ADD COLUMN IF NOT EXISTS "intentQuestion" TEXT,
  ADD COLUMN IF NOT EXISTS "intentAnswer" TEXT,
  ADD COLUMN IF NOT EXISTS "intentQuestionAr" TEXT,
  ADD COLUMN IF NOT EXISTS "intentAnswerAr" TEXT,
  ADD COLUMN IF NOT EXISTS "relatedTopicSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "treatmentSummary" TEXT,
  ADD COLUMN IF NOT EXISTS "treatmentSteps" TEXT,
  ADD COLUMN IF NOT EXISTS "treatmentSummaryAr" TEXT,
  ADD COLUMN IF NOT EXISTS "treatmentStepsAr" TEXT,
  ADD COLUMN IF NOT EXISTS "preventionSummary" TEXT,
  ADD COLUMN IF NOT EXISTS "preventionSteps" TEXT,
  ADD COLUMN IF NOT EXISTS "preventionSummaryAr" TEXT,
  ADD COLUMN IF NOT EXISTS "preventionStepsAr" TEXT;

-- Index de health_topics (idempotents)
CREATE UNIQUE INDEX IF NOT EXISTS "health_topics_slug_key" ON "health_topics" ("slug");
CREATE INDEX IF NOT EXISTS "health_topics_kind_status_term_idx" ON "health_topics" ("kind", "status", "term");
CREATE INDEX IF NOT EXISTS "health_topics_specialtyId_status_idx" ON "health_topics" ("specialtyId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "health_topics_intentSlug_key" ON "health_topics" ("intentSlug");

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
