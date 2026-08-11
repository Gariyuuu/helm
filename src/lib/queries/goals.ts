import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db, safeQuery } from "@/lib/db/client";
import { goals } from "@/lib/db/schema";

export async function getGoalsForUser(userId: string) {
  return safeQuery(
    () =>
      db.query.goals.findMany({
        where: and(eq(goals.userId, userId), ne(goals.status, "abandoned")),
        orderBy: (g, { desc }) => [desc(g.createdAt)],
      }),
    []
  );
}

export async function getGoalById(userId: string, id: string) {
  return safeQuery(() => db.query.goals.findFirst({ where: and(eq(goals.id, id), eq(goals.userId, userId)) }), undefined);
}
