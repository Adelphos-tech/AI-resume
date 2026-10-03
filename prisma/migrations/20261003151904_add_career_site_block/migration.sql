-- CreateEnum
CREATE TYPE "CareerSiteBlockType" AS ENUM ('HERO', 'CUSTOM_TEXT');

-- CreateTable
CREATE TABLE "career_site_block" (
    "id" TEXT NOT NULL,
    "careerSitePageId" TEXT NOT NULL,
    "type" "CareerSiteBlockType" NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_site_block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "career_site_block_careerSitePageId_position_idx" ON "career_site_block"("careerSitePageId", "position");

-- AddForeignKey
ALTER TABLE "career_site_block" ADD CONSTRAINT "career_site_block_careerSitePageId_fkey" FOREIGN KEY ("careerSitePageId") REFERENCES "career_site_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
