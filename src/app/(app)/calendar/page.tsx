import { Calendar } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function CalendarPage() {
  return (
    <ComingSoon
      icon={Calendar}
      title="Calendar"
      description="Month/week/day/agenda views with drag-and-drop planning, deadlines vs. scheduled work blocks."
    />
  );
}
