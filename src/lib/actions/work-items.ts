"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { workItems } from "@/lib/db/schema";
import {
  createWorkItemSchema,
  setOverrideSchema,
  updateWorkItemSchema,
  workItemStatusValues,
} from "@/lib/validation/work-item";
import { logActivity } from "./activity";
import { z } from "zod";

function touch() {
  revalidatePath("/command-center");
  revalidatePath("/today");
  revalidatePath("/inbox");
  revalidatePath("/work");
  revalidatePath("/projects");
  revalidatePath("/archive");
}

export async function createWorkItem(raw: unknown) {
  const user = await requireUser();
  const input = createWorkItemSchema.parse(raw);

  const [created] = await db
    .insert(workItems)
    .values({
      userId: user.id,
      ...input,
      financialAmount: input.financialAmount != null ? String(input.financialAmount) : null,
    })
    .returning();

  await logActivity({ userId: user.id, entityType: "work_item", entityId: created.id, action: "created" });
  touch();
  return created;
}

export async function quickAddWorkItem(title: string) {
  const user = await requireUser();
  const clean = title.trim();
  if (!clean) throw new Error("Title is required");

  const [created] = await db
    .insert(workItems)
    .values({ userId: user.id, title: clean, status: "inbox" })
    .returning();

  await logActivity({ userId: user.id, entityType: "work_item", entityId: created.id, action: "created", note: "via quick add" });
  touch();
  return created;
}

export async function updateWorkItem(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateWorkItemSchema.parse(raw);

  const existing = await db.query.workItems.findFirst({ where: and(eq(workItems.id, id), eq(workItems.userId, user.id)) });
  if (!existing) throw new Error("Not found");

  const { financialAmount, ...others } = rest;

  const [updated] = await db
    .update(workItems)
    .set({
      ...others,
      ...(financialAmount !== undefined ? { financialAmount: financialAmount != null ? String(financialAmount) : null } : {}),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    })
    .where(and(eq(workItems.id, id), eq(workItems.userId, user.id)))
    .returning();

  await logActivity({ userId: user.id, entityType: "work_item", entityId: id, action: "updated" });
  touch();
  return updated;
}

const idSchema = z.uuid();

export async function completeWorkItem(rawId: unknown, actualMinutes?: number) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(workItems)
    .set({
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      ...(actualMinutes ? { actualMinutes } : {}),
    })
    .where(and(eq(workItems.id, id), eq(workItems.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  await logActivity({ userId: user.id, entityType: "work_item", entityId: id, action: "completed" });
  touch();
  return updated;
}

export async function setWorkItemStatus(rawId: unknown, rawStatus: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  const status = z.enum(workItemStatusValues).parse(rawStatus);

  const existing = await db.query.workItems.findFirst({ where: and(eq(workItems.id, id), eq(workItems.userId, user.id)) });
  if (!existing) throw new Error("Not found");

  const [updated] = await db
    .update(workItems)
    .set({ status, updatedAt: new Date(), lastActivityAt: new Date() })
    .where(and(eq(workItems.id, id), eq(workItems.userId, user.id)))
    .returning();

  await logActivity({
    userId: user.id,
    entityType: "work_item",
    entityId: id,
    action: "status_changed",
    fromValue: existing.status,
    toValue: status,
  });
  touch();
  return updated;
}

export async function postponeWorkItem(rawId: unknown, newDeadline?: Date | null) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const existing = await db.query.workItems.findFirst({ where: and(eq(workItems.id, id), eq(workItems.userId, user.id)) });
  if (!existing) throw new Error("Not found");

  const [updated] = await db
    .update(workItems)
    .set({
      deadline: newDeadline ?? existing.deadline,
      timesPostponed: existing.timesPostponed + 1,
      lastPostponedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(workItems.id, id), eq(workItems.userId, user.id)))
    .returning();

  await logActivity({ userId: user.id, entityType: "work_item", entityId: id, action: "postponed" });
  touch();
  return updated;
}

export async function setPriorityOverride(raw: unknown) {
  const user = await requireUser();
  const input = setOverrideSchema.parse(raw);

  const [updated] = await db
    .update(workItems)
    .set({
      priorityOverride: input.override,
      overrideUntil: input.overrideUntil ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(workItems.id, input.id), eq(workItems.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  await logActivity({
    userId: user.id,
    entityType: "work_item",
    entityId: input.id,
    action: "priority_override_set",
    toValue: input.override ?? "cleared",
  });
  touch();
  return updated;
}

export async function archiveWorkItem(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(workItems)
    .set({ status: "archived", updatedAt: new Date() })
    .where(and(eq(workItems.id, id), eq(workItems.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  await logActivity({ userId: user.id, entityType: "work_item", entityId: id, action: "archived" });
  touch();
  return updated;
}
