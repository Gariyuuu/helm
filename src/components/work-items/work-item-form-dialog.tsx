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
import { ScrollArea } from "@/components/ui/scroll-area";
import { createWorkItem, updateWorkItem } from "@/lib/actions/work-items";
import { WORK_ITEM_TYPES, reversibilityValues, energyValues, workItemStatusValues } from "@/lib/validation/work-item";

const CURATED_TYPES = [
  "task",
  "assignment",
  "exam",
  "meeting",
  "application",
  "research_deliverable",
  "errand",
  "date",
  "trip",
  "learning_objective",
  "coding_project",
  "financial_task",
  "follow_up",
  "interview",
  "idea",
  "habit",
  "reading",
] as const satisfies readonly (typeof WORK_ITEM_TYPES)[number][];

type LiteOption = { id: string; name: string };

export interface WorkItemFormValue {
  id?: string;
  title: string;
  description: string;
  type: (typeof WORK_ITEM_TYPES)[number];
  status: (typeof workItemStatusValues)[number];
  domainId: string | null;
  projectId: string | null;
  deadline: string; // datetime-local value
  estimatedMinutes: string;
  urgency: number;
  importance: number;
  stakes: number;
  academicImpact: number;
  careerImpact: number;
  financialImpact: number;
  relationshipImpact: number;
  healthImpact: number;
  opportunityValue: number;
  consequenceOfFailure: number;
  consequenceOfDelay: number;
  reversibility: (typeof reversibilityValues)[number];
  energyRequired: (typeof energyValues)[number];
  peopleWaitingCount: number;
  tags: string;
}

function emptyValue(defaults?: Partial<WorkItemFormValue>): WorkItemFormValue {
  return {
    title: "",
    description: "",
    type: "task",
    status: "planned",
    domainId: null,
    projectId: null,
    deadline: "",
    estimatedMinutes: "",
    urgency: 2,
    importance: 2,
    stakes: 2,
    academicImpact: 0,
    careerImpact: 0,
    financialImpact: 0,
    relationshipImpact: 0,
    healthImpact: 0,
    opportunityValue: 0,
    consequenceOfFailure: 1,
    consequenceOfDelay: 1,
    reversibility: "moderate",
    energyRequired: "medium",
    peopleWaitingCount: 0,
    tags: "",
    ...defaults,
  };
}

function ImpactField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label className="mb-1 text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={0}
        max={5}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
      />
    </div>
  );
}

