"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { updateCertificationsAction } from "@/app/admin/candidates/[id]/career-profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  masterCareerProfileCertificationsSchema,
  type MasterCareerProfileCertificationEntry,
} from "@/lib/master-career-profile-schema";

type CertificationFormEntry = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
  credentialId: string;
  url: string;
};

type CertificationsFormValues = { certifications: CertificationFormEntry[] };

function toFormEntry(
  c: MasterCareerProfileCertificationEntry,
): CertificationFormEntry {
  return {
    id: c.id,
    name: c.name,
    issuer: c.issuer ?? "",
    date: c.date ?? "",
    expiryDate: c.expiryDate ?? "",
    credentialId: c.credentialId ?? "",
    url: c.url ?? "",
  };
}

function newEntry(): CertificationFormEntry {
  return {
    id: crypto.randomUUID(),
    name: "",
    issuer: "",
    date: "",
    expiryDate: "",
    credentialId: "",
    url: "",
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

export function CareerProfileCertificationsForm({
  candidateId,
  initialCertifications,
}: {
  candidateId: string;
  initialCertifications: MasterCareerProfileCertificationEntry[];
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
  } = useForm<CertificationsFormValues>({
    defaultValues: { certifications: initialCertifications.map(toFormEntry) },
  });

  // keyName "_key" keeps RHF's render keys off the canonical id.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
    keyName: "_key",
  });

  const submitting = isSubmitting || isPending;

  function onSubmit(values: CertificationsFormValues) {
    setFeedback(null);

    const parsed = masterCareerProfileCertificationsSchema.safeParse(
      values.certifications,
    );
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const [index, field] = issue.path;
        if (typeof index === "number") {
          const target = typeof field === "string" ? field : "expiryDate";
          setError(`certifications.${index}.${target}` as never, {
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
        const result = await updateCertificationsAction(
          candidateId,
          values.certifications,
        );
        if (result.success) {
          setFeedback({ kind: "success", message: "Certifications saved." });
        } else {
          setFeedback({ kind: "error", message: result.message });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Unable to save certifications. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {fields.map((field, index) => {
        const idBase = `cert-${index}`;
        const entryErrors = errors.certifications?.[index];
        return (
          <section key={field._key} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Certification {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove certification ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden="true" />
                Remove certification
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-name`}>Name</Label>
                <Input
                  id={`${idBase}-name`}
                  placeholder="AWS Certified Cloud Practitioner"
                  aria-invalid={!!entryErrors?.name}
                  aria-describedby={`${idBase}-name-error`}
                  {...register(`certifications.${index}.name`)}
                />
                <FieldError
                  id={`${idBase}-name-error`}
                  message={entryErrors?.name?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-issuer`}>Issuer</Label>
                <Input
                  id={`${idBase}-issuer`}
                  placeholder="Amazon Web Services"
                  {...register(`certifications.${index}.issuer`)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-date`}>Date</Label>
                <Input
                  id={`${idBase}-date`}
                  placeholder="2023-01"
                  aria-invalid={!!entryErrors?.date}
                  aria-describedby={`${idBase}-date-error`}
                  {...register(`certifications.${index}.date`)}
                />
                <FieldError
                  id={`${idBase}-date-error`}
                  message={entryErrors?.date?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-expiry`}>Expiry date</Label>
                <Input
                  id={`${idBase}-expiry`}
                  placeholder="2026-01"
                  aria-invalid={!!entryErrors?.expiryDate}
                  aria-describedby={`${idBase}-expiry-error`}
                  {...register(`certifications.${index}.expiryDate`)}
                />
                <FieldError
                  id={`${idBase}-expiry-error`}
                  message={entryErrors?.expiryDate?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${idBase}-credential`}>Credential ID</Label>
                <Input
                  id={`${idBase}-credential`}
                  {...register(`certifications.${index}.credentialId`)}
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
                  {...register(`certifications.${index}.url`)}
                />
                <FieldError
                  id={`${idBase}-url-error`}
                  message={entryErrors?.url?.message}
                />
              </div>
            </div>
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
          Add certification
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save certifications"}
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
