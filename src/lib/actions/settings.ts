"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";

const capacitySchema = z.object({
  mon: z.number().min(0).max(16),
  tue: z.number().min(0).max(16),
  wed: z.number().min(0).max(16),
  thu: z.number().min(0).max(16),
  fri: z.number().min(0).max(16),
  sat: z.number().min(0).max(16),
  sun: z.number().min(0).max(16),
});

const updateSettingsSchema = z.object({
  capacityByDay: capacitySchema,
  notificationLevel: z.enum(["critical_only", "balanced", "everything", "custom"]),
  theme: z.enum(["light", "dark", "system"]),
});

export async function updateSettings(raw: unknown) {
  const user = await requireUser();
  const input = updateSettingsSchema.parse(raw);

  await db
    .insert(settings)
    .values({ userId: user.id, ...input })
    .onConflictDoUpdate({ target: settings.userId, set: { ...input, updatedAt: new Date() } });

  revalidatePath("/settings");
}
