export type Reversibility = "reversible" | "moderate" | "hard" | "irreversible";
export type PriorityOverride = "pin_top" | "force_today" | "do_not_prioritize" | "pause_until" | "ignore_until";
export type WorkItemStatus =
  | "inbox"
  | "planned"
  | "ready"
  | "in_progress"
  | "blocked"
  | "waiting"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "archived";

export interface PriorityInput {
  status: WorkItemStatus;
  deadline: Date | null;
  estimatedMinutes: number | null;
  urgency: number; // 0-5
  importance: number; // 0-5
  stakes: number; // 0-5
  academicImpact: number; // 0-5
  careerImpact: number; // 0-5
  financialImpact: number; // 0-5
  relationshipImpact: number; // 0-5
  healthImpact: number; // 0-5
  opportunityValue: number; // 0-5
  consequenceOfFailure: number; // 0-5
  consequenceOfDelay: number; // 0-5
  reversibility: Reversibility;
  peopleWaitingCount: number;
  timesPostponed: number;
  priorityOverride: PriorityOverride | null;
  overrideUntil: Date | null;
  dependentCount: number; // number of other items/projects blocked by this one
}

export type PriorityBucket = "Critical" | "Very High" | "High" | "Medium" | "Low" | "Someday";

export interface PriorityReason {
  label: string;
  weight: "major" | "minor";
}

export interface PriorityResult {
  score: number;
  bucket: PriorityBucket;
  reasons: PriorityReason[];
  breakdown: {
    deadlinePressure: number;
    stakesImportance: number;
    impactScore: number;
    consequenceScore: number;
    base: number;
    dependencyBoost: number;
    peopleWaitingBoost: number;
    neglectBoost: number;
    quickWinBoost: number;
    largeLowValuePenalty: number;
    reversibilityMultiplier: number;
    stateMultiplier: number;
    overrideApplied: PriorityOverride | null;
  };
}

const HOUR = 1000 * 60 * 60;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Nonlinear deadline pressure: front-loaded growth as the deadline approaches. */
function deadlinePressure(deadline: Date | null, urgency: number, now: Date): number {
  if (!deadline) return urgency * 8; // 0-40, no deadline caps out below "critical"

  const hoursRemaining = (deadline.getTime() - now.getTime()) / HOUR;

  if (hoursRemaining <= 0) return 100;
  if (hoursRemaining <= 24) return 90 + (10 * (24 - hoursRemaining)) / 24;
  if (hoursRemaining <= 72) return 70 + (20 * (72 - hoursRemaining)) / 48;
  if (hoursRemaining <= 168) return 40 + (30 * (168 - hoursRemaining)) / 96;
  if (hoursRemaining <= 720) return 15 + (25 * (720 - hoursRemaining)) / 552;
  return Math.max(0, 15 - (hoursRemaining - 720) / 2000);
}

function impactDimensions(input: PriorityInput) {
  return {
    academic: input.academicImpact,
    career: input.careerImpact,
    financial: input.financialImpact,
    relationship: input.relationshipImpact,
    health: input.healthImpact,
    opportunity: input.opportunityValue,
  };
}

