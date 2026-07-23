-- ═══════════════════════════════════════════════════════════════════════════
-- Migration PROD — Plateforme contributive « Publier un article »
-- Généré via : prisma migrate diff (schéma d'avant → schéma actuel)
--
-- 100 % ADDITIF : ADD COLUMN / CREATE TABLE / CREATE INDEX / ADD FOREIGN KEY.
-- Aucune suppression, aucune perte de données. Les colonnes NOT NULL ont un
-- DEFAULT → sûres sur les lignes existantes. `users.authorSlug` UNIQUE est sûr
-- (colonne neuve = NULL partout ; Postgres autorise plusieurs NULL).
--
-- À lancer sur la base de PROD (psql / client SQL), PUIS déployer l'app.
-- NE PAS lancer `prisma db push` en prod. Le DDL Postgres est transactionnel :
-- si une instruction échoue, BEGIN/COMMIT annule tout.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authorCityId" TEXT,
ADD COLUMN     "authorSlug" TEXT,
ADD COLUMN     "authorSpecialtyId" TEXT,
ADD COLUMN     "authorStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "bioAr" TEXT,
ADD COLUMN     "cabinetUrl" TEXT,
ADD COLUMN     "featuredAuthorUntil" TIMESTAMP(3),
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "orderName" TEXT,
ADD COLUMN     "professionKind" TEXT,
ADD COLUMN     "university" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "bibliography" TEXT,
ADD COLUMN     "conflictOfInterest" TEXT,
ADD COLUMN     "editorialStatus" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "evidenceLevel" TEXT,
ADD COLUMN     "lastUpdatedNote" TEXT,
ADD COLUMN     "qualityReport" JSONB,
ADD COLUMN     "qualityScore" INTEGER,
ADD COLUMN     "scheduledFor" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "contributor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "yearsPractice" INTEGER,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isOrgAccount" BOOLEAN NOT NULL DEFAULT false,
    "orgLegalName" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "articlesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contributor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_licenses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ordreNumber" TEXT,
    "documentUrl" TEXT NOT NULL,
    "documentName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "medical_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_revisions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "article_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_assignments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "decision" TEXT,
    "comments" JSONB,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_events" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "editorial_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelAr" TEXT,
    "icon" TEXT NOT NULL,
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "author_badges" (
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "author_badges_pkey" PRIMARY KEY ("userId","badgeId")
);

-- CreateTable
CREATE TABLE "article_analytics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "reads" INTEGER NOT NULL DEFAULT 0,
    "avgTime" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "article_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contributor_profiles_userId_key" ON "contributor_profiles"("userId");
CREATE INDEX "medical_licenses_userId_status_idx" ON "medical_licenses"("userId", "status");
CREATE INDEX "medical_licenses_status_createdAt_idx" ON "medical_licenses"("status", "createdAt");
CREATE INDEX "article_revisions_postId_createdAt_idx" ON "article_revisions"("postId", "createdAt");
CREATE UNIQUE INDEX "article_revisions_postId_version_key" ON "article_revisions"("postId", "version");
CREATE INDEX "review_assignments_editorId_status_idx" ON "review_assignments"("editorId", "status");
CREATE INDEX "review_assignments_postId_createdAt_idx" ON "review_assignments"("postId", "createdAt");
CREATE INDEX "editorial_events_postId_createdAt_idx" ON "editorial_events"("postId", "createdAt");
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");
CREATE INDEX "author_badges_badgeId_idx" ON "author_badges"("badgeId");
CREATE INDEX "article_analytics_postId_day_idx" ON "article_analytics"("postId", "day");
CREATE UNIQUE INDEX "article_analytics_postId_day_key" ON "article_analytics"("postId", "day");
CREATE UNIQUE INDEX "users_authorSlug_key" ON "users"("authorSlug");
CREATE INDEX "users_authorSlug_idx" ON "users"("authorSlug");
CREATE INDEX "users_authorStatus_idx" ON "users"("authorStatus");
CREATE INDEX "posts_editorialStatus_submittedAt_idx" ON "posts"("editorialStatus", "submittedAt");
CREATE INDEX "posts_authorId_editorialStatus_idx" ON "posts"("authorId", "editorialStatus");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_authorCityId_fkey" FOREIGN KEY ("authorCityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_authorSpecialtyId_fkey" FOREIGN KEY ("authorSpecialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contributor_profiles" ADD CONSTRAINT "contributor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "medical_licenses" ADD CONSTRAINT "medical_licenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "medical_licenses" ADD CONSTRAINT "medical_licenses_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_assignments" ADD CONSTRAINT "review_assignments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_assignments" ADD CONSTRAINT "review_assignments_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "editorial_events" ADD CONSTRAINT "editorial_events_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "editorial_events" ADD CONSTRAINT "editorial_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "author_badges" ADD CONSTRAINT "author_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "author_badges" ADD CONSTRAINT "author_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_analytics" ADD CONSTRAINT "article_analytics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
