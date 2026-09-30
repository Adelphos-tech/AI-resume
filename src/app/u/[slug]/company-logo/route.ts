import { NextResponse } from "next/server";

import { getCandidateSession } from "@/server/session";
import { prisma } from "@/server/db";
import { readLogo } from "@/server/company-logo/store";

export const runtime = "nodejs";

/**
 * Controlled company-logo delivery — normalized WebP only, no filesystem
 * paths exposed. Serves only when the profile is published AND the company
 * profile is explicitly visible; owner preview mirrors /u/[slug].
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const profile = await prisma.publicProfile.findUnique({
    where: { slug },
    select: {
      isPublished: true,
      candidateId: true,
      company: { select: { isVisible: true, companyLogoKey: true } },
    },
  });

  const key = profile?.company?.companyLogoKey;
  if (!profile || !key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const publicOk = profile.isPublished && profile.company?.isVisible === true;
  if (!publicOk) {
    const session = await getCandidateSession();
    if (!session || session.candidate.id !== profile.candidateId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const logo = await readLogo(key);
  if (!logo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(logo), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(logo.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
