import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import {
  Award,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  Languages,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { BlurFade, BorderBeam } from "@/components/dev-lab/lab-effects";
import { LabCard } from "@/components/dev-lab/lab-card";

/* Fixed synthetic demo data — no database, no real candidate. */
const demo = {
  name: "Ava Reyes",
  headline: "AI Product Manager — GenAI & Agentic Workflows",
  location: "San Francisco, CA",
  openToOpportunities: true,
  cover: null as string | null, // rendered as cinematic gradient
  portrait: null as string | null, // rendered as gradient monogram
  yearsExperience: 8,
  projectsCount: 3,
  companiesCount: 3,
  about:
    "Product manager with 6+ years shipping enterprise AI. Built LLM evaluation frameworks, RAG pipelines and agentic workflows serving 2M+ users. Led cross-functional teams across 0→1 launches and scaled platform products at Series B–D companies.",
  experience: [
    {
      position: "Senior AI Product Manager",
      company: "Skyline AI",
      dates: "2022 – Present",
      location: "San Francisco, CA",
      summary: "Owns GenAI platform roadmap and evaluation framework.",
      highlights: [
        "Launched agentic workflow platform used by 2M+ users",
        "Cut evaluation cycle time 40% via automated LLM test harness",
      ],
    },
    {
      position: "Product Manager",
      company: "Meridian Systems",
      dates: "2020 – 2022",
      location: "New York, NY",
      summary: "Led RAG search product for enterprise customers.",
      highlights: ["Shipped semantic search to 300+ enterprise accounts"],
    },
    {
      position: "Associate Product Manager",
      company: "Corebridge Analytics",
      dates: "2018 – 2019",
      location: "Boston, MA",
      summary: "Analytics product squads across B2B SaaS.",
      highlights: [] as string[],
    },
  ],
  projects: [
    {
      name: "Agentic Workflow Platform",
      description: "Multi-step LLM automation for enterprise ops",
    },
    {
      name: "LLM Eval Harness",
      description: "Automated quality scoring framework",
    },
    {
      name: "Semantic Search",
      description: "RAG retrieval for 300+ enterprise accounts",
    },
  ],
  skills: [
    "Product Strategy",
    "Roadmapping",
    "Experimentation",
    "LLMs",
    "RAG",
    "Evals",
    "SQL",
    "Agentic Workflows",
    "Prompt Engineering",
    "Discovery",
    "Stakeholder Mgmt",
    "Fine-tuning",
  ],
  education: [{ degree: "MBA", institution: "INSEAD", dates: "2017 – 2018" }],
  certifications: [{ name: "PMP", issuer: "PMI", date: "2021" }],
  languages: [
    { language: "English", fluency: "Native" },
    { language: "Spanish", fluency: "Fluent" },
  ],
  links: { linkedin: "#", github: "#", website: "#" },
  featuredResume: {
    name: "LinkMeU Demo Resume",
    targetRole: "AI Product Manager",
  },
};

const CINEMATIC_COVER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b0764"/><stop offset=".45" stop-color="#581c87"/><stop offset=".75" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0c0a09"/></linearGradient><radialGradient id="r" cx=".78" cy=".15" r=".7"><stop offset="0" stop-color="#a78bfa" stop-opacity=".5"/><stop offset=".55" stop-color="#7c3aed" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="400" fill="url(#g)"/><rect width="1200" height="400" fill="url(#r)"/><path d="M0 330 Q 300 250 620 300 T 1200 240 V400 H0 Z" fill="#0c0a09" opacity=".45"/><path d="M0 330 Q 300 250 620 300 T 1200 240" fill="none" stroke="#a78bfa" stroke-opacity=".35" stroke-width="2"/></svg>`,
  );

const PORTRAIT =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d28d9"/><stop offset="1" stop-color="#312e81"/></linearGradient></defs><rect width="300" height="300" fill="url(#p)"/><circle cx="150" cy="118" r="52" fill="#ddd6fe"/><path d="M150 186c-58 0-96 34-96 80v34h192v-34c0-46-38-80-96-80z" fill="#ddd6fe"/><text x="150" y="132" text-anchor="middle" font-family="Georgia" font-size="52" fill="#4c1d95" font-weight="bold">AR</text></svg>`,
  );

const factNum = "text-xl font-bold leading-none text-violet-300";
const factLbl =
  "mt-1.5 text-[10px] font-medium tracking-[0.14em] uppercase text-stone-500";
const body = "text-sm leading-relaxed text-stone-300";

