import { requireUser } from "@/lib/auth/current-user";
import { getDomainsForUser } from "@/lib/queries/domains";
import { getProjectsForUser } from "@/lib/queries/projects";
import { getWorkItemsByDomain } from "@/lib/queries/work-items";
import { WorkItemFormDialog } from "@/components/work-items/work-item-form-dialog";
import { WorkItemRow } from "@/components/work-items/work-item-row";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, type LucideIcon } from "lucide-react";

export async function DomainWorkView({
  slug,
  title,
  description,
  icon: Icon,
  emptyLabel,
}: {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  emptyLabel: string;
}) {
  const user = await requireUser();
  const [domains, projects] = await Promise.all([getDomainsForUser(user.id), getProjectsForUser(user.id)]);
  const domain = domains.find((d) => d.slug === slug);
  const items = domain ? await getWorkItemsByDomain(user.id, domain.id) : [];
  const domainOptions = domains.map((d) => ({ id: d.id, name: d.name }));
  const projectOptions = projects.map((p) => ({ id: p.project.id, name: p.project.name }));

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        icon={Icon}
        title={title}
        description={description}
        domainSlug={slug}
        action={
          domain && (
            <WorkItemFormDialog
              trigger={
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" /> Add
                </Button>
              }
              domains={domainOptions}
              projects={projectOptions}
              initial={{ domainId: domain.id }}
            />
          )
        }
      />

      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">{emptyLabel}</Card>
      ) : (
        <div className="flex flex-col">
          {items.map((s) => (
            <WorkItemRow key={s.item.id} scored={s} />
          ))}
        </div>
      )}
    </div>
  );
}
