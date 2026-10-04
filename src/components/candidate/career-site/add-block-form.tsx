"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LayoutPanelTop, Plus, Type } from "lucide-react";

import { createCareerSiteBlockAction } from "@/app/candidate/(workspace)/career-site/actions";
import { Button } from "@/components/ui/button";

const CHOICES = [
  {
    type: "HERO" as const,
    label: "Hero",
    description: "Primary introduction section",
    icon: LayoutPanelTop,
  },
  {
    type: "CUSTOM_TEXT" as const,
    label: "Custom text",
    description: "Flexible text section",
    icon: Type,
  },
];

export function AddBlockForm({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function create(type: "HERO" | "CUSTOM_TEXT") {
    setError(null);
    startTransition(async () => {
      const result = await createCareerSiteBlockAction(pageId, { type });
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="mt-3"
      >
        <Plus className="size-4" aria-hidden />
        Add block
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {CHOICES.map((choice) => (
          <button
            key={choice.type}
            type="button"
            disabled={isPending}
            onClick={() => create(choice.type)}
            className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-left transition-colors hover:border-emerald-600/40 hover:bg-emerald-50/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <choice.icon
              className="mt-0.5 size-4 shrink-0 text-emerald-700"
              aria-hidden
            />
            <span>
              <span className="block text-sm font-semibold text-stone-900">
                {choice.label}
              </span>
              <span className="block text-xs text-stone-500">
                {choice.description}
              </span>
            </span>
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs font-medium text-stone-500 hover:text-stone-900"
      >
        Cancel
      </button>
    </div>
  );
}
