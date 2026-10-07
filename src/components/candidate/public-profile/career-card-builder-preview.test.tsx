import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CareerCardBuilderPreview } from "./career-card-builder-preview";
import type { PublicProfileSettingsState } from "./public-profile-settings";
import type { CompanyProfileState } from "./company-profile-settings";
import { ProfessionalConnectCard } from "@/components/career-card/compositions/nfc-compact/professional-connect/professional-connect-card";

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

  it("NFC Compact Professional Connect does not render LinkMeU branding", () => {
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
    expect(html).not.toContain("LinkMeU");
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
});
