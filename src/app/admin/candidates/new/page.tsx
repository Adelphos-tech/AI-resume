import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { CandidateCreateForm } from "@/components/admin/candidate-create-form";
import { Button } from "@/components/ui/button";

export default function NewCandidatePage() {
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/candidates">
          <ArrowLeft />
          Back to candidates
        </Link>
      </Button>

      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Add candidate</h2>
        <p className="text-sm text-muted-foreground">
          Create a new RoleRace candidate engagement.
        </p>
      </div>

      <CandidateCreateForm />
    </div>
  );
}
