"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  Briefcase,
  Clapperboard,
  Film,
  Globe,
  GraduationCap,
  Languages,
  MonitorPlay,
  Play,
  Sparkles,
} from "lucide-react";
import type {
  CompactCandidate,
  CompactCompany,
} from "@/components/career-card/dev/nfc-compact-data";
import {
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/career-card/primitives/brand-icons";
import type { DualProfileActive } from "@/components/career-card/compositions/nfc-compact/dual-profile-shell";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/* ── Signature Spotlight — premium standalone Candidate skin.
   Light, elegant identity-forward layout. No Company switch.          ── */

function Section({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-stone-400">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          {label}
        </span>
      </div>
      <div className="text-sm text-stone-700">{children}</div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
      {label}
    </span>
  );
}

function SocialTile({
  href,
  label,
  children,
}: {
  href: string | null | undefined;
  label: string;
  children: ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition hover:border-stone-300 hover:text-stone-800"
    >
      {children}
    </a>
  );
}

function ActionCard({
  icon,
  label,
  description,
  href,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--nfc-cta)]/10 text-[var(--nfc-cta)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-stone-900">
          {label}
        </span>
        <span className="block text-xs text-stone-500">{description}</span>
      </span>
      <span className="text-stone-300">›</span>
    </a>
  );
}

