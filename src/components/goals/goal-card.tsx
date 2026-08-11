"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { completeGoal, abandonGoal } from "@/lib/actions/goals";
import type { goals } from "@/lib/db/schema";
import { Pencil } from "lucide-react";

const STATUS_CLASS: Record<string, string> = {
  active: "bg-muted text-foreground",
  on_track: "bg-health-healthy text-white border-0",
  at_risk: "bg-health-at-risk text-black border-0",
  completed: "bg-priority-low text-white border-0",
  abandoned: "bg-health-dormant text-white border-0",
};

export function GoalCard({
  goal,
  children,
  domains,
  allGoals,
}: {
  goal: typeof goals.$inferSelect;
  children?: React.ReactNode;
  domains: { id: string; name: string }[];
  allGoals: { id: string; title: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{goal.title}</p>
            <Badge className={STATUS_CLASS[goal.status]}>{goal.status.replace("_", " ")}</Badge>
            <Badge variant="outline" className="capitalize">
              {goal.type.replace("_", " ")}
            </Badge>
          </div>
          {goal.description && <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>}
        </div>
        <GoalFormDialog
          trigger={
            <Button variant="ghost" size="icon" className="size-7 shrink-0">
              <Pencil className="size-3.5" />
            </Button>
          }
          domains={domains}
          goals={allGoals}
          goalId={goal.id}
          initial={{
            title: goal.title,
            description: goal.description ?? "",
            type: goal.type,
            domainId: goal.domainId,
            parentGoalId: goal.parentGoalId,
            targetDate: goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : "",
          }}
        />
      </div>
      <div className="mt-3">
        <Progress value={goal.progress} className="h-1.5" />
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>{goal.progress}%</span>
          {goal.targetDate && <span>Target {goal.targetDate.toLocaleDateString()}</span>}
        </div>
      </div>
      {goal.status !== "completed" && goal.status !== "abandoned" && (
        <div className="mt-3 flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await completeGoal(goal.id);
                router.refresh();
              })
            }
          >
            Mark complete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await abandonGoal(goal.id);
                router.refresh();
              })
            }
          >
            Abandon
          </Button>
        </div>
      )}
      {children && <div className="mt-3 space-y-2 border-l pl-3">{children}</div>}
    </Card>
  );
}
