import {
  ArrowRight,
  CheckCircle2,
  FilePlus2,
  FileText,
  FileUp,
  FolderOpen,
  Globe2,
  LayoutTemplate,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import {
  getCandidateDashboardData,
  type CareerProfileStatus,
} from "@/server/candidates/dashboard";

export const metadata = { title: "Dashboard — LinkMeU" };

const PROFILE_LABELS: Record<CareerProfileStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  resume_ready: "Resume ready",
  needs_attention: "Needs attention",
};

type DashboardState = "needs_profile" | "ready_no_resume" | "has_resumes";

type NextStep = {
  eyebrow: string;
  heading: string;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

export default async function CandidateDashboard() {
  const data = await getCandidateDashboardData();

  const latest = data.recentResumes[0];
  const profileReady = data.profileStatus === "resume_ready";
  const state: DashboardState = !profileReady
    ? "needs_profile"
    : latest
      ? "has_resumes"
      : "ready_no_resume";

  const nextStep: NextStep =
    state === "needs_profile"
      ? {
          eyebrow: "Next step",
          heading: "Complete your Career Profile",
          description:
            "Import your existing resume or add your career information manually before creating a targeted resume.",
          primary: {
            label: "Import existing resume",
            href: "/candidate/profile/import",
          },
          secondary: {
            label: "Complete manually",
            href: "/candidate/profile",
          },
        }
      : state === "ready_no_resume"
        ? {
            eyebrow: "Next step",
            heading: "Create your first resume",
            description:
              "Your Career Profile is ready. Create a targeted resume for a role and country.",
            primary: {
              label: "Create resume",
              href: "/candidate/resumes/new",
            },
            secondary: {
              label: "Review Career Profile",
              href: "/candidate/profile",
            },
          }
        : {
            eyebrow: "Next step",
            heading: "Continue with your latest resume",
            description: `${latest.name} — ${latest.targetRole}${latest.targetCountry ? ` · ${latest.targetCountry}` : ""} · ${latest.templateName}`,
            primary: {
              label: "View resume",
              href: `/candidate/resumes/${latest.id}`,
            },
            secondary: {
              label: "Review with AI",
              href: `/candidate/ai-review/${latest.id}`,
            },
          };

  const headerCta =
    state === "needs_profile"
      ? { label: "Import existing resume", href: "/candidate/profile/import" }
      : { label: "Create resume", href: "/candidate/resumes/new" };

  const journey = [
    {
      label: "Career Profile",
      done: profileReady,
      current: !profileReady,
    },
    {
      label: "Resume",
      done: data.resumeCount > 0,
      current: profileReady && data.resumeCount === 0,
    },
    {
      label: "AI Review",
      done: false,
      current: false,
      available: data.resumeCount > 0,
    },
  ];

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

  const quickActions = [
    ...(!profileReady
      ? [
          {
            href: "/candidate/profile/import",
            icon: FileUp,
            title: "Import existing resume",
            description:
              "Extract your current resume into your Career Profile.",
          },
        ]
      : []),
    {
      href: "/candidate/profile",
      icon: UserRound,
      title: "Career Profile",
      description: "Manage your canonical career information.",
    },
    {
      href: "/candidate/templates",
      icon: LayoutTemplate,
      title: "Templates",
      description: "Explore the available resume designs.",
    },
    ...(latest
      ? [
          {
            href: `/candidate/ai-review/${latest.id}`,
            icon: Sparkles,
            title: "AI Review",
            description: "Get AI feedback on your latest resume.",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Welcome back, {data.firstName}
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
            Build, tailor, and review your career materials from one workspace.
          </p>
        </div>
        <Link
          href={headerCta.href}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
        >
          {state === "needs_profile" ? (
            <FileUp className="size-4" aria-hidden />
          ) : (
            <FilePlus2 className="size-4" aria-hidden />
          )}
          {headerCta.label}
        </Link>
      </div>

      {/* next step */}
      <section
        aria-labelledby="next-step"
        className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 md:p-7"
      >
        <p
          id="next-step"
          className="text-xs font-semibold tracking-widest text-emerald-700 uppercase"
        >
          {nextStep.eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-stone-900 md:text-2xl">
          {nextStep.heading}
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          {nextStep.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={nextStep.primary.href}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            {nextStep.primary.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href={nextStep.secondary.href}
            className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-emerald-600/30 hover:text-stone-900"
          >
            {nextStep.secondary.label}
          </Link>
        </div>
      </section>

      {/* journey */}
      <section
        aria-labelledby="career-journey"
        className="rounded-2xl border border-stone-200 bg-white px-6 py-5"
      >
        <h2
          id="career-journey"
          className="text-xs font-semibold tracking-widest text-stone-500 uppercase"
        >
          Your career journey
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {journey.map((step, i) => (
            <li
              key={step.label}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                step.done
                  ? "border-emerald-200 bg-emerald-50/50"
                  : step.current
                    ? "border-emerald-600/30 bg-white ring-1 ring-emerald-600/20 ring-inset"
                    : "border-stone-200 bg-stone-50/50"
              }`}
            >
              {step.done ? (
                <CheckCircle2
                  className="size-5 shrink-0 text-emerald-600"
                  aria-hidden
                />
              ) : (
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                    step.current
                      ? "border-emerald-600 text-emerald-700"
                      : "border-stone-300 text-stone-400"
                  }`}
                >
                  {i + 1}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-900">
                  {step.label}
                </p>
                <p
                  className={`text-xs ${
                    step.done
                      ? "text-emerald-700"
                      : step.current
                        ? "text-stone-600"
                        : "text-stone-400"
                  }`}
                >
                  {step.done
                    ? step.label === "Resume"
                      ? "Created"
                      : "Complete"
                    : step.current
                      ? "Current step"
                      : step.available
                        ? "Available"
                        : "Not yet"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

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

      {/* recent resumes + quick actions */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section aria-labelledby="recent-resumes" className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2
              id="recent-resumes"
              className="text-xs font-semibold tracking-widest text-stone-500 uppercase"
            >
              Recent resumes
            </h2>
            {data.recentResumes.length > 0 && (
              <Link
                href="/candidate/resumes"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View all
              </Link>
            )}
          </div>

          {data.recentResumes.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
              <FileText className="mx-auto size-8 text-stone-300" aria-hidden />
              {state === "ready_no_resume" ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-stone-900">
                    Ready to create your first targeted resume
                  </p>
                  <Link
                    href="/candidate/resumes/new"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    Create resume
                  </Link>
                </>
              ) : state === "needs_profile" ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-stone-900">
                    No resumes yet
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-stone-500">
                    Complete your Career Profile first, then create a targeted
                    resume.
                  </p>
                </>
              ) : null}
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
              {data.recentResumes.map((resume) => (
                <li key={resume.id}>
                  <Link
                    href={`/candidate/resumes/${resume.id}`}
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
                        {resume.targetCountry
                          ? ` · ${resume.targetCountry}`
                          : ""}
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

        <section aria-labelledby="quick-actions">
          <h2
            id="quick-actions"
            className="text-xs font-semibold tracking-widest text-stone-500 uppercase"
          >
            Quick actions
          </h2>
          <div className="mt-4 space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href + action.title}
                href={action.href}
                className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-600/30 hover:shadow-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                  <action.icon className="size-[18px]" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-stone-900">
                      {action.title}
                    </span>
                    <ArrowRight
                      className="size-3.5 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
                    {action.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
