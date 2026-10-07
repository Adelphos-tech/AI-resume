import { notFound } from "next/navigation";
import { NfcSignatureSpotlightLab } from "@/components/career-card/dev/nfc-signature-spotlight-lab";

/**
 * Development-only Signature Spotlight skin lab for NFC Compact.
 * Fails closed outside development — never shipped to production.
 */
export default function NfcSignatureSpotlightPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <NfcSignatureSpotlightLab />;
}
