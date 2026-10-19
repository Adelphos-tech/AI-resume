import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import {
  ArrowUpRight,
  AtSign,
  FileText,
  FolderGit2,
  Globe,
  MapPin,
} from "lucide-react";
import type { ResolvedCareerMode } from "@/components/career-card/dev/career-mode-recipes";
import { CinematicHero } from "@/components/career-card/compositions/cinematic-hero";
import { CareerAvatar } from "@/components/career-card/primitives/career-avatar";
import { ActionPill } from "@/components/career-card/primitives/action-pill";
import { GlassSurface } from "@/components/career-card/primitives/glass-surface";
import { StatItem } from "@/components/career-card/primitives/stat-item";
import { StatRail } from "@/components/career-card/primitives/stat-rail";
import {
  CINEMATIC_ACCENT_VARS,
  type CinematicAccent,
} from "@/components/career-card/primitives/cinematic-accent";
import {
  ExperienceBullets,
  formatRange,
} from "@/components/career-card/modules/experience-content";
import { skillLine } from "@/components/career-card/modules/skills-content";
import {
  degreeLine,
  formatEducationRange,
} from "@/components/career-card/modules/education-content";
import { credentialMeta } from "@/components/career-card/modules/certifications-content";
import { languageLine } from "@/components/career-card/modules/languages-content";

const LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--cc-label)]";
const H2 = "mt-1 text-xl font-bold text-white";

function ModeLabel({ text, sub }: { text: string; sub?: string }) {
  return (
    <>
      <p className={LABEL}>{text}</p>
      <h2 className={H2}>{sub}</h2>
    </>
  );
}

/** Compact dev hero for Networking — no cover, tight identity row. */
function ModeCompactHero({ v }: { v: ResolvedCareerMode }) {
  const p = v.profile;
  return (
    <section aria-label="Profile" className="mx-auto max-w-5xl px-3">
      <GlassSurface className="flex items-center gap-4 p-5">
        <CareerAvatar
          src={p.portrait}
          initials={p.initials}
          name={p.name}
          size="lg"
          className="shrink-0"
          ringClassName="ring-4 ring-[color:var(--cc-ring)]"
          haloClassName="bg-[var(--cc-halo)]"
          fallbackClassName="bg-[var(--cc-btn2)] text-white"
        />
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-white">
            {p.name}
          </h1>
          {p.headline && (
            <p className="mt-0.5 text-sm font-medium text-[color:var(--cc-text)]/90">
              {p.headline}
            </p>
          )}
          {p.location && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
              <MapPin className="size-3.5" aria-hidden />
              {p.location}
            </p>
          )}
        </div>
      </GlassSurface>
    </section>
  );
}

function ModeActionBar({ v }: { v: ResolvedCareerMode }) {
  // Hero already surfaces a primary Resume CTA when heroResume is set.
  if (!v.primaryAction || (v.primaryAction.id === "resume" && v.heroResumeHref))
    return null;
  const icons = {
    resume: FileText,
    linkedin: AtSign,
    github: FolderGit2,
    website: Globe,
  } as const;
  const Icon = icons[v.primaryAction.id];
  return (
    <div className="mx-auto mt-5 max-w-5xl px-3">
      <ActionPill
        href={v.primaryAction.href}
        icon={<Icon className="size-4" />}
        label={v.primaryAction.label}
        variant="primary"
        className="w-full rounded-lg bg-gradient-to-b from-[var(--cc-btn1)] to-[var(--cc-btn2)] text-white shadow-[0_8px_24px_-6px_var(--cc-btn-glow)] sm:w-auto"
      />
    </div>
  );
}

/** Career Snapshot — recruiter assessment strip from existing facts only. */
function Snapshot({ v }: { v: ResolvedCareerMode }) {
  const p = v.profile;
  const facts = [
    { v: p.yearsExperience ? `${p.yearsExperience}+` : null, l: "YEARS" },
    { v: v.currentRole?.company ?? null, l: "CURRENT" },
    { v: p.projectsCount || null, l: "PROJECTS" },
    { v: v.skills.length || null, l: "CORE SKILLS" },
    { v: p.certificationsCount || null, l: "CERTS" },
  ].filter((f) => f.v != null);
  return (
    <section>
      <p className={LABEL}>Career Snapshot</p>
      <div className="mt-3 rounded-xl border border-[color:var(--cc-edge)] bg-stone-900/60 px-5 py-4">
        <StatRail divided dividerClassName="divide-white/10">
          {facts.map((f) => (
            <StatItem
              key={f.l}
              value={f.v!}
              label={f.l}
              valueClassName="text-sm font-bold text-[color:var(--cc-text)]"
              labelClassName="text-[10px] font-medium uppercase tracking-wider text-stone-400"
              className="min-w-16"
            />
          ))}
        </StatRail>
      </div>
    </section>
  );
}

function TargetContext({ v }: { v: ResolvedCareerMode }) {
  if (!v.target) return null;
  return (
    <section className="rounded-xl border border-[color:var(--cc-edge-hi)] bg-[var(--cc-tint)] px-5 py-4">
      <p className={LABEL}>Applying for</p>
      <p className="mt-1.5 text-base font-bold text-white">{v.target.role}</p>
      <p className="mt-0.5 text-xs text-stone-400">
        {v.target.location} · Résumé: {v.target.resumeTitle}
      </p>
    </section>
  );
}

