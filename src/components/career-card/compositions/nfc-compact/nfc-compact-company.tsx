import {
  Building2,
  Camera,
  Factory,
  Globe,
  Layers,
  Link2,
  AtSign,
  Mail,
  MapPin,
  Music2,
  Phone,
  Play,
  UserRound,
  UserRoundPlus,
  X,
} from "lucide-react";
import type { CompactCompany } from "@/components/career-card/dev/nfc-compact-data";
import {
  CompactActionCard,
  CompactMiniCard,
  CompactSection,
  ContactRow,
  SocialTile,
} from "@/components/career-card/compositions/nfc-compact/nfc-compact-parts";

/** Company half of the NFC Compact / Dual Profile template. */
export function NfcCompactCompany({ c }: { c: CompactCompany }) {
  return (
    <div className="space-y-3">
      {/* company header — logo left, identity + contact */}
      <div className="flex gap-3.5">
        <div className="size-20 shrink-0 overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 sm:size-24">
          {c.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.logo}
              alt={c.companyName}
              className="size-full object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center bg-[var(--nfc-cta)] text-xl font-black text-white">
              {c.companyName[0]}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-blue-950">
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
            <ContactRow icon={<Phone />} value={c.publicPhone} />
            <ContactRow icon={<Mail />} value={c.publicEmail} />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <SocialTile href={c.linkedin} label="LinkedIn">
          <AtSign className="size-4" aria-hidden />
        </SocialTile>
        <SocialTile href={c.website} label="Website">
          <Globe className="size-4" aria-hidden />
        </SocialTile>
        <SocialTile href={c.facebook} label="Facebook">
          <Link2 className="size-4" aria-hidden />
        </SocialTile>
        <SocialTile href={c.instagram} label="Instagram">
          <Camera className="size-4" aria-hidden />
        </SocialTile>
        <SocialTile href={c.x} label="X">
          <X className="size-4" aria-hidden />
        </SocialTile>
        <SocialTile href={c.youtube} label="YouTube">
          <Play className="size-4" aria-hidden />
        </SocialTile>
        <SocialTile href={c.tiktok} label="TikTok">
          <Music2 className="size-4" aria-hidden />
        </SocialTile>
      </div>

      {c.about && (
        <CompactSection
          icon={<Building2 className="size-4" />}
          label="About Us"
        >
          <p className="text-xs leading-relaxed text-slate-600">{c.about}</p>
        </CompactSection>
      )}

      {/* three company mini cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <CompactMiniCard
          icon={<Factory className="size-3.5" />}
          label="Industry"
          lines={[c.industry ?? null]}
        />
        <CompactMiniCard
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
        <CompactMiniCard
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
        <CompactActionCard
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
        <CompactActionCard
          icon={<Building2 className="size-4" />}
          label="Company Profile"
          description={c.companyProfileSummary}
          href={c.companyProfileUrl}
        />
      )}
    </div>
  );
}
