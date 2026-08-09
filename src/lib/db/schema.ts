import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  real,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const workItemStatusEnum = pgEnum("work_item_status", [
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
]);

export const priorityOverrideEnum = pgEnum("priority_override", [
  "pin_top",
  "force_today",
  "do_not_prioritize",
  "pause_until",
  "ignore_until",
]);

export const energyLevelEnum = pgEnum("energy_level", ["low", "medium", "high"]);

export const reversibilityEnum = pgEnum("reversibility", [
  "reversible",
  "moderate",
  "hard",
  "irreversible",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "idea",
  "planning",
  "active",
  "blocked",
  "waiting",
  "paused",
  "completed",
  "cancelled",
  "archived",
]);

export const projectHealthEnum = pgEnum("project_health", [
  "healthy",
  "attention",
  "at_risk",
  "critical",
  "dormant",
]);

export const goalTypeEnum = pgEnum("goal_type", [
  "vision",
  "weekly",
  "monthly",
  "semester",
  "yearly",
  "long_term",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "on_track",
  "at_risk",
  "completed",
  "abandoned",
]);

export const applicationStatusEnum = pgEnum("application_status", [
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
]);

export const opportunityStatusEnum = pgEnum("opportunity_status", [
  "open",
  "pursuing",
  "closed",
  "passed",
]);

export const researchStatusEnum = pgEnum("research_status", [
  "exploring",
  "active",
  "waiting",
  "writing",
  "submitted",
  "published",
  "paused",
  "ended",
]);

export const waitingStatusEnum = pgEnum("waiting_status", [
  "waiting",
  "followed_up",
  "resolved",
]);

export const notificationLevelEnum = pgEnum("notification_level", [
  "critical_only",
  "balanced",
  "everything",
  "custom",
]);

export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

export const entityTypeEnum = pgEnum("entity_type", [
  "work_item",
  "project",
  "goal",
  "milestone",
  "application",
  "opportunity",
  "research_project",
]);

export const focusSessionStatusEnum = pgEnum("focus_session_status", [
  "active",
  "completed",
  "abandoned",
]);

// ---------------------------------------------------------------------------
// Core: users & settings
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  timezone: text("timezone").default("America/Los_Angeles").notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  capacityByDay: jsonb("capacity_by_day")
    .$type<{ mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number }>()
    .default({ mon: 4, tue: 4, wed: 4, thu: 4, fri: 4, sat: 2, sun: 2 })
    .notNull(),
  notificationLevel: notificationLevelEnum("notification_level").default("balanced").notNull(),
  theme: themeEnum("theme").default("system").notNull(),
  aiProvider: text("ai_provider").default("none").notNull(),
  estimationBiasFactor: real("estimation_bias_factor").default(1.0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Taxonomy: life domains & categories
// ---------------------------------------------------------------------------

export const lifeDomains = pgTable(
  "life_domains",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    color: text("color").notNull(),
    icon: text("icon"),
    isDefault: boolean("is_default").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.slug), index("life_domains_user_idx").on(t.userId)],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    domainId: uuid("domain_id").references(() => lifeDomains.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    color: text("color").notNull(),
    icon: text("icon"),
    isCustom: boolean("is_custom").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.slug), index("categories_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Contacts & companies
// ---------------------------------------------------------------------------

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    relationshipType: text("relationship_type"),
    company: text("company"),
    role: text("role"),
    email: text("email"),
    phone: text("phone"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("contacts_user_idx").on(t.userId)],
);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    website: text("website"),
    industry: text("industry"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("companies_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    icon: text("icon"),
    color: text("color"),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    domainId: uuid("domain_id").references(() => lifeDomains.id, { onDelete: "set null" }),
    status: projectStatusEnum("status").default("active").notNull(),
    objective: text("objective"),
    desiredOutcome: text("desired_outcome"),
    deadline: timestamp("deadline", { withTimezone: true }),
    startDate: timestamp("start_date", { withTimezone: true }),
    progress: integer("progress").default(0).notNull(),
    health: projectHealthEnum("health").default("healthy").notNull(),
    nextActionText: text("next_action_text"),
    nextActionWorkItemId: uuid("next_action_work_item_id"),
    isPinned: boolean("is_pinned").default(false).notNull(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    index("projects_user_idx").on(t.userId),
    index("projects_status_idx").on(t.status),
    index("projects_deadline_idx").on(t.deadline),
  ],
);

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    targetDate: timestamp("target_date", { withTimezone: true }),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("milestones_project_idx").on(t.projectId)],
);

