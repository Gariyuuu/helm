"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FolderKanban, MoreHorizontal } from "lucide-react";
import { PriorityBadge } from "./priority-badge";
import type { ScoredWorkItem } from "@/lib/priority/from-db";
import { archiveWorkItem, completeWorkItem, postponeWorkItem } from "@/lib/actions/work-items";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function formatDeadline(d: Date | null) {
  if (!d) return null;
  const diffMs = d.getTime() - Date.now();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 0) return { label: "Overdue", urgent: true };
  if (diffHours < 24) return { label: `Due ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`, urgent: true };
  if (diffHours < 24 * 7) return { label: `Due ${d.toLocaleDateString(undefined, { weekday: "short" })}`, urgent: false };
  return { label: `Due ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`, urgent: false };
}

export function WorkItemRow({ scored, projectName }: { scored: ScoredWorkItem; projectName?: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { item, priority } = scored;
  const deadline = formatDeadline(item.deadline);

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 hover:border-border hover:bg-accent/40">
      <Checkbox
        checked={item.status === "completed"}
        disabled={isPending}
        onCheckedChange={() =>
          startTransition(async () => {
            await completeWorkItem(item.id);
            toast.success(`"${item.title}" completed`);
            router.refresh();
          })
        }
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {projectName && (
            <span className="flex items-center gap-1">
              <FolderKanban className="size-3" />
              {projectName}
            </span>
          )}
          {deadline && (
            <span className={deadline.urgent ? "flex items-center gap-1 text-priority-critical" : "flex items-center gap-1"}>
              <Clock className="size-3" />
              {deadline.label}
            </span>
          )}
          {item.status === "blocked" && <Badge variant="outline">Blocked</Badge>}
          {item.status === "waiting" && <Badge variant="outline">Waiting</Badge>}
        </div>
      </div>
      <PriorityBadge priority={priority} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              startTransition(async () => {
                await postponeWorkItem(item.id);
                toast("Postponed");
                router.refresh();
              })
            }
          >
            Snooze / postpone
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              startTransition(async () => {
                await archiveWorkItem(item.id);
                toast.success(`"${item.title}" archived`);
                router.refresh();
              })
            }
          >
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
