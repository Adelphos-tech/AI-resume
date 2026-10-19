import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddBlockForm } from "@/components/candidate/career-site/add-block-form";
import { CustomTextBlock } from "@/components/candidate/career-site/custom-text-block";
import { DeleteBlockButton } from "@/components/candidate/career-site/delete-block-button";
import { ExperienceBlock } from "@/components/candidate/career-site/experience-block";
import { HeroBlock } from "@/components/candidate/career-site/hero-block";
import { MoveBlockButtons } from "@/components/candidate/career-site/move-block-buttons";
import {
  CAREER_SITE_BLOCK_LABELS,
  readCustomTextContent,
} from "@/lib/career-site-blocks";
import {
  getMyCareerSitePage,
  getMyExperienceBlockData,
  getMyHeroBlockData,
  listMyCareerSiteBlocks,
} from "@/server/career-site/career-site";

export const metadata = { title: "Career Site Page — RoleRace" };

export default async function CareerSitePageDetail({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const result = await getMyCareerSitePage(pageId);
  if (!result.success) notFound();

  const blocksResult = await listMyCareerSiteBlocks(pageId);
  const blocks = blocksResult.success ? blocksResult.blocks : [];

  const heroBlocks = blocks.filter((b) => b.type === "HERO");
  const heroDataResults =
    heroBlocks.length > 0
      ? await Promise.all(
          heroBlocks.map(async (b) => ({
            blockId: b.id,
            result: await getMyHeroBlockData(pageId, b.id),
          })),
        )
      : [];

  const heroDataMap = new Map(
    heroDataResults
      .filter(
        (
          r,
        ): r is typeof r & {
          result: {
            success: true;
            data: { displayName: string; headline: string | null };
          };
        } => r.result.success,
      )
      .map((r) => [r.blockId, r.result.data]),
  );

  const experienceBlocks = blocks.filter((b) => b.type === "EXPERIENCE");
  const experienceDataResults =
    experienceBlocks.length > 0
      ? await Promise.all(
          experienceBlocks.map(async (b) => ({
            blockId: b.id,
            result: await getMyExperienceBlockData(pageId, b.id),
          })),
        )
      : [];

  const experienceDataMap = new Map(
    experienceDataResults
      .filter(
        (
          r,
        ): r is typeof r & {
          result: {
            success: true;
            data: {
              entries: Array<{
                company: string;
                position: string;
                location: string | null;
                employmentType: string | null;
                startDate: string | null;
                endDate: string | null;
                isCurrent: boolean;
                summary: string | null;
                highlights: string[];
              }>;
            };
          };
        } => r.result.success,
      )
      .map((r) => [r.blockId, r.result.data]),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/candidate/career-site"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Career Site
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          {result.page.title}
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
          Private page setup
        </p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-stone-900">Blocks</h2>
        <AddBlockForm pageId={result.page.id} />
        {blocks.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">
            No blocks yet — blocks will appear here as you build this page.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {blocks.map((block, index) => {
              const orderIds = blocks.map((b) => b.id);
              const content =
                block.type === "CUSTOM_TEXT"
                  ? readCustomTextContent(block.content)
                  : null;
              return (
                <li
                  key={block.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3"
                >
                  {block.type === "CUSTOM_TEXT" ? (
                    <CustomTextBlock
                      pageId={result.page.id}
                      blockId={block.id}
                      ordinal={`Block ${index + 1}`}
                      initialText={
                        content?.kind === "text" ? content.text : null
                      }
                      invalid={content?.kind === "invalid"}
                      orderIds={orderIds}
                      orderIndex={index}
                    />
                  ) : block.type === "HERO" ? (
                    <HeroBlock
                      pageId={result.page.id}
                      blockId={block.id}
                      data={heroDataMap.get(block.id)}
                      orderIds={orderIds}
                      orderIndex={index}
                      ordinal={`Block ${index + 1}`}
                    />
                  ) : block.type === "EXPERIENCE" ? (
                    <ExperienceBlock
                      pageId={result.page.id}
                      blockId={block.id}
                      data={experienceDataMap.get(block.id)}
                      orderIds={orderIds}
                      orderIndex={index}
                      ordinal={`Block ${index + 1}`}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-900">
                        {CAREER_SITE_BLOCK_LABELS[block.type] ?? block.type}
                      </span>
                      <span className="flex items-center gap-2">
                        <MoveBlockButtons
                          pageId={result.page.id}
                          orderIds={orderIds}
                          index={index}
                        />
                        <DeleteBlockButton
                          pageId={result.page.id}
                          blockId={block.id}
                        />
                        <span className="text-xs text-stone-500">
                          Block {index + 1}
                        </span>
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
