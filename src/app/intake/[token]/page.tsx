import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CANDIDATE_PACKAGE_LABELS } from "@/lib/candidate-labels";
import { resolveCandidateIntakeToken } from "@/server/candidates/intake-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career Intake | RoleRace",
  robots: { index: false, follow: false },
};

export default async function IntakePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const intake = await resolveCandidateIntakeToken(token);

  if (!intake) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-wide text-primary">
        RoleRace
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Career Intake
      </h1>
      <p className="mt-6 text-muted-foreground">Hi {intake.firstName},</p>
      <p className="mt-3 text-muted-foreground">
        Your RoleRace career intake is ready. The secure intake questionnaire
        will be completed in the next module.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Package: {CANDIDATE_PACKAGE_LABELS[intake.package]}
      </p>
    </main>
  );
}
