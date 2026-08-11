import { requireUser } from "@/lib/auth/current-user";
import { getSkillsForUser } from "@/lib/queries/skills";
import { SkillFormDialog } from "@/components/learning/skill-form-dialog";
import { SkillCard } from "@/components/learning/skill-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function LearningPage() {
  const user = await requireUser();
  const skills = await getSkillsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Learning</h1>
          <p className="text-sm text-muted-foreground">Skills you&apos;re deliberately leveling up.</p>
        </div>
        <SkillFormDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New skill
            </Button>
          }
        />
      </div>

      {skills.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">No skills tracked yet.</Card>
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
