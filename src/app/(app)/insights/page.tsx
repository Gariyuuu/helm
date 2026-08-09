import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function InsightsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Insights"
      description="Workload by domain, deadline pressure, estimation accuracy, and context-switching analysis."
    />
  );
}
