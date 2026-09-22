import type {
  CandidatePackage,
  CandidateStatus,
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
