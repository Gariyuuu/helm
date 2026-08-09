import type { workItems } from "@/lib/db/schema";
import { computePriority, type PriorityInput, type PriorityResult } from "./engine";

type WorkItemRow = typeof workItems.$inferSelect;

export function toPriorityInput(row: WorkItemRow, dependentCount: number): PriorityInput {
  return {
    status: row.status,
    deadline: row.deadline,
    estimatedMinutes: row.estimatedMinutes,
    urgency: row.urgency,
    importance: row.importance,
    stakes: row.stakes,
    academicImpact: row.academicImpact,
    careerImpact: row.careerImpact,
    financialImpact: row.financialImpact,
    relationshipImpact: row.relationshipImpact,
    healthImpact: row.healthImpact,
    opportunityValue: row.opportunityValue,
    consequenceOfFailure: row.consequenceOfFailure,
    consequenceOfDelay: row.consequenceOfDelay,
    reversibility: row.reversibility,
    peopleWaitingCount: row.peopleWaitingCount,
    timesPostponed: row.timesPostponed,
    priorityOverride: row.priorityOverride,
    overrideUntil: row.overrideUntil,
    dependentCount,
  };
}

export interface ScoredWorkItem {
  item: WorkItemRow;
  priority: PriorityResult;
}

export function scoreWorkItems(rows: WorkItemRow[], dependentCounts: Map<string, number>, now?: Date): ScoredWorkItem[] {
  return rows
    .map((item) => ({
      item,
      priority: computePriority(toPriorityInput(item, dependentCounts.get(item.id) ?? 0), now),
    }))
    .sort((a, b) => b.priority.score - a.priority.score);
}
