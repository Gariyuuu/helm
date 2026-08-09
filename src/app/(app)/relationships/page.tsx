import { Users } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function RelationshipsPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Relationships"
      description="Dates, birthdays, anniversaries, and friend/family plans that block real time on your calendar."
    />
  );
}
