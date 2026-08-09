import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db/client";
import { lifeDomains, settings, users } from "@/lib/db/schema";
import { DEFAULT_LIFE_DOMAINS } from "@/lib/db/default-domains";

export const getOrCreateUser = cache(async () => {
  const { userId: clerkId } = await auth();
  if (!clerkId || !isDatabaseConfigured) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [created] = await db
    .insert(users)
    .values({
      clerkId,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
      imageUrl: clerkUser.imageUrl,
    })
    .onConflictDoNothing({ target: users.clerkId })
    .returning();

  const user = created ?? (await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) }));
  if (!user) return null;

  await db.insert(settings).values({ userId: user.id }).onConflictDoNothing();
  await db
    .insert(lifeDomains)
    .values(
      DEFAULT_LIFE_DOMAINS.map((d, i) => ({
        userId: user.id,
        name: d.name,
        slug: d.slug,
        color: d.color,
        icon: d.icon,
        isDefault: true,
        sortOrder: i,
      })),
    )
    .onConflictDoNothing();

  return user;
});

export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
