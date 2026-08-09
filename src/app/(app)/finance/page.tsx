import { Landmark } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function FinancePage() {
  return (
    <ComingSoon
      icon={Landmark}
      title="Finance"
      description="Payments, subscriptions, and financial admin tasks — organizational only, never a brokerage."
    />
  );
}
