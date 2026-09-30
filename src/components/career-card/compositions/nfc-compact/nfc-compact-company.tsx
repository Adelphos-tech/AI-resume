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
        <div className="shrink-0 self-start rounded-2xl border border-stone-200 bg-white p-1">
          <div className="size-20 overflow-hidden rounded-xl ring-1 ring-[var(--nfc-cta)]/40 sm:size-24">
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
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-950">
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
      <div className="flex flex-wrap items-center gap-2">
        {c.whatsappUrl && (
          <a
            href={c.whatsappUrl}
            aria-label="Open WhatsApp"
            className="grid size-8 place-items-center rounded-full bg-[var(--nfc-cta)] text-white transition hover:bg-[var(--nfc-cta-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nfc-cta)]"
          >
            {/* WhatsApp brand glyph — inline SVG, same tile system as the other socials */}
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.78-1.48-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.07c.15.2 2.1 3.21 5.08 4.5.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.73.98.99-3.64-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.88 9.9c0 5.44-4.44 9.87-9.9 9.87M20.5 3.49A11.85 11.85 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.87 11.87 0 0 0 5.68 1.45h.01c6.55 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.44-8.41" />
            </svg>
          </a>
        )}
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
