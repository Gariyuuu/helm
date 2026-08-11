"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateAssignment, deleteAssignment } from "@/lib/actions/school";
import type { assignments } from "@/lib/db/schema";
import { X } from "lucide-react";

function isOverdue(dueAt: Date | null) {
  return Boolean(dueAt && dueAt.getTime() < Date.now());
}

export function AssignmentRow({ assignment }: { assignment: typeof assignments.$inferSelect }) {
  const [pointsEarned, setPointsEarned] = useState(assignment.pointsEarned?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const overdue = !assignment.pointsEarned && isOverdue(assignment.dueAt);

  function save() {
    startTransition(async () => {
      await updateAssignment({ id: assignment.id, pointsEarned: pointsEarned === "" ? null : Number(pointsEarned) });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate">{assignment.title}</p>
        <p className="text-xs text-muted-foreground">
          {assignment.gradeCategory && `${assignment.gradeCategory} · `}
          {assignment.dueAt ? assignment.dueAt.toLocaleDateString() : "No due date"}
          {overdue && <span className="text-priority-critical"> · overdue</span>}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <Input
          type="number"
          value={pointsEarned}
          onChange={(e) => setPointsEarned(e.target.value)}
          onBlur={save}
          disabled={isPending}
          className="h-7 w-16 text-xs"
          placeholder="—"
        />
        <span>/ {assignment.pointsPossible ?? "—"}</span>
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteAssignment(assignment.id);
              router.refresh();
            })
          }
        >
          <X className="size-3" />
        </Button>
      </div>
    </div>
  );
}
