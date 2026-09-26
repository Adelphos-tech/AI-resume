import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getResumeVariant } from "@/server/resume-variants/resume-variants";
import { resumeExportFileName } from "@/server/resume-variants/file-name";
import { generateResumePdf } from "@/server/resume-variants/pdf";
import { requireInternalSession } from "@/server/session";

// Better Auth prefixes the cookie with __Secure- when serving over HTTPS.
const SESSION_COOKIES = [
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  await requireInternalSession();
  const { id, variantId } = await params;

  const result = await getResumeVariant(variantId);
  if (!result.success || result.variant.candidateId !== id) {
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
      printPath: `/print/resume/${encodeURIComponent(id)}/${encodeURIComponent(
        variantId,
      )}`,
      sessionToken: sessionCookie.value,
      sessionCookieName: sessionCookie.name,
      templateKey: variant.templateKey,
    });
  } catch {
    // Never leak Chromium/Playwright internals to the client.
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
