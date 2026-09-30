import { notFound } from "next/navigation";
import { NfcCrimsonLab } from "@/components/career-card/dev/nfc-crimson-lab";

/**
 * Development-only Crimson Night skin lab for NFC Compact.
 * Fails closed outside development — never shipped to production.
 */
export default function NfcCrimsonNightPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <NfcCrimsonLab />;
}
