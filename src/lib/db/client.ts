import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

const sql = neon(
  process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/not_configured",
);

export const db = drizzle(sql, { schema });

export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDatabaseConfigured) return fallback;
  try {
    return await fn();
  } catch (error) {
    console.error("[db] query failed", error);
    return fallback;
  }
}
