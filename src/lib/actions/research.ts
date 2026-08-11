"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { researchProjects } from "@/lib/db/schema";
import { createResearchProjectSchema, updateResearchProjectSchema } from "@/lib/validation/research";
import { logActivity } from "./activity";

function touch() {
  revalidatePath("/research");
}

const idSchema = z.uuid();

async function getOwned(userId: string, id: string) {
  const row = await db.query.researchProjects.findFirst({
    where: and(eq(researchProjects.id, id), eq(researchProjects.userId, userId)),
  });
  if (!row) throw new Error("Not found");
  return row;
}

export async function createResearchProject(raw: unknown) {
  const user = await requireUser();
  const input = createResearchProjectSchema.parse(raw);

  const [created] = await db
    .insert(researchProjects)
    .values({ userId: user.id, ...input })
    .returning();

  await logActivity({ userId: user.id, entityType: "research_project", entityId: created.id, action: "created" });
  touch();
  return created;
}

export async function updateResearchProject(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateResearchProjectSchema.parse(raw);

  const [updated] = await db
    .update(researchProjects)
    .set({ ...rest, updatedAt: new Date() })
    .where(and(eq(researchProjects.id, id), eq(researchProjects.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

export async function addReadingListItem(rawId: unknown, title: string, url?: string) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Title required");

  const row = await getOwned(user.id, id);
  const readingList = [...(row.readingList ?? []), { title: trimmed, url: url || undefined, done: false }];

  const [updated] = await db
    .update(researchProjects)
    .set({ readingList, updatedAt: new Date() })
    .where(and(eq(researchProjects.id, id), eq(researchProjects.userId, user.id)))
    .returning();

  touch();
  return updated;
}

export async function toggleReadingListItem(rawId: unknown, index: number) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const row = await getOwned(user.id, id);
  const readingList = (row.readingList ?? []).map((item, i) => (i === index ? { ...item, done: !item.done } : item));

  const [updated] = await db
    .update(researchProjects)
    .set({ readingList, updatedAt: new Date() })
    .where(and(eq(researchProjects.id, id), eq(researchProjects.userId, user.id)))
    .returning();

  touch();
  return updated;
}
