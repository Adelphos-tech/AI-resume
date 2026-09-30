import { notFound } from "next/navigation";
import { CareerModesLab } from "@/components/career-card/dev/career-modes-lab";

/**
 * Development-only Career Modes lab — five presentation recipes over one
 * synthetic master career profile. Fails closed outside development.
 */
export default function CareerModesPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <CareerModesLab />;
}
