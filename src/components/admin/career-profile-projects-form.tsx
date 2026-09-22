"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Control, useFieldArray, useForm } from "react-hook-form";

import { updateProjectsAction } from "@/app/admin/candidates/[id]/career-profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  masterCareerProfileProjectsSchema,
  type MasterCareerProfileProjectEntry,
} from "@/lib/master-career-profile-schema";

// RHF field arrays require object items — highlights edit as { value }
// rows and convert back to string[] on submit.
type HighlightValue = { value: string };

type ProjectFormEntry = {
  id: string;
  name: string;
  description: string;
  url: string;
  startDate: string;
  endDate: string;
  highlights: HighlightValue[];
};

type ProjectsFormValues = { projects: ProjectFormEntry[] };

function toFormEntry(p: MasterCareerProfileProjectEntry): ProjectFormEntry {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    url: p.url ?? "",
    startDate: p.startDate ?? "",
    endDate: p.endDate ?? "",
    highlights: p.highlights.map((value) => ({ value })),
  };
}

function newEntry(): ProjectFormEntry {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    url: "",
    startDate: "",
    endDate: "",
    highlights: [],
  };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function HighlightsEditor({
  control,
  register,
  projectIndex,
}: {
  control: Control<ProjectsFormValues>;
  register: ReturnType<typeof useForm<ProjectsFormValues>>["register"];
  projectIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `projects.${projectIndex}.highlights`,
    keyName: "_key",
  });

  return (
    <div className="space-y-2">
      {fields.map((field, hIndex) => (
        <div key={field._key} className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <Label
              htmlFor={`proj-${projectIndex}-hl-${hIndex}`}
              className="sr-only"
            >
              Highlight {hIndex + 1}
            </Label>
            <Input
              id={`proj-${projectIndex}-hl-${hIndex}`}
              placeholder="Built a public analytics dashboard"
              {...register(
                `projects.${projectIndex}.highlights.${hIndex}.value`,
              )}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove highlight ${hIndex + 1} from project ${projectIndex + 1}`}
            onClick={() => remove(hIndex)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ value: "" })}
      >
        <Plus aria-hidden="true" />
        Add highlight
      </Button>
    </div>
  );
}

export function CareerProfileProjectsForm({
  candidateId,
  initialProjects,
}: {
  candidateId: string;
  initialProjects: MasterCareerProfileProjectEntry[];
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
  } = useForm<ProjectsFormValues>({
    defaultValues: { projects: initialProjects.map(toFormEntry) },
  });

  // keyName "_key" keeps RHF's render keys off the canonical projects[].id.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
    keyName: "_key",
  });

  const submitting = isSubmitting || isPending;

  function onSubmit(values: ProjectsFormValues) {
    setFeedback(null);

    const payload = values.projects.map((p) => ({
      ...p,
      highlights: p.highlights.map((h) => h.value),
    }));
    const parsed = masterCareerProfileProjectsSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const [index, field] = issue.path;
        if (typeof index === "number") {
          const target = typeof field === "string" ? field : "endDate";
          setError(`projects.${index}.${target}` as never, {
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
        const result = await updateProjectsAction(candidateId, payload);
        if (result.success) {
          setFeedback({ kind: "success", message: "Projects saved." });
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save projects. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {fields.map((field, index) => {
        const idBase = `proj-${index}`;
        const entryErrors = errors.projects?.[index];
        return (
          <section key={field._key} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Project {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove project ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden="true" />
                Remove project
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-name`}>Name</Label>
                <Input
                  id={`${idBase}-name`}
                  aria-invalid={!!entryErrors?.name}
                  aria-describedby={`${idBase}-name-error`}
                  {...register(`projects.${index}.name`)}
                />
                <FieldError
                  id={`${idBase}-name-error`}
                  message={entryErrors?.name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-url`}>URL</Label>
                <Input
                  id={`${idBase}-url`}
                  type="url"
                  placeholder="https://"
                  aria-invalid={!!entryErrors?.url}
                  aria-describedby={`${idBase}-url-error`}
                  {...register(`projects.${index}.url`)}
                />
                <FieldError
                  id={`${idBase}-url-error`}
                  message={entryErrors?.url?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-start`}>Start date</Label>
                <Input
                  id={`${idBase}-start`}
                  placeholder="2023-06"
                  aria-invalid={!!entryErrors?.startDate}
                  aria-describedby={`${idBase}-start-error`}
                  {...register(`projects.${index}.startDate`)}
                />
                <FieldError
                  id={`${idBase}-start-error`}
                  message={entryErrors?.startDate?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-end`}>End date</Label>
                <Input
                  id={`${idBase}-end`}
                  placeholder="2024"
                  aria-invalid={!!entryErrors?.endDate}
                  aria-describedby={`${idBase}-end-error`}
                  {...register(`projects.${index}.endDate`)}
                />
                <FieldError
                  id={`${idBase}-end-error`}
                  message={entryErrors?.endDate?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${idBase}-description`}>Description</Label>
              <Textarea
                id={`${idBase}-description`}
                rows={3}
                {...register(`projects.${index}.description`)}
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Highlights</legend>
              <HighlightsEditor
                control={control}
                register={register}
                projectIndex={index}
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
          onClick={() => append(newEntry())}
        >
          <Plus aria-hidden="true" />
          Add project
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save projects"}
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
