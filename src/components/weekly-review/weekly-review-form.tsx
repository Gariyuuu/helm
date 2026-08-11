"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveWeeklyReview } from "@/lib/actions/weekly-review";

export function WeeklyReviewForm({
  weekStart,
  stats,
  existing,
}: {
  weekStart: Date;
  stats: { completedCount: number; missedCount: number; addedCount: number; droppedCount: number };
  existing?: {
    biggestWin: string | null;
    biggestBottleneck: string | null;
    nextWeekFocus: string | null;
    notes: string | null;
  };
}) {
  const [biggestWin, setBiggestWin] = useState(existing?.biggestWin ?? "");
  const [biggestBottleneck, setBiggestBottleneck] = useState(existing?.biggestBottleneck ?? "");
  const [nextWeekFocus, setNextWeekFocus] = useState(existing?.nextWeekFocus ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      await saveWeeklyReview({
        weekStart,
        ...stats,
        biggestWin: biggestWin || undefined,
        biggestBottleneck: biggestBottleneck || undefined,
        nextWeekFocus: nextWeekFocus || undefined,
        notes: notes || undefined,
      });
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <Card className="p-4">
      <div className="mb-3 grid grid-cols-4 gap-3 text-center text-sm">
        <div>
          <p className="text-lg font-semibold text-health-healthy">{stats.completedCount}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-priority-critical">{stats.missedCount}</p>
          <p className="text-xs text-muted-foreground">Missed</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{stats.addedCount}</p>
          <p className="text-xs text-muted-foreground">Added</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-muted-foreground">{stats.droppedCount}</p>
          <p className="text-xs text-muted-foreground">Dropped</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <Label className="mb-1">Biggest win</Label>
          <Textarea value={biggestWin} onChange={(e) => setBiggestWin(e.target.value)} rows={2} />
        </div>
        <div>
          <Label className="mb-1">Biggest bottleneck</Label>
          <Textarea value={biggestBottleneck} onChange={(e) => setBiggestBottleneck(e.target.value)} rows={2} />
        </div>
        <div>
          <Label className="mb-1">Next week&apos;s focus</Label>
          <Textarea value={nextWeekFocus} onChange={(e) => setNextWeekFocus(e.target.value)} rows={2} />
        </div>
        <div>
          <Label className="mb-1">Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save review"}
        </Button>
        {saved && !isPending && <span className="text-xs text-muted-foreground">Saved.</span>}
      </div>
    </Card>
  );
}
