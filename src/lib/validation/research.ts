import { z } from "zod";

export const researchStatusValues = [
  "exploring",
  "active",
  "waiting",
  "writing",
  "submitted",
  "published",
  "paused",
  "ended",
] as const;

export const createResearchProjectSchema = z.object({
  topic: z.string().min(1).max(300),
  researchGroup: z.string().max(200).optional(),
  professor: z.string().max(200).optional(),
  myRole: z.string().max(200).optional(),
  paperTitle: z.string().max(300).optional(),
  potentialAuthorship: z.boolean().default(false),
  status: z.enum(researchStatusValues).default("exploring"),
  notes: z.string().max(4000).optional(),
});

export const updateResearchProjectSchema = createResearchProjectSchema.partial().extend({
  id: z.uuid(),
});

export type CreateResearchProjectInput = z.infer<typeof createResearchProjectSchema>;
export type UpdateResearchProjectInput = z.infer<typeof updateResearchProjectSchema>;
