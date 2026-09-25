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

import { ResumeMiniPreview } from "@/components/resume/resume-mini-preview";
import { prisma } from "@/server/db";
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

  const dto = profile && buildPublicProfileDTO(profile);
  if (!dto) notFound();

  const socialLinks = [
    { href: dto.links.linkedin, label: "LinkedIn", icon: AtSign },
    { href: dto.links.github, label: "GitHub", icon: FolderGit2 },
    { href: dto.links.website, label: "Website", icon: Globe },
  ].filter((l) => l.href !== null);

  const facts = [
    { label: "Based in", value: dto.location },
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

  return (
    <main className="min-h-dvh bg-gradient-to-b from-emerald-50/60 via-stone-50 to-stone-50">
      {/* brand header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-stone-900"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-emerald-700 text-sm font-black text-white"
          >
            R
          </span>
          RoleRace
        </Link>
        <p className="hidden text-xs font-medium text-stone-400 sm:block">
          Built for meaningful careers
        </p>
      </header>

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-6 sm:px-6">
        {/* hero */}
        <section
          aria-label="Profile"
          className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
        >
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div
                aria-hidden
                className="relative grid size-24 place-items-center rounded-full bg-emerald-700 text-3xl font-bold text-white ring-8 ring-emerald-50"
              >
                {dto.initials}
              </div>
              {dto.openToOpportunities && (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-600/25 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-emerald-500"
                  />
                  Open to opportunities
                </span>
              )}
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                {dto.name}
              </h1>
              {dto.headline && (
                <p className="mt-2 text-lg leading-relaxed font-medium text-stone-600">
                  {dto.headline}
                </p>
              )}
              {dto.bio && (
                <p className="mt-4 max-w-xl text-left text-[15px] leading-relaxed text-stone-600">
                  {dto.bio.length > 280
                    ? `${dto.bio.slice(0, 280).trimEnd()}…`
                    : dto.bio}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                {dto.featuredResume && (
                  <Link
                    href={`/u/${slug}/resume`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
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
                    className="grid size-11 place-items-center rounded-full border border-stone-200 text-stone-500 transition-colors hover:border-emerald-600/40 hover:text-emerald-700"
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
                className="h-fit rounded-xl border border-stone-100 bg-stone-50/70 p-5"
              >
                <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
                  Career facts
                </p>
                <dl className="mt-3 space-y-3">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt className="text-xs font-medium text-stone-400">
                        {f.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-stone-800">
                        {f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </aside>
            )}
          </div>
        </section>

        {/* about */}
        {dto.bio && dto.bio.length > 280 && (
          <section
            aria-labelledby="pp-about"
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id="pp-about"
              className="text-xl font-bold tracking-tight text-stone-900"
            >
              About
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed whitespace-pre-line text-stone-600">
              {dto.bio}
            </p>
          </section>
        )}

        {/* featured resume */}
        {dto.featuredResume && (
          <section
            aria-labelledby="pp-fr"
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
              Featured resume
            </p>
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
                <h2
                  id="pp-fr"
                  className="text-lg font-bold tracking-tight text-stone-900"
                >
                  {dto.featuredResume.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-stone-700">
                  {dto.featuredResume.targetRole} ·{" "}
                  {dto.featuredResume.targetCountry}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
                    {dto.featuredResume.templateName}
                  </span>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
                    {dto.featuredResume.targetCountry}
                  </span>
                </div>
              </div>
              <Link
                href={`/u/${slug}/resume`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 sm:self-center"
              >
                <FileText className="size-4" aria-hidden />
                View Resume
              </Link>
            </div>
          </section>
        )}

        {/* experience */}
        {dto.experience.length > 0 && (
          <section
            aria-labelledby="pp-exp"
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id="pp-exp"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-stone-900"
            >
              <Briefcase className="size-5 text-emerald-700" aria-hidden />
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
                    className="absolute top-1.5 left-0 size-2.5 rounded-full bg-emerald-600"
                  />
                  {i < dto.experience.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-5 bottom-[-28px] left-[4px] w-px bg-emerald-600/15"
                    />
                  )}
                  <p className="text-xs font-medium text-stone-500">
                    {[
                      dateRange(w.startDate, w.endDate, w.isCurrent),
                      w.location,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div>
                    <p className="text-[15px] font-semibold text-stone-900">
                      {w.position}
                      <span className="font-normal text-stone-500">
                        {" "}
                        — {w.company}
                      </span>
                    </p>
                    {w.summary && (
                      <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                        {w.summary}
                      </p>
                    )}
                    {w.highlights.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-stone-600">
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

        {/* projects */}
        {dto.projects.length > 0 && (
          <section
            aria-labelledby="pp-proj"
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id="pp-proj"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-stone-900"
            >
              <FolderKanban className="size-5 text-emerald-700" aria-hidden />
              Projects
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {dto.projects.map((pr, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="text-[15px] font-semibold text-stone-900">
                      {pr.name}
                    </p>
                    {pr.url && (
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        View ↗
                      </a>
                    )}
                  </div>
                  {pr.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                      {pr.description}
                    </p>
                  )}
                  {pr.highlights.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-stone-600">
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
          <section
            aria-labelledby="pp-skills"
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id="pp-skills"
              className="text-xl font-bold tracking-tight text-stone-900"
            >
              Skills
            </h2>
            <ul className="mt-4 space-y-4">
              {dto.skills.map((s, i) => (
                <li key={i}>
                  <p className="text-sm font-semibold text-stone-800">
                    {s.name}
                  </p>
                  {s.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {s.keywords.map((k, j) => (
                        <span
                          key={j}
                          className="rounded-full border border-emerald-600/20 bg-emerald-50/50 px-3 py-1 text-xs font-medium text-stone-700"
                        >
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

        {/* education */}
        {dto.education.length > 0 && (
          <section
            aria-labelledby="pp-edu"
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id="pp-edu"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-stone-900"
            >
              <GraduationCap className="size-5 text-emerald-700" aria-hidden />
              Education
            </h2>
            <ul className="mt-5 space-y-5">
              {dto.education.map((e, i) => (
                <li key={i}>
                  <p className="text-[15px] font-semibold text-stone-900">
                    {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ") ||
                      e.institution}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-600">
                    {e.institution}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
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
              <section
                aria-labelledby="pp-certs"
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2
                  id="pp-certs"
                  className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-stone-900"
                >
                  <Award className="size-5 text-emerald-700" aria-hidden />
                  Certifications
                </h2>
                <ul className="mt-4 space-y-3">
                  {dto.certifications.map((c, i) => (
                    <li key={i}>
                      <p className="text-sm font-semibold text-stone-800">
                        {c.name}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
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
              <section
                aria-labelledby="pp-lang"
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2
                  id="pp-lang"
                  className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-stone-900"
                >
                  <Languages className="size-5 text-emerald-700" aria-hidden />
                  Languages
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {dto.languages.map((l, i) => (
                    <li
                      key={i}
                      className="rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-sm font-medium text-stone-700"
                    >
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
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pt-2 pb-10 sm:px-6">
        <p className="flex items-center gap-2 text-xs font-semibold text-stone-400">
          <span
            aria-hidden
            className="grid size-5 place-items-center rounded bg-emerald-700 text-[10px] font-black text-white"
          >
            R
          </span>
          RoleRace · Built for meaningful careers
        </p>
        <p className="text-xs text-stone-400">Built with RoleRace</p>
      </footer>
    </main>
  );
}
