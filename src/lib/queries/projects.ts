import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects, workItems } from "@/lib/db/schema";
import { computeProjectHealth, type ProjectHealthResult } from "@/lib/priority/project-health";

export interface ProjectWithHealth {
  project: typeof projects.$inferSelect;
  health: ProjectHealthResult;
  progress: number;
  taskCounts: { total: number; completed: number; blocked: number };
}

export async function getProjectsForUser(userId: string): Promise<ProjectWithHealth[]> {
  const rows = await db.select().from(projects).where(and(eq(projects.userId, userId), ne(projects.status, "archived")));
  const items = await db.select().from(workItems).where(eq(workItems.userId, userId));

  return rows
    .map((project) => {
      const projectItems = items.filter((i) => i.projectId === project.id);
      const total = projectItems.filter((i) => i.status !== "archived" && i.status !== "cancelled").length;
      const completed = projectItems.filter((i) => i.status === "completed").length;
      const blocked = projectItems.filter((i) => i.status === "blocked").length;
      const remainingMinutes = projectItems
        .filter((i) => i.status !== "completed" && i.status !== "cancelled" && i.status !== "archived")
        .reduce((sum, i) => sum + (i.estimatedMinutes ?? 0), 0);
      const progress = total > 0 ? Math.round((completed / total) * 100) : project.progress;
      const hasNextAction = Boolean(project.nextActionText) || projectItems.some((i) => i.status === "ready" || i.status === "in_progress");

      const health = computeProjectHealth({
        status: project.status,
        deadline: project.deadline,
        progress,
        lastActivityAt: project.lastActivityAt,
        hasNextAction,
        openBlockedTaskCount: blocked,
        remainingEstimatedMinutes: remainingMinutes,
      });

      return { project, health, progress, taskCounts: { total, completed, blocked } };
    })
    .sort((a, b) => b.health.score - a.health.score);
}

export async function getProjectById(userId: string, id: string) {
  return db.query.projects.findFirst({ where: and(eq(projects.id, id), eq(projects.userId, userId)) });
}

export async function getArchivedProjectsForUser(userId: string) {
  return db.query.projects.findMany({
    where: and(eq(projects.userId, userId), eq(projects.status, "archived")),
    orderBy: (p, { desc }) => [desc(p.archivedAt)],
  });
}
