import { BookOpen } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function LearningPage() {
  return (
    <ComingSoon
      icon={BookOpen}
      title="Learning"
      description="Skills you're building, current vs. target level, resources, and hours logged."
    />
  );
}
