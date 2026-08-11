"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ResearchFormDialog } from "@/components/research/research-form-dialog";
import { addReadingListItem, toggleReadingListItem } from "@/lib/actions/research";
import type { researchProjects } from "@/lib/db/schema";
import { Pencil, Plus } from "lucide-react";

export function ResearchCard({ project }: { project: typeof researchProjects.$inferSelect }) {
  const [isPending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState("");
  const router = useRouter();

  function addItem() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      await addReadingListItem(project.id, newTitle.trim());
      setNewTitle("");
      router.refresh();
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{project.topic}</p>
            <Badge variant="outline" className="capitalize">
              {project.status}
            </Badge>
            {project.potentialAuthorship && <Badge className="border-0 bg-priority-medium text-black">potential authorship</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[project.researchGroup, project.professor].filter(Boolean).join(" · ") || "No group/professor set"}
          </p>
          {project.paperTitle && <p className="mt-1 text-sm text-muted-foreground">&ldquo;{project.paperTitle}&rdquo;</p>}
        </div>
        <ResearchFormDialog
          trigger={
            <Button variant="ghost" size="icon" className="size-7 shrink-0">
              <Pencil className="size-3.5" />
            </Button>
          }
          researchId={project.id}
          initial={{
            topic: project.topic,
            researchGroup: project.researchGroup ?? "",
            professor: project.professor ?? "",
            myRole: project.myRole ?? "",
            paperTitle: project.paperTitle ?? "",
            potentialAuthorship: project.potentialAuthorship,
            status: project.status,
            notes: project.notes ?? "",
          }}
        />
      </div>

      {project.notes && <p className="mt-2 text-sm text-muted-foreground">{project.notes}</p>}

      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Reading list ({(project.readingList ?? []).filter((r) => r.done).length}/{(project.readingList ?? []).length})
        </p>
        <div className="flex flex-col gap-1">
          {(project.readingList ?? []).map((item, i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={item.done}
                disabled={isPending}
                onCheckedChange={() =>
                  startTransition(async () => {
                    await toggleReadingListItem(project.id, i);
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
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a paper to read"
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <Button size="icon" variant="outline" className="size-8 shrink-0" disabled={isPending || !newTitle.trim()} onClick={addItem}>
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
