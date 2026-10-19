"use client";

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
import type { CompactCompany } from "@/components/career-card/dev/nfc-compact-data";
import {
  CreativeSpotlightActionCard,
  CreativeSpotlightMiniCard,
  CreativeSpotlightSection,
  CreativeSpotlightSocialTile,
} from "./creative-spotlight-parts";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/** Company (Production Company) half of the Creative Spotlight skin. */
export function CreativeSpotlightCompany({
  company: c,
}: {
  company: CompactCompany;
}) {
  const logoBox = useResponsiveClasses(
    "h-24 max-w-48",
    "h-28 max-w-56",
    "h-24 max-w-48 sm:h-28 sm:max-w-56",
  );
  const logoFallback = useResponsiveClasses(
    "size-24",
    "size-28",
    "size-24 sm:size-28",
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
    <div className="space-y-4">
      {/* company header — logo, name, tagline, contact */}
      <div className="flex flex-col items-center gap-3 text-center">
        {c.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.logo}
            alt={c.companyName}
            className={`block w-auto rounded-2xl border-4 border-white bg-white object-contain p-1 shadow-lg ring-2 ring-[var(--nfc-cta)]/20 ${logoBox}`}
          />
        ) : (
          <div
            className={`overflow-hidden rounded-2xl border-4 border-white shadow-lg ring-2 ring-[var(--nfc-cta)]/20 ${logoFallback}`}
          >
            <span className="grid size-full place-items-center bg-gradient-to-br from-[var(--nfc-cta)] to-[var(--nfc-cta-hover)] text-2xl font-black text-white">
              {c.companyName[0]}
            </span>
          </div>
        )}
        <div>
          <h1
            className={`font-extrabold tracking-tight text-stone-900 ${nameSize}`}
          >
            {c.companyName}
          </h1>
          {c.tagline && (
            <p className="mt-0.5 text-[13px] font-semibold text-[var(--nfc-strong)]">
              {c.tagline}
            </p>
          )}
          {c.contactPerson && (
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-stone-500">
              <UserRound className="size-3.5" aria-hidden />
              {c.contactPerson}
              {c.contactPersonRole ? ` · ${c.contactPersonRole}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* socials */}
      <div className="flex flex-wrap justify-center gap-2">
        {c.whatsappUrl && (
          <CreativeSpotlightSocialTile
            href={c.whatsappUrl}
            label="Open WhatsApp"
          >
            <WhatsAppIcon />
          </CreativeSpotlightSocialTile>
        )}
        <CreativeSpotlightSocialTile href={c.linkedin} label="Open LinkedIn">
          <LinkedInIcon />
        </CreativeSpotlightSocialTile>
        <CreativeSpotlightSocialTile href={c.website} label="Open website">
          <Globe className="size-4" aria-hidden />
        </CreativeSpotlightSocialTile>
        <CreativeSpotlightSocialTile href={c.facebook} label="Open Facebook">
          <FacebookIcon />
        </CreativeSpotlightSocialTile>
        <CreativeSpotlightSocialTile href={c.instagram} label="Open Instagram">
          <InstagramIcon />
        </CreativeSpotlightSocialTile>
        <CreativeSpotlightSocialTile href={c.x} label="Open X">
          <XIcon />
        </CreativeSpotlightSocialTile>
        <CreativeSpotlightSocialTile href={c.youtube} label="Open YouTube">
          <YouTubeIcon />
        </CreativeSpotlightSocialTile>
        <CreativeSpotlightSocialTile href={c.tiktok} label="Open TikTok">
          <TikTokIcon />
        </CreativeSpotlightSocialTile>
      </div>

      {/* contact info */}
      {(c.publicPhone || c.publicEmail) && (
        <div className="flex flex-wrap justify-center gap-4">
          {c.publicPhone && (
            <a
              href={`tel:${c.publicPhone}`}
              className="flex items-center gap-1.5 text-xs text-stone-600 transition hover:text-[var(--nfc-strong)]"
            >
              <Phone className="size-3 text-stone-400" />
              {c.publicPhone}
            </a>
          )}
          {c.publicEmail && (
            <a
              href={`mailto:${c.publicEmail}`}
              className="flex items-center gap-1.5 text-xs text-stone-600 transition hover:text-[var(--nfc-strong)]"
            >
              <Mail className="size-3 text-stone-400" />
              {c.publicEmail}
            </a>
          )}
        </div>
      )}

      {/* about */}
      {c.about && (
        <CreativeSpotlightSection
          icon={<Building2 className="size-4" />}
          label="About"
        >
          <p className="text-xs leading-relaxed text-stone-600">{c.about}</p>
        </CreativeSpotlightSection>
      )}

      {/* mini info cards */}
      <div className={`grid gap-2 ${grid3}`}>
        <CreativeSpotlightMiniCard
          icon={<Factory className="size-3.5" />}
          label="Industry"
          lines={[c.industry ?? null]}
        />
        <CreativeSpotlightMiniCard
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
        <CreativeSpotlightMiniCard
          icon={<Layers className="size-3.5" />}
          label="Services"
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

      {/* open roles */}
      {c.hiringOpen && (
        <CreativeSpotlightActionCard
          icon={<UserRoundPlus className="size-4" />}
          label="Open Roles"
          description={
            c.openRolesSummary ??
            "Explore current opportunities and grow with us."
          }
          href={c.openRolesUrl}
        />
      )}

      {/* company profile */}
      {c.companyProfileSummary && (
        <CreativeSpotlightActionCard
          icon={<Building2 className="size-4" />}
          label="Company Profile"
          description={c.companyProfileSummary}
          href={c.companyProfileUrl}
        />
      )}
    </div>
  );
}
