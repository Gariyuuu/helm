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
import { createCourse } from "@/lib/actions/school";

export function CourseFormDialog({ trigger, semesterId }: { trigger: ReactNode; semesterId: string | null }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [professor, setProfessor] = useState("");
  const [units, setUnits] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!name.trim()) return;
    startTransition(async () => {
      await createCourse({
        semesterId,
        name: name.trim(),
        code: code || undefined,
        professor: professor || undefined,
        units: units ? Number(units) : undefined,
      });
      setName("");
      setCode("");
      setProfessor("");
      setUnits("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New course</DialogTitle>
          <DialogDescription>Added to the current semester.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CS 101" />
            </div>
            <div>
              <Label className="mb-1">Units</Label>
              <Input type="number" value={units} onChange={(e) => setUnits(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1">Professor</Label>
            <Input value={professor} onChange={(e) => setProfessor(e.target.value)} />
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