function ModeExperience({
  v,
  single,
}: {
  v: ResolvedCareerMode;
  single?: boolean;
}) {
  const rows = single ? v.experience.slice(0, 1) : v.experience;
  if (!rows.length) return null;
  return (
    <section>
      <ModeLabel
        text={
          v.target
            ? "Relevant Experience"
            : single
              ? "Current Role"
              : "Career Path"
        }
        sub={single ? undefined : "Experience"}
      />
      <div className="relative mt-6 ml-2 space-y-8 border-l-2 border-[color:var(--cc-edge)] pl-6">
        {rows.map((r, i) => (
          <div key={i} className="relative">
            <span
              aria-hidden
              className={`absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-[#0c0a09] ${
                r.current ? "bg-[var(--cc-accent)]" : "bg-stone-600"
              }`}
            />
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="font-semibold text-white">{r.position}</h3>
              <span className="text-xs text-stone-400">
                {r.company}
                {r.location ? ` · ${r.location}` : ""}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-[color:var(--cc-text)]">
              {formatRange(r)}
              {r.current && (
                <span className="ml-2 rounded-full border border-[color:var(--cc-edge)] bg-[var(--cc-tint)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                  Current
                </span>
              )}
            </p>
            {r.summary && (
              <p className="mt-2 text-sm leading-relaxed text-stone-300">
                {r.summary}
              </p>
            )}
            {r.highlights && (
              <ExperienceBullets
                items={r.highlights}
                className="mt-2 space-y-1 text-sm text-stone-400"
                markerClassName="bg-[var(--cc-accent)]"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ModeProjects({
  v,
  featured,
}: {
  v: ResolvedCareerMode;
  featured?: boolean;
}) {
  if (!v.projects.length) return null;
  const [first, ...rest] = v.projects;
  return (
    <section>
      <ModeLabel
        text={
          v.target
            ? "Relevant Projects"
            : featured
              ? "Selected Work"
              : "Projects"
        }
        sub="Projects"
      />
      {first && (
        <a
          href={first.url ?? "#"}
          className="group relative mt-5 block overflow-hidden rounded-xl border border-[color:var(--cc-edge)] bg-gradient-to-br from-[var(--cc-feature)] to-stone-900/60 p-5 transition hover:border-[color:var(--cc-edge-hi)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{first.name}</h3>
              {first.role && (
                <p className="mt-0.5 text-xs font-medium text-[color:var(--cc-text)]">
                  {first.role}
                </p>
              )}
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-300">
                {first.description}
              </p>
            </div>
            <ArrowUpRight
              aria-hidden
              className="size-5 shrink-0 text-[color:var(--cc-accent)]"
            />
          </div>
        </a>
      )}
      {rest.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <a
              key={p.name}
              href={p.url ?? "#"}
              className="group rounded-xl border border-stone-800 bg-stone-900/60 p-4 transition hover:border-stone-600"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                {p.url && (
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 shrink-0 text-stone-500"
                  />
                )}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                {p.description}
              </p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function ModeSkills({ v }: { v: ResolvedCareerMode }) {
  if (!v.skills.length) return null;
  return (
    <section>
      <p className={LABEL}>{v.target ? "Relevant Skills" : "Expertise"}</p>
      <div className="mt-3 border-t border-[color:var(--cc-edge)] pt-4">
        <p className="text-[15px] font-medium leading-relaxed text-stone-200">
          {skillLine(v.skills, "  ·  ")}
        </p>
      </div>
    </section>
  );
}

function ModeEducation({ v }: { v: ResolvedCareerMode }) {
  if (!v.education.length) return null;
  return (
    <div>
      <p className={LABEL}>Education</p>
      <div className="mt-4 space-y-4">
        {v.education.map((e, i) => (
          <div key={i} className="border-l-2 border-stone-800 pl-4">
            <h3 className="text-sm font-semibold text-white">
              {degreeLine(e)}
            </h3>
            <p className="mt-0.5 text-xs text-stone-400">
              {e.institution}
              {e.location ? ` · ${e.location}` : ""}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-stone-500">
              {formatEducationRange(e)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeCredentials({ v }: { v: ResolvedCareerMode }) {
  if (!v.certifications.length) return null;
  return (
    <div>
      <p className={LABEL}>Credentials</p>
      <div className="mt-4 space-y-4">
        {v.certifications.map((c) => (
          <div
            key={c.name}
            className="border-l-2 border-[color:var(--cc-edge-hi)] pl-4"
          >
            <h3 className="text-sm font-semibold text-white">{c.name}</h3>
            <p className="mt-0.5 text-xs text-stone-400">{credentialMeta(c)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const LINK_ICONS = {
  linkedin: AtSign,
  github: FolderGit2,
  website: Globe,
} as const;

function ModeConnect({ v }: { v: ResolvedCareerMode }) {
  // Secondary actions already exclude the primary destination.
  if (!v.secondaryActions.length) return null;
  return (
    <section>
      <p className={LABEL}>Connect</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {v.secondaryActions.map((l) => {
          const Icon = LINK_ICONS[l.id as keyof typeof LINK_ICONS] ?? Globe;
          return (
            <ActionPill
              key={l.id}
              href={l.href}
              icon={<Icon className="size-4" />}
              label={
                l.id === "linkedin"
                  ? "LinkedIn"
                  : l.id === "github"
                    ? "GitHub"
                    : "Website"
              }
              className="rounded-full border border-[color:var(--cc-edge)] bg-[var(--cc-tint)] text-[color:var(--cc-pill,var(--cc-text))]"
            />
          );
        })}
      </div>
    </section>
  );
}

function ModeResume({ v }: { v: ResolvedCareerMode }) {
  if (!v.resume?.hasResume) return null;
  return (
    <section>
      <a
        href={v.resume.href ?? "#resume"}
        className="group flex items-center justify-between gap-4 border-t-2 border-[color:var(--cc-edge-hi)] pt-5"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[color:var(--cc-edge)] bg-[var(--cc-tint)] text-[color:var(--cc-text)]">
            <FileText className="size-4" aria-hidden />
          </span>
          <div>
            <p className={LABEL}>{v.target ? "Target Résumé" : "Résumé"}</p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {v.target
                ? v.target.resumeTitle
                : (v.resume.title ?? "View my professional résumé")}
            </p>
          </div>
        </div>
        <ArrowUpRight
          aria-hidden
          className="size-5 shrink-0 text-[color:var(--cc-accent)]"
        />
      </a>
    </section>
  );
}

/**
 * Dev-only Career Mode renderer — Cinematic/Executive family.
 * Same visual system; the mode recipe controls emphasis/order/density.
 */
export function ModeCinematicCard({
  v,
  accent = "violet",
}: {
  v: ResolvedCareerMode;
  accent?: CinematicAccent;
}) {
  const p = v.profile;
  const pairing =
    v.sections.includes("education") && v.sections.includes("credentials");
  const blocks: Record<string, React.ReactNode> = {
    targetContext: <TargetContext v={v} />,
    snapshot: <Snapshot v={v} />,
    intro: p.bio ? (
      <section>
        <p className={LABEL}>About</p>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">{p.bio}</p>
      </section>
    ) : null,
    currentRole: <ModeExperience v={v} single />,
    experience: <ModeExperience v={v} />,
    projects: <ModeProjects v={v} featured={v.recipe.id === "client"} />,
    skills: <ModeSkills v={v} />,
    education: pairing ? (
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ModeEducation v={v} />
        <ModeCredentials v={v} />
      </section>
    ) : (
      <ModeEducation v={v} />
    ),
    credentials: pairing ? null : <ModeCredentials v={v} />,
    languages: v.languages.length ? (
      <section>
        <p className={LABEL}>Languages</p>
        <p className="mt-3 text-sm text-stone-300">
          {v.languages.map(languageLine).join("  ·  ")}
        </p>
      </section>
    ) : null,
    resume: <ModeResume v={v} />,
    connect: <ModeConnect v={v} />,
  };
  const ordered = v.sections
    .filter((s) => !(pairing && s === "credentials")) // pairing rendered inline with education
    .map((s) => <div key={s}>{blocks[s]}</div>);
  return (
    <main
      className="min-h-dvh bg-[#0c0a09] bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(167,139,250,.20),transparent)]"
      style={CINEMATIC_ACCENT_VARS[accent]}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 pt-4">
        <LinkMeuLogo className="h-5" />
        <span className="ml-auto rounded-full border border-[color:var(--cc-edge)] bg-[var(--cc-tint)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--cc-text)]">
          {v.recipe.contextLabel}
        </span>
      </div>
      <div className="mt-4">
        {v.recipe.compactHero ? (
          <ModeCompactHero v={v} />
        ) : (
          <CinematicHero
            d={{
              ...p,
              openToOpportunities: v.recipe.showOpportunityStatus
                ? p.openToOpportunities
                : false,
              hasResume: Boolean(v.heroResumeHref),
              resumeHref: v.heroResumeHref,
              links: v.sections.includes("connect")
                ? // Links live in the dedicated Connect section — no dup.
                  undefined
                : {
                    linkedin:
                      v.secondaryActions.find((a) => a.id === "linkedin")
                        ?.href ?? null,
                    github:
                      v.secondaryActions.find((a) => a.id === "github")?.href ??
                      null,
                    website:
                      v.secondaryActions.find((a) => a.id === "website")
                        ?.href ?? null,
                  },
            }}
            cover={p.cover ? { src: p.cover } : undefined}
            accent={accent}
          />
        )}
        <ModeActionBar v={v} />
        <div className="mx-auto mt-8 max-w-5xl space-y-12 px-3 pb-10">
          {ordered}
        </div>
      </div>
      <footer className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 pb-8 pt-6">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500">
          Powered by <LinkMeuLogo className="h-4" />
        </span>
        <span className="text-xs text-stone-600">
          Made to be scanned. Built to be remembered.
        </span>
      </footer>
    </main>
  );
}
