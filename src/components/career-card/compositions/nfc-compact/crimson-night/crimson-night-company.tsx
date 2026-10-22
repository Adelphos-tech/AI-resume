import {
  Building2,
  Factory,
  Globe,
  Layers,
  Mail,
  MapPin,
  Phone,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/career-card/primitives/brand-icons";
import type { CSSProperties } from "react";
import type { CompactCompany } from "@/components/career-card/dev/nfc-compact-data";
import {
  CrimsonActionCard,
  CrimsonContactRow,
  CrimsonMiniCard,
  CrimsonSection,
  CrimsonSocialTile,
} from "@/components/career-card/compositions/nfc-compact/crimson-night/crimson-night-parts";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/** Crimson Night — company half. Same IA as Career Passport Light. */
export function CrimsonNightCompany({ c }: { c: CompactCompany }) {
  const logoBox = useResponsiveClasses(
    "h-20 max-w-36",
    "h-24 max-w-40",
    "h-20 max-w-36 sm:h-24 sm:max-w-40",
  );
  const logoFallback = useResponsiveClasses(
    "size-20",
    "size-24",
    "size-20 sm:size-24",
  );
  const nameSize = useResponsiveClasses(
    "text-xl",
    "text-2xl",
    "text-xl sm:text-2xl",
  );
  const grid3 = useResponsiveClasses(
    "grid-cols-1",
    "grid-cols-3",
    "grid-cols-1 sm:grid-cols-3",
  );
  return (
    <div
      className="pm-fade space-y-4"
      style={{ animationDelay: "0.14s" } as CSSProperties}
    >
      {/* cover band — shared card cover treatment */}
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

      {/* company header — logo left, identity + contact */}
      <div className="flex gap-3.5">
        <div className="shrink-0 self-start rounded-2xl border border-white/15 bg-white/95 p-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)]">
          {c.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.logo}
              alt={c.companyName}
              className={`block w-auto rounded-xl bg-white object-contain p-1 ring-1 ring-[var(--cn-cta)]/50 ${logoBox}`}
            />
          ) : (
            <div
              className={`overflow-hidden rounded-xl ring-1 ring-[var(--cn-cta)]/50 ${logoFallback}`}
            >
              <span className="grid size-full place-items-center rounded-[9px] bg-[var(--cn-cta)] text-xl font-black text-white">
                {c.companyName[0]}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1
            className={`font-extrabold leading-tight tracking-tight text-[var(--cn-text)] ${nameSize}`}
          >
            {c.companyName}
          </h1>
          {c.tagline && (
            <p className="mt-0.5 text-[13px] font-semibold text-[var(--cn-hi)]">
              {c.tagline}
            </p>
          )}
          {c.contactPerson && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--cn-muted)]">
              <UserRound className="size-3.5" aria-hidden />
              Contact Person: {c.contactPerson}
              {c.contactPersonRole ? ` · ${c.contactPersonRole}` : ""}
            </p>
          )}
          <div className="mt-2 space-y-1">
            <CrimsonContactRow icon={<Phone />} value={c.publicPhone} />
            <CrimsonContactRow icon={<Mail />} value={c.publicEmail} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {c.whatsappUrl && (
          <CrimsonSocialTile href={c.whatsappUrl} label="Open WhatsApp">
            <WhatsAppIcon />
          </CrimsonSocialTile>
        )}
        <CrimsonSocialTile href={c.linkedin} label="Open LinkedIn">
          <LinkedInIcon />
        </CrimsonSocialTile>
        <CrimsonSocialTile href={c.website} label="Open website">
          <Globe className="size-4" aria-hidden />
        </CrimsonSocialTile>
        <CrimsonSocialTile href={c.facebook} label="Open Facebook">
          <FacebookIcon />
        </CrimsonSocialTile>
        <CrimsonSocialTile href={c.instagram} label="Open Instagram">
          <InstagramIcon />
        </CrimsonSocialTile>
        <CrimsonSocialTile href={c.x} label="Open X">
          <XIcon />
        </CrimsonSocialTile>
        <CrimsonSocialTile href={c.youtube} label="Open YouTube">
          <YouTubeIcon />
        </CrimsonSocialTile>
        <CrimsonSocialTile href={c.tiktok} label="Open TikTok">
          <TikTokIcon />
        </CrimsonSocialTile>
      </div>

      {c.about && (
        <CrimsonSection
          icon={<Building2 className="size-4" />}
          label="About Us"
        >
          <p className="text-xs leading-relaxed text-[var(--cn-muted)]">
            {c.about}
          </p>
        </CrimsonSection>
      )}

      {/* three company mini cards */}
      <div className={`grid gap-2 ${grid3}`}>
        <CrimsonMiniCard
          icon={<Factory className="size-3.5" />}
          label="Industry"
          lines={[c.industry ?? null]}
        />
        <CrimsonMiniCard
          icon={<MapPin className="size-3.5" />}
          label="Locations"
          lines={
            c.locations.length > 1
              ? [
                  `${c.locations.length} Locations`,
                  c.locations.slice(0, 2).join(" · "),
                ]
              : c.locations.slice(0, 1)
          }
        />
        <CrimsonMiniCard
          icon={<Layers className="size-3.5" />}
          label="Products / Services"
          lines={
            c.services.length > 1
              ? [
                  `${c.services.length} Services`,
                  c.services.slice(0, 2).join(" · "),
                ]
              : c.services.slice(0, 1)
          }
        />
      </div>

      {c.hiringOpen && (
        <CrimsonActionCard
          icon={<UserRoundPlus className="size-4" />}
          label="Hiring / Open Roles"
          description={
            c.openRolesSummary ??
            "Explore current opportunities and grow with us."
          }
          href={c.openRolesUrl}
        />
      )}
      {c.companyProfileSummary && (
        <CrimsonActionCard
          icon={<Building2 className="size-4" />}
          label="Company Profile"
          description={c.companyProfileSummary}
          href={c.companyProfileUrl}
        />
      )}
    </div>
  );
}