// ---------------------------------------------------------------------------
// Work Items (the universal object)
// ---------------------------------------------------------------------------

export const workItems = pgTable(
  "work_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description"),
    type: text("type").default("task").notNull(),
    status: workItemStatusEnum("status").default("inbox").notNull(),

    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    domainId: uuid("domain_id").references(() => lifeDomains.id, { onDelete: "set null" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    parentWorkItemId: uuid("parent_work_item_id"),

    priorityOverride: priorityOverrideEnum("priority_override"),
    overrideUntil: timestamp("override_until", { withTimezone: true }),

    urgency: integer("urgency").default(2).notNull(),
    importance: integer("importance").default(2).notNull(),
    stakes: integer("stakes").default(2).notNull(),
    academicImpact: integer("academic_impact").default(0).notNull(),
    careerImpact: integer("career_impact").default(0).notNull(),
    financialImpact: integer("financial_impact").default(0).notNull(),
    financialAmount: numeric("financial_amount", { precision: 12, scale: 2 }),
    relationshipImpact: integer("relationship_impact").default(0).notNull(),
    healthImpact: integer("health_impact").default(0).notNull(),
    opportunityValue: integer("opportunity_value").default(0).notNull(),
    consequenceOfFailure: integer("consequence_of_failure").default(0).notNull(),
    consequenceOfDelay: integer("consequence_of_delay").default(0).notNull(),
    reversibility: reversibilityEnum("reversibility").default("moderate").notNull(),

    deadline: timestamp("deadline", { withTimezone: true }),
    startDate: timestamp("start_date", { withTimezone: true }),
    estimatedMinutes: integer("estimated_minutes"),
    actualMinutes: integer("actual_minutes").default(0).notNull(),
    energyRequired: energyLevelEnum("energy_required").default("medium").notNull(),
    difficulty: integer("difficulty").default(2).notNull(),

    probabilityOfCompletion: integer("probability_of_completion").default(80).notNull(),
    confidence: integer("confidence").default(70).notNull(),

    location: text("location"),
    peopleWaitingCount: integer("people_waiting_count").default(0).notNull(),

    isRecurring: boolean("is_recurring").default(false).notNull(),
    recurringRule: text("recurring_rule"),

    tags: text("tags").array().default([]).notNull(),

    priorityScore: integer("priority_score").default(0).notNull(),
    priorityBreakdown: jsonb("priority_breakdown").$type<Record<string, unknown>>(),
    priorityComputedAt: timestamp("priority_computed_at", { withTimezone: true }),

    timesPostponed: integer("times_postponed").default(0).notNull(),
    lastPostponedAt: timestamp("last_postponed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [
    index("work_items_user_idx").on(t.userId),
    index("work_items_status_idx").on(t.status),
    index("work_items_deadline_idx").on(t.deadline),
    index("work_items_project_idx").on(t.projectId),
    index("work_items_priority_score_idx").on(t.priorityScore),
    index("work_items_created_at_idx").on(t.createdAt),
    index("work_items_updated_at_idx").on(t.updatedAt),
    index("work_items_parent_idx").on(t.parentWorkItemId),
  ],
);

// ---------------------------------------------------------------------------
// Dependencies (generic: work items or projects blocking each other)
// ---------------------------------------------------------------------------

export const dependencies = pgTable(
  "dependencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedType: entityTypeEnum("blocked_type").notNull(),
    blockedId: uuid("blocked_id").notNull(),
    blockerType: entityTypeEnum("blocker_type").notNull(),
    blockerId: uuid("blocker_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("dependencies_blocked_idx").on(t.blockedType, t.blockedId),
    index("dependencies_blocker_idx").on(t.blockerType, t.blockerId),
  ],
);

// ---------------------------------------------------------------------------
// Goals (Vision -> Goal -> Milestone -> Project -> Task)
// ---------------------------------------------------------------------------

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    type: goalTypeEnum("type").default("monthly").notNull(),
    status: goalStatusEnum("status").default("active").notNull(),
    parentGoalId: uuid("parent_goal_id"),
    domainId: uuid("domain_id").references(() => lifeDomains.id, { onDelete: "set null" }),
    targetDate: timestamp("target_date", { withTimezone: true }),
    progress: integer("progress").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [index("goals_user_idx").on(t.userId), index("goals_parent_idx").on(t.parentGoalId)],
);

