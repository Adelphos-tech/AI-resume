import { CandidateShell } from "@/components/candidate/candidate-shell";
import { requireCandidateSession } from "@/server/session";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { candidate } = await requireCandidateSession();

  return (
    <CandidateShell
      candidate={{
        firstName: candidate.firstName,
        lastName: candidate.lastName,
      }}
    >
      {children}
    </CandidateShell>
  );
}
