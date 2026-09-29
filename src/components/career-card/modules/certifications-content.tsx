/**
 * Semantic Certifications/Credentials content — shared data shape and
 * small leaves. Compositions own geometry.
 */
import type { DemoCertification } from "@/components/career-card/dev/demo-career-profile";

export type { DemoCertification };

/** "PMI · 2021" / "2021" / "" */
export function credentialMeta(c: DemoCertification) {
  const parts = [c.issuer, c.issued].filter(Boolean);
  return parts.join(" · ");
}
