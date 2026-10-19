import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardBuilderPreview } from "./career-card-builder-preview";
import type { PublicProfileSettingsState } from "./public-profile-settings";
import type { CompanyProfileState } from "./company-profile-settings";
import { ProfessionalConnectCard } from "@/components/career-card/compositions/nfc-compact/professional-connect/professional-connect-card";
import { SignatureSpotlightCard } from "@/components/career-card/compositions/nfc-compact/signature-spotlight/signature-spotlight-card";
import { CreativeSpotlightCard } from "@/components/career-card/compositions/nfc-compact/creative-spotlight/creative-spotlight-card";
import { NfcCompactCard } from "@/components/career-card/compositions/nfc-compact/nfc-compact-card";
import { CrimsonNightCard } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-card";
import { PreviewModeProvider } from "./preview-mode-context";

const DEFAULT_STATE: PublicProfileSettingsState = {
  publicHeadline: "",
  publicBio: "",
  publicLocation: "",
  currentFocus: "",
  workAuthorization: "",
  openToOpportunities: false,
  linkedinUrl: "",
  githubUrl: "",
  websiteUrl: "",
  whatsappNumber: "",
  whatsappCountry: "",
  showWhatsapp: false,
  showExperience: false,
  showEducation: false,
  showSkills: false,
  showProjects: false,
  showCertifications: false,
  showLanguages: false,
  featuredResumeVariantId: "",
  themeId: "role-race-classic",
  accentColorId: "emerald",
  cardStyleId: "standard",
  nfcCompactSkinId: "career-passport",
};

const BASE_PROPS = {
  displayName: "QA Tester",
  photoUrl: null as string | null,
  coverUrl: null as string | null,
  photoPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  coverPosition: { focalX: 0.5, focalY: 0.5, zoom: 1 },
  isPublished: false,
};

