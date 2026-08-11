"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { archiveProject } from "@/lib/actions/projects";
import { Archive } from "lucide-react";

export function ArchiveProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      className="shrink-0 gap-1.5"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await archiveProject(projectId);
          router.push("/projects");
        })
      }
    >
      <Archive className="size-3.5" /> Archive
    </Button>
  );
}
