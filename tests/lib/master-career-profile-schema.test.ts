import { describe, expect, it } from "vitest";

import {
  masterCareerProfileBasicsSchema,
  masterCareerProfileSchema,
  createEmptyMasterCareerProfile,
} from "@/lib/master-career-profile-schema";

describe("masterCareerProfileBasicsSchema — backward compatibility", () => {
  it("parses old basics without new celebrity fields", () => {
    const parsed = masterCareerProfileBasicsSchema.safeParse({
      fullName: "Old Profile",
      headline: "Engineer",
      summary: null,
      email: null,
      phone: null,
      location: null,
      links: [],
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data!.professionalCategories).toBeUndefined();
    expect(parsed.data!.genres).toBeUndefined();
    expect(parsed.data!.portfolioUrl).toBeUndefined();
    expect(parsed.data!.showreelUrl).toBeUndefined();
  });

  it("parses new basics with all celebrity fields", () => {
    const parsed = masterCareerProfileBasicsSchema.safeParse({
      fullName: "New Profile",
      headline: "Actor",
      summary: null,
      email: null,
      phone: null,
      location: null,
      links: [],
      professionalCategories: ["Actor", "Voice Artist"],
      genres: ["Drama", "Comedy"],
      portfolioUrl: "https://portfolio.example.com",
      showreelUrl: "https://vimeo.com/12345",
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data!.professionalCategories).toEqual([
      "Actor",
      "Voice Artist",
    ]);
    expect(parsed.data!.genres).toEqual(["Drama", "Comedy"]);
    expect(parsed.data!.portfolioUrl).toBe("https://portfolio.example.com");
    expect(parsed.data!.showreelUrl).toBe("https://vimeo.com/12345");
  });

  it("accepts empty professionalCategories", () => {
    const parsed = masterCareerProfileBasicsSchema.safeParse({
      fullName: "Test",
      headline: null,
      summary: null,
      email: null,
      phone: null,
      location: null,
      links: [],
      professionalCategories: [],
      genres: [],
      portfolioUrl: null,
      showreelUrl: null,
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data!.professionalCategories).toEqual([]);
    expect(parsed.data!.genres).toEqual([]);
  });

  it("rejects invalid portfolioUrl", () => {
    const parsed = masterCareerProfileBasicsSchema.safeParse({
      fullName: "Test",
      headline: null,
      summary: null,
      email: null,
      phone: null,
      location: null,
      links: [],
      portfolioUrl: "not-a-url",
      showreelUrl: null,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid showreelUrl", () => {
    const parsed = masterCareerProfileBasicsSchema.safeParse({
      fullName: "Test",
      headline: null,
      summary: null,
      email: null,
      phone: null,
      location: null,
      links: [],
      portfolioUrl: null,
      showreelUrl: "ftp://bad.protocol",
    });
    expect(parsed.success).toBe(false);
  });

  it("deduplicates and trims professionalCategories", () => {
    const parsed = masterCareerProfileBasicsSchema.safeParse({
      fullName: "Test",
      headline: null,
      summary: null,
      email: null,
      phone: null,
      location: null,
      links: [],
      professionalCategories: ["Actor", "  Actor  ", "Model", ""],
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data!.professionalCategories).toEqual(["Actor", "Model"]);
  });

  it("deduplicates and trims genres", () => {
    const parsed = masterCareerProfileBasicsSchema.safeParse({
      fullName: "Test",
      headline: null,
      summary: null,
      email: null,
      phone: null,
      location: null,
      links: [],
      genres: ["Drama", "  Drama  ", "Comedy", ""],
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data!.genres).toEqual(["Drama", "Comedy"]);
  });
});

describe("masterCareerProfileSchema — old documents", () => {
  it("parses existing profileData without new fields", () => {
    const parsed = masterCareerProfileSchema.safeParse({
      basics: {
        fullName: "Legacy User",
        headline: null,
        summary: null,
        email: null,
        phone: null,
        location: null,
        links: [],
      },
      work: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data!.basics.professionalCategories).toBeUndefined();
    expect(parsed.data!.basics.genres).toBeUndefined();
    expect(parsed.data!.basics.portfolioUrl).toBeUndefined();
    expect(parsed.data!.basics.showreelUrl).toBeUndefined();
  });

  it("parses existing profileData with partial basics missing new fields", () => {
    const parsed = masterCareerProfileSchema.safeParse({
      basics: {
        fullName: "Legacy User",
        headline: null,
        summary: null,
        email: null,
        phone: null,
        location: null,
        links: [],
        // professionalCategories, genres, portfolioUrl, showreelUrl absent
      },
      work: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
    });
    expect(parsed.success).toBe(true);
  });
});

describe("createEmptyMasterCareerProfile", () => {
  it("initializes new celebrity fields to empty/null", () => {
    const empty = createEmptyMasterCareerProfile();
    expect(empty.basics.professionalCategories).toEqual([]);
    expect(empty.basics.genres).toEqual([]);
    expect(empty.basics.portfolioUrl).toBeNull();
    expect(empty.basics.showreelUrl).toBeNull();
  });
});
