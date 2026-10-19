import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { CandidateAuthVisual } from "@/components/marketing/candidate-auth-visual";
import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import { getCandidateSession } from "@/server/session";

import { CandidateRegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account — LinkMeU",
  description: "Create your LinkMeU candidate account.",
};

const MARKERS = [
  "Professional templates",
  "AI-powered review",
  "Targeted for global roles",
  "PDF & DOCX export",
];

export default async function CandidateRegisterPage() {
  if (await getCandidateSession()) {
    redirect("/candidate");
  }

  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Link href="/" aria-label="LinkMeU home">
          <LinkMeuLogo className="h-8" />
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <span className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">
            Create your account
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Start your career journey with LinkMeU
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Build a structured profile, create targeted resumes, and get
            AI-powered feedback.
          </p>

          <CandidateRegisterForm />

          <p className="mt-8 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link
              href="/candidate/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Sign in
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
        <div className="relative space-y-10">
          <CandidateAuthVisual
            headline="One profile. Multiple opportunities."
            note={false}
          />
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {MARKERS.map((m) => (
              <li
                key={m}
                className="flex items-center gap-1.5 text-sm text-stone-500"
              >
                <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
