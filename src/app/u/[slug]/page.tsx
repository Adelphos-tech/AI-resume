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
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cardStyleTokens } from "@/lib/career-card-theme-styles";
import {
  CareerCardCoverPhoto,
  CareerCardProfilePhoto,
} from "@/components/candidate/public-profile/career-card-photo";
import { ResumeMiniPreview } from "@/components/resume/resume-mini-preview";
import { prisma } from "@/server/db";
import { getCandidateSession } from "@/server/session";
import {
  buildPublicProfileDTO,
  formatCareerDate,
} from "@/server/public-profile/public-profile";

/** Published state must always reflect the live database. */
export const dynamic = "force-dynamic";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await prisma.publicProfile.findUnique({
    where: { slug },
    select: {
      isPublished: true,
      publicBio: true,
      candidate: { select: { firstName: true, lastName: true } },
    },
  });
  if (!profile?.isPublished) return { title: "RoleRace" };
  const name =
    `${profile.candidate.firstName} ${profile.candidate.lastName}`.trim();
  return {
    title: `${name} | RoleRace`,
    description: profile.publicBio?.slice(0, 160) ?? undefined,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await prisma.publicProfile.findUnique({
    where: { slug },
    include: {
      featuredResumeVariant: {
        select: {
          name: true,
          targetRole: true,
          targetCountry: true,
          templateKey: true,
          resumeData: true,
        },
      },
      candidate: { include: { careerProfile: true } },
    },
  });

  // Owner preview: the signed-in candidate who owns the profile may view it
  // before publishing. Everyone else still gets a 404.
  const isOwner =
    profile != null &&
    !profile.isPublished &&
    (await getCandidateSession())?.candidate.id === profile.candidateId;
  const dto =
    profile &&
    buildPublicProfileDTO(profile, { allowUnpublished: isOwner === true });
  if (!dto) notFound();

  const st = cardStyleTokens(dto.themeId, dto.accentColorId, dto.cardStyleId);
  const t = st.base;
  const prem = st.premium;
  const sectionCls = `${prem ? prem.sectionCard : t.card} p-6 sm:p-8`;

  // Premium only: deterministic career facts derived from real MCP data —
  // no fabricated metrics; a fact renders only when its value is > 0.
  const careerFacts: { v: string; l: string }[] = [];
  if (prem) {
    // Years Experience: merge actual valid [start, end] intervals so
    // career gaps are excluded and overlapping roles aren't double-counted.
    const toMonth = (d: string | null): number | null => {
      if (!d || !/^\d{4}/.test(d)) return null;
      const y = parseInt(d.slice(0, 4), 10);
      const m = /^\d{4}-\d{2}/.test(d) ? parseInt(d.slice(5, 7), 10) : 1;
      return m < 1 || m > 12 ? null : y * 12 + (m - 1);
    };
    const now = new Date();
    const nowM = now.getFullYear() * 12 + now.getMonth();
    const ivals: [number, number][] = [];
    for (const w of dto.experience) {
      const s = toMonth(w.startDate);
      if (s === null) continue;
      let e = toMonth(w.endDate);
      if (e === null && w.isCurrent) e = nowM;
      if (e === null) continue;
      if (e > nowM) e = nowM; // clamp future ends
      if (e < s) continue; // invalid interval
      ivals.push([s, e]);
    }
    ivals.sort((a, b) => a[0] - b[0]);
    let totalMonths = 0;
    let curS: number | null = null;
    let curE = 0;
    for (const [s, e] of ivals) {
      if (curS === null) {
        curS = s;
        curE = e;
      } else if (s <= curE + 1) {
        curE = Math.max(curE, e); // merge overlapping/adjacent
      } else {
        totalMonths += curE - curS + 1;
        curS = s;
        curE = e;
      }
    }
    if (curS !== null) totalMonths += curE - curS + 1;
    const years = Math.floor(totalMonths / 12); // completed years only
    if (years >= 1) careerFacts.push({ v: `${years}+`, l: "Years Experience" });
    if (dto.projects.length > 0)
      careerFacts.push({ v: `${dto.projects.length}`, l: "Projects" });
    const companies = new Set(
      dto.experience.map((w) => w.company).filter(Boolean),
    ).size;
    if (companies > 0) careerFacts.push({ v: `${companies}`, l: "Companies" });
    if (careerFacts.length < 3 && dto.certifications.length > 0)
      careerFacts.push({
        v: `${dto.certifications.length}`,
        l: "Certifications",
      });
  }

  const socialLinks = [
    { href: dto.links.linkedin, label: "LinkedIn", icon: AtSign },
    { href: dto.links.github, label: "GitHub", icon: FolderGit2 },
    { href: dto.links.website, label: "Website", icon: Globe },
  ].filter((l) => l.href !== null);

  const facts = [
    // Premium shows location inside the identity panel; Standard keeps
    // the original career-facts list unchanged.
    { label: "Based in", value: prem === null ? dto.location : null },
    { label: "Current focus", value: dto.currentFocus },
    { label: "Work authorization", value: dto.workAuthorization },
    {
      label: "Languages",
      value:
        dto.languages.length > 0
          ? dto.languages
              .map((l) => l.language + (l.fluency ? ` (${l.fluency})` : ""))
              .join(", ")
          : null,
    },
  ].filter((f) => f.value !== null && f.value !== "");

  // Premium only: compatible short sections share a 2-column row on
  // desktop. Standard uses display:contents — no visual difference.
  const pairCls = prem
    ? "grid gap-6 lg:grid-cols-2 lg:items-start"
    : "contents";

  return (
    <main className={`min-h-dvh ${prem ? prem.page : t.page}`}>
      {/* brand header */}
      <header
        className={`mx-auto flex w-full ${prem ? prem.contentMax : "max-w-6xl"} items-center justify-between px-4 py-5 sm:px-6`}
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
        <p className={`hidden text-xs font-medium sm:block ${t.faint}`}>
          Built for meaningful careers
        </p>
      </header>

      <div
        className={`mx-auto w-full ${prem ? prem.contentMax : "max-w-6xl"} space-y-6 px-4 pb-6 sm:px-6`}
      >
        {isOwner === true && (
          <p
            role="status"
            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
          >
            Preview — only you can see this. Publish your Career Card to make it
            live.
          </p>
        )}
        {/* hero */}
        {prem !== null ? (
          /* ---------- Premium identity hero ----------
             cinematic cover → portrait overlapping the lower cover edge →
             identity panel tucked under the portrait → action row →
             real career facts → existing career-facts panel */
          <section aria-label="Profile" className={`${prem.heroCard}`}>
            {dto.coverPhotoUrl ? (
              <div className={prem.coverWrap}>
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
              <div aria-hidden className={prem.heroBand} />
            )}
            <div className="flex flex-col items-center px-4 pb-8 sm:px-8">
              <div className={`relative z-10 ${prem.avatarPull}`}>
                {dto.profilePhotoUrl ? (
                  <CareerCardProfilePhoto
                    src={dto.profilePhotoUrl}
                    alt={`${dto.name} profile photo`}
                    position={dto.profilePhotoPosition}
                    frameClassName={prem.avatarImg}
                  />
                ) : (
                  <div aria-hidden className={`relative ${prem.avatar}`}>
                    {dto.initials}
                  </div>
                )}
              </div>
              <div className={prem.identityPanel}>
                <h1 className={t.h1}>{dto.name}</h1>
                {dto.headline && <p className={t.headline}>{dto.headline}</p>}
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
                {dto.bio && (
                  <p
                    className={`mx-auto mt-4 max-w-xl text-[15px] leading-relaxed ${t.body}`}
                  >
                    {dto.bio.length > 280
                      ? `${dto.bio.slice(0, 280).trimEnd()}…`
                      : dto.bio}
                  </p>
                )}
                {careerFacts.length > 0 && (
                  <dl className={prem.factsRow}>
                    {careerFacts.map((f) => (
                      <div key={f.l}>
                        <dt className={prem.factLabel}>{f.l}</dt>
                        <dd className={prem.factValue}>{f.v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <div className="mt-5 flex w-full max-w-2xl flex-wrap items-stretch justify-center gap-3 sm:items-center">
                {dto.featuredResume && (
                  <Link
                    href={`/u/${slug}/resume`}
                    className={`inline-flex min-h-11 items-center gap-2 ${prem.primaryCta} ${t.button}`}
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
                    className={`${prem.actionPill} ${prem.actionPillHover}`}
                  >
                    <l.icon className="size-4" aria-hidden />
                    {l.label}
                  </a>
                ))}
              </div>
              {facts.length > 0 && (
                <aside
                  aria-label="Career facts"
                  className={`mt-6 w-full max-w-2xl ${t.factsPanel}`}
                >
                  <p className={t.meta}>Career facts</p>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    {facts.map((f) => (
                      <div key={f.label}>
                        <dt className={t.factLabel}>{f.label}</dt>
                        <dd className={t.factValue}>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </aside>
              )}
            </div>
          </section>
        ) : (
          <section aria-label="Profile" className={`overflow-hidden ${t.card}`}>
            {/* optional cover — decorative presentation image; the stored
              master keeps its aspect ratio, object-fit crops visually */}
            {dto.coverPhotoUrl && (
              <div className={t.coverWrap}>
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
            )}
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className={dto.coverPhotoUrl ? t.coverAvatarPull : ""}>
                  {dto.profilePhotoUrl ? (
                    <CareerCardProfilePhoto
                      src={dto.profilePhotoUrl}
                      alt={`${dto.name} profile photo`}
                      position={dto.profilePhotoPosition}
                      frameClassName={t.avatarImg}
                    />
                  ) : (
                    <div aria-hidden className={`relative ${t.avatar}`}>
                      {dto.initials}
                    </div>
                  )}
                </div>
                {dto.openToOpportunities && (
                  <span className={`mt-4 ${t.openBadge}`}>
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-emerald-500"
                    />
                    Open to opportunities
                  </span>
                )}
                <h1 className={t.h1}>{dto.name}</h1>
                {dto.headline && <p className={t.headline}>{dto.headline}</p>}
                {dto.bio && (
                  <p
                    className={`mt-4 max-w-xl text-left text-[15px] leading-relaxed ${t.body}`}
                  >
                    {dto.bio.length > 280
                      ? `${dto.bio.slice(0, 280).trimEnd()}…`
                      : dto.bio}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  {dto.featuredResume && (
                    <Link
                      href={`/u/${slug}/resume`}
                      className={`inline-flex min-h-11 items-center gap-2 ${t.button}`}
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
                      className={`grid size-11 place-items-center rounded-full border transition-colors ${t.socialBtn}`}
                    >
                      <l.icon className="size-4" aria-hidden />
                    </a>
                  ))}
                </div>
              </div>

              {/* career facts */}
              {facts.length > 0 && (
                <aside
                  aria-label="Career facts"
                  className={`h-fit ${t.factsPanel}`}
                >
                  <p className={t.meta}>Career facts</p>
                  <dl className="mt-3 space-y-3">
                    {facts.map((f) => (
                      <div key={f.label}>
                        <dt className={t.factLabel}>{f.label}</dt>
                        <dd className={t.factValue}>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </aside>
              )}
            </div>
          </section>
        )}

        {/* about + featured resume — paired on Premium desktop */}
        <div className={pairCls}>
          {/* about */}
          {dto.bio && dto.bio.length > 280 && (
            <section aria-labelledby="pp-about" className={sectionCls}>
              <h2 id="pp-about" className={t.h2}>
                About
              </h2>
              <p
                className={`mt-3 max-w-3xl text-[15px] leading-relaxed whitespace-pre-line ${t.body}`}
              >
                {dto.bio}
              </p>
            </section>
          )}

          {/* featured resume */}
          {dto.featuredResume && (
            <section aria-labelledby="pp-fr" className={sectionCls}>
              <p className={t.accentMeta}>Featured resume</p>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="hidden w-36 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 sm:block">
                  <div className="aspect-[3/4]">
                    <ResumeMiniPreview
                      templateKey={dto.featuredResume.templateKey}
                      resumeData={dto.featuredResume.resumeData}
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="pp-fr" className={`text-lg ${t.h2}`}>
                    {dto.featuredResume.name}
                  </h2>
                  <p className={`mt-1 text-sm font-medium ${t.strong}`}>
                    {dto.featuredResume.targetRole} ·{" "}
                    {dto.featuredResume.targetCountry}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={t.chip}>
                      {dto.featuredResume.templateName}
                    </span>
                    <span className={t.chip}>
                      {dto.featuredResume.targetCountry}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/u/${slug}/resume`}
                  className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start sm:self-center ${t.button}`}
                >
                  <FileText className="size-4" aria-hidden />
                  View Resume
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* experience */}
        {dto.experience.length > 0 && (
          <section aria-labelledby="pp-exp" className={sectionCls}>
            <h2 id="pp-exp" className={`flex items-center gap-2.5 ${t.h2}`}>
              <Briefcase className={`size-5 ${t.accentIcon}`} aria-hidden />
              Experience
            </h2>
            <ol className="mt-6 space-y-7">
              {dto.experience.map((w, i) => (
                <li
                  key={i}
                  className="relative grid gap-1 pl-6 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-6 md:pl-7"
                >
                  <span
                    aria-hidden
                    className={`absolute top-1.5 left-0 size-2.5 rounded-full ${t.timelineDot}`}
                  />
                  {i < dto.experience.length - 1 && (
                    <span
                      aria-hidden
                      className={`absolute top-5 bottom-[-28px] left-[4px] w-px ${t.timelineLine}`}
                    />
                  )}
                  <p className={`text-xs font-medium ${t.faint}`}>
                    {[
                      dateRange(w.startDate, w.endDate, w.isCurrent),
                      w.location,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div>
                    <p className={`text-[15px] font-semibold ${t.strong}`}>
                      {w.position}
                      <span className={`font-normal ${t.faint}`}>
                        {" "}
                        — {w.company}
                      </span>
                    </p>
                    {w.summary && (
                      <p className={`mt-1.5 text-sm leading-relaxed ${t.body}`}>
                        {w.summary}
                      </p>
                    )}
                    {w.highlights.length > 0 && (
                      <ul
                        className={`mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed ${t.body}`}
                      >
                        {w.highlights.map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* projects + skills — paired on Premium desktop */}
        <div className={pairCls}>
          {/* projects */}
          {dto.projects.length > 0 && (
            <section aria-labelledby="pp-proj" className={sectionCls}>
              <h2 id="pp-proj" className={`flex items-center gap-2.5 ${t.h2}`}>
                <FolderKanban
                  className={`size-5 ${t.accentIcon}`}
                  aria-hidden
                />
                Projects
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {dto.projects.map((pr, i) => (
                  <li key={i} className={`${t.innerCard} p-5`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <p className={`text-[15px] font-semibold ${t.strong}`}>
                        {pr.name}
                      </p>
                      {pr.url && (
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={t.link}
                        >
                          View ↗
                        </a>
                      )}
                    </div>
                    {pr.description && (
                      <p className={`mt-1.5 text-sm leading-relaxed ${t.body}`}>
                        {pr.description}
                      </p>
                    )}
                    {pr.highlights.length > 0 && (
                      <ul
                        className={`mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed ${t.body}`}
                      >
                        {pr.highlights.map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* skills */}
          {dto.skills.length > 0 && (
            <section aria-labelledby="pp-skills" className={sectionCls}>
              <h2 id="pp-skills" className={t.h2}>
                Skills
              </h2>
              <ul className="mt-4 space-y-4">
                {dto.skills.map((s, i) => (
                  <li key={i}>
                    <p className={`text-sm font-semibold ${t.strong}`}>
                      {s.name}
                    </p>
                    {s.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {s.keywords.map((k, j) => (
                          <span key={j} className={t.skillChip}>
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* education */}
        {dto.education.length > 0 && (
          <section aria-labelledby="pp-edu" className={sectionCls}>
            <h2 id="pp-edu" className={`flex items-center gap-2.5 ${t.h2}`}>
              <GraduationCap className={`size-5 ${t.accentIcon}`} aria-hidden />
              Education
            </h2>
            <ul className="mt-5 space-y-5">
              {dto.education.map((e, i) => (
                <li key={i}>
                  <p className={`text-[15px] font-semibold ${t.strong}`}>
                    {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
                      e.institution}
                  </p>
                  <p className={`mt-0.5 text-sm ${t.subtle}`}>
                    {e.institution}
                  </p>
                  <p className={`mt-0.5 text-xs ${t.faint}`}>
                    {[dateRange(e.startDate, e.endDate), e.location]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* certifications + languages side by side */}
        {(dto.certifications.length > 0 || dto.languages.length > 0) && (
          <div className="grid gap-6 sm:grid-cols-2">
            {dto.certifications.length > 0 && (
              <section aria-labelledby="pp-certs" className={sectionCls}>
                <h2
                  id="pp-certs"
                  className={`flex items-center gap-2.5 ${t.h2}`}
                >
                  <Award className={`size-5 ${t.accentIcon}`} aria-hidden />
                  Certifications
                </h2>
                <ul className="mt-4 space-y-3">
                  {dto.certifications.map((c, i) => (
                    <li key={i}>
                      <p className={`text-sm font-semibold ${t.strong}`}>
                        {c.name}
                      </p>
                      <p className={`mt-0.5 text-xs ${t.faint}`}>
                        {[c.issuer, formatCareerDate(c.date)]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {dto.languages.length > 0 && (
              <section aria-labelledby="pp-lang" className={sectionCls}>
                <h2
                  id="pp-lang"
                  className={`flex items-center gap-2.5 ${t.h2}`}
                >
                  <Languages className={`size-5 ${t.accentIcon}`} aria-hidden />
                  Languages
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {dto.languages.map((l, i) => (
                    <li key={i} className={t.chip}>
                      {l.language}
                      {l.fluency ? ` · ${l.fluency}` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      {/* footer */}
      <footer
        className={`mx-auto flex w-full ${prem ? prem.contentMax : "max-w-6xl"} flex-wrap items-center justify-between gap-2 px-4 pt-2 pb-10 sm:px-6`}
      >
        <p
          className={`flex items-center gap-2 text-xs font-semibold ${t.footer}`}
        >
          <span
            aria-hidden
            className={`grid size-5 place-items-center rounded text-[10px] font-black ${t.footerBrand}`}
          >
            R
          </span>
          RoleRace · Built for meaningful careers
        </p>
        <p className={`text-xs ${t.footer}`}>Built with RoleRace</p>
      </footer>
    </main>
  );
}
