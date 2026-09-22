import type {
  CandidatePackage,
  CandidateStatus,
  EmploymentPreference,
  WorkplacePreference,
} from "@/generated/prisma/enums";

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  NEW: "New",
  INTAKE_PENDING: "Intake Pending",
  IN_REVIEW: "In Review",
  IN_PROGRESS: "In Progress",
  READY_FOR_DELIVERY: "Ready for Delivery",
  DELIVERED: "Delivered",
  ARCHIVED: "Archived",
};

export const CANDIDATE_PACKAGE_LABELS: Record<CandidatePackage, string> = {
  STARTER_LAP: "Starter Lap",
  CAREER_GRID: "Career Grid",
  POLE_POSITION: "Pole Position",
};

export const WORKPLACE_PREFERENCE_LABELS: Record<WorkplacePreference, string> =
  {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "On-site",
    FLEXIBLE: "Flexible",
  };

export const EMPLOYMENT_PREFERENCE_LABELS: Record<
  EmploymentPreference,
  string
> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};
