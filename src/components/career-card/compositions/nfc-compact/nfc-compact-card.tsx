"use client";

import { Send } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import { NfcCompactCandidate } from "@/components/career-card/compositions/nfc-compact/nfc-compact-candidate";
import { NfcCompactCompany } from "@/components/career-card/compositions/nfc-compact/nfc-compact-company";
import { ProfileSwitch } from "@/components/career-card/compositions/nfc-compact/nfc-compact-parts";
import { NfcCompactQr } from "@/components/career-card/compositions/nfc-compact/nfc-compact-qr";
import {
  DualProfileTemplateShell,
  type DualProfileActive,
  type DualProfileSkin,
} from "@/components/career-card/compositions/nfc-compact/dual-profile-shell";

/* ── Career Passport skin pieces ── */

function NfcCompactFrame({
  children,
  accentStyle,
}: {
  children: ReactNode;
  accentStyle?: CSSProperties;
}) {
  return (
    <div
      style={accentStyle}
      className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-stone-200/80 bg-[#fafaf9] shadow-[0_24px_60px_-28px_rgba(41,37,36,0.28)] lg:max-w-[860px]"
    >
      {/* credential edge rail + subtle cool tint — pure CSS, non-interactive */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[var(--nfc-cta)]/85"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/50 via-transparent to-transparent"
      />
      {/* RoleRace geometric credential motif — top-right + bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-4 right-4 grid grid-cols-2 gap-1 opacity-50"
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-1.5 rounded-[2px] ${
              i === 0 || i === 3 ? "bg-[var(--nfc-cta)]" : "bg-stone-300"
            }`}
          />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-4 left-4 grid grid-cols-2 gap-1 opacity-40"
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-1.5 rounded-[2px] ${
              i === 1 || i === 2 ? "bg-[var(--nfc-cta)]" : "bg-stone-300"
            }`}
          />
        ))}
      </div>

      <div className="relative m-3 rounded-3xl bg-white p-4 ring-1 ring-stone-100 sm:p-5 lg:m-4 lg:p-6">
        {children}
      </div>
    </div>
  );
}

function NfcCompactBrandBar({
  shareUrl,
  accentStyle,
}: {
  shareUrl?: string | null;
  accentStyle?: CSSProperties;
}) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-[var(--nfc-cta)] text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
          R
        </span>
        <div>
          <p className="text-sm font-extrabold leading-tight text-blue-950">
            RoleRace
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nfc-strong)]/60">
            NFC Career Card
          </p>
        </div>
      </div>
      {shareUrl && <NfcCompactQr url={shareUrl} accentStyle={accentStyle} />}
    </header>
  );
}

function NfcCompactCandidateAdapter({
  candidate,
}: {
  candidate: CompactCandidate;
}) {
  return <NfcCompactCandidate c={candidate} />;
}

function NfcCompactCompanyAdapter({ company }: { company: CompactCompany }) {
  return <NfcCompactCompany c={company} />;
}

function NfcCompactCta({
  active,
  cta,
}: {
  active: DualProfileActive;
  cta: { href: string; label: string } | null | undefined;
}) {
  const label = active === "candidate" ? "Get in Touch" : "Contact Us";
  const cls =
    "mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nfc-cta)] px-5 py-4 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_-10px_var(--nfc-cta)] transition hover:bg-[var(--nfc-cta-hover)] active:translate-y-px";

  if (cta === undefined) {
    return (
      <button type="button" className={cls}>
        <Send className="size-4 -rotate-12" aria-hidden />
        {label}
      </button>
    );
  }
  if (cta) {
    return (
      <a href={cta.href} className={cls}>
        <Send className="size-4 -rotate-12" aria-hidden />
        {cta.label}
      </a>
    );
  }
  return null;
}

/* ── exported card ── */

/**
 * NFC Compact / Dual Profile template — dev-only lab.
 * Compact, dense, action-oriented professional NFC identity card.
 * Static; no motion; no persistence.
 */
export function NfcCompactCard({
  candidate,
  company,
  active,
  onSwitch,
  cta,
  accentStyle,
  shareUrl,
}: {
  candidate: CompactCandidate;
  /** Absent → Candidate-only card; the segmented switch is not rendered. */
  company?: CompactCompany | null;
  active: DualProfileActive;
  onSwitch: (v: DualProfileActive) => void;
  /**
   * Finite trusted accent CSS variables (see nfc-compact-accents.ts).
   * Omitted → the composition's frozen default blue palette.
   */
  accentStyle?: CSSProperties;
  /**
   * Permanent public share URL (/n/<token>) for the QR action. Absent →
   * the QR button is not rendered (dev lab / profiles without a link).
   */
  shareUrl?: string | null;
  /**
   * Production CTA contract: {href,label} renders a real link, `null`
   * hides the CTA entirely. When the prop is omitted the card renders the
   * original static lab button (dev lab only).
   */
  cta?: { href: string; label: string } | null;
}) {
  const skin: DualProfileSkin = {
    Frame: ({ children }) => (
      <NfcCompactFrame accentStyle={accentStyle}>{children}</NfcCompactFrame>
    ),
    BrandBar: ({ shareUrl: url }) => (
      <NfcCompactBrandBar shareUrl={url} accentStyle={accentStyle} />
    ),
    ProfileSwitch,
    CandidateContent: NfcCompactCandidateAdapter,
    CompanyContent: NfcCompactCompanyAdapter,
    Cta: NfcCompactCta,
  };

  return (
    <DualProfileTemplateShell
      candidate={candidate}
      company={company}
      active={active}
      onSwitch={onSwitch}
      cta={cta}
      shareUrl={shareUrl}
      skin={skin}
    />
  );
}
