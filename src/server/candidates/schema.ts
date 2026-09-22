import "server-only";

import { z } from "zod";

import { CandidatePackage } from "@/generated/prisma/enums";

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
