-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PATIENT',
    "avatar" TEXT,
    "jobTitle" TEXT,
    "credentials" TEXT,
    "bio" TEXT,
    "registrationNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationTokenExpiry" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 999,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "region" TEXT,
    "order" INTEGER NOT NULL DEFAULT 999,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "specialtyId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "slug" TEXT,
    "nom" TEXT,
    "prenom" TEXT,
    "civilite" TEXT,
    "adresse" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,
    "prix" DECIMAL(10,2),
    "phone" TEXT NOT NULL,
    "avatar" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "planActivatedAt" TIMESTAMP(3),
    "planExpiresAt" TIMESTAMP(3),
    "featuredUntil" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "trialUsedAt" TIMESTAMP(3),
    "smsReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsReminderConfig" JSONB,
    "langues" TEXT[] DEFAULT ARRAY['Arabe', 'Darija', 'Français']::TEXT[],
    "conventions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "motifs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience" INTEGER,
    "consultationDuration" INTEGER NOT NULL DEFAULT 30,
    "bookingLeadHours" INTEGER NOT NULL DEFAULT 1,
    "bookingMaxDays" INTEGER NOT NULL DEFAULT 60,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "establishments" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT,
    "adresse" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "description" TEXT,
    "avatar" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geoApprox" BOOLEAN NOT NULL DEFAULT false,
    "cityId" TEXT NOT NULL,
    "specialtyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "establishments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "establishment_reviews" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "userId" TEXT,
    "auteur" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "establishment_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'open',
    "phone" TEXT,
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "repliedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_absences" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CONGE',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_hours" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_slots" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "reason" TEXT,
    "doctorNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reviewToken" TEXT,
    "reviewRequestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_claims" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "adminNote" TEXT,
    "originalUserId" TEXT,
    "ordreNumber" TEXT,
    "documents" JSONB DEFAULT '[]',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_logs" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "callback_requests" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferredSlot" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "callback_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_clicks" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'profile',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_leads" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "billing" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT,
    "specialty" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "source" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_orders" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'PRO',
    "billing" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "holder" TEXT NOT NULL DEFAULT '',
    "bank" TEXT NOT NULL DEFAULT '',
    "rib" TEXT NOT NULL DEFAULT '',
    "iban" TEXT NOT NULL DEFAULT '',
    "swift" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dci" TEXT,
    "dosage" TEXT,
    "uniteDosage" TEXT,
    "classe" TEXT,
    "forme" TEXT,
    "presentation" TEXT,
    "princepsGenerique" TEXT,
    "ppv" DECIMAL(10,2),
    "ph" DECIMAL(10,2),
    "prixBR" DECIMAL(10,2),
    "tauxRemboursement" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_reviews" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverAlt" TEXT,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "readingTime" INTEGER,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "keyTakeaways" TEXT,
    "faqJson" TEXT,
    "aboutEntity" TEXT,
    "pillarId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "askedById" TEXT NOT NULL,
    "specialtyId" TEXT,
    "cityId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "aiSummary" TEXT,
    "aiSummarySourceAnswerId" TEXT,
    "aiSummaryAt" TIMESTAMP(3),
    "titleAr" TEXT,
    "bodyAr" TEXT,
    "aiSummaryAr" TEXT,
    "metaTitleAr" TEXT,
    "metaDescAr" TEXT,
    "arReviewedAt" TIMESTAMP(3),
    "urgencyLevel" TEXT NOT NULL DEFAULT 'NONE',
    "moderationNote" TEXT,
    "mergedIntoId" TEXT,
    "answersCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "lastAnswerAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyAr" TEXT,
    "arReviewedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "thanksCount" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qa_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_answer_votes" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_answer_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_thanks" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_thanks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_answer_comments" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_answer_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_follows" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_reports" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_moderation_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "note" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_moderation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_revisions" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "editorId" TEXT,
    "previousTitle" TEXT,
    "previousBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_verificationTokenExpiry_idx" ON "users"("verificationTokenExpiry");

-- CreateIndex
CREATE INDEX "users_resetPasswordTokenExpiry_idx" ON "users"("resetPasswordTokenExpiry");

-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_key" ON "specialties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "specialties_slug_key" ON "specialties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_slug_key" ON "doctors"("slug");

-- CreateIndex
CREATE INDEX "doctors_cityId_idx" ON "doctors"("cityId");

-- CreateIndex
CREATE INDEX "doctors_specialtyId_idx" ON "doctors"("specialtyId");

-- CreateIndex
CREATE INDEX "doctors_slug_idx" ON "doctors"("slug");

-- CreateIndex
CREATE INDEX "doctors_isActive_idx" ON "doctors"("isActive");

