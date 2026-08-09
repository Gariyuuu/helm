import { requireUser } from "@/lib/auth/current-user";
import { getInboxItems } from "@/lib/queries/work-items";
import { getProjectsForUser } from "@/lib/queries/projects";
import { getDomainsForUser } from "@/lib/queries/domains";
import { QuickAddBar } from "@/components/work-items/quick-add-bar";
import { WorkItemFormDialog } from "@/components/work-items/work-item-form-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default async function InboxPage() {
  const user = await requireUser();
  const [items, projects, domains] = await Promise.all([
    getInboxItems(user.id),
    getProjectsForUser(user.id),
    getDomainsForUser(user.id),
  ]);

  const domainOptions = domains.map((d) => ({ id: d.id, name: d.name }));
  const projectOptions = projects.map((p) => ({ id: p.project.id, name: p.project.name }));

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Capture first, organize later. Everything you add here starts unprocessed until you set its type, deadline, and impact.
        </p>
      </div>

      <QuickAddBar />

      {items.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">Inbox is empty — nice.</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(({ item }) => (
            <Card key={item.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">Added {item.createdAt.toLocaleDateString()}</p>
              </div>
              <WorkItemFormDialog
                trigger={
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                    <Pencil className="size-3.5" /> Process
                  </Button>
                }
                domains={domainOptions}
                projects={projectOptions}
                workItemId={item.id}
                initial={{
                  title: item.title,
                  description: item.description ?? "",
                  status: "planned",
                }}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
