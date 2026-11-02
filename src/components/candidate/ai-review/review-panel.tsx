"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Copy,
  Crosshair,
  ExternalLink,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { candidateReviewResumeAction } from "@/app/candidate/(workspace)/ai-review/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveProfileEditTarget } from "@/lib/ai-review-edit-target";
import {
  JOB_DESCRIPTION_MAX,
  type AiResumeReview,
} from "@/server/ai/resume-review-schema";

import type { QuoteStatus } from "@/components/candidate/ai-review/review-workspace";

const OVERALL_LABELS: Record<AiResumeReview["overall"]["status"], string> = {
  strong_fit: "Strong fit",
  good_foundation: "Good foundation",
  needs_strengthening: "Needs strengthening",
};

const FINDING_LABELS: Record<
  AiResumeReview["findings"][number]["status"],
  string
> = {
  strong: "Strong",
  supporting: "Supporting",
  weak: "Weak",
};

const REVIEW_DIMENSIONS = [
  "Role alignment",
  "Evidence strength",
  "Skills relevance",
  "Clarity and specificity",
  "Achievement evidence",
  "Country presentation",
  "ATS readability",
];

type Finding = AiResumeReview["findings"][number];

type PanelBus = {
  activeBlockId: string | null;
  missingBlock: boolean;
  quoteStatus: QuoteStatus;
  onLocate: (blockId: string, quote: string) => void;
  blockExists: (blockId: string) => boolean;
};

function QuoteNotice({ bus }: { bus: PanelBus }) {
  if (bus.missingBlock) {
    return (
      <p role="alert" className="mt-2 text-xs text-red-600">
        We couldn&apos;t locate this section in the preview.
      </p>
    );
  }
  if (bus.quoteStatus === "not-found") {
    return (
      <p role="status" className="mt-2 text-xs text-stone-500">
        We found the section, but couldn&apos;t mark the exact quoted text.
      </p>
    );
  }
  if (bus.quoteStatus === "unsupported") {
    return (
      <p role="status" className="mt-2 text-xs text-stone-500">
        Exact phrase highlighting isn&apos;t available in this browser.
      </p>
    );
  }
  if (bus.quoteStatus === "ok") {
    return (
      <p className="sr-only" role="status">
        Highlighted quoted text in resume.
      </p>
    );
  }
  return null;
}

function CopyGuidanceButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy guidance"
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-emerald-600"
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-600" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {copied ? "Copied" : "Copy guidance"}
    </button>
  );
}

