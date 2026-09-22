import { z } from "zod";

import {
  EmploymentPreference,
  WorkplacePreference,
} from "@/generated/prisma/enums";

export const INTAKE_LIST_MAX_ITEMS = 5;
const LIST_ITEM_MAX_LENGTH = 120;
const SHORT_TEXT_MAX_LENGTH = 200;
const NOTES_MAX_LENGTH = 2000;
// PostgreSQL INTEGER / Prisma Int maximum — inputs beyond this must fail
// validation before reaching the database.
export const INTAKE_SALARY_MAX = 2_147_483_647;

// Blank/whitespace strings normalize to null so cleared optional fields
// are actually persisted as NULL rather than skipped or stored as "".
const optionalText = (maxLength: number) =>
  z
    .unknown()
    .transform((value) => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    })
    .pipe(z.string().max(maxLength).nullable())
    .optional()
    .nullable();

// Trims items, drops blanks, removes case-insensitive duplicates while
// preserving first-seen order, and enforces the item cap.
const textList = (maxItems: number) =>
  z
    .unknown()
    .transform((value) => {
      if (!Array.isArray(value)) return [];
      const seen = new Set<string>();
      const items: string[] = [];
      for (const item of value) {
        if (typeof item !== "string") continue;
        const trimmed = item.trim();
        const key = trimmed.toLowerCase();
        if (trimmed === "" || seen.has(key)) continue;
        seen.add(key);
        items.push(trimmed);
      }
      return items;
    })
    .pipe(z.array(z.string().min(1).max(LIST_ITEM_MAX_LENGTH)).max(maxItems))
    .optional();

const workplaceSchema = z.array(z.enum(WorkplacePreference)).optional();
const employmentSchema = z.array(z.enum(EmploymentPreference)).optional();

const salarySchema = z
  .unknown()
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") return null;
      const num = Number(trimmed);
      return Number.isFinite(num) ? num : value;
    }
    return value;
  })
  .pipe(z.number().int().positive().max(INTAKE_SALARY_MAX).nullable())
  .optional()
  .nullable();

const salaryCurrencySchema = z
  .unknown()
  .transform((value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim().toUpperCase();
    return trimmed === "" ? null : trimmed;
  })
  .pipe(
    z
      .string()
      .regex(/^[A-Z]{3}$/)
      .nullable(),
  )
  .optional()
  .nullable();

const sponsorshipSchema = z
  .unknown()
  .transform((value) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return null;
  })
  .pipe(z.boolean().nullable())
  .optional()
  .nullable();

const baseIntakeFields = {
  currentRole: optionalText(SHORT_TEXT_MAX_LENGTH),
  targetRoles: textList(INTAKE_LIST_MAX_ITEMS),
  preferredLocations: textList(INTAKE_LIST_MAX_ITEMS),
  workplacePreferences: workplaceSchema,
  employmentPreferences: employmentSchema,
  salaryExpectation: salarySchema,
  salaryCurrency: salaryCurrencySchema,
  workAuthorization: optionalText(SHORT_TEXT_MAX_LENGTH),
  requiresSponsorship: sponsorshipSchema,
  preferredIndustries: textList(INTAKE_LIST_MAX_ITEMS),
  careerGoals: optionalText(NOTES_MAX_LENGTH),
  additionalNotes: optionalText(NOTES_MAX_LENGTH),
};

function salaryCoupling(
  data: {
    salaryExpectation?: number | null;
    salaryCurrency?: string | null;
  },
  ctx: z.RefinementCtx,
) {
  const hasSalary = data.salaryExpectation != null;
  const hasCurrency = data.salaryCurrency != null;
  if (hasSalary && !hasCurrency) {
    ctx.addIssue({
      code: "custom",
      path: ["salaryCurrency"],
      message: "Select a currency for the salary expectation.",
    });
  }
  if (!hasSalary && hasCurrency) {
    ctx.addIssue({
      code: "custom",
      path: ["salaryExpectation"],
      message: "Enter a salary expectation or clear the currency.",
    });
  }
}

export const candidateIntakeDraftSchema = z
  .strictObject(baseIntakeFields)
  .superRefine(salaryCoupling);

export type CandidateIntakeDraftInput = z.input<
  typeof candidateIntakeDraftSchema
>;
export type CandidateIntakeValues = z.output<typeof candidateIntakeDraftSchema>;

export const candidateIntakeSubmitSchema =
  candidateIntakeDraftSchema.superRefine((data, ctx) => {
    if (!data.targetRoles || data.targetRoles.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["targetRoles"],
        message: "Add at least one target role.",
      });
    }
    const hasLocation =
      data.preferredLocations && data.preferredLocations.length > 0;
    const hasRemoteOrFlexible =
      data.workplacePreferences?.some(
        (p) => p === "REMOTE" || p === "FLEXIBLE",
      ) ?? false;
    if (!hasLocation && !hasRemoteOrFlexible) {
      ctx.addIssue({
        code: "custom",
        path: ["preferredLocations"],
        message:
          "Add a preferred location or select a remote/flexible workplace preference.",
      });
    }
  });
