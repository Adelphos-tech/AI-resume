"use client";

import type { CSSProperties, ReactNode } from "react";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import { CreativeSpotlightCandidate } from "./creative-spotlight-candidate";
import { CreativeSpotlightCompany } from "./creative-spotlight-company";
import { CreativeSpotlightSwitch } from "./creative-spotlight-parts";
import { NfcCompactQr } from "@/components/career-card/compositions/nfc-compact/nfc-compact-qr";
import {
  DualProfileTemplateShell,
  type DualProfileActive,
  type DualProfileSkin,
} from "@/components/career-card/compositions/nfc-compact/dual-profile-shell";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/* ── Creative Spotlight skin pieces ── */

function CreativeSpotlightFrame({
  children,
  accentStyle,
}: {
  children: ReactNode;
  accentStyle?: CSSProperties;
}) {
  const maxW = useResponsiveClasses(
    "max-w-[390px]",
    "max-w-[860px]",
    "max-w-[430px] lg:max-w-[860px]",
  );
  const innerPad = useResponsiveClasses(
    "m-3 p-4",
    "m-4 p-6",
    "m-3 p-4 sm:p-5 lg:m-4 lg:p-6",
  );
  return (
    <div
      style={accentStyle}
      className={`relative mx-auto w-full overflow-hidden rounded-[2rem] border border-stone-200/80 bg-gradient-to-b from-amber-50/40 via-white to-stone-50 shadow-[0_24px_60px_-28px_rgba(120,53,15,0.12)] ${maxW}`}
    >
      {/* subtle top accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[var(--nfc-cta)]/50 to-transparent"
      />
      {/* decorative bottom spotlight wave */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 left-0"
      >
        <svg viewBox="0 0 430 48" className="w-full" preserveAspectRatio="none">
          <path
            d="M0,24 Q107.5,4 215,24 T430,24 L430,48 L0,48 Z"
            fill="var(--nfc-cta)"
            fillOpacity="0.06"
          />
          <path
            d="M0,32 Q107.5,12 215,32 T430,32 L430,48 L0,48 Z"
            fill="var(--nfc-cta)"
            fillOpacity="0.04"
          />
        </svg>
      </div>

      <div
        className={`relative rounded-3xl bg-white/70 ring-1 ring-stone-100 backdrop-blur-sm ${innerPad}`}
      >
        {children}
      </div>
    </div>
  );
}

function CreativeSpotlightBrandBar({
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
          <p className="text-sm font-extrabold leading-tight text-stone-900">
            RoleRace
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nfc-strong)]/60">
            Creative Spotlight
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-600">
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 8.5a2.5 2.5 0 015 0v3a2.5 2.5 0 01-5 0v-3z" />
            <path d="M13 8.5a2.5 2.5 0 015 0v3a2.5 2.5 0 01-5 0v-3z" />
            <path d="M3.5 11v2a8.5 8.5 0 0017 0v-2" />
          </svg>
          Tap Your Phone
        </div>
        {shareUrl && <NfcCompactQr url={shareUrl} accentStyle={accentStyle} />}
      </div>
    </header>
  );
}

function CreativeSpotlightCta({
  active,
  cta,
}: {
  active: DualProfileActive;
  cta: { href: string; label: string } | null | undefined;
}) {
  const isCandidate = active === "candidate";
  const label = isCandidate ? "Get in Touch" : "Contact Us";
  const cls =
    "mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--nfc-cta)] px-5 py-4 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_-10px_var(--nfc-cta)] transition hover:bg-[var(--nfc-cta-hover)] active:translate-y-px";

  if (cta === undefined) {
    return (
      <button type="button" className={cls}>
        {label}
      </button>
    );
  }
  if (cta) {
    return (
      <a href={cta.href} className={cls}>
        {cta.label}
      </a>
    );
  }
  return null;
}

/* ── exported card ── */

/**
 * Creative Spotlight — Celebrity and Production Company dual-profile skin.
 * Warm, elegant layout with spotlight decorative treatments.
 * Reuses the DualProfileTemplateShell.
 */
export function CreativeSpotlightCard({
  candidate,
  company,
  active,
  onSwitch,
  cta,
  accentStyle,
  shareUrl,
}: {
  candidate: CompactCandidate;
  company?: CompactCompany | null;
  active: DualProfileActive;
  onSwitch: (v: DualProfileActive) => void;
  accentStyle?: CSSProperties;
  shareUrl?: string | null;
  cta?: { href: string; label: string } | null;
}) {
  const skin: DualProfileSkin = {
    Frame: ({ children }) => (
      <CreativeSpotlightFrame accentStyle={accentStyle}>
        {children}
      </CreativeSpotlightFrame>
    ),
    BrandBar: ({ shareUrl: url }) => (
      <CreativeSpotlightBrandBar shareUrl={url} accentStyle={accentStyle} />
    ),
    ProfileSwitch: ({ value, onChange }) => (
      <CreativeSpotlightSwitch value={value} onChange={onChange} />
    ),
    CandidateContent: CreativeSpotlightCandidate,
    CompanyContent: CreativeSpotlightCompany,
    Cta: CreativeSpotlightCta,
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
