"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { goals } from "@/lib/db/schema";
import { createGoalSchema, updateGoalSchema } from "@/lib/validation/goal";
import { logActivity } from "./activity";

function touch() {
  revalidatePath("/goals");
}

export async function createGoal(raw: unknown) {
  const user = await requireUser();
  const input = createGoalSchema.parse(raw);

  const [created] = await db
    .insert(goals)
    .values({ userId: user.id, ...input })
    .returning();

  await logActivity({ userId: user.id, entityType: "goal", entityId: created.id, action: "created" });
  touch();
  return created;
}

export async function updateGoal(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateGoalSchema.parse(raw);

  const [updated] = await db
    .update(goals)
    .set({ ...rest, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

const idSchema = z.uuid();

export async function completeGoal(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(goals)
    .set({ status: "completed", progress: 100, completedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  await logActivity({ userId: user.id, entityType: "goal", entityId: id, action: "completed" });
  touch();
  return updated;
}

export async function abandonGoal(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(goals)
    .set({ status: "abandoned", updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}
