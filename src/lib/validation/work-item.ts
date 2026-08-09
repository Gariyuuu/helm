import { z } from "zod";

export const workItemStatusValues = [
  "inbox",
  "planned",
  "ready",
  "in_progress",
  "blocked",
  "waiting",
  "scheduled",
  "completed",
  "cancelled",
  "archived",
] as const;

export const reversibilityValues = ["reversible", "moderate", "hard", "irreversible"] as const;
export const energyValues = ["low", "medium", "high"] as const;
export const priorityOverrideValues = ["pin_top", "force_today", "do_not_prioritize", "pause_until", "ignore_until"] as const;

export const WORK_ITEM_TYPES = [
  "task",
  "assignment",
  "exam",
  "project_task",
  "meeting",
  "application",
  "research_deliverable",
  "internship_responsibility",
  "club_responsibility",
  "errand",
  "date",
  "trip",
  "reservation",
  "learning_objective",
  "coding_project",
  "fitness_goal",
  "financial_task",
  "document",
  "follow_up",
  "deadline",
  "event",
  "habit",
  "idea",
  "opportunity",
  "reading",
  "competition",
  "interview",
  "networking_conversation",
] as const;

const impactScore = z.number().int().min(0).max(5);

export const createWorkItemSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  type: z.enum(WORK_ITEM_TYPES).default("task"),
  status: z.enum(workItemStatusValues).default("inbox"),
  categoryId: z.uuid().nullable().optional(),
  domainId: z.uuid().nullable().optional(),
  projectId: z.uuid().nullable().optional(),
  parentWorkItemId: z.uuid().nullable().optional(),

  urgency: impactScore.default(2),
  importance: impactScore.default(2),
  stakes: impactScore.default(2),
  academicImpact: impactScore.default(0),
  careerImpact: impactScore.default(0),
  financialImpact: impactScore.default(0),
  financialAmount: z.number().nonnegative().nullable().optional(),
  relationshipImpact: impactScore.default(0),
  healthImpact: impactScore.default(0),
  opportunityValue: impactScore.default(0),
  consequenceOfFailure: impactScore.default(0),
  consequenceOfDelay: impactScore.default(0),
  reversibility: z.enum(reversibilityValues).default("moderate"),

  deadline: z.coerce.date().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  estimatedMinutes: z.number().int().positive().max(10080).nullable().optional(),
  energyRequired: z.enum(energyValues).default("medium"),
  difficulty: impactScore.default(2),

  probabilityOfCompletion: z.number().int().min(0).max(100).default(80),
  confidence: z.number().int().min(0).max(100).default(70),

  location: z.string().max(300).optional(),
  peopleWaitingCount: z.number().int().min(0).max(50).default(0),

  isRecurring: z.boolean().default(false),
  recurringRule: z.string().max(200).optional(),

  tags: z.array(z.string().max(40)).max(20).default([]),
});

export const updateWorkItemSchema = createWorkItemSchema.partial().extend({
  id: z.uuid(),
});

export const setOverrideSchema = z.object({
  id: z.uuid(),
  override: z.enum(priorityOverrideValues).nullable(),
  overrideUntil: z.coerce.date().nullable().optional(),
});

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>;
