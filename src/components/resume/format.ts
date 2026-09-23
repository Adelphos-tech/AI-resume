/**
 * Deterministic partial-date display for resume documents.
 * `2024` → "2024"; `2024-03` → "Mar 2024". Never fabricates a month.
 */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatCareerDate(value: string | null): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!month) return year;
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatCareerDateRange(
  start: string | null,
  end: string | null,
  isCurrent = false,
): string {
  const s = formatCareerDate(start);
  const e = isCurrent ? "Present" : formatCareerDate(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}
