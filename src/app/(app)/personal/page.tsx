import { Heart } from "lucide-react";
import { DomainWorkView } from "@/components/domain/domain-work-view";

export default function PersonalPage() {
  return (
    <DomainWorkView
      slug="personal"
      title="Personal"
      description="Everything that's just for you."
      icon={Heart}
      emptyLabel="Nothing here yet. Add something personal you want to track."
    />
  );
}
