import { Clock } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function WaitingOnPage() {
  return (
    <ComingSoon
      icon={Clock}
      title="Waiting On"
      description="Things blocked on someone else — with follow-up reminders so nothing silently stalls."
    />
  );
}
