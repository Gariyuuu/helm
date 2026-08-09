import { FlaskConical } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function ResearchPage() {
  return (
    <ComingSoon
      icon={FlaskConical}
      title="Research Tracker"
      description="Groups, papers, deliverables, reading lists, datasets, and repos tied to each research project."
    />
  );
}
