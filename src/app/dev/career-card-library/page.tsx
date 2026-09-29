import { notFound } from "next/navigation";
import { CareerCardLibraryLab } from "@/components/career-card/dev/career-card-library-lab";

/**
 * Development-only Career Card Library lab — four hero composition
 * families on synthetic demo data. Fails closed outside development.
 */
export default function CareerCardLibraryPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <CareerCardLibraryLab />;
}