export function WorkItemFormDialog({
  trigger,
  domains,
  projects,
  initial,
  workItemId,
}: {
  trigger: ReactNode;
  domains: LiteOption[];
  projects: LiteOption[];
  initial?: Partial<WorkItemFormValue>;
  workItemId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<WorkItemFormValue>(() => emptyValue(initial));
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(workItemId);

  function set<K extends keyof WorkItemFormValue>(key: K, v: WorkItemFormValue[K]) {
    setValue((prev) => ({ ...prev, [key]: v }));
  }

  function handleSubmit() {
    if (!value.title.trim()) return;
    const payload = {
      title: value.title.trim(),
      description: value.description || undefined,
      type: value.type,
      status: value.status,
      domainId: value.domainId,
      projectId: value.projectId,
      deadline: value.deadline ? new Date(value.deadline) : null,
      estimatedMinutes: value.estimatedMinutes ? Number(value.estimatedMinutes) : null,
      urgency: value.urgency,
      importance: value.importance,
      stakes: value.stakes,
      academicImpact: value.academicImpact,
      careerImpact: value.careerImpact,
      financialImpact: value.financialImpact,
      relationshipImpact: value.relationshipImpact,
      healthImpact: value.healthImpact,
      opportunityValue: value.opportunityValue,
      consequenceOfFailure: value.consequenceOfFailure,
      consequenceOfDelay: value.consequenceOfDelay,
      reversibility: value.reversibility,
      energyRequired: value.energyRequired,
      peopleWaitingCount: value.peopleWaitingCount,
      tags: value.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      try {
        if (isEdit && workItemId) {
          await updateWorkItem({ id: workItemId, ...payload });
          toast.success("Work item updated");
        } else {
          await createWorkItem(payload);
          toast.success("Work item created");
        }
        setOpen(false);
        if (!isEdit) setValue(emptyValue(initial));
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save work item");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{isEdit ? "Edit work item" : "New work item"}</DialogTitle>
          <DialogDescription>
            Everything connects to this universal object — priority is computed from what you fill in below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[65vh] px-6">
          <div className="flex flex-col gap-4 pb-4">
            <div>
              <Label className="mb-1">Title</Label>
              <Input value={value.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. ECON 140 problem set" autoFocus />
            </div>
            <div>
              <Label className="mb-1">Description</Label>
              <Textarea value={value.description} onChange={(e) => set("description", e.target.value)} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1">Type</Label>
                <Select value={value.type} onValueChange={(v) => set("type", v as WorkItemFormValue["type"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURATED_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1">Status</Label>
                <Select value={value.status} onValueChange={(v) => set("status", v as WorkItemFormValue["status"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workItemStatusValues
                      .filter((s) => !["completed", "cancelled", "archived"].includes(s))
                      .map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1">Life domain</Label>
                <Select value={value.domainId ?? "none"} onValueChange={(v) => set("domainId", v === "none" ? null : v)}>
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
                <Label className="mb-1">Project</Label>
                <Select value={value.projectId ?? "none"} onValueChange={(v) => set("projectId", v === "none" ? null : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1">Deadline</Label>
                <Input type="datetime-local" value={value.deadline} onChange={(e) => set("deadline", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1">Estimated minutes</Label>
                <Input
                  type="number"
                  min={0}
                  value={value.estimatedMinutes}
                  onChange={(e) => set("estimatedMinutes", e.target.value)}
                  placeholder="e.g. 90"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Urgency · Importance · Stakes (0–5)</p>
              <div className="grid grid-cols-3 gap-3">
                <ImpactField label="Urgency" value={value.urgency} onChange={(n) => set("urgency", n)} />
                <ImpactField label="Importance" value={value.importance} onChange={(n) => set("importance", n)} />
                <ImpactField label="Stakes" value={value.stakes} onChange={(n) => set("stakes", n)} />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Impact by area (0–5)</p>
              <div className="grid grid-cols-3 gap-3">
                <ImpactField label="Academic" value={value.academicImpact} onChange={(n) => set("academicImpact", n)} />
                <ImpactField label="Career" value={value.careerImpact} onChange={(n) => set("careerImpact", n)} />
                <ImpactField label="Financial" value={value.financialImpact} onChange={(n) => set("financialImpact", n)} />
                <ImpactField label="Relationship" value={value.relationshipImpact} onChange={(n) => set("relationshipImpact", n)} />
                <ImpactField label="Health" value={value.healthImpact} onChange={(n) => set("healthImpact", n)} />
                <ImpactField label="Opportunity" value={value.opportunityValue} onChange={(n) => set("opportunityValue", n)} />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Consequences (0–5)</p>
              <div className="grid grid-cols-2 gap-3">
                <ImpactField label="If it fails" value={value.consequenceOfFailure} onChange={(n) => set("consequenceOfFailure", n)} />
                <ImpactField label="If it's delayed" value={value.consequenceOfDelay} onChange={(n) => set("consequenceOfDelay", n)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1">Reversibility</Label>
                <Select value={value.reversibility} onValueChange={(v) => set("reversibility", v as WorkItemFormValue["reversibility"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reversibilityValues.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1">Energy</Label>
                <Select value={value.energyRequired} onValueChange={(v) => set("energyRequired", v as WorkItemFormValue["energyRequired"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {energyValues.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1">People waiting</Label>
                <Input
                  type="number"
                  min={0}
                  value={value.peopleWaitingCount}
                  onChange={(e) => set("peopleWaitingCount", Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1">Tags (comma separated)</Label>
              <Input value={value.tags} onChange={(e) => set("tags", e.target.value)} placeholder="quant, deadline, internship" />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !value.title.trim()}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
