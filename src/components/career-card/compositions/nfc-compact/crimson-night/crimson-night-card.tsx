import { Send } from "lucide-react";
import type { ReactNode } from "react";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import { CrimsonNightCandidate } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-candidate";
import { CrimsonNightCompany } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-company";
import {
  CRIMSON_NIGHT_VARS,
  CrimsonSwitch,
} from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-parts";
import { CrimsonNightQr } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-qr";
import {
  DualProfileTemplateShell,
  type DualProfileActive,
  type DualProfileSkin,
} from "@/components/career-card/compositions/nfc-compact/dual-profile-shell";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/* ── Crimson Night skin pieces ── */

function CrimsonNightFrame({ children }: { children: ReactNode }) {
  const maxW = useResponsiveClasses(
    "max-w-[390px]",
    "max-w-[860px]",
    "max-w-[430px] lg:max-w-[860px]",
  );
  const innerPad = useResponsiveClasses(
    "m-3 ml-4 p-4",
    "m-4 ml-5 p-6",
    "m-3 ml-4 p-4 sm:p-5 lg:m-4 lg:ml-5 lg:p-6",
  );
  return (
    <div
      style={CRIMSON_NIGHT_VARS}
      className={`pm-fade relative mx-auto w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--cn-base)] shadow-[0_32px_72px_-24px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.03)] ${maxW}`}
    >
      {/* crimson edge rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[var(--cn-cta)]/90"
      />
      {/* dark atmosphere — restrained red glow top-right, fade to charcoal */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_85%_0%,rgba(185,28,28,0.14),transparent_60%)]"
      />
      {/* thin crimson trail across the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-3 right-0 left-0 h-px bg-gradient-to-r from-transparent via-[var(--cn-cta)]/40 to-transparent"
      />
      {/* RoleRace pixel motif — crimson + faint white fragments */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-4 right-4 grid grid-cols-2 gap-1 opacity-50"
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-1.5 rounded-[2px] ${
              i === 0 || i === 3 ? "bg-[var(--cn-cta)]" : "bg-white/20"
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
              i === 1 || i === 2 ? "bg-[var(--cn-cta)]" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      <div
        className={`relative rounded-3xl bg-[var(--cn-surface)] ring-1 ring-white/10 ${innerPad}`}
      >
        {children}
      </div>
    </div>
  );
}

function CrimsonNightBrandBar({ shareUrl }: { shareUrl?: string | null }) {
  return (
    <header
      className="pm-fade flex items-center justify-between"
      style={{ animationDelay: "0.06s" }}
    >
      <div>
        <LinkMeuLogo className="h-6 sm:h-7" variant="dark" />
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--cn-hi)]/70">
          NFC Career Card
        </p>
      </div>
      {shareUrl && <CrimsonNightQr url={shareUrl} />}
    </header>
  );
}

function CrimsonNightCandidateAdapter({
  candidate,
}: {
  candidate: CompactCandidate;
}) {
  return <CrimsonNightCandidate c={candidate} />;
}

function CrimsonNightCompanyAdapter({ company }: { company: CompactCompany }) {
  return <CrimsonNightCompany c={company} />;
}

function CrimsonNightCta({
  active,
  cta,
}: {
  active: DualProfileActive;
  cta: { href: string; label: string } | null | undefined;
}) {
  const label = active === "candidate" ? "Get in Touch" : "Contact Us";
  const cls =
    "pm-fade mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cn-cta)] px-5 py-4 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_-10px_rgba(185,28,28,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--cn-cta-hover)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_32px_-10px_rgba(185,28,28,0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cn-hi)] active:translate-y-0 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_-6px_rgba(185,28,28,0.45)]";

  if (cta === undefined) {
    return (
      <button type="button" className={cls} style={{ animationDelay: "0.2s" }}>
        <Send className="size-4 -rotate-12" aria-hidden />
        {label}
      </button>
    );
  }
  if (cta) {
    return (
      <a href={cta.href} className={cls} style={{ animationDelay: "0.2s" }}>
        <Send className="size-4 -rotate-12" aria-hidden />
        {cta.label}
      </a>
    );
  }
  return null;
}

/* ── exported card ── */

/**
 * Crimson Night — dark premium skin for the NFC Compact composition.
 * Dev-lab only for now: same structure, same data types, same
 * interactions as Career Passport Light — only the visual system differs.
 * ~75% dark neutral, ~25% crimson at focal points (rail, identity,
 * toggle, icons, CTA, QR accents).
 */
export function CrimsonNightCard({
  candidate,
  company,
  active,
  onSwitch,
  cta,
  shareUrl,
}: {
  candidate: CompactCandidate;
  company?: CompactCompany | null;
  active: DualProfileActive;
  onSwitch: (v: DualProfileActive) => void;
  cta?: { href: string; label: string } | null;
  shareUrl?: string | null;
}) {
  const skin: DualProfileSkin = {
    Frame: CrimsonNightFrame,
    BrandBar: CrimsonNightBrandBar,
    ProfileSwitch: CrimsonSwitch,
    CandidateContent: CrimsonNightCandidateAdapter,
    CompanyContent: CrimsonNightCompanyAdapter,
    Cta: CrimsonNightCta,
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
