import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";
import type { PublicCareerProfileDTO } from "@/server/public-profile/public-profile";
import type {
  CardStyleTokens,
  CardThemeTokens,
} from "@/lib/career-card-theme-styles";
import { SplitHero } from "@/components/career-card/compositions/split-hero";
import { CorporateCareerSections } from "@/components/career-card/compositions/sections/corporate-career-sections";
import { publicProfileToCareerCard } from "@/components/career-card/adapters/public-profile-to-career-card";
import Link from "next/link";

/**
 * Production Corporate/Split renderer — Career Card Library v1.
 * Server component; static. Only active for
 * themeId=corporate-clean + cardStyleId=premium.
 */
export function CorporateLibraryCard({
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
      <div className="mx-auto max-w-4xl px-3 pt-4">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center"
            aria-label="LinkMeU home"
          >
            <LinkMeuLogo className="h-6" />
          </Link>
        </header>
      </div>
      <div className="mt-4">
        <SplitHero d={data.identity} cover={data.cover} accent={accent} />
        <CorporateCareerSections
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
      <footer className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-6 pb-8 pt-6">
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
