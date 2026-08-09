export type ProjectHealth = "healthy" | "attention" | "at_risk" | "critical" | "dormant";

export interface ProjectHealthInput {
  status: string;
  deadline: Date | null;
  progress: number; // 0-100
  lastActivityAt: Date;
  hasNextAction: boolean;
  openBlockedTaskCount: number;
  remainingEstimatedMinutes: number;
}

export interface ProjectHealthResult {
  health: ProjectHealth;
  score: number;
  reasons: string[];
}

const DAY = 1000 * 60 * 60 * 24;

export function computeProjectHealth(input: ProjectHealthInput, now: Date = new Date()): ProjectHealthResult {
  if (["completed", "cancelled", "archived"].includes(input.status)) {
    return { health: "healthy", score: 0, reasons: [] };
  }

  const daysSinceActivity = (now.getTime() - input.lastActivityAt.getTime()) / DAY;
  const reasons: string[] = [];

  if (daysSinceActivity >= 21 && input.progress < 100) {
    reasons.push(`No progress in ${Math.floor(daysSinceActivity)} days`);
    return { health: "dormant", score: 90, reasons };
  }

  let score = 0;

  if (input.deadline) {
    const daysLeft = (input.deadline.getTime() - now.getTime()) / DAY;
    if (daysLeft < 0) {
      score += 40;
      reasons.push("Deadline has passed");
    } else if (daysLeft <= 7 && input.progress < 70) {
      score += 25;
      reasons.push("Deadline within a week and under 70% complete");
    }
  }

  if (!input.hasNextAction) {
    score += 20;
    reasons.push("No next action defined");
  }

  if (input.status === "blocked" || input.openBlockedTaskCount > 0) {
    score += 20 + Math.min(10, input.openBlockedTaskCount * 3);
    reasons.push(input.status === "blocked" ? "Project is blocked" : `${input.openBlockedTaskCount} blocked task(s)`);
  }

  if (daysSinceActivity >= 10) {
    score += 15;
    reasons.push(`Last activity ${Math.floor(daysSinceActivity)} days ago`);
  }

  const remainingHours = input.remainingEstimatedMinutes / 60;
  if (input.deadline) {
    const daysLeft = Math.max(0.5, (input.deadline.getTime() - now.getTime()) / DAY);
    const requiredHoursPerDay = remainingHours / daysLeft;
    if (requiredHoursPerDay > 3) {
      score += 15;
      reasons.push(`Needs ~${requiredHoursPerDay.toFixed(1)}h/day to finish on time`);
    }
  }

  score = Math.min(100, score);

  let health: ProjectHealth = "healthy";
  if (score >= 70) health = "critical";
  else if (score >= 45) health = "at_risk";
  else if (score >= 20) health = "attention";

  return { health, score, reasons };
}
