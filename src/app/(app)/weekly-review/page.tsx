import { ClipboardCheck } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function WeeklyReviewPage() {
  return (
    <ComingSoon
      icon={ClipboardCheck}
      title="Weekly Review"
      description="Completed, missed, added, dropped — plus what matters most going into next week."
    />
  );
}
