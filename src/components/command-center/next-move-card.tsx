"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/work-items/priority-badge";
import { WorkItemFormDialog } from "@/components/work-items/work-item-form-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { completeWorkItem, postponeWorkItem } from "@/lib/actions/work-items";
import type { ScoredWorkItem } from "@/lib/priority/from-db";
import { Clock, Timer } from "lucide-react";

export function NextMoveCard({
  scored,
  domains,
  projects,
}: {
  scored: ScoredWorkItem | null;
  domains: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!scored) {
    return (
      <Card className="border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nothing urgent right now — you&apos;re caught up. Check Inbox or add something new.
        </p>
      </Card>
    );
  }

  const { item, priority } = scored;
  const topReason = priority.reasons[0]?.label ?? "Highest-ranked item right now.";
  const estimate = item.estimatedMinutes
    ? `${Math.floor(item.estimatedMinutes / 60) > 0 ? `${Math.floor(item.estimatedMinutes / 60)}h ` : ""}${item.estimatedMinutes % 60}m`
    : "Not estimated";
  const dueLabel = item.deadline
    ? item.deadline.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })
    : "No deadline";

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/[0.06] to-transparent p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your next move</p>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">{item.title}</h2>
        <PriorityBadge priority={priority} className="text-base px-2.5 py-1" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          Due: {dueLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <Timer className="size-3.5" />
          Estimated: {estimate}
        </span>
      </div>
      <p className="mt-3 text-sm">
        <span className="font-medium">Reason: </span>
        {topReason}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button disabled>Start Focus</Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Focus Mode lands in a later build phase</TooltipContent>
        </Tooltip>
        <WorkItemFormDialog
          trigger={<Button variant="outline">Open Task</Button>}
          domains={domains.map((d) => ({ id: d.id, name: d.name }))}
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          workItemId={item.id}
          initial={{
            title: item.title,
            description: item.description ?? "",
            type: item.type as never,
            status: item.status as never,
            domainId: item.domainId,
            projectId: item.projectId,
            deadline: item.deadline ? new Date(item.deadline.getTime() - item.deadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
            estimatedMinutes: item.estimatedMinutes ? String(item.estimatedMinutes) : "",
            urgency: item.urgency,
            importance: item.importance,
            stakes: item.stakes,
            academicImpact: item.academicImpact,
            careerImpact: item.careerImpact,
            financialImpact: item.financialImpact,
            relationshipImpact: item.relationshipImpact,
            healthImpact: item.healthImpact,
            opportunityValue: item.opportunityValue,
            consequenceOfFailure: item.consequenceOfFailure,
            consequenceOfDelay: item.consequenceOfDelay,
            reversibility: item.reversibility,
            energyRequired: item.energyRequired,
            peopleWaitingCount: item.peopleWaitingCount,
            tags: item.tags.join(", "),
          }}
        />
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await postponeWorkItem(item.id);
              router.refresh();
            })
          }
        >
          Snooze
        </Button>
        <Button
          variant="ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await completeWorkItem(item.id);
              router.refresh();
            })
          }
        >
          Mark done
        </Button>
      </div>
    </Card>
  );
}
