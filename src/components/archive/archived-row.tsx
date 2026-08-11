"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { restoreProject } from "@/lib/actions/projects";
import { setWorkItemStatus } from "@/lib/actions/work-items";

export function ArchivedProjectRow({ project }: { project: { id: string; name: string; archivedAt: Date | null } }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="flex items-center justify-between gap-3 p-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{project.name}</p>
        <p className="text-xs text-muted-foreground">{project.archivedAt ? `Archived ${project.archivedAt.toLocaleDateString()}` : "Archived"}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await restoreProject(project.id);
            router.refresh();
          })
        }
      >
        Restore
      </Button>
    </Card>
  );
}

export function ArchivedWorkItemRow({ item }: { item: { id: string; title: string; updatedAt: Date } }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="flex items-center justify-between gap-3 p-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">Archived {item.updatedAt.toLocaleDateString()}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setWorkItemStatus(item.id, "planned");
            router.refresh();
          })
        }
      >
        Restore
      </Button>
    </Card>
  );
}
