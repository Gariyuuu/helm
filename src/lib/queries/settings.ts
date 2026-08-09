import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";

export async function getSettingsForUser(userId: string) {
  const row = await db.query.settings.findFirst({ where: eq(settings.userId, userId) });
  return (
    row ?? {
      capacityByDay: { mon: 4, tue: 4, wed: 4, thu: 4, fri: 4, sat: 2, sun: 2 },
      notificationLevel: "balanced" as const,
      theme: "system" as const,
      aiProvider: "none",
      estimationBiasFactor: 1,
    }
  );
}
