"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject, updateProject } from "@/lib/actions/projects";
import { projectStatusValues } from "@/lib/validation/project";

export function ProjectFormDialog({
  trigger,
  domains,
  projectId,
  initial,
}: {
  trigger: ReactNode;
  domains: { id: string; name: string }[];
  projectId?: string;
  initial?: {
    name?: string;
    objective?: string;
    domainId?: string | null;
    status?: (typeof projectStatusValues)[number];
    deadline?: string;
    nextActionText?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [objective, setObjective] = useState(initial?.objective ?? "");
  const [domainId, setDomainId] = useState<string>(initial?.domainId ?? "none");
  const [status, setStatus] = useState<(typeof projectStatusValues)[number]>(initial?.status ?? "active");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [nextActionText, setNextActionText] = useState(initial?.nextActionText ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(projectId);

  function handleSubmit() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      objective: objective || undefined,
      domainId: domainId === "none" ? null : domainId,
      status,
      deadline: deadline ? new Date(deadline) : null,
      nextActionText: nextActionText || undefined,
    };
    startTransition(async () => {
      try {
        if (isEdit && projectId) {
          await updateProject({ id: projectId, ...payload });
          toast.success("Project updated");
        } else {
          await createProject(payload);
          toast.success("Project created");
        }
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save project");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>A project is a container for related work items with a next action.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <Label className="mb-1">Objective</Label>
            <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Domain</Label>
              <Select value={domainId} onValueChange={setDomainId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1">Deadline</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1">Next action</Label>
            <Input
              value={nextActionText}
              onChange={(e) => setNextActionText(e.target.value)}
              placeholder="What's the very next concrete step?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
