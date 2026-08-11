import "server-only";
import { eq } from "drizzle-orm";
import { db, safeQuery } from "@/lib/db/client";
import { skills } from "@/lib/db/schema";

export async function getSkillsForUser(userId: string) {
  return safeQuery(
    () =>
      db.query.skills.findMany({
        where: eq(skills.userId, userId),
        orderBy: (s, { desc }) => [desc(s.lastStudiedAt)],
      }),
    []
  );
}
