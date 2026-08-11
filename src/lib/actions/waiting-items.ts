"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { waitingItems } from "@/lib/db/schema";
import { createWaitingItemSchema, updateWaitingItemSchema } from "@/lib/validation/waiting-item";

function touch() {
  revalidatePath("/waiting-on");
}

export async function createWaitingItem(raw: unknown) {
  const user = await requireUser();
  const input = createWaitingItemSchema.parse(raw);

  const [created] = await db
    .insert(waitingItems)
    .values({ userId: user.id, ...input })
    .returning();

  touch();
  return created;
}

export async function updateWaitingItem(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateWaitingItemSchema.parse(raw);

  const [updated] = await db
    .update(waitingItems)
    .set(rest)
    .where(and(eq(waitingItems.id, id), eq(waitingItems.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

const idSchema = z.uuid();

export async function followUpWaitingItem(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(waitingItems)
    .set({ status: "followed_up" })
    .where(and(eq(waitingItems.id, id), eq(waitingItems.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

export async function resolveWaitingItem(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(waitingItems)
    .set({ status: "resolved", resolvedAt: new Date() })
    .where(and(eq(waitingItems.id, id), eq(waitingItems.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}
