import {
  ArrowRight,
  FilePlus2,
  FileText,
  FolderOpen,
  Globe2,
  LayoutTemplate,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import {
  getCandidateDashboardData,
  type CareerProfileStatus,
} from "@/server/candidates/dashboard";

export const metadata = { title: "Dashboard — RoleRace" };

const PROFILE_LABELS: Record<CareerProfileStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  resume_ready: "Resume ready",
  needs_attention: "Needs attention",
};

const QUICK_ACTIONS = [
  {
    href: "/candidate/profile",
    icon: UserRound,
    title: "Complete your profile",
    description: "Keep your career profile up to date.",
  },
  {
    href: "/candidate/resumes",
    icon: FolderOpen,
    title: "View your resumes",
    description: "See your targeted resume workspace.",
  },
  {
    href: "/candidate/templates",
    icon: LayoutTemplate,
    title: "Explore templates",
    description: "See the professional designs available in RoleRace.",
  },
] as const;

export default async function CandidateDashboard() {
  const data = await getCandidateDashboardData();

  const summaryCards = [
    {
      icon: UserRound,
      label: "Career Profile",
      value: PROFILE_LABELS[data.profileStatus],
    },
    {
      icon: FileText,
      label: "Resumes",
      value: String(data.resumeCount),
    },
    {
      icon: Globe2,
      label: "Target Roles",
      value: String(data.targetRoleCount),
    },
    {
      icon: FilePlus2,
      label: "Resume Source",
      value: data.hasResumeSource ? "Uploaded" : "Not uploaded",
    },
  ];

  return (
    <div className="space-y-10">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
            Welcome back, {data.firstName}
          </h1>
          <p className="mt-1.5 text-sm text-stone-600">
            Let&rsquo;s keep your career moving forward.
          </p>
        </div>
        <Link
          href="/candidate/resumes"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
        >
          <FilePlus2 className="size-4" aria-hidden />
          Create new resume
        </Link>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <card.icon className="size-[18px]" aria-hidden />
            </span>
            <p className="mt-4 truncate text-xl font-bold tracking-tight text-stone-900">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-stone-500">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* quick actions */}
      <section aria-labelledby="quick-actions">
        <h2
          id="quick-actions"
          className="text-sm font-semibold tracking-wide text-stone-900 uppercase"
        >
          Quick actions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-emerald-600/30 hover:shadow-sm"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                <action.icon className="size-[18px]" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-stone-900">
                {action.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">
                {action.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                Open
                <ArrowRight
                  className="size-3 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* recent resumes */}
      <section aria-labelledby="recent-resumes">
        <div className="flex items-center justify-between">
          <h2
            id="recent-resumes"
            className="text-sm font-semibold tracking-wide text-stone-900 uppercase"
          >
            Recent resumes
          </h2>
          <Link
            href="/candidate/resumes"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all
          </Link>
        </div>

        {data.recentResumes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
            <FileText className="mx-auto size-8 text-stone-300" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-stone-900">
              No resumes yet
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-500">
              Once you create a targeted resume, it will appear here.
            </p>
            <Link
              href="/candidate/resumes"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              Explore resume workspace
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
            {data.recentResumes.map((resume) => (
              <li key={resume.id}>
                <Link
                  href="/candidate/resumes"
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-stone-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <FileText className="size-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {resume.name}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {resume.targetRole}
                      {resume.targetCountry ? ` · ${resume.targetCountry}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-stone-600">
                      {resume.templateName}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {resume.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
