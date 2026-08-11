import { requireUser } from "@/lib/auth/current-user";
import { getSkillsForUser } from "@/lib/queries/skills";
import { SkillFormDialog } from "@/components/learning/skill-form-dialog";
import { SkillCard } from "@/components/learning/skill-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

export default async function LearningPage() {
  const user = await requireUser();
  const skills = await getSkillsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <PageHeader
        icon={BookOpen}
        title="Learning"
        description="Skills you're deliberately leveling up."
        domainSlug="learning"
        action={
          <SkillFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> New skill
              </Button>
            }
          />
        }
      />

      {skills.length === 0 ? (
        <EmptyState icon={BookOpen}>No skills tracked yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {skills.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}
