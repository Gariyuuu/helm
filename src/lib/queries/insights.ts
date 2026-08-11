import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { workItems } from "@/lib/db/schema";
import { getActiveWorkItems } from "./work-items";
import { getDomainsForUser } from "./domains";
import { getProjectsForUser } from "./projects";

export async function getInsightsForUser(userId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [allRows, active, domains, projects] = await Promise.all([
    db.select().from(workItems).where(eq(workItems.userId, userId)),
    getActiveWorkItems(userId),
    getDomainsForUser(userId),
    getProjectsForUser(userId),
  ]);

  const completedLast7Days = allRows.filter((r) => r.status === "completed" && r.completedAt && r.completedAt >= sevenDaysAgo).length;
  const completedLast30Days = allRows.filter((r) => r.status === "completed" && r.completedAt && r.completedAt >= thirtyDaysAgo).length;
  const overdueCount = allRows.filter(
    (r) => r.deadline && r.deadline < now && r.status !== "completed" && r.status !== "cancelled" && r.status !== "archived",
  ).length;

  const domainById = new Map(domains.map((d) => [d.id, d.name]));
  const byDomain = new Map<string, number>();
  for (const s of active) {
    const name = s.item.domainId ? (domainById.get(s.item.domainId) ?? "Unknown") : "No domain";
    byDomain.set(name, (byDomain.get(name) ?? 0) + 1);
  }

  const byBucket = new Map<string, number>();
  for (const s of active) {
    byBucket.set(s.priority.bucket, (byBucket.get(s.priority.bucket) ?? 0) + 1);
  }

  const byHealth = new Map<string, number>();
  for (const p of projects) {
    byHealth.set(p.health.health, (byHealth.get(p.health.health) ?? 0) + 1);
  }

  return {
    completedLast7Days,
    completedLast30Days,
    overdueCount,
    activeCount: active.length,
    byDomain: [...byDomain.entries()].sort((a, b) => b[1] - a[1]),
    byBucket: [...byBucket.entries()],
    byHealth: [...byHealth.entries()],
  };
}
