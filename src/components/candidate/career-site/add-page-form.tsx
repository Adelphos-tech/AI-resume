"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { createCareerSitePageAction } from "@/app/candidate/(workspace)/career-site/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddPageForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCareerSitePageAction({ title });
      if (result.success) {
        setTitle("");
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title (e.g. About)"
          maxLength={200}
          disabled={isPending}
          aria-label="Page title"
          className="sm:max-w-xs"
        />
        <Button type="submit" disabled={isPending || !title.trim()}>
          <Plus className="size-4" aria-hidden />
          {isPending ? "Adding…" : "Add page"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
