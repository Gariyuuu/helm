import { z } from "zod";

export const createSemesterSchema = z.object({
  name: z.string().min(1).max(200),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
});

export const createCourseSchema = z.object({
  semesterId: z.uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  code: z.string().max(50).optional(),
  professor: z.string().max(200).optional(),
  units: z.coerce.number().min(0).max(20).optional(),
  location: z.string().max(200).optional(),
  syllabusLink: z.string().max(500).optional(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({ id: z.uuid() });

export const createAssignmentSchema = z.object({
  courseId: z.uuid(),
  title: z.string().min(1).max(300),
  gradeCategory: z.string().max(100).optional(),
  weightPercent: z.coerce.number().min(0).max(100).optional(),
  pointsPossible: z.coerce.number().min(0).optional(),
  dueAt: z.coerce.date().nullable().optional(),
});

export const updateAssignmentSchema = z.object({
  id: z.uuid(),
  pointsEarned: z.coerce.number().min(0).nullable().optional(),
});

export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
