import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { assignments, courses, semesters } from "@/lib/db/schema";

export function computeCourseGrade(courseAssignments: (typeof assignments.$inferSelect)[]): number | null {
  const graded = courseAssignments.filter((a) => a.pointsEarned != null && a.pointsPossible);
  if (graded.length === 0) return null;

  const hasWeights = graded.some((a) => a.weightPercent != null);
  if (hasWeights) {
    let weightedSum = 0;
    let weightTotal = 0;
    for (const a of graded) {
      const pct = (a.pointsEarned! / a.pointsPossible!) * 100;
      const weight = a.weightPercent ?? 0;
      weightedSum += pct * weight;
      weightTotal += weight;
    }
    return weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 10) / 10 : null;
  }

  const earned = graded.reduce((sum, a) => sum + a.pointsEarned!, 0);
  const possible = graded.reduce((sum, a) => sum + a.pointsPossible!, 0);
  return possible > 0 ? Math.round((earned / possible) * 1000) / 10 : null;
}

export async function getSemestersForUser(userId: string) {
  return db.query.semesters.findMany({
    where: eq(semesters.userId, userId),
    orderBy: (s, { desc }) => [desc(s.isActive), desc(s.startDate)],
  });
}

export async function getSchoolDataForUser(userId: string) {
  const [semesterRows, courseRows, assignmentRows] = await Promise.all([
    db.query.semesters.findMany({ where: eq(semesters.userId, userId) }),
    db.query.courses.findMany({ where: eq(courses.userId, userId) }),
    db.query.assignments.findMany({ where: eq(assignments.userId, userId) }),
  ]);

  const coursesWithGrade = courseRows.map((course) => {
    const courseAssignments = assignmentRows
      .filter((a) => a.courseId === course.id)
      .sort((a, b) => (a.dueAt?.getTime() ?? 0) - (b.dueAt?.getTime() ?? 0));
    const computedGrade = computeCourseGrade(courseAssignments);
    return { course, assignments: courseAssignments, computedGrade };
  });

  return { semesters: semesterRows, courses: coursesWithGrade };
}

export async function getCourseById(userId: string, id: string) {
  return db.query.courses.findFirst({ where: and(eq(courses.id, id), eq(courses.userId, userId)) });
}
