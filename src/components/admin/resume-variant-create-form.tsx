"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import { TEMPLATE_THUMBNAILS } from "@/components/admin/template-thumbnails";
import { createResumeVariantAction } from "@/app/admin/candidates/[id]/resumes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RESUME_TEMPLATES,
  createResumeVariantConfigSchema,
} from "@/lib/resume-schema";

type FormValues = {
  name: string;
  targetRole: string;
  targetCountry: string;
  templateKey: string;
};

export function ResumeVariantCreateForm({
  candidateId,
  suggestedRoles,
}: {
  candidateId: string;
  suggestedRoles: string[];
}) {
  const router = useRouter();
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
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      targetRole: "",
      targetCountry: "",
      templateKey: "ats-classic",
    },
  });

  const submitting = isSubmitting || isPending;
  const templateKey = useWatch({ control, name: "templateKey" });

  function onSubmit(values: FormValues) {
    setFeedback(null);

    const parsed = createResumeVariantConfigSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof FormValues, {
            type: "server",
            message: issue.message,
          });
        }
      }
      return;
    }

    startTransition(async () => {
      try {
        const result = await createResumeVariantAction(
          candidateId,
          parsed.data,
        );
        if (result.success) {
          router.push(
            `/admin/candidates/${candidateId}/resumes/${result.variant.id}`,
          );
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to create resume. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Resume details
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="rv-name">Resume name</Label>
            <Input
              id="rv-name"
              placeholder="Product Manager — United States"
              aria-invalid={!!errors.name}
              aria-describedby="rv-name-error"
              {...register("name")}
            />
            {errors.name && (
              <p
                id="rv-name-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rv-role">Target role</Label>
            <Input
              id="rv-role"
              placeholder="Product Manager"
              list="rv-role-suggestions"
              aria-invalid={!!errors.targetRole}
              aria-describedby="rv-role-error"
              {...register("targetRole")}
            />
            {suggestedRoles.length > 0 && (
              <datalist id="rv-role-suggestions">
                {suggestedRoles.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            )}
            {errors.targetRole && (
              <p
                id="rv-role-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.targetRole.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rv-country">Target country</Label>
            <Input
              id="rv-country"
              placeholder="United States"
              aria-invalid={!!errors.targetCountry}
              aria-describedby="rv-country-error"
              {...register("targetCountry")}
            />
            {errors.targetCountry && (
              <p
                id="rv-country-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.targetCountry.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4" aria-describedby="rv-template-error">
        <legend className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Choose a template
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(RESUME_TEMPLATES).map((t) => {
            const Thumbnail = TEMPLATE_THUMBNAILS[t.key];
            const selected = templateKey === t.key;
            return (
              <label
                key={t.key}
                className={`group relative block cursor-pointer rounded-xl border bg-white p-4 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                  selected
                    ? "border-emerald-600 ring-1 ring-emerald-600"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <input
                  type="radio"
                  value={t.key}
                  checked={selected}
                  onChange={() =>
                    setValue("templateKey", t.key, { shouldValidate: true })
                  }
                  className="absolute top-4 right-4 size-4 accent-emerald-600"
                />
                <div className="pr-8">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.category}</p>
                </div>
                <div className="mt-3">{Thumbnail && <Thumbnail />}</div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
                <span
                  aria-hidden="true"
                  className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                    selected ? "text-emerald-700" : "invisible"
                  }`}
                >
                  <Check className="size-3.5" />
                  Selected
                </span>
              </label>
            );
          })}
        </div>
        {errors.templateKey && (
          <p
            id="rv-template-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.templateKey.message}
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating resume…" : "Create resume"}
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
