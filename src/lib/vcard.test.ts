import { describe, it, expect } from "vitest";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import {
  buildVCard,
  candidateVCard,
  companyVCard,
  hasCandidateContact,
  hasCompanyContact,
  vcardFilename,
} from "./vcard";

const CANDIDATE: CompactCandidate = {
  name: "Priya Sharma",
  headline: "Actor · Voice Artist",
  currentRole: "Lead Actor",
  currentCompany: "Studio Nine",
  location: "Mumbai, India",
  initials: "PS",
  whatsappUrl: "https://wa.me/919876543210",
  linkedin: "https://linkedin.com/in/priya",
  github: null,
  website: "https://priya.example.com",
  professionalSummary: "Performer.",
  skills: [],
  certifications: [],
  portfolioAvailable: false,
  resumeAvailable: false,
  availability: "Open to opportunities",
};

const COMPANY: CompactCompany = {
  companyName: "Adelphos Industries",
  tagline: "Hiring Platform",
  contactPerson: "Alex Rivera",
  contactPersonRole: "Partnerships",
  publicPhone: "+971501234567",
  publicEmail: "hello@adelphos.example",
  whatsappUrl: "https://wa.me/971501234567",
  website: "https://adelphos.example",
  linkedin: "https://linkedin.com/company/adelphos",
  industry: "Technology",
  locations: ["Dubai, UAE", "Riyadh, KSA"],
  services: [],
};

describe("buildVCard", () => {
  it("emits a valid 3.0 envelope and skips empty fields", () => {
    const v = buildVCard([
      ["FN", "Test Person"],
      ["TEL", null],
      ["EMAIL", "t@e.co"],
    ]);
    expect(v).toContain("BEGIN:VCARD");
    expect(v).toContain("VERSION:3.0");
    expect(v).toContain("FN:Test Person");
    expect(v).not.toContain("TEL");
    expect(v).toContain("EMAIL:t@e.co");
    expect(v).toContain("END:VCARD");
  });

  it("escapes commas, semicolons and newlines", () => {
    const v = buildVCard([["TITLE", "A, B; C\nD"]]);
    expect(v).toContain("TITLE:A\\, B\\; C\\nD");
  });

  it("folds lines longer than 72 chars with continuation space", () => {
    const v = buildVCard([["NOTE", "x".repeat(100)]]);
    const lines = v.split("\r\n");
    const note = lines.findIndex((l) => l.startsWith("NOTE:"));
    expect(note).toBeGreaterThan(-1);
    expect(lines[note].length).toBeLessThanOrEqual(75);
    expect(lines[note + 1].startsWith(" ")).toBe(true);
  });
});

describe("candidateVCard", () => {
  const v = candidateVCard(CANDIDATE, {
    shareUrl: "https://linkmeu.example/n/abc",
    origin: "https://linkmeu.example",
  });

  it("includes identity fields", () => {
    expect(v).toContain("FN:Priya Sharma");
    expect(v).toContain("N:Sharma;Priya;;;");
    expect(v).toContain("TITLE:Actor · Voice Artist");
    expect(v).toContain("ROLE:Lead Actor");
    expect(v).toContain("ORG:Studio Nine");
  });

  it("maps public whatsapp to TEL and never invents email", () => {
    expect(v).toContain("TEL;TYPE=CELL,VOICE:+919876543210");
    expect(v).not.toContain("EMAIL");
  });

  it("carries authorized public URLs and share link", () => {
    expect(v).toContain("URL;TYPE=PROFILE:https://linkmeu.example/n/abc");
    expect(v).toContain("URL;TYPE=WORK:https://priya.example.com");
    expect(v).toContain("URL;TYPE=LINKEDIN:https://linkedin.com/in/priya");
  });

  it("escapes structured ADR locality", () => {
    expect(v).toContain("ADR;TYPE=WORK:;;Mumbai\\, India;;;;");
  });

  it("omits phone when whatsapp is not public", () => {
    const hidden = candidateVCard(
      { ...CANDIDATE, whatsappUrl: null, publicPhone: null },
      {},
    );
    expect(hidden).not.toContain("TEL");
  });
});

describe("companyVCard", () => {
  const v = companyVCard(COMPANY, {
    shareUrl: "https://linkmeu.example/n/abc",
  });

  it("represents the organization", () => {
    expect(v).toContain("FN:Adelphos Industries");
    expect(v).toContain("ORG:Adelphos Industries");
    expect(v).toContain("ROLE:Hiring Platform");
    expect(v).toContain("CATEGORIES:Technology");
  });

  it("uses only explicitly public company channels", () => {
    expect(v).toContain("TEL;TYPE=WORK,VOICE:+971501234567");
    expect(v).toContain("EMAIL;TYPE=INTERNET,WORK:hello@adelphos.example");
    expect(v).toContain("TEL;TYPE=CELL:+971501234567");
  });

  it("emits one ADR per public location", () => {
    expect(v.match(/ADR;TYPE=WORK/g)).toHaveLength(2);
  });

  it("notes the public contact person", () => {
    expect(v).toContain("NOTE:Contact: Alex Rivera (Partnerships)");
  });
});

describe("visibility guards", () => {
  it("candidate requires name plus one real channel", () => {
    expect(hasCandidateContact(CANDIDATE, null)).toBe(true);
    expect(
      hasCandidateContact(
        {
          ...CANDIDATE,
          whatsappUrl: null,
          linkedin: null,
          website: null,
          portfolioUrl: null,
          showreelUrl: null,
        },
        null,
      ),
    ).toBe(false);
    expect(
      hasCandidateContact(
        {
          ...CANDIDATE,
          whatsappUrl: null,
          linkedin: null,
          website: null,
          portfolioUrl: null,
          showreelUrl: null,
        },
        "https://x/n/t",
      ),
    ).toBe(true);
  });

  it("company requires name plus one public channel", () => {
    expect(hasCompanyContact(COMPANY, null)).toBe(true);
    const bare = {
      ...COMPANY,
      publicPhone: null,
      publicEmail: null,
      whatsappUrl: null,
      website: null,
      linkedin: null,
      facebook: null,
      instagram: null,
      x: null,
      youtube: null,
      tiktok: null,
    };
    expect(hasCompanyContact(bare, null)).toBe(false);
    expect(hasCompanyContact(bare, "https://x/n/t")).toBe(true);
  });
});

describe("vcardFilename", () => {
  it("slugifies names and falls back safely", () => {
    expect(vcardFilename("Priya Sharma")).toBe("priya-sharma.vcf");
    expect(vcardFilename("  ")).toBe("contact.vcf");
  });
});
