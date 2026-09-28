import { NextResponse } from "next/server";

import { getCandidateSession } from "@/server/session";
import { prisma } from "@/server/db";
import { readPhoto } from "@/server/profile-photo/store";

export const runtime = "nodejs";

/**
 * Controlled photo delivery — normalized WebP only, no filesystem paths
 * exposed. Unpublished profiles serve only to their owner (same privacy
 * model as /u/[slug]); everyone else gets 404.
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
      profilePhotoKey: true,
      candidateId: true,
    },
  });
  if (!profile || !profile.profilePhotoKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!profile.isPublished) {
    const session = await getCandidateSession();
    if (!session || session.candidate.id !== profile.candidateId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const photo = await readPhoto(profile.profilePhotoKey);
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(photo), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(photo.byteLength),
      // No stale photos: replace/remove/unpublish take effect immediately.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
