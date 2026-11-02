import { NextResponse } from "next/server";

import { getCandidateSession } from "@/server/session";
import { prisma } from "@/server/db";
import { parseSponsorSlot } from "@/server/public-profile/sponsor";
import { readSponsorImage } from "@/server/sponsor-images/store";

export const runtime = "nodejs";

/**
 * Controlled sponsor-image delivery — normalized WebP only, no filesystem
 * paths exposed. Serves only when the profile is published; owner preview
 * mirrors /u/[slug]. Sponsor images are candidate-owned card assets, so
 * no company-visibility gate applies.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; slot: string }> },
) {
  const { slug, slot: rawSlot } = await params;
  const slot = parseSponsorSlot(rawSlot);
  if (!slot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = await prisma.publicProfile.findUnique({
    where: { slug },
    select: {
      isPublished: true,
      candidateId: true,
      sponsorOneImageKey: true,
      sponsorTwoImageKey: true,
    },
  });

  const key =
    slot === 1 ? profile?.sponsorOneImageKey : profile?.sponsorTwoImageKey;
  if (!profile || !key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!profile.isPublished) {
    const session = await getCandidateSession();
    if (!session || session.candidate.id !== profile.candidateId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const image = await readSponsorImage(key);
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(image.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
