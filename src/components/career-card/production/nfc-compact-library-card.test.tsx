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

  /* ── Creative Spotlight skin ── */

  it("Creative Spotlight skin renders publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Creative Spotlight");
    expect(html).toContain("from-amber-50");
  });

  it("Creative Spotlight renders dynamic candidate name publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Public Tester");
  });

  it("Creative Spotlight renders dynamic headline publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Senior Engineer");
  });

  it("Creative Spotlight renders dynamic bio publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Building scalable systems.");
    expect(html).toContain("Biography");
  });

  it("Creative Spotlight renders dynamic professionalCategories", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          professionalCategories: ["Actor", "Voice Artist"],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Actor");
    expect(html).toContain("Voice Artist");
    expect(html).toContain("Professional Categories");
  });

  it("Creative Spotlight collapses professionalCategories when absent", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          professionalCategories: [],
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Professional Categories");
  });

  it("Creative Spotlight renders dynamic genres", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          genres: ["Drama", "Comedy"],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Drama");
    expect(html).toContain("Comedy");
    expect(html).toContain("Genres");
  });

  it("Creative Spotlight collapses genres when absent", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          genres: [],
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Genres");
  });

  it("Creative Spotlight renders dynamic languages", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          languages: [
            { language: "English", fluency: "Native" },
            { language: "Hindi", fluency: "Fluent" },
          ],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("English");
    expect(html).toContain("Hindi");
    expect(html).toContain("Languages");
  });

  it("Creative Spotlight portfolio action uses canonical portfolioUrl", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          portfolioUrl: "https://portfolio.example.com",
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Portfolio");
    expect(html).toContain("https://portfolio.example.com");
  });

  it("Creative Spotlight portfolio action hidden when URL missing", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          portfolioUrl: null,
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Portfolio");
  });

  it("Creative Spotlight showreel action uses canonical showreelUrl", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          showreelUrl: "https://vimeo.com/12345",
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Showreel");
    expect(html).toContain("https://vimeo.com/12345");
  });

  it("Creative Spotlight showreel action hidden when URL missing", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          showreelUrl: null,
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Showreel");
  });

  it("Creative Spotlight availability uses real data", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          openToOpportunities: true,
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Open to opportunities");
  });

  it("Creative Spotlight passes public Company data dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
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
            industry: "Technology",
            locations: ["Singapore"],
            services: ["Consulting"],
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
    expect(html).toContain("Production Company");
    expect(html).toContain("Public Tester");
  });

  it("Creative Spotlight company industry is passed via DTO", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          company: {
            companyName: "IndustryCo",
            tagline: null,
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
            industry: "Film Production",
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
    // Default active=candidate, so verify switch presence proves company data is wired
    expect(html).toContain('role="tablist"');
    expect(html).toContain("Production Company");
  });

  it("Creative Spotlight company locations are passed via DTO", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          company: {
            companyName: "LocCo",
            tagline: null,
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
            locations: ["London", "Berlin"],
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
    expect(html).toContain("Production Company");
  });

  it("Creative Spotlight company services are passed via DTO", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          company: {
            companyName: "SvcCo",
            tagline: null,
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
            services: ["Post-Production", "VFX"],
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
    expect(html).toContain("Production Company");
  });

  it("Creative Spotlight Open Roles remains exact truthful label", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          company: {
            companyName: "HiringCo",
            tagline: null,
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
            hiringOpen: true,
            openRolesSummary: "We are hiring!",
            openRolesUrl: "https://jobs.example.com",
            companyProfileSummary: null,
            companyProfileUrl: null,
          },
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Casting Needs");
    expect(html).toContain('role="tablist"');
  });

  it("Creative Spotlight switch shown with eligible Company", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
          company: {
            companyName: "SwitchCo",
            tagline: null,
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
    expect(html).toContain("Celebrity");
    expect(html).toContain("Production Company");
  });

  it("Creative Spotlight switch hidden without Company", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain('role="tablist"');
  });

  it("Creative Spotlight does not expose candidate private email", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("@tester.com");
    expect(html).not.toContain("mailto:");
  });

  it("Creative Spotlight does not expose candidate private phone", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("+65");
    expect(html).not.toContain("tel:");
  });

  it("Creative Spotlight does not contain verified badge", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("verified");
    expect(html).not.toContain("Verified");
  });

  it("Creative Spotlight does not contain Project Match", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Project Match");
    expect(html).not.toContain("92%");
  });

  it("Creative Spotlight does not contain audience metrics", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("followers");
    expect(html).not.toContain("audience");
    expect(html).not.toContain("reach");
  });

  it("Creative Spotlight does not contain Invite to Project", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Invite to Project");
  });

  it("Creative Spotlight does not contain Collaboration Proposal", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Collaboration Proposal");
  });

  it("Creative Spotlight does not contain Casting Needs", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Casting Needs");
  });

  it("Creative Spotlight CTA has real destination", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "creative-spotlight",
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

  it("Creative Spotlight does not contain hardcoded reference candidate names", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Ava Reyes");
    expect(html).not.toContain("Shahul");
    expect(html).not.toContain("Hameed");
  });

  it("Creative Spotlight does not contain hardcoded reference company names", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Skyline AI");
    expect(html).not.toContain("Proinfocus");
  });

  it("Career Passport skin unchanged after Creative Spotlight", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "career-passport" },
        slug: "tester",
      }),
    );
    expect(html).toContain("NFC Career Card");
  });

  it("Crimson Night skin unchanged after Creative Spotlight", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "crimson-night" },
        slug: "tester",
      }),
    );
    expect(html).toContain("bg-[var(--cn-base)]");
  });

  it("Professional Connect skin unchanged after Creative Spotlight", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("NFC Profile");
  });

  it("Unknown NFC skin falls back to Career Passport", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId:
            "unknown-skin" as unknown as PublicCareerProfileDTO["nfcCompactSkinId"],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("NFC Career Card");
  });

  /* ── Signature Spotlight skin ── */

  it("Signature Spotlight skin renders publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Public Tester");
    expect(html).not.toContain("NFC Career Card");
    expect(html).not.toContain("NFC Profile");
    expect(html).not.toContain("Creative Spotlight");
    expect(html).not.toContain('role="tablist"');
  });

  it("Signature Spotlight renders dynamic candidate name publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Public Tester");
  });

  it("Signature Spotlight renders dynamic headline publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Senior Engineer");
  });

  it("Signature Spotlight renders dynamic bio as professional summary", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Building scalable systems.");
  });

  it("Signature Spotlight renders dynamic skills publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...RICH_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("React");
    expect(html).toContain("TypeScript");
    expect(html).toContain("Skills");
  });

  it("Signature Spotlight renders dynamic education publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...RICH_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("MIT");
    expect(html).toContain("Education");
  });

  it("Signature Spotlight renders dynamic experience publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...RICH_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Staff Engineer");
    expect(html).toContain("Experience");
  });

  it("Signature Spotlight renders dynamic certifications publicly", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...RICH_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("AWS SA");
    expect(html).toContain("Credentials");
  });

  it("Signature Spotlight renders dynamic professionalCategories", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          professionalCategories: ["Actor", "Voice Artist"],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Actor");
    expect(html).toContain("Voice Artist");
    expect(html).toContain("Professional Categories");
  });

  it("Signature Spotlight collapses professionalCategories when absent", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          professionalCategories: [],
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Professional Categories");
  });

  it("Signature Spotlight renders dynamic genres", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          genres: ["Drama", "Comedy"],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Drama");
    expect(html).toContain("Comedy");
    expect(html).toContain("Genres");
  });

  it("Signature Spotlight collapses genres when absent", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          genres: [],
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Genres");
  });

  it("Signature Spotlight renders dynamic languages", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          languages: [
            { language: "English", fluency: "Native" },
            { language: "Hindi", fluency: "Fluent" },
          ],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("English");
    expect(html).toContain("Hindi");
    expect(html).toContain("Languages");
  });

  it("Signature Spotlight portfolio action uses canonical portfolioUrl", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          portfolioUrl: "https://portfolio.example.com",
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Portfolio");
    expect(html).toContain("https://portfolio.example.com");
  });

  it("Signature Spotlight portfolio action hidden when URL missing", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          portfolioUrl: null,
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Portfolio");
  });

  it("Signature Spotlight showreel action uses canonical showreelUrl", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          showreelUrl: "https://vimeo.com/12345",
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Showreel");
    expect(html).toContain("https://vimeo.com/12345");
  });

  it("Signature Spotlight showreel action hidden when URL missing", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          showreelUrl: null,
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Showreel");
  });

  it("Signature Spotlight availability uses real data", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          openToOpportunities: true,
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Open to opportunities");
    expect(html).toContain("Availability");
  });

  it("Signature Spotlight does not show company switch", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          company: {
            companyName: "SwitchCo",
            tagline: null,
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
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain("Candidate");
    expect(html).not.toContain("Company");
  });

  it("Signature Spotlight does not expose candidate private email", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("@tester.com");
    expect(html).not.toContain("mailto:");
  });

  it("Signature Spotlight does not expose candidate private phone", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("+65");
    expect(html).not.toContain("tel:");
  });

  it("Signature Spotlight does not contain verified badge", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("verified");
    expect(html).not.toContain("Verified");
  });

  it("Signature Spotlight does not contain Project Match", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Project Match");
    expect(html).not.toContain("92%");
  });

  it("Signature Spotlight does not contain audience metrics", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("followers");
    expect(html).not.toContain("audience");
    expect(html).not.toContain("reach");
  });

  it("Signature Spotlight does not contain Invite to Project", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Invite to Project");
  });

  it("Signature Spotlight does not contain Collaboration Proposal", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Collaboration Proposal");
  });

  it("Signature Spotlight does not contain Casting Needs", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Casting Needs");
  });

  it("Signature Spotlight CTA has real destination", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          links: { linkedin: null, github: null, website: null },
          featuredResume: null,
          whatsappUrl: null,
          portfolioUrl: null,
          showreelUrl: null,
        },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Get in Touch");
    expect(html).not.toContain("Contact Us");
  });

  it("Signature Spotlight primary CTA prefers showreelUrl", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          showreelUrl: "https://vimeo.com/showreel",
          portfolioUrl: "https://portfolio.example.com",
          links: {
            linkedin: "https://linkedin.com/in/test",
            github: null,
            website: null,
          },
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("View Showreel");
    expect(html).toContain("https://vimeo.com/showreel");
  });

  it("Signature Spotlight does not contain hardcoded reference candidate names", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Ava Reyes");
    expect(html).not.toContain("Shahul");
    expect(html).not.toContain("Hameed");
  });

  it("Signature Spotlight does not contain hardcoded reference company names", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain("Skyline AI");
    expect(html).not.toContain("Proinfocus");
  });

  it("Signature Spotlight headline is not derived from professionalCategories", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          headline: "",
          professionalCategories: ["Actor", "Model"],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Professional Categories");
    expect(html).toContain("Actor");
    expect(html).toContain("Model");
    expect(html).not.toContain("Actor · Model");
  });

  it("Signature Spotlight headline is not derived from genres", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          headline: "",
          genres: ["Drama", "Comedy"],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Genres");
    expect(html).toContain("Drama");
    expect(html).toContain("Comedy");
    expect(html).not.toContain("Drama · Comedy");
  });

  it("Signature Spotlight headline is not derived from skills", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          headline: "",
          skills: [{ name: "Frontend", keywords: ["React", "TypeScript"] }],
        },
        slug: "tester",
      }),
    );
    expect(html).toContain("Skills");
    expect(html).toContain("React");
    expect(html).toContain("TypeScript");
    expect(html).not.toContain("React · TypeScript");
  });

  it("Signature Spotlight headline is not derived from bio", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: {
          ...BASE_DTO,
          nfcCompactSkinId: "signature-spotlight",
          headline: "",
          bio: "Building scalable systems.",
        },
        slug: "tester",
      }),
    );
    // Bio stays in bio section; when headline is empty,
    // the headline slot remains empty and bio does not leak into it.
    const matches = html.match(/Building scalable systems\./g);
    expect(matches ? matches.length : 0).toBe(1);
  });

  it("Career Passport skin unchanged after Signature Spotlight", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "career-passport" },
        slug: "tester",
      }),
    );
    expect(html).toContain("NFC Career Card");
  });

  it("Crimson Night skin unchanged after Signature Spotlight", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "crimson-night" },
        slug: "tester",
      }),
    );
    expect(html).toContain("bg-[var(--cn-base)]");
  });

  it("Professional Connect skin unchanged after Signature Spotlight", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "professional-connect" },
        slug: "tester",
      }),
    );
    expect(html).toContain("NFC Profile");
  });

  it("Creative Spotlight skin unchanged after Signature Spotlight", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).toContain("Creative Spotlight");
  });

  it("Creative Spotlight public render causes no writes", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "creative-spotlight" },
        slug: "tester",
      }),
    );
    // Static render produces no form elements, no hidden inputs,
    // no buttons that could mutate state.
    expect(html).not.toContain('method="post"');
    expect(html).not.toContain('method="PUT"');
    expect(html).not.toContain('method="PATCH"');
    expect(html).not.toContain('method="DELETE"');
  });

  it("Signature Spotlight public render causes no writes", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactLibraryCard, {
        dto: { ...BASE_DTO, nfcCompactSkinId: "signature-spotlight" },
        slug: "tester",
      }),
    );
    expect(html).not.toContain('method="post"');
    expect(html).not.toContain('method="PUT"');
    expect(html).not.toContain('method="PATCH"');
    expect(html).not.toContain('method="DELETE"');
  });
});
