"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { createCandidateAction } from "@/app/admin/candidates/new/actions";
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
import { CANDIDATE_PACKAGE_LABELS } from "@/lib/candidate-labels";
import {
  createCandidateSchema,
  type CreateCandidateFormValues,
  type CreateCandidateInput,
} from "@/lib/candidate-schemas";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

export function CandidateCreateForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCandidateFormValues, unknown, CreateCandidateInput>({
    resolver: standardSchemaResolver(createCandidateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      linkedinUrl: "",
    },
  });

  const submitting = isSubmitting || isPending;

  function onSubmit(values: CreateCandidateInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createCandidateAction(values);
      if (result && !result.success) {
        setServerError(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          {serverError}
        </div>
      ) : null}

      <section className="space-y-4">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Personal information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              autoComplete="off"
              aria-invalid={errors.firstName ? true : undefined}
              aria-describedby={
                errors.firstName ? "firstName-error" : undefined
              }
              {...register("firstName")}
            />
            <FieldError
              id="firstName-error"
              message={errors.firstName?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              autoComplete="off"
              aria-invalid={errors.lastName ? true : undefined}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              {...register("lastName")}
            />
            <FieldError
              id="lastName-error"
              message={errors.lastName?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              autoComplete="off"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              {...register("phone")}
            />
            <FieldError id="phone-error" message={errors.phone?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              autoComplete="off"
              aria-invalid={errors.location ? true : undefined}
              aria-describedby={errors.location ? "location-error" : undefined}
              {...register("location")}
            />
            <FieldError
              id="location-error"
              message={errors.location?.message}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              autoComplete="off"
              placeholder="https://"
              aria-invalid={errors.linkedinUrl ? true : undefined}
              aria-describedby={
                errors.linkedinUrl ? "linkedinUrl-error" : undefined
              }
              {...register("linkedinUrl")}
            />
            <FieldError
              id="linkedinUrl-error"
              message={errors.linkedinUrl?.message}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Engagement
        </h3>
        <div className="space-y-2 sm:max-w-72">
          <Label htmlFor="package">Package</Label>
          <Controller
            control={control}
            name="package"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="package"
                  className="w-full"
                  aria-invalid={errors.package ? true : undefined}
                  aria-describedby={
                    errors.package ? "package-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CANDIDATE_PACKAGE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="package-error" message={errors.package?.message} />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 border-t pt-5">
        <Button asChild variant="ghost" type="button">
          <Link href="/admin/candidates">Cancel</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create candidate"}
        </Button>
      </div>
    </form>
  );
}
