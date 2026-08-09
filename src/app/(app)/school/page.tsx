import { GraduationCap } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function SchoolPage() {
  return (
    <ComingSoon
      icon={GraduationCap}
      title="School"
      description="Semesters, courses, grading breakdowns, and assignment stakes computed from your grade weights."
    />
  );
}
