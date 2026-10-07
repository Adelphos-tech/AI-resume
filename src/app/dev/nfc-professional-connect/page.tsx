import { notFound } from "next/navigation";
import { NfcProfessionalConnectLab } from "@/components/career-card/dev/nfc-professional-connect-lab";

/**
 * Development-only Professional Connect skin lab for NFC Compact.
 * Fails closed outside development — never shipped to production.
 */
export default function NfcProfessionalConnectPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <NfcProfessionalConnectLab />;
}
