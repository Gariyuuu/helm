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
import { createWaitingItem } from "@/lib/actions/waiting-items";

export function WaitingItemFormDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [person, setPerson] = useState("");
  const [whatFor, setWhatFor] = useState("");
  const [expectedResponseDate, setExpectedResponseDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!person.trim() || !whatFor.trim()) return;
    startTransition(async () => {
      await createWaitingItem({
        person: person.trim(),
        whatFor: whatFor.trim(),
        expectedResponseDate: expectedResponseDate ? new Date(expectedResponseDate) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      });
      setPerson("");
      setWhatFor("");
      setExpectedResponseDate("");
      setFollowUpDate("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New waiting item</DialogTitle>
          <DialogDescription>Something you&apos;re blocked on someone else for.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Who</Label>
            <Input value={person} onChange={(e) => setPerson(e.target.value)} autoFocus placeholder="e.g. Professor Lin" />
          </div>
          <div>
            <Label className="mb-1">What for</Label>
            <Input value={whatFor} onChange={(e) => setWhatFor(e.target.value)} placeholder="e.g. Letter of recommendation" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Expected response</Label>
              <Input type="date" value={expectedResponseDate} onChange={(e) => setExpectedResponseDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1">Follow up on</Label>
              <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !person.trim() || !whatFor.trim()}>
            {isPending ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
