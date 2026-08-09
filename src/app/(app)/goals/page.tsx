import { Target } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function GoalsPage() {
  return (
    <ComingSoon
      icon={Target}
      title="Goals"
      description="Vision → Goal → Milestone → Project → Task. See how today's tiny tasks connect to what actually matters."
    />
  );
}