export const goalRelationships = pgTable(
  "goal_relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    relatedType: entityTypeEnum("related_type").notNull(),
    relatedId: uuid("related_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("goal_relationships_goal_idx").on(t.goalId)],
);

// ---------------------------------------------------------------------------
// Calendar: events, focus sessions, time logs
// ---------------------------------------------------------------------------

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    type: text("type").default("meeting").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    allDay: boolean("all_day").default(false).notNull(),
    location: text("location"),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "set null" }),
    isBusy: boolean("is_busy").default(true).notNull(),
    recurringRule: text("recurring_rule"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("events_user_idx").on(t.userId), index("events_start_idx").on(t.startAt)],
);

export const focusSessions = pgTable(
  "focus_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    plannedMinutes: integer("planned_minutes").notNull(),
    actualMinutes: integer("actual_minutes"),
    status: focusSessionStatusEnum("status").default("active").notNull(),
    notes: text("notes"),
  },
  (t) => [index("focus_sessions_user_idx").on(t.userId), index("focus_sessions_work_item_idx").on(t.workItemId)],
);

export const timeLogs = pgTable(
  "time_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workItemId: uuid("work_item_id")
      .notNull()
      .references(() => workItems.id, { onDelete: "cascade" }),
    minutes: integer("minutes").notNull(),
    loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),
    source: text("source").default("manual").notNull(),
    focusSessionId: uuid("focus_session_id").references(() => focusSessions.id, { onDelete: "set null" }),
  },
  (t) => [index("time_logs_work_item_idx").on(t.workItemId)],
);

// ---------------------------------------------------------------------------
// Career: applications, research
// ---------------------------------------------------------------------------

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
    role: text("role").notNull(),
    type: text("type").default("internship").notNull(),
    location: text("location"),
    salary: text("salary"),
    link: text("link"),
    deadline: timestamp("deadline", { withTimezone: true }),
    status: applicationStatusEnum("status").default("interested").notNull(),
    resumeVersion: text("resume_version"),
    coverLetter: text("cover_letter"),
    referralContactId: uuid("referral_contact_id").references(() => contacts.id, { onDelete: "set null" }),
    contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    followUpDate: timestamp("follow_up_date", { withTimezone: true }),
    notes: text("notes"),
    outcome: text("outcome"),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("applications_user_idx").on(t.userId), index("applications_deadline_idx").on(t.deadline)],
);

