"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CANDIDATE_PACKAGE_LABELS,
  CANDIDATE_STATUS_LABELS,
} from "@/lib/candidate-labels";

export interface CandidateFilterValues {
  q?: string;
  status?: string;
  package?: string;
}

export function CandidateFilters({
  initial,
  hasActiveFilters,
}: {
  initial: CandidateFilterValues;
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [status, setStatus] = useState(initial.status ?? "all");
  const [pkg, setPkg] = useState(initial.package ?? "all");

  function applyFilters() {
    const params = new URLSearchParams();
    const trimmed = q.trim();
    if (trimmed) params.set("q", trimmed);
    if (status !== "all") params.set("status", status);
    if (pkg !== "all") params.set("package", pkg);
    const query = params.toString();
    router.push(`/admin/candidates${query ? `?${query}` : ""}`);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="w-full space-y-1.5 sm:w-64">
        <Label htmlFor="candidate-search">Search candidates</Label>
        <Input
          id="candidate-search"
          name="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Name or email"
          autoComplete="off"
        />
      </div>

      <div className="w-full space-y-1.5 sm:w-44">
        <Label htmlFor="candidate-status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="candidate-status" className="w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(CANDIDATE_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full space-y-1.5 sm:w-44">
        <Label htmlFor="candidate-package">Package</Label>
        <Select value={pkg} onValueChange={setPkg}>
          <SelectTrigger id="candidate-package" className="w-full">
            <SelectValue placeholder="All packages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All packages</SelectItem>
            {Object.entries(CANDIDATE_PACKAGE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Search</Button>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/candidates")}
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    </form>
  );
}
