import "server-only";

import { Document, Packer, type Paragraph } from "docx";

import type { ResumeData } from "@/lib/resume-schema";

import {
  buildAtsClassicParagraphs,
  ATS_CLASSIC_THEME,
} from "./docx/ats-classic";
import {
  buildCorporateParagraphs,
  CORPORATE_THEME,
} from "./docx/corporate-professional";
import { PAGE } from "./docx/shared";

const MAX_DOCX_BYTES = 10 * 1024 * 1024; // 10 MiB
const ZIP_SIGNATURE = Buffer.from("PK\x03\x04", "binary");

const TEMPLATE_BUILDERS: Record<
  string,
  { build: (data: ResumeData) => Paragraph[]; font: string; color: string }
> = {
  "ats-classic": {
    build: buildAtsClassicParagraphs,
    font: ATS_CLASSIC_THEME.font,
    color: ATS_CLASSIC_THEME.body,
  },
  "corporate-professional": {
    build: buildCorporateParagraphs,
    font: CORPORATE_THEME.font,
    color: CORPORATE_THEME.body,
  },
};

/**
 * Generate the DOCX for a frozen ResumeVariant.resumeData, dispatched by
 * the persisted templateKey. Consumes the same validated ResumeData and
 * shared date formatter as the React renderer — one content contract,
 * one generator per template. Pure in-memory; writes nothing.
 */
export async function generateResumeDocx(input: {
  templateKey: string;
  resumeData: ResumeData;
}): Promise<Buffer> {
  const builder = TEMPLATE_BUILDERS[input.templateKey];
  if (!builder) {
    throw new Error(`Unsupported resume template: ${input.templateKey}`);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: PAGE.margin,
          },
        },
        children: builder.build(input.resumeData),
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: builder.font,
            size: 20,
            color: builder.color,
          },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  if (
    bytes.length === 0 ||
    bytes.length > MAX_DOCX_BYTES ||
    !bytes.subarray(0, 4).equals(ZIP_SIGNATURE)
  ) {
    throw new Error("Generated DOCX failed validation");
  }
  return bytes;
}
