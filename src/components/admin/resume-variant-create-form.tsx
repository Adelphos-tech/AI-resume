"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import { createResumeVariantAction } from "@/app/admin/candidates/[id]/resumes/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
        <div className="space-y-2">
          <Label htmlFor="rv-template">Template</Label>
          <Select
            value={templateKey}
            onValueChange={(v) =>
              setValue("templateKey", v, { shouldValidate: true })
            }
          >
            <SelectTrigger id="rv-template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RESUME_TEMPLATES).map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create resume"}
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
