import { requireUser } from "@/lib/auth/current-user";
import { getApplicationsForUser, getCompaniesForUser } from "@/lib/queries/career";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { ApplicationCard } from "@/components/applications/application-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

const ACTIVE_GROUPS: { label: string; statuses: string[] }[] = [
  { label: "Interested / researching", statuses: ["interested", "researching"] },
  { label: "Preparing / ready", statuses: ["preparing", "ready"] },
  { label: "Applied", statuses: ["applied"] },
  { label: "In process", statuses: ["oa", "interview", "final_round"] },
  { label: "Offer", statuses: ["offer"] },
];
const CLOSED_STATUSES = ["rejected", "withdrawn"];

export default async function ApplicationsPage() {
  const user = await requireUser();
  const [rows, companies] = await Promise.all([getApplicationsForUser(user.id), getCompaniesForUser(user.id)]);
  const companyOptions = companies.map((c) => ({ id: c.id, name: c.name }));
  const closed = rows.filter((r) => CLOSED_STATUSES.includes(r.application.status));

  const total = rows.length;
  const applied = rows.filter((r) => r.application.status !== "interested" && r.application.status !== "researching").length;
  const responseRate = applied > 0 ? Math.round((rows.filter((r) => !["interested", "researching", "preparing", "ready", "applied"].includes(r.application.status)).length / applied) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        icon={FileText}
        title="Application Tracker"
        description={`${total} total · ${responseRate}% response rate`}
        domainSlug="career"
        action={
          <ApplicationFormDialog
            companies={companyOptions}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> New
              </Button>
            }
          />
        }
      />

      {total === 0 ? (
        <EmptyState icon={FileText}>No applications yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          {ACTIVE_GROUPS.map((group) => {
            const groupRows = rows.filter((r) => group.statuses.includes(r.application.status));
            if (groupRows.length === 0) return null;
            return (
              <div key={group.label}>
                <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {group.label} ({groupRows.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {groupRows.map((r) => (
                    <ApplicationCard key={r.application.id} application={r.application} company={r.company} />
                  ))}
                </div>
              </div>
            );
          })}
          {closed.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Closed ({closed.length})</h2>
              <div className="flex flex-col gap-2 opacity-60">
                {closed.map((r) => (
                  <ApplicationCard key={r.application.id} application={r.application} company={r.company} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
