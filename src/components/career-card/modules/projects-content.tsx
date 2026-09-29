/**
 * Semantic Projects content — shared understanding of project data.
 * Compositions own geometry; these helpers own semantics.
 */
import { ExternalLink } from "lucide-react";
import type { DemoProject } from "@/components/career-card/dev/demo-career-profile";

export type { DemoProject };

/** External project link row — semantic leaf for any composition. */
export function ProjectLink({
  url,
  className = "inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline",
}: {
  url: string;
  className?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <ExternalLink aria-hidden className="size-3.5" />
      View project
    </a>
  );
}

/** Small tag row — only renders tags the data actually carries. */
export function ProjectTags({
  tags,
  className = "",
  tagClassName = "rounded border px-1.5 py-0.5 text-[10px] font-medium",
}: {
  tags?: string[];
  className?: string;
  tagClassName?: string;
}) {
  if (!tags?.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {tags.map((t) => (
        <span key={t} className={tagClassName}>
          {t}
        </span>
      ))}
    </div>
  );
}
