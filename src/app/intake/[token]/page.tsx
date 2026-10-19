import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IntakeForm } from "@/components/intake/intake-form";
import { resolveCandidateIntakeToken } from "@/server/candidates/intake-access";
import { getCandidateIntake } from "@/server/candidates/intake";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Career Intake | LinkMeU",
  robots: { index: false, follow: false },
};

export default async function IntakePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const resolved = await resolveCandidateIntakeToken(token);

  if (!resolved) {
    notFound();
  }

  const intake = await getCandidateIntake(token);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
      <header className="space-y-4">
        <LinkMeuLogo className="h-6" />
        <h1 className="text-3xl font-semibold tracking-tight">Career Intake</h1>
        <div className="space-y-2 text-muted-foreground">
          <p>Hi {resolved.firstName},</p>
          <p>
            Tell us where you want your career to go. You can save your progress
            and return using this secure link until it expires.
          </p>
        </div>
      </header>

      <div className="mt-10">
        <IntakeForm token={token} initial={intake} />
      </div>
    </main>
  );
}
