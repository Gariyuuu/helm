import { requireUser } from "@/lib/auth/current-user";
import { getResearchProjectsForUser } from "@/lib/queries/research";
import { ResearchFormDialog } from "@/components/research/research-form-dialog";
import { ResearchCard } from "@/components/research/research-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { FlaskConical, Plus } from "lucide-react";

export default async function ResearchPage() {
  const user = await requireUser();
  const projects = await getResearchProjectsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        icon={FlaskConical}
        title="Research Tracker"
        description="Groups, papers, and reading lists."
        domainSlug="research"
        action={
          <ResearchFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> New
              </Button>
            }
          />
        }
      />

      {projects.length === 0 ? (
        <EmptyState icon={FlaskConical}>No research projects yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <ResearchCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
