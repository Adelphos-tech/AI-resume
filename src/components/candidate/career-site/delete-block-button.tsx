"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { deleteCareerSiteBlockAction } from "@/app/candidate/(workspace)/career-site/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteBlockButton({
  pageId,
  blockId,
}: {
  pageId: string;
  blockId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteCareerSiteBlockAction(pageId, blockId);
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="-mr-2 h-7 text-red-600 hover:text-red-700"
      >
        <Trash2 className="size-3.5" aria-hidden />
        Delete
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-base font-semibold text-stone-900">
            Delete block?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-sm text-stone-500">
            This block will be permanently removed from this page.
          </AlertDialogDescription>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialogCancel asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={(e) => {
                  // Keep the dialog open until the server result returns so a
                  // failure doesn't pretend the block was deleted.
                  e.preventDefault();
                  confirmDelete();
                }}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isPending ? "Deleting…" : "Delete block"}
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
