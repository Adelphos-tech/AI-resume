"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  CANDIDATE_NAV_PRIMARY,
  CANDIDATE_NAV_SECONDARY,
  isCandidateNavActive,
  type CandidateNavItem,
} from "@/components/candidate/candidate-nav";
import { RoleRaceLogo } from "@/components/marketing/role-race-logo";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";

interface CandidateShellProps {
  candidate: { firstName: string; lastName: string };
  children: React.ReactNode;
}

function NavItems({
  items,
  onNavigate,
}: {
  items: readonly CandidateNavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isCandidateNavActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-emerald-600/20 ring-inset"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <item.icon
                className={`size-[18px] shrink-0 ${active ? "text-emerald-700" : "text-stone-400"}`}
                aria-hidden
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AccountArea({
  candidate,
  onNavigate,
}: {
  candidate: CandidateShellProps["candidate"];
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const initials =
    `${candidate.firstName[0] ?? ""}${candidate.lastName[0] ?? ""}`.toUpperCase();

  async function signOut() {
    setPending(true);
    try {
      await authClient.signOut();
    } finally {
      router.push("/candidate/login");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white"
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-900">
          {candidate.firstName} {candidate.lastName}
        </p>
        <p className="text-xs text-stone-400">Candidate</p>
      </div>
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          void signOut();
        }}
        disabled={pending}
        aria-label="Sign out"
        className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

function SidebarContent({
  candidate,
}: {
  candidate: CandidateShellProps["candidate"];
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-8">
        <Link href="/candidate" aria-label="RoleRace dashboard">
          <RoleRaceLogo />
        </Link>
      </div>
      <nav aria-label="Candidate workspace" className="flex-1 space-y-6 px-4">
        <NavItems items={CANDIDATE_NAV_PRIMARY} />
        <div className="border-t border-stone-100 pt-5">
          <NavItems items={CANDIDATE_NAV_SECONDARY} />
        </div>
      </nav>
      <div className="p-4">
        <AccountArea candidate={candidate} />
      </div>
    </div>
  );
}

export function CandidateShell({ candidate, children }: CandidateShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-white">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 hidden w-60 border-r border-emerald-950/8 bg-white lg:block">
        <SidebarContent candidate={candidate} />
      </aside>

      {/* mobile header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-emerald-950/8 bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/candidate" aria-label="RoleRace dashboard">
          <RoleRaceLogo />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open navigation menu"
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-full flex-col">
              <div className="px-5 pt-6 pb-8">
                <RoleRaceLogo />
              </div>
              <nav
                aria-label="Candidate workspace"
                className="flex-1 space-y-6 px-4"
              >
                <NavItems
                  items={CANDIDATE_NAV_PRIMARY}
                  onNavigate={() => setOpen(false)}
                />
                <div className="border-t border-stone-100 pt-5">
                  <NavItems
                    items={CANDIDATE_NAV_SECONDARY}
                    onNavigate={() => setOpen(false)}
                  />
                </div>
              </nav>
              <div className="p-4">
                <AccountArea
                  candidate={candidate}
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* content */}
      <main className="w-full pt-14 lg:ml-60 lg:pt-0">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
