-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('BREAKDOWN', 'EXPLAINER', 'BUILD_LOG');

-- CreateEnum
CREATE TYPE "BottleneckTag" AS ENUM ('PRODUCT', 'SHIPPING', 'DISTRIBUTION', 'FUNDING', 'CLARITY', 'OTHER');

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "outcomeLine" TEXT NOT NULL DEFAULT '',
    "bottleneck" TEXT NOT NULL DEFAULT '',
    "context" TEXT NOT NULL DEFAULT '',
    "whatWeDid" TEXT NOT NULL DEFAULT '',
    "whatChanged" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coverImageUrl" TEXT NOT NULL DEFAULT '',
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "liveUrl" TEXT,
    "year" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdatePost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "coverImageUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpdatePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "articleType" "ArticleType",
    "bottleneckTag" "BottleneckTag",
    "coverImageUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudy_slug_key" ON "CaseStudy"("slug");

-- CreateIndex
CREATE INDEX "CaseStudy_published_idx" ON "CaseStudy"("published");

-- CreateIndex
CREATE INDEX "CaseStudy_publishedAt_idx" ON "CaseStudy"("publishedAt");

-- CreateIndex
CREATE INDEX "CaseStudy_featured_idx" ON "CaseStudy"("featured");

-- CreateIndex
CREATE INDEX "CaseStudy_published_publishedAt_idx" ON "CaseStudy"("published", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UpdatePost_slug_key" ON "UpdatePost"("slug");

-- CreateIndex
CREATE INDEX "UpdatePost_published_idx" ON "UpdatePost"("published");

-- CreateIndex
CREATE INDEX "UpdatePost_publishedAt_idx" ON "UpdatePost"("publishedAt");

-- CreateIndex
CREATE INDEX "UpdatePost_published_publishedAt_idx" ON "UpdatePost"("published", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_published_idx" ON "Article"("published");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Article_featured_idx" ON "Article"("featured");

-- CreateIndex
CREATE INDEX "Article_articleType_idx" ON "Article"("articleType");

-- CreateIndex
CREATE INDEX "Article_bottleneckTag_idx" ON "Article"("bottleneckTag");

-- CreateIndex
CREATE INDEX "Article_published_publishedAt_idx" ON "Article"("published", "publishedAt");

