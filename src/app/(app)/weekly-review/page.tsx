import { requireUser } from "@/lib/auth/current-user";
import { computeWeekStats, currentWeekStart, getWeeklyReviewForWeek, getWeeklyReviewsForUser } from "@/lib/queries/weekly-review";
import { WeeklyReviewForm } from "@/components/weekly-review/weekly-review-form";
import { Card } from "@/components/ui/card";

export default async function WeeklyReviewPage() {
  const user = await requireUser();
  const weekStart = currentWeekStart();
  const [stats, existing, pastReviews] = await Promise.all([
    computeWeekStats(user.id, weekStart),
    getWeeklyReviewForWeek(user.id, weekStart),
    getWeeklyReviewsForUser(user.id),
  ]);
  const past = pastReviews.filter((r) => r.weekStart.getTime() !== weekStart.getTime());

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Weekly Review</h1>
        <p className="text-sm text-muted-foreground">Week of {weekStart.toLocaleDateString()}</p>
      </div>

      <WeeklyReviewForm weekStart={weekStart} stats={stats} existing={existing} />

      {past.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Past reviews</h2>
          <div className="flex flex-col gap-2">
            {past.map((r) => (
              <Card key={r.id} className="p-3">
                <p className="text-sm font-medium">Week of {r.weekStart.toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">
                  {r.completedCount} completed · {r.missedCount} missed · {r.addedCount} added · {r.droppedCount} dropped
                </p>
                {r.biggestWin && <p className="mt-1 text-sm">Win: {r.biggestWin}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
