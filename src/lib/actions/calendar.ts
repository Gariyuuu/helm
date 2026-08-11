"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { events, focusSessions, timeLogs, workItems } from "@/lib/db/schema";
import { createEventSchema, startFocusSessionSchema } from "@/lib/validation/calendar";

function touch() {
  revalidatePath("/calendar");
}

export async function createEvent(raw: unknown) {
  const user = await requireUser();
  const input = createEventSchema.parse(raw);

  const [created] = await db
    .insert(events)
    .values({ userId: user.id, ...input })
    .returning();

  touch();
  return created;
}

const idSchema = z.uuid();

export async function deleteEvent(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  await db.delete(events).where(and(eq(events.id, id), eq(events.userId, user.id)));
  touch();
}

export async function startFocusSession(raw: unknown) {
  const user = await requireUser();
  const input = startFocusSessionSchema.parse(raw);

  const existingActive = await db.query.focusSessions.findFirst({
    where: and(eq(focusSessions.userId, user.id), eq(focusSessions.status, "active")),
  });
  if (existingActive) throw new Error("A focus session is already running");

  const [created] = await db
    .insert(focusSessions)
    .values({ userId: user.id, workItemId: input.workItemId ?? null, plannedMinutes: input.plannedMinutes })
    .returning();

  touch();
  return created;
}

export async function stopFocusSession(rawId: unknown, notes?: string) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const session = await db.query.focusSessions.findFirst({ where: and(eq(focusSessions.id, id), eq(focusSessions.userId, user.id)) });
  if (!session) throw new Error("Not found");

  const endedAt = new Date();
  const actualMinutes = Math.max(1, Math.round((endedAt.getTime() - session.startedAt.getTime()) / 60000));

  const [updated] = await db
    .update(focusSessions)
    .set({ endedAt, actualMinutes, status: "completed", notes: notes || undefined })
    .where(and(eq(focusSessions.id, id), eq(focusSessions.userId, user.id)))
    .returning();

  if (session.workItemId) {
    await db.insert(timeLogs).values({
      userId: user.id,
      workItemId: session.workItemId,
      minutes: actualMinutes,
      source: "focus_session",
      focusSessionId: id,
    });
    await db
      .update(workItems)
      .set({ actualMinutes: sql`${workItems.actualMinutes} + ${actualMinutes}`, lastActivityAt: new Date() })
      .where(and(eq(workItems.id, session.workItemId), eq(workItems.userId, user.id)));
  }

  touch();
  return updated;
}

export async function abandonFocusSession(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  const [updated] = await db
    .update(focusSessions)
    .set({ endedAt: new Date(), status: "abandoned" })
    .where(and(eq(focusSessions.id, id), eq(focusSessions.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}
