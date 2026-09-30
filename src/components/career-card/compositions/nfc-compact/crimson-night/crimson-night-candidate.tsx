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
import type { CompactCandidate } from "@/components/career-card/dev/nfc-compact-data";
import {
  CrimsonActionCard,
  CrimsonContactRow,
  CrimsonMiniCard,
  CrimsonPlainHeading,
  CrimsonSection,
  CrimsonSkillChip,
  CrimsonSocialTile,
} from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-parts";

/**
 * Crimson Night — candidate half. Identical information architecture to
 * Career Passport Light; only the visual system differs.
 */
export function CrimsonNightCandidate({ c }: { c: CompactCandidate }) {
  return (
    <div className="space-y-3">
      {/* cover band — dark atmosphere over the real cover, crimson edge */}
      {c.cover && (
        <div
          aria-hidden
          className="relative -mx-4 -mt-4 h-28 overflow-hidden rounded-t-2xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.cover}
            alt=""
            className="size-full object-cover"
            style={{
              objectPosition: `${(c.coverFocalX ?? 0.5) * 100}% ${
                (c.coverFocalY ?? 0.5) * 100
              }%`,
              transform: `scale(${c.coverZoom ?? 1})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--cn-surface)] via-black/45 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--cn-cta)]/60 to-transparent" />
        </div>
      )}

      {/* identity — portrait left, compact contact rows */}
      <div className="flex gap-4">
        <div className="shrink-0 self-start rounded-full border border-white/15 bg-white/95 p-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)]">
          <div className="size-20 overflow-hidden rounded-full ring-2 ring-[var(--cn-cta)] sm:size-24">
            {c.portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.portrait}
                alt={c.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="grid size-full place-items-center bg-[var(--cn-cta)] text-xl font-black text-white">
                {c.initials}
              </span>
            )}
          </div>
        </div>
        <div className="flex min-w-0 items-stretch gap-3">
          <span
            aria-hidden
            className="w-1 shrink-0 self-stretch rounded-full bg-[var(--cn-cta)]/80"
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--cn-text)]">
              {c.name}
            </h1>
            {c.headline && (
              <p className="mt-0.5 text-[13px] font-semibold text-[var(--cn-hi)]">
                {c.headline}
              </p>
            )}
            {(c.currentRole || c.currentCompany) && (
              <p className="mt-0.5 text-xs text-[var(--cn-muted)]">
                {[c.currentRole, c.currentCompany].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="mt-2 space-y-1">
              <CrimsonContactRow icon={<Phone />} value={c.publicPhone} />
              <CrimsonContactRow icon={<Mail />} value={c.publicEmail} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {c.whatsappUrl && (
          <CrimsonSocialTile href={c.whatsappUrl} label="Open WhatsApp">
            <WhatsAppIcon />
          </CrimsonSocialTile>
        )}
        <CrimsonSocialTile href={c.linkedin} label="Open LinkedIn">
          <LinkedInIcon />
        </CrimsonSocialTile>
        <CrimsonSocialTile href={c.github} label="Open GitHub">
          <GitHubIcon />
        </CrimsonSocialTile>
        <CrimsonSocialTile href={c.website} label="Open website">
          <Globe className="size-4" aria-hidden />
        </CrimsonSocialTile>
      </div>

      {c.professionalSummary && (
        <CrimsonSection
          icon={<BookOpenText className="size-4" />}
          label="Professional Summary"
        >
          <p className="text-xs leading-relaxed text-[var(--cn-muted)]">
            {c.professionalSummary}
          </p>
        </CrimsonSection>
      )}

      {c.skills.length > 0 && (
        <div className="px-1">
          <CrimsonPlainHeading
            icon={<Settings2 className="size-3.5" />}
            label="Key Skills"
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {c.skills.map((s) => (
              <CrimsonSkillChip key={s} label={s} />
            ))}
          </div>
        </div>
      )}

      {/* three mini information cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <CrimsonMiniCard
          icon={<GraduationCap className="size-3.5" />}
          label="Education"
          lines={
            c.education
              ? [c.education.degree, c.education.institution ?? null]
              : []
          }
        />
        <CrimsonMiniCard
          icon={<Briefcase className="size-3.5" />}
          label="Experience"
          lines={[
            c.yearsExperience ? `${c.yearsExperience}+ Years` : null,
            c.experienceSummary ?? null,
          ]}
        />
        <CrimsonMiniCard
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
        <div className="grid gap-2 sm:grid-cols-2">
          {c.portfolioAvailable && (
            <CrimsonActionCard
              icon={<FileText className="size-4" />}
              label="Portfolio / CV"
              description="View my résumé, projects and achievements"
              href={c.portfolioHref}
            />
          )}
          {c.availability && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[var(--cn-elev)] p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--cn-cta)]/15 text-[var(--cn-hi)]">
                <CheckCircle2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--cn-text)]">
                  Availability
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
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
