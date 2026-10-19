import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { CandidateFilters } from "@/components/admin/candidate-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CANDIDATE_PACKAGE_LABELS,
  CANDIDATE_STATUS_LABELS,
} from "@/lib/candidate-labels";
import { listCandidates } from "@/server/candidates/list-candidates";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function listHref(
  filters: { q?: string; status?: string; package?: string },
  page: number,
) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.package) params.set("package", filters.package);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/admin/candidates${query ? `?${query}` : ""}`;
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = {
    q: firstParam(raw.q),
    status: firstParam(raw.status),
    package: firstParam(raw.package),
    page: firstParam(raw.page),
  };
  const hasActiveFilters = !!(filters.q || filters.status || filters.package);
  const { items, total, page, totalPages } = await listCandidates(filters);

  const from = total === 0 ? 0 : (page - 1) * 20 + 1;
  const to = Math.min(page * 20, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Candidates</h2>
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to} of {total}{" "}
            {total === 1 ? "candidate" : "candidates"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/candidates/new">Add candidate</Link>
        </Button>
      </div>

      <CandidateFilters initial={filters} hasActiveFilters={hasActiveFilters} />

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center">
          {hasActiveFilters ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No candidates match these filters.
              </p>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/candidates">Clear filters</Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No candidates yet. Candidates will appear here when they are added
              to LinkMeU.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/candidates/${candidate.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {candidate.firstName} {candidate.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CANDIDATE_PACKAGE_LABELS[candidate.package]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {CANDIDATE_STATUS_LABELS[candidate.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.location ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormatter.format(candidate.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {items.map((candidate) => (
              <li
                key={candidate.id}
                className="space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      <Link
                        href={`/admin/candidates/${candidate.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {candidate.firstName} {candidate.lastName}
                      </Link>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {candidate.email}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {CANDIDATE_STATUS_LABELS[candidate.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <Badge variant="outline">
                    {CANDIDATE_PACKAGE_LABELS[candidate.package]}
                  </Badge>
                  {candidate.location ? (
                    <span>{candidate.location}</span>
                  ) : null}
                  <span>{dateFormatter.format(candidate.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="Candidate list pagination"
          className="flex items-center justify-between gap-4"
        >
          <Button
            asChild={page > 1}
            variant="outline"
            size="sm"
            disabled={page <= 1}
          >
            {page > 1 ? (
              <Link href={listHref(filters, page - 1)}>
                <ChevronLeft />
                Previous
              </Link>
            ) : (
              <>
                <ChevronLeft />
                Previous
              </>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            asChild={page < totalPages}
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
          >
            {page < totalPages ? (
              <Link href={listHref(filters, page + 1)}>
                Next
                <ChevronRight />
              </Link>
            ) : (
              <>
                Next
                <ChevronRight />
              </>
            )}
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
