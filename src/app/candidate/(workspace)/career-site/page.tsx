import { ChevronRight, Globe, PanelsTopLeft } from "lucide-react";
import Link from "next/link";

import { AddPageForm } from "@/components/candidate/career-site/add-page-form";
import {
  getMyCareerSite,
  listMyCareerSitePages,
} from "@/server/career-site/career-site";

import { createCareerSiteAction } from "./actions";

export const metadata = { title: "Career Site — LinkMeU" };

export default async function CandidateCareerSitePage() {
  const result = await getMyCareerSite();
  const site = result.success ? result.careerSite : null;
  const pagesResult = site ? await listMyCareerSitePages() : null;
  const pages = pagesResult?.success ? pagesResult.pages : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
          Career Site
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">
          Your complete professional website — built for mobile first.
        </p>
      </div>

      {!site ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-stone-900">
            No Career Site yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-500">
            Build your professional presence with pages, career blocks and
            portfolio content. More building tools will appear here as your
            Career Site grows.
          </p>
          <form
            action={async () => {
              "use server";
              await createCareerSiteAction();
            }}
          >
            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 sm:w-auto"
            >
              <PanelsTopLeft className="size-4" aria-hidden />
              Create Career Site
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 size-5 text-emerald-700" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Career Site created
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Created{" "}
                  {site.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Your Career Site foundation is ready.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-stone-900">Pages</h2>
            <div className="mt-3">
              <AddPageForm />
            </div>
            {pages.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">
                No pages yet — add your first page to start shaping your Career
                Site.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-stone-100">
                {pages.map((page) => (
                  <li key={page.id}>
                    <Link
                      href={`/candidate/career-site/pages/${page.id}`}
                      className="flex items-center justify-between py-2.5 transition-colors hover:text-stone-900"
                    >
                      <span className="text-sm font-medium text-stone-900">
                        {page.title}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-stone-500">
                        {page.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <ChevronRight className="size-3.5" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
