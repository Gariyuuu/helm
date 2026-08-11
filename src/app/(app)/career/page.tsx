import { requireUser } from "@/lib/auth/current-user";
import { getCompaniesForUser, getContactsForUser } from "@/lib/queries/career";
import { CompanyFormDialog } from "@/components/career/company-form-dialog";
import { ContactFormDialog } from "@/components/career/contact-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";

export default async function CareerPage() {
  const user = await requireUser();
  const [companies, contacts] = await Promise.all([getCompaniesForUser(user.id), getContactsForUser(user.id)]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <PageHeader
        icon={Briefcase}
        title="Career Command Center"
        description="Companies, recruiters, and referrals in one place."
        domainSlug="career"
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Companies</h2>
          <CompanyFormDialog
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="size-3.5" /> Company
              </Button>
            }
          />
        </div>
        {companies.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">No companies yet.</Card>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {companies.map((c) => (
              <Card key={c.id} className="p-3">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.industry || "—"}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
