import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import Link from "next/link";

export default function IntakeNotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center px-6 py-16">
      <LinkMeuLogo className="h-7" />
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Intake link unavailable
      </h1>
      <p className="mt-6 text-muted-foreground">
        This link is invalid or no longer available.
      </p>
      <p className="mt-3 text-muted-foreground">
        Contact the LinkMeU team for a new link.
      </p>
      <p className="mt-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Return to LinkMeU
        </Link>
      </p>
    </main>
  );
}
