import {
  DEFAULT_RESUME_SECTION_ORDER,
  type ResumeData,
} from "@/lib/resume-schema";

/**
 * Fixed fictional resume used ONLY to render miniature previews on the
 * candidate Templates gallery. Deterministic, never persisted, never
 * derived from a real candidate — the gallery must not depend on the
 * database or any candidate content.
 *
 * IDs are literal placeholder UUIDs; block IDs follow the canonical
 * composer convention (`<area>:<uuid>` / `:<part>:<n>`) so anchors
 * behave identically to real variants.
 */
const uuid = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const blk = (area: string, n: number) => `${area}:${uuid(n)}`;

export const TEMPLATE_DEMO_RESUME_DATA: ResumeData = {
  basics: {
    fullName: "Alex Morgan",
    headline: "Senior Product Manager",
    email: "alex.morgan@example.com",
    phone: "+1 415 555 0132",
    location: "San Francisco, CA",
    links: [
      {
        label: "linkedin.com/in/alexmorgan",
        url: "https://linkedin.com/in/alexmorgan",
      },
      { label: "alexmorgan.dev", url: "https://alexmorgan.dev" },
    ],
  },
  summary: {
    id: "basics:summary",
    text: "Product manager with 8 years of experience shipping B2B SaaS platforms. Known for turning ambiguous problem spaces into focused roadmaps and measurable outcomes.",
  },
  experience: [
    {
      sourceId: uuid(1),
      blockId: blk("work", 1),
      company: "Northwind Analytics",
      position: "Senior Product Manager",
      location: "San Francisco, CA",
      employmentType: "Full-time",
      startDate: "2022-03",
      endDate: null,
      isCurrent: true,
      summary: null,
      highlights: [
        {
          id: `work:${uuid(1)}:highlight:0`,
          text: "Led a cross-functional squad that grew activation 24% in two quarters.",
        },
        {
          id: `work:${uuid(1)}:highlight:1`,
          text: "Shipped a self-serve onboarding flow adopted by 70% of new accounts.",
        },
      ],
    },
    {
      sourceId: uuid(2),
      blockId: blk("work", 2),
      company: "Fieldstone Software",
      position: "Product Manager",
      location: "Oakland, CA",
      employmentType: "Full-time",
      startDate: "2019-06",
      endDate: "2022-02",
      isCurrent: false,
      summary: null,
      highlights: [
        {
          id: `work:${uuid(2)}:highlight:0`,
          text: "Owned roadmap and delivery for a reporting platform used by 3,000 customers.",
        },
      ],
    },
  ],
  education: [
    {
      sourceId: uuid(3),
      blockId: blk("education", 3),
      institution: "University of California, Berkeley",
      degree: "B.A.",
      fieldOfStudy: "Business Administration",
      location: "Berkeley, CA",
      startDate: "2013",
      endDate: "2017",
      grade: null,
      highlights: [],
    },
  ],
  skills: [
    {
      sourceId: uuid(4),
      blockId: blk("skill", 4),
      name: "Product",
      keywords: [
        { id: `skill:${uuid(4)}:keyword:0`, text: "Roadmapping" },
        { id: `skill:${uuid(4)}:keyword:1`, text: "Discovery" },
        { id: `skill:${uuid(4)}:keyword:2`, text: "Stakeholder Management" },
      ],
    },
    {
      sourceId: uuid(5),
      blockId: blk("skill", 5),
      name: "Technical",
      keywords: [
        { id: `skill:${uuid(5)}:keyword:0`, text: "SQL" },
        { id: `skill:${uuid(5)}:keyword:1`, text: "Analytics" },
        { id: `skill:${uuid(5)}:keyword:2`, text: "A/B Testing" },
      ],
    },
  ],
  projects: [
    {
      sourceId: uuid(6),
      blockId: blk("project", 6),
      name: "Launch Metrics Dashboard",
      description: {
        id: `project:${uuid(6)}:description`,
        text: "Open-source dashboard template for tracking product launches.",
      },
      url: "https://github.com/alexmorgan/launch-metrics",
      startDate: "2023",
      endDate: null,
      highlights: [],
    },
  ],
  certifications: [
    {
      sourceId: uuid(7),
      blockId: blk("certification", 7),
      name: "Certified Scrum Product Owner",
      issuer: "Scrum Alliance",
      date: "2021",
      expiryDate: null,
      credentialId: null,
      url: null,
    },
  ],
  languages: [
    {
      sourceId: uuid(8),
      blockId: blk("language", 8),
      language: "English",
      fluency: "Native",
    },
    {
      sourceId: uuid(9),
      blockId: blk("language", 9),
      language: "Spanish",
      fluency: "Professional",
    },
  ],
  sectionOrder: [...DEFAULT_RESUME_SECTION_ORDER],
};
