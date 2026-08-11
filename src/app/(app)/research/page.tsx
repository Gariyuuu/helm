import { requireUser } from "@/lib/auth/current-user";
import { getResearchProjectsForUser } from "@/lib/queries/research";
import { ResearchFormDialog } from "@/components/research/research-form-dialog";
import { ResearchCard } from "@/components/research/research-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ResearchPage() {
  const user = await requireUser();
  const projects = await getResearchProjectsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Research Tracker</h1>
          <p className="text-sm text-muted-foreground">Groups, papers, and reading lists.</p>
        </div>
        <ResearchFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New
            </Button>
          }
        />
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          No research projects yet.
        </Card>
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
