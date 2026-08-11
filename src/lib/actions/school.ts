"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { assignments, courses, semesters } from "@/lib/db/schema";
import {
  createAssignmentSchema,
  createCourseSchema,
  createSemesterSchema,
  updateAssignmentSchema,
  updateCourseSchema,
} from "@/lib/validation/school";

function touch() {
  revalidatePath("/school");
}

export async function createSemester(raw: unknown) {
  const user = await requireUser();
  const input = createSemesterSchema.parse(raw);

  await db.update(semesters).set({ isActive: false }).where(eq(semesters.userId, user.id));
  const [created] = await db
    .insert(semesters)
    .values({ userId: user.id, ...input, isActive: true })
    .returning();

  touch();
  return created;
}

export async function createCourse(raw: unknown) {
  const user = await requireUser();
  const input = createCourseSchema.parse(raw);

  const [created] = await db
    .insert(courses)
    .values({ userId: user.id, ...input })
    .returning();

  touch();
  return created;
}

export async function updateCourse(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateCourseSchema.parse(raw);

  const [updated] = await db
    .update(courses)
    .set(rest)
    .where(and(eq(courses.id, id), eq(courses.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

export async function createAssignment(raw: unknown) {
  const user = await requireUser();
  const input = createAssignmentSchema.parse(raw);

  const [created] = await db
    .insert(assignments)
    .values({ userId: user.id, ...input })
    .returning();

  touch();
  return created;
}

export async function updateAssignment(raw: unknown) {
  const user = await requireUser();
  const { id, ...rest } = updateAssignmentSchema.parse(raw);

  const [updated] = await db
    .update(assignments)
    .set(rest)
    .where(and(eq(assignments.id, id), eq(assignments.userId, user.id)))
    .returning();

  if (!updated) throw new Error("Not found");
  touch();
  return updated;
}

const idSchema = z.uuid();

export async function deleteAssignment(rawId: unknown) {
  const user = await requireUser();
  const id = idSchema.parse(rawId);

  await db.delete(assignments).where(and(eq(assignments.id, id), eq(assignments.userId, user.id)));
  touch();
}
