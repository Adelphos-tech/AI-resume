import { z } from "zod";

/**
 * Versioned browser-safe contract for the explicit AI resume review.
 * Qualitative only — numeric scores are not part of the contract.
 */

const findingStatus = z.enum(["strong", "supporting", "weak"]);

const reviewDimension = z.enum([
  "role_alignment",
  "evidence",
  "skills",
  "clarity",
  "achievement",
  "country",
  "ats",
]);

const overallStatus = z.enum([
  "strong_fit",
  "good_foundation",
  "needs_strengthening",
]);

export const aiResumeReviewSchema = z.strictObject({
  schemaVersion: z.literal(1),
  overall: z.strictObject({
    status: overallStatus,
    summary: z.string().min(1).max(1200),
  }),
  findings: z
    .array(
      z.strictObject({
        blockId: z.string().min(1).max(200),
        quote: z.string().min(1).max(500),
        status: findingStatus,
        dimension: reviewDimension,
        reason: z.string().min(1).max(800),
        guidance: z.string().max(800).nullable(),
      }),
    )
    .max(20),
  gaps: z
    .array(
      z.strictObject({
        category: z.string().min(1).max(100),
        reason: z.string().min(1).max(800),
        guidance: z.string().max(800).nullable(),
      }),
    )
    .max(10),
});

export type AiResumeReview = z.infer<typeof aiResumeReviewSchema>;

/** Max characters accepted for the optional job-description input. */
export const JOB_DESCRIPTION_MAX = 8000;

/**
 * Strict JSON Schema mirror of the contract for Groq Structured Outputs.
 * additionalProperties: false on every object, all properties required,
 * optionality expressed through nullable types.
 */
export const AI_RESUME_REVIEW_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "overall", "findings", "gaps"],
  properties: {
    schemaVersion: { type: "integer", enum: [1] },
    overall: {
      type: "object",
      additionalProperties: false,
      required: ["status", "summary"],
      properties: {
        status: {
          type: "string",
          enum: ["strong_fit", "good_foundation", "needs_strengthening"],
        },
        summary: { type: "string" },
      },
    },
    findings: {
      type: "array",
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "blockId",
          "quote",
          "status",
          "dimension",
          "reason",
          "guidance",
        ],
        properties: {
          blockId: { type: "string" },
          quote: { type: "string" },
          status: { type: "string", enum: ["strong", "supporting", "weak"] },
          dimension: {
            type: "string",
            enum: [
              "role_alignment",
              "evidence",
              "skills",
              "clarity",
              "achievement",
              "country",
              "ats",
            ],
          },
          reason: { type: "string" },
          guidance: { type: ["string", "null"] },
        },
      },
    },
    gaps: {
      type: "array",
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["category", "reason", "guidance"],
        properties: {
          category: { type: "string" },
          reason: { type: "string" },
          guidance: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;
