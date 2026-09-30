import "server-only";

import {
  getCountries,
  parsePhoneNumberFromString,
} from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js";

/**
 * Shared WhatsApp number resolution — used by both the Candidate
 * (PublicProfile) and CompanyProfile save paths so normalization,
 * validation and canonical storage stay identical.
 *
 * Input: a national number interpreted against the explicitly selected
 * ISO country, or a full international "+…" number (country context
 * ignored). Output: canonical E.164 (e.g. "+447911123456"), with
 * trunk prefixes handled by libphonenumber — never manual concat.
 */
export function resolveWhatsapp(
  rawNumber: string,
  rawCountry: string,
): { ok: true; number: string } | { ok: false; message: string } {
  const number = rawNumber.trim();
  const country = rawCountry.trim().toUpperCase();
  if (!number) return { ok: true, number: "" };
  if (country && !getCountries().includes(country as CountryCode)) {
    return { ok: false, message: "Select a valid country." };
  }
  if (!country && !number.startsWith("+")) {
    return {
      ok: false,
      message: "Select a country for your WhatsApp number.",
    };
  }
  const phone = parsePhoneNumberFromString(
    number,
    (country || undefined) as CountryCode | undefined,
  );
  if (!phone || !phone.isValid()) {
    const name =
      country && new Intl.DisplayNames(["en"], { type: "region" }).of(country);
    return {
      ok: false,
      message: name
        ? `Enter a valid WhatsApp number for ${name}.`
        : "Enter a valid WhatsApp number.",
    };
  }
  return { ok: true, number: phone.number };
}

/** Canonical E.164 → public wa.me link (digits only). */
export function whatsappPublicUrl(number: string | null): string | null {
  return number ? `https://wa.me/${number.replace(/\D/g, "")}` : null;
}
