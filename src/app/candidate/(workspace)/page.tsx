import { requireCandidateSession } from "@/server/session";

export const metadata = { title: "Dashboard — RoleRace" };

export default async function CandidateDashboard() {
  const { candidate } = await requireCandidateSession();

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">
        Welcome, {candidate.firstName}
      </h1>
      <p className="text-sm leading-relaxed text-stone-600">
        Your RoleRace workspace is ready. We&rsquo;re setting up your career
        workspace.
      </p>
    </div>
  );
}
