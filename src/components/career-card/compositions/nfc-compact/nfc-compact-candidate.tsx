import {
  BadgeCheck,
  BookOpenText,
  Briefcase,
  CheckCircle2,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  AtSign,
  Mail,
  Phone,
  Settings2,
} from "lucide-react";
import type { CompactCandidate } from "@/components/career-card/dev/nfc-compact-data";
import {
  CompactActionCard,
  CompactMiniCard,
  CompactSection,
  ContactRow,
  SocialTile,
} from "@/components/career-card/compositions/nfc-compact/nfc-compact-parts";

/** Candidate half of the NFC Compact / Dual Profile template. */
export function NfcCompactCandidate({ c }: { c: CompactCandidate }) {
  return (
    <div className="space-y-3">
      {/* identity header — portrait left, compact contact rows */}
      <div className="flex gap-3.5">
        <div className="size-20 shrink-0 overflow-hidden rounded-full border-2 border-[var(--nfc-strong)]/80 bg-sky-100 sm:size-24">
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
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-blue-950">
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
      <div className="flex gap-2">
        <SocialTile href={c.linkedin} label="LinkedIn">
          <AtSign className="size-4" aria-hidden />
        </SocialTile>
        <SocialTile href={c.github} label="GitHub">
          <FolderGit2 className="size-4" aria-hidden />
        </SocialTile>
        <SocialTile href={c.website} label="Website">
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
        <CompactSection
          icon={<Settings2 className="size-4" />}
          label="Key Skills"
        >
          <div className="flex flex-wrap gap-1.5">
            {c.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--nfc-strong)]"
              >
                {s}
              </span>
            ))}
          </div>
        </CompactSection>
      )}

      {/* three mini information cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
        <div className="grid gap-2 sm:grid-cols-2">
          {c.portfolioAvailable && (
            <CompactActionCard
              icon={<FileText className="size-4" />}
              label="Portfolio / CV"
              description="View my résumé, projects and achievements"
              href={c.portfolioHref}
            />
          )}
          {c.availability && (
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-sky-200 bg-white text-[var(--nfc-strong)]">
                <CheckCircle2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-blue-950">Availability</p>
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
