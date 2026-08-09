import "server-only";
import { db } from "@/lib/db/client";
import { activityLogs, entityTypeEnum } from "@/lib/db/schema";

type EntityType = (typeof entityTypeEnum.enumValues)[number];

export async function logActivity(params: {
  userId: string;
  entityType: EntityType;
  entityId: string;
  action: string;
  fromValue?: string | null;
  toValue?: string | null;
  note?: string | null;
}) {
  await db.insert(activityLogs).values({
    userId: params.userId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    fromValue: params.fromValue ?? null,
    toValue: params.toValue ?? null,
    note: params.note ?? null,
  });
}
