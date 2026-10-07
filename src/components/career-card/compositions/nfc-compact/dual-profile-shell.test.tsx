import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DualProfileTemplateShell } from "./dual-profile-shell";
import { NfcCompactCard } from "./nfc-compact-card";
import { CrimsonNightCard } from "./crimson-night/crimson-night-card";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";

const DEMO_CANDIDATE: CompactCandidate = {
  name: "Alex Rivera",
  headline: "Engineering Lead",
  currentRole: "Staff Engineer",
  portrait: undefined,
  cover: undefined,
  coverFocalX: 0.5,
  coverFocalY: 0.5,
  coverZoom: 1,
  initials: "AR",
  linkedin: null,
  github: null,
  website: null,
  professionalSummary: undefined,
  skills: [],
  certifications: [],
  portfolioAvailable: false,
  resumeAvailable: false,
  availability: null,
};

const DEMO_COMPANY: CompactCompany = {
  companyName: "RoleRace Inc",
  tagline: "Hiring Platform",
  logo: undefined,
  about: "We build hiring tools.",
  industry: "Technology",
  locations: ["Remote"],
  services: [],
  website: null,
  linkedin: null,
};

function StubFrame({ children }: { children: React.ReactNode }) {
  return <div data-testid="frame">{children}</div>;
}

function StubBrandBar({ shareUrl }: { shareUrl?: string | null }) {
  return <div data-testid="brand-bar">{shareUrl ? "qr" : "no-qr"}</div>;
}

function StubSwitch({
  value,
  onChange,
}: {
  value: "candidate" | "company";
  onChange: (v: "candidate" | "company") => void;
}) {
  return (
    <button
      data-testid="switch"
      data-value={value}
      onClick={() => onChange(value === "candidate" ? "company" : "candidate")}
    >
      Switch
    </button>
  );
}

function StubCandidate({ candidate }: { candidate: CompactCandidate }) {
  return <div data-testid="candidate">{candidate.name}</div>;
}

function StubCompany({ company }: { company: CompactCompany }) {
  return <div data-testid="company">{company.companyName}</div>;
}

function StubCta({
  active,
  cta,
}: {
  active: "candidate" | "company";
  cta: { href: string; label: string } | null | undefined;
}) {
  return (
    <div
      data-testid="cta"
      data-active={active}
      data-cta-type={cta === undefined ? "default" : cta ? "link" : "hidden"}
    >
      {cta === undefined ? "Default CTA" : cta ? cta.label : "Hidden"}
    </div>
  );
}

const STUB_SKIN = {
  Frame: StubFrame,
  BrandBar: StubBrandBar,
  ProfileSwitch: StubSwitch,
  CandidateContent: StubCandidate,
  CompanyContent: StubCompany,
  Cta: StubCta,
};

describe("DualProfileTemplateShell", () => {
  it("renders candidate content when active is candidate", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain("Alex Rivera");
    expect(html).not.toContain("RoleRace Inc");
  });

  it("renders company content when active is company and company is provided", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        company: DEMO_COMPANY,
        active: "company",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain("RoleRace Inc");
    expect(html).not.toContain("Alex Rivera");
  });

  it("falls back to candidate content when active is company but company is absent", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "company",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain("Alex Rivera");
  });

  it("renders profile switch when company is provided", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        company: DEMO_COMPANY,
        active: "candidate",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain('data-testid="switch"');
  });

  it("omits profile switch when company is absent", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).not.toContain('data-testid="switch"');
  });

  it("renders default CTA when cta prop is undefined", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain("Default CTA");
    expect(html).toContain('data-cta-type="default"');
  });

  it("renders link CTA when cta prop is provided", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
        cta: { href: "/contact", label: "Hire Me" },
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain("Hire Me");
    expect(html).toContain('data-cta-type="link"');
  });

  it("hides CTA when cta prop is null", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
        cta: null,
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain("Hidden");
    expect(html).toContain('data-cta-type="hidden"');
  });

  it("passes active side to CTA renderer", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        company: DEMO_COMPANY,
        active: "company",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain('data-active="company"');
  });

  it("passes shareUrl to brand bar", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
        shareUrl: "https://example.com/n/abc",
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain("qr");
  });

  it("omits shareUrl from brand bar when absent", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain("no-qr");
  });

  it("wraps everything in the skin Frame", () => {
    const html = renderToStaticMarkup(
      createElement(DualProfileTemplateShell, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
        skin: STUB_SKIN,
      }),
    );
    expect(html).toContain('data-testid="frame"');
  });
});

describe("DualProfileTemplateShell — skin output preservation", () => {
  it("Career Passport skin produces distinct light-theme output", () => {
    const html = renderToStaticMarkup(
      createElement(NfcCompactCard, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).toContain("bg-[#fafaf9]");
    expect(html).toContain("NFC Career Card");
  });

  it("Crimson Night skin produces distinct dark-theme output", () => {
    const html = renderToStaticMarkup(
      createElement(CrimsonNightCard, {
        candidate: DEMO_CANDIDATE,
        active: "candidate",
        onSwitch: () => {},
      }),
    );
    expect(html).toContain("bg-[var(--cn-base)]");
    expect(html).toContain("NFC Career Card");
  });
});
