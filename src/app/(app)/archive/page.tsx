import { requireUser } from "@/lib/auth/current-user";
import { getArchivedProjectsForUser } from "@/lib/queries/projects";
import { getArchivedWorkItems } from "@/lib/queries/work-items";
import { ArchivedProjectRow, ArchivedWorkItemRow } from "@/components/archive/archived-row";
import { Card } from "@/components/ui/card";

export default async function ArchivePage() {
  const user = await requireUser();
  const [projects, workItems] = await Promise.all([getArchivedProjectsForUser(user.id), getArchivedWorkItems(user.id)]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Archive</h1>
        <p className="text-sm text-muted-foreground">Archived projects and work items. Restore anything that shouldn&apos;t be here.</p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">No archived projects.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <ArchivedProjectRow key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Work items ({workItems.length})</h2>
        {workItems.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">No archived work items.</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {workItems.map((s) => (
              <ArchivedWorkItemRow key={s.item.id} item={s.item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
