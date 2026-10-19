import { DeleteBlockButton } from "./delete-block-button";
import { MoveBlockButtons } from "./move-block-buttons";

export type ExperienceEntryData = {
  company: string;
  position: string;
  location: string | null;
  employmentType: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  summary: string | null;
  highlights: string[];
};

export type ExperienceBlockData = {
  entries: ExperienceEntryData[];
};

type Props = {
  pageId: string;
  blockId: string;
  data: ExperienceBlockData | undefined;
  orderIds: string[];
  orderIndex: number;
  ordinal: string;
};

function formatCareerDate(d: string | null): string | null {
  if (!d) return null;
  const [y, m] = d.split("-");
  if (!m) return y;
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function dateRange(entry: ExperienceEntryData): string | null {
  const start = formatCareerDate(entry.startDate);
  if (!start) return null;
  const end = entry.isCurrent ? "Present" : formatCareerDate(entry.endDate);
  return end ? `${start} – ${end}` : start;
}

export function ExperienceBlock({
  pageId,
  blockId,
  data,
  orderIds,
  orderIndex,
  ordinal,
}: Props) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold text-stone-900">
          Experience
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <MoveBlockButtons
            pageId={pageId}
            orderIds={orderIds}
            index={orderIndex}
          />
          <DeleteBlockButton pageId={pageId} blockId={blockId} />
          <span className="text-xs text-stone-400">{ordinal}</span>
        </span>
      </div>

      {data ? (
        <div className="mt-3 space-y-4">
          {data.entries.length === 0 ? (
            <p className="text-sm text-stone-500">
              No work experience added yet.
            </p>
          ) : (
            data.entries.map((entry, i) => (
              <div
                key={i}
                className="rounded-lg border border-stone-200 bg-white px-3.5 py-3"
              >
                <p className="text-sm font-semibold text-stone-900">
                  {entry.position}
                </p>
                <p className="text-sm text-stone-600">{entry.company}</p>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500">
                  {entry.employmentType && <span>{entry.employmentType}</span>}
                  {entry.location && <span>{entry.location}</span>}
                  {dateRange(entry) && <span>{dateRange(entry)}</span>}
                </div>

                {entry.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {entry.summary}
                  </p>
                )}

                {entry.highlights.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-stone-600">
                    {entry.highlights.map((h, hi) => (
                      <li key={hi}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