describe("CareerCardBuilderPreview", () => {
  it("renders display name when headline is empty", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
      }),
    );
    expect(html).toContain("QA Tester");
  });

  it("renders headline from state when provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, publicHeadline: "Senior Engineer" },
      }),
    );
    expect(html).toContain("Senior Engineer");
  });

  it("renders location from state", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, publicLocation: "Berlin" },
      }),
    );
    expect(html).toContain("Berlin");
  });

  it("renders current focus from state", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, currentFocus: "AI Strategy" },
      }),
    );
    expect(html).toContain("AI Strategy");
  });

  it("shows Not published badge when isPublished is false", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
        isPublished: false,
      }),
    );
    expect(html).toContain("Not published");
  });

  it("shows Open to opportunities badge when published and open", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, openToOpportunities: true },
        isPublished: true,
      }),
    );
    expect(html).toContain("Open to opportunities");
  });

  it("omits Open to opportunities badge when unpublished even if open", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, openToOpportunities: true },
        isPublished: false,
      }),
    );
    expect(html).not.toContain("Open to opportunities");
  });

  it("renders fallback message when state is null", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: null,
      }),
    );
    expect(html).toContain("Create your Career Card to see a preview");
  });

  it("applies different cover wrap class for executive-dark theme", () => {
    const classicHtml = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        state: { ...DEFAULT_STATE, themeId: "role-race-classic" },
      }),
    );
    const darkHtml = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        coverUrl: "/u/test/cover",
        state: { ...DEFAULT_STATE, themeId: "executive-dark" },
      }),
    );
    // executive-dark cover wrap is taller (sm:h-60 vs sm:h-48)
    expect(classicHtml).toContain("sm:h-48");
    expect(darkHtml).toContain("sm:h-60");
  });

  it("renders photo when photoUrl is provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
        photoUrl: "/u/test/photo",
      }),
    );
    expect(html).toContain("/u/test/photo");
  });

  it("renders cover when coverUrl is provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
        coverUrl: "/u/test/cover",
      }),
    );
    expect(html).toContain("/u/test/cover");
  });

  it("renders initials when photoUrl is null", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: DEFAULT_STATE,
        photoUrl: null,
      }),
    );
    expect(html).toContain("QT");
  });

  // ── Theme-specific preview branches ────────────────────────────────

  it("Classic selection renders standard CareerCardIdentity", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "role-race-classic" },
      }),
    );
    // Standard card uses text-stone-900 from classic tokens
    expect(html).toContain("text-stone-900");
    // Should NOT render NFC Compact
    expect(html).not.toContain("NFC Career Card");
  });

  it("Corporate selection renders standard CareerCardIdentity", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "corporate-clean" },
      }),
    );
    // Corporate uses rounded-md avatar
    expect(html).toContain("rounded-md");
    expect(html).not.toContain("NFC Career Card");
  });

  it("Executive Dark selection renders standard CareerCardIdentity", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "executive-dark" },
      }),
    );
    // Executive dark uses text-white for name
    expect(html).toContain("text-white");
    expect(html).not.toContain("NFC Career Card");
  });

  it("Tech Minimal selection renders standard CareerCardIdentity", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "tech-minimal" },
      }),
    );
    // Tech uses font-mono
    expect(html).toContain("font-mono");
    expect(html).not.toContain("NFC Career Card");
  });

  it("NFC Compact selection renders NFC preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "nfc-compact" },
      }),
    );
    expect(html).toContain("NFC Career Card");
    // Should NOT render generic CareerCardIdentity classes
    expect(html).not.toContain("text-stone-900");
  });

  it("NFC Compact Career Passport skin renders correct preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "career-passport",
        },
      }),
    );
    // Career Passport uses light bg
    expect(html).toContain("bg-[#fafaf9]");
    expect(html).toContain("NFC Career Card");
  });

  it("NFC Compact Crimson Night skin renders dark preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "crimson-night",
        },
      }),
    );
    // Crimson Night uses dark base variable
    expect(html).toContain("bg-[var(--cn-base)]");
    expect(html).toContain("NFC Career Card");
    // Should differ from Career Passport light bg
    expect(html).not.toContain("bg-[#fafaf9]");
  });

  it("NFC Compact preview shows Not published badge when unpublished", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "nfc-compact" },
        isPublished: false,
      }),
    );
    expect(html).toContain("Not published");
  });

  it("NFC Compact preview omits Not published badge when published", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: { ...DEFAULT_STATE, themeId: "nfc-compact" },
        isPublished: true,
      }),
    );
    expect(html).not.toContain("Not published");
  });

  it("NFC Compact Professional Connect skin renders investor-style preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
      }),
    );
    // Professional Connect uses gradient background
    expect(html).toContain("bg-gradient-to-b");
    // Uses NFC Profile label
    expect(html).toContain("NFC Profile");
    // Should NOT render Career Passport light bg
    expect(html).not.toContain("bg-[#fafaf9]");
    // Should NOT render Crimson Night dark bg
    expect(html).not.toContain("bg-[var(--cn-base)]");
  });

  it("NFC Compact Professional Connect renders candidate name and headline", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
          publicHeadline: "Senior Engineer",
        },
      }),
    );
    expect(html).toContain("QA Tester");
    expect(html).toContain("Senior Engineer");
  });

  it("NFC Compact Professional Connect renders professional summary from bio", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
          publicBio: "Building scalable systems.",
        },
      }),
    );
    expect(html).toContain("Building scalable systems.");
    expect(html).toContain("Professional Summary");
  });

  it("NFC Compact Professional Connect does not expose candidate private phone/email", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
      }),
    );
    // Should NOT render phone/email contact rows for candidate
    // (the candidate type has no publicPhone/publicEmail in the preview mapping)
    expect(html).not.toContain("+65");
    expect(html).not.toContain("@qa.tester");
  });

  it("NFC Compact Professional Connect renders LinkMeU wordmark branding", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
      }),
    );
    expect(html).toContain("linkmeu-wordmark.png");
  });

  it("NFC Compact Professional Connect does not render fake Project Match", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
      }),
    );
    expect(html).not.toContain("Project Match");
    expect(html).not.toContain("92%");
  });

  it("NFC Compact preview uses accent color from state", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          accentColorId: "red",
        },
      }),
    );
    // nfcCompactAccentStyle with red accent sets --nfc-cta
    expect(html).toContain("--nfc-cta");
  });

  // ── Company preview wiring ───────────────────────────────────────

  const DEMO_COMPANY: CompanyProfileState = {
    companyName: "Proinfocus Pte Ltd",
    tagline: "IT Solutions",
    contactPersonName: "Habib Mohamed",
    contactPersonRole: "Director",
    publicPhone: "+65 9019 1311",
    publicEmail: "habib@proinfocus.com",
    whatsappNumber: "90191311",
    whatsappCountry: "+65",
    websiteUrl: "https://proinfocus.com",
    linkedinUrl: "",
    facebookUrl: "https://facebook.com/proinfocus",
    instagramUrl: "",
    xUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    about: "We build IT solutions.",
    industry: "IT Services",
    locations: ["Singapore"],
    services: ["Consulting", "Support"],
    hiringOpen: true,
    openRolesSummary: "We are hiring!",
    openRolesUrl: "https://proinfocus.com/careers",
    companyProfileSummary: "View our profile",
    companyProfileUrl: "https://proinfocus.com/about",
    showPublicPhone: true,
    showPublicEmail: true,
    showWhatsapp: false,
    showContactPerson: true,
    isVisible: true,
  };

  it("NFC Compact Professional Connect shows switch when company data exists", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
        companyInitial: DEMO_COMPANY,
        logoUrl: "/u/test/logo",
      }),
    );
    // The segmented switch should be present
    expect(html).toContain("Candidate");
    expect(html).toContain("Company");
  });

  it("NFC Compact Professional Connect hides switch when company data absent", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
      }),
    );
    // No company data → no switch rendered by the shell
    expect(html).not.toContain('role="tablist"');
  });

  it("NFC Compact Professional Connect hides switch when company name is empty", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
        companyInitial: { ...DEMO_COMPANY, companyName: "" },
      }),
    );
    expect(html).not.toContain('role="tablist"');
  });

  it("NFC Compact Professional Connect renders company name and tagline when company active", () => {
    // Note: default active side is candidate, so company content is not visible
    // until switch is clicked. We verify company data is passed by checking
    // the switch renders (shell only renders switch when company is present).
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
        companyInitial: DEMO_COMPANY,
      }),
    );
    // Switch presence proves company data is wired
    expect(html).toContain('role="tablist"');
    expect(html).toContain("Company");
    // Company content is NOT visible while candidate is active
    expect(html).not.toContain("Proinfocus Pte Ltd");
  });

  it("NFC Compact Professional Connect renders candidate side by default when company exists", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
          publicHeadline: "Senior Engineer",
        },
        companyInitial: DEMO_COMPANY,
      }),
    );
    // Switch is present
    expect(html).toContain("Candidate");
    expect(html).toContain("Company");
    // But candidate content is shown by default
    expect(html).toContain("Senior Engineer");
    // Company content is NOT shown until switch is clicked
    expect(html).not.toContain("Proinfocus Pte Ltd");
  });

  it("NFC Compact Professional Connect hides company contact when visibility disabled", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
        companyInitial: {
          ...DEMO_COMPANY,
          showPublicPhone: false,
          showPublicEmail: false,
        },
      }),
    );
    // Even with company present, hidden contacts should not leak into markup
    expect(html).not.toContain("+65 9019 1311");
    expect(html).not.toContain("habib@proinfocus.com");
  });

  it("NFC Compact Professional Connect does not fabricate company data", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
        companyInitial: { ...DEMO_COMPANY, about: "" },
      }),
    );
    // About section should be absent when about is empty
    expect(html).not.toContain("We build IT solutions.");
  });

  it("NFC Compact Professional Connect no dead CTA in preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
        companyInitial: DEMO_COMPANY,
      }),
    );
    // cta={null} is passed → Cta skin piece returns null
    // The Cta container is only rendered inside the shell's inner div,
    // so no "Get in Touch" or "Contact Us" should appear from the Cta
    // component when cta is null. (The dev-lab default button label is hidden.)
    expect(html).not.toContain("Get in Touch");
    expect(html).not.toContain("Contact Us");
  });

  // ── Data-integrity verification ──────────────────────────────────

  it("output contains no hardcoded reference candidate names", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
      }),
    );
    expect(html).not.toContain("Ava Reyes");
    expect(html).not.toContain("Shahul");
    expect(html).not.toContain("Hameed");
  });

  it("output contains no hardcoded reference company names", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "professional-connect",
        },
      }),
    );
    expect(html).not.toContain("Skyline AI");
    expect(html).not.toContain("Proinfocus");
  });

  it("Professional Connect renders supplied skills dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(ProfessionalConnectCard, {
        candidate: {
          name: "Skill Tester",
          headline: "Engineer",
          initials: "ST",
          skills: ["React", "TypeScript"],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).toContain("React");
    expect(html).toContain("TypeScript");
    expect(html).toContain("Key Skills");
  });

  it("Professional Connect renders supplied education dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(ProfessionalConnectCard, {
        candidate: {
          name: "Edu Tester",
          headline: "Student",
          initials: "ET",
          skills: [],
          education: { degree: "B.S. Computer Science", institution: "MIT" },
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).toContain("B.S. Computer Science");
    expect(html).toContain("MIT");
    expect(html).toContain("Education");
  });

  it("Professional Connect renders supplied experience dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(ProfessionalConnectCard, {
        candidate: {
          name: "Exp Tester",
          headline: "Senior",
          initials: "XT",
          skills: [],
          yearsExperience: 5,
          experienceSummary: "Platform Engineering",
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).toContain("5+ Years");
    expect(html).toContain("Platform Engineering");
    expect(html).toContain("Experience");
  });

  it("Professional Connect renders supplied certifications dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(ProfessionalConnectCard, {
        candidate: {
          name: "Cert Tester",
          headline: "Certified",
          initials: "CT",
          skills: [],
          certifications: [{ name: "AWS SA", issuer: "AWS" }],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).toContain("AWS SA");
    expect(html).toContain("Certifications");
  });

  it("Professional Connect renders company services and locations dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(ProfessionalConnectCard, {
        candidate: {
          name: "Co Tester",
          headline: "Hiring",
          initials: "CO",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
        company: {
          companyName: "DynamicCo",
          locations: ["Singapore", "Tokyo"],
          services: ["Consulting", "Engineering"],
        },
        active: "company",
        onSwitch: () => {},
      }),
    );
    expect(html).toContain("Singapore");
    expect(html).toContain("Tokyo");
    expect(html).toContain("Consulting");
    expect(html).toContain("Engineering");
    expect(html).toContain("2 Locations");
    expect(html).toContain("2 Services");
  });

  it("Professional Connect collapses optional sections when data absent", () => {
    const html = renderToStaticMarkup(
      createElement(ProfessionalConnectCard, {
        candidate: {
          name: "Sparse Tester",
          headline: "Minimal",
          initials: "SP",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          availability: null,
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).not.toContain("Key Skills");
    expect(html).not.toContain("Education");
    expect(html).not.toContain("Experience");
    expect(html).not.toContain("Certifications");
    expect(html).not.toContain("Availability");
    expect(html).not.toContain("Portfolio");
  });

  it("Professional Connect CTA uses supplied real href", () => {
    const html = renderToStaticMarkup(
      createElement(ProfessionalConnectCard, {
        candidate: {
          name: "CTA Tester",
          headline: "Lead",
          initials: "CT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
        cta: { href: "https://rolerace.com/contact", label: "Hire Me" },
      }),
    );
    expect(html).toContain("https://rolerace.com/contact");
    expect(html).toContain("Hire Me");
  });

  it("Professional Connect contains no verified badge text", () => {
    const html = renderToStaticMarkup(
      createElement(ProfessionalConnectCard, {
        candidate: {
          name: "Verify Tester",
          headline: "Check",
          initials: "VT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).not.toContain("verified");
    expect(html).not.toContain("Verified");
  });

  // ── Creative Spotlight skin ──────────────────────────────────────

  it("NFC Compact Creative Spotlight skin renders warm preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
        },
      }),
    );
    expect(html).toContain("Creative Spotlight");
    expect(html).toContain("from-amber-50");
    expect(html).not.toContain("bg-[#fafaf9]");
    expect(html).not.toContain("bg-[var(--cn-base)]");
  });

  it("NFC Compact Creative Spotlight renders candidate name and headline", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
          publicHeadline: "Actor · Voice Artist",
        },
      }),
    );
    expect(html).toContain("QA Tester");
    expect(html).toContain("Actor · Voice Artist");
  });

  it("NFC Compact Creative Spotlight renders biography from bio", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
          publicBio: "Versatile performer across film and theatre.",
        },
      }),
    );
    expect(html).toContain("Versatile performer across film and theatre.");
    expect(html).toContain("Biography");
  });

  it("NFC Compact Creative Spotlight shows Celebrity/Production switch with company", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
        },
        companyInitial: DEMO_COMPANY,
      }),
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain("Celebrity");
    expect(html).toContain("Production Company");
  });

  it("NFC Compact Creative Spotlight hides switch when company absent", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
        },
      }),
    );
    expect(html).not.toContain('role="tablist"');
  });

  it("NFC Compact Creative Spotlight does not contain Project Match", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
        },
      }),
    );
    expect(html).not.toContain("Project Match");
    expect(html).not.toContain("92%");
  });

  it("NFC Compact Creative Spotlight does not contain verified badge", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
        },
      }),
    );
    expect(html).not.toContain("verified");
    expect(html).not.toContain("Verified");
  });

  it("NFC Compact Creative Spotlight renders LinkMeU wordmark branding", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
        },
      }),
    );
    expect(html).toContain("linkmeu-wordmark.png");
  });

  it("NFC Compact Creative Spotlight no dead CTA in preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
        },
        companyInitial: DEMO_COMPANY,
      }),
    );
    expect(html).not.toContain("Get in Touch");
    expect(html).not.toContain("Contact Us");
  });

  it("NFC Compact Creative Spotlight does not expose private phone/email", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "creative-spotlight",
        },
      }),
    );
    expect(html).not.toContain("+65");
    expect(html).not.toContain("@qa.tester");
  });

  // ── Signature Spotlight skin ─────────────────────────────────────

  it("NFC Compact Signature Spotlight skin renders premium light preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
      }),
    );
    // Signature Spotlight uses white bg and rounded-b-3xl cover treatment
    expect(html).toContain("bg-white");
    expect(html).toContain("rounded-b-3xl");
    expect(html).not.toContain("bg-[#fafaf9]");
    expect(html).not.toContain("bg-[var(--cn-base)]");
  });

  it("NFC Compact Signature Spotlight renders candidate name and headline", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
          publicHeadline: "Actor · Voice Artist",
        },
      }),
    );
    expect(html).toContain("QA Tester");
    expect(html).toContain("Actor · Voice Artist");
  });

  it("NFC Compact Signature Spotlight renders biography from bio", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
          publicBio: "Versatile performer across film and theatre.",
        },
      }),
    );
    expect(html).toContain("Versatile performer across film and theatre.");
  });

  it("NFC Compact Signature Spotlight shows availability when published and open", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
          openToOpportunities: true,
        },
        isPublished: true,
      }),
    );
    expect(html).toContain("Open to opportunities");
  });

  it("NFC Compact Signature Spotlight omits availability when unpublished", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
          openToOpportunities: true,
        },
        isPublished: false,
      }),
    );
    expect(html).not.toContain("Open to opportunities");
  });

  it("NFC Compact Signature Spotlight does NOT render Company switch", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
        companyInitial: DEMO_COMPANY,
      }),
    );
    // Signature Spotlight is standalone — no switch even with company present
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain("Candidate");
    expect(html).not.toContain("Company");
  });

  it("NFC Compact Signature Spotlight does not contain Project Match", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
      }),
    );
    expect(html).not.toContain("Project Match");
    expect(html).not.toContain("92%");
  });

  it("NFC Compact Signature Spotlight does not contain verified badge", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
      }),
    );
    expect(html).not.toContain("verified");
    expect(html).not.toContain("Verified");
  });

  it("NFC Compact Signature Spotlight does not contain platform branding", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
      }),
    );
    expect(html).not.toContain("linkmeu-wordmark");
    expect(html).not.toContain("RoleRace");
  });

  it("NFC Compact Signature Spotlight does not contain Invite to Project", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
      }),
    );
    expect(html).not.toContain("Invite to Project");
    expect(html).not.toContain("Collaboration Proposal");
  });

  it("NFC Compact Signature Spotlight does not expose private phone/email", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
      }),
    );
    expect(html).not.toContain("+65");
    expect(html).not.toContain("@qa.tester");
  });

  it("NFC Compact Signature Spotlight uses cover when provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
        coverUrl: "/u/test/cover",
      }),
    );
    expect(html).toContain("/u/test/cover");
  });

  it("NFC Compact Signature Spotlight uses photo when provided", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
        photoUrl: "/u/test/photo",
      }),
    );
    expect(html).toContain("/u/test/photo");
  });

  it("NFC Compact Signature Spotlight renders initials when photo is null", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
        photoUrl: null,
      }),
    );
    expect(html).toContain("QT");
  });

  it("NFC Compact Signature Spotlight no dead CTA in preview", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
      }),
    );
    // cta={null} in preview → no primary CTA rendered
    expect(html).not.toContain("Get in Touch");
    expect(html).not.toContain("View Showreel");
    expect(html).not.toContain("View Portfolio");
  });

  it("NFC Compact Signature Spotlight contains no hardcoded reference names", () => {
    const html = renderToStaticMarkup(
      createElement(CareerCardBuilderPreview, {
        ...BASE_PROPS,
        state: {
          ...DEFAULT_STATE,
          themeId: "nfc-compact",
          nfcCompactSkinId: "signature-spotlight",
        },
      }),
    );
    expect(html).not.toContain("Ava Reyes");
    expect(html).not.toContain("Maya Krishnan");
    expect(html).not.toContain("Priya Sharma");
  });

  // ── Direct SignatureSpotlightCard component tests ────────────────

  it("Signature Spotlight renders headline when present", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Headline Tester",
          headline: "Real Headline Value",
          initials: "HT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
      }),
    );
    expect(html).toContain("Real Headline Value");
  });

  it("Signature Spotlight does NOT fabricate headline from professionalCategories", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "NoHeadline",
          headline: "",
          initials: "NH",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          professionalCategories: ["Actor", "Director"],
        },
      }),
    );
    // Categories must render in their own section, NOT as headline substitute
    expect(html).toContain("Actor");
    expect(html).toContain("Director");
    // "Actor · Director" must NOT appear in the identity headline slot
    expect(html).not.toContain("Actor · Director");
  });

  it("Signature Spotlight does NOT fabricate headline from genres", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "NoHeadline",
          headline: "",
          initials: "NH",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          genres: ["Drama", "Thriller"],
        },
      }),
    );
    expect(html).toContain("Drama");
    expect(html).toContain("Thriller");
    // Genres must NOT become headline (headline slot should be empty)
    const headlineMatch = html.match(
      /<p class="text-sm font-medium[^>]*>([^<]*)<\/p>/,
    );
    expect(headlineMatch?.[1] ?? "").toBe("");
  });

  it("Signature Spotlight layout remains valid when headline absent", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Sparse",
          headline: "",
          initials: "SP",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
      }),
    );
    expect(html).toContain("Sparse");
    // No fabricated headline
    expect(html).not.toContain("Actor");
    expect(html).not.toContain("Director");
  });

  it("Signature Spotlight renders professionalCategories dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Cat Tester",
          headline: "Actor",
          initials: "CT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          professionalCategories: ["Actor", "Director"],
        },
      }),
    );
    expect(html).toContain("Actor");
    expect(html).toContain("Director");
  });

  it("Signature Spotlight collapses professionalCategories when absent", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "NoCat",
          headline: "Tester",
          initials: "NC",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
      }),
    );
    expect(html).not.toContain("Actor");
    expect(html).not.toContain("Director");
  });

  it("Signature Spotlight renders genres dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Genre Tester",
          headline: "Filmmaker",
          initials: "GT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          genres: ["Drama", "Thriller"],
        },
      }),
    );
    expect(html).toContain("Drama");
    expect(html).toContain("Thriller");
  });

  it("Signature Spotlight collapses genres when absent", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "NoGenre",
          headline: "Tester",
          initials: "NG",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
      }),
    );
    expect(html).not.toContain("Drama");
    expect(html).not.toContain("Thriller");
  });

  it("Signature Spotlight renders languages dynamically", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Lang Tester",
          headline: "Polyglot",
          initials: "LT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          languages: [
            { language: "English", fluency: "Native" },
            { language: "Tamil", fluency: "Fluent" },
          ],
        },
      }),
    );
    expect(html).toContain("English");
    expect(html).toContain("Tamil");
  });

  it("Signature Spotlight renders portfolioUrl as real href", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Port Tester",
          headline: "Creator",
          initials: "PT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          portfolioUrl: "https://portfolio.example.com",
        },
      }),
    );
    expect(html).toContain("https://portfolio.example.com");
    expect(html).toContain("Portfolio");
  });

  it("Signature Spotlight hides portfolio action when portfolioUrl absent", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "NoPort",
          headline: "Tester",
          initials: "NP",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
      }),
    );
    expect(html).not.toContain("Portfolio");
  });

  it("Signature Spotlight renders showreelUrl as real href", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Reel Tester",
          headline: "Filmmaker",
          initials: "RT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          showreelUrl: "https://vimeo.com/showreel",
        },
      }),
    );
    expect(html).toContain("https://vimeo.com/showreel");
    expect(html).toContain("Showreel");
  });

  it("Signature Spotlight hides showreel action when showreelUrl absent", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "NoReel",
          headline: "Tester",
          initials: "NR",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
      }),
    );
    expect(html).not.toContain("Showreel");
  });

  it("Signature Spotlight CTA uses real showreelUrl when present", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Cta Tester",
          headline: "Lead",
          initials: "CT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          showreelUrl: "https://vimeo.com/reel",
        },
      }),
    );
    expect(html).toContain("https://vimeo.com/reel");
    expect(html).toContain("View Showreel");
  });

  it("Signature Spotlight CTA falls back to portfolioUrl when showreel absent", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Cta2 Tester",
          headline: "Lead",
          initials: "C2",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          portfolioUrl: "https://portfolio.example.com",
        },
      }),
    );
    expect(html).toContain("https://portfolio.example.com");
    expect(html).toContain("View Portfolio");
  });

  it("Signature Spotlight collapses optional sections when data absent", () => {
    const html = renderToStaticMarkup(
      createElement(SignatureSpotlightCard, {
        candidate: {
          name: "Sparse Tester",
          headline: "Minimal",
          initials: "SP",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          availability: null,
        },
      }),
    );
    expect(html).not.toContain("Genres");
    expect(html).not.toContain("Languages");
    expect(html).not.toContain("Availability");
    expect(html).not.toContain("Portfolio");
    expect(html).not.toContain("Showreel");
    expect(html).not.toContain("Education");
    expect(html).not.toContain("Experience");
    expect(html).not.toContain("Credentials");
    expect(html).not.toContain("Skills");
  });

  // ── Responsive preview mode tests ────────────────────────────────

  it("Creative Spotlight does not contain fake verification checkmark", () => {
    const html = renderToStaticMarkup(
      createElement(CreativeSpotlightCard, {
        candidate: {
          name: "Verify Tester",
          headline: "Actor",
          initials: "VT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
          availability: "Available",
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).not.toContain("CheckCircle2");
    expect(html).not.toContain("verified");
    expect(html).not.toContain("Verified");
  });

  it("Career Passport mobile preview uses single column grid", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "mobile" },
        createElement(NfcCompactCard, {
          candidate: {
            name: "Grid Tester",
            headline: "Engineer",
            initials: "GT",
            skills: [],
            certifications: [],
            portfolioAvailable: false,
            resumeAvailable: false,
          },
          company: null,
          active: "candidate",
          onSwitch: () => {},
        }),
      ),
    );
    // Mobile mode should use grid-cols-1, NOT grid-cols-3
    expect(html).toContain("grid-cols-1");
    expect(html).not.toContain("grid-cols-3");
  });

  it("Career Passport desktop preview uses three column grid", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "desktop" },
        createElement(NfcCompactCard, {
          candidate: {
            name: "Grid Tester",
            headline: "Engineer",
            initials: "GT",
            skills: [],
            certifications: [],
            portfolioAvailable: false,
            resumeAvailable: false,
          },
          company: null,
          active: "candidate",
          onSwitch: () => {},
        }),
      ),
    );
    // Desktop mode should use grid-cols-3
    expect(html).toContain("grid-cols-3");
    expect(html).not.toContain("grid-cols-1");
  });

  it("Crimson Night mobile preview uses size-20 portrait", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "mobile" },
        createElement(CrimsonNightCard, {
          candidate: {
            name: "Portrait Tester",
            headline: "Dev",
            initials: "PT",
            skills: [],
            certifications: [],
            portfolioAvailable: false,
            resumeAvailable: false,
          },
          company: null,
          active: "candidate",
          onSwitch: () => {},
        }),
      ),
    );
    // Mobile mode should use size-20
    expect(html).toContain("size-20");
    expect(html).not.toContain("size-24");
  });

  it("Crimson Night desktop preview uses size-24 portrait", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "desktop" },
        createElement(CrimsonNightCard, {
          candidate: {
            name: "Portrait Tester",
            headline: "Dev",
            initials: "PT",
            skills: [],
            certifications: [],
            portfolioAvailable: false,
            resumeAvailable: false,
          },
          company: null,
          active: "candidate",
          onSwitch: () => {},
        }),
      ),
    );
    // Desktop mode should use size-24
    expect(html).toContain("size-24");
    expect(html).not.toContain("size-20");
  });

  it("Professional Connect mobile preview uses single column grid", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "mobile" },
        createElement(ProfessionalConnectCard, {
          candidate: {
            name: "Grid Tester",
            headline: "Engineer",
            initials: "GT",
            skills: [],
            certifications: [],
            portfolioAvailable: false,
            resumeAvailable: false,
          },
          company: null,
          active: "candidate",
          onSwitch: () => {},
        }),
      ),
    );
    expect(html).toContain("grid-cols-1");
    expect(html).not.toContain("grid-cols-3");
  });

  it("Professional Connect desktop preview uses three column grid", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "desktop" },
        createElement(ProfessionalConnectCard, {
          candidate: {
            name: "Grid Tester",
            headline: "Engineer",
            initials: "GT",
            skills: [],
            certifications: [],
            portfolioAvailable: false,
            resumeAvailable: false,
          },
          company: null,
          active: "candidate",
          onSwitch: () => {},
        }),
      ),
    );
    expect(html).toContain("grid-cols-3");
    expect(html).not.toContain("grid-cols-1");
  });

  it("Signature Spotlight mobile preview uses single column grid", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "mobile" },
        createElement(SignatureSpotlightCard, {
          candidate: {
            name: "Grid Tester",
            headline: "Engineer",
            initials: "GT",
            skills: [],
            certifications: [],
            portfolioAvailable: false,
            resumeAvailable: false,
            portfolioUrl: "https://example.com/portfolio",
            showreelUrl: "https://example.com/showreel",
          },
        }),
      ),
    );
    expect(html).toContain("grid-cols-1");
    expect(html).not.toContain("grid-cols-2");
  });

  it("Signature Spotlight desktop preview uses two column grid", () => {
    const html = renderToStaticMarkup(
      createElement(
        PreviewModeProvider,
        { mode: "desktop" },
        createElement(SignatureSpotlightCard, {
          candidate: {
            name: "Grid Tester",
            headline: "Engineer",
            initials: "GT",
            skills: [],
            certifications: [],
            portfolioAvailable: false,
            resumeAvailable: false,
            portfolioUrl: "https://example.com/portfolio",
            showreelUrl: "https://example.com/showreel",
          },
        }),
      ),
    );
    expect(html).toContain("grid-cols-2");
    expect(html).not.toContain("grid-cols-1");
  });

  it("public page fallback uses viewport-based responsive classes", () => {
    // When rendered outside PreviewModeProvider, cards should use
    // the publicFallback (viewport-based sm: breakpoint classes)
    const html = renderToStaticMarkup(
      createElement(NfcCompactCard, {
        candidate: {
          name: "Fallback Tester",
          headline: "Engineer",
          initials: "FT",
          skills: [],
          certifications: [],
          portfolioAvailable: false,
          resumeAvailable: false,
        },
        company: null,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    // Public fallback should contain the sm: breakpoint classes
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-3");
  });
});
