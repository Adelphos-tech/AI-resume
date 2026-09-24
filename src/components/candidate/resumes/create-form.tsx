"use client";

import { Check, FilePlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import { createResumeAction } from "@/app/candidate/(workspace)/resumes/actions";
import { TEMPLATE_THUMBNAILS } from "@/components/admin/template-thumbnails";
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

export function CreateResumeForm({
  targetRoleSuggestions,
}: {
  targetRoleSuggestions: string[];
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
      templateKey: "ats-classic",
    },
  });

  const templateKey = useWatch({ control, name: "templateKey" });
  const submitting = isSubmitting || isPending;

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
      <div className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2 md:p-6">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Resume name</Label>
          <Input
            id="name"
            placeholder="e.g. Product Manager — US"
            {...register("name", { required: "Resume name is required." })}
          />
          {errors.name ? (
            <p role="alert" className="text-xs text-red-600">
              {errors.name.message}
            </p>
          ) : null}
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
            placeholder="e.g. United States"
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

      <fieldset>
        <legend className="text-sm font-semibold text-stone-900">
          Choose a template
        </legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {Object.values(RESUME_TEMPLATES).map((t) => {
            const Thumbnail = TEMPLATE_THUMBNAILS[t.key];
            const selected = templateKey === t.key;
            return (
              <label
                key={t.key}
                className={`group relative block cursor-pointer rounded-xl border bg-white p-4 transition-colors focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 ${
                  selected
                    ? "border-emerald-600 ring-1 ring-emerald-600"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <input
                  type="radio"
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
                <div className="mt-3">{Thumbnail && <Thumbnail />}</div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-stone-500">
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
      </fieldset>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          <FilePlus2 className="size-4" aria-hidden />
          {submitting ? "Creating resume…" : "Create resume"}
        </Button>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
