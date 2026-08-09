import { Archive } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function ArchivePage() {
  return (
    <ComingSoon
      icon={Archive}
      title="Archive"
      description="Completed and archived projects, fully searchable, with their tasks, notes, and timeline preserved."
    />
  );
}
