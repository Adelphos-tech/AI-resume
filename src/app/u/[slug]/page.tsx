import { notFound } from "next/navigation";

import { prisma } from "@/server/db";

type Basics = { fullName?: string | null; headline?: string | null };

export const metadata = { title: "Public Profile — RoleRace" };

/** Published state must always reflect the live database. */
export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await prisma.publicProfile.findUnique({
    where: { slug },
    include: {
      candidate: {
        include: { careerProfile: true },
      },
    },
  });
  if (!profile || !profile.isPublished) notFound();

  const basics =
    (profile.candidate.careerProfile?.profileData as { basics?: Basics } | null)
      ?.basics ?? {};
  const name =
    basics.fullName ||
    `${profile.candidate.firstName} ${profile.candidate.lastName}`.trim();
  const headline = basics.headline ?? null;

  return (
    <main className="flex min-h-dvh items-start justify-center bg-stone-50 px-4 py-16 sm:py-24">
      <section
        aria-labelledby="pp-name"
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm"
      >
        <div
          aria-hidden
          className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-700 text-lg font-bold text-white"
        >
          {name
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </div>
        <h1
          id="pp-name"
          className="mt-5 text-2xl font-bold tracking-tight text-stone-900"
        >
          {name}
        </h1>
        {headline && (
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
            {headline}
          </p>
        )}
        <p className="mt-8 text-xs font-semibold tracking-widest text-stone-400 uppercase">
          RoleRace
        </p>
      </section>
    </main>
  );
}
