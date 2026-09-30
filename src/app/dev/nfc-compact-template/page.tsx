import { notFound } from "next/navigation";
import { NfcCompactLab } from "@/components/career-card/dev/nfc-compact-lab";

/**
 * Development-only NFC Compact / Dual Profile template lab.
 * Fails closed outside development.
 */
export default function NfcCompactTemplatePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <NfcCompactLab />;
}
