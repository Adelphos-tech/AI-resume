"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setIsPending(true);

    try {
      const { error: signOutError } = await authClient.signOut();

      if (signOutError) {
        setError("Unable to sign out. Please try again.");
        setIsPending(false);
        return;
      }
    } catch {
      setError("Unable to sign out. Please try again.");
      setIsPending(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleSignOut}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Signing out…" : "Sign out"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
