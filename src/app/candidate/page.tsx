import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { RoleRaceLogo } from "@/components/marketing/role-race-logo";
import { auth } from "@/server/auth";
import { requireCandidateSession } from "@/server/session";

export const metadata = {
  title: "Your account — RoleRace",
};

async function signOut() {
  "use server";
  await auth.api.signOut({ headers: await headers() });
  redirect("/candidate/login");
}

export default async function CandidateHome() {
  const { candidate } = await requireCandidateSession();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-emerald-50/40 px-6 py-16">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
        <div className="flex justify-center">
          <RoleRaceLogo />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Welcome to RoleRace, {candidate.firstName}
          </h1>
          <p className="text-sm leading-relaxed text-stone-600">
            Your account is ready. Candidate workspace setup continues next.
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-xl border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
