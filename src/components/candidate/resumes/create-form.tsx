"use client";

import { Check, FilePlus2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import { createResumeAction } from "@/app/candidate/(workspace)/resumes/actions";
import { TemplateMiniPreview } from "@/components/candidate/templates/template-mini-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RESUME_TEMPLATES,
  createResumeVariantConfigSchema,
  type ResumeTemplateKey,
} from "@/lib/resume-schema";

type FormValues = {
  name: string;
  targetRole: string;
  targetCountry: string;
  templateKey: ResumeTemplateKey;
};

const STEPS = ["Target", "Template", "Create"] as const;

export function CreateResumeForm({
  targetRoleSuggestions,
  initialTemplate,
}: {
  targetRoleSuggestions: string[];
  initialTemplate?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      targetRole: "",
      targetCountry: "",
      templateKey:
        initialTemplate && initialTemplate in RESUME_TEMPLATES
          ? (initialTemplate as ResumeTemplateKey)
          : "ats-classic",
    },
  });

  const templateKey = useWatch({ control, name: "templateKey" });
  const name = useWatch({ control, name: "name" });
  const targetRole = useWatch({ control, name: "targetRole" });
  const targetCountry = useWatch({ control, name: "targetCountry" });
  const submitting = isSubmitting || isPending;

  const targetFilled =
    Boolean(name?.trim()) &&
    Boolean(targetRole?.trim()) &&
    Boolean(targetCountry?.trim());
  const templateChosen = Boolean(templateKey);
  const currentStep = !targetFilled ? 0 : !templateChosen ? 1 : 2;

  const selectedTemplate = templateKey ? RESUME_TEMPLATES[templateKey] : null;

  function onSubmit(values: FormValues) {
    setError(null);
    const parsed = createResumeVariantConfigSchema.safeParse(values);
    if (!parsed.success) {
      setError("Please review the resume details.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await createResumeAction(parsed.data);
        if (result.success) {
          router.push("/candidate/resumes");
        } else {
          setError(result.message);
        }
      } catch {
        setError("Unable to create the resume. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* orientation steps — derived from local form state only */}
      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => {
          const active = i === currentStep;
          const done = i < currentStep;
          return (
            <li key={label} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden className="mx-1 h-px w-6 bg-stone-200" />
              )}
              <span
                aria-hidden
                className={`flex size-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                  done
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : active
                      ? "border-emerald-600 text-emerald-700"
                      : "border-stone-300 text-stone-400"
                }`}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={`text-sm font-semibold ${
                  done || active ? "text-stone-900" : "text-stone-400"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* section 1 — target */}
          <section
            aria-labelledby="target-section"
            className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6"
          >
            <h2
              id="target-section"
              className="text-base font-semibold text-stone-900"
            >
              Target
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              RoleRace creates this resume from your current Career Profile
              snapshot.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Resume name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Product Manager — Germany"
                  {...register("name", {
                    required: "Resume name is required.",
                  })}
                />
                {errors.name ? (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.name.message}
                  </p>
                ) : (
                  <p className="text-xs text-stone-400">
                    Use a name you&apos;ll recognize later.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="targetRole">Target role</Label>
                <Input
                  id="targetRole"
                  placeholder="e.g. Product Manager"
                  list="target-role-suggestions"
                  {...register("targetRole", {
                    required: "Target role is required.",
                  })}
                />
                <datalist id="target-role-suggestions">
                  {targetRoleSuggestions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
                {errors.targetRole ? (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.targetRole.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="targetCountry">Target country</Label>
                <Input
                  id="targetCountry"
                  placeholder="e.g. Germany"
                  {...register("targetCountry", {
                    required: "Target country is required.",
                  })}
                />
                {errors.targetCountry ? (
                  <p role="alert" className="text-xs text-red-600">
                    {errors.targetCountry.message}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          {/* section 2 — template */}
          <fieldset>
            <legend className="text-base font-semibold text-stone-900">
              Template
            </legend>
            <p className="mt-1 text-sm text-stone-500">
              Pick the layout your resume will use. You can preview each design
              in the summary.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {Object.values(RESUME_TEMPLATES).map((t) => {
                const selected = templateKey === t.key;
                return (
                  <label
                    key={t.key}
                    className={`group relative block cursor-pointer rounded-2xl border bg-white p-4 transition-colors focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 ${
                      selected
                        ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600"
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="templateKey"
                      value={t.key}
                      checked={selected}
                      onChange={() => setValue("templateKey", t.key)}
                      className="absolute top-4 right-4 size-4 accent-emerald-600"
                    />
                    <div className="pr-8">
                      <p className="text-sm font-semibold text-stone-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-stone-500">{t.category}</p>
                    </div>
                    <div
                      className="mt-3 overflow-hidden rounded-lg border border-stone-200 bg-white"
                      aria-hidden="true"
                    >
                      <div className="aspect-[210/150]">
                        <TemplateMiniPreview templateKey={t.key} />
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${
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
          </fieldset>
        </div>

        {/* supporting summary — sticky on desktop, stacks last on mobile */}
        <aside className="rounded-2xl border border-stone-200 bg-white p-5 lg:sticky lg:top-8">
          <h2 className="text-base font-semibold text-stone-900">
            Create resume
          </h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs font-medium text-stone-500">Name</dt>
              <dd className="truncate text-sm font-semibold text-stone-900">
                {name?.trim() || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-stone-500">Target</dt>
              <dd className="truncate text-sm font-semibold text-stone-900">
                {targetRole?.trim() || targetCountry?.trim()
                  ? `${targetRole?.trim() || "—"}${targetCountry?.trim() ? ` · ${targetCountry.trim()}` : ""}`
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-stone-500">Template</dt>
              <dd className="truncate text-sm font-semibold text-stone-900">
                {selectedTemplate?.name ?? "Not selected"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-stone-500">
                Career Profile
              </dt>
              <dd className="text-sm font-semibold text-emerald-700">
                Resume ready
              </dd>
            </div>
          </dl>

          <div
            className="mt-5 overflow-hidden rounded-lg border border-stone-200 bg-white"
            aria-hidden="true"
          >
            {selectedTemplate ? (
              <TemplateMiniPreview templateKey={templateKey} />
            ) : (
              <div className="flex aspect-[210/297] items-center justify-center text-stone-300">
                <Sparkles className="size-6" />
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting || !targetFilled}
            className="mt-5 w-full bg-emerald-700 hover:bg-emerald-800"
          >
            <FilePlus2 className="size-4" aria-hidden />
            {submitting ? "Creating…" : "Create resume"}
          </Button>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
