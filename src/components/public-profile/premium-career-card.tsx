import {
  AtSign,
  Award,
  Briefcase,
  FileText,
  FolderGit2,
  FolderKanban,
  Globe,
  GraduationCap,
  Languages,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type {
  CardStyleTokens,
  CardThemeTokens,
} from "@/lib/career-card-theme-styles";
import {
  CareerCardCoverPhoto,
  CareerCardProfilePhoto,
} from "@/components/candidate/public-profile/career-card-photo";
import { CompactCard } from "@/components/public-profile/compact-card";
import {
  formatCareerDate,
  type PublicCareerProfileDTO,
} from "@/server/public-profile/public-profile";

function dateRange(
  start: string | null,
  end: string | null,
  isCurrent?: boolean,
): string | null {
  const s = formatCareerDate(start);
  const e = isCurrent ? "Present" : formatCareerDate(end);
  if (!s && !e) return null;
  return `${s ?? ""} – ${e ?? ""}`.replace(/^\s+–\s+|\s+–\s+$/g, "");
}

/**
 * Years Experience: merge actual valid [start, end] intervals so career
 * gaps are excluded and overlapping roles aren't double-counted. Uses
 * completed years only; <1 year → no fact.
 */
function completedYearsOfExperience(
  experience: PublicCareerProfileDTO["experience"],
): number {
  const toMonth = (d: string | null): number | null => {
    if (!d || !/^\d{4}/.test(d)) return null;
    const y = parseInt(d.slice(0, 4), 10);
    const m = /^\d{4}-\d{2}/.test(d) ? parseInt(d.slice(5, 7), 10) : 1;
    return m < 1 || m > 12 ? null : y * 12 + (m - 1);
  };
  const now = new Date();
  const nowM = now.getFullYear() * 12 + now.getMonth();
  const ivals: [number, number][] = [];
  for (const w of experience) {
    const s = toMonth(w.startDate);
    if (s === null) continue;
    let e = toMonth(w.endDate);
    if (e === null && w.isCurrent) e = nowM;
    if (e === null) continue;
    if (e > nowM) e = nowM;
    if (e < s) continue;
    ivals.push([s, e]);
  }
  ivals.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let curS: number | null = null;
  let curE = 0;
  for (const [s, e] of ivals) {
    if (curS === null) {
      curS = s;
      curE = e;
    } else if (s <= curE + 1) {
      curE = Math.max(curE, e);
    } else {
      total += curE - curS + 1;
      curS = s;
      curE = e;
    }
  }
  if (curS !== null) total += curE - curS + 1;
  return Math.floor(total / 12);
}

const ABOUT_PREVIEW = 220;
const SKILL_PREVIEW = 8;

export function PremiumCareerCard({
  dto,
  slug,
  t,
  p,
}: {
  dto: PublicCareerProfileDTO;
  slug: string;
  t: CardThemeTokens;
  p: CardStyleTokens;
}) {
  const socialLinks = [
    { href: dto.links.linkedin, label: "LinkedIn", icon: AtSign },
    { href: dto.links.github, label: "GitHub", icon: FolderGit2 },
    { href: dto.links.website, label: "Website", icon: Globe },
  ].filter((l) => l.href !== null);

  // Deterministic facts only — each renders solely when its value is > 0.
  const facts: { v: string; l: string }[] = [];
  const years = completedYearsOfExperience(dto.experience);
  if (years >= 1) facts.push({ v: `${years}+`, l: "Years" });
  if (dto.projects.length > 0)
    facts.push({ v: `${dto.projects.length}`, l: "Projects" });
  const companies = new Set(
    dto.experience.map((w) => w.company).filter(Boolean),
  ).size;
  if (companies > 0) facts.push({ v: `${companies}`, l: "Companies" });
  if (facts.length < 3 && dto.certifications.length > 0)
    facts.push({ v: `${dto.certifications.length}`, l: "Certifications" });

  const allSkills = dto.skills.flatMap((g) => g.keywords);
  const skillPreview = allSkills.slice(0, SKILL_PREVIEW);
  const skillRest = allSkills.length - skillPreview.length;

  const bioLong = (dto.bio?.length ?? 0) > ABOUT_PREVIEW;
  const [firstRole, ...restRoles] = dto.experience;
  const [firstProject, ...restProjects] = dto.projects;
  const [firstEdu, ...restEdu] = dto.education;
  const [firstCert, ...restCerts] = dto.certifications;

  const cardProps = {
    cardClassName: p.card,
    titleClassName: p.cardTitle,
    iconClassName: p.cardIcon,
    toggleClassName: p.toggle,
  };
  const body = `text-sm leading-relaxed ${t.body}`;
  const meta = `text-xs ${t.faint}`;

  const roleBlock = (w: PublicCareerProfileDTO["experience"][number]) => (
    <div>
      <p className={`text-sm font-semibold ${t.strong}`}>{w.position}</p>
      <p className={`text-sm ${t.subtle}`}>
        {[w.company, dateRange(w.startDate, w.endDate, w.isCurrent)]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {w.summary && <p className={`mt-1 ${body}`}>{w.summary}</p>}
      {w.highlights.length > 0 && (
        <ul className={`mt-1 list-disc space-y-0.5 pl-4 ${body}`}>
          {w.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  );

  const projectBlock = (pr: PublicCareerProfileDTO["projects"][number]) => (
    <div>
      <p className={`text-sm font-semibold ${t.strong}`}>
        {pr.url ? (
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${t.link} underline-offset-2 hover:underline`}
          >
            {pr.name}
          </a>
        ) : (
          pr.name
        )}
      </p>
      {pr.description && <p className={body}>{pr.description}</p>}
    </div>
  );

  const eduBlock = (e: PublicCareerProfileDTO["education"][number]) => (
    <div>
      <p className={`text-sm font-semibold ${t.strong}`}>
        {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") || e.institution}
      </p>
      <p className={`text-sm ${t.subtle}`}>
        {[
          e.degree || e.fieldOfStudy ? e.institution : null,
          dateRange(e.startDate, e.endDate),
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </div>
  );

  const certBlock = (c: PublicCareerProfileDTO["certifications"][number]) => (
    <div>
      <p className={`text-sm font-semibold ${t.strong}`}>{c.name}</p>
      <p className={`text-sm ${t.subtle}`}>
        {[c.issuer, formatCareerDate(c.date)].filter(Boolean).join(" · ")}
      </p>
    </div>
  );

  const stack = (items: ReactNode[]) => (
    <div className="space-y-3">{items}</div>
  );

  // Cards render only when real content exists; pairs collapse to one
  // column when a partner is absent.
  const aboutCard = dto.bio ? (
    <CompactCard
      id="pp-about"
      title="About"
      icon={<UserRound className="size-4" />}
      {...cardProps}
      summary={
        <p className={body}>
          {bioLong ? `${dto.bio.slice(0, ABOUT_PREVIEW).trimEnd()}…` : dto.bio}
        </p>
      }
      detail={bioLong ? <p className={body}>{dto.bio}</p> : undefined}
      moreLabel="Show more"
    />
  ) : null;

  const expCard = firstRole ? (
    <CompactCard
      id="pp-exp"
      title="Experience"
      icon={<Briefcase className="size-4" />}
      {...cardProps}
      summary={roleBlock(firstRole)}
      detail={
        restRoles.length > 0
          ? stack(restRoles.map((w, i) => <div key={i}>{roleBlock(w)}</div>))
          : undefined
      }
      moreLabel={`+${restRoles.length} more role${restRoles.length === 1 ? "" : "s"}`}
    />
  ) : null;

  const projCard = firstProject ? (
    <CompactCard
      id="pp-proj"
      title="Projects"
      icon={<FolderKanban className="size-4" />}
      {...cardProps}
      summary={projectBlock(firstProject)}
      detail={
        restProjects.length > 0
          ? stack(
              restProjects.map((pr, i) => (
                <div key={i}>{projectBlock(pr)}</div>
              )),
            )
          : undefined
      }
      moreLabel={`+${restProjects.length} more project${restProjects.length === 1 ? "" : "s"}`}
    />
  ) : null;

  const skillsCard =
    allSkills.length > 0 ? (
      <CompactCard
        id="pp-skills"
        title="Skills"
        icon={<Award className="size-4" />}
        {...cardProps}
        summary={
          <ul className="flex flex-wrap gap-1.5">
            {skillPreview.map((k) => (
              <li key={k} className={p.chip}>
                {k}
              </li>
            ))}
          </ul>
        }
        detail={
          skillRest > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {allSkills.slice(SKILL_PREVIEW).map((k) => (
                <li key={k} className={p.chip}>
                  {k}
                </li>
              ))}
            </ul>
          ) : undefined
        }
        moreLabel={`+${skillRest} more`}
      />
    ) : null;

  const eduCard = firstEdu ? (
    <CompactCard
      id="pp-edu"
      title="Education"
      icon={<GraduationCap className="size-4" />}
      {...cardProps}
      summary={eduBlock(firstEdu)}
      detail={
        restEdu.length > 0
          ? stack(restEdu.map((e, i) => <div key={i}>{eduBlock(e)}</div>))
          : undefined
      }
      moreLabel={`+${restEdu.length} more`}
    />
  ) : null;

  const certCard = firstCert ? (
    <CompactCard
      id="pp-cert"
      title="Certifications"
      icon={<Award className="size-4" />}
      {...cardProps}
      summary={certBlock(firstCert)}
      detail={
        restCerts.length > 0
          ? stack(restCerts.map((c, i) => <div key={i}>{certBlock(c)}</div>))
          : undefined
      }
      moreLabel={`+${restCerts.length} more`}
    />
  ) : null;

  const langCard =
    dto.languages.length > 0 ? (
      <CompactCard
        id="pp-lang"
        title="Languages"
        icon={<Languages className="size-4" />}
        {...cardProps}
        summary={
          <ul className="flex flex-wrap gap-1.5">
            {dto.languages.map((l) => (
              <li key={l.language} className={p.chip}>
                {l.language}
                {l.fluency ? ` · ${l.fluency}` : ""}
              </li>
            ))}
          </ul>
        }
      />
    ) : null;

  const resumeCard = dto.featuredResume ? (
    <Link
      href={`/u/${slug}/resume`}
      className={`${p.card} flex items-center gap-3 transition-shadow hover:shadow-md`}
    >
      <span aria-hidden className={p.cardIcon}>
        <FileText className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block ${p.cardTitle}`}>Resume</span>
        <span className={`block ${meta}`}>
          {dto.featuredResume.name} · {dto.featuredResume.targetRole}
        </span>
      </span>
      <span aria-hidden className={`text-lg ${t.faint}`}>
        ›
      </span>
    </Link>
  ) : null;

  const pair = (a: ReactNode, b: ReactNode) => {
    if (!a && !b) return null;
    if (!a || !b) return a ?? b;
    return (
      <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
        {a}
        {b}
      </div>
    );
  };

  return (
    <main className={`min-h-dvh ${p.page}`}>
      <header
        className={`mx-auto flex w-full ${p.contentMax} items-center justify-between px-4 py-4 sm:px-6`}
      >
        <Link
          href="/"
          className={`flex items-center gap-2 text-lg font-bold tracking-tight ${t.strong}`}
        >
          <span
            aria-hidden
            className={`grid size-8 place-items-center rounded-lg text-sm font-black ${t.footerBrand}`}
          >
            R
          </span>
          RoleRace
        </Link>
        <span className={`hidden text-xs sm:inline ${t.faint}`}>
          Built for meaningful careers
        </span>
      </header>

      <div
        className={`mx-auto w-full ${p.contentMax} space-y-3 px-4 pb-4 sm:px-6`}
      >
        {/* identity hero */}
        <section aria-label="Profile" className={p.heroCard}>
          {dto.coverPhotoUrl ? (
            <div className={p.coverWrap}>
              <CareerCardCoverPhoto
                src={dto.coverPhotoUrl}
                alt=""
                position={dto.coverPhotoPosition}
                frameClassName="absolute inset-0 size-full"
              />
              {t.coverOverlay && (
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 ${t.coverOverlay}`}
                />
              )}
            </div>
          ) : (
            <div aria-hidden className={p.heroBand} />
          )}
          <div className="flex flex-col items-center px-4 pb-5 sm:px-6">
            <div className={`relative z-30 ${p.avatarPull}`}>
              {dto.profilePhotoUrl ? (
                <CareerCardProfilePhoto
                  src={dto.profilePhotoUrl}
                  alt={`${dto.name} profile photo`}
                  position={dto.profilePhotoPosition}
                  frameClassName={p.avatarImg}
                />
              ) : (
                <div aria-hidden className={`relative ${p.avatar}`}>
                  {dto.initials}
                </div>
              )}
            </div>
            <div className={p.identityPanel}>
              <h1
                className={`text-2xl font-bold tracking-tight sm:text-3xl ${t.strong}`}
              >
                {dto.name}
              </h1>
              {dto.headline && (
                <p className={`mt-1 text-base font-medium ${t.headline}`}>
                  {dto.headline}
                </p>
              )}
              {(dto.location || dto.openToOpportunities) && (
                <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
                  {dto.location && (
                    <span className={t.subtle}>{dto.location}</span>
                  )}
                  {dto.openToOpportunities && (
                    <span className={t.openBadge}>
                      <span
                        aria-hidden
                        className="size-1.5 rounded-full bg-emerald-500"
                      />
                      Open to opportunities
                    </span>
                  )}
                </p>
              )}
              {facts.length > 0 && (
                <dl className={p.factsRow}>
                  {facts.map((f) => (
                    <div key={f.l} className="text-center">
                      <dd className={p.factValue}>{f.v}</dd>
                      <dt className={p.factLabel}>{f.l}</dt>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            {(dto.featuredResume || socialLinks.length > 0) && (
              <div className="mt-3 flex w-full max-w-2xl flex-wrap items-stretch justify-center gap-2 sm:items-center">
                {dto.featuredResume && (
                  <Link
                    href={`/u/${slug}/resume`}
                    className={`inline-flex min-h-11 items-center gap-2 ${p.primaryCta} ${t.button}`}
                  >
                    <FileText className="size-4" aria-hidden />
                    View Resume
                  </Link>
                )}
                {socialLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${l.label} profile`}
                    className={`${p.actionPill} ${p.actionPillHover}`}
                  >
                    <l.icon className="size-4" aria-hidden />
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* compact career cards */}
        {pair(aboutCard, expCard)}
        {pair(projCard, skillsCard)}
        {pair(eduCard, certCard)}
        {pair(langCard, resumeCard)}

        {socialLinks.length > 0 && (
          <section aria-labelledby="pp-connect" className={p.card}>
            <h2 id="pp-connect" className={p.cardTitle}>
              Connect professionally
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {socialLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${l.label} profile`}
                  className={`${p.actionPill} ${p.actionPillHover}`}
                >
                  <l.icon className="size-4" aria-hidden />
                  {l.label}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer
        className={`mx-auto flex w-full ${p.contentMax} flex-wrap items-center justify-between gap-2 px-4 pt-2 pb-8 sm:px-6`}
      >
        <span
          className={`inline-flex items-center gap-2 text-xs font-semibold ${t.footer}`}
        >
          <span
            aria-hidden
            className={`grid size-5 place-items-center rounded text-[10px] font-black ${t.footerBrand}`}
          >
            R
          </span>
          RoleRace · Built for meaningful careers
        </span>
        <span className={`text-xs ${t.footer}`}>Built with RoleRace</span>
      </footer>
    </main>
  );
}
