import { notFound, redirect } from "next/navigation";

import { prisma } from "@/server/db";

/**
 * Permanent Career Card redirect — /n/<opaque-token> always resolves to
 * the profile's CURRENT public slug. The physical card never changes.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const link = await prisma.publicProfileLink.findUnique({
    where: { token },
    include: { publicProfile: true },
  });
  if (!link || !link.isActive || !link.publicProfile.isPublished) {
    notFound();
  }
  redirect(`/u/${link.publicProfile.slug}`);
}
