import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { getProjectById, getProjectsForUser } from "@/lib/queries/projects";
import { getWorkItemsByProject } from "@/lib/queries/work-items";
import { getDomainsForUser } from "@/lib/queries/domains";
import { WorkItemRow } from "@/components/work-items/work-item-row";
import { WorkItemFormDialog } from "@/components/work-items/work-item-form-dialog";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";

const HEALTH_CLASS: Record<string, string> = {
  healthy: "bg-health-healthy text-white border-0",
  attention: "bg-health-attention text-black border-0",
  at_risk: "bg-health-at-risk text-black border-0",
  critical: "bg-health-critical text-white border-0",
  dormant: "bg-health-dormant text-white border-0",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectById(user.id, id);
  if (!project) notFound();

  const [items, allProjects, domains] = await Promise.all([
    getWorkItemsByProject(user.id, id),
    getProjectsForUser(user.id),
    getDomainsForUser(user.id),
  ]);

  const health = allProjects.find((p) => p.project.id === id)?.health;
  const progress = allProjects.find((p) => p.project.id === id)?.progress ?? project.progress;
  const domainOptions = domains.map((d) => ({ id: d.id, name: d.name }));
  const projectOptions = allProjects.map((p) => ({ id: p.project.id, name: p.project.name }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
            {health && <Badge className={HEALTH_CLASS[health.health]}>{health.health.replace("_", " ")}</Badge>}
          </div>
          {project.objective && <p className="text-sm text-muted-foreground">{project.objective}</p>}
        </div>
        <ProjectFormDialog
          trigger={
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Pencil className="size-3.5" /> Edit
            </Button>
          }
          domains={domainOptions}
          projectId={project.id}
          initial={{
            name: project.name,
            objective: project.objective ?? "",
            domainId: project.domainId,
            status: project.status,
            deadline: project.deadline ? project.deadline.toISOString().slice(0, 10) : "",
            nextActionText: project.nextActionText ?? "",
          }}
        />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} />
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="capitalize">{project.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Deadline</p>
            <p>{project.deadline ? project.deadline.toLocaleDateString() : "None"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last activity</p>
            <p>{project.lastActivityAt.toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
          <p className="mb-0.5 font-medium">Next action</p>
          <p className="text-muted-foreground">{project.nextActionText || "Not set — add one so this project never stalls."}</p>
        </div>
        {health && health.reasons.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Why this health status:</p>
            <ul className="list-disc space-y-0.5 pl-4">
              {health.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tasks</h3>
          <WorkItemFormDialog
            trigger={
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="size-3.5" /> Add task
              </Button>
            }
            domains={domainOptions}
            projects={projectOptions}
            initial={{ projectId: project.id }}
          />
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <div className="flex flex-col">
            {items.map((s) => (
              <WorkItemRow key={s.item.id} scored={s} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
