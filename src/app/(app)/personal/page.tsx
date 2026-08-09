import { Heart } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function PersonalPage() {
  return (
    <ComingSoon
      icon={Heart}
      title="Personal"
      description="Errands, personal admin, and everything that keeps life running outside of work."
    />
  );
}
