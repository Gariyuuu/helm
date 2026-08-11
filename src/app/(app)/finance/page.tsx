import { Landmark } from "lucide-react";
import { DomainWorkView } from "@/components/domain/domain-work-view";

export default function FinancePage() {
  return (
    <DomainWorkView
      slug="finance"
      title="Finance"
      description="Bills, budgeting tasks, and money-related follow-ups."
      icon={Landmark}
      emptyLabel="Nothing here yet. Add a bill or financial task to track."
    />
  );
}
