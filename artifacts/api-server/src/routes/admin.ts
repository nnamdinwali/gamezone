import { Router, type Request, type Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { db, gamesTable, playSessionsTable, usersTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

const router = Router();

async function requireAdmin(req: Request, res: Response) {
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const role = (clerkUser.publicMetadata as { role?: unknown } | undefined)?.role;
    if (role !== "admin") {
      res.status(403).json({ error: "Administrator access required" });
      return false;
    }
    return true;
  } catch (err) {
    req.log.error(err);
    res.status(401).json({ error: "Unable to verify administrator access" });
    return false;
  }
}

function serializeUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    balance: user.balance,
    totalEarnings: user.totalEarnings,
    gamesPlayed: user.gamesPlayed,
    bannedAt: user.bannedAt?.toISOString() ?? null,
    banReason: user.banReason,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/admin/overview", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const [users] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const [games] = await db.select({ count: sql<number>`count(*)` }).from(gamesTable);
    const [activeSessions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(playSessionsTable)
      .where(eq(playSessionsTable.status, "active"));
    const [bannedUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(sql`${usersTable.bannedAt} is not null`);

    res.json({
      users: Number(users?.count ?? 0),
      games: Number(games?.count ?? 0),
      activeSessions: Number(activeSessions?.count ?? 0),
      bannedUsers: Number(bannedUsers?.count ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/users", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(users.map(serializeUser));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:id/ban", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const id = Number(req.params.id);
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "Policy violation";
    const [user] = await db
      .update(usersTable)
      .set({ bannedAt: new Date(), banReason: reason || "Policy violation" })
      .where(eq(usersTable.id, id))
      .returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(serializeUser(user));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:id/unban", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const id = Number(req.params.id);
    const [user] = await db
      .update(usersTable)
      .set({ bannedAt: null, banReason: null })
      .where(eq(usersTable.id, id))
      .returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(serializeUser(user));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

