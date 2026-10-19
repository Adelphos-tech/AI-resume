import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import type { PublicCareerProfileDTO } from "@/server/public-profile/public-profile";
import type {
  CardStyleTokens,
  CardThemeTokens,
} from "@/lib/career-card-theme-styles";
import { CinematicHero } from "@/components/career-card/compositions/cinematic-hero";
import { ExecutiveCareerSections } from "@/components/career-card/compositions/sections/executive-career-sections";
import { publicProfileToCareerCard } from "@/components/career-card/adapters/public-profile-to-career-card";
import Link from "next/link";

/**
 * Production Executive/Cinematic renderer — Career Card Library v1.
 * Server component; static (motion staged later after data approval).
 * Only active for themeId=executive-dark + cardStyleId=premium.
 */
export function ExecutiveLibraryCard({
  dto,
  slug,
  t,
  p,
}: {
  dto: PublicCareerProfileDTO;
  slug: string;
  t: CardThemeTokens;
  p: CardStyleTokens;
}) {
  const data = publicProfileToCareerCard(dto, slug);
  const accent = dto.accentColorId;
  return (
    <main className={`min-h-dvh ${p.page}`}>
      <div className="mx-auto max-w-5xl px-3 pt-4">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center"
            aria-label="LinkMeU home"
          >
            <LinkMeuLogo className="h-7" />
          </Link>
        </header>
      </div>
      <div className="mt-4">
        <CinematicHero d={data.identity} cover={data.cover} accent={accent} />
        <ExecutiveCareerSections
          experience={data.experience}
          projects={data.projects}
          skills={data.skills}
          education={data.education}
          certifications={data.certifications}
          languages={data.languages}
          resume={data.resume}
          accent={accent}
        />
      </div>
      <footer className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 pb-8 pt-6">
        <span
          className={`inline-flex items-center gap-2 text-xs font-semibold ${t.footer}`}
        >
          Powered by <LinkMeuLogo className="h-4" />
        </span>
        <span className={`text-xs ${t.footer}`}>
          Made to be scanned. Built to be remembered.
        </span>
      </footer>
    </main>
  );
}