export const researchProjects = pgTable(
  "research_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    researchGroup: text("research_group"),
    professor: text("professor"),
    topic: text("topic").notNull(),
    myRole: text("my_role"),
    paperTitle: text("paper_title"),
    potentialAuthorship: boolean("potential_authorship").default(false).notNull(),
    status: researchStatusEnum("status").default("exploring").notNull(),
    readingList: jsonb("reading_list").$type<{ title: string; url?: string; done: boolean }[]>().default([]),
    datasets: jsonb("datasets").$type<{ name: string; url?: string }[]>().default([]),
    repos: jsonb("repos").$type<{ name: string; url: string }[]>().default([]),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("research_projects_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// School: semesters, courses, assignments
// ---------------------------------------------------------------------------

export const semesters = pgTable(
  "semesters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (t) => [index("semesters_user_idx").on(t.userId)],
);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    semesterId: uuid("semester_id").references(() => semesters.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    code: text("code"),
    professor: text("professor"),
    units: real("units"),
    schedule: jsonb("schedule").$type<{ day: string; start: string; end: string }[]>().default([]),
    location: text("location"),
    gradingBreakdown: jsonb("grading_breakdown")
      .$type<{ name: string; weight: number; currentGrade?: number }[]>()
      .default([]),
    syllabusLink: text("syllabus_link"),
    currentGrade: real("current_grade"),
    projectedGrade: real("projected_grade"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("courses_user_idx").on(t.userId)],
);

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    gradeCategory: text("grade_category"),
    weightPercent: real("weight_percent"),
    pointsPossible: real("points_possible"),
    pointsEarned: real("points_earned"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("assignments_course_idx").on(t.courseId)],
);

// ---------------------------------------------------------------------------
// Learning: skills
// ---------------------------------------------------------------------------

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    currentLevel: integer("current_level").default(1).notNull(),
    targetLevel: integer("target_level").default(5).notNull(),
    hoursLogged: real("hours_logged").default(0).notNull(),
    lastStudiedAt: timestamp("last_studied_at", { withTimezone: true }),
    nextLesson: text("next_lesson"),
    resources: jsonb("resources").$type<{ title: string; url?: string; done: boolean }[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("skills_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: text("type").default("internship").notNull(),
    value: integer("value").default(2).notNull(),
    deadline: timestamp("deadline", { withTimezone: true }),
    effortRequired: integer("effort_required").default(2).notNull(),
    probability: integer("probability").default(50).notNull(),
    careerBenefit: integer("career_benefit").default(2).notNull(),
    learningBenefit: integer("learning_benefit").default(2).notNull(),
    financialBenefit: integer("financial_benefit").default(0).notNull(),
    interestLevel: integer("interest_level").default(2).notNull(),
    opportunityScore: integer("opportunity_score").default(0).notNull(),
    status: opportunityStatusEnum("status").default("open").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("opportunities_user_idx").on(t.userId), index("opportunities_deadline_idx").on(t.deadline)],
);

// ---------------------------------------------------------------------------
// Waiting on
// ---------------------------------------------------------------------------

export const waitingItems = pgTable(
  "waiting_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "set null" }),
    person: text("person").notNull(),
    whatFor: text("what_for").notNull(),
    requestedDate: timestamp("requested_date", { withTimezone: true }).defaultNow().notNull(),
    expectedResponseDate: timestamp("expected_response_date", { withTimezone: true }),
    followUpDate: timestamp("follow_up_date", { withTimezone: true }),
    status: waitingStatusEnum("status").default("waiting").notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("waiting_items_user_idx").on(t.userId), index("waiting_items_followup_idx").on(t.followUpDate)],
);

