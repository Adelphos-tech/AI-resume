import "server-only";

import { z } from "zod";

import { CandidatePackage, CandidateStatus } from "@/generated/prisma/enums";

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).optional();

export const createCandidateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Enter a valid email address." })),
  phone: optionalText(40),
  location: optionalText(120),
  linkedinUrl: z.url({ protocol: /^https?$/ }).optional(),
  package: z.enum(CandidatePackage),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;

export const candidateListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(CandidateStatus).optional().catch(undefined),
  package: z.enum(CandidatePackage).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1).default(1),
});

export type CandidateListQuery = z.infer<typeof candidateListQuerySchema>;
