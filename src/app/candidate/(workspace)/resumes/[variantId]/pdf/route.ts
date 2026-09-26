import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { resumeExportFileName } from "@/server/resume-variants/file-name";
import { generateResumePdf } from "@/server/resume-variants/pdf";
import { getResumeVariantCore } from "@/server/resume-variants/resume-variants";
import { requireCandidateSession } from "@/server/session";

const SESSION_COOKIES = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
];

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

  const jar = await cookies();
  const sessionCookie = SESSION_COOKIES.map((n) => jar.get(n)).find(Boolean);
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let pdf: Buffer;
  try {
    pdf = await generateResumePdf({
      printPath: `/print/candidate/resume/${encodeURIComponent(variantId)}`,
      sessionToken: sessionCookie.value,
      sessionCookieName: sessionCookie.name,
      templateKey: variant.templateKey,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate the PDF right now." },
      { status: 500 },
    );
  }

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resumeExportFileName(
        variant.name,
        "pdf",
      )}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
