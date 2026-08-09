import { HeartPulse } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function HealthPage() {
  return (
    <ComingSoon
      icon={HeartPulse}
      title="Health"
      description="Gym, sports, and recurring fitness activities — tracked for consistency, not guilt."
    />
  );
}
