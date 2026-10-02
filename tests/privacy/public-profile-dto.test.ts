import { describe, expect, it } from "vitest";

import { buildPublicProfileDTO } from "@/server/public-profile/public-profile";

const PRIVATE_EMAIL = "hidden@example.test";
const PRIVATE_PHONE = "+15550001234";
const PRIVATE_WHATSAPP = "+15550009876";

function baseProfile(overrides: Record<string, unknown> = {}) {
  return {
    isPublished: true,
    slug: "candidate-a",
    themeId: "classic",
    accentColorId: "red",
    cardStyleId: "compact",
    nfcCompactSkinId: "default",
    profilePhotoKey: null,
    coverPhotoKey: null,
    coverPhotoFocalX: 0.5,
    coverPhotoFocalY: 0.5,
    coverPhotoZoom: 1,
    profilePhotoFocalX: 0.5,
    profilePhotoFocalY: 0.5,
    profilePhotoZoom: 1,
    publicHeadline: "Engineer",
    publicBio: "Public bio",
    publicLocation: "Austin",
    currentFocus: null,
    workAuthorization: null,
    openToOpportunities: false,
    whatsappNumber: PRIVATE_WHATSAPP,
    showWhatsapp: false,
    linkedinUrl: null,
    githubUrl: null,
    websiteUrl: null,
    showExperience: false,
    showEducation: false,
    showSkills: false,
    showProjects: false,
    showCertifications: false,
    showLanguages: false,
    featuredResumeVariant: null,
    candidate: {
      firstName: "Candidate",
      lastName: "Alpha",
      careerProfile: {
        profileData: {
          basics: {
            fullName: "Candidate Alpha",
            email: PRIVATE_EMAIL,
            phone: PRIVATE_PHONE,
          },
        },
      },
    },
    ...overrides,
  } as Parameters<typeof buildPublicProfileDTO>[0];
}

describe("buildPublicProfileDTO — contact privacy", () => {
  it("does not expose WhatsApp when showWhatsapp is false", () => {
    const dto = buildPublicProfileDTO(baseProfile());
    expect(dto).not.toBeNull();
    expect(dto!.whatsappUrl).toBeNull();
  });

  it("exposes a derived wa.me link only when showWhatsapp is true", () => {
    const dto = buildPublicProfileDTO(baseProfile({ showWhatsapp: true }));
    expect(dto!.whatsappUrl).toBe("https://wa.me/15550009876");
  });

  it("never emits candidate email or phone", () => {
    const dto = buildPublicProfileDTO(baseProfile({ showWhatsapp: true }));
    const json = JSON.stringify(dto);
    expect(json).not.toContain(PRIVATE_EMAIL);
    expect(json).not.toContain(PRIVATE_PHONE);
  });

  it("emits the whatsapp number only inside the derived wa.me URL", () => {
    const dto = buildPublicProfileDTO(baseProfile({ showWhatsapp: true }));
    const { whatsappUrl, ...rest } = dto!;
    expect(JSON.stringify(rest)).not.toContain("5550009876");
    expect(whatsappUrl).toBe("https://wa.me/15550009876");
  });

  it("does not include internal ids or storage keys in the DTO", () => {
    const dto = buildPublicProfileDTO(baseProfile());
    const json = JSON.stringify(dto);
    expect(dto).not.toHaveProperty("id");
    expect(dto).not.toHaveProperty("candidateId");
    expect(json).not.toContain("storageKey");
  });
});

describe("buildPublicProfileDTO — publication gate", () => {
  it("returns null for an unpublished profile", () => {
    const dto = buildPublicProfileDTO(baseProfile({ isPublished: false }));
    expect(dto).toBeNull();
  });

  it("returns a DTO for unpublished only with owner-preview flag", () => {
    const dto = buildPublicProfileDTO(baseProfile({ isPublished: false }), {
      allowUnpublished: true,
    });
    expect(dto).not.toBeNull();
    expect(dto!.name).toBe("Candidate Alpha");
  });
});
