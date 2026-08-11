import { z } from "zod";

export const createTripSchema = z.object({
  destination: z.string().min(1).max(200),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  budget: z.coerce.number().min(0).optional(),
});

export const updateTripSchema = createTripSchema.partial().extend({ id: z.uuid() });

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
