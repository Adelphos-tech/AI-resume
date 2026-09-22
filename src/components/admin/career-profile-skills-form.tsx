"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Control, useFieldArray, useForm } from "react-hook-form";

import { updateSkillsAction } from "@/app/admin/candidates/[id]/career-profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  masterCareerProfileSkillsSchema,
  type MasterCareerProfileSkillGroup,
} from "@/lib/master-career-profile-schema";

// RHF field arrays require object items — keywords edit as { value }
// rows and convert back to string[] on submit.
type KeywordValue = { value: string };

type SkillGroupFormEntry = {
  id: string;
  name: string;
  keywords: KeywordValue[];
};

type SkillsFormValues = { skills: SkillGroupFormEntry[] };

function toFormEntry(g: MasterCareerProfileSkillGroup): SkillGroupFormEntry {
  return {
    id: g.id,
    name: g.name,
    keywords: g.keywords.map((value) => ({ value })),
  };
}

function newGroup(): SkillGroupFormEntry {
  return { id: crypto.randomUUID(), name: "", keywords: [] };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function KeywordsEditor({
  control,
  register,
  groupIndex,
}: {
  control: Control<SkillsFormValues>;
  register: ReturnType<typeof useForm<SkillsFormValues>>["register"];
  groupIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `skills.${groupIndex}.keywords`,
    keyName: "_key",
  });
  const inputId = `skills-${groupIndex}-kw-new`;

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-2">
        {fields.map((field, kIndex) => (
          <li
            key={field._key}
            className="flex items-center gap-1 rounded-md border px-2 py-1"
          >
            <Label
              htmlFor={`skills-${groupIndex}-kw-${kIndex}`}
              className="sr-only"
            >
              Keyword {kIndex + 1}
            </Label>
            <Input
              id={`skills-${groupIndex}-kw-${kIndex}`}
              className="h-7 w-36 border-0 px-1 shadow-none focus-visible:ring-0"
              {...register(`skills.${groupIndex}.keywords.${kIndex}.value`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              aria-label={`Remove keyword ${kIndex + 1} from group ${groupIndex + 1}`}
              onClick={() => remove(kIndex)}
            >
              <X aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <Label htmlFor={inputId} className="sr-only">
          New keyword for group {groupIndex + 1}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: "" })}
        >
          <Plus aria-hidden="true" />
          Add keyword
        </Button>
      </div>
    </div>
  );
}

export function CareerProfileSkillsForm({
  candidateId,
  initialSkills,
}: {
  candidateId: string;
  initialSkills: MasterCareerProfileSkillGroup[];
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
  } = useForm<SkillsFormValues>({
    defaultValues: { skills: initialSkills.map(toFormEntry) },
  });

  // keyName "_key" keeps RHF's render keys off the canonical skills[].id.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
    keyName: "_key",
  });

  const submitting = isSubmitting || isPending;

  function onSubmit(values: SkillsFormValues) {
    setFeedback(null);

    const payload = values.skills.map((g) => ({
      ...g,
      keywords: g.keywords.map((k) => k.value),
    }));
    const parsed = masterCareerProfileSkillsSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const [index, field] = issue.path;
        if (typeof index === "number") {
          const target = typeof field === "string" ? field : "name";
          setError(`skills.${index}.${target}` as never, {
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
        const result = await updateSkillsAction(candidateId, payload);
        if (result.success) {
          setFeedback({ kind: "success", message: "Skills saved." });
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save skills. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {fields.map((field, index) => {
        const idBase = `skills-${index}`;
        const entryErrors = errors.skills?.[index];
        return (
          <section key={field._key} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium">Skill group {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove skill group ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden="true" />
                Remove skill group
              </Button>
            </div>

            <div className="max-w-md space-y-2">
              <Label htmlFor={`${idBase}-name`}>Group name</Label>
              <Input
                id={`${idBase}-name`}
                placeholder="Product Management"
                aria-invalid={!!entryErrors?.name}
                aria-describedby={`${idBase}-name-error`}
                {...register(`skills.${index}.name`)}
              />
              <FieldError
                id={`${idBase}-name-error`}
                message={entryErrors?.name?.message}
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Keywords</legend>
              <KeywordsEditor
                control={control}
                register={register}
                groupIndex={index}
              />
            </fieldset>
          </section>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newGroup())}
        >
          <Plus aria-hidden="true" />
          Add skill group
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save skills"}
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
