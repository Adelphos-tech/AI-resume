"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { updateBasicsAction } from "@/app/admin/candidates/[id]/career-profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { masterCareerProfileBasicsSchema } from "@/lib/master-career-profile-schema";

type LinkValue = { label: string; url: string };
type TagValue = { value: string };

type BasicsFormValues = {
  fullName: string;
  headline: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  links: LinkValue[];
  professionalCategories: TagValue[];
  genres: TagValue[];
  portfolioUrl: string;
  showreelUrl: string;
};

function toFormValues(basics: {
  fullName: string | null;
  headline: string | null;
  summary: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  links: LinkValue[];
  professionalCategories?: string[];
  genres?: string[];
  portfolioUrl?: string | null;
  showreelUrl?: string | null;
}): BasicsFormValues {
  return {
    fullName: basics.fullName ?? "",
    headline: basics.headline ?? "",
    summary: basics.summary ?? "",
    email: basics.email ?? "",
    phone: basics.phone ?? "",
    location: basics.location ?? "",
    links: basics.links.map((l) => ({ label: l.label, url: l.url })),
    professionalCategories:
      basics.professionalCategories?.map((v) => ({ value: v })) ?? [],
    genres: basics.genres?.map((v) => ({ value: v })) ?? [],
    portfolioUrl: basics.portfolioUrl ?? "",
    showreelUrl: basics.showreelUrl ?? "",
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

export function CareerProfileBasicsForm({
  candidateId,
  initialBasics,
}: {
  candidateId: string;
  initialBasics: Parameters<typeof toFormValues>[0];
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
  } = useForm<BasicsFormValues>({
    defaultValues: toFormValues(initialBasics),
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: "links",
  });

  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control,
    name: "professionalCategories",
    keyName: "_key",
  });

  const {
    fields: genreFields,
    append: appendGenre,
    remove: removeGenre,
  } = useFieldArray({
    control,
    name: "genres",
    keyName: "_key",
  });

  const submitting = isSubmitting || isPending;

  function onSubmit(values: BasicsFormValues) {
    setFeedback(null);

    const payload = {
      ...values,
      professionalCategories: values.professionalCategories.map((t) => t.value),
      genres: values.genres.map((t) => t.value),
    };

    const parsed = masterCareerProfileBasicsSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const [first, second] = issue.path;
        if (first === "links" && typeof second === "number") {
          setError(`links.${second}.${String(issue.path[2])}` as never, {
            type: "server",
            message: issue.message,
          });
        } else if (
          (first === "professionalCategories" || first === "genres") &&
          typeof second === "number"
        ) {
          setError(`${first}.${second}.value` as never, {
            type: "server",
            message: issue.message,
          });
        } else if (typeof first === "string") {
          setError(first as keyof BasicsFormValues, {
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
        const result = await updateBasicsAction(candidateId, payload);
        if (result.success) {
          setFeedback({ kind: "success", message: "Changes saved." });
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save changes. Please try again.",
        });
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cp-fullName">Full name</Label>
          <Input
            id="cp-fullName"
            aria-invalid={!!errors.fullName}
            aria-describedby="cp-fullName-error"
            {...register("fullName")}
          />
          <FieldError
            id="cp-fullName-error"
            message={errors.fullName?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp-headline">Headline</Label>
          <Input
            id="cp-headline"
            placeholder="Senior Product Manager"
            aria-invalid={!!errors.headline}
            aria-describedby="cp-headline-error"
            {...register("headline")}
          />
          <FieldError
            id="cp-headline-error"
            message={errors.headline?.message}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cp-summary">Professional summary</Label>
        <Textarea
          id="cp-summary"
          rows={5}
          aria-invalid={!!errors.summary}
          aria-describedby="cp-summary-error"
          {...register("summary")}
        />
        <FieldError id="cp-summary-error" message={errors.summary?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="cp-email">Email</Label>
          <Input
            id="cp-email"
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby="cp-email-error"
            {...register("email")}
          />
          <FieldError id="cp-email-error" message={errors.email?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp-phone">Phone</Label>
          <Input
            id="cp-phone"
            aria-invalid={!!errors.phone}
            aria-describedby="cp-phone-error"
            {...register("phone")}
          />
          <FieldError id="cp-phone-error" message={errors.phone?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp-location">Location</Label>
          <Input
            id="cp-location"
            aria-invalid={!!errors.location}
            aria-describedby="cp-location-error"
            {...register("location")}
          />
          <FieldError
            id="cp-location-error"
            message={errors.location?.message}
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Links</legend>
        {linkFields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end"
          >
            <div className="space-y-2">
              <Label htmlFor={`cp-link-label-${index}`}>Label</Label>
              <Input
                id={`cp-link-label-${index}`}
                placeholder="LinkedIn"
                aria-invalid={!!errors.links?.[index]?.label}
                {...register(`links.${index}.label`)}
              />
              <FieldError
                id={`cp-link-label-${index}-error`}
                message={errors.links?.[index]?.label?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`cp-link-url-${index}`}>URL</Label>
              <Input
                id={`cp-link-url-${index}`}
                type="url"
                placeholder="https://"
                aria-invalid={!!errors.links?.[index]?.url}
                {...register(`links.${index}.url`)}
              />
              <FieldError
                id={`cp-link-url-${index}-error`}
                message={errors.links?.[index]?.url?.message}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove link ${index + 1}`}
              onClick={() => removeLink(index)}
            >
              <Trash2 aria-hidden="true" />
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendLink({ label: "", url: "" })}
        >
          <Plus aria-hidden="true" />
          Add link
        </Button>
      </fieldset>

      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            Professional Categories
          </legend>
          <ul className="flex flex-wrap gap-2">
            {categoryFields.map((field, index) => (
              <li
                key={field._key}
                className="flex items-center gap-1 rounded-md border px-2 py-1"
              >
                <Label htmlFor={`cp-cat-${index}`} className="sr-only">
                  Category {index + 1}
                </Label>
                <Input
                  id={`cp-cat-${index}`}
                  className="h-7 w-36 border-0 px-1 shadow-none focus-visible:ring-0"
                  aria-invalid={!!errors.professionalCategories?.[index]}
                  {...register(`professionalCategories.${index}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  aria-label={`Remove category ${index + 1}`}
                  onClick={() => removeCategory(index)}
                >
                  <X aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendCategory({ value: "" })}
          >
            <Plus aria-hidden="true" />
            Add category
          </Button>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Genres</legend>
          <ul className="flex flex-wrap gap-2">
            {genreFields.map((field, index) => (
              <li
                key={field._key}
                className="flex items-center gap-1 rounded-md border px-2 py-1"
              >
                <Label htmlFor={`cp-genre-${index}`} className="sr-only">
                  Genre {index + 1}
                </Label>
                <Input
                  id={`cp-genre-${index}`}
                  className="h-7 w-36 border-0 px-1 shadow-none focus-visible:ring-0"
                  aria-invalid={!!errors.genres?.[index]}
                  {...register(`genres.${index}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  aria-label={`Remove genre ${index + 1}`}
                  onClick={() => removeGenre(index)}
                >
                  <X aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendGenre({ value: "" })}
          >
            <Plus aria-hidden="true" />
            Add genre
          </Button>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cp-portfolioUrl">Portfolio URL</Label>
            <Input
              id="cp-portfolioUrl"
              type="url"
              placeholder="https://"
              aria-invalid={!!errors.portfolioUrl}
              aria-describedby="cp-portfolioUrl-error"
              {...register("portfolioUrl")}
            />
            <FieldError
              id="cp-portfolioUrl-error"
              message={errors.portfolioUrl?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-showreelUrl">Showreel URL</Label>
            <Input
              id="cp-showreelUrl"
              type="url"
              placeholder="https://"
              aria-invalid={!!errors.showreelUrl}
              aria-describedby="cp-showreelUrl-error"
              {...register("showreelUrl")}
            />
            <FieldError
              id="cp-showreelUrl-error"
              message={errors.showreelUrl?.message}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
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
