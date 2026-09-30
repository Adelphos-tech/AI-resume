import { Send } from "lucide-react";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import { CrimsonNightCandidate } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-candidate";
import { CrimsonNightCompany } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-company";
import {
  CRIMSON_NIGHT_VARS,
  CrimsonSwitch,
} from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-parts";
import { CrimsonNightQr } from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-qr";

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
  active: "candidate" | "company";
  onSwitch: (v: "candidate" | "company") => void;
  cta?: { href: string; label: string } | null;
  shareUrl?: string | null;
}) {
  return (
    <div
      style={CRIMSON_NIGHT_VARS}
      className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--cn-base)] shadow-[0_32px_72px_-24px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.03)] lg:max-w-[860px]"
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

      <div className="relative m-3 rounded-3xl bg-[var(--cn-surface)] p-4 ring-1 ring-white/10 sm:p-5 lg:m-4 lg:p-6">
        {/* top brand bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--cn-cta)] text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_16px_-4px_rgba(185,28,28,0.6)]">
              R
            </span>
            <div>
              <p className="text-sm font-extrabold leading-tight text-[var(--cn-text)]">
                RoleRace
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cn-hi)]/70">
                NFC Career Card
              </p>
            </div>
          </div>
          {shareUrl && <CrimsonNightQr url={shareUrl} />}
        </header>

        {/* segmented switch */}
        {company && (
          <div className="mt-4">
            <CrimsonSwitch value={active} onChange={onSwitch} />
          </div>
        )}

        <div className="mt-5">
          {active === "company" && company ? (
            <CrimsonNightCompany c={company} />
          ) : (
            <CrimsonNightCandidate c={candidate} />
          )}
        </div>

        {/* primary CTA — strongest crimson element */}
        {cta === undefined ? (
          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cn-cta)] px-5 py-4 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_-10px_rgba(185,28,28,0.55)] transition hover:bg-[var(--cn-cta-hover)] active:translate-y-px"
          >
            <Send className="size-4 -rotate-12" aria-hidden />
            {active === "candidate" ? "Get in Touch" : "Contact Us"}
          </button>
        ) : cta ? (
          <a
            href={cta.href}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cn-cta)] px-5 py-4 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_-10px_rgba(185,28,28,0.55)] transition hover:bg-[var(--cn-cta-hover)] active:translate-y-px"
          >
            <Send className="size-4 -rotate-12" aria-hidden />
            {cta.label}
          </a>
        ) : null}
      </div>
    </div>
  );
}
