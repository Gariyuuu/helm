import { z } from "zod";

export const saveWeeklyReviewSchema = z.object({
  weekStart: z.coerce.date(),
  completedCount: z.coerce.number().int().min(0),
  missedCount: z.coerce.number().int().min(0),
  addedCount: z.coerce.number().int().min(0),
  droppedCount: z.coerce.number().int().min(0),
  biggestWin: z.string().max(1000).optional(),
  biggestBottleneck: z.string().max(1000).optional(),
  nextWeekFocus: z.string().max(1000).optional(),
  notes: z.string().max(4000).optional(),
});

export type SaveWeeklyReviewInput = z.infer<typeof saveWeeklyReviewSchema>;
