import { requireInternalSession } from "@/server/session";

import { SignOutButton } from "./sign-out-button";

export default async function AdminPage() {
  const session = await requireInternalSession();

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            RoleRace Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Authentication successful.
          </p>
        </div>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Signed in as: </span>
            {session.user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Role: </span>
            {session.user.role}
          </p>
        </div>
        <SignOutButton />
      </div>
    </main>
  );
}
