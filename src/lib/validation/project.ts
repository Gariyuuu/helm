import { z } from "zod";

export const projectStatusValues = [
  "idea",
  "planning",
  "active",
  "blocked",
  "waiting",
  "paused",
  "completed",
  "cancelled",
  "archived",
] as const;

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  icon: z.string().max(50).optional(),
  color: z.string().max(30).optional(),
  categoryId: z.uuid().nullable().optional(),
  domainId: z.uuid().nullable().optional(),
  status: z.enum(projectStatusValues).default("active"),
  objective: z.string().max(2000).optional(),
  desiredOutcome: z.string().max(2000).optional(),
  deadline: z.coerce.date().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  nextActionText: z.string().max(300).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.uuid(),
  progress: z.number().int().min(0).max(100).optional(),
  isPinned: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
