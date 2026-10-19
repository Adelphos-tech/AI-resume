"use client";

import { Briefcase, Phone, Send } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import { ProfessionalConnectCandidate } from "@/components/career-card/compositions/nfc-compact/professional-connect/professional-connect-candidate";
import { ProfessionalConnectCompany } from "@/components/career-card/compositions/nfc-compact/professional-connect/professional-connect-company";
import { ProfessionalConnectSwitch } from "@/components/career-card/compositions/nfc-compact/professional-connect/professional-connect-parts";
import { NfcCompactQr } from "@/components/career-card/compositions/nfc-compact/nfc-compact-qr";
import {
  DualProfileTemplateShell,
  type DualProfileActive,
  type DualProfileSkin,
} from "@/components/career-card/compositions/nfc-compact/dual-profile-shell";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/* ── Professional Connect skin pieces ── */

function ProfessionalConnectFrame({
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
      className={`relative mx-auto w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white shadow-[0_24px_60px_-28px_rgba(30,58,138,0.18)] ${maxW}`}
    >
      {/* subtle top accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[var(--nfc-cta)]/60 to-transparent"
      />
      {/* decorative bottom wave — CSS-only */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 left-0"
      >
        <svg viewBox="0 0 430 40" className="w-full" preserveAspectRatio="none">
          <path
            d="M0,20 Q107.5,0 215,20 T430,20 L430,40 L0,40 Z"
            fill="var(--nfc-cta)"
            fillOpacity="0.08"
          />
          <path
            d="M0,28 Q107.5,8 215,28 T430,28 L430,40 L0,40 Z"
            fill="var(--nfc-cta)"
            fillOpacity="0.06"
          />
        </svg>
      </div>

      <div
        className={`relative rounded-3xl bg-white ring-1 ring-slate-100 ${innerPad}`}
      >
        {children}
      </div>
    </div>
  );
}

function ProfessionalConnectBrandBar({
  shareUrl,
  accentStyle,
}: {
  shareUrl?: string | null;
  accentStyle?: CSSProperties;
}) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <LinkMeuLogo className="h-6 sm:h-7" />
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--nfc-strong)]/60">
          NFC Profile
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
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

function ProfessionalConnectCta({
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
        {isCandidate ? (
          <Briefcase className="size-4" aria-hidden />
        ) : (
          <Phone className="size-4" aria-hidden />
        )}
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
 * Professional Connect — investor-style polished dual-profile skin.
 * Clean, modern layout with subtle decorative treatments.
 * Reuses the IT2 DualProfileTemplateShell.
 */
export function ProfessionalConnectCard({
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
      <ProfessionalConnectFrame accentStyle={accentStyle}>
        {children}
      </ProfessionalConnectFrame>
    ),
    BrandBar: ({ shareUrl: url }) => (
      <ProfessionalConnectBrandBar shareUrl={url} accentStyle={accentStyle} />
    ),
    ProfileSwitch: ProfessionalConnectSwitch,
    CandidateContent: ProfessionalConnectCandidate,
    CompanyContent: ProfessionalConnectCompany,
    Cta: ProfessionalConnectCta,
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
