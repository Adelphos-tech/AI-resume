import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CandidateAuthVisual } from "@/components/marketing/candidate-auth-visual";
import { RoleRaceLogo } from "@/components/marketing/role-race-logo";
import { getCandidateSession } from "@/server/session";

import { CandidateLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — RoleRace",
  description: "Sign in to your RoleRace candidate account.",
};

export default async function CandidateLoginPage() {
  if (await getCandidateSession()) {
    redirect("/candidate");
  }

  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Link href="/" aria-label="RoleRace home">
          <RoleRaceLogo />
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <span className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
            Welcome back
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Sign in to your RoleRace account
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Continue building your career with targeted resumes and AI-powered
            feedback.
          </p>

          <CandidateLoginForm />

          <p className="mt-8 text-center text-sm text-stone-500">
            Don&rsquo;t have an account?{" "}
            <Link
              href="/candidate/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden bg-emerald-50/60 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 60% 35%, rgba(167,243,208,0.4), transparent 70%)",
          }}
        />
        <CandidateAuthVisual />
      </div>
    </main>
  );
}
