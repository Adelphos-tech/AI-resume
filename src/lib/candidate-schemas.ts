import { z } from "zod";

import { CandidatePackage, CandidateStatus } from "@/generated/prisma/enums";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (maxLength: number) =>
  z
    .unknown()
    .transform(emptyToUndefined)
    .pipe(z.string().trim().max(maxLength).optional())
    .optional();

export const createCandidateSchema = z.strictObject({
  firstName: z.string().trim().min(1, "Enter a first name.").max(100),
  lastName: z.string().trim().min(1, "Enter a last name.").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Enter a valid email address." })),
  phone: optionalText(40),
  location: optionalText(120),
  linkedinUrl: z
    .unknown()
    .transform(emptyToUndefined)
    .pipe(
      z.url({ protocol: /^https?$/, error: "Enter a valid URL." }).optional(),
    )
    .optional(),
  package: z.enum(CandidatePackage, { error: "Select a package." }),
});

export type CreateCandidateInput = z.output<typeof createCandidateSchema>;
export type CreateCandidateFormValues = z.input<typeof createCandidateSchema>;

export const updateCandidateStatusSchema = z.strictObject({
  status: z.enum(CandidateStatus, { error: "Select a valid status." }),
});

export type UpdateCandidateStatusInput = z.infer<
  typeof updateCandidateStatusSchema
>;

export const candidateListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(CandidateStatus).optional().catch(undefined),
  package: z.enum(CandidatePackage).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export type CandidateListQuery = z.infer<typeof candidateListQuerySchema>;
