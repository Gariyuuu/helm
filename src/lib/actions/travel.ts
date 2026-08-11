"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { travelProjects } from "@/lib/db/schema";
import { createTripSchema, updateTripSchema } from "@/lib/validation/travel";

function touch() {
  revalidatePath("/travel");
}

const idSchema = z.uuid();

async function getOwned(userId: string, id: string) {
  const row = await db.query.travelProjects.findFirst({ where: and(eq(travelProjects.id, id), eq(travelProjects.userId, userId)) });
  if (!row) throw new Error("Not found");
  return row;
}

export async function createTrip(raw: unknown) {
  const user = await requireUser();
  const input = createTripSchema.parse(raw);

  const [created] = await db
    .insert(travelProjects)
    .values({ userId: user.id, ...input, budget: input.budget != null ? String(input.budget) : undefined })
    .returning();

  touch();
  return created;
}

export async function updateTrip(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateTripSchema.parse(raw);

  const [updated] = await db
    .update(travelProjects)
    .set({ ...rest, budget: rest.budget != null ? String(rest.budget) : undefined })
    .where(and(eq(travelProjects.id, id), eq(travelProjects.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

export async function addFlight(rawId: unknown, label: string, details?: string) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  const trimmed = label.trim();
  if (!trimmed) throw new Error("Label required");

  const row = await getOwned(user.id, id);
  const flights = [...(row.flights ?? []), { label: trimmed, details: details || undefined }];

  const [updated] = await db
    .update(travelProjects)
    .set({ flights })
    .where(and(eq(travelProjects.id, id), eq(travelProjects.userId, user.id)))
    .returning();

  touch();
  return updated;
}

export async function addHotel(rawId: unknown, label: string, details?: string) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  const trimmed = label.trim();
  if (!trimmed) throw new Error("Label required");

  const row = await getOwned(user.id, id);
  const hotels = [...(row.hotels ?? []), { label: trimmed, details: details || undefined }];

  const [updated] = await db
    .update(travelProjects)
    .set({ hotels })
    .where(and(eq(travelProjects.id, id), eq(travelProjects.userId, user.id)))
    .returning();

  touch();
  return updated;
}

export async function addChecklistItem(rawId: unknown, item: string) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  const trimmed = item.trim();
  if (!trimmed) throw new Error("Item required");

  const row = await getOwned(user.id, id);
  const checklist = [...(row.checklist ?? []), { item: trimmed, done: false }];

  const [updated] = await db
    .update(travelProjects)
    .set({ checklist })
    .where(and(eq(travelProjects.id, id), eq(travelProjects.userId, user.id)))
    .returning();

  touch();
  return updated;
}

export async function toggleChecklistItem(rawId: unknown, index: number) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const row = await getOwned(user.id, id);
  const checklist = (row.checklist ?? []).map((c, i) => (i === index ? { ...c, done: !c.done } : c));

  const [updated] = await db
    .update(travelProjects)
    .set({ checklist })
    .where(and(eq(travelProjects.id, id), eq(travelProjects.userId, user.id)))
    .returning();

  touch();
  return updated;
}
