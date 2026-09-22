import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CandidateNotFound() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Candidate not found
        </h2>
        <p className="text-sm text-muted-foreground">
          The candidate may have been removed or the link may be invalid.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/candidates">Back to candidates</Link>
      </Button>
    </div>
  );
}
