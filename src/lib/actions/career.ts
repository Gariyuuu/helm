"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { applications, companies, contacts } from "@/lib/db/schema";
import {
  createApplicationSchema,
  createCompanySchema,
  createContactSchema,
  updateApplicationSchema,
} from "@/lib/validation/career";
import { logActivity } from "./activity";

function touch() {
  revalidatePath("/career");
  revalidatePath("/applications");
}

export async function createCompany(raw: unknown) {
  const user = await requireUser();
  const input = createCompanySchema.parse(raw);

  const [created] = await db
    .insert(companies)
    .values({ userId: user.id, ...input })
    .returning();

  touch();
  return created;
}

export async function createContact(raw: unknown) {
  const user = await requireUser();
  const input = createContactSchema.parse(raw);

  const [created] = await db
    .insert(contacts)
    .values({ userId: user.id, ...input })
    .returning();

  touch();
  return created;
}

export async function createApplication(raw: unknown) {
  const user = await requireUser();
  const input = createApplicationSchema.parse(raw);

  const [created] = await db
    .insert(applications)
    .values({ userId: user.id, ...input })
    .returning();

  await logActivity({ userId: user.id, entityType: "application", entityId: created.id, action: "created" });
  touch();
  return created;
}

export async function updateApplication(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateApplicationSchema.parse(raw);

  const [updated] = await db
    .update(applications)
    .set({ ...rest, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

const idSchema = z.uuid();
const statusSchema = z.enum([
  "interested",
  "researching",
  "preparing",
  "ready",
  "applied",
  "oa",
  "interview",
  "final_round",
  "offer",
  "rejected",
  "withdrawn",
]);

export async function setApplicationStatus(rawId: unknown, rawStatus: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);
  const status = statusSchema.parse(rawStatus);

  const [updated] = await db
    .update(applications)
    .set({ status, appliedAt: status === "applied" ? new Date() : undefined, updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  await logActivity({ userId: user.id, entityType: "application", entityId: id, action: "status_changed", toValue: status });
  touch();
  return updated;
}
