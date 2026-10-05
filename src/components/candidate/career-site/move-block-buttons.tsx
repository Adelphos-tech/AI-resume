"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { reorderCareerSiteBlocksAction } from "@/app/candidate/(workspace)/career-site/actions";
import { Button } from "@/components/ui/button";
import { moveBlock } from "@/lib/career-site-blocks";

export function MoveBlockButtons({
  pageId,
  orderIds,
  index,
}: {
  pageId: string;
  /** Complete ordered id list of this page's blocks, in rendered order. */
  orderIds: string[];
  /** Rendered index of the block these controls act on. */
  index: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canUp = index > 0;
  const canDown = index < orderIds.length - 1;

  function move(direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      // Submit the complete ordered id list after the neighbor swap;
      // the domain validates the exact set and rewrites positions.
      const result = await reorderCareerSiteBlocksAction(pageId, {
        blockIds: moveBlock(orderIds, index, direction),
      });
      if (result.success) {
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <span className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Move block up"
        title="Move block up"
        disabled={!canUp || isPending}
        onClick={() => move("up")}
        className="h-7 w-7 text-stone-500"
      >
        <ArrowUp className="size-3.5" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Move block down"
        title="Move block down"
        disabled={!canDown || isPending}
        onClick={() => move("down")}
        className="h-7 w-7 text-stone-500"
      >
        <ArrowDown className="size-3.5" aria-hidden />
      </Button>
      {error ? (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </span>
  );
}
