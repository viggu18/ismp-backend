-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('RAISED', 'UNDER_REVIEW', 'RESOLVED_HIRER', 'RESOLVED_INFLUENCER', 'ESCALATED');

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'RAISED',
    "evidenceUrls" TEXT[],
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_snapshots" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "termsJson" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publish_proofs" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "publishedUrl" TEXT NOT NULL,
    "screenshotUrl" TEXT NOT NULL,
    "platform" "Platform",
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publish_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_metrics" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "utmClicks" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "hirerProfileId" TEXT NOT NULL,
    "filterJson" JSONB NOT NULL,
    "alertEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disputes_offerId_key" ON "disputes"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_snapshots_offerId_key" ON "contract_snapshots"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "publish_proofs_submissionId_key" ON "publish_proofs"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_metrics_campaignId_key" ON "campaign_metrics"("campaignId");

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_snapshots" ADD CONSTRAINT "contract_snapshots_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_proofs" ADD CONSTRAINT "publish_proofs_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "content_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_metrics" ADD CONSTRAINT "campaign_metrics_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_hirerProfileId_fkey" FOREIGN KEY ("hirerProfileId") REFERENCES "hirer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
