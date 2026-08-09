import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "./client";
import {
  users,
  settings,
  lifeDomains,
  categories,
  projects,
  workItems,
  courses,
  semesters,
  assignments,
  skills,
  applications,
  companies,
  researchProjects,
  opportunities,
  waitingItems,
  contacts,
} from "./schema";
import { DEFAULT_LIFE_DOMAINS } from "./default-domains";

function daysFromNow(d: number) {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}

async function main() {
  if (!isDatabaseConfigured) {
    console.error("DATABASE_URL is not set — cannot seed.");
    process.exit(1);
  }

  const clerkId = process.env.SEED_CLERK_ID ?? "seed-user-demo";
  const email = process.env.SEED_EMAIL ?? "demo@helm.local";

  let user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) {
    [user] = await db.insert(users).values({ clerkId, email, name: "Gary" }).returning();
    console.log(`Created seed user ${user.id} (clerkId=${clerkId})`);
  } else {
    console.log(`Reusing existing user ${user.id} (clerkId=${clerkId})`);
  }

  await db.insert(settings).values({ userId: user.id }).onConflictDoNothing();

  const existingDomains = await db.select().from(lifeDomains).where(eq(lifeDomains.userId, user.id));
  let domainRows = existingDomains;
  if (existingDomains.length === 0) {
    domainRows = await db
      .insert(lifeDomains)
      .values(DEFAULT_LIFE_DOMAINS.map((d, i) => ({ userId: user.id, ...d, isDefault: true, sortOrder: i })))
      .returning();
  }
  const domain = (slug: string) => domainRows.find((d) => d.slug === slug)!.id;

  await db
    .insert(categories)
    .values({ userId: user.id, domainId: domain("personal"), name: "General", slug: "general", color: "var(--domain-personal)" });

  // ---- Academics: course + grading breakdown + assignments -------------
  const [semester] = await db
    .insert(semesters)
    .values({ userId: user.id, name: "Fall Semester", startDate: daysFromNow(-30), endDate: daysFromNow(80), isActive: true })
    .returning();

  const [statCourse] = await db
    .insert(courses)
    .values({
      userId: user.id,
      semesterId: semester.id,
      name: "STAT 134 — Probability",
      code: "STAT 134",
      professor: "Prof. Nolan",
      units: 4,
      gradingBreakdown: [
        { name: "Homework", weight: 20 },
        { name: "Midterm", weight: 30 },
        { name: "Final", weight: 40 },
        { name: "Participation", weight: 10 },
      ],
      currentGrade: 91,
      projectedGrade: 89,
    })
    .returning();

  const [statHwItem] = await db
    .insert(workItems)
    .values({
      userId: user.id,
      title: "STAT 134 Problem Set 6",
      description: "Chapters 5-6: conditional probability and joint distributions.",
      type: "assignment",
      status: "ready",
      domainId: domain("academics"),
      urgency: 4,
      importance: 4,
      stakes: 4,
      academicImpact: 4,
      consequenceOfFailure: 3,
      consequenceOfDelay: 2,
      reversibility: "moderate",
      deadline: daysFromNow(1),
      estimatedMinutes: 130,
      energyRequired: "high",
      difficulty: 3,
      tags: ["stat134", "homework"],
    })
    .returning();

  await db.insert(assignments).values({
    userId: user.id,
    courseId: statCourse.id,
    workItemId: statHwItem.id,
    title: "Problem Set 6",
    gradeCategory: "Homework",
    weightPercent: 20 / 8,
    dueAt: daysFromNow(1),
  });

  await db.insert(workItems).values({
    userId: user.id,
    title: "GRE practice test #3",
    type: "exam",
    status: "planned",
    domainId: domain("academics"),
    urgency: 2,
    importance: 3,
    stakes: 3,
    academicImpact: 3,
    reversibility: "reversible",
    deadline: daysFromNow(9),
    estimatedMinutes: 210,
    energyRequired: "high",
    difficulty: 3,
    tags: ["gre"],
  });

  // ---- Research ----------------------------------------------------------
  await db
    .insert(researchProjects)
    .values({
      userId: user.id,
      researchGroup: "Applied ML Lab",
      professor: "Prof. Chen",
      topic: "LLM-assisted time series forecasting",
      myRole: "Second author",
      status: "writing",
      potentialAuthorship: true,
      notes: "Waiting on co-author's section before submission.",
    })
    .returning();

  const [researchItem] = await db
    .insert(workItems)
    .values({
      userId: user.id,
      title: "Finish results section for research paper",
      description: "Blocks submission — advisor is waiting on this.",
      type: "research_deliverable",
      status: "in_progress",
      domainId: domain("research"),
      urgency: 3,
      importance: 5,
      stakes: 4,
      careerImpact: 4,
      consequenceOfFailure: 3,
      consequenceOfDelay: 4,
      reversibility: "moderate",
      deadline: daysFromNow(4),
      estimatedMinutes: 240,
      energyRequired: "high",
      difficulty: 4,
      peopleWaitingCount: 1,
      tags: ["research", "paper"],
    })
    .returning();

  await db.insert(waitingItems).values({
    userId: user.id,
    workItemId: researchItem.id,
    person: "Prof. Chen",
    whatFor: "Feedback on draft results section",
    requestedDate: daysFromNow(-3),
    expectedResponseDate: daysFromNow(1),
    followUpDate: daysFromNow(2),
  });

  // ---- Career / internship / applications --------------------------------
  const [company] = await db.insert(companies).values({ userId: user.id, name: "Jane Street", industry: "Quant trading" }).returning();
  const [recruiterContact] = await db
    .insert(contacts)
    .values({ userId: user.id, name: "Alex Recruiter", relationshipType: "recruiter", company: "Jane Street" })
    .returning();

  const [internshipOA] = await db
    .insert(workItems)
    .values({
      userId: user.id,
      title: "Complete Jane Street online assessment",
      type: "application",
      status: "ready",
      domainId: domain("career"),
      urgency: 5,
      importance: 5,
      stakes: 5,
      careerImpact: 5,
      opportunityValue: 5,
      consequenceOfFailure: 4,
      consequenceOfDelay: 4,
      reversibility: "irreversible",
      deadline: daysFromNow(2),
      estimatedMinutes: 150,
      energyRequired: "high",
      difficulty: 4,
      tags: ["internship", "quant"],
    })
    .returning();

  await db.insert(applications).values({
    userId: user.id,
    companyId: company.id,
    role: "Quant Trading Intern",
    type: "internship",
    status: "oa",
    deadline: daysFromNow(2),
    contactId: recruiterContact.id,
    workItemId: internshipOA.id,
    notes: "Referred by Alex.",
  });

  await db.insert(workItems).values({
    userId: user.id,
    title: "Send internship follow-up email",
    type: "follow_up",
    status: "ready",
    domainId: domain("career"),
    urgency: 3,
    importance: 3,
    stakes: 2,
    careerImpact: 4,
    reversibility: "reversible",
    estimatedMinutes: 8,
    energyRequired: "low",
    difficulty: 1,
    tags: ["career", "networking"],
  });

  await db.insert(opportunities).values({
    userId: user.id,
    title: "Citadel Hackathon — registration",
    type: "hackathon",
    value: 4,
    deadline: daysFromNow(6),
    effortRequired: 2,
    probability: 60,
    careerBenefit: 4,
    learningBenefit: 3,
    interestLevel: 4,
    opportunityScore: 72,
    status: "open",
  });

  // ---- Side projects -------------------------------------------------
  const [tradingBot] = await db
    .insert(projects)
    .values({
      userId: user.id,
      name: "+EV Sports Betting Scanner",
      domainId: domain("projects"),
      status: "active",
      objective: "Ship a v2 arbitrage detector across three sportsbooks.",
      nextActionText: "Wire up the odds-comparison cron job",
      lastActivityAt: daysFromNow(-2),
    })
    .returning();

  await db.insert(workItems).values([
    {
      userId: user.id,
      title: "Wire up odds-comparison cron job",
      type: "coding_project",
      status: "ready",
      domainId: domain("projects"),
      projectId: tradingBot.id,
      urgency: 1,
      importance: 3,
      stakes: 1,
      careerImpact: 2,
      opportunityValue: 1,
      reversibility: "reversible",
      estimatedMinutes: 90,
      energyRequired: "medium",
      difficulty: 3,
      tags: ["side-project"],
    },
    {
      userId: user.id,
      title: "Watch Time Series Kaggle course — module 4",
      type: "learning_objective",
      status: "planned",
      domainId: domain("learning"),
      urgency: 0,
      importance: 1,
      stakes: 0,
      careerImpact: 1,
      reversibility: "reversible",
      estimatedMinutes: 45,
      energyRequired: "low",
      difficulty: 1,
      tags: ["learning"],
    },
  ]);

  await db.insert(skills).values([
    { userId: user.id, name: "Python", currentLevel: 4, targetLevel: 5, hoursLogged: 120 },
    { userId: user.id, name: "SQL", currentLevel: 3, targetLevel: 4, hoursLogged: 40 },
    { userId: user.id, name: "Japanese", currentLevel: 2, targetLevel: 4, hoursLogged: 65 },
  ]);

  await db.insert(workItems).values({
    userId: user.id,
    title: "Japanese listening practice — 20 min",
    type: "learning_objective",
    status: "planned",
    domainId: domain("learning"),
    isRecurring: true,
    recurringRule: "daily",
    urgency: 1,
    importance: 2,
    stakes: 0,
    estimatedMinutes: 20,
    energyRequired: "low",
    difficulty: 1,
    tags: ["japanese"],
  });

  // ---- Health --------------------------------------------------------
  await db.insert(workItems).values({
    userId: user.id,
    title: "Gym — push day",
    type: "fitness_goal",
    status: "ready",
    domainId: domain("health"),
    isRecurring: true,
    recurringRule: "mon,wed,fri",
    urgency: 1,
    importance: 2,
    stakes: 1,
    healthImpact: 3,
    reversibility: "reversible",
    estimatedMinutes: 60,
    energyRequired: "medium",
    difficulty: 2,
    tags: ["health", "gym"],
  });

  // ---- Personal / relationships / travel ------------------------------
  await db.insert(workItems).values([
    {
      userId: user.id,
      title: "Date night — dinner reservation",
      type: "date",
      status: "scheduled",
      domainId: domain("relationships"),
      urgency: 2,
      importance: 3,
      stakes: 2,
      relationshipImpact: 4,
      reversibility: "moderate",
      deadline: daysFromNow(1.3),
      estimatedMinutes: 180,
      energyRequired: "low",
      difficulty: 1,
      tags: ["relationship"],
    },
    {
      userId: user.id,
      title: "Flight check-in — SFO to NYC",
      type: "trip",
      status: "ready",
      domainId: domain("travel"),
      urgency: 5,
      importance: 3,
      stakes: 3,
      financialImpact: 3,
      relationshipImpact: 2,
      consequenceOfFailure: 5,
      consequenceOfDelay: 5,
      reversibility: "irreversible",
      deadline: daysFromNow(0.2),
      estimatedMinutes: 10,
      energyRequired: "low",
      difficulty: 1,
      tags: ["travel"],
    },
    {
      userId: user.id,
      title: "Pay credit card bill",
      type: "financial_task",
      status: "ready",
      domainId: domain("finance"),
      urgency: 3,
      importance: 3,
      stakes: 2,
      financialImpact: 4,
      consequenceOfFailure: 3,
      reversibility: "reversible",
      deadline: daysFromNow(5),
      estimatedMinutes: 10,
      energyRequired: "low",
      difficulty: 1,
      tags: ["finance"],
    },
    {
      userId: user.id,
      title: "Read: 'Fooled by Randomness'",
      type: "reading",
      status: "planned",
      domainId: domain("personal"),
      urgency: 0,
      importance: 1,
      stakes: 0,
      reversibility: "reversible",
      estimatedMinutes: 30,
      energyRequired: "low",
      difficulty: 1,
      tags: ["reading", "someday"],
    },
  ]);

  console.log("Seed complete.");
  console.log(`If SEED_CLERK_ID wasn't set, this data is attached to a placeholder user (clerkId="${clerkId}").`);
  console.log("Sign in once, then re-run with SEED_CLERK_ID=<your real Clerk user id> to attach this demo data to your account.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
