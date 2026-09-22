"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";

import { updateWorkAction } from "@/app/admin/candidates/[id]/career-profile/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  masterCareerProfileWorkSchema,
  type MasterCareerProfileWorkEntry,
} from "@/lib/master-career-profile-schema";

// RHF field arrays require object items, so highlights are edited as
// { value } rows and converted back to string[] on submit.
type HighlightValue = { value: string };

type WorkFormEntry = {
  id: string;
  company: string;
  position: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  summary: string;
  highlights: HighlightValue[];
};

type WorkFormValues = { work: WorkFormEntry[] };

function toFormEntry(w: MasterCareerProfileWorkEntry): WorkFormEntry {
  return {
    id: w.id,
    company: w.company,
    position: w.position,
    location: w.location ?? "",
    employmentType: w.employmentType ?? "",
    startDate: w.startDate ?? "",
    endDate: w.endDate ?? "",
    isCurrent: w.isCurrent,
    summary: w.summary ?? "",
    highlights: w.highlights.map((value) => ({ value })),
  };
}

function newEntry(): WorkFormEntry {
  return {
    id: crypto.randomUUID(),
    company: "",
    position: "",
    location: "",
    employmentType: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    summary: "",
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
  workIndex,
}: {
  control: Control<WorkFormValues>;
  register: ReturnType<typeof useForm<WorkFormValues>>["register"];
  workIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `work.${workIndex}.highlights`,
    keyName: "_key",
  });

  return (
    <div className="space-y-2">
      {fields.map((field, hIndex) => (
        <div key={field._key} className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <Label
              htmlFor={`work-${workIndex}-hl-${hIndex}`}
              className="sr-only"
            >
              Highlight {hIndex + 1}
            </Label>
            <Input
              id={`work-${workIndex}-hl-${hIndex}`}
              placeholder="Reduced release lead time by 20%."
              {...register(`work.${workIndex}.highlights.${hIndex}.value`)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove highlight ${hIndex + 1} from experience ${workIndex + 1}`}
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

export function CareerProfileWorkForm({
  candidateId,
  initialWork,
}: {
  candidateId: string;
  initialWork: MasterCareerProfileWorkEntry[];
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
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WorkFormValues>({
    defaultValues: { work: initialWork.map(toFormEntry) },
  });

  // keyName "_key" keeps RHF's render keys off the canonical work[].id.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "work",
    keyName: "_key",
  });

  const submitting = isSubmitting || isPending;

  function onSubmit(values: WorkFormValues) {
    setFeedback(null);

    const payload = values.work.map((w) => ({
      ...w,
      highlights: w.highlights.map((h) => h.value),
    }));
    const parsed = masterCareerProfileWorkSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const [index, field] = issue.path;
        if (typeof index === "number") {
          // Entry-level refines (e.g. isCurrent+endDate) carry no field
          // name; surface them on endDate where the contradiction lives.
          const target = typeof field === "string" ? field : "endDate";
          setError(`work.${index}.${target}` as never, {
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
        const result = await updateWorkAction(candidateId, payload);
        if (result.success) {
          setFeedback({ kind: "success", message: "Work experience saved." });
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save work experience. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {fields.map((field, index) => (
        <WorkEntryCard
          key={field._key}
          control={control}
          register={register}
          setValue={setValue}
          index={index}
          errors={errors.work?.[index]}
          onRemove={() => remove(index)}
        />
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newEntry())}
        >
          <Plus aria-hidden="true" />
          Add experience
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save work experience"}
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

function WorkEntryCard({
  control,
  register,
  setValue,
  index,
  errors,
  onRemove,
}: {
  control: Control<WorkFormValues>;
  register: ReturnType<typeof useForm<WorkFormValues>>["register"];
  setValue: ReturnType<typeof useForm<WorkFormValues>>["setValue"];
  index: number;
  errors:
    Partial<Record<keyof WorkFormEntry, { message?: string }>> | undefined;
  onRemove: () => void;
}) {
  const isCurrent = useWatch({ control, name: `work.${index}.isCurrent` });
  const idBase = `work-${index}`;

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Experience {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Remove experience ${index + 1}`}
          onClick={onRemove}
        >
          <Trash2 aria-hidden="true" />
          Remove experience
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idBase}-company`}>Company</Label>
          <Input
            id={`${idBase}-company`}
            aria-invalid={!!errors?.company}
            aria-describedby={`${idBase}-company-error`}
            {...register(`work.${index}.company`)}
          />
          <FieldError
            id={`${idBase}-company-error`}
            message={errors?.company?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idBase}-position`}>Position</Label>
          <Input
            id={`${idBase}-position`}
            aria-invalid={!!errors?.position}
            aria-describedby={`${idBase}-position-error`}
            {...register(`work.${index}.position`)}
          />
          <FieldError
            id={`${idBase}-position-error`}
            message={errors?.position?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idBase}-location`}>Location</Label>
          <Input
            id={`${idBase}-location`}
            {...register(`work.${index}.location`)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idBase}-employment`}>Employment type</Label>
          <Input
            id={`${idBase}-employment`}
            placeholder="Full-time"
            {...register(`work.${index}.employmentType`)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idBase}-start`}>Start date</Label>
          <Input
            id={`${idBase}-start`}
            placeholder="2023-06"
            aria-invalid={!!errors?.startDate}
            aria-describedby={`${idBase}-start-error`}
            {...register(`work.${index}.startDate`)}
          />
          <FieldError
            id={`${idBase}-start-error`}
            message={errors?.startDate?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idBase}-end`}>End date</Label>
          <Input
            id={`${idBase}-end`}
            placeholder="2024"
            disabled={isCurrent}
            aria-invalid={!!errors?.endDate}
            aria-describedby={`${idBase}-end-error`}
            {...register(`work.${index}.endDate`)}
          />
          <FieldError
            id={`${idBase}-end-error`}
            message={errors?.endDate?.message}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`${idBase}-current`}
          checked={isCurrent}
          onCheckedChange={(checked) => {
            setValue(`work.${index}.isCurrent`, checked === true);
            if (checked === true) {
              setValue(`work.${index}.endDate`, "");
            }
          }}
        />
        <Label htmlFor={`${idBase}-current`}>I currently work here</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idBase}-summary`}>Summary</Label>
        <Textarea
          id={`${idBase}-summary`}
          rows={3}
          {...register(`work.${index}.summary`)}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Highlights</legend>
        <HighlightsEditor
          control={control}
          register={register}
          workIndex={index}
        />
      </fieldset>
    </section>
  );
}
