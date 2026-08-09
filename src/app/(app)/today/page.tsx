import { requireUser } from "@/lib/auth/current-user";
import { getActiveWorkItems } from "@/lib/queries/work-items";
import { getProjectsForUser } from "@/lib/queries/projects";
import { getDomainsForUser } from "@/lib/queries/domains";
import { buildTodayView } from "@/lib/dashboard/command-center-view";
import { WorkItemRow } from "@/components/work-items/work-item-row";
import { Card } from "@/components/ui/card";

export default async function TodayPage() {
  const user = await requireUser();
  const [scored, projects, domains] = await Promise.all([
    getActiveWorkItems(user.id),
    getProjectsForUser(user.id),
    getDomainsForUser(user.id),
  ]);
  void domains;

  const projectNameById = new Map(projects.map((p) => [p.project.id, p.project.name]));
  const { mustDo, shouldDo, couldDo } = buildTodayView(scored);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold tracking-tight">Today</h1>

      <Section title="Must do" subtitle="Realistically needs to happen today" items={mustDo} projectNameById={projectNameById} emptyText="Nothing urgent today." />
      <Section title="Should do" subtitle="Useful if time allows" items={shouldDo} projectNameById={projectNameById} emptyText="Nothing in this tier right now." />
      <Section title="Could do" subtitle="Optional" items={couldDo} projectNameById={projectNameById} emptyText="Nothing optional queued." />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-1 text-sm font-semibold">Meetings</h3>
          <p className="text-sm text-muted-foreground">Calendar isn&apos;t wired up yet — coming in a later phase.</p>
        </Card>
        <Card className="p-4">
          <h3 className="mb-1 text-sm font-semibold">Habits</h3>
          <p className="text-sm text-muted-foreground">Habit tracking isn&apos;t wired up yet — coming in a later phase.</p>
        </Card>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  items,
  projectNameById,
  emptyText,
}: {
  title: string;
  subtitle: string;
  items: Awaited<ReturnType<typeof getActiveWorkItems>>;
  projectNameById: Map<string, string>;
  emptyText: string;
}) {
  return (
    <Card className="p-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="flex flex-col">
          {items.map((s) => (
            <WorkItemRow key={s.item.id} scored={s} projectName={s.item.projectId ? projectNameById.get(s.item.projectId) : undefined} />
          ))}
        </div>
      )}
    </Card>
  );
}
