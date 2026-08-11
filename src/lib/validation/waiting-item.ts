import { z } from "zod";

export const waitingStatusValues = ["waiting", "followed_up", "resolved"] as const;

export const createWaitingItemSchema = z.object({
  person: z.string().min(1).max(200),
  whatFor: z.string().min(1).max(500),
  requestedDate: z.coerce.date().optional(),
  expectedResponseDate: z.coerce.date().nullable().optional(),
  followUpDate: z.coerce.date().nullable().optional(),
});

export const updateWaitingItemSchema = createWaitingItemSchema.partial().extend({
  id: z.uuid(),
  status: z.enum(waitingStatusValues).optional(),
});

export type CreateWaitingItemInput = z.infer<typeof createWaitingItemSchema>;
export type UpdateWaitingItemInput = z.infer<typeof updateWaitingItemSchema>;
