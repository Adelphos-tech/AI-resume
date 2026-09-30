import { Nfc, QrCode, Send } from "lucide-react";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import { NfcCompactCandidate } from "@/components/career-card/compositions/nfc-compact/nfc-compact-candidate";
import { NfcCompactCompany } from "@/components/career-card/compositions/nfc-compact/nfc-compact-company";
import { ProfileSwitch } from "@/components/career-card/compositions/nfc-compact/nfc-compact-parts";

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
}: {
  candidate: CompactCandidate;
  company: CompactCompany;
  active: "candidate" | "company";
  onSwitch: (v: "candidate" | "company") => void;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-sky-200/70 bg-gradient-to-b from-sky-50 via-white to-sky-50 shadow-[0_18px_50px_-20px_rgba(30,58,138,0.35)] lg:max-w-[860px]">
      {/* pale decorative corner curves — pure CSS, non-interactive */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-sky-200/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-16 size-72 rounded-full bg-sky-200/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full bg-sky-200/40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 size-80 rounded-full bg-sky-200/30"
      />

      <div className="relative m-3 rounded-3xl bg-white/95 p-4 sm:p-5 lg:m-4 lg:p-6">
        {/* top brand bar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-900 text-sm font-black text-white">
              R
            </span>
            <div>
              <p className="text-sm font-extrabold leading-tight text-blue-950">
                RoleRace
              </p>
              <p className="text-[10px] font-semibold text-blue-900/60">
                NFC Profile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-900">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold">
              <Nfc className="size-3.5" aria-hidden />
              Tap Your Phone
            </span>
            <span className="grid size-7 place-items-center rounded-md border border-sky-200 bg-sky-50">
              <QrCode className="size-4" aria-hidden />
            </span>
          </div>
        </header>

        {/* segmented candidate/company switch */}
        <div className="mt-4">
          <ProfileSwitch value={active} onChange={onSwitch} />
        </div>

        <div className="mt-5">
          {active === "candidate" ? (
            <NfcCompactCandidate c={candidate} />
          ) : (
            <NfcCompactCompany c={company} />
          )}
        </div>

        {/* primary CTA */}
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-950"
        >
          <Send className="size-4 -rotate-12" aria-hidden />
          {active === "candidate" ? "Get in Touch" : "Contact Us"}
        </button>
      </div>
    </div>
  );
}
