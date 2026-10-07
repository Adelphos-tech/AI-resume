import {
  BadgeCheck,
  BookOpenText,
  Briefcase,
  CheckCircle2,
  FileText,
  Globe,
  GraduationCap,
  Settings2,
} from "lucide-react";
import {
  GitHubIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/career-card/primitives/brand-icons";
import type { CompactCandidate } from "@/components/career-card/dev/nfc-compact-data";
import {
  ProfessionalConnectActionCard,
  ProfessionalConnectMiniCard,
  ProfessionalConnectPlainHeading,
  ProfessionalConnectSection,
  ProfessionalConnectSocialTile,
} from "@/components/career-card/compositions/nfc-compact/professional-connect/professional-connect-parts";

/** Candidate half of the Professional Connect skin. */
export function ProfessionalConnectCandidate({
  candidate: c,
}: {
  candidate: CompactCandidate;
}) {
  return (
    <div className="space-y-4">
      {/* identity header — portrait left, identity right */}
      <div className="flex gap-4">
        <div className="shrink-0 self-start rounded-full border-2 border-white shadow-md">
          <div className="size-20 overflow-hidden rounded-full sm:size-24">
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
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
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
        </div>
      </div>

      {/* social row — brand-colored circular tiles matching investor reference */}
      <div className="flex flex-wrap items-center gap-2">
        {c.whatsappUrl && (
          <ProfessionalConnectSocialTile
            href={c.whatsappUrl}
            label="Open WhatsApp"
          >
            <WhatsAppIcon />
          </ProfessionalConnectSocialTile>
        )}
        <ProfessionalConnectSocialTile href={c.linkedin} label="Open LinkedIn">
          <LinkedInIcon />
        </ProfessionalConnectSocialTile>
        <ProfessionalConnectSocialTile href={c.github} label="Open GitHub">
          <GitHubIcon />
        </ProfessionalConnectSocialTile>
        <ProfessionalConnectSocialTile href={c.website} label="Open website">
          <Globe className="size-4" aria-hidden />
        </ProfessionalConnectSocialTile>
      </div>

      {c.professionalSummary && (
        <ProfessionalConnectSection
          icon={<BookOpenText className="size-4" />}
          label="Professional Summary"
        >
          <p className="text-xs leading-relaxed text-slate-600">
            {c.professionalSummary}
          </p>
        </ProfessionalConnectSection>
      )}

      {c.skills.length > 0 && (
        <div className="px-0.5">
          <ProfessionalConnectPlainHeading
            icon={<Settings2 className="size-3.5" />}
            label="Key Skills"
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {c.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nfc-cta)]/10 px-3 py-1 text-[11px] font-semibold text-[var(--nfc-strong)]"
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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ProfessionalConnectMiniCard
          icon={<GraduationCap className="size-3.5" />}
          label="Education"
          lines={
            c.education
              ? [c.education.degree, c.education.institution ?? null]
              : []
          }
        />
        <ProfessionalConnectMiniCard
          icon={<Briefcase className="size-3.5" />}
          label="Experience"
          lines={[
            c.yearsExperience ? `${c.yearsExperience}+ Years` : null,
            c.experienceSummary ?? null,
          ]}
        />
        <ProfessionalConnectMiniCard
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
            <ProfessionalConnectActionCard
              icon={<FileText className="size-4" />}
              label="Portfolio / CV"
              description="View my résumé, projects and achievements"
              href={c.portfolioHref}
            />
          )}
          {c.availability && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--nfc-cta)]/10 text-[var(--nfc-strong)]">
                <CheckCircle2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
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
