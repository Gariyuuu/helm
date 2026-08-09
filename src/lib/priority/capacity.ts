export interface CapacityByDay {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export function weeklyCapacityHours(capacity: CapacityByDay): number {
  return Object.values(capacity).reduce((a, b) => a + b, 0);
}

/** Sum of estimated effort (in hours) for items with a deadline in the next 7 days. */
export function committedHoursThisWeek(items: { deadline: Date | null; estimatedMinutes: number | null }[]): number {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return items
    .filter((i) => i.deadline && i.deadline.getTime() >= now && i.deadline.getTime() <= now + weekMs)
    .reduce((sum, i) => sum + (i.estimatedMinutes ?? 30) / 60, 0);
}
