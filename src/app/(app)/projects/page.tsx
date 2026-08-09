import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getProjectsForUser } from "@/lib/queries/projects";
import { getDomainsForUser } from "@/lib/queries/domains";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const HEALTH_CLASS: Record<string, string> = {
  healthy: "bg-health-healthy text-white border-0",
  attention: "bg-health-attention text-black border-0",
  at_risk: "bg-health-at-risk text-black border-0",
  critical: "bg-health-critical text-white border-0",
  dormant: "bg-health-dormant text-white border-0",
};

export default async function ProjectsPage() {
  const user = await requireUser();
  const [projects, domains] = await Promise.all([getProjectsForUser(user.id), getDomainsForUser(user.id)]);
  const domainOptions = domains.map((d) => ({ id: d.id, name: d.name }));

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <ProjectFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New project
            </Button>
          }
          domains={domainOptions}
        />
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          No projects yet. Create one to group related work items together.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.project.id} href={`/projects/${p.project.id}`}>
              <Card className="h-full p-4 transition-colors hover:bg-accent/40">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <p className="font-medium">{p.project.name}</p>
                  <Badge className={HEALTH_CLASS[p.health.health]}>{p.health.health.replace("_", " ")}</Badge>
                </div>
                {p.project.objective && <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{p.project.objective}</p>}
                <Progress value={p.progress} className="h-1.5" />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {p.taskCounts.completed}/{p.taskCounts.total} tasks
                  </span>
                  <span className="capitalize">{p.project.status}</span>
                </div>
                <p className="mt-1.5 truncate text-xs text-muted-foreground">
                  Next: {p.project.nextActionText || "Not set"}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
