import { redirect } from "next/navigation";

import { BrandMark } from "@/components/brand-mark";
import { getInternalSession } from "@/server/session";

import { LoginForm } from "./login-form";

function TrajectoryVisual() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 400"
      fill="none"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full"
    >
      <g className="stroke-border" opacity="0.6" strokeWidth="1">
        <path d="M0 80H600M0 160H600M0 240H600M0 320H600M120 0V400M240 0V400M360 0V400M480 0V400" />
      </g>
      <path
        d="M-20 330C120 318 185 235 300 207C415 179 468 122 620 55"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle
        cx="150"
        cy="292"
        r="5"
        className="fill-secondary stroke-primary"
        strokeWidth="2"
      />
      <circle
        cx="300"
        cy="207"
        r="5"
        className="fill-secondary stroke-primary"
        strokeWidth="2"
      />
      <circle
        cx="450"
        cy="132"
        r="5"
        className="fill-secondary stroke-primary"
        strokeWidth="2"
      />
      <circle
        cx="560"
        cy="78"
        r="14"
        className="stroke-primary"
        strokeWidth="1.5"
        opacity="0.25"
      />
      <circle cx="560" cy="78" r="6.5" className="fill-primary" />
    </svg>
  );
}

export default async function LoginPage() {
  const session = await getInternalSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-secondary p-10 lg:flex">
        <BrandMark />
        <div className="relative z-10 max-w-sm space-y-3">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-secondary-foreground">
            Build better career decisions.
          </h2>
          <p className="text-sm text-muted-foreground">Move with clarity.</p>
        </div>
        <p className="relative z-10 text-xs text-muted-foreground">
          RoleRace internal access
        </p>
        <TrajectoryVisual />
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back.
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your RoleRace workspace.
            </p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
