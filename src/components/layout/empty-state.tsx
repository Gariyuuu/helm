import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-3 border-dashed p-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{children}</p>
    </Card>
  );
}
