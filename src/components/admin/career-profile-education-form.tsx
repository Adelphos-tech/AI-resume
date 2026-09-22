"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Control, useFieldArray, useForm } from "react-hook-form";

import { updateEducationAction } from "@/app/admin/candidates/[id]/career-profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  masterCareerProfileEducationSchema,
  type MasterCareerProfileEducationEntry,
} from "@/lib/master-career-profile-schema";

// RHF field arrays require object items — highlights edit as { value }
// rows and convert back to string[] on submit.
type HighlightValue = { value: string };

type EducationFormEntry = {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
  highlights: HighlightValue[];
};

type EducationFormValues = { education: EducationFormEntry[] };

function toFormEntry(e: MasterCareerProfileEducationEntry): EducationFormEntry {
  return {
    id: e.id,
    institution: e.institution,
    degree: e.degree ?? "",
    fieldOfStudy: e.fieldOfStudy ?? "",
    location: e.location ?? "",
    startDate: e.startDate ?? "",
    endDate: e.endDate ?? "",
    grade: e.grade ?? "",
    highlights: e.highlights.map((value) => ({ value })),
  };
}

function newEntry(): EducationFormEntry {
  return {
    id: crypto.randomUUID(),
    institution: "",
    degree: "",
    fieldOfStudy: "",
    location: "",
    startDate: "",
    endDate: "",
    grade: "",
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
  eduIndex,
}: {
  control: Control<EducationFormValues>;
  register: ReturnType<typeof useForm<EducationFormValues>>["register"];
  eduIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `education.${eduIndex}.highlights`,
    keyName: "_key",
  });

  return (
    <div className="space-y-2">
      {fields.map((field, hIndex) => (
        <div key={field._key} className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor={`edu-${eduIndex}-hl-${hIndex}`} className="sr-only">
              Highlight {hIndex + 1}
            </Label>
            <Input
              id={`edu-${eduIndex}-hl-${hIndex}`}
              placeholder="Graduated with distinction"
              {...register(`education.${eduIndex}.highlights.${hIndex}.value`)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove highlight ${hIndex + 1} from education ${eduIndex + 1}`}
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

export function CareerProfileEducationForm({
  candidateId,
  initialEducation,
}: {
  candidateId: string;
  initialEducation: MasterCareerProfileEducationEntry[];
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
  } = useForm<EducationFormValues>({
    defaultValues: { education: initialEducation.map(toFormEntry) },
  });

  // keyName "_key" keeps RHF's render keys off the canonical education[].id.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
    keyName: "_key",
  });

  const submitting = isSubmitting || isPending;

  function onSubmit(values: EducationFormValues) {
    setFeedback(null);

    const payload = values.education.map((e) => ({
      ...e,
      highlights: e.highlights.map((h) => h.value),
    }));
    const parsed = masterCareerProfileEducationSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const [index, field] = issue.path;
        if (typeof index === "number") {
          const target = typeof field === "string" ? field : "endDate";
          setError(`education.${index}.${target}` as never, {
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
        const result = await updateEducationAction(candidateId, payload);
        if (result.success) {
          setFeedback({ kind: "success", message: "Education saved." });
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save education. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {fields.map((field, index) => {
        const idBase = `edu-${index}`;
        const entryErrors = errors.education?.[index];
        return (
          <section key={field._key} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Education {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove education ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden="true" />
                Remove education
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-institution`}>Institution</Label>
                <Input
                  id={`${idBase}-institution`}
                  aria-invalid={!!entryErrors?.institution}
                  aria-describedby={`${idBase}-institution-error`}
                  {...register(`education.${index}.institution`)}
                />
                <FieldError
                  id={`${idBase}-institution-error`}
                  message={entryErrors?.institution?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-degree`}>Degree</Label>
                <Input
                  id={`${idBase}-degree`}
                  placeholder="BSc"
                  {...register(`education.${index}.degree`)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-field`}>Field of study</Label>
                <Input
                  id={`${idBase}-field`}
                  placeholder="Computer Science"
                  {...register(`education.${index}.fieldOfStudy`)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-location`}>Location</Label>
                <Input
                  id={`${idBase}-location`}
                  {...register(`education.${index}.location`)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-start`}>Start date</Label>
                <Input
                  id={`${idBase}-start`}
                  placeholder="2022-09"
                  aria-invalid={!!entryErrors?.startDate}
                  aria-describedby={`${idBase}-start-error`}
                  {...register(`education.${index}.startDate`)}
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
                  {...register(`education.${index}.endDate`)}
                />
                <FieldError
                  id={`${idBase}-end-error`}
                  message={entryErrors?.endDate?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-grade`}>Grade</Label>
                <Input
                  id={`${idBase}-grade`}
                  placeholder="First-class honours"
                  {...register(`education.${index}.grade`)}
                />
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Highlights</legend>
              <HighlightsEditor
                control={control}
                register={register}
                eduIndex={index}
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
          Add education
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save education"}
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
