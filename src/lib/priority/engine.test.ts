import { describe, expect, it } from "vitest";
import { computePriority, type PriorityInput } from "./engine";

const NOW = new Date("2026-09-15T09:00:00Z");

function hoursFromNow(h: number) {
  return new Date(NOW.getTime() + h * 60 * 60 * 1000);
}

function daysFromNow(d: number) {
  return hoursFromNow(d * 24);
}

function item(overrides: Partial<PriorityInput>): PriorityInput {
  return {
    status: "ready",
    deadline: null,
    estimatedMinutes: 60,
    urgency: 2,
    importance: 2,
    stakes: 2,
    academicImpact: 0,
    careerImpact: 0,
    financialImpact: 0,
    relationshipImpact: 0,
    healthImpact: 0,
    opportunityValue: 0,
    consequenceOfFailure: 1,
    consequenceOfDelay: 1,
    reversibility: "moderate",
    peopleWaitingCount: 0,
    timesPostponed: 0,
    priorityOverride: null,
    overrideUntil: null,
    dependentCount: 0,
    ...overrides,
  };
}

describe("computePriority — fixtures", () => {
  it("final exam: imminent, high stakes, irreversible -> Critical", () => {
    const r = computePriority(
      item({
        deadline: hoursFromNow(20),
        stakes: 5,
        importance: 5,
        academicImpact: 5,
        consequenceOfFailure: 5,
        consequenceOfDelay: 4,
        reversibility: "irreversible",
        estimatedMinutes: 120,
      }),
      NOW,
    );
    expect(r.bucket).toBe("Critical");
    expect(r.score).toBeGreaterThanOrEqual(90);
  });

  it("minor homework: due soon but low stakes -> should rank below the final exam", () => {
    const exam = computePriority(
      item({ deadline: hoursFromNow(20), stakes: 5, importance: 5, academicImpact: 5, consequenceOfFailure: 5, reversibility: "irreversible" }),
      NOW,
    );
    const homework = computePriority(
      item({ deadline: hoursFromNow(18), stakes: 1, importance: 1, academicImpact: 1, estimatedMinutes: 20 }),
      NOW,
    );
    expect(homework.score).toBeLessThan(exam.score);
  });

  it("internship application: closing opportunity, moderate deadline -> Very High or Critical", () => {
    const r = computePriority(
      item({
        deadline: daysFromNow(2),
        stakes: 5,
        importance: 5,
        careerImpact: 5,
        opportunityValue: 5,
        consequenceOfFailure: 4,
        consequenceOfDelay: 5,
        reversibility: "irreversible",
        estimatedMinutes: 90,
      }),
      NOW,
    );
    expect(r.score).toBeGreaterThanOrEqual(80);
  });

  it("gym session: healthy but low stakes, no deadline -> Low/Medium, never Critical", () => {
    const r = computePriority(item({ healthImpact: 3, importance: 2, stakes: 1, estimatedMinutes: 60 }), NOW);
    expect(r.score).toBeLessThan(65);
  });

  it("date night: relationship impact, fixed time -> meaningful priority without being an emergency", () => {
    const r = computePriority(
      item({ deadline: hoursFromNow(30), relationshipImpact: 4, importance: 3, stakes: 2, estimatedMinutes: 180 }),
      NOW,
    );
    expect(r.score).toBeGreaterThan(30);
    expect(r.score).toBeLessThan(85);
  });

  it("flight: fixed, irreversible, high consequence if missed -> High as departure nears", () => {
    const r = computePriority(
      item({
        deadline: hoursFromNow(3),
        consequenceOfFailure: 5,
        consequenceOfDelay: 5,
        reversibility: "irreversible",
        importance: 3,
        stakes: 3,
        financialImpact: 3,
        relationshipImpact: 3,
        estimatedMinutes: 15,
      }),
      NOW,
    );
    expect(r.score).toBeGreaterThanOrEqual(80);
  });

  it("research deadline blocking a collaborator -> dependency boost applies", () => {
    const withoutDep = computePriority(item({ deadline: daysFromNow(4), importance: 4, stakes: 3, careerImpact: 3 }), NOW);
    const withDep = computePriority(item({ deadline: daysFromNow(4), importance: 4, stakes: 3, careerImpact: 3, dependentCount: 2 }), NOW);
    expect(withDep.score).toBeGreaterThan(withoutDep.score);
    expect(withDep.reasons.some((r) => r.label.includes("depend on this"))).toBe(true);
  });

  it("coding side project task: no deadline, moderate value -> Low/Medium, not urgent", () => {
    const r = computePriority(item({ importance: 3, careerImpact: 2, estimatedMinutes: 90 }), NOW);
    expect(r.score).toBeLessThan(50);
  });

  it("networking follow-up email: tiny effort, real career value -> quick win boost", () => {
    const r = computePriority(item({ estimatedMinutes: 8, careerImpact: 4, importance: 3, stakes: 3 }), NOW);
    expect(r.reasons.some((x) => x.label.includes("Quick win"))).toBe(true);
  });

  it("bill payment: financial consequence, moderate deadline", () => {
    const r = computePriority(
      item({ deadline: daysFromNow(5), financialImpact: 4, consequenceOfFailure: 3, estimatedMinutes: 10 }),
      NOW,
    );
    expect(r.score).toBeGreaterThan(30);
  });

  it("optional online course: no deadline, low stakes -> Someday/Low", () => {
    const r = computePriority(item({ importance: 1, stakes: 0, estimatedMinutes: 45 }), NOW);
    expect(r.score).toBeLessThan(30);
  });

  it("job interview: imminent + irreversible + high career impact -> Critical", () => {
    const r = computePriority(
      item({
        deadline: hoursFromNow(15),
        careerImpact: 5,
        stakes: 5,
        importance: 5,
        consequenceOfFailure: 5,
        reversibility: "irreversible",
        estimatedMinutes: 60,
      }),
      NOW,
    );
    expect(r.bucket).toBe("Critical");
  });

  it("effort-to-value: a 15-minute high-value task outranks a 4-hour low-value task", () => {
    const quick = computePriority(item({ estimatedMinutes: 15, careerImpact: 4, stakes: 4, importance: 4 }), NOW);
    const slow = computePriority(item({ estimatedMinutes: 240, careerImpact: 1, stakes: 1, importance: 1 }), NOW);
    expect(quick.score).toBeGreaterThan(slow.score);
  });

  it("neglect: repeatedly postponed important task gets a boost, but trivial tasks don't get resurrected", () => {
    const importantBase = item({ importance: 3, stakes: 3, careerImpact: 3, deadline: daysFromNow(10) });
    const importantNeglected = computePriority({ ...importantBase, timesPostponed: 4 }, NOW);
    const importantFresh = computePriority(importantBase, NOW);
    expect(importantNeglected.score).toBeGreaterThan(importantFresh.score);

    const trivialFresh = computePriority(item({ importance: 0, stakes: 0 }), NOW);
    const trivialNeglected = computePriority(item({ importance: 0, stakes: 0, timesPostponed: 10 }), NOW);
    expect(trivialNeglected.score).toBeLessThan(25);
    expect(trivialNeglected.score).toBe(trivialFresh.score);
  });

  it("blocked items are deprioritized relative to their unblocked equivalent", () => {
    const ready = computePriority(item({ status: "ready", deadline: daysFromNow(2), importance: 4, stakes: 4 }), NOW);
    const blocked = computePriority(item({ status: "blocked", deadline: daysFromNow(2), importance: 4, stakes: 4 }), NOW);
    expect(blocked.score).toBeLessThan(ready.score);
  });

  it("completed items always score 0", () => {
    const r = computePriority(item({ status: "completed", stakes: 5, deadline: hoursFromNow(1) }), NOW);
    expect(r.score).toBe(0);
  });

  it("manual pin_top always wins", () => {
    const r = computePriority(item({ importance: 0, stakes: 0, priorityOverride: "pin_top" }), NOW);
    expect(r.score).toBe(100);
  });

  it("manual do_not_prioritize caps score even for an otherwise-critical item", () => {
    const r = computePriority(
      item({ deadline: hoursFromNow(1), stakes: 5, importance: 5, priorityOverride: "do_not_prioritize" }),
      NOW,
    );
    expect(r.score).toBeLessThanOrEqual(15);
  });

  it("manual pause_until in the future zeroes the score until then", () => {
    const r = computePriority(
      item({ stakes: 5, importance: 5, priorityOverride: "pause_until", overrideUntil: daysFromNow(3) }),
      NOW,
    );
    expect(r.score).toBe(0);
  });

  it("expired pause_until no longer suppresses the score", () => {
    const r = computePriority(
      item({ deadline: hoursFromNow(2), stakes: 5, importance: 5, priorityOverride: "pause_until", overrideUntil: daysFromNow(-1) }),
      NOW,
    );
    expect(r.score).toBeGreaterThan(0);
  });

  it("classic reasoning test: closer-but-trivial deadline should not beat a further-but-high-stakes one", () => {
    const taskA = computePriority(item({ deadline: hoursFromNow(24), stakes: 1, importance: 1, academicImpact: 0, estimatedMinutes: 10 }), NOW);
    const taskB = computePriority(
      item({ deadline: daysFromNow(5), stakes: 5, importance: 4, academicImpact: 5, consequenceOfFailure: 4, estimatedMinutes: 150 }),
      NOW,
    );
    expect(taskB.score).toBeGreaterThan(taskA.score);
  });

  it("bucket boundaries are monotonic with score", () => {
    const scores = [5, 30, 50, 70, 85, 95];
    const buckets = scores.map((s) => computePriority(item({ importance: s / 20, stakes: s / 20 }), NOW).bucket);
    expect(new Set(buckets).size).toBeGreaterThan(1);
  });
});
