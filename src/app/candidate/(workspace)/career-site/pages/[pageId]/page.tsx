import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddBlockForm } from "@/components/candidate/career-site/add-block-form";
import { CAREER_SITE_BLOCK_LABELS } from "@/lib/career-site-blocks";
import {
  getMyCareerSitePage,
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
            {blocks.map((block, index) => (
              <li
                key={block.id}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3"
              >
                <span className="text-sm font-medium text-stone-900">
                  {CAREER_SITE_BLOCK_LABELS[block.type] ?? block.type}
                </span>
                <span className="text-xs text-stone-500">
                  Block {index + 1}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
