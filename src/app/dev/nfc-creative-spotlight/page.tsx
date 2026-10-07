import { notFound } from "next/navigation";
import { NfcCreativeSpotlightLab } from "@/components/career-card/dev/nfc-creative-spotlight-lab";

/**
 * Development-only Creative Spotlight skin lab for NFC Compact.
 * Fails closed outside development — never shipped to production.
 */
export default function NfcCreativeSpotlightPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <NfcCreativeSpotlightLab />;
}
