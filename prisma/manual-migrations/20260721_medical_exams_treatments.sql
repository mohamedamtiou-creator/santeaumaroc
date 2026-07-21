-- CreateTable
CREATE TABLE "medical_exams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
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
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialtyId" TEXT,
    "relatedSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "glossarySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "shortAnswer" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "duration" TEXT,
    "sideEffects" TEXT,
    "redFlags" TEXT,
    "whenToConsult" TEXT,
    "faqJson" TEXT,
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialtyId" TEXT,
    "relatedSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "glossarySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medical_exams_slug_key" ON "medical_exams"("slug");

-- CreateIndex
CREATE INDEX "medical_exams_category_status_idx" ON "medical_exams"("category", "status");

-- CreateIndex
CREATE INDEX "medical_exams_specialtyId_status_idx" ON "medical_exams"("specialtyId", "status");

-- CreateIndex
CREATE INDEX "medical_exams_status_name_idx" ON "medical_exams"("status", "name");

-- CreateIndex
CREATE UNIQUE INDEX "treatments_slug_key" ON "treatments"("slug");

-- CreateIndex
CREATE INDEX "treatments_category_status_idx" ON "treatments"("category", "status");

-- CreateIndex
CREATE INDEX "treatments_specialtyId_status_idx" ON "treatments"("specialtyId", "status");

-- CreateIndex
CREATE INDEX "treatments_status_name_idx" ON "treatments"("status", "name");

-- AddForeignKey
ALTER TABLE "medical_exams" ADD CONSTRAINT "medical_exams_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

