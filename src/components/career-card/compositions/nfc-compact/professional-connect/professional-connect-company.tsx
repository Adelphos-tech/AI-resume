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
  ProfessionalConnectActionCard,
  ProfessionalConnectMiniCard,
  ProfessionalConnectSection,
  ProfessionalConnectSocialTile,
} from "@/components/career-card/compositions/nfc-compact/professional-connect/professional-connect-parts";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/** Company half of the Professional Connect skin. */
export function ProfessionalConnectCompany({
  company: c,
}: {
  company: CompactCompany;
}) {
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
    <div className="space-y-4">
      {/* company header — logo left, identity right */}
      <div className="flex gap-3.5">
        <div className="shrink-0 self-start rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {c.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.logo}
              alt={c.companyName}
              className={`block w-auto rounded-xl bg-white object-contain p-1 ${logoBox}`}
            />
          ) : (
            <div className={`overflow-hidden rounded-xl ${logoFallback}`}>
              <span className="grid size-full place-items-center bg-[var(--nfc-cta)] text-xl font-black text-white">
                {c.companyName[0]}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1
            className={`font-extrabold tracking-tight text-slate-900 ${nameSize}`}
          >
            {c.companyName}
          </h1>
          {c.tagline && (
            <p className="mt-0.5 text-[13px] font-semibold text-[var(--nfc-strong)]">
              {c.tagline}
            </p>
          )}
          {c.contactPerson && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <UserRound className="size-3.5" aria-hidden />
              Contact Person: {c.contactPerson}
              {c.contactPersonRole ? ` · ${c.contactPersonRole}` : ""}
            </p>
          )}
          <div className="mt-2 space-y-1">
            {(c.publicPhone || c.publicEmail) && (
              <>
                {c.publicPhone && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Phone className="size-3 text-slate-400" />
                    {c.publicPhone}
                  </p>
                )}
                {c.publicEmail && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Mail className="size-3 text-slate-400" />
                    {c.publicEmail}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* socials */}
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
        <ProfessionalConnectSocialTile href={c.website} label="Open website">
          <Globe className="size-4" aria-hidden />
        </ProfessionalConnectSocialTile>
        <ProfessionalConnectSocialTile href={c.facebook} label="Open Facebook">
          <FacebookIcon />
        </ProfessionalConnectSocialTile>
        <ProfessionalConnectSocialTile
          href={c.instagram}
          label="Open Instagram"
        >
          <InstagramIcon />
        </ProfessionalConnectSocialTile>
        <ProfessionalConnectSocialTile href={c.x} label="Open X">
          <XIcon />
        </ProfessionalConnectSocialTile>
        <ProfessionalConnectSocialTile href={c.youtube} label="Open YouTube">
          <YouTubeIcon />
        </ProfessionalConnectSocialTile>
        <ProfessionalConnectSocialTile href={c.tiktok} label="Open TikTok">
          <TikTokIcon />
        </ProfessionalConnectSocialTile>
      </div>

      {c.about && (
        <ProfessionalConnectSection
          icon={<Building2 className="size-4" />}
          label="About Us"
        >
          <p className="text-xs leading-relaxed text-slate-600">{c.about}</p>
        </ProfessionalConnectSection>
      )}

      {/* three company mini cards */}
      <div className={`grid gap-2 ${grid3}`}>
        <ProfessionalConnectMiniCard
          icon={<Factory className="size-3.5" />}
          label="Industry"
          lines={[c.industry ?? null]}
        />
        <ProfessionalConnectMiniCard
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
        <ProfessionalConnectMiniCard
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
        <ProfessionalConnectActionCard
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
        <ProfessionalConnectActionCard
          icon={<Building2 className="size-4" />}
          label="Company Profile"
          description={c.companyProfileSummary}
          href={c.companyProfileUrl}
        />
      )}
    </div>
  );
}
