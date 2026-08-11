import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { researchProjects } from "@/lib/db/schema";

export async function getResearchProjectsForUser(userId: string) {
  return db.query.researchProjects.findMany({
    where: and(eq(researchProjects.userId, userId), ne(researchProjects.status, "ended")),
    orderBy: (r, { desc }) => [desc(r.updatedAt)],
  });
}
