import { z } from "zod";

export const eventTypeValues = ["meeting", "class", "appointment", "deadline", "personal", "other"] as const;

export const createEventSchema = z
  .object({
    title: z.string().min(1).max(300),
    type: z.enum(eventTypeValues).default("meeting"),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    allDay: z.boolean().default(false),
    location: z.string().max(300).optional(),
    workItemId: z.uuid().nullable().optional(),
  })
  .refine((v) => v.endAt >= v.startAt, { message: "End must be after start", path: ["endAt"] });

export const startFocusSessionSchema = z.object({
  workItemId: z.uuid().nullable().optional(),
  plannedMinutes: z.coerce.number().int().min(1).max(480),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
