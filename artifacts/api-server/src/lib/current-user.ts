import type { Request } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Resolves the app's own `users` row for the caller of this request, based
 * on their verified Clerk session. Returns null if there is no session or
 * no matching local user yet (the frontend should have already hit
 * GET /users/me once after sign-in, which creates the row).
 */
export async function getCurrentAppUser(req: Request) {
  const clerkId = getAuth(req).userId;
  if (!clerkId) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  return user ?? null;
}
