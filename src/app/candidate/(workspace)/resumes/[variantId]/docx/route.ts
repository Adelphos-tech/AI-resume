import { NextResponse } from "next/server";

import { generateResumeDocx } from "@/server/resume-variants/docx";
import { resumeExportFileName } from "@/server/resume-variants/file-name";
import { getResumeVariantCore } from "@/server/resume-variants/resume-variants";
import { requireCandidateSession } from "@/server/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  const { candidate } = await requireCandidateSession();
  const { variantId } = await params;

  const result = await getResumeVariantCore(variantId);
  if (!result.success || result.variant.candidateId !== candidate.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const variant = result.variant;

  let docx: Buffer;
  try {
    docx = await generateResumeDocx({
      templateKey: variant.templateKey,
      resumeData: variant.resumeData,
    });
  } catch {
    // Never leak generator internals to the client.
    return NextResponse.json(
      { error: "Unable to generate the DOCX right now." },
      { status: 500 },
    );
  }

  return new NextResponse(new Uint8Array(docx), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${resumeExportFileName(
        variant.name,
        "docx",
      )}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
