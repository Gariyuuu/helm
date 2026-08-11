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
import { Checkbox } from "@/components/ui/checkbox";
import { createResearchProject, updateResearchProject } from "@/lib/actions/research";
import { researchStatusValues } from "@/lib/validation/research";

export function ResearchFormDialog({
  trigger,
  researchId,
  initial,
}: {
  trigger: ReactNode;
  researchId?: string;
  initial?: {
    topic?: string;
    researchGroup?: string;
    professor?: string;
    myRole?: string;
    paperTitle?: string;
    potentialAuthorship?: boolean;
    status?: (typeof researchStatusValues)[number];
    notes?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [researchGroup, setResearchGroup] = useState(initial?.researchGroup ?? "");
  const [professor, setProfessor] = useState(initial?.professor ?? "");
  const [myRole, setMyRole] = useState(initial?.myRole ?? "");
  const [paperTitle, setPaperTitle] = useState(initial?.paperTitle ?? "");
  const [potentialAuthorship, setPotentialAuthorship] = useState(initial?.potentialAuthorship ?? false);
  const [status, setStatus] = useState<(typeof researchStatusValues)[number]>(initial?.status ?? "exploring");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = Boolean(researchId);

  function handleSubmit() {
    if (!topic.trim()) return;
    const payload = {
      topic: topic.trim(),
      researchGroup: researchGroup || undefined,
      professor: professor || undefined,
      myRole: myRole || undefined,
      paperTitle: paperTitle || undefined,
      potentialAuthorship,
      status,
      notes: notes || undefined,
    };
    startTransition(async () => {
      if (isEdit && researchId) {
        await updateResearchProject({ id: researchId, ...payload });
      } else {
        await createResearchProject(payload);
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
          <DialogTitle>{isEdit ? "Edit research" : "New research project"}</DialogTitle>
          <DialogDescription>Groups, papers, and deliverables tied to a research effort.</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          <div>
            <Label className="mb-1">Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Research group</Label>
              <Input value={researchGroup} onChange={(e) => setResearchGroup(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1">Professor</Label>
              <Input value={professor} onChange={(e) => setProfessor(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">My role</Label>
              <Input value={myRole} onChange={(e) => setMyRole(e.target.value)} placeholder="e.g. RA, co-author" />
            </div>
            <div>
              <Label className="mb-1">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {researchStatusValues.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1">Paper title</Label>
            <Input value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={potentialAuthorship} onCheckedChange={(v) => setPotentialAuthorship(Boolean(v))} id="authorship" />
            <Label htmlFor="authorship" className="font-normal">
              Potential authorship on this paper
            </Label>
          </div>
          <div>
            <Label className="mb-1">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !topic.trim()}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
