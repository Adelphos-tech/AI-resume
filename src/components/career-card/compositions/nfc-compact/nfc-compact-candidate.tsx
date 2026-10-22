import {
  BadgeCheck,
  BookOpenText,
  Briefcase,
  CheckCircle2,
  FileText,
  Globe,
  GraduationCap,
  Mail,
  Phone,
  Settings2,
} from "lucide-react";
import {
  GitHubIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/career-card/primitives/brand-icons";
import type { CSSProperties } from "react";
import type { CompactCandidate } from "@/components/career-card/dev/nfc-compact-data";
import {
  CompactActionCard,
  CompactMiniCard,
  CompactPlainHeading,
  CompactSection,
  ContactRow,
  SocialTile,
} from "@/components/career-card/compositions/nfc-compact/nfc-compact-parts";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/** Candidate half of the NFC Compact / Dual Profile template. */
export function NfcCompactCandidate({ c }: { c: CompactCandidate }) {
  const portraitSize = useResponsiveClasses(
    "size-20",
    "size-24",
    "size-20 sm:size-24",
  );
  const grid3 = useResponsiveClasses(
    "grid-cols-1",
    "grid-cols-3",
    "grid-cols-1 sm:grid-cols-3",
  );
  const grid2 = useResponsiveClasses(
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-1 sm:grid-cols-2",
  );
  return (
    <div
      className="pm-fade space-y-3"
      style={{ animationDelay: "0.14s" } as CSSProperties}
    >
      {/* identity header — portrait left, compact contact rows */}
      <div className="flex gap-4">
        <div className="shrink-0 self-start rounded-full border border-stone-200 bg-white p-1 shadow-[0_8px_20px_-10px_rgba(41,37,36,0.2)]">
          <div
            className={`overflow-hidden rounded-full ring-2 ring-[var(--nfc-cta)]/80 ${portraitSize}`}
          >
            {c.portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.portrait}
                alt={c.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="grid size-full place-items-center bg-[var(--nfc-cta)] text-xl font-black text-white">
                {c.initials}
              </span>
            )}
          </div>
        </div>
        <div className="flex min-w-0 items-stretch gap-3">
          <span
            aria-hidden
            className="w-1 shrink-0 self-stretch rounded-full bg-[var(--nfc-cta)]/70"
          />
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-blue-950">
              {c.name}
            </h1>
            {c.headline && (
              <p className="mt-0.5 text-[13px] font-semibold text-[var(--nfc-strong)]">
                {c.headline}
              </p>
            )}
            {(c.currentRole || c.currentCompany) && (
              <p className="mt-0.5 text-xs text-slate-500">
                {[c.currentRole, c.currentCompany].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="mt-2 space-y-1">
              <ContactRow icon={<Phone />} value={c.publicPhone} />
              <ContactRow icon={<Mail />} value={c.publicEmail} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {c.whatsappUrl && (
          <SocialTile href={c.whatsappUrl} label="Open WhatsApp">
            <WhatsAppIcon />
          </SocialTile>
        )}
        <SocialTile href={c.linkedin} label="Open LinkedIn">
          <LinkedInIcon />
        </SocialTile>
        <SocialTile href={c.github} label="Open GitHub">
          <GitHubIcon />
        </SocialTile>
        <SocialTile href={c.website} label="Open website">
          <Globe className="size-4" aria-hidden />
        </SocialTile>
      </div>

      {c.professionalSummary && (
        <CompactSection
          icon={<BookOpenText className="size-4" />}
          label="Professional Summary"
        >
          <p className="text-xs leading-relaxed text-slate-600">
            {c.professionalSummary}
          </p>
        </CompactSection>
      )}

      {c.skills.length > 0 && (
        <div className="px-1">
          <CompactPlainHeading
            icon={<Settings2 className="size-3.5" />}
            label="Key Skills"
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {c.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nfc-cta)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--nfc-strong)]"
              >
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-[var(--nfc-cta)]"
                />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* three mini information cards */}
      <div className={`grid gap-2 ${grid3}`}>
        <CompactMiniCard
          icon={<GraduationCap className="size-3.5" />}
          label="Education"
          lines={
            c.education
              ? [c.education.degree, c.education.institution ?? null]
              : []
          }
        />
        <CompactMiniCard
          icon={<Briefcase className="size-3.5" />}
          label="Experience"
          lines={[
            c.yearsExperience ? `${c.yearsExperience}+ Years` : null,
            c.experienceSummary ?? null,
          ]}
        />
        <CompactMiniCard
          icon={<BadgeCheck className="size-3.5" />}
          label="Certifications"
          lines={
            c.certifications.length > 1
              ? [
                  `${c.certifications.length} Certifications`,
                  c.certifications[0].name,
                ]
              : c.certifications.slice(0, 1).map((x) => x.name)
          }
        />
      </div>

      {/* portfolio + availability pair */}
      {(c.portfolioAvailable || c.availability) && (
        <div className={`grid gap-2 ${grid2}`}>
          {c.portfolioAvailable && (
            <CompactActionCard
              icon={<FileText className="size-4" />}
              label="Portfolio / CV"
              description="View my résumé, projects and achievements"
              href={c.portfolioHref}
            />
          )}
          {c.availability && (
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-stone-50/60 p-4 shadow-[0_1px_2px_rgba(41,37,36,0.05),0_8px_24px_-14px_rgba(41,37,36,0.12)]">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)]">
                <CheckCircle2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-950">
                  Availability
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  <span className="size-1.5 rounded-full bg-white" />
                  {c.availability}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
