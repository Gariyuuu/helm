"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { addSkillResource, toggleSkillResource, logStudySession } from "@/lib/actions/skills";
import type { skills } from "@/lib/db/schema";
import { Plus } from "lucide-react";

export function SkillCard({ skill }: { skill: typeof skills.$inferSelect }) {
  const [isPending, startTransition] = useTransition();
  const [newResource, setNewResource] = useState("");
  const [logHours, setLogHours] = useState("1");
  const router = useRouter();
  const progress = Math.round((skill.currentLevel / skill.targetLevel) * 100);

  function addResource() {
    if (!newResource.trim()) return;
    startTransition(async () => {
      await addSkillResource(skill.id, newResource.trim());
      setNewResource("");
      router.refresh();
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{skill.name}</p>
          <p className="text-xs text-muted-foreground">
            Level {skill.currentLevel}/{skill.targetLevel} · {skill.hoursLogged}h logged
            {skill.lastStudiedAt && ` · last studied ${skill.lastStudiedAt.toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Input
            type="number"
            min={0.5}
            step={0.5}
            value={logHours}
            onChange={(e) => setLogHours(e.target.value)}
            className="h-8 w-16 text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={isPending || Number(logHours) <= 0}
            onClick={() =>
              startTransition(async () => {
                await logStudySession(skill.id, Number(logHours));
                router.refresh();
              })
            }
          >
            Log hours
          </Button>
        </div>
      </div>
      <Progress value={progress} className="mt-3 h-1.5" />
      {skill.nextLesson && <p className="mt-2 text-sm text-muted-foreground">Next: {skill.nextLesson}</p>}

      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Resources ({(skill.resources ?? []).filter((r) => r.done).length}/{(skill.resources ?? []).length})
        </p>
        <div className="flex flex-col gap-1">
          {(skill.resources ?? []).map((item, i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={item.done}
                disabled={isPending}
                onCheckedChange={() =>
                  startTransition(async () => {
                    await toggleSkillResource(skill.id, i);
                    router.refresh();
                  })
                }
              />
              <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.title}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          <Input
            value={newResource}
            onChange={(e) => setNewResource(e.target.value)}
            placeholder="Add a resource"
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addResource()}
          />
          <Button size="icon" variant="outline" className="size-8 shrink-0" disabled={isPending || !newResource.trim()} onClick={addResource}>
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
