import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getActiveWorkItems } from "@/lib/queries/work-items";
import { getProjectsForUser } from "@/lib/queries/projects";
import { getDomainsForUser } from "@/lib/queries/domains";
import { getSettingsForUser } from "@/lib/queries/settings";
import { buildCommandCenterView } from "@/lib/dashboard/command-center-view";
import { NextMoveCard } from "@/components/command-center/next-move-card";
import { WorkItemRow } from "@/components/work-items/work-item-row";
import { WorkItemFormDialog } from "@/components/work-items/work-item-form-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, Zap } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function CommandCenterPage() {
  const user = await requireUser();
  const [scored, projects, domains, settings] = await Promise.all([
    getActiveWorkItems(user.id),
    getProjectsForUser(user.id),
    getDomainsForUser(user.id),
    getSettingsForUser(user.id),
  ]);

  const projectNameById = new Map(projects.map((p) => [p.project.id, p.project.name]));
  const { nextMove, top5, overdue, blocked, atRiskProjects, deadlineBuckets, capacityHours, committedHours, overbooked, quickWins } =
    buildCommandCenterView(scored, projects, settings.capacityByDay);

  const domainOptions = domains.map((d) => ({ id: d.id, name: d.name }));
  const projectOptions = projects.map((p) => ({ id: p.project.id, name: p.project.name }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          {greeting()}, {user.name?.split(" ")[0] || "there"}
        </h1>
        <WorkItemFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New
            </Button>
          }
          domains={domainOptions}
          projects={projectOptions}
        />
      </div>

      <NextMoveCard scored={nextMove} domains={domainOptions} projects={projectOptions} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-2 text-sm font-semibold">Top priorities</h3>
          {top5.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing else ranked right now.</p>
          ) : (
            <div className="flex flex-col">
              {top5.map((s, i) => (
                <div key={s.item.id} className="flex items-center gap-2">
                  <span className="w-4 text-xs text-muted-foreground">{i + 2}</span>
                  <div className="flex-1">
                    <WorkItemRow scored={s} projectName={s.item.projectId ? projectNameById.get(s.item.projectId) : undefined} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <AlertTriangle className="size-4 text-priority-high" />
            Attention required
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Overdue</span>
              <Badge variant={overdue.length ? "destructive" : "secondary"}>{overdue.length}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Blocked</span>
              <Badge variant={blocked.length ? "outline" : "secondary"}>{blocked.length}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Projects needing attention</span>
              <Badge variant={atRiskProjects.length ? "outline" : "secondary"}>{atRiskProjects.length}</Badge>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">This week</span>
              <Badge variant={overbooked ? "destructive" : "secondary"}>
                {overbooked ? `+${(committedHours - capacityHours).toFixed(1)}h over` : "On track"}
              </Badge>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Deadline radar</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            {deadlineBuckets.map((b) => (
              <div key={b.label}>
                <p className="text-lg font-semibold tabular-nums">{b.count}</p>
                <p className="text-xs text-muted-foreground">{b.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Capacity this week</h3>
          <Progress value={Math.min(100, (committedHours / Math.max(1, capacityHours)) * 100)} className={overbooked ? "[&>div]:bg-priority-critical" : ""} />
          <p className="mt-2 text-xs text-muted-foreground">
            {committedHours.toFixed(1)}h committed of {capacityHours}h available
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Zap className="size-4 text-priority-medium" />
            Quick wins
          </h3>
          {quickWins.length === 0 ? (
            <p className="text-sm text-muted-foreground">None under 20 minutes right now.</p>
          ) : (
            <ul className="space-y-1.5">
              {quickWins.map((s) => (
                <li key={s.item.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{s.item.title}</span>
                  <Badge variant="secondary">{s.item.estimatedMinutes}m</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Active projects</h3>
          <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <Link
                key={p.project.id}
                href={`/projects/${p.project.id}`}
                className="rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{p.project.name}</p>
                  <Badge className={healthBadgeClass(p.health.health)}>{p.health.health.replace("_", " ")}</Badge>
                </div>
                <Progress value={p.progress} className="h-1.5" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {p.taskCounts.completed}/{p.taskCounts.total} tasks · {p.project.nextActionText || "No next action set"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function healthBadgeClass(health: string) {
  const map: Record<string, string> = {
    healthy: "bg-health-healthy text-white border-0",
    attention: "bg-health-attention text-black border-0",
    at_risk: "bg-health-at-risk text-black border-0",
    critical: "bg-health-critical text-white border-0",
    dormant: "bg-health-dormant text-white border-0",
  };
  return map[health] ?? "";
}