// ---------------------------------------------------------------------------
// Notes, links, attachments
// ---------------------------------------------------------------------------

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    content: text("content").notNull(),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("notes_user_idx").on(t.userId)],
);

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title"),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("links_user_idx").on(t.userId)],
);

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    url: text("url").notNull(),
    fileType: text("file_type"),
    sizeBytes: integer("size_bytes"),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("attachments_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    workItemId: uuid("work_item_id").references(() => workItems.id, { onDelete: "cascade" }),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("notifications_user_idx").on(t.userId), index("notifications_read_idx").on(t.read)],
);

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    domainId: uuid("domain_id").references(() => lifeDomains.id, { onDelete: "set null" }),
    frequency: jsonb("frequency").$type<{ days: string[] }>().default({ days: [] }),
    streakCount: integer("streak_count").default(0).notNull(),
    lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("habits_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Travel
// ---------------------------------------------------------------------------

export const travelProjects = pgTable(
  "travel_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    destination: text("destination").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    flights: jsonb("flights").$type<{ label: string; details?: string }[]>().default([]),
    hotels: jsonb("hotels").$type<{ label: string; details?: string }[]>().default([]),
    budget: numeric("budget", { precision: 12, scale: 2 }),
    checklist: jsonb("checklist").$type<{ item: string; done: boolean }[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("travel_projects_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Activity log, priority snapshots
// ---------------------------------------------------------------------------

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    action: text("action").notNull(),
    fromValue: text("from_value"),
    toValue: text("to_value"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("activity_logs_entity_idx").on(t.entityType, t.entityId),
    index("activity_logs_user_idx").on(t.userId),
  ],
);

export const prioritySnapshots = pgTable(
  "priority_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workItemId: uuid("work_item_id")
      .notNull()
      .references(() => workItems.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    breakdown: jsonb("breakdown").$type<Record<string, unknown>>(),
    computedAt: timestamp("computed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("priority_snapshots_work_item_idx").on(t.workItemId)],
);

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const weeklyReviews = pgTable(
  "weekly_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekStart: timestamp("week_start", { withTimezone: true }).notNull(),
    completedCount: integer("completed_count").default(0).notNull(),
    missedCount: integer("missed_count").default(0).notNull(),
    addedCount: integer("added_count").default(0).notNull(),
    droppedCount: integer("dropped_count").default(0).notNull(),
    biggestWin: text("biggest_win"),
    biggestBottleneck: text("biggest_bottleneck"),
    nextWeekFocus: text("next_week_focus"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.weekStart), index("weekly_reviews_user_idx").on(t.userId)],
);

export const dailyReviews = pgTable(
  "daily_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    finished: text("finished"),
    changed: text("changed"),
    blocked: text("blocked"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.date), index("daily_reviews_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// AI summaries
// ---------------------------------------------------------------------------

export const aiSummaries = pgTable(
  "ai_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    summary: text("summary").notNull(),
    model: text("model"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("ai_summaries_entity_idx").on(t.entityType, t.entityId)],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many, one }) => ({
  workItems: many(workItems),
  projects: many(projects),
  goals: many(goals),
  settings: one(settings, { fields: [users.id], references: [settings.userId] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  category: one(categories, { fields: [projects.categoryId], references: [categories.id] }),
  domain: one(lifeDomains, { fields: [projects.domainId], references: [lifeDomains.id] }),
  workItems: many(workItems),
  milestones: many(milestones),
  notes: many(notes),
  links: many(links),
}));

export const workItemsRelations = relations(workItems, ({ one, many }) => ({
  user: one(users, { fields: [workItems.userId], references: [users.id] }),
  project: one(projects, { fields: [workItems.projectId], references: [projects.id] }),
  category: one(categories, { fields: [workItems.categoryId], references: [categories.id] }),
  domain: one(lifeDomains, { fields: [workItems.domainId], references: [lifeDomains.id] }),
  parent: one(workItems, {
    fields: [workItems.parentWorkItemId],
    references: [workItems.id],
    relationName: "subtasks",
  }),
  subtasks: many(workItems, { relationName: "subtasks" }),
  timeLogs: many(timeLogs),
  focusSessions: many(focusSessions),
  notes: many(notes),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  parent: one(goals, { fields: [goals.parentGoalId], references: [goals.id], relationName: "subgoals" }),
  subgoals: many(goals, { relationName: "subgoals" }),
  relationships: many(goalRelationships),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  semester: one(semesters, { fields: [courses.semesterId], references: [semesters.id] }),
  assignments: many(assignments),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  course: one(courses, { fields: [assignments.courseId], references: [courses.id] }),
  workItem: one(workItems, { fields: [assignments.workItemId], references: [workItems.id] }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  company: one(companies, { fields: [applications.companyId], references: [companies.id] }),
  workItem: one(workItems, { fields: [applications.workItemId], references: [workItems.id] }),
}));