-- CreateIndex
CREATE INDEX "doctors_isActive_isVerified_averageRating_idx" ON "doctors"("isActive", "isVerified", "averageRating");

-- CreateIndex
CREATE INDEX "doctors_isActive_specialtyId_isVerified_averageRating_idx" ON "doctors"("isActive", "specialtyId", "isVerified", "averageRating");

-- CreateIndex
CREATE INDEX "doctors_isActive_cityId_isVerified_averageRating_idx" ON "doctors"("isActive", "cityId", "isVerified", "averageRating");

-- CreateIndex
CREATE INDEX "doctors_isActive_specialtyId_reviewsCount_idx" ON "doctors"("isActive", "specialtyId", "reviewsCount");

-- CreateIndex
CREATE UNIQUE INDEX "establishments_slug_key" ON "establishments"("slug");

-- CreateIndex
CREATE INDEX "establishments_cityId_idx" ON "establishments"("cityId");

-- CreateIndex
CREATE INDEX "establishments_cityId_isActive_idx" ON "establishments"("cityId", "isActive");

-- CreateIndex
CREATE INDEX "establishments_slug_idx" ON "establishments"("slug");

-- CreateIndex
CREATE INDEX "establishment_reviews_establishmentId_idx" ON "establishment_reviews"("establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "establishment_reviews_userId_establishmentId_key" ON "establishment_reviews"("userId", "establishmentId");

-- CreateIndex
CREATE INDEX "support_tickets_userId_idx" ON "support_tickets"("userId");

-- CreateIndex
CREATE INDEX "support_tickets_userId_status_idx" ON "support_tickets"("userId", "status");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_repliedById_idx" ON "support_tickets"("repliedById");

-- CreateIndex
CREATE INDEX "doctor_absences_doctorId_startDate_endDate_idx" ON "doctor_absences"("doctorId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "working_hours_doctorId_dayOfWeek_key" ON "working_hours"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "blocked_slots_doctorId_idx" ON "blocked_slots"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_slots_doctorId_date_time_key" ON "blocked_slots"("doctorId", "date", "time");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_reviewToken_key" ON "appointments"("reviewToken");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_patientId_date_idx" ON "appointments"("patientId", "date");

-- CreateIndex
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX "appointments_doctorId_date_time_idx" ON "appointments"("doctorId", "date", "time");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_appointmentId_key" ON "reviews"("appointmentId");

-- CreateIndex
CREATE INDEX "reviews_doctorId_isPublic_createdAt_idx" ON "reviews"("doctorId", "isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "reviews_patientId_createdAt_idx" ON "reviews"("patientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_patientId_doctorId_key" ON "reviews"("patientId", "doctorId");

-- CreateIndex
CREATE INDEX "doctor_claims_status_createdAt_idx" ON "doctor_claims"("status", "createdAt");

-- CreateIndex
CREATE INDEX "doctor_claims_userId_status_idx" ON "doctor_claims"("userId", "status");

-- CreateIndex
CREATE INDEX "doctor_claims_doctorId_status_idx" ON "doctor_claims"("doctorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_claims_doctorId_userId_key" ON "doctor_claims"("doctorId", "userId");

-- CreateIndex
CREATE INDEX "verification_logs_doctorId_createdAt_idx" ON "verification_logs"("doctorId", "createdAt");

-- CreateIndex
CREATE INDEX "verification_logs_adminId_idx" ON "verification_logs"("adminId");

-- CreateIndex
CREATE INDEX "contact_requests_createdAt_idx" ON "contact_requests"("createdAt");

-- CreateIndex
CREATE INDEX "contact_requests_email_idx" ON "contact_requests"("email");

-- CreateIndex
CREATE INDEX "callback_requests_doctorId_status_idx" ON "callback_requests"("doctorId", "status");

-- CreateIndex
CREATE INDEX "callback_requests_createdAt_idx" ON "callback_requests"("createdAt");

-- CreateIndex
CREATE INDEX "phone_clicks_doctorId_createdAt_idx" ON "phone_clicks"("doctorId", "createdAt");

-- CreateIndex
CREATE INDEX "subscription_leads_status_createdAt_idx" ON "subscription_leads"("status", "createdAt");

-- CreateIndex
CREATE INDEX "subscription_leads_userId_idx" ON "subscription_leads"("userId");

-- CreateIndex
CREATE INDEX "subscription_leads_email_idx" ON "subscription_leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_createdAt_idx" ON "newsletter_subscribers"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_orders_reference_key" ON "subscription_orders"("reference");

-- CreateIndex
CREATE INDEX "subscription_orders_doctorId_createdAt_idx" ON "subscription_orders"("doctorId", "createdAt");

-- CreateIndex
CREATE INDEX "subscription_orders_status_createdAt_idx" ON "subscription_orders"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "medications_slug_key" ON "medications"("slug");

-- CreateIndex
CREATE INDEX "medications_slug_idx" ON "medications"("slug");

-- CreateIndex
CREATE INDEX "medication_reviews_medicationId_idx" ON "medication_reviews"("medicationId");

-- CreateIndex
CREATE UNIQUE INDEX "post_categories_name_key" ON "post_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "post_categories_slug_key" ON "post_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_status_publishedAt_idx" ON "posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "posts_categoryId_status_idx" ON "posts"("categoryId", "status");

-- CreateIndex
CREATE INDEX "posts_slug_idx" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- CreateIndex
CREATE INDEX "posts_reviewedById_idx" ON "posts"("reviewedById");

-- CreateIndex
CREATE INDEX "posts_pillarId_idx" ON "posts"("pillarId");

-- CreateIndex
CREATE UNIQUE INDEX "questions_slug_key" ON "questions"("slug");

-- CreateIndex
CREATE INDEX "questions_status_publishedAt_idx" ON "questions"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "questions_slug_idx" ON "questions"("slug");

-- CreateIndex
CREATE INDEX "questions_specialtyId_status_publishedAt_idx" ON "questions"("specialtyId", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "questions_status_lastAnswerAt_idx" ON "questions"("status", "lastAnswerAt");

-- CreateIndex
CREATE INDEX "questions_askedById_idx" ON "questions"("askedById");

-- CreateIndex
CREATE INDEX "qa_answers_questionId_status_score_idx" ON "qa_answers"("questionId", "status", "score");

-- CreateIndex
CREATE INDEX "qa_answers_doctorId_createdAt_idx" ON "qa_answers"("doctorId", "createdAt");

-- CreateIndex
CREATE INDEX "qa_answer_votes_userId_idx" ON "qa_answer_votes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "qa_answer_votes_answerId_userId_key" ON "qa_answer_votes"("answerId", "userId");

-- CreateIndex
CREATE INDEX "qa_thanks_userId_idx" ON "qa_thanks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "qa_thanks_answerId_userId_key" ON "qa_thanks"("answerId", "userId");

-- CreateIndex
CREATE INDEX "qa_answer_comments_answerId_createdAt_idx" ON "qa_answer_comments"("answerId", "createdAt");

-- CreateIndex
CREATE INDEX "question_follows_userId_idx" ON "question_follows"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "question_follows_questionId_userId_key" ON "question_follows"("questionId", "userId");

-- CreateIndex
CREATE INDEX "qa_reports_status_createdAt_idx" ON "qa_reports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "qa_reports_targetType_targetId_idx" ON "qa_reports"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "qa_reports_reporterId_idx" ON "qa_reports"("reporterId");

-- CreateIndex
CREATE INDEX "qa_moderation_logs_entityType_entityId_createdAt_idx" ON "qa_moderation_logs"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "qa_revisions_entityType_entityId_createdAt_idx" ON "qa_revisions"("entityType", "entityId", "createdAt");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establishments" ADD CONSTRAINT "establishments_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establishments" ADD CONSTRAINT "establishments_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establishment_reviews" ADD CONSTRAINT "establishment_reviews_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establishment_reviews" ADD CONSTRAINT "establishment_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_repliedById_fkey" FOREIGN KEY ("repliedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_absences" ADD CONSTRAINT "doctor_absences_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_claims" ADD CONSTRAINT "doctor_claims_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_claims" ADD CONSTRAINT "doctor_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_claims" ADD CONSTRAINT "doctor_claims_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "callback_requests" ADD CONSTRAINT "callback_requests_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_clicks" ADD CONSTRAINT "phone_clicks_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_leads" ADD CONSTRAINT "subscription_leads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_reviews" ADD CONSTRAINT "medication_reviews_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "post_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_askedById_fkey" FOREIGN KEY ("askedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_mergedIntoId_fkey" FOREIGN KEY ("mergedIntoId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_answers" ADD CONSTRAINT "qa_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_answers" ADD CONSTRAINT "qa_answers_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_answer_votes" ADD CONSTRAINT "qa_answer_votes_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "qa_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_answer_votes" ADD CONSTRAINT "qa_answer_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_thanks" ADD CONSTRAINT "qa_thanks_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "qa_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_thanks" ADD CONSTRAINT "qa_thanks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_answer_comments" ADD CONSTRAINT "qa_answer_comments_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "qa_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_answer_comments" ADD CONSTRAINT "qa_answer_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_follows" ADD CONSTRAINT "question_follows_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_follows" ADD CONSTRAINT "question_follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_reports" ADD CONSTRAINT "qa_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

