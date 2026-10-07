import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { NfcCompactLibraryCard } from "./nfc-compact-library-card";
import type { PublicCareerProfileDTO } from "@/server/public-profile/public-profile";
import type { ResumeData } from "@/lib/resume-schema";

const BASE_DTO: PublicCareerProfileDTO = {
  themeId: "nfc-compact",
  accentColorId: "emerald",
  cardStyleId: "standard",
  shareUrl: "https://rolerace.test/n/abc123",
  profilePhotoUrl: null,
  coverPhotoUrl: null,
  coverPhotoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  profilePhotoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  name: "Public Tester",
  initials: "PT",
  headline: "Senior Engineer",
  bio: "Building scalable systems.",
  location: "Singapore",
  currentFocus: "Platform Engineering",
  workAuthorization: "Citizen",
  openToOpportunities: true,
  whatsappUrl: null,
  nfcCompactSkinId: "career-passport",
  professionalCategories: [],
  genres: [],
  portfolioUrl: null,
  showreelUrl: null,
  links: { linkedin: null, github: null, website: null },
  featuredResume: null,
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};

const RICH_DTO: PublicCareerProfileDTO = {
  ...BASE_DTO,
  skills: [
    { name: "Frontend", keywords: ["React", "TypeScript"] },
    { name: "Backend", keywords: ["Node.js", "PostgreSQL"] },
  ],
  experience: [
    {
      position: "Staff Engineer",
      company: "TechCorp",
      location: "Remote",
      startDate: "2020-01",
      endDate: null,
      isCurrent: true,
      summary: "Leading platform team.",
      highlights: ["Shipped v2"],
    },
  ],
  education: [
    {
      institution: "MIT",
      degree: "B.S.",
      fieldOfStudy: "Computer Science",
      location: "Cambridge, MA",
      startDate: "2012-09",
      endDate: "2016-06",
      highlights: [],
    },
  ],
  certifications: [
    { name: "AWS SA", issuer: "AWS", date: "2023-05", url: null },
  ],
  links: {
    linkedin: "https://linkedin.com/in/test",
    github: "https://github.com/test",
    website: null,
  },
};

describe("NfcCompactLibraryCard", () => {
  it("Career Passport skin renders NFC Career Card", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "career-passport" },
        slug: "tester",
      }),
    );
    expect(html).toContain("NFC Career Card");
    expect(html).not.toContain("bg-[var(--cn-base)]");
    // Career Passport uses diagonal gradient, not top-to-bottom
    expect(html).not.toContain("from-slate-50 to-white");
  });

  it("Crimson Night skin renders dark card", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "crimson-night" },
        slug: "tester",
      }),
    );
    expect(html).toContain("bg-[var(--cn-base)]");
    // Should NOT render Career Passport light bg
    expect(html).not.toContain("bg-[#fafaf9]");
  });

  it("Professional Connect skin renders investor-style card", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("bg-gradient-to-b");
    expect(html).toContain("NFC Profile");
    // Should NOT render Career Passport light bg
    expect(html).not.toContain("bg-[#fafaf9]");
    // Should NOT render Crimson Night dark bg
    expect(html).not.toContain("bg-[var(--cn-base)]");
  });

  it("renders dynamic candidate name publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Public Tester");
  });

  it("renders dynamic headline publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Senior Engineer");
  });

  it("renders dynamic bio as professional summary", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Building scalable systems.");
    expect(html).toContain("Professional Summary");
  });

  it("renders dynamic skills publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...RICH_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("React");
    expect(html).toContain("TypeScript");
    expect(html).toContain("Key Skills");
  });

  it("renders dynamic education publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...RICH_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("MIT");
    expect(html).toContain("Education");
  });

  it("renders dynamic experience publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...RICH_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Staff Engineer");
    expect(html).toContain("Experience");
  });

  it("renders dynamic certifications publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...RICH_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("AWS SA");
    expect(html).toContain("Certifications");
  });

  it("renders featured resume as portfolio link", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "professional-connect",
          featuredResume: {
            name: "Target Resume",
            targetRole: "Engineer",
            targetCountry: "Singapore",
            templateName: "Modern",
            templateKey: "modern",
            resumeData: {} as unknown as ResumeData,
          },
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Portfolio / CV");
    expect(html).toContain("/u/tester/resume");
  });

  it("shows Candidate/Company switch when company data exists", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "professional-connect",
          company: {
            companyName: "DynamicCo",
            tagline: "IT Solutions",
            logoUrl: null,
            contactPersonName: null,
            contactPersonRole: null,
            publicPhone: null,
            publicEmail: null,
            whatsappUrl: null,
            links: {
              website: null,
              linkedin: null,
              facebook: null,
              instagram: null,
              x: null,
              youtube: null,
              tiktok: null,
            },
            about: null,
            industry: null,
            locations: [],
            services: [],
            hiringOpen: false,
            openRolesSummary: null,
            openRolesUrl: null,
            companyProfileSummary: null,
            companyProfileUrl: null,
          },
        },
        slug: "tester",
      }),
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain("Candidate");
    expect(html).toContain("Company");
  });

  it("hides switch when no company data", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain('role="tablist"');
  });

  it("does not render candidate private email", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("@tester.com");
    expect(html).not.toContain("mailto:");
  });

  it("does not render candidate private phone", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("+65");
    expect(html).not.toContain("tel:");
  });

  it("company contact obeys visibility rules", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "professional-connect",
          company: {
            companyName: "HiddenCo",
            tagline: null,
            logoUrl: null,
            contactPersonName: null,
            contactPersonRole: null,
            publicPhone: "+65 9019 1311",
            publicEmail: "hidden@example.com",
            whatsappUrl: null,
            links: {
              website: null,
              linkedin: null,
              facebook: null,
              instagram: null,
              x: null,
              youtube: null,
              tiktok: null,
            },
            about: null,
            industry: null,
            locations: [],
            services: [],
            hiringOpen: false,
            openRolesSummary: null,
            openRolesUrl: null,
            companyProfileSummary: null,
            companyProfileUrl: null,
          },
        },
        slug: "tester",
      }),
    );
    // Switch is present because company exists
    expect(html).toContain('role="tablist"');
    // Candidate side is active by default, so company content is not visible
    expect(html).not.toContain("+65 9019 1311");
    expect(html).not.toContain("hidden@example.com");
  });

  it("collapses optional sections when data absent", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Key Skills");
    expect(html).not.toContain("Education");
    expect(html).not.toContain("Experience");
    expect(html).not.toContain("Certifications");
    expect(html).not.toContain("Portfolio");
  });

  it("CTA hidden when no truthful destination", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "professional-connect",
          links: { linkedin: null, github: null, website: null },
          featuredResume: null,
          whatsappUrl: null,
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Get in Touch");
    expect(html).not.toContain("Contact Us");
  });

  it("CTA uses supplied real destination when present", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "professional-connect",
          links: {
            linkedin: "https://linkedin.com/in/test",
            github: null,
            website: null,
          },
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("https://linkedin.com/in/test");
  });

  it("does not contain Project Match", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Project Match");
    expect(html).not.toContain("92%");
  });

  it("does not contain verified badge", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("verified");
    expect(html).not.toContain("Verified");
  });

  it("does not contain LinkMeU branding", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("LinkMeU");
  });

  it("does not contain reference candidate names", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Ava Reyes");
    expect(html).not.toContain("Shahul");
    expect(html).not.toContain("Hameed");
  });

  it("does not contain reference company names", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Skyline AI");
    expect(html).not.toContain("Proinfocus");
  });
});
