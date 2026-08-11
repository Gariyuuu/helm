"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { followUpWaitingItem, resolveWaitingItem } from "@/lib/actions/waiting-items";
import type { waitingItems } from "@/lib/db/schema";

const STATUS_CLASS: Record<string, string> = {
  waiting: "bg-muted text-foreground",
  followed_up: "bg-priority-medium text-black border-0",
  resolved: "bg-health-healthy text-white border-0",
};

function isOverdue(date: Date | null) {
  return Boolean(date && date.getTime() < Date.now());
}

export function WaitingItemRow({ item }: { item: typeof waitingItems.$inferSelect }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const overdue = item.status !== "resolved" && isOverdue(item.followUpDate);

  return (
    <Card className={`flex items-center justify-between gap-3 p-3 ${overdue ? "border-priority-critical/60" : ""}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{item.person}</p>
          <Badge className={STATUS_CLASS[item.status]}>{item.status.replace("_", " ")}</Badge>
          {overdue && <Badge className="border-0 bg-priority-critical text-white">follow up overdue</Badge>}
        </div>
        <p className="truncate text-sm text-muted-foreground">{item.whatFor}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Requested {item.requestedDate.toLocaleDateString()}
          {item.followUpDate && ` · follow up ${item.followUpDate.toLocaleDateString()}`}
        </p>
      </div>
      {item.status !== "resolved" && (
        <div className="flex shrink-0 gap-1.5">
          {item.status === "waiting" && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => startTransition(async () => {
                await followUpWaitingItem(item.id);
                router.refresh();
              })}
            >
              Followed up
            </Button>
          )}
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              await resolveWaitingItem(item.id);
              router.refresh();
            })}
          >
            Resolve
          </Button>
        </div>
      )}
    </Card>
  );
}
