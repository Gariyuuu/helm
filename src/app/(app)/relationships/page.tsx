import { requireUser } from "@/lib/auth/current-user";
import { getContactsForUser } from "@/lib/queries/career";
import { getDomainsForUser } from "@/lib/queries/domains";
import { getProjectsForUser } from "@/lib/queries/projects";
import { getWorkItemsByDomain } from "@/lib/queries/work-items";
import { ContactFormDialog } from "@/components/career/contact-form-dialog";
import { WorkItemFormDialog } from "@/components/work-items/work-item-form-dialog";
import { WorkItemRow } from "@/components/work-items/work-item-row";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default async function RelationshipsPage() {
  const user = await requireUser();
  const [contacts, domains, projects] = await Promise.all([
    getContactsForUser(user.id),
    getDomainsForUser(user.id),
    getProjectsForUser(user.id),
  ]);
  const domain = domains.find((d) => d.slug === "relationships");
  const items = domain ? await getWorkItemsByDomain(user.id, domain.id) : [];
  const domainOptions = domains.map((d) => ({ id: d.id, name: d.name }));
  const projectOptions = projects.map((p) => ({ id: p.project.id, name: p.project.name }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <PageHeader
        icon={Users}
        title="Relationships"
        description="People, and things to follow up on with them."
        domainSlug="relationships"
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Contacts</h2>
          <ContactFormDialog
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" /> Contact
              </Button>
            }
          />
        </div>
        {contacts.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">No contacts yet.</Card>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {contacts.map((c) => (
              <Card key={c.id} className="p-3">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[c.role, c.company].filter(Boolean).join(" · ") || c.relationshipType || "—"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Follow-ups</h2>
          {domain && (
            <WorkItemFormDialog
              trigger={
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="size-3.5" /> Add
                </Button>
              }
              domains={domainOptions}
              projects={projectOptions}
              initial={{ domainId: domain.id }}
            />
          )}
        </div>
        {items.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">Nothing to follow up on yet.</Card>
        ) : (
          <div className="flex flex-col">
            {items.map((s) => (
              <WorkItemRow key={s.item.id} scored={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
