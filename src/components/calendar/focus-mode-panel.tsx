"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { abandonFocusSession, startFocusSession, stopFocusSession } from "@/lib/actions/calendar";
import type { focusSessions } from "@/lib/db/schema";
import { Play, Square } from "lucide-react";

function formatElapsed(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusModePanel({
  activeSession,
  workItemOptions,
}: {
  activeSession: typeof focusSessions.$inferSelect | undefined;
  workItemOptions: { id: string; title: string }[];
}) {
  const [elapsed, setElapsed] = useState(0);
  const [workItemId, setWorkItemId] = useState("none");
  const [plannedMinutes, setPlannedMinutes] = useState("25");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!activeSession) return;
    const startedAtMs = new Date(activeSession.startedAt).getTime();
    function tick() {
      setElapsed(Math.floor((Date.now() - startedAtMs) / 1000));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const activeWorkItem = activeSession ? workItemOptions.find((w) => w.id === activeSession.workItemId) : undefined;

  if (activeSession) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Focus session running</p>
            <p className="text-2xl font-semibold tabular-nums">{formatElapsed(elapsed)}</p>
            <p className="text-xs text-muted-foreground">
              {activeWorkItem ? activeWorkItem.title : "No linked work item"} · planned {activeSession.plannedMinutes}m
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await abandonFocusSession(activeSession.id);
                  toast("Focus session abandoned");
                  router.refresh();
                })
              }
            >
              Abandon
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await stopFocusSession(activeSession.id);
                  toast.success(`Focus session logged — ${formatElapsed(elapsed)}`);
                  router.refresh();
                })
              }
            >
              <Square className="size-3.5" /> Stop
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Start a focus session</p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1">
          <Select value={workItemId} onValueChange={setWorkItemId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Work item (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No linked work item</SelectItem>
              {workItemOptions.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          type="number"
          min={1}
          max={480}
          value={plannedMinutes}
          onChange={(e) => setPlannedMinutes(e.target.value)}
          className="w-24"
        />
        <Button
          className="gap-1.5"
          disabled={isPending || !plannedMinutes}
          onClick={() =>
            startTransition(async () => {
              try {
                await startFocusSession({ workItemId: workItemId === "none" ? null : workItemId, plannedMinutes: Number(plannedMinutes) });
                toast.success("Focus session started");
                router.refresh();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Could not start session");
              }
            })
          }
        >
          <Play className="size-3.5" /> Start
        </Button>
      </div>
    </Card>
  );
}
