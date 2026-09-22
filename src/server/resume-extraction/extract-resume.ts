import "server-only";

import { createHash } from "node:crypto";

import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import { z } from "zod";

import type { ResumeExtractionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db";
import { readResumeFile } from "@/server/resume-storage/local";
import { requireInternalSession } from "@/server/session";

export const MAX_PDF_PAGES = 30;
export const MAX_EXTRACTED_CHARS = 200_000;
export const MIN_MEANINGFUL_CHARS = 24;

const candidateIdSchema = z.cuid();

type ExtractionErrorCode =
  | "SOURCE_FILE_MISSING"
  | "SOURCE_INTEGRITY_MISMATCH"
  | "PDF_TOO_MANY_PAGES"
  | "TEXT_TOO_LARGE"
  | "PARSER_ERROR";

type ParserOutcome =
  | { kind: "text"; text: string; pageCount: number | null; parser: string }
  | { kind: "failed"; errorCode: ExtractionErrorCode; pageCount?: number };

export type ExtractResumeResult =
  | {
      success: true;
      status: ResumeExtractionStatus;
      pageCount: number | null;
      characterCount: number;
    }
  | { success: false; message: string };

// Deterministic source-text normalization only — no interpretation.
function normalizeExtractedText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function meaningfulCharCount(text: string): number {
  return text.replace(/\s/g, "").length;
}

async function parsePdf(bytes: Buffer): Promise<ParserOutcome> {
  let pdf: Awaited<ReturnType<typeof getDocumentProxy>> | null = null;
  try {
    pdf = await getDocumentProxy(new Uint8Array(bytes), {
      // Text-only extraction: bound image decode resources defensively.
      maxImageSize: 1024 * 1024,
    });
    const pageCount = pdf.numPages;
    if (pageCount > MAX_PDF_PAGES) {
      return { kind: "failed", errorCode: "PDF_TOO_MANY_PAGES", pageCount };
    }
    const { text } = await extractText(pdf, { mergePages: true });
    return { kind: "text", text, pageCount, parser: "unpdf" };
  } catch {
    return { kind: "failed", errorCode: "PARSER_ERROR" };
  } finally {
    await pdf?.cleanup().catch(() => {});
  }
}

async function parseDocx(bytes: Buffer): Promise<ParserOutcome> {
  try {
    // extractRawText reads document.xml text only — no images, no HTML,
    // and mammoth does not fetch external/linked resources.
    const { value } = await mammoth.extractRawText({ buffer: bytes });
    return { kind: "text", text: value, pageCount: null, parser: "mammoth" };
  } catch {
    return { kind: "failed", errorCode: "PARSER_ERROR" };
  }
}

async function persistOutcome(
  resumeSourceId: string,
  sourceSha256: string,
  data: {
    status: ResumeExtractionStatus;
    extractedText: string | null;
    pageCount: number | null;
    characterCount: number | null;
    parser: string | null;
    errorCode: string | null;
  },
) {
  return prisma.candidateResumeExtraction.upsert({
    where: { resumeSourceId },
    create: {
      resumeSourceId,
      sourceSha256,
      extractedAt: new Date(),
      ...data,
    },
    update: {
      sourceSha256,
      extractedAt: new Date(),
      ...data,
    },
    select: { status: true, pageCount: true, characterCount: true },
  });
}

export async function extractCandidateResume(
  candidateId: string,
): Promise<ExtractResumeResult> {
  await requireInternalSession();

  const parsed = candidateIdSchema.safeParse(candidateId);
  if (!parsed.success) {
    return { success: false, message: "Candidate not found." };
  }

  const source = await prisma.candidateResumeSource.findUnique({
    where: { candidateId: parsed.data },
    select: {
      id: true,
      storageKey: true,
      mimeType: true,
      sha256: true,
    },
  });
  if (!source) {
    return { success: false, message: "No resume uploaded." };
  }

  const persistFailed = (errorCode: ExtractionErrorCode) =>
    persistOutcome(source.id, source.sha256, {
      status: "FAILED",
      extractedText: null,
      pageCount: null,
      characterCount: null,
      parser: null,
      errorCode,
    });

  let bytes: Buffer;
  try {
    bytes = await readResumeFile(source.storageKey);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await persistFailed("SOURCE_FILE_MISSING");
      return {
        success: true,
        status: "FAILED",
        pageCount: null,
        characterCount: 0,
      };
    }
    // Unexpected filesystem failure — do not disguise as an extraction result.
    throw error;
  }

  const actualSha256 = createHash("sha256").update(bytes).digest("hex");
  if (actualSha256 !== source.sha256) {
    await persistFailed("SOURCE_INTEGRITY_MISMATCH");
    return {
      success: true,
      status: "FAILED",
      pageCount: null,
      characterCount: 0,
    };
  }

  const outcome =
    source.mimeType === "application/pdf"
      ? await parsePdf(bytes)
      : await parseDocx(bytes);

  if (outcome.kind === "failed") {
    await persistOutcome(source.id, source.sha256, {
      status: "FAILED",
      extractedText: null,
      pageCount: outcome.pageCount ?? null,
      characterCount: null,
      parser: null,
      errorCode: outcome.errorCode,
    });
    return {
      success: true,
      status: "FAILED",
      pageCount: outcome.pageCount ?? null,
      characterCount: 0,
    };
  }

  const normalized = normalizeExtractedText(outcome.text);
  if (normalized.length > MAX_EXTRACTED_CHARS) {
    await persistOutcome(source.id, source.sha256, {
      status: "FAILED",
      extractedText: null,
      pageCount: outcome.pageCount,
      characterCount: null,
      parser: outcome.parser,
      errorCode: "TEXT_TOO_LARGE",
    });
    return {
      success: true,
      status: "FAILED",
      pageCount: outcome.pageCount,
      characterCount: 0,
    };
  }

  if (meaningfulCharCount(normalized) < MIN_MEANINGFUL_CHARS) {
    await persistOutcome(source.id, source.sha256, {
      status: "NO_TEXT",
      extractedText: null,
      pageCount: outcome.pageCount,
      characterCount: 0,
      parser: outcome.parser,
      errorCode: null,
    });
    return {
      success: true,
      status: "NO_TEXT",
      pageCount: outcome.pageCount,
      characterCount: 0,
    };
  }

  const record = await persistOutcome(source.id, source.sha256, {
    status: "SUCCEEDED",
    extractedText: normalized,
    pageCount: outcome.pageCount,
    characterCount: normalized.length,
    parser: outcome.parser,
    errorCode: null,
  });

  return {
    success: true,
    status: record.status,
    pageCount: record.pageCount,
    characterCount: record.characterCount ?? 0,
  };
}
