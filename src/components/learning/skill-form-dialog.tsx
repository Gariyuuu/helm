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
import { createSkill } from "@/lib/actions/skills";

export function SkillFormDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [currentLevel, setCurrentLevel] = useState("1");
  const [targetLevel, setTargetLevel] = useState("5");
  const [nextLesson, setNextLesson] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createSkill({
          name: name.trim(),
          currentLevel: Number(currentLevel),
          targetLevel: Number(targetLevel),
          nextLesson: nextLesson || undefined,
        });
        toast.success("Skill added");
        setName("");
        setCurrentLevel("1");
        setTargetLevel("5");
        setNextLesson("");
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not add skill");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New skill</DialogTitle>
          <DialogDescription>Something you&apos;re deliberately leveling up.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Rust" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Current level (1-5)</Label>
              <Input type="number" min={1} max={5} value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1">Target level (1-5)</Label>
              <Input type="number" min={1} max={5} value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1">Next lesson</Label>
            <Input value={nextLesson} onChange={(e) => setNextLesson(e.target.value)} placeholder="What's next?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
