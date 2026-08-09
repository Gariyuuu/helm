import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function ApplicationsPage() {
  return (
    <ComingSoon
      icon={FileText}
      title="Application Tracker"
      description="Pipeline from Interested through Offer, with deadlines, response rates, and interview conversion."
    />
  );
}
