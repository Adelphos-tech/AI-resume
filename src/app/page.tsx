import type { Metadata } from "next";

import { AiReviewShowcase } from "@/components/marketing/ai-review-showcase";
import { AudienceSection } from "@/components/marketing/audience-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PackagesSection } from "@/components/marketing/packages-section";
import { ProductDemoSection } from "@/components/marketing/product-demo-section";
import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicNavbar } from "@/components/marketing/public-navbar";
import { TemplateShowcase } from "@/components/marketing/template-showcase";

export const metadata: Metadata = {
  title: "RoleRace — Career-Ready Resumes for Every Opportunity",
  description:
    "RoleRace helps professionals build targeted resumes from a structured career profile, choose professional templates, get AI-powered feedback, and export polished PDF and DOCX resumes.",
  openGraph: {
    title: "RoleRace — Career-Ready Resumes for Every Opportunity",
    description:
      "RoleRace helps professionals build targeted resumes from a structured career profile, choose professional templates, get AI-powered feedback, and export polished PDF and DOCX resumes.",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <PublicNavbar />
      <main>
        <HeroSection />
        <ProductDemoSection />
        <TemplateShowcase />
        <HowItWorks />
        <AiReviewShowcase />
        <AudienceSection />
        <PackagesSection />
        <FinalCta />
      </main>
      <PublicFooter />
    </>
  );
}
