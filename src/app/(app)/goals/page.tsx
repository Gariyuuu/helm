import { requireUser } from "@/lib/auth/current-user";
import { getGoalsForUser } from "@/lib/queries/goals";
import { getDomainsForUser } from "@/lib/queries/domains";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function GoalsPage() {
  const user = await requireUser();
  const [goals, domains] = await Promise.all([getGoalsForUser(user.id), getDomainsForUser(user.id)]);
  const domainOptions = domains.map((d) => ({ id: d.id, name: d.name }));
  const goalOptions = goals.map((g) => ({ id: g.id, title: g.title }));
  const topLevel = goals.filter((g) => !g.parentGoalId);
  const childrenOf = (id: string) => goals.filter((g) => g.parentGoalId === id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">Vision → Goal → Milestone → Project → Task.</p>
        </div>
        <GoalFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New goal
            </Button>
          }
          domains={domainOptions}
          goals={goalOptions}
        />
      </div>

      {topLevel.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          No goals yet. Start with what actually matters, then connect projects and tasks to it.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {topLevel.map((goal) => {
            const children = childrenOf(goal.id);
            return (
              <GoalCard key={goal.id} goal={goal} domains={domainOptions} allGoals={goalOptions}>
                {children.length > 0 &&
                  children.map((child) => (
                    <GoalCard key={child.id} goal={child} domains={domainOptions} allGoals={goalOptions} />
                  ))}
              </GoalCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
