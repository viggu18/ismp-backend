-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HIRER', 'INFLUENCER');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'JOSH', 'MOJ', 'SHARECHAT');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('REEL', 'STATIC_POST', 'STORY', 'YOUTUBE_VIDEO', 'SHORT', 'PODCAST');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'OPEN', 'PAUSED', 'CLOSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CampaignVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'SHORTLISTED', 'REJECTED', 'OFFERED', 'HIRED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COUNTERED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ContentSubmissionStatus" AS ENUM ('SUBMITTED', 'REVISION_REQUESTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'IN_ESCROW', 'RELEASED', 'REFUNDED', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "ReviewTarget" AS ENUM ('HIRER', 'INFLUENCER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_RECEIVED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'OFFER_COUNTERED', 'MESSAGE_RECEIVED', 'CONTENT_SUBMITTED', 'REVISION_REQUESTED', 'CONTENT_APPROVED', 'PAYMENT_RELEASED', 'CAMPAIGN_MATCH', 'REVIEW_RECEIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hirer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "industry" TEXT,
    "website" TEXT,
    "description" TEXT,
    "gstNumber" TEXT,
    "isGstVerified" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "state" TEXT,
    "averageRating" DOUBLE PRECISION,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hirer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "influencer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "city" TEXT,
    "state" TEXT,
    "languages" TEXT[],
    "niches" TEXT[],
    "gender" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "totalFollowers" INTEGER NOT NULL DEFAULT 0,
    "avgEngagement" DOUBLE PRECISION,
    "averageRating" DOUBLE PRECISION,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" TEXT NOT NULL,
    "influencerProfileId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "handle" TEXT NOT NULL,
    "profileUrl" TEXT,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_cards" (
    "id" TEXT NOT NULL,
    "influencerProfileId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "priceInr" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "hirerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "platforms" "Platform"[],
    "contentTypes" "ContentType"[],
    "niche" TEXT,
    "budgetMin" DOUBLE PRECISION,
    "budgetMax" DOUBLE PRECISION,
    "timeline" TEXT,
    "startDate" TIMESTAMP(3),
    "deadlineDate" TIMESTAMP(3),
    "deliverablesCount" INTEGER NOT NULL DEFAULT 1,
    "languages" TEXT[],
    "minFollowers" INTEGER,
    "targetCities" TEXT[],
    "targetGender" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "CampaignVisibility" NOT NULL DEFAULT 'PUBLIC',
    "briefUrl" TEXT,
    "briefText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerProfileId" TEXT NOT NULL,
    "pitchNote" TEXT,
    "proposedRate" DOUBLE PRECISION,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "applicationId" TEXT,
    "influencerProfileId" TEXT NOT NULL,
    "agreedRate" DOUBLE PRECISION NOT NULL,
    "deliverables" TEXT NOT NULL,
    "contentDeadline" TIMESTAMP(3) NOT NULL,
    "paymentTerms" TEXT,
    "revisionLimit" INTEGER NOT NULL DEFAULT 2,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "counterRate" DOUBLE PRECISION,
    "counterNote" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_submissions" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "submissionUrl" TEXT NOT NULL,
    "note" TEXT,
    "revisionNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "ContentSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "revisionNote" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "amountInr" DOUBLE PRECISION NOT NULL,
    "platformFeeInr" DOUBLE PRECISION NOT NULL,
    "influencerPayout" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "escrowLockedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "reviewTarget" "ReviewTarget" NOT NULL,
    "hirerProfileId" TEXT,
    "influencerProfileId" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "communicationRating" DOUBLE PRECISION,
    "qualityRating" DOUBLE PRECISION,
    "timelinessRating" DOUBLE PRECISION,
    "paymentRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hirer_profiles_userId_key" ON "hirer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "influencer_profiles_userId_key" ON "influencer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_influencerProfileId_platform_key" ON "social_accounts"("influencerProfileId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "rate_cards_influencerProfileId_platform_contentType_key" ON "rate_cards"("influencerProfileId", "platform", "contentType");

-- CreateIndex
CREATE UNIQUE INDEX "applications_campaignId_influencerProfileId_key" ON "applications"("campaignId", "influencerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "offers_applicationId_key" ON "offers"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_offerId_key" ON "conversations"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_offerId_key" ON "payments"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_offerId_reviewTarget_key" ON "reviews"("offerId", "reviewTarget");

-- AddForeignKey
ALTER TABLE "hirer_profiles" ADD CONSTRAINT "hirer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "influencer_profiles" ADD CONSTRAINT "influencer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_influencerProfileId_fkey" FOREIGN KEY ("influencerProfileId") REFERENCES "influencer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_cards" ADD CONSTRAINT "rate_cards_influencerProfileId_fkey" FOREIGN KEY ("influencerProfileId") REFERENCES "influencer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_hirerId_fkey" FOREIGN KEY ("hirerId") REFERENCES "hirer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_influencerProfileId_fkey" FOREIGN KEY ("influencerProfileId") REFERENCES "influencer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_influencerProfileId_fkey" FOREIGN KEY ("influencerProfileId") REFERENCES "influencer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_submissions" ADD CONSTRAINT "content_submissions_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hirerProfileId_fkey" FOREIGN KEY ("hirerProfileId") REFERENCES "hirer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_influencerProfileId_fkey" FOREIGN KEY ("influencerProfileId") REFERENCES "influencer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
