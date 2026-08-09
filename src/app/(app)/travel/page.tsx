import { Plane } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function TravelPage() {
  return (
    <ComingSoon
      icon={Plane}
      title="Travel"
      description="Trips with flights, hotels, packing checklists, and budgets — trips reduce your available capacity automatically."
    />
  );
}
