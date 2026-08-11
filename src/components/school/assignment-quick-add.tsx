"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAssignment } from "@/lib/actions/school";
import { Plus } from "lucide-react";

export function AssignmentQuickAdd({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");
  const [pointsPossible, setPointsPossible] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function add() {
    if (!title.trim()) return;
    startTransition(async () => {
      await createAssignment({
        courseId,
        title: title.trim(),
        pointsPossible: pointsPossible ? Number(pointsPossible) : undefined,
        dueAt: dueAt ? new Date(dueAt) : null,
      });
      setTitle("");
      setPointsPossible("");
      setDueAt("");
      router.refresh();
    });
  }

  return (
    <div className="mt-2 flex gap-1.5">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add assignment"
        className="h-8 flex-1 text-sm"
        onKeyDown={(e) => e.key === "Enter" && add()}
      />
      <Input
        type="number"
        value={pointsPossible}
        onChange={(e) => setPointsPossible(e.target.value)}
        placeholder="pts"
        className="h-8 w-16 text-sm"
      />
      <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="h-8 w-36 text-sm" />
      <Button size="icon" variant="outline" className="size-8 shrink-0" disabled={isPending || !title.trim()} onClick={add}>
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
