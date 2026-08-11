import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(1).max(200),
  currentLevel: z.coerce.number().int().min(1).max(5).default(1),
  targetLevel: z.coerce.number().int().min(1).max(5).default(5),
  nextLesson: z.string().max(300).optional(),
});

export const updateSkillSchema = createSkillSchema.partial().extend({
  id: z.uuid(),
  hoursLogged: z.coerce.number().min(0).optional(),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
