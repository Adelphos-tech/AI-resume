-- CreateTable
CREATE TABLE "career_site_page" (
    "id" TEXT NOT NULL,
    "careerSiteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_site_page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "career_site_page_careerSiteId_idx" ON "career_site_page"("careerSiteId");

-- AddForeignKey
ALTER TABLE "career_site_page" ADD CONSTRAINT "career_site_page_careerSiteId_fkey" FOREIGN KEY ("careerSiteId") REFERENCES "career_site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
