import { requireUser } from "@/lib/auth/current-user";
import { getAllWorkItems } from "@/lib/queries/work-items";
import { getProjectsForUser } from "@/lib/queries/projects";
import { getDomainsForUser } from "@/lib/queries/domains";
import { WorkItemListClient } from "@/components/work-items/work-item-list-client";
import { WorkItemFormDialog } from "@/components/work-items/work-item-form-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AllWorkPage() {
  const user = await requireUser();
  const [items, projects, domains] = await Promise.all([
    getAllWorkItems(user.id),
    getProjectsForUser(user.id),
    getDomainsForUser(user.id),
  ]);

  const projectNameById = new Map(projects.map((p) => [p.project.id, p.project.name]));
  const domainOptions = domains.map((d) => ({ id: d.id, name: d.name }));
  const projectOptions = projects.map((p) => ({ id: p.project.id, name: p.project.name }));

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">All Work</h1>
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
      <WorkItemListClient items={items} projectNameById={projectNameById} domainOptions={domainOptions} />
    </div>
  );
}
