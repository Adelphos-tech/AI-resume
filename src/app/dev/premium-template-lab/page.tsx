import { notFound } from "next/navigation";

import { LabPremiumTemplate } from "@/components/dev-lab/premium-template";

/**
 * Development-only visual lab for the Premium Career Card template.
 * Fails closed in production — the route never renders outside
 * NODE_ENV=development, and carries no business data or auth surface.
 */
export default function PremiumTemplateLabPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  return <LabPremiumTemplate />;
}
