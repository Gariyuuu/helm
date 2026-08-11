"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db/client";
import { weeklyReviews } from "@/lib/db/schema";
import { saveWeeklyReviewSchema } from "@/lib/validation/weekly-review";

export async function saveWeeklyReview(raw: unknown) {
  const user = await requireUser();
  const input = saveWeeklyReviewSchema.parse(raw);

  const [saved] = await db
    .insert(weeklyReviews)
    .values({ userId: user.id, ...input })
    .onConflictDoUpdate({
      target: [weeklyReviews.userId, weeklyReviews.weekStart],
      set: {
        completedCount: input.completedCount,
        missedCount: input.missedCount,
        addedCount: input.addedCount,
        droppedCount: input.droppedCount,
        biggestWin: input.biggestWin,
        biggestBottleneck: input.biggestBottleneck,
        nextWeekFocus: input.nextWeekFocus,
        notes: input.notes,
      },
    })
    .returning();

  revalidatePath("/weekly-review");
  return saved;
}
