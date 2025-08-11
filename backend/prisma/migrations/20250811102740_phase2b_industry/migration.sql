-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('regulation', 'standard', 'pricing', 'safety', 'best_practice');

-- CreateTable
CREATE TABLE "public"."IndustrySource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCrawled" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustrySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndustryItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contentType" "public"."ContentType" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sourceUrl" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CrawlLog" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "CrawlLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndustrySource_name_key" ON "public"."IndustrySource"("name");

-- CreateIndex
CREATE INDEX "IndustryItem_category_idx" ON "public"."IndustryItem"("category");

-- CreateIndex
CREATE INDEX "IndustryItem_contentType_idx" ON "public"."IndustryItem"("contentType");

-- CreateIndex
CREATE INDEX "IndustryItem_relevanceScore_idx" ON "public"."IndustryItem"("relevanceScore");

-- AddForeignKey
ALTER TABLE "public"."IndustryItem" ADD CONSTRAINT "IndustryItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."IndustrySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CrawlLog" ADD CONSTRAINT "CrawlLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."IndustrySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
