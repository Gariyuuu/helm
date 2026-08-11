import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, safeQuery } from "@/lib/db/client";
import { lifeDomains } from "@/lib/db/schema";

export async function getDomainsForUser(userId: string) {
  return safeQuery(
    () => db.select().from(lifeDomains).where(eq(lifeDomains.userId, userId)).orderBy(asc(lifeDomains.sortOrder)),
    []
  );
}
