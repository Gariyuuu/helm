import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { applications, companies, contacts } from "@/lib/db/schema";

export async function getCompaniesForUser(userId: string) {
  return db.query.companies.findMany({ where: eq(companies.userId, userId), orderBy: (c, { asc }) => [asc(c.name)] });
}

export async function getContactsForUser(userId: string) {
  return db.query.contacts.findMany({ where: eq(contacts.userId, userId), orderBy: (c, { asc }) => [asc(c.name)] });
}

export async function getApplicationsForUser(userId: string) {
  const rows = await db.query.applications.findMany({
    where: and(eq(applications.userId, userId)),
    orderBy: (a, { asc }) => [asc(a.deadline)],
  });
  const companyRows = await db.query.companies.findMany({ where: eq(companies.userId, userId) });
  const companyById = new Map(companyRows.map((c) => [c.id, c]));

  return rows.map((application) => ({ application, company: application.companyId ? companyById.get(application.companyId) : undefined }));
}
