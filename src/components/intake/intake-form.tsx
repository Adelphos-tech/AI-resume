"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  saveIntakeAction,
  submitIntakeAction,
} from "@/app/intake/[token]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPLOYMENT_PREFERENCE_LABELS,
  WORKPLACE_PREFERENCE_LABELS,
} from "@/lib/candidate-labels";
import {
  candidateIntakeSubmitSchema,
  INTAKE_LIST_MAX_ITEMS,
  INTAKE_SALARY_MAX,
} from "@/lib/candidate-intake-schema";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "CAD", "AUD"];

export type IntakeFormValues = {
  currentRole: string;
  targetRoles: string[];
  preferredLocations: string[];
  workplacePreferences: string[];
  employmentPreferences: string[];
  salaryExpectation: string;
  salaryCurrency: string;
  workAuthorization: string;
  requiresSponsorship: string;
  preferredIndustries: string[];
  careerGoals: string;
  additionalNotes: string;
};

export type IntakeInitialData = Partial<{
  currentRole: string | null;
  targetRoles: string[];
  preferredLocations: string[];
  workplacePreferences: string[];
  employmentPreferences: string[];
  salaryExpectation: number | null;
  salaryCurrency: string | null;
  workAuthorization: string | null;
  requiresSponsorship: boolean | null;
  preferredIndustries: string[];
  careerGoals: string | null;
  additionalNotes: string | null;
  submittedAt: string | Date | null;
}> | null;

function emptyValues(initial: IntakeInitialData): IntakeFormValues {
  return {
    currentRole: initial?.currentRole ?? "",
    targetRoles: initial?.targetRoles ?? [],
    preferredLocations: initial?.preferredLocations ?? [],
    workplacePreferences: initial?.workplacePreferences ?? [],
    employmentPreferences: initial?.employmentPreferences ?? [],
    salaryExpectation:
      initial?.salaryExpectation != null
        ? String(initial.salaryExpectation)
        : "",
    salaryCurrency: initial?.salaryCurrency ?? "",
    workAuthorization: initial?.workAuthorization ?? "",
    requiresSponsorship:
      initial?.requiresSponsorship === true
        ? "true"
        : initial?.requiresSponsorship === false
          ? "false"
          : "",
    preferredIndustries: initial?.preferredIndustries ?? [],
    careerGoals: initial?.careerGoals ?? "",
    additionalNotes: initial?.additionalNotes ?? "",
  };
}

function TagListInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  errorId,
}: {
  id: string;
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  error?: string;
  errorId?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (
      trimmed === "" ||
      value.length >= INTAKE_LIST_MAX_ITEMS ||
      value.some((v) => v.toLowerCase() === trimmed.toLowerCase())
    ) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((item) => (
            <li key={item}>
              <Badge
                variant="secondary"
                className="gap-1.5 py-1 pr-1.5 pl-2.5 font-normal"
              >
                {item}
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  className="rounded-full px-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() => onChange(value.filter((v) => v !== item))}
                >
                  ×
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      {error && errorId ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CheckboxGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: Record<string, string>;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm leading-none font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-x-6 gap-y-2.5">
        {Object.entries(options).map(([optionValue, label]) => (
          <label
            key={optionValue}
            className="flex items-center gap-2 text-sm font-normal"
          >
            <Checkbox
              checked={value.includes(optionValue)}
              onCheckedChange={(checked) =>
                onChange(
                  checked === true
                    ? [...value, optionValue]
                    : value.filter((v) => v !== optionValue),
                )
              }
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function IntakeForm({
  token,
  initial,
}: {
  token: string;
  initial: IntakeInitialData;
}) {
  const [submitted, setSubmitted] = useState(initial?.submittedAt != null);
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<IntakeFormValues>({
    defaultValues: emptyValues(initial),
  });
  const {
    control,
    register,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  function clearAllErrors() {
    clearErrors();
  }

  function runSave() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await saveIntakeAction(token, getValues());
        if (result.success) {
          setFeedback({ kind: "success", message: "Progress saved." });
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save right now. Please try again.",
        });
      }
    });
  }

  function runSubmit() {
    setFeedback(null);
    clearAllErrors();
    const parsed = candidateIntakeSubmitSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string") {
          setError(path as keyof IntakeFormValues, {
            type: "server",
            message: issue.message,
          });
        }
      }
      setFeedback({
        kind: "error",
        message: "Some required answers are missing or invalid.",
      });
      return;
    }
    startTransition(async () => {
      try {
        const result = await submitIntakeAction(token, parsed.data);
        if (result.success) {
          setSubmitted(true);
          setReviewing(false);
          setFeedback(null);
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to submit right now. Please try again.",
        });
      }
    });
  }

  if (submitted && !reviewing) {
    return (
      <div className="space-y-6 rounded-lg border border-border bg-card p-8">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Intake submitted
          </h2>
          <p className="text-sm text-muted-foreground">
            Thank you. Your information has been received by the RoleRace team.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setReviewing(true)}
          >
            Review answers
          </Button>
          <Button asChild>
            <a href={`/intake/${token}/resume`}>Continue to resume upload</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-8"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        runSubmit();
      }}
    >
      {submitted ? (
        <p
          role="status"
          className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        >
          Your intake was already submitted. You can still update your answers.
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Career direction
        </h2>
        <div className="space-y-2">
          <Label htmlFor="currentRole">Current role</Label>
          <Input
            id="currentRole"
            placeholder="e.g. Senior Business Analyst"
            aria-invalid={!!errors.currentRole}
            {...register("currentRole")}
          />
          <FieldError
            id="currentRole-error"
            message={errors.currentRole?.message}
          />
        </div>
        <Controller
          name="targetRoles"
          control={control}
          render={({ field }) => (
            <TagListInput
              id="targetRoles"
              label="Target roles"
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Product Manager"
              error={errors.targetRoles?.message}
              errorId="targetRoles-error"
            />
          )}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Work preferences
        </h2>
        <Controller
          name="preferredLocations"
          control={control}
          render={({ field }) => (
            <TagListInput
              id="preferredLocations"
              label="Preferred locations"
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Austin, TX or Remote"
              error={errors.preferredLocations?.message}
              errorId="preferredLocations-error"
            />
          )}
        />
        <Controller
          name="workplacePreferences"
          control={control}
          render={({ field }) => (
            <CheckboxGroup
              legend="Workplace preference"
              options={WORKPLACE_PREFERENCE_LABELS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="employmentPreferences"
          control={control}
          render={({ field }) => (
            <CheckboxGroup
              legend="Employment preference"
              options={EMPLOYMENT_PREFERENCE_LABELS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Compensation &amp; authorization
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salaryExpectation">Salary expectation</Label>
            <Input
              id="salaryExpectation"
              type="number"
              min={1}
              max={INTAKE_SALARY_MAX}
              inputMode="numeric"
              placeholder="Annual target amount"
              aria-invalid={!!errors.salaryExpectation}
              {...register("salaryExpectation")}
            />
            <FieldError
              id="salaryExpectation-error"
              message={errors.salaryExpectation?.message}
            />
          </div>
          <Controller
            name="salaryCurrency"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="salaryCurrency">Currency</Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="salaryCurrency"
                    aria-invalid={!!errors.salaryCurrency}
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError
                  id="salaryCurrency-error"
                  message={errors.salaryCurrency?.message}
                />
              </div>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workAuthorization">Work authorization</Label>
          <Input
            id="workAuthorization"
            placeholder="e.g. Authorized to work in the United States"
            aria-invalid={!!errors.workAuthorization}
            {...register("workAuthorization")}
          />
          <FieldError
            id="workAuthorization-error"
            message={errors.workAuthorization?.message}
          />
        </div>
        <Controller
          name="requiresSponsorship"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="requiresSponsorship">
                Do you require visa sponsorship?
              </Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="requiresSponsorship">
                  <SelectValue placeholder="Select an answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="unknown">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Career focus
        </h2>
        <Controller
          name="preferredIndustries"
          control={control}
          render={({ field }) => (
            <TagListInput
              id="preferredIndustries"
              label="Preferred industries"
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Fintech"
            />
          )}
        />
        <div className="space-y-2">
          <Label htmlFor="careerGoals">Career goals</Label>
          <Textarea
            id="careerGoals"
            rows={4}
            placeholder="e.g. I want to move from Business Analyst into Product Management."
            aria-invalid={!!errors.careerGoals}
            {...register("careerGoals")}
          />
          <FieldError
            id="careerGoals-error"
            message={errors.careerGoals?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional notes</Label>
          <Textarea
            id="additionalNotes"
            rows={4}
            placeholder="Anything else we should know?"
            aria-invalid={!!errors.additionalNotes}
            {...register("additionalNotes")}
          />
          <FieldError
            id="additionalNotes-error"
            message={errors.additionalNotes?.message}
          />
        </div>
      </section>

      {feedback ? (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={
            feedback.kind === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {feedback.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={runSave}
        >
          Save progress
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Working…"
            : submitted
              ? "Update answers"
              : "Submit intake"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        You can also{" "}
        <a
          href={`/intake/${token}/resume`}
          className="underline underline-offset-4 hover:text-foreground"
        >
          upload your resume
        </a>{" "}
        using this secure link.
      </p>
    </form>
  );
}