export function computePriority(input: PriorityInput, now: Date = new Date()): PriorityResult {
  const reasons: PriorityReason[] = [];

  // Non-actionable states never surface as work to do.
  if (["completed", "cancelled", "archived"].includes(input.status)) {
    return {
      score: 0,
      bucket: "Someday",
      reasons: [{ label: "Item is closed out", weight: "minor" }],
      breakdown: emptyBreakdown(),
    };
  }

  const pressure = deadlinePressure(input.deadline, input.urgency, now);
  const stakesImportance = ((input.stakes + input.importance) / 10) * 100;

  const dims = impactDimensions(input);
  const dimValues = Object.values(dims);
  const maxImpact = Math.max(...dimValues);
  const avgImpact = dimValues.reduce((a, b) => a + b, 0) / dimValues.length;
  const impactScore = ((0.6 * maxImpact + 0.4 * avgImpact) / 5) * 100;

  const consequenceScore = ((input.consequenceOfFailure + input.consequenceOfDelay) / 10) * 100;

  const base = 0.35 * pressure + 0.2 * stakesImportance + 0.3 * impactScore + 0.15 * consequenceScore;

  const REVERSIBILITY_MULTIPLIERS: Record<Reversibility, number> = {
    reversible: 1.0,
    moderate: 1.0,
    hard: 1.05,
    irreversible: 1.12,
  };
  const reversibilityMultiplier = REVERSIBILITY_MULTIPLIERS[input.reversibility];

  const dependencyBoost = clamp(input.dependentCount * 10, 0, 20);
  const peopleWaitingBoost = clamp(input.peopleWaitingCount * 8, 0, 16);

  // Neglect only amplifies items that already matter — never resurrects trivial busywork.
  const neglectEligible = base >= 20;
  const neglectBoost = neglectEligible ? clamp(input.timesPostponed * 4, 0, 15) : 0;

  const quickWin = input.estimatedMinutes !== null && input.estimatedMinutes <= 20 && impactScore >= 45 && stakesImportance >= 40;
  const quickWinBoost = quickWin ? 10 : 0;

  const largeLowValue = input.estimatedMinutes !== null && input.estimatedMinutes >= 240 && impactScore < 35 && stakesImportance < 35;
  const largeLowValuePenalty = largeLowValue ? -8 : 0;

  let score =
    base * reversibilityMultiplier +
    dependencyBoost +
    peopleWaitingBoost +
    neglectBoost +
    quickWinBoost +
    largeLowValuePenalty;

  // Blocked/waiting items can't be acted on right now — surfaced for unblocking, not as "next move".
  let stateMultiplier = 1;
  if (input.status === "blocked" || input.status === "waiting") {
    stateMultiplier = 0.3;
    score *= stateMultiplier;
    reasons.push({ label: input.status === "blocked" ? "Blocked — cannot start yet" : "Waiting on someone else", weight: "major" });
  }

  score = clamp(Math.round(score), 0, 100);

  // Reason generation (before overrides, so the "why" reflects the real drivers).
  if (input.deadline) {
    const hours = (input.deadline.getTime() - now.getTime()) / HOUR;
    if (hours <= 0) reasons.push({ label: "Overdue", weight: "major" });
    else if (hours <= 24) reasons.push({ label: "Due within 24 hours", weight: "major" });
    else if (hours <= 72) reasons.push({ label: "Due within 3 days", weight: "major" });
    else if (hours <= 168) reasons.push({ label: "Due within a week", weight: "minor" });
  }
  if (input.stakes >= 4) reasons.push({ label: "High stakes", weight: "major" });
  if (input.importance >= 4) reasons.push({ label: "High importance", weight: "minor" });

  const topDim = Object.entries(dims).sort((a, b) => b[1] - a[1])[0];
  if (topDim && topDim[1] >= 4) {
    const label: Record<string, string> = {
      academic: "High academic impact",
      career: "High career impact",
      financial: "High financial impact",
      relationship: "High relationship impact",
      health: "High health impact",
      opportunity: "Opportunity may disappear if missed",
    };
    reasons.push({ label: label[topDim[0]], weight: "major" });
  }

  if (input.consequenceOfFailure >= 4) reasons.push({ label: "Severe consequences if missed", weight: "major" });
  if (input.reversibility === "irreversible") reasons.push({ label: "Irreversible if missed", weight: "major" });
  if (input.estimatedMinutes) {
    const h = Math.floor(input.estimatedMinutes / 60);
    const m = input.estimatedMinutes % 60;
    reasons.push({ label: `Estimated ${h > 0 ? `${h}h ` : ""}${m}m`, weight: "minor" });
  }
  if (input.timesPostponed > 0 && neglectBoost > 0) {
    reasons.push({ label: `Postponed ${input.timesPostponed}x already`, weight: "minor" });
  }
  if (dependencyBoost > 0) {
    reasons.push({ label: `${input.dependentCount} other item${input.dependentCount > 1 ? "s" : ""} depend on this`, weight: "major" });
  }
  if (peopleWaitingBoost > 0) {
    reasons.push({ label: `${input.peopleWaitingCount} ${input.peopleWaitingCount > 1 ? "people" : "person"} waiting on you`, weight: "major" });
  }
  if (quickWinBoost > 0) {
    reasons.push({ label: "Quick win — high value in under 20 minutes", weight: "minor" });
  }

  // Manual overrides always win, applied last and explained clearly.
  let overrideApplied: PriorityOverride | null = null;
  const overrideActive =
    input.priorityOverride &&
    (input.priorityOverride === "pin_top" || input.priorityOverride === "force_today" || input.priorityOverride === "do_not_prioritize"
      ? true
      : input.overrideUntil
        ? input.overrideUntil.getTime() > now.getTime()
        : false);

  if (overrideActive) {
    overrideApplied = input.priorityOverride;
    if (input.priorityOverride === "pin_top") {
      score = 100;
      reasons.unshift({ label: "Manually pinned to top", weight: "major" });
    } else if (input.priorityOverride === "force_today") {
      score = Math.max(score, 85);
      reasons.unshift({ label: "Forced into today", weight: "major" });
    } else if (input.priorityOverride === "do_not_prioritize") {
      score = Math.min(score, 15);
      reasons.unshift({ label: "Manually deprioritized", weight: "major" });
    } else if (input.priorityOverride === "pause_until" || input.priorityOverride === "ignore_until") {
      score = 0;
      reasons.unshift({
        label: `Paused until ${input.overrideUntil?.toLocaleDateString() ?? "further notice"}`,
        weight: "major",
      });
    }
  }

  return {
    score,
    bucket: bucketFor(score),
    reasons: reasons.slice(0, 6),
    breakdown: {
      deadlinePressure: Math.round(pressure),
      stakesImportance: Math.round(stakesImportance),
      impactScore: Math.round(impactScore),
      consequenceScore: Math.round(consequenceScore),
      base: Math.round(base),
      dependencyBoost,
      peopleWaitingBoost,
      neglectBoost,
      quickWinBoost,
      largeLowValuePenalty,
      reversibilityMultiplier,
      stateMultiplier,
      overrideApplied,
    },
  };
}

export function bucketFor(score: number): PriorityBucket {
  if (score >= 90) return "Critical";
  if (score >= 80) return "Very High";
  if (score >= 65) return "High";
  if (score >= 45) return "Medium";
  if (score >= 25) return "Low";
  return "Someday";
}

function emptyBreakdown(): PriorityResult["breakdown"] {
  return {
    deadlinePressure: 0,
    stakesImportance: 0,
    impactScore: 0,
    consequenceScore: 0,
    base: 0,
    dependencyBoost: 0,
    peopleWaitingBoost: 0,
    neglectBoost: 0,
    quickWinBoost: 0,
    largeLowValuePenalty: 0,
    reversibilityMultiplier: 1,
    stateMultiplier: 1,
    overrideApplied: null,
  };
}
