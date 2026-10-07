import type { ReactNode } from "react";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";

export type DualProfileActive = "candidate" | "company";

/** Visual contract for a dual-profile skin. Each skin provides its own
 *  frame, brand bar, switch, content renderers, and CTA. */
export interface DualProfileSkin {
  /** Outer visual shell including frame, decorations, inner padding. */
  Frame: React.FC<{ children: ReactNode }>;
  /** Top brand bar with optional QR action. */
  BrandBar: React.FC<{ shareUrl?: string | null }>;
  /** Segmented switch between candidate and company profiles. */
  ProfileSwitch: React.FC<{
    value: DualProfileActive;
    onChange: (v: DualProfileActive) => void;
  }>;
  /** Candidate side content. */
  CandidateContent: React.FC<{ candidate: CompactCandidate }>;
  /** Company side content. */
  CompanyContent: React.FC<{ company: CompactCompany }>;
  /** Bottom CTA action. Receives the active side so labels can vary. */
  Cta: React.FC<{
    active: DualProfileActive;
    cta: { href: string; label: string } | null | undefined;
  }>;
}

export interface DualProfileTemplateShellProps {
  candidate: CompactCandidate;
  company?: CompactCompany | null;
  active: DualProfileActive;
  onSwitch: (v: DualProfileActive) => void;
  cta?: { href: string; label: string } | null;
  shareUrl?: string | null;
  skin: DualProfileSkin;
}

/**
 * Shared dual-profile shell — owns only the structural wiring that every
 * skin needs: conditional switch, active-side content, and CTA state.
 * Visual treatment is delegated entirely to the skin.
 */
export function DualProfileTemplateShell({
  candidate,
  company,
  active,
  onSwitch,
  cta,
  shareUrl,
  skin: {
    Frame,
    BrandBar,
    ProfileSwitch,
    CandidateContent,
    CompanyContent,
    Cta,
  },
}: DualProfileTemplateShellProps) {
  return (
    <Frame>
      <BrandBar shareUrl={shareUrl} />
      {company && (
        <div className="mt-4">
          <ProfileSwitch value={active} onChange={onSwitch} />
        </div>
      )}
      <div className="mt-5">
        {active === "company" && company ? (
          <CompanyContent company={company} />
        ) : (
          <CandidateContent candidate={candidate} />
        )}
      </div>
      <Cta active={active} cta={cta} />
    </Frame>
  );
}
