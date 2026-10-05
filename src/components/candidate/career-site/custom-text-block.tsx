"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";

import { updateCustomTextBlockAction } from "@/app/candidate/(workspace)/career-site/actions";
import { DeleteBlockButton } from "@/components/candidate/career-site/delete-block-button";
import { MoveBlockButtons } from "@/components/candidate/career-site/move-block-buttons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  pageId: string;
  blockId: string;
  /** Ordinal display label, e.g. "Block 2". */
  ordinal: string;
  /** Validated server-side text, or null when content is uninitialized. */
  initialText: string | null;
  /** True when persisted content exists but is malformed. */
  invalid: boolean;
  /** Complete ordered id list of this page's blocks. */
  orderIds: string[];
  /** Rendered index of this block within orderIds. */
  orderIndex: number;
};

export function CustomTextBlock({
  pageId,
  blockId,
  ordinal,
  initialText,
  invalid,
  orderIds,
  orderIndex,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openEditor() {
    setDraft(invalid ? "" : (initialText ?? ""));
    setError(null);
    setEditing(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateCustomTextBlockAction(pageId, blockId, {
        text: draft,
      });
      if (result.success) {
        setEditing(false);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold text-stone-900">
          Custom text
        </span>
        {editing ? (
          <span className="shrink-0 text-xs text-stone-400">{ordinal}</span>
        ) : (
          <span className="flex shrink-0 items-center gap-2">
            <MoveBlockButtons
              pageId={pageId}
              orderIds={orderIds}
              index={orderIndex}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openEditor}
              className="h-7 text-stone-500"
            >
              <Pencil className="size-3.5" aria-hidden />
              Edit
            </Button>
            <DeleteBlockButton pageId={pageId} blockId={blockId} />
            <span className="text-xs text-stone-400">{ordinal}</span>
          </span>
        )}
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={20000}
            rows={6}
            autoFocus
            disabled={isPending}
            className="bg-white"
            placeholder="Write text for this section…"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={save} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-1.5 whitespace-pre-wrap text-sm text-stone-600">
          {invalid
            ? "Content unavailable."
            : initialText === null || initialText === ""
              ? "No text added yet."
              : initialText}
        </p>
      )}
    </div>
  );
}
