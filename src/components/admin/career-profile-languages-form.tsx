"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { updateLanguagesAction } from "@/app/admin/candidates/[id]/career-profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  masterCareerProfileLanguagesSchema,
  type MasterCareerProfileLanguageEntry,
} from "@/lib/master-career-profile-schema";

type LanguageFormEntry = {
  id: string;
  language: string;
  fluency: string;
};

type LanguagesFormValues = { languages: LanguageFormEntry[] };

function toFormEntry(l: MasterCareerProfileLanguageEntry): LanguageFormEntry {
  return { id: l.id, language: l.language, fluency: l.fluency ?? "" };
}

function newEntry(): LanguageFormEntry {
  return { id: crypto.randomUUID(), language: "", fluency: "" };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function CareerProfileLanguagesForm({
  candidateId,
  initialLanguages,
}: {
  candidateId: string;
  initialLanguages: MasterCareerProfileLanguageEntry[];
}) {
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LanguagesFormValues>({
    defaultValues: { languages: initialLanguages.map(toFormEntry) },
  });

  // keyName "_key" keeps RHF's render keys off the canonical id.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
    keyName: "_key",
  });

  const submitting = isSubmitting || isPending;

  function onSubmit(values: LanguagesFormValues) {
    setFeedback(null);

    const parsed = masterCareerProfileLanguagesSchema.safeParse(
      values.languages,
    );
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const [index, field] = issue.path;
        if (typeof index === "number") {
          const target = typeof field === "string" ? field : "language";
          setError(`languages.${index}.${target}` as never, {
            type: "server",
            message: issue.message,
          });
        }
      }
      setFeedback({
        kind: "error",
        message: "Some fields are invalid. Please review them.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateLanguagesAction(
          candidateId,
          values.languages,
        );
        if (result.success) {
          setFeedback({ kind: "success", message: "Languages saved." });
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save languages. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {fields.map((field, index) => {
        const idBase = `lang-${index}`;
        const entryErrors = errors.languages?.[index];
        return (
          <div
            key={field._key}
            className="flex flex-wrap items-end gap-4 rounded-lg border p-4"
          >
            <div className="min-w-40 flex-1 space-y-2">
              <Label htmlFor={`${idBase}-language`}>Language</Label>
              <Input
                id={`${idBase}-language`}
                placeholder="English"
                aria-invalid={!!entryErrors?.language}
                aria-describedby={`${idBase}-language-error`}
                {...register(`languages.${index}.language`)}
              />
              <FieldError
                id={`${idBase}-language-error`}
                message={entryErrors?.language?.message}
              />
            </div>
            <div className="min-w-40 flex-1 space-y-2">
              <Label htmlFor={`${idBase}-fluency`}>Fluency</Label>
              <Input
                id={`${idBase}-fluency`}
                placeholder="Professional"
                {...register(`languages.${index}.fluency`)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove language ${index + 1}`}
              onClick={() => remove(index)}
            >
              <Trash2 aria-hidden="true" />
              Remove language
            </Button>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newEntry())}
        >
          <Plus aria-hidden="true" />
          Add language
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save languages"}
        </Button>
        {feedback && (
          <p
            role={feedback.kind === "error" ? "alert" : "status"}
            className={`text-sm ${feedback.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </form>
  );
}
