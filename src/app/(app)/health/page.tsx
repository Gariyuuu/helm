import { HeartPulse } from "lucide-react";
import { DomainWorkView } from "@/components/domain/domain-work-view";

export default function HealthPage() {
  return (
    <DomainWorkView
      slug="health"
      title="Health"
      description="Workouts, appointments, and anything body/mind related."
      icon={HeartPulse}
      emptyLabel="Nothing here yet. Add a workout, appointment, or habit to track."
    />
  );
}