function FindingCard({
  f,
  index,
  defaultOpen,
  bus,
  selectedRef,
}: {
  f: Finding;
  index: number;
  defaultOpen: boolean;
  bus: PanelBus;
  selectedRef: React.RefObject<HTMLLIElement | null>;
}) {
  const weak = f.status === "weak";
  const active = bus.activeBlockId === f.blockId;
  const editTarget = resolveProfileEditTarget(f.blockId);
  const [userOpen, setUserOpen] = useState(defaultOpen);
  // Selected findings always render expanded; otherwise the
  // candidate's toggle (or the section default) decides.
  const open = userOpen || active;
  const detailsId = `finding-details-${index}`;

  return (
    <li
      ref={active ? selectedRef : undefined}
      className={`scroll-mt-40 rounded-xl border transition-colors ${
        active
          ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/40"
          : weak
            ? "border-amber-600/30"
            : "border-stone-200"
      }`}
    >
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {weak ? (
            <AlertCircle
              className="size-4 shrink-0 text-amber-600"
              aria-hidden
            />
          ) : (
            <CheckCircle2
              className="size-4 shrink-0 text-emerald-600"
              aria-hidden
            />
          )}
          <Badge
            variant={weak ? "destructive" : "secondary"}
            className={
              weak ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""
            }
          >
            {FINDING_LABELS[f.status]}
          </Badge>
          <span className="text-xs font-medium text-stone-500 capitalize">
            {f.dimension.replaceAll("_", " ")}
          </span>
          {bus.blockExists(f.blockId) ? (
            <button
              type="button"
              aria-pressed={active}
              aria-label={`View finding in resume: ${f.dimension.replaceAll("_", " ")}`}
              onClick={() => bus.onLocate(f.blockId, f.quote)}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <Crosshair className="size-3.5" aria-hidden />
              {active ? "Viewing in resume" : "View in resume"}
            </button>
          ) : (
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-xs text-stone-400">
              <Crosshair className="size-3.5" aria-hidden />
              Not shown in preview
            </span>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            aria-label={open ? "Collapse finding" : "Expand finding"}
            onClick={() => setUserOpen((v) => !v)}
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>
        {!open && (
          <p className="mt-2 line-clamp-1 text-sm text-stone-600 italic">
            &ldquo;{f.quote}&rdquo;
          </p>
        )}
        {open && (
          <div id={detailsId}>
            {active && <QuoteNotice bus={bus} />}
            <p className="mt-3 text-xs font-semibold tracking-wide text-stone-500 uppercase">
              What we found
            </p>
            <blockquote className="mt-1.5 rounded-md border-l-2 border-emerald-600/40 bg-stone-50 py-1.5 pl-3 text-sm leading-relaxed text-stone-600 italic">
              {f.quote}
            </blockquote>
            <div className="mt-4 grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                  Why it matters
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-stone-800">
                  {f.reason}
                </p>
              </div>
              {f.guidance ? (
                <div>
                  <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                    How to improve
                  </p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
                    {f.guidance}
                  </p>
                </div>
              ) : null}
            </div>
            {(editTarget || f.guidance) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-stone-100 pt-3">
                {editTarget && (
                  <Link
                    href={editTarget.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Opens in a new tab so your review stays here"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    Edit Career Profile
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Link>
                )}
                {f.guidance && <CopyGuidanceButton text={f.guidance} />}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function SectionAccordion({
  id,
  icon,
  title,
  description,
  count,
  countLabel,
  accent,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  countLabel: string;
  accent: "emerald" | "amber" | "slate" | "mint";
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const tone = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-stone-100 text-stone-600",
    mint: "bg-teal-50 text-teal-700",
  }[accent];

  return (
    <section aria-labelledby={`${id}-label`} className="scroll-mt-40">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center gap-3.5 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-emerald-600/30 focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        <span
          aria-hidden
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span
            id={`${id}-label`}
            className="block text-base font-bold tracking-tight text-stone-900"
          >
            {title}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
            {description}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-stone-500">
          {count} {countLabel}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div id={id} className="mt-3 space-y-3">
          {children}
        </div>
      )}
    </section>
  );
}

export function CandidateAiReviewPanel({
  variantId,
  targetRole,
  targetCountry,
  activeBlockId,
  missingBlock,
  quoteStatus,
  blockExists,
  onLocate,
  onNewResult,
  onReviewReady,
  onPendingChange,
}: {
  variantId: string;
  targetRole: string;
  targetCountry: string;
  activeBlockId: string | null;
  missingBlock: boolean;
  quoteStatus: QuoteStatus;
  blockExists: (blockId: string) => boolean;
  onLocate: (blockId: string, quote: string) => void;
  onNewResult: () => void;
  onReviewReady: (review: AiResumeReview) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [review, setReview] = useState<AiResumeReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [dimFilter, setDimFilter] = useState<string>("");
  const [jdText, setJdText] = useState("");
  const [jdUsed, setJdUsed] = useState(false);
  const selectedRef = useRef<HTMLLIElement>(null);

  function onReview() {
    if (isPending) return;
    setError(null);
    setReview(null);
    setOpenSections({});
    setDimFilter("");
    onNewResult();
    onPendingChange(true);
    const jd = jdText.trim();
    startTransition(async () => {
      try {
        const result = await candidateReviewResumeAction({
          variantId,
          jobDescription: jd || undefined,
        });
        if (result.success) {
          setReview(result.review);
          setJdUsed(Boolean(jd));
          onReviewReady(result.review);
          // Default: first meaningful group open — usually What's working.
          const working = result.review.findings.some(
            (f) => f.status !== "weak",
          );
          const weak_ = result.review.findings.some((f) => f.status === "weak");
          const gaps = result.review.gaps.length > 0;
          setOpenSections({
            working: working,
            weak: !working && weak_,
            gaps: !working && !weak_ && gaps,
            recs: !working && !weak_ && !gaps,
          });
        } else {
          setError(result.message);
        }
      } catch {
        setError("We couldn't complete this review. Please try again.");
      } finally {
        onPendingChange(false);
      }
    });
  }

  // Bring the selected finding card into view when a resume marker (or a
  // previous View in resume) changes the active block.
  useEffect(() => {
    if (!activeBlockId || !selectedRef.current) return;
    selectedRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeBlockId]);

  const dimensionsPresent = review
    ? [...new Set(review.findings.map((f) => f.dimension))]
    : [];
  const visibleFindings =
    review && dimFilter
      ? review.findings.filter((f) => f.dimension === dimFilter)
      : (review?.findings ?? []);
  const working = visibleFindings.filter((f) => f.status !== "weak");
  const weak = visibleFindings.filter((f) => f.status === "weak");
  const gaps = review?.gaps ?? [];
  // Recommendations derive from the review's own guidance text — weak
  // findings first, then gaps — deduped and unchanged.
  // Recommendations derive from the review's own guidance text — weak
  // findings first, then gaps — deduped and unchanged. Based on ALL weak
  // findings regardless of the dimension filter (guidance isn't
  // dimension-typed for gaps).
  const recommendations = review
    ? [
        ...new Set(
          [
            ...review.findings
              .filter((f) => f.status === "weak")
              .map((f) => f.guidance),
            ...gaps.map((g) => g.guidance),
          ]
            .filter((g): g is string => Boolean(g?.trim()))
            .map((g) => g.trim()),
        ),
      ]
    : [];

  const takeawaysPositive = (review?.findings ?? [])
    .filter((f) => f.status !== "weak")
    .slice(0, 3);
  const takeawaysImprove = [
    ...(review?.findings ?? [])
      .filter((f) => f.status === "weak")
      .map((f) => ({ key: `f-${f.blockId}`, text: f.reason })),
    ...gaps.map((g, i) => ({ key: `g-${i}`, text: g.reason })),
  ].slice(0, 3);

  const nav = [
    {
      id: "sec-working",
      label: "What's working",
      count: working.length,
      icon: <CheckCircle2 className="size-3.5" aria-hidden />,
    },
    {
      id: "sec-weak",
      label: "Improve",
      count: weak.length,
      icon: <AlertCircle className="size-3.5" aria-hidden />,
    },
    {
      id: "sec-gaps",
      label: "Missing",
      count: gaps.length,
      icon: <CircleDot className="size-3.5" aria-hidden />,
    },
    {
      id: "sec-recs",
      label: "Recommendations",
      count: recommendations.length,
      icon: <Lightbulb className="size-3.5" aria-hidden />,
    },
  ].filter((s) => s.count > 0);

  const sectionKey: Record<string, string> = {
    "sec-working": "working",
    "sec-weak": "weak",
    "sec-gaps": "gaps",
    "sec-recs": "recs",
  };

  function jumpTo(id: string) {
    const key = sectionKey[id];
    if (key) setOpenSections((s) => ({ ...s, [key]: true }));
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const bus: PanelBus = {
    activeBlockId,
    missingBlock,
    quoteStatus,
    onLocate,
    blockExists,
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-stone-900">AI Review</h2>
        {review && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setReview(null);
                setError(null);
                onNewResult();
              }}
            >
              Edit inputs
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReview}
              disabled={isPending}
            >
              <Sparkles className="size-4" aria-hidden />
              {isPending ? "Reviewing…" : "Run new review"}
            </Button>
          </div>
        )}
      </div>

      {isPending && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 space-y-2 rounded-xl border border-emerald-600/20 bg-emerald-50/50 p-5"
        >
          <div className="flex items-center gap-2">
            <span className="rr-scan-dot" aria-hidden />
            <p className="text-sm font-semibold text-stone-900">
              Reviewing your resume
            </p>
          </div>
          <p className="text-sm text-stone-600">
            <span className="font-medium text-stone-700">
              {targetRole} · {targetCountry}
            </span>
          </p>
          <p className="text-sm leading-relaxed text-stone-500">
            This may take a few minutes. This review runs only because you
            requested it.
          </p>
        </div>
      )}

      {!review && !isPending && (
        <div className="mt-4 space-y-5">
          <p className="text-[15px] leading-relaxed text-stone-600">
            Review this saved resume against:{" "}
            <span className="font-medium text-stone-800">
              {targetRole} · {targetCountry}
            </span>
          </p>
          <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-4">
            <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
              We&apos;ll examine
            </p>
            <ul className="mt-2.5 grid gap-x-4 gap-y-1.5 text-sm text-stone-700 sm:grid-cols-2">
              {REVIEW_DIMENSIONS.map((d) => (
                <li key={d} className="flex items-center gap-2">
                  <CircleDot
                    className="size-3 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label
              htmlFor="job-description-input"
              className="text-sm font-semibold text-stone-900"
            >
              Job description{" "}
              <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <textarea
              id="job-description-input"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              maxLength={JOB_DESCRIPTION_MAX}
              rows={6}
              placeholder="Paste the job posting here…"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-stone-800 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-emerald-600"
            />
            <div className="mt-1.5 flex items-start justify-between gap-3">
              <p className="text-xs leading-relaxed text-stone-500">
                Paste a real job posting to review against its stated
                requirements — not just your target role.
              </p>
              <p className="shrink-0 text-xs text-stone-400 tabular-nums">
                {jdText.length}/{JOB_DESCRIPTION_MAX}
              </p>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <div>
            <p className="mb-2 text-xs font-semibold text-stone-500">
              {jdText.trim()
                ? "Review against your job description"
                : "Review for your target role"}
            </p>
            <Button
              type="button"
              onClick={onReview}
              disabled={isPending}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              <Sparkles className="size-4" aria-hidden />
              {isPending ? "Reviewing…" : "Review with AI"}
            </Button>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Runs only when you request it. This may take a few minutes. Review
              results are temporary and are not saved yet.
            </p>
          </div>
        </div>
      )}

      {review && (
        <div className="mt-5">
          {/* overview + key takeaways */}
          <section
            aria-labelledby="review-overview"
            className="grid gap-4 rounded-xl border border-emerald-600/20 bg-emerald-50/40 p-5 xl:grid-cols-[3fr_2fr]"
          >
            <div>
              <p
                id="review-overview"
                className="text-xs font-semibold tracking-widest text-emerald-700 uppercase"
              >
                Overview
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-stone-900">
                {OVERALL_LABELS[review.overall.status]}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-stone-500">
                Reviewed against: {targetRole} · {targetCountry}
                {jdUsed ? " · your job description" : ""}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-stone-700">
                {review.overall.summary}
              </p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-stone-500">
                <span>{review.findings.length} findings</span>
                <span>{gaps.length} gaps</span>
                <span>{recommendations.length} recommendations</span>
              </p>
            </div>
            <div className="rounded-lg border border-emerald-600/15 bg-white/80 p-4">
              <p className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
                Key takeaways
              </p>
              <ul className="mt-3 space-y-2.5">
                {takeawaysPositive.map((f, i) => (
                  <li key={`p-${i}`} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    <p className="line-clamp-2 text-sm leading-snug text-stone-700">
                      {f.reason}
                    </p>
                  </li>
                ))}
                {takeawaysImprove.map((t) => (
                  <li key={t.key} className="flex items-start gap-2">
                    <AlertCircle
                      className="mt-0.5 size-4 shrink-0 text-amber-600"
                      aria-hidden
                    />
                    <p className="line-clamp-2 text-sm leading-snug text-stone-700">
                      {t.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* section navigation */}
          {nav.length > 0 && (
            <nav
              aria-label="Review sections"
              className="sticky top-14 z-10 -mx-5 mt-4 border-y border-stone-100 bg-white/95 px-5 py-2.5 backdrop-blur-sm lg:top-4 lg:-mx-6 lg:px-6"
            >
              <div className="flex flex-wrap gap-2">
                {nav.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => jumpTo(s.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                      openSections[sectionKey[s.id]]
                        ? "border-emerald-600/40 bg-emerald-50 text-emerald-800"
                        : "border-stone-200 bg-white text-stone-700 hover:border-emerald-600/30 hover:text-emerald-800"
                    }`}
                  >
                    {s.icon}
                    {s.label}
                    <span className="rounded-full bg-stone-100 px-1.5 text-[11px] font-bold text-stone-500">
                      {s.count}
                    </span>
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* dimension filter — only real dimensions present in results */}
          {dimensionsPresent.length > 1 && (
            <div className="mt-4 flex items-center gap-2">
              <label
                htmlFor="finding-dimension-filter"
                className="text-xs font-semibold text-stone-500"
              >
                Filter by dimension
              </label>
              <select
                id="finding-dimension-filter"
                value={dimFilter}
                onChange={(e) => setDimFilter(e.target.value)}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 capitalize focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                <option value="">All dimensions</option>
                {dimensionsPresent.map((d) => (
                  <option key={d} value={d}>
                    {d.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              {dimFilter && (
                <span className="text-xs text-stone-400">
                  {visibleFindings.length} of {review.findings.length} findings
                </span>
              )}
            </div>
          )}

          <div className="mt-5 space-y-4">
            {working.length > 0 && (
              <SectionAccordion
                id="sec-working"
                icon={<CheckCircle2 className="size-5" aria-hidden />}
                title="What's working"
                description="Strong aspects that align well with your target role."
                count={working.length}
                countLabel={working.length === 1 ? "finding" : "findings"}
                accent="emerald"
                open={Boolean(openSections.working)}
                onToggle={() =>
                  setOpenSections((s) => ({ ...s, working: !s.working }))
                }
              >
                {working.map((f, i) => (
                  <FindingCard
                    key={`w-${i}`}
                    f={f}
                    index={i}
                    defaultOpen={i === 0}
                    bus={bus}
                    selectedRef={selectedRef}
                  />
                ))}
              </SectionAccordion>
            )}

            {weak.length > 0 && (
              <SectionAccordion
                id="sec-weak"
                icon={<AlertCircle className="size-5" aria-hidden />}
                title="Needs strengthening"
                description="Areas that could be more specific or better demonstrated."
                count={weak.length}
                countLabel={weak.length === 1 ? "finding" : "findings"}
                accent="amber"
                open={Boolean(openSections.weak)}
                onToggle={() =>
                  setOpenSections((s) => ({ ...s, weak: !s.weak }))
                }
              >
                {weak.map((f, i) => (
                  <FindingCard
                    key={`s-${i}`}
                    f={f}
                    index={i}
                    defaultOpen={false}
                    bus={bus}
                    selectedRef={selectedRef}
                  />
                ))}
              </SectionAccordion>
            )}

            {gaps.length > 0 && (
              <SectionAccordion
                id="sec-gaps"
                icon={<CircleDot className="size-5" aria-hidden />}
                title="Missing evidence"
                description="Signals this resume doesn't show — not proof you lack them."
                count={gaps.length}
                countLabel={gaps.length === 1 ? "gap" : "gaps"}
                accent="slate"
                open={Boolean(openSections.gaps)}
                onToggle={() =>
                  setOpenSections((s) => ({ ...s, gaps: !s.gaps }))
                }
              >
                {gaps.map((g, i) => (
                  <li
                    key={i}
                    className="list-none rounded-xl border border-dashed border-stone-300 bg-stone-50/60 p-4"
                  >
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-stone-600 uppercase">
                      <CircleDot
                        className="size-3.5 text-stone-400"
                        aria-hidden
                      />
                      {g.category.replaceAll("_", " ")}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                          Why it matters
                        </p>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-800">
                          {g.reason}
                        </p>
                      </div>
                      {g.guidance && (
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                            What you could add
                          </p>
                          <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
                            {g.guidance}
                          </p>
                          <CopyGuidanceButton text={g.guidance} />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </SectionAccordion>
            )}

            {recommendations.length > 0 && (
              <SectionAccordion
                id="sec-recs"
                icon={<Lightbulb className="size-5" aria-hidden />}
                title="Recommendations"
                description="Focused next improvements suggested by this review."
                count={recommendations.length}
                countLabel={
                  recommendations.length === 1
                    ? "recommendation"
                    : "recommendations"
                }
                accent="mint"
                open={Boolean(openSections.recs)}
                onToggle={() =>
                  setOpenSections((s) => ({ ...s, recs: !s.recs }))
                }
              >
                {recommendations.map((r, i) => (
                  <li
                    key={i}
                    className="flex list-none items-start gap-3 rounded-xl border border-stone-200 bg-white p-4"
                  >
                    <Lightbulb
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    <p className="text-[15px] leading-relaxed text-stone-700">
                      {r}
                    </p>
                  </li>
                ))}
              </SectionAccordion>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
