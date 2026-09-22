"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ className }: { className?: string }) {
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
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={isPending}
        className="w-full justify-start"
      >
        <LogOut />
        {isPending ? "Signing out…" : "Sign out"}
      </Button>
      {error ? (
        <p role="alert" className="text-destructive mt-2 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
