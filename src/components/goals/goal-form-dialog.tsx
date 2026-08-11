"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
import { createGoal, updateGoal } from "@/lib/actions/goals";
import { goalTypeValues } from "@/lib/validation/goal";

export function GoalFormDialog({
  trigger,
  domains,
  goals,
  goalId,
  initial,
}: {
  trigger: ReactNode;
  domains: { id: string; name: string }[];
  goals: { id: string; title: string }[];
  goalId?: string;
  initial?: {
    title?: string;
    description?: string;
    type?: (typeof goalTypeValues)[number];
    domainId?: string | null;
    parentGoalId?: string | null;
    targetDate?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState<(typeof goalTypeValues)[number]>(initial?.type ?? "monthly");
  const [domainId, setDomainId] = useState<string>(initial?.domainId ?? "none");
  const [parentGoalId, setParentGoalId] = useState<string>(initial?.parentGoalId ?? "none");
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(goalId);

  function handleSubmit() {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description || undefined,
      type,
      domainId: domainId === "none" ? null : domainId,
      parentGoalId: parentGoalId === "none" ? null : parentGoalId,
      targetDate: targetDate ? new Date(targetDate) : null,
    };
    startTransition(async () => {
      if (isEdit && goalId) {
        await updateGoal({ id: goalId, ...payload });
      } else {
        await createGoal(payload);
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "New goal"}</DialogTitle>
          <DialogDescription>Vision → Goal → Milestone → Project → Task.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <Label className="mb-1">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalTypeValues.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
          <div>
            <Label className="mb-1">Parent goal</Label>
            <Select value={parentGoalId} onValueChange={setParentGoalId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None — top level</SelectItem>
                {goals
                  .filter((g) => g.id !== goalId)
                  .map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1">Target date</Label>
            <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !title.trim()}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
