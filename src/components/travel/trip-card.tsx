"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { addChecklistItem, addFlight, addHotel, toggleChecklistItem } from "@/lib/actions/travel";
import type { travelProjects } from "@/lib/db/schema";
import { Plus } from "lucide-react";

function AddRow({ placeholder, onAdd, disabled }: { placeholder: string; onAdd: (value: string) => void; disabled: boolean }) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-1.5 flex gap-1.5">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onAdd(value.trim());
            setValue("");
          }
        }}
      />
      <Button
        size="icon"
        variant="outline"
        className="size-8 shrink-0"
        disabled={disabled || !value.trim()}
        onClick={() => {
          onAdd(value.trim());
          setValue("");
        }}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}

export function TripCard({ trip }: { trip: typeof travelProjects.$inferSelect }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const doneCount = (trip.checklist ?? []).filter((c) => c.done).length;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{trip.destination}</p>
          <p className="text-xs text-muted-foreground">
            {trip.startDate ? trip.startDate.toLocaleDateString() : "No start date"}
            {trip.endDate && ` – ${trip.endDate.toLocaleDateString()}`}
          </p>
        </div>
        {trip.budget && <Badge variant="outline">${trip.budget} budget</Badge>}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Flights</p>
          {(trip.flights ?? []).map((f, i) => (
            <p key={i} className="truncate text-sm">
              {f.label}
            </p>
          ))}
          <AddRow
            placeholder="Add flight"
            disabled={isPending}
            onAdd={(v) => startTransition(async () => { await addFlight(trip.id, v); router.refresh(); })}
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Hotels</p>
          {(trip.hotels ?? []).map((h, i) => (
            <p key={i} className="truncate text-sm">
              {h.label}
            </p>
          ))}
          <AddRow
            placeholder="Add hotel"
            disabled={isPending}
            onAdd={(v) => startTransition(async () => { await addHotel(trip.id, v); router.refresh(); })}
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Checklist ({doneCount}/{(trip.checklist ?? []).length})
          </p>
          {(trip.checklist ?? []).map((c, i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={c.done}
                disabled={isPending}
                onCheckedChange={() => startTransition(async () => { await toggleChecklistItem(trip.id, i); router.refresh(); })}
              />
              <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.item}</span>
            </label>
          ))}
          <AddRow
            placeholder="Add item"
            disabled={isPending}
            onAdd={(v) => startTransition(async () => { await addChecklistItem(trip.id, v); router.refresh(); })}
          />
        </div>
      </div>
    </Card>
  );
}
