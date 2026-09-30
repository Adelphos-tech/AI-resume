"use client";

import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

/**
 * Shared WhatsApp country selector — used by both Candidate and Company
 * settings so the same ~240-ISO country list, labels, and interaction are
 * identical. Values are ISO 3166-1 alpha-2.
 */
const COUNTRY_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

export const WA_COUNTRIES: { iso: CountryCode; label: string }[] =
  getCountries()
    .map((iso) => ({
      iso,
      label: `${COUNTRY_NAMES.of(iso) ?? iso} (+${getCountryCallingCode(iso)})`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

export function WhatsappCountrySelect({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className={`${className ?? ""} w-full truncate ${
          value ? "" : "text-stone-400"
        }`}
        aria-label="WhatsApp country"
      >
        {WA_COUNTRIES.find((c) => c.iso === value)?.label ?? "Select country"}
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="max-h-64 max-w-[calc(100vw-3rem)]"
      >
        {WA_COUNTRIES.map((c) => (
          <SelectItem key={c.iso} value={c.iso}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
