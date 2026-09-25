import "server-only";

import { z } from "zod";

// Strict payload for the confirmed resume import. Only fields required
// for the supported merge are accepted — unknown properties are
// rejected, and no browser-supplied identifiers can reach the merge.
const str = (max: number) => z.string().trim().max(max);
const optStr = (max: number) =>
  str(max)
    .nullable()
    .transform((v) => v || null);
const optDate = z
  .string()
  .trim()
  .nullable()
  .transform((v) => v || null)
  .refine((v) => v === null || /^\d{4}$|^\d{4}-(0[1-9]|1[0-2])$/.test(v));

export const resumeImportPayloadSchema = z
  .strictObject({
    // Revision token for optimistic concurrency only — NOT authority.
    revision: z.string().trim().min(8).max(128),
    basics: z.strictObject({
      fullName: optStr(200),
      headline: optStr(300),
      email: optStr(320).refine(
        (v) => v === null || z.email().safeParse(v).success,
      ),
      phone: optStr(50),
      location: optStr(200),
      summary: optStr(5000),
      links: z
        .array(
          z.strictObject({
            label: str(100),
            url: str(2048).refine((v) => /^https?:\/\//.test(v)),
          }),
        )
        .max(20),
    }),
    work: z
      .array(
        z.strictObject({
          position: str(300),
          company: str(300),
          location: optStr(200),
          startDate: optDate,
          endDate: optDate,
          isCurrent: z.boolean(),
          highlights: z.array(str(1000)).max(30),
        }),
      )
      .max(30),
    education: z
      .array(
        z.strictObject({
          degree: str(200),
          institution: str(300),
          location: optStr(200),
          startDate: optDate,
          endDate: optDate,
        }),
      )
      .max(20),
    skills: z
      .array(
        z.strictObject({
          name: str(200),
          keywords: z.array(str(100)).max(50),
        }),
      )
      .max(30),
    projects: z
      .array(
        z.strictObject({
          name: str(300),
          url: optStr(2048).refine((v) => v === null || /^https?:\/\//.test(v)),
          highlights: z.array(str(1000)).max(30),
        }),
      )
      .max(30),
    certifications: z
      .array(
        z.strictObject({
          name: str(300),
          issuer: optStr(300),
          date: optDate,
        }),
      )
      .max(30),
    languages: z
      .array(
        z.strictObject({
          language: str(100),
          fluency: optStr(100),
        }),
      )
      .max(20),
  })
  .strict();

export type ResumeImportPayload = z.infer<typeof resumeImportPayloadSchema>;
