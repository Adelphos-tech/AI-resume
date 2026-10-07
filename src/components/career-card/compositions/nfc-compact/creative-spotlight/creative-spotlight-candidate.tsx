"use client";

import {
  BookOpenText,
  Briefcase,
  Film,
  GraduationCap,
  Languages,
  MonitorPlay,
  Sparkles,
} from "lucide-react";
import {
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/career-card/primitives/brand-icons";
import type { CompactCandidate } from "@/components/career-card/dev/nfc-compact-data";
import {
  CreativeSpotlightActionCard,
  CreativeSpotlightChip,
  CreativeSpotlightMiniCard,
  CreativeSpotlightSection,
  CreativeSpotlightSocialTile,
} from "./creative-spotlight-parts";
import { useResponsiveClasses } from "@/components/candidate/public-profile/preview-mode-context";

/** Candidate (Celebrity) half of the Creative Spotlight skin. */
export function CreativeSpotlightCandidate({
  candidate: c,
}: {
  candidate: CompactCandidate;
}) {
  const portraitSize = useResponsiveClasses(
    "size-28",
    "size-32",
    "size-28 sm:size-32",
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
  const grid2 = useResponsiveClasses(
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-1 sm:grid-cols-2",
  );
  return (
    <div className="space-y-4">
      {/* identity header — large portrait, name, headline, location */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div
            className={`overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ring-[var(--nfc-cta)]/20 ${portraitSize}`}
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
        <div>
          <h1
            className={`font-extrabold tracking-tight text-stone-900 ${nameSize}`}
          >
            {c.name}
          </h1>
          {c.headline && (
            <p className="mt-0.5 text-[13px] font-semibold text-[var(--nfc-strong)]">
              {c.headline}
            </p>
          )}
          {(c.currentRole || c.currentCompany) && (
            <p className="mt-0.5 text-xs text-stone-500">
              {[c.currentRole, c.currentCompany].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* social row */}
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
          <Sparkles className="size-4" aria-hidden />
        </CreativeSpotlightSocialTile>
      </div>

      {/* professional categories */}
      {c.professionalCategories && c.professionalCategories.length > 0 && (
        <div>
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Professional Categories
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {c.professionalCategories.map((cat) => (
              <CreativeSpotlightChip key={cat} label={cat} />
            ))}
          </div>
        </div>
      )}

      {/* genres */}
      {c.genres && c.genres.length > 0 && (
        <div>
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Genres
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {c.genres.map((g) => (
              <CreativeSpotlightChip key={g} label={g} />
            ))}
          </div>
        </div>
      )}

      {/* bio */}
      {c.professionalSummary && (
        <CreativeSpotlightSection
          icon={<BookOpenText className="size-4" />}
          label="Biography"
        >
          <p className="text-xs leading-relaxed text-stone-600">
            {c.professionalSummary}
          </p>
        </CreativeSpotlightSection>
      )}

      {/* mini info cards */}
      <div className={`grid gap-2 ${grid3}`}>
        <CreativeSpotlightMiniCard
          icon={<GraduationCap className="size-3.5" />}
          label="Education"
          lines={
            c.education
              ? [c.education.degree, c.education.institution ?? null]
              : []
          }
        />
        <CreativeSpotlightMiniCard
          icon={<Briefcase className="size-3.5" />}
          label="Experience"
          lines={[
            c.yearsExperience ? `${c.yearsExperience}+ Years` : null,
            c.experienceSummary ?? null,
          ]}
        />
        <CreativeSpotlightMiniCard
          icon={<Languages className="size-3.5" />}
          label="Languages"
          lines={
            c.languages && c.languages.length > 0
              ? c.languages.map(
                  (l) => `${l.language}${l.fluency ? ` · ${l.fluency}` : ""}`,
                )
              : []
          }
        />
      </div>

      {/* portfolio + showreel actions */}
      <div className={`grid gap-2 ${grid2}`}>
        {c.portfolioUrl && (
          <CreativeSpotlightActionCard
            icon={<MonitorPlay className="size-4" />}
            label="Portfolio"
            description="View portfolio and work samples"
            href={c.portfolioUrl}
          />
        )}
        {c.showreelUrl && (
          <CreativeSpotlightActionCard
            icon={<Film className="size-4" />}
            label="Showreel"
            description="Watch showreel and highlights"
            href={c.showreelUrl}
          />
        )}
      </div>

      {/* availability */}
      {c.availability && (
        <div className="flex items-center justify-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <span className="size-1.5 rounded-full bg-white" />
            {c.availability}
          </span>
        </div>
      )}
    </div>
  );
}
