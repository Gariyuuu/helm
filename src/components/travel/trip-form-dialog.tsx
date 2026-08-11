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
import { createTrip } from "@/lib/actions/travel";

export function TripFormDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!destination.trim()) return;
    startTransition(async () => {
      try {
        await createTrip({
          destination: destination.trim(),
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          budget: budget ? Number(budget) : undefined,
        });
        toast.success("Trip created");
        setDestination("");
        setStartDate("");
        setEndDate("");
        setBudget("");
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not create trip");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New trip</DialogTitle>
          <DialogDescription>Destination, dates, and a budget to plan against.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1">Start</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1">End</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1">Budget</Label>
            <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="USD" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !destination.trim()}>
            {isPending ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
