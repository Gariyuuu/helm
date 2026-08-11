"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { skills } from "@/lib/db/schema";
import { createSkillSchema, updateSkillSchema } from "@/lib/validation/skill";

function touch() {
  revalidatePath("/learning");
}

const idSchema = z.uuid();

async function getOwned(userId: string, id: string) {
  const row = await db.query.skills.findFirst({ where: and(eq(skills.id, id), eq(skills.userId, userId)) });
  if (!row) throw new Error("Not found");
  return row;
}

export async function createSkill(raw: unknown) {
  const user = await requireUser();
  const input = createSkillSchema.parse(raw);

  const [created] = await db
    .insert(skills)
    .values({ userId: user.id, ...input })
    .returning();

  touch();
  return created;
}

export async function updateSkill(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateSkillSchema.parse(raw);

  const [updated] = await db
    .update(skills)
    .set(rest)
    .where(and(eq(skills.id, id), eq(skills.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

export async function addSkillResource(rawId: unknown, title: string, url?: string) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Title required");

  const row = await getOwned(user.id, id);
  const resources = [...(row.resources ?? []), { title: trimmed, url: url || undefined, done: false }];

  const [updated] = await db
    .update(skills)
    .set({ resources })
    .where(and(eq(skills.id, id), eq(skills.userId, user.id)))
    .returning();

  touch();
  return updated;
}

export async function toggleSkillResource(rawId: unknown, index: number) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const row = await getOwned(user.id, id);
  const resources = (row.resources ?? []).map((item, i) => (i === index ? { ...item, done: !item.done } : item));

  const [updated] = await db
    .update(skills)
    .set({ resources })
    .where(and(eq(skills.id, id), eq(skills.userId, user.id)))
    .returning();

  touch();
  return updated;
}

export async function logStudySession(rawId: unknown, hours: number) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  if (hours <= 0) throw new Error("Hours must be positive");

  const row = await getOwned(user.id, id);

  const [updated] = await db
    .update(skills)
    .set({ hoursLogged: row.hoursLogged + hours, lastStudiedAt: new Date() })
    .where(and(eq(skills.id, id), eq(skills.userId, user.id)))
    .returning();

  touch();
  return updated;
}
