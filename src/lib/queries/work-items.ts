import "server-only";
import { and, eq, inArray, ne, notInArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dependencies, workItems } from "@/lib/db/schema";
import { scoreWorkItems, type ScoredWorkItem } from "@/lib/priority/from-db";

const CLOSED_STATUSES = ["completed", "cancelled", "archived"] as const;

async function dependentCountsFor(userId: string, workItemIds: string[]): Promise<Map<string, number>> {
  if (workItemIds.length === 0) return new Map();
  const rows = await db
    .select({ blockerId: dependencies.blockerId })
    .from(dependencies)
    .where(and(eq(dependencies.userId, userId), eq(dependencies.blockerType, "work_item"), inArray(dependencies.blockerId, workItemIds)));

  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.blockerId, (counts.get(row.blockerId) ?? 0) + 1);
  }
  return counts;
}

export async function getActiveWorkItems(userId: string): Promise<ScoredWorkItem[]> {
  const rows = await db
    .select()
    .from(workItems)
    .where(and(eq(workItems.userId, userId), notInArray(workItems.status, [...CLOSED_STATUSES])));

  const counts = await dependentCountsFor(userId, rows.map((r) => r.id));
  return scoreWorkItems(rows, counts);
}

export async function getAllWorkItems(userId: string): Promise<ScoredWorkItem[]> {
  const rows = await db.select().from(workItems).where(eq(workItems.userId, userId));
  const counts = await dependentCountsFor(userId, rows.map((r) => r.id));
  return scoreWorkItems(rows, counts);
}

export async function getWorkItemsByProject(userId: string, projectId: string): Promise<ScoredWorkItem[]> {
  const rows = await db
    .select()
    .from(workItems)
    .where(and(eq(workItems.userId, userId), eq(workItems.projectId, projectId), ne(workItems.status, "archived")));
  const counts = await dependentCountsFor(userId, rows.map((r) => r.id));
  return scoreWorkItems(rows, counts);
}

export async function getWorkItemById(userId: string, id: string) {
  return db.query.workItems.findFirst({ where: and(eq(workItems.userId, userId), eq(workItems.id, id)) });
}

export async function getInboxItems(userId: string): Promise<ScoredWorkItem[]> {
  const rows = await db
    .select()
    .from(workItems)
    .where(and(eq(workItems.userId, userId), eq(workItems.status, "inbox")));
  const counts = await dependentCountsFor(userId, rows.map((r) => r.id));
  return scoreWorkItems(rows, counts);
}
