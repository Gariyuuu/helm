import "server-only";
import { and, asc, eq, gte } from "drizzle-orm";
import { db, safeQuery } from "@/lib/db/client";
import { events, focusSessions } from "@/lib/db/schema";

export async function getUpcomingEventsForUser(userId: string) {
  return safeQuery(async () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return db.query.events.findMany({
      where: and(eq(events.userId, userId), gte(events.startAt, now)),
      orderBy: asc(events.startAt),
    });
  }, []);
}

export async function getActiveFocusSession(userId: string) {
  return safeQuery(
    () =>
      db.query.focusSessions.findFirst({
        where: and(eq(focusSessions.userId, userId), eq(focusSessions.status, "active")),
      }),
    undefined
  );
}

export async function getRecentFocusSessions(userId: string) {
  return safeQuery(
    () =>
      db.query.focusSessions.findMany({
        where: and(eq(focusSessions.userId, userId), eq(focusSessions.status, "completed")),
        orderBy: (f, { desc }) => [desc(f.endedAt)],
        limit: 10,
      }),
    []
  );
}
