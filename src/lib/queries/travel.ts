import "server-only";
import { eq } from "drizzle-orm";
import { db, safeQuery } from "@/lib/db/client";
import { travelProjects } from "@/lib/db/schema";

export async function getTripsForUser(userId: string) {
  return safeQuery(
    () =>
      db.query.travelProjects.findMany({
        where: eq(travelProjects.userId, userId),
        orderBy: (t, { asc }) => [asc(t.startDate)],
      }),
    []
  );
}
