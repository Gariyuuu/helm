import { z } from "zod";

export const applicationStatusValues = [
  "interested",
  "researching",
  "preparing",
  "ready",
  "applied",
  "oa",
  "interview",
  "final_round",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  website: z.string().max(500).optional(),
  industry: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const createContactSchema = z.object({
  name: z.string().min(1).max(200),
  relationshipType: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  email: z.string().max(300).optional(),
  phone: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export const createApplicationSchema = z.object({
  companyId: z.uuid().nullable().optional(),
  role: z.string().min(1).max(300),
  type: z.string().max(50).default("internship"),
  location: z.string().max(200).optional(),
  salary: z.string().max(100).optional(),
  link: z.string().max(500).optional(),
  deadline: z.coerce.date().nullable().optional(),
  status: z.enum(applicationStatusValues).default("interested"),
  notes: z.string().max(2000).optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial().extend({ id: z.uuid() });

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
