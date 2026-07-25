-- =============================================================================
-- MEP — Alignement schéma d'autres tables (idempotent). Généré depuis local.
-- Tables : medical_exams, treatments, glossary_terms
-- =============================================================================
SET client_min_messages = WARNING;

-- ── medical_exams ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "medical_exams" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general'::text,
  "shortAnswer" TEXT NOT NULL,
  "indications" TEXT NOT NULL,
  "procedure" TEXT NOT NULL,
  "preparation" TEXT,
  "precautions" TEXT,
  "durationMin" INTEGER,
  "priceMin" INTEGER,
  "priceMax" INTEGER,
  "reimbursement" TEXT,
  "faqJson" TEXT,
  "synonyms" TEXT[] DEFAULT ARRAY[]::text[],
  "specialtyId" TEXT,
  "relatedSlugs" TEXT[] DEFAULT ARRAY[]::text[],
  "glossarySlugs" TEXT[] DEFAULT ARRAY[]::text[],
  "sources" TEXT,
  "nameAr" TEXT,
  "shortAnswerAr" TEXT,
  "indicationsAr" TEXT,
  "procedureAr" TEXT,
  "preparationAr" TEXT,
  "precautionsAr" TEXT,
  "reimbursementAr" TEXT,
  "faqJsonAr" TEXT,
  "sourcesAr" TEXT,
  "arReviewedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED'::text,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "medical_exams_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'general'::text NOT NULL;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "shortAnswer" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "indications" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "procedure" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "preparation" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "precautions" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "durationMin" INTEGER;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "priceMin" INTEGER;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "priceMax" INTEGER;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "reimbursement" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "faqJson" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "synonyms" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "specialtyId" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "relatedSlugs" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "glossarySlugs" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "sources" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "nameAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "shortAnswerAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "indicationsAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "procedureAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "preparationAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "precautionsAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "reimbursementAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "faqJsonAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "sourcesAr" TEXT;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "arReviewedAt" TIMESTAMP(3);
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PUBLISHED'::text NOT NULL;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "medical_exams" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS medical_exams_slug_key ON public.medical_exams USING btree (slug);
CREATE INDEX IF NOT EXISTS medical_exams_category_status_idx ON public.medical_exams USING btree (category, status);
CREATE INDEX IF NOT EXISTS "medical_exams_specialtyId_status_idx" ON public.medical_exams USING btree ("specialtyId", status);
CREATE INDEX IF NOT EXISTS medical_exams_status_name_idx ON public.medical_exams USING btree (status, name);
DO $$ BEGIN
  ALTER TABLE "medical_exams" ADD CONSTRAINT "medical_exams_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES specialties(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── treatments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "treatments" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general'::text,
  "shortAnswer" TEXT NOT NULL,
  "options" TEXT NOT NULL,
  "duration" TEXT,
  "sideEffects" TEXT,
  "redFlags" TEXT,
  "whenToConsult" TEXT,
  "faqJson" TEXT,
  "synonyms" TEXT[] DEFAULT ARRAY[]::text[],
  "specialtyId" TEXT,
  "relatedSlugs" TEXT[] DEFAULT ARRAY[]::text[],
  "glossarySlugs" TEXT[] DEFAULT ARRAY[]::text[],
  "sources" TEXT,
  "nameAr" TEXT,
  "shortAnswerAr" TEXT,
  "optionsAr" TEXT,
  "durationAr" TEXT,
  "sideEffectsAr" TEXT,
  "redFlagsAr" TEXT,
  "whenToConsultAr" TEXT,
  "faqJsonAr" TEXT,
  "sourcesAr" TEXT,
  "arReviewedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED'::text,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'general'::text NOT NULL;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "shortAnswer" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "options" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "duration" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "sideEffects" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "redFlags" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "whenToConsult" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "faqJson" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "synonyms" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "specialtyId" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "relatedSlugs" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "glossarySlugs" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "sources" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "nameAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "shortAnswerAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "optionsAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "durationAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "sideEffectsAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "redFlagsAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "whenToConsultAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "faqJsonAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "sourcesAr" TEXT;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "arReviewedAt" TIMESTAMP(3);
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PUBLISHED'::text NOT NULL;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS treatments_slug_key ON public.treatments USING btree (slug);
CREATE INDEX IF NOT EXISTS treatments_category_status_idx ON public.treatments USING btree (category, status);
CREATE INDEX IF NOT EXISTS "treatments_specialtyId_status_idx" ON public.treatments USING btree ("specialtyId", status);
CREATE INDEX IF NOT EXISTS treatments_status_name_idx ON public.treatments USING btree (status, name);
DO $$ BEGIN
  ALTER TABLE "treatments" ADD CONSTRAINT "treatments_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES specialties(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── glossary_terms ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "glossary_terms" (
  "id" TEXT NOT NULL,
  "term" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general'::text,
  "synonyms" TEXT[] DEFAULT ARRAY[]::text[],
  "specialtyId" TEXT,
  "relatedSlug" TEXT,
  "sources" TEXT,
  "termAr" TEXT,
  "definitionAr" TEXT,
  "sourcesAr" TEXT,
  "arReviewedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED'::text,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "glossary_terms_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "term" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "definition" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'general'::text NOT NULL;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "synonyms" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "specialtyId" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "relatedSlug" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "sources" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "termAr" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "definitionAr" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "sourcesAr" TEXT;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "arReviewedAt" TIMESTAMP(3);
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PUBLISHED'::text NOT NULL;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE "glossary_terms" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS glossary_terms_slug_key ON public.glossary_terms USING btree (slug);
CREATE INDEX IF NOT EXISTS glossary_terms_status_term_idx ON public.glossary_terms USING btree (status, term);
CREATE INDEX IF NOT EXISTS glossary_terms_category_status_idx ON public.glossary_terms USING btree (category, status);
CREATE INDEX IF NOT EXISTS "glossary_terms_specialtyId_status_idx" ON public.glossary_terms USING btree ("specialtyId", status);
DO $$ BEGIN
  ALTER TABLE "glossary_terms" ADD CONSTRAINT "glossary_terms_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES specialties(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