export function LabPremiumTemplate() {
  const d = demo;
  const facts: [string, string][] = [
    [`${d.yearsExperience}+`, "Years"],
    [`${d.projectsCount}`, "Projects"],
    [`${d.companiesCount}`, "Companies"],
  ];
  const socials: [string, string, ReactNode][] = [
    ["LinkedIn", d.links.linkedin, <LinkedInIcon key="li" />],
    ["GitHub", d.links.github, <GitHubIcon key="gh" />],
    ["Website", d.links.website, <GlobeIcon key="w" />],
  ];

  const cards: ReactNode[] = [
    <LabCard
      key="about"
      title="Professional Summary"
      icon={<UserRound className="size-4" />}
      delay={0.42}
      sub={<p className="line-clamp-3">{d.about.slice(0, 95).trimEnd()}…</p>}
      detail={<p className={body}>{d.about}</p>}
      moreLabel="Show more"
    />,
    <LabCard
      key="exp"
      title="Experience"
      icon={<Briefcase className="size-4" />}
      delay={0.48}
      sub={
        <>
          <p>Career highlights and key roles</p>
          <p className="text-xs text-stone-500">
            Latest: {d.experience[0].position} · {d.experience[0].company}
          </p>
        </>
      }
      detail={
        <div className="space-y-3">
          {d.experience.map((w) => (
            <div key={w.position}>
              <p className="text-sm font-semibold text-white">{w.position}</p>
              <p className="text-sm text-stone-400">
                {w.company} · {w.dates}
              </p>
              <p className={`mt-1 ${body}`}>{w.summary}</p>
              {w.highlights.length > 0 && (
                <ul className={`mt-1 list-disc space-y-0.5 pl-4 ${body}`}>
                  {w.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      }
      moreLabel="+2 roles"
    />,
    <LabCard
      key="proj"
      title="Projects"
      icon={<FolderKanban className="size-4" />}
      delay={0.54}
      sub={
        <>
          <p>Selected products and work</p>
          <p className="text-xs text-stone-500">{d.projects.length} projects</p>
        </>
      }
      detail={
        <div className="space-y-3">
          {d.projects.map((pr) => (
            <div key={pr.name}>
              <p className="text-sm font-semibold text-white">{pr.name}</p>
              <p className={body}>{pr.description}</p>
            </div>
          ))}
        </div>
      }
      moreLabel="+2 projects"
    />,
    <LabCard
      key="skills"
      title="Skills"
      icon={<Award className="size-4" />}
      delay={0.6}
      sub={<p className="truncate">{d.skills.slice(0, 6).join(" · ")}</p>}
      detail={
        <ul className="flex flex-wrap gap-1.5">
          {d.skills.map((s) => (
            <li
              key={s}
              className="rounded-md border border-stone-700 bg-stone-800/60 px-2 py-1 text-xs text-stone-200"
            >
              {s}
            </li>
          ))}
        </ul>
      }
      moreLabel="+6 skills"
    />,
    <LabCard
      key="edu"
      title="Education"
      icon={<GraduationCap className="size-4" />}
      delay={0.66}
      sub={
        <p>
          {d.education[0].degree} · {d.education[0].institution}
        </p>
      }
      detail={
        <div className="space-y-3">
          {d.education.map((e) => (
            <div key={e.institution}>
              <p className="text-sm font-semibold text-white">
                {e.degree} · {e.institution}
              </p>
              <p className="text-sm text-stone-400">{e.dates}</p>
            </div>
          ))}
        </div>
      }
      moreLabel="View all"
    />,
    <LabCard
      key="cert"
      title="Certifications"
      icon={<Award className="size-4" />}
      delay={0.72}
      sub={<p>Professional credentials · {d.certifications[0].name}</p>}
      detail={
        <div className="space-y-3">
          {d.certifications.map((c) => (
            <div key={c.name}>
              <p className="text-sm font-semibold text-white">{c.name}</p>
              <p className="text-sm text-stone-400">
                {c.issuer} · {c.date}
              </p>
            </div>
          ))}
        </div>
      }
      moreLabel="View all"
    />,
    <LabCard
      key="lang"
      title="Languages"
      icon={<Languages className="size-4" />}
      delay={0.78}
      sub={
        <p>
          {d.languages.map((l) => `${l.language} · ${l.fluency}`).join(" · ")}
        </p>
      }
    />,
  ];

  const resumeCard = (
    <div className="lab-fade" style={{ "--lab-delay": "0.84s" } as never}>
      <a
        href="#"
        className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-b from-stone-900/90 to-stone-950/95 p-4 shadow-lg shadow-black/30 transition-shadow hover:shadow-xl"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
        />
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-200 shadow-sm"
        >
          <FileText className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold text-white">Résumé</span>
          <span className="block text-sm text-stone-400">
            View my professional résumé
          </span>
        </span>
        <span aria-hidden className="text-lg text-stone-500">
          ›
        </span>
      </a>
    </div>
  );

  const grid = (a: ReactNode, b: ReactNode) => (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
      {a}
      {b}
    </div>
  );

  return (
    <main className="lab-root min-h-dvh bg-stone-950 text-stone-200">
      <style>{`
        .lab-root{background:radial-gradient(ellipse 90% 40% at 50% 0%,rgba(167,139,250,.14),transparent),radial-gradient(ellipse 75% 30% at 50% 62%,rgba(167,139,250,.05),transparent),radial-gradient(ellipse 60% 25% at 50% 110%,rgba(167,139,250,.07),transparent),#0c0a09}
        @keyframes labFade{from{opacity:0;transform:translateY(8px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
        .lab-fade{opacity:0;animation:labFade .55s cubic-bezier(.2,.6,.3,1) var(--lab-delay,0s) both}
        @keyframes labBeam{to{offset-distance:100%}}
        .lab-beam{position:absolute;inset:0;border-radius:inherit;pointer-events:none;overflow:hidden}
        .lab-beam::before{content:"";position:absolute;width:var(--lab-beam-size,90px);aspect-ratio:1;offset-path:rect(0 100% 100% 0 round 12px);offset-rotate:0deg;background:radial-gradient(circle at 50% 50%,var(--lab-beam-to),transparent 70%);animation:labBeam var(--lab-beam-duration,12s) linear infinite}
        .lab-magic{position:relative;height:100%}
        .lab-magic::after{content:"";position:absolute;inset:0;border-radius:inherit;opacity:0;transition:opacity .4s;pointer-events:none;background:radial-gradient(180px circle at var(--lab-mx,-100px) var(--lab-my,-100px),rgba(167,139,250,.10),transparent 70%)}
        @media (hover:hover) and (pointer:fine){.lab-magic:hover::after{opacity:1}}
        @media (prefers-reduced-motion: reduce){.lab-fade{opacity:1;animation:none}.lab-beam{display:none}.lab-magic::after{display:none}}
      `}</style>

      {/* compact header */}
      <header className="mx-auto flex w-full max-w-[980px] items-center justify-between px-4 py-4 sm:px-6">
        <span className="flex items-center">
          <LinkMeuLogo className="h-6" />
        </span>
        <span className="hidden text-xs text-stone-500 sm:inline">
          Built for meaningful careers
        </span>
      </header>

      <div className="mx-auto w-full max-w-[980px] space-y-3 px-4 pb-4 sm:px-6">
        {/* hero */}
        <section
          aria-label="Profile"
          className="relative rounded-2xl border border-stone-800/60 bg-stone-950/60 shadow-2xl"
        >
          {/* cover */}
          <div className="relative z-0 h-40 w-full overflow-hidden sm:h-56 lg:h-64">
            <img
              src={CINEMATIC_COVER}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent"
            />
          </div>

          <div className="flex flex-col items-center px-4 pb-5 sm:px-6">
            {/* portrait — z-30 above panel */}
            <BlurFade delay={0.05} className="relative z-30 -mt-14 sm:-mt-16">
              <img
                src={PORTRAIT}
                alt={`${d.name} profile photo`}
                className="size-28 rounded-full object-cover ring-4 ring-violet-400/40 ring-offset-4 ring-offset-stone-950 shadow-[0_0_32px_-8px_rgba(167,139,250,0.35)] sm:size-32 lg:size-36"
              />
            </BlurFade>

            {/* identity panel — z-20 */}
            <BlurFade
              delay={0.15}
              className="relative z-20 -mt-8 w-full max-w-2xl sm:-mt-10"
            >
              <div className="relative overflow-hidden rounded-2xl border border-stone-700/80 bg-stone-950/80 px-4 pt-11 pb-5 text-center shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md sm:px-8 sm:pt-14">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
                />
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {d.name}
                </h1>
                <p className="mt-1 text-base font-medium text-violet-300/90">
                  {d.headline}
                </p>
                <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
                  <span className="text-stone-400">{d.location}</span>
                  {d.openToOpportunities && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                      <span
                        aria-hidden
                        className="size-1.5 rounded-full bg-emerald-500"
                      />
                      Open to opportunities
                    </span>
                  )}
                </p>
                <dl className="mt-4 flex justify-center divide-x divide-stone-800 border-t border-stone-800 pt-4">
                  {facts.map(([v, l]) => (
                    <div key={l} className="px-6 text-center">
                      <dd className={factNum}>{v}</dd>
                      <dt className={factLbl}>{l}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </BlurFade>

            {/* actions */}
            <BlurFade
              delay={0.28}
              className="mt-3 flex w-full max-w-2xl flex-wrap items-stretch justify-center gap-2 sm:items-center"
            >
              <span className="relative w-full sm:w-auto">
                {/* single Border Beam on the primary CTA */}
                <span className="relative inline-flex w-full overflow-hidden rounded-lg border border-violet-500/50 bg-violet-600 sm:w-auto">
                  <a
                    href="#"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-6 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(139,92,246,0.45)] sm:w-auto"
                  >
                    <FileText className="size-4" aria-hidden />
                    View Resume
                  </a>
                  <BorderBeam size={70} duration={10} />
                </span>
              </span>
              {socials.map(([label, href, icon]) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`${label} profile`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/20"
                >
                  {icon}
                  {label}
                </a>
              ))}
            </BlurFade>
          </div>
        </section>

        {/* career cards */}
        {grid(cards[0], cards[1])}
        {grid(cards[2], cards[3])}
        {grid(cards[4], cards[5])}
        {grid(cards[6], resumeCard)}
      </div>

      <footer className="mx-auto flex w-full max-w-[980px] flex-wrap items-center justify-between gap-2 px-4 pt-2 pb-8 sm:px-6">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500">
          <LinkMeuLogo className="h-4" />
        </span>
        <span className="text-xs text-stone-500">
          Built for meaningful careers
        </span>
      </footer>
    </main>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
