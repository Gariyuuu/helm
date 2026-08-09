import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { PriorityResult } from "@/lib/priority/engine";
import { cn } from "@/lib/utils";

const BUCKET_STYLES: Record<PriorityResult["bucket"], string> = {
  Critical: "bg-priority-critical text-priority-critical-foreground",
  "Very High": "bg-priority-high text-priority-high-foreground",
  High: "bg-priority-high/70 text-priority-high-foreground",
  Medium: "bg-priority-medium text-priority-medium-foreground",
  Low: "bg-priority-low text-priority-low-foreground",
  Someday: "bg-priority-someday text-priority-someday-foreground",
};

export function PriorityBadge({ priority, className }: { priority: PriorityResult; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className={cn("cursor-default border-0 font-medium tabular-nums", BUCKET_STYLES[priority.bucket], className)}>
          {priority.score}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        <p className="mb-1 font-semibold">
          Priority: {priority.score} / 100 — {priority.bucket}
        </p>
        {priority.reasons.length > 0 ? (
          <ul className="list-disc space-y-0.5 pl-3.5 text-xs">
            {priority.reasons.map((r, i) => (
              <li key={i}>{r.label}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs opacity-80">No strong signals yet.</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
