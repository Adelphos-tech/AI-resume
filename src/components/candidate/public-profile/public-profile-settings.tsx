"use client";

import { Check, Copy, ExternalLink, Globe, Link2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  createPublicProfileAction,
  publishPublicProfileAction,
  unpublishPublicProfileAction,
  updateSlugAction,
} from "@/app/candidate/(workspace)/public-profile/actions";
import { Button } from "@/components/ui/button";

export function PublicProfileSettings({
  slug,
  isPublished,
  shareUrl,
  publicUrl,
}: {
  slug: string | null;
  isPublished: boolean;
  /** Permanent NFC/share URL, e.g. https://origin/n/<token>. */
  shareUrl: string | null;
  /** Current public URL, e.g. /u/<slug> — null until created. */
  publicUrl: string | null;
}) {
  const [slugValue, setSlugValue] = useState(slug ?? "");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(fn: () => Promise<{ success: boolean; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.success) setError(r.message ?? "Something went wrong.");
    });
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  /* ---------- not yet created ---------- */
  if (!slug) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold text-stone-900">
          Create your Public Profile
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          This creates your public profile and its permanent share link. You can
          publish and customize it later.
        </p>
        <Button
          type="button"
          onClick={() => run(createPublicProfileAction)}
          disabled={isPending}
          className="mt-4 bg-emerald-700 hover:bg-emerald-800"
        >
          <Globe className="size-4" aria-hidden />
          {isPending ? "Creating…" : "Create Public Profile"}
        </Button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* public profile card */}
      <section
        aria-labelledby="pp-profile"
        className="rounded-2xl border border-stone-200 bg-white p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="pp-profile"
              className="text-base font-semibold text-stone-900"
            >
              Public profile
            </h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-stone-600">
              Status:{" "}
              {isPublished ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <Check className="size-3" aria-hidden /> Published
                </span>
              ) : (
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
                  Not published
                </span>
              )}
            </p>
          </div>
          {isPublished ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => run(unpublishPublicProfileAction)}
              disabled={isPending}
            >
              {isPending ? "Updating…" : "Unpublish profile"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => run(publishPublicProfileAction)}
              disabled={isPending}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              <Globe className="size-4" aria-hidden />
              {isPending ? "Publishing…" : "Publish profile"}
            </Button>
          )}
        </div>

        <div className="mt-5">
          <label
            htmlFor="pp-slug"
            className="text-xs font-semibold tracking-wide text-stone-500 uppercase"
          >
            Public URL
          </label>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-stone-200 focus-within:ring-2 focus-within:ring-emerald-600/30">
              <span className="pl-3 text-sm text-stone-400">/u/</span>
              <input
                id="pp-slug"
                type="text"
                value={slugValue}
                onChange={(e) => setSlugValue(e.target.value)}
                className="min-w-0 flex-1 rounded-r-lg bg-transparent px-1.5 py-2 text-sm font-medium text-stone-900 outline-none"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => run(() => updateSlugAction(slugValue))}
              disabled={isPending || slugValue.trim().toLowerCase() === slug}
            >
              Save
            </Button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
            Lowercase letters, numbers, and hyphens. Changing this does not
            affect your permanent Career Card link below.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Preview public profile
          </Link>
        )}
      </section>

      {/* permanent card link */}
      {shareUrl && (
        <section
          aria-labelledby="pp-card-link"
          className="rounded-2xl border border-stone-200 bg-white p-6"
        >
          <h2
            id="pp-card-link"
            className="flex items-center gap-2 text-base font-semibold text-stone-900"
          >
            <Link2 className="size-4 text-emerald-700" aria-hidden />
            Career Card Link
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
            Use this permanent link for your NFC card or QR code. You can update
            your public profile later without changing this link.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700">
              {shareUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              aria-live="polite"
            >
              <Copy className="size-3.5" aria-hidden />
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(shareUrl, "_blank", "noreferrer")}
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Open link
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
