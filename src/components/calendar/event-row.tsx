"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/lib/actions/calendar";
import type { events } from "@/lib/db/schema";
import { X } from "lucide-react";

export function EventRow({ event }: { event: typeof events.$inferSelect }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="flex items-center justify-between gap-3 p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{event.title}</p>
          <Badge variant="outline" className="capitalize">
            {event.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {event.allDay
            ? event.startAt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
            : `${event.startAt.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} – ${event.endAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`}
          {event.location && ` · ${event.location}`}
        </p>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="size-7 shrink-0"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteEvent(event.id);
            router.refresh();
          })
        }
      >
        <X className="size-3.5" />
      </Button>
    </Card>
  );
}
