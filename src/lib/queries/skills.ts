import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { skills } from "@/lib/db/schema";

export async function getSkillsForUser(userId: string) {
  return db.query.skills.findMany({
    where: eq(skills.userId, userId),
    orderBy: (s, { desc }) => [desc(s.lastStudiedAt)],
  });
}
