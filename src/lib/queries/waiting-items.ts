import "server-only";
import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { waitingItems } from "@/lib/db/schema";

export async function getWaitingItemsForUser(userId: string) {
  return db.query.waitingItems.findMany({
    where: and(eq(waitingItems.userId, userId), ne(waitingItems.status, "resolved")),
    orderBy: asc(waitingItems.followUpDate),
  });
}

export async function getResolvedWaitingItemsForUser(userId: string) {
  return db.query.waitingItems.findMany({
    where: and(eq(waitingItems.userId, userId), eq(waitingItems.status, "resolved")),
    orderBy: asc(waitingItems.resolvedAt),
  });
}
