import { z } from "zod";

export const goalTypeValues = ["vision", "weekly", "monthly", "semester", "yearly", "long_term"] as const;
export const goalStatusValues = ["active", "on_track", "at_risk", "completed", "abandoned"] as const;

export const createGoalSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  type: z.enum(goalTypeValues).default("monthly"),
  status: z.enum(goalStatusValues).default("active"),
  parentGoalId: z.uuid().nullable().optional(),
  domainId: z.uuid().nullable().optional(),
  targetDate: z.coerce.date().nullable().optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  id: z.uuid(),
  progress: z.number().int().min(0).max(100).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
