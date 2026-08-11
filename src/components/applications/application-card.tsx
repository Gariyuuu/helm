"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setApplicationStatus } from "@/lib/actions/career";
import { applicationStatusValues } from "@/lib/validation/career";
import type { applications, companies } from "@/lib/db/schema";

function isOverdue(deadline: Date | null) {
  return Boolean(deadline && deadline.getTime() < Date.now());
}

export function ApplicationCard({
  application,
  company,
}: {
  application: typeof applications.$inferSelect;
  company?: typeof companies.$inferSelect;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const overdue = isOverdue(application.deadline) && application.status === "interested";

  return (
    <Card className="flex items-center justify-between gap-3 p-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{application.role}</p>
        <p className="truncate text-xs text-muted-foreground">
          {company?.name ?? "No company"} {application.deadline && `· deadline ${application.deadline.toLocaleDateString()}`}
          {overdue && <span className="text-priority-critical"> · overdue</span>}
        </p>
      </div>
      <Select
        value={application.status}
        onValueChange={(v) =>
          startTransition(async () => {
            await setApplicationStatus(application.id, v);
            toast.success(`Moved to ${v.replace("_", " ")}`);
            router.refresh();
          })
        }
        disabled={isPending}
      >
        <SelectTrigger className="h-8 w-36 shrink-0 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {applicationStatusValues.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
}
