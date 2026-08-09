import type { ScoredWorkItem } from "@/lib/priority/from-db";
import type { ProjectWithHealth } from "@/lib/queries/projects";
import { weeklyCapacityHours, committedHoursThisWeek, type CapacityByDay } from "@/lib/priority/capacity";

const DEADLINE_BUCKETS = [
  { label: "24h", ms: 24 * 60 * 60 * 1000 },
  { label: "3d", ms: 3 * 24 * 60 * 60 * 1000 },
  { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
] as const;

/** Pulled out of the page component so `Date.now()` isn't called during render (react-hooks/purity). */
export function buildCommandCenterView(scored: ScoredWorkItem[], projects: ProjectWithHealth[], capacityByDay: CapacityByDay) {
  const actionable = scored.filter((s) => s.priority.score > 0);
  const nextMove = actionable.find((s) => s.item.status !== "blocked" && s.item.status !== "waiting") ?? actionable[0] ?? null;
  const top5 = actionable.filter((s) => s.item.id !== nextMove?.item.id).slice(0, 5);

  const now = Date.now();
  const overdue = actionable.filter((s) => s.item.deadline && s.item.deadline.getTime() < now);
  const blocked = scored.filter((s) => s.item.status === "blocked");
  const atRiskProjects = projects.filter((p) => ["at_risk", "critical", "dormant"].includes(p.health.health));

  const deadlineBuckets = DEADLINE_BUCKETS.map((b) => ({
    ...b,
    count: actionable.filter((s) => s.item.deadline && s.item.deadline.getTime() >= now && s.item.deadline.getTime() <= now + b.ms).length,
  }));

  const capacityHours = weeklyCapacityHours(capacityByDay);
  const committedHours = committedHoursThisWeek(actionable.map((s) => s.item));
  const overbooked = committedHours > capacityHours;

  const quickWins = actionable.filter((s) => (s.item.estimatedMinutes ?? 999) <= 20 && s.priority.score >= 40).slice(0, 5);

  return { actionable, nextMove, top5, overdue, blocked, atRiskProjects, deadlineBuckets, capacityHours, committedHours, overbooked, quickWins };
}

export function buildTodayView(scored: ScoredWorkItem[]) {
  const actionable = scored.filter((s) => s.priority.score > 0);
  const now = Date.now();
  const dueToday = (s: ScoredWorkItem) => Boolean(s.item.deadline) && s.item.deadline!.getTime() - now < 24 * 60 * 60 * 1000;

  const mustDo = actionable.filter((s) => dueToday(s) || s.priority.score >= 80);
  const mustDoIds = new Set(mustDo.map((s) => s.item.id));
  const shouldDo = actionable.filter((s) => !mustDoIds.has(s.item.id) && s.priority.score >= 45);
  const shouldDoIds = new Set(shouldDo.map((s) => s.item.id));
  const couldDo = actionable.filter((s) => !mustDoIds.has(s.item.id) && !shouldDoIds.has(s.item.id) && s.priority.score >= 25);

  return { mustDo, shouldDo, couldDo };
}
