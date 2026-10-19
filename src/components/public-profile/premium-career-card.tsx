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
import { ExecutiveLibraryCard } from "@/components/career-card/production/executive-library-card";
import { CorporateLibraryCard } from "@/components/career-card/production/corporate-library-card";
import { NfcCompactLibraryCard } from "@/components/career-card/production/nfc-compact-library-card";
import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import {
  BlurFade,
  BorderBeam,
} from "@/components/public-profile/premium-effects";
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
export function completedYearsOfExperience(
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

const ABOUT_PREVIEW = 95;

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
  if (dto.themeId === "executive-dark") {
    return <ExecutiveLibraryCard dto={dto} slug={slug} t={t} p={p} />;
  }
  if (dto.themeId === "corporate-clean") {
    return <CorporateLibraryCard dto={dto} slug={slug} t={t} p={p} />;
  }
  // NFC Compact renders its own frozen compact composition with real
  // Candidate + optional Company data — the shared premium tokens are
  // not consumed by that composition.
  if (dto.themeId === "nfc-compact") {
    return <NfcCompactLibraryCard dto={dto} slug={slug} />;
  }
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
  const bioLong = (dto.bio?.length ?? 0) > ABOUT_PREVIEW;

  const cnt = (n: number, noun: string) =>
    n > 1 ? `+${n - 1} ${noun}` : "View details";
  const expMore = cnt(dto.experience.length, "roles");
  const projMore = cnt(dto.projects.length, "projects");
  const skillsMore =
    allSkills.length > 6 ? `+${allSkills.length - 6} skills` : "All skills";
  const eduMore = cnt(dto.education.length, "entries");
  const certMore = cnt(dto.certifications.length, "credentials");

  const cardProps = {
    cardClassName: p.card,
    titleClassName: p.cardTitle,
    iconClassName: p.cardIcon,
    toggleClassName: p.toggle,
    subClassName: p.cardSub,
    detailClassName: p.detailBorder,
    edgeClassName: p.cardGlow || undefined,
    spotColor: p.spot,
  };
  const body = `text-sm leading-relaxed ${t.body}`;
  const hint = `text-xs ${t.subtle}`;

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

  const aboutCard = dto.bio ? (
    <CompactCard
      id="pp-about"
      title="Professional Summary"
      icon={<UserRound className="size-4" />}
      {...cardProps}
      summary={
        <p className="line-clamp-3">
          {bioLong ? `${dto.bio.slice(0, ABOUT_PREVIEW).trimEnd()}…` : dto.bio}
        </p>
      }
      detail={bioLong ? <p className={body}>{dto.bio}</p> : undefined}
      moreLabel="Show more"
    />
  ) : null;

  const firstRole = dto.experience[0];
  const expCard = firstRole ? (
    <CompactCard
      id="pp-exp"
      title="Experience"
      icon={<Briefcase className="size-4" />}
      {...cardProps}
      summary={
        <>
          <p>Career highlights and key roles</p>
          <p className={hint}>
            Latest: {firstRole.position} · {firstRole.company}
          </p>
        </>
      }
      detail={stack(
        dto.experience.map((w, i) => <div key={i}>{roleBlock(w)}</div>),
      )}
      moreLabel={expMore}
    />
  ) : null;

  const projCard =
    dto.projects.length > 0 ? (
      <CompactCard
        id="pp-proj"
        title="Projects"
        icon={<FolderKanban className="size-4" />}
        {...cardProps}
        summary={
          <>
            <p>Selected products and work</p>
            <p className={hint}>
              {dto.projects.length} project
              {dto.projects.length === 1 ? "" : "s"}
            </p>
          </>
        }
        detail={stack(
          dto.projects.map((pr, i) => <div key={i}>{projectBlock(pr)}</div>),
        )}
        moreLabel={projMore}
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
          <p className="truncate">{allSkills.slice(0, 6).join(" · ")}</p>
        }
        detail={
          <ul className="flex flex-wrap gap-1.5">
            {allSkills.map((k) => (
              <li key={k} className={p.chip}>
                {k}
              </li>
            ))}
          </ul>
        }
        moreLabel={skillsMore}
      />
    ) : null;

  const firstEdu = dto.education[0];
  const eduCard = firstEdu ? (
    <CompactCard
      id="pp-edu"
      title="Education"
      icon={<GraduationCap className="size-4" />}
      {...cardProps}
      summary={
        <p>
          {[firstEdu.degree, firstEdu.institution].filter(Boolean).join(" · ")}
        </p>
      }
      detail={stack(
        dto.education.map((e, i) => <div key={i}>{eduBlock(e)}</div>),
      )}
      moreLabel={eduMore}
    />
  ) : null;

  const firstCert = dto.certifications[0];
  const certCard = firstCert ? (
    <CompactCard
      id="pp-cert"
      title="Certifications"
      icon={<Award className="size-4" />}
      {...cardProps}
      summary={<p>Professional credentials · {firstCert.name}</p>}
      detail={stack(
        dto.certifications.map((c, i) => <div key={i}>{certBlock(c)}</div>),
      )}
      moreLabel={certMore}
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
          <p>
            {dto.languages
              .map((l) => l.language + (l.fluency ? ` · ${l.fluency}` : ""))
              .join("   ·   ")}
          </p>
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
        <span className={`block ${p.cardTitle}`}>Résumé</span>
        <span className={`block ${p.cardSub}`}>
          View my professional résumé
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
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
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
        <Link href="/" className="flex items-center" aria-label="LinkMeU home">
          <LinkMeuLogo className="h-6" />
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
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-0 ${p.coverShade}`}
              />
            </div>
          ) : (
            <div aria-hidden className={p.heroBand} />
          )}
          <div className="flex flex-col items-center px-4 pb-5 sm:px-6">
            <BlurFade delay={0.05} className={`relative z-30 ${p.avatarPull}`}>
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
            </BlurFade>
            <BlurFade delay={0.15} className="w-full max-w-2xl">
              <div className={`relative overflow-hidden ${p.identityPanel}`}>
                {p.panelGlow && (
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-x-0 top-0 h-px ${p.panelGlow}`}
                  />
                )}
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
                      <div key={f.l} className="px-6 text-center">
                        <dd className={p.factValue}>{f.v}</dd>
                        <dt className={p.factLabel}>{f.l}</dt>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </BlurFade>
            {(dto.featuredResume || socialLinks.length > 0) && (
              <div className="mt-3 flex w-full max-w-2xl flex-wrap items-stretch justify-center gap-2 sm:items-center">
                {dto.featuredResume && (
                  <BlurFade
                    delay={0.28}
                    className="relative w-full overflow-hidden rounded-lg sm:w-auto"
                  >
                    <span className="relative inline-flex w-full overflow-hidden rounded-lg sm:w-auto">
                      <Link
                        href={`/u/${slug}/resume`}
                        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 sm:w-auto ${p.primaryCta} ${t.button}`}
                      >
                        <FileText className="size-4" aria-hidden />
                        View Resume
                      </Link>
                      <BorderBeam color={p.beam} />
                    </span>
                  </BlurFade>
                )}
              </div>
            )}
            {socialLinks.length > 0 && (
              <BlurFade
                delay={0.36}
                className="mt-3 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2"
              >
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
              </BlurFade>
            )}
          </div>
        </section>

        {/* compact career cards */}
        {pair(
          aboutCard && <BlurFade delay={0.42}>{aboutCard}</BlurFade>,
          expCard && <BlurFade delay={0.48}>{expCard}</BlurFade>,
        )}
        {pair(
          projCard && <BlurFade delay={0.54}>{projCard}</BlurFade>,
          skillsCard && <BlurFade delay={0.6}>{skillsCard}</BlurFade>,
        )}
        {pair(
          eduCard && <BlurFade delay={0.66}>{eduCard}</BlurFade>,
          certCard && <BlurFade delay={0.72}>{certCard}</BlurFade>,
        )}
        {pair(
          langCard && <BlurFade delay={0.78}>{langCard}</BlurFade>,
          resumeCard && <BlurFade delay={0.84}>{resumeCard}</BlurFade>,
        )}
      </div>

      <footer
        className={`mx-auto flex w-full ${p.contentMax} flex-wrap items-center justify-between gap-2 px-4 pt-2 pb-8 sm:px-6`}
      >
        <span
          className={`inline-flex items-center gap-2 text-xs font-semibold ${t.footer}`}
        >
          <LinkMeuLogo className="h-4" />
        </span>
        <span className={`text-xs ${t.footer}`}>
          Built for meaningful careers
        </span>
      </footer>
    </main>
  );
}
