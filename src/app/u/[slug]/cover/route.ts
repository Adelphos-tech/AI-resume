import { NextResponse } from "next/server";

import { getCandidateSession } from "@/server/session";
import { prisma } from "@/server/db";
import { readCover } from "@/server/cover-photo/store";

export const runtime = "nodejs";

/**
 * Controlled cover delivery — normalized WebP only, no filesystem paths
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
      coverPhotoKey: true,
      candidateId: true,
    },
  });
  if (!profile || !profile.coverPhotoKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!profile.isPublished) {
    const session = await getCandidateSession();
    if (!session || session.candidate.id !== profile.candidateId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const cover = await readCover(profile.coverPhotoKey);
  if (!cover) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(cover), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(cover.byteLength),
      // No stale covers: replace/remove/unpublish take effect immediately.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
