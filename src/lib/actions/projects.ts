"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";
import { createProjectSchema, updateProjectSchema } from "@/lib/validation/project";
import { logActivity } from "./activity";

function touch() {
  revalidatePath("/projects");
  revalidatePath("/command-center");
  revalidatePath("/archive");
}

export async function createProject(raw: unknown) {
  const user = await requireUser();
  const input = createProjectSchema.parse(raw);

  const [created] = await db
    .insert(projects)
    .values({ userId: user.id, ...input })
    .returning();

  await logActivity({ userId: user.id, entityType: "project", entityId: created.id, action: "created" });
  touch();
  return created;
}

export async function updateProject(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateProjectSchema.parse(raw);

  const [updated] = await db
    .update(projects)
    .set({ ...rest, updatedAt: new Date(), lastActivityAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  await logActivity({ userId: user.id, entityType: "project", entityId: id, action: "updated" });
  touch();
  return updated;
}

const idSchema = z.uuid();

export async function archiveProject(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(projects)
    .set({ status: "archived", archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  await logActivity({ userId: user.id, entityType: "project", entityId: id, action: "archived" });
  touch();
  return updated;
}

export async function restoreProject(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(projects)
    .set({ status: "active", archivedAt: null, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  await logActivity({ userId: user.id, entityType: "project", entityId: id, action: "restored" });
  touch();
  return updated;
}

export async function setNextAction(rawId: unknown, nextActionText: string) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(projects)
    .set({ nextActionText, updatedAt: new Date(), lastActivityAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}
