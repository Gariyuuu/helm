import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { weeklyReviews, workItems } from "@/lib/db/schema";

export function currentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  return monday;
}

export async function computeWeekStats(userId: string, weekStart: Date) {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const rows = await db.select().from(workItems).where(eq(workItems.userId, userId));

  const inWeek = (d: Date | null) => Boolean(d && d >= weekStart && d < weekEnd);

  return {
    completedCount: rows.filter((r) => r.status === "completed" && inWeek(r.completedAt)).length,
    missedCount: rows.filter((r) => r.status !== "completed" && r.status !== "cancelled" && inWeek(r.deadline) && r.deadline! < new Date()).length,
    addedCount: rows.filter((r) => inWeek(r.createdAt)).length,
    droppedCount: rows.filter((r) => r.status === "cancelled" && inWeek(r.updatedAt)).length,
  };
}

export async function getWeeklyReviewForWeek(userId: string, weekStart: Date) {
  return db.query.weeklyReviews.findFirst({
    where: and(eq(weeklyReviews.userId, userId), eq(weeklyReviews.weekStart, weekStart)),
  });
}

export async function getWeeklyReviewsForUser(userId: string) {
  return db.query.weeklyReviews.findMany({
    where: eq(weeklyReviews.userId, userId),
    orderBy: (w, { desc }) => [desc(w.weekStart)],
  });
}