export function SignatureSpotlightCard({
  candidate: c,
  accentStyle,
}: {
  candidate: CompactCandidate;
  company?: CompactCompany | null;
  active?: DualProfileActive;
  onSwitch?: (v: DualProfileActive) => void;
  accentStyle?: CSSProperties;
  cta?: { href: string; label: string } | null;
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
  const heroNeg = useResponsiveClasses(
    "-mx-4 -mt-4",
    "-mx-6 -mt-6",
    "-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6",
  );
  const coverH = useResponsiveClasses("h-52", "h-72", "h-52 sm:h-60 lg:h-72");
  const coverFallbackH = useResponsiveClasses(
    "h-40",
    "h-56",
    "h-40 sm:h-48 lg:h-56",
  );
  const portraitSize = useResponsiveClasses(
    "size-28",
    "size-36",
    "size-28 sm:size-32 lg:size-36",
  );
  const spacerH = useResponsiveClasses("h-14", "h-20", "h-14 sm:h-16 lg:h-20");
  const nameSize = useResponsiveClasses(
    "text-2xl",
    "text-3xl",
    "text-2xl sm:text-3xl",
  );
  const infoGrid = useResponsiveClasses(
    "grid-cols-1",
    "grid-cols-3",
    "grid-cols-1 sm:grid-cols-3",
  );
  const actionGrid = useResponsiveClasses(
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-1 sm:grid-cols-2",
  );

  const hasCategories =
    c.professionalCategories && c.professionalCategories.length > 0;
  const hasGenres = c.genres && c.genres.length > 0;
  const hasLanguages = c.languages && c.languages.length > 0;

  const socials: { href?: string | null; label: string; icon: ReactNode }[] = [
    { href: c.linkedin, label: "LinkedIn", icon: <LinkedInIcon /> },
    { href: c.website, label: "Website", icon: <Globe className="size-4" /> },
    {
      href: c.whatsappUrl,
      label: "WhatsApp",
      icon: <WhatsAppIcon />,
    },
  ];
  const activeSocials = socials.filter((s) => s.href);

  const primaryCta =
    c.showreelUrl ?? c.portfolioUrl ?? c.website ?? c.linkedin ?? null;

  return (
    <div
      style={accentStyle}
      className={`relative mx-auto w-full overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.08)] ${maxW}`}
    >
      {/* subtle top accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[var(--nfc-cta)]/50 to-transparent"
      />

      <div
        className={`relative rounded-3xl bg-white/70 ring-1 ring-stone-100 backdrop-blur-sm ${innerPad}`}
      >
        {/* ── Hero cover ── */}
        <div className={`relative overflow-hidden rounded-b-3xl ${heroNeg}`}>
          {c.cover ? (
            <div className={`relative w-full ${coverH}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.cover}
                alt=""
                className="absolute inset-0 size-full object-cover"
                style={{
                  objectPosition: `${(c.coverFocalX ?? 0.5) * 100}% ${(c.coverFocalY ?? 0.5) * 100}%`,
                  transform: `scale(${c.coverZoom ?? 1})`,
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
              />
            </div>
          ) : (
            <div
              className={`w-full bg-gradient-to-br from-stone-100 to-stone-200 ${coverFallbackH}`}
            />
          )}

          {/* Portrait overlapping cover bottom */}
          <div className="absolute right-0 bottom-0 left-0 flex justify-center translate-y-1/2">
            <div className="relative">
              <div
                className={`overflow-hidden rounded-full border-4 border-white shadow-xl ring-2 ring-[var(--nfc-cta)]/20 ${portraitSize}`}
              >
                {c.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.portrait}
                    alt={c.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center bg-gradient-to-br from-[var(--nfc-cta)] to-[var(--nfc-cta-hover)] text-2xl font-black text-white">
                    {c.initials}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for portrait overlap */}
        <div className={`${spacerH}`} />

        {/* ── Identity ── */}
        <div className="text-center">
          <h1 className={`font-bold tracking-tight text-stone-900 ${nameSize}`}>
            {c.name}
          </h1>

          {c.headline && (
            <p className="mt-1.5 text-sm font-medium text-[var(--nfc-strong)]">
              {c.headline}
            </p>
          )}

          {(c.currentRole || c.currentCompany) && (
            <p className="mt-1 text-xs text-stone-500">
              {[c.currentRole, c.currentCompany].filter(Boolean).join(" · ")}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-stone-500">
            {/* Location is not part of CompactCandidate — omitted from Builder preview. */}
          </div>
        </div>

        {/* ── Social links ── */}
        {activeSocials.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {activeSocials.map((s) => (
              <SocialTile key={s.label} href={s.href} label={s.label}>
                {s.icon}
              </SocialTile>
            ))}
          </div>
        )}

        {/* ── Bio ── */}
        {c.professionalSummary && (
          <div className="mt-4">
            <p className="text-center text-sm leading-relaxed text-stone-600">
              {c.professionalSummary}
            </p>
          </div>
        )}

        {/* ── Professional Categories ── */}
        {hasCategories && (
          <div className="mt-4">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Professional Categories
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {c.professionalCategories!.map((cat) => (
                <Chip key={cat} label={cat} />
              ))}
            </div>
          </div>
        )}

        {/* ── Info cards row ── */}
        <div className={`mt-4 grid gap-3 ${infoGrid}`}>
          {hasGenres && (
            <Section icon={<Clapperboard className="size-4" />} label="Genres">
              <div className="flex flex-wrap gap-1">
                {c.genres!.map((g) => (
                  <Chip key={g} label={g} />
                ))}
              </div>
            </Section>
          )}

          {hasLanguages && (
            <Section icon={<Languages className="size-4" />} label="Languages">
              <div className="flex flex-wrap gap-1">
                {c.languages!.map((l) => (
                  <Chip
                    key={l.language}
                    label={`${l.language}${l.fluency ? ` · ${l.fluency}` : ""}`}
                  />
                ))}
              </div>
            </Section>
          )}

          {c.availability && (
            <Section
              icon={<Briefcase className="size-4" />}
              label="Availability"
            >
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500" />
                {c.availability}
              </span>
            </Section>
          )}
        </div>

        {/* ── Portfolio + Showreel actions ── */}
        {(c.portfolioUrl || c.showreelUrl) && (
          <div className={`mt-4 grid gap-3 ${actionGrid}`}>
            {c.portfolioUrl && (
              <ActionCard
                icon={<MonitorPlay className="size-5" />}
                label="Portfolio"
                description="View portfolio and work samples"
                href={c.portfolioUrl}
              />
            )}
            {c.showreelUrl && (
              <ActionCard
                icon={<Film className="size-5" />}
                label="Showreel"
                description="Watch showreel and highlights"
                href={c.showreelUrl}
              />
            )}
          </div>
        )}

        {/* ── Experience / Education / Certifications (concise) ── */}
        <div className={`mt-4 grid gap-3 ${infoGrid}`}>
          {c.education && (
            <Section
              icon={<GraduationCap className="size-4" />}
              label="Education"
            >
              <p className="font-medium text-stone-800">{c.education.degree}</p>
              {c.education.institution && (
                <p className="text-xs text-stone-500">
                  {c.education.institution}
                </p>
              )}
            </Section>
          )}

          {(c.yearsExperience || c.experienceSummary) && (
            <Section icon={<Briefcase className="size-4" />} label="Experience">
              {c.yearsExperience && (
                <p className="font-medium text-stone-800">
                  {c.yearsExperience}+ Years
                </p>
              )}
              {c.experienceSummary && (
                <p className="text-xs text-stone-500">{c.experienceSummary}</p>
              )}
            </Section>
          )}

          {c.certifications.length > 0 && (
            <Section icon={<Sparkles className="size-4" />} label="Credentials">
              <p className="font-medium text-stone-800">
                {c.certifications[0].name}
              </p>
              {c.certifications[0].issuer && (
                <p className="text-xs text-stone-500">
                  {c.certifications[0].issuer}
                </p>
              )}
              {c.certifications.length > 1 && (
                <p className="mt-1 text-xs text-stone-400">
                  +{c.certifications.length - 1} more
                </p>
              )}
            </Section>
          )}
        </div>

        {/* ── Skills chips ── */}
        {c.skills.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Skills
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {c.skills.map((s) => (
                <Chip key={s} label={s} />
              ))}
            </div>
          </div>
        )}

        {/* ── Primary CTA ── */}
        {primaryCta && (
          <div className="mt-5">
            <a
              href={primaryCta}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--nfc-cta)] px-5 py-4 text-sm font-bold tracking-wide text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_-10px_var(--nfc-cta)] transition hover:bg-[var(--nfc-cta-hover)] active:translate-y-px"
            >
              {c.showreelUrl === primaryCta && (
                <Play className="size-4" aria-hidden fill="currentColor" />
              )}
              {c.showreelUrl === primaryCta
                ? "View Showreel"
                : c.portfolioUrl === primaryCta
                  ? "View Portfolio"
                  : "Get in Touch"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
