import { Router, type Request, type Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { db, gameMilestonesTable, gamesTable, playSessionsTable, usersTable, earningsTable, payoutMethodsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { maskDetails, buildLabel, maskedDetailsString } from "./payout_methods";

const router = Router();
const ownerEmail = process.env.ADMIN_OWNER_EMAIL?.trim().toLowerCase();

export async function requireAdmin(req: Request, res: Response) {
  const clerkId = getAuth(req).userId;
  if (!clerkId) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    if (!ownerEmail) {
      res.status(503).json({ error: "Admin owner is not configured" });
      return false;
    }
    const ownsAdminEmail = clerkUser.emailAddresses.some(
      (address) => address.emailAddress.trim().toLowerCase() === ownerEmail,
    );
    if (!ownsAdminEmail) {
      res.status(403).json({ error: "Owner administrator access required" });
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

router.get("/admin/games/:gameId/milestones", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const gameId = Number(req.params.gameId);
    const milestones = await db.select().from(gameMilestonesTable).where(eq(gameMilestonesTable.gameId, gameId));
    return res.json(milestones);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/games/:gameId/milestones", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const gameId = Number(req.params.gameId);
    const level = Number(req.body?.level);
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const rewardAmount = Number(req.body?.rewardAmount);
    const currency = typeof req.body?.currency === "string" ? req.body.currency.trim().toUpperCase() : "USD";
    const countryCode = typeof req.body?.countryCode === "string" ? req.body.countryCode.trim().toUpperCase() : "US";
    if (!Number.isInteger(gameId) || !Number.isInteger(level) || level < 1 || !title || !Number.isFinite(rewardAmount) || rewardAmount < 0) {
      return res.status(400).json({ error: "gameId, level, title, and a non-negative rewardAmount are required" });
    }
    const [milestone] = await db.insert(gameMilestonesTable).values({
      gameId,
      level,
      title,
      rewardAmount,
      currency,
      countryCode,
    }).returning();
    return res.status(201).json(milestone);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Unable to create milestone" });
  }
});

router.patch("/admin/milestones/:id", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const id = Number(req.params.id);
    const updates: Record<string, unknown> = {};
    if (req.body?.level !== undefined) updates.level = Number(req.body.level);
    if (req.body?.title !== undefined) updates.title = String(req.body.title).trim();
    if (req.body?.rewardAmount !== undefined) updates.rewardAmount = Number(req.body.rewardAmount);
    if (req.body?.currency !== undefined) updates.currency = String(req.body.currency).trim().toUpperCase();
    if (req.body?.countryCode !== undefined) updates.countryCode = String(req.body.countryCode).trim().toUpperCase();
    if (req.body?.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);
    const [milestone] = await db.update(gameMilestonesTable).set(updates).where(eq(gameMilestonesTable.id, id)).returning();
    if (!milestone) return res.status(404).json({ error: "Milestone not found" });
    return res.json(milestone);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Unable to update milestone" });
  }
});

router.delete("/admin/milestones/:id", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const id = Number(req.params.id);
    await db.delete(gameMilestonesTable).where(eq(gameMilestonesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Unable to delete milestone" });
  }
});

// GET /admin/withdrawals — every pending/processed withdrawal, for admin approval
router.get("/admin/withdrawals", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const withdrawals = await db
      .select({
        id: earningsTable.id,
        userId: earningsTable.userId,
        username: usersTable.username,
        email: usersTable.email,
        countryCode: usersTable.countryCode,
        currencyCode: usersTable.currencyCode,
        amount: earningsTable.amount,
        status: earningsTable.status,
        reviewNote: earningsTable.reviewNote,
        payoutMethodId: earningsTable.payoutMethodId,
        createdAt: earningsTable.createdAt,
      })
      .from(earningsTable)
      .leftJoin(usersTable, eq(earningsTable.userId, usersTable.id))
      .where(eq(earningsTable.type, "withdrawal"))
      .orderBy(desc(earningsTable.createdAt));

    const payoutMethodIds = [...new Set(withdrawals.map((w) => w.payoutMethodId).filter((id): id is number => id !== null))];
    const payoutMethodRows = payoutMethodIds.length
      ? await db.select().from(payoutMethodsTable).where(sql`${payoutMethodsTable.id} IN (${sql.join(payoutMethodIds.map((id) => sql`${id}`), sql`, `)})`)
      : [];
    const payoutMethodById = new Map(payoutMethodRows.map((p) => [p.id, p]));

    res.json(
      withdrawals.map((w) => {
        const profile = w.payoutMethodId ? payoutMethodById.get(w.payoutMethodId) : undefined;
        const details = profile ? (JSON.parse(profile.details) as Record<string, string>) : {};
        return {
          id: w.id,
          userId: w.userId,
          amount: Math.abs(w.amount),
          currencyCode: w.currencyCode ?? "NGN",
          status: w.status,
          reviewNote: w.reviewNote,
          createdAt: w.createdAt.toISOString(),
          user: { username: w.username ?? "Unknown", email: w.email ?? "", countryCode: w.countryCode },
          payoutProfile: profile
            ? { method: profile.method, label: buildLabel(profile.method, details), maskedDetails: maskedDetailsString(profile.method, details), details: maskDetails(profile.method, details) }
            : { method: "unknown", label: "Payout method removed", maskedDetails: "", details: {} },
        };
      }),
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/withdrawals/:id/status — approve, mark paid, request correction, or reject a withdrawal
router.patch("/admin/withdrawals/:id/status", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const id = Number(req.params.id);
    const { status, reviewNote } = req.body as { status?: string; reviewNote?: string };
    const validStatuses = ["pending", "approved", "paid", "needs_correction", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const [withdrawal] = await db.select().from(earningsTable).where(eq(earningsTable.id, id));
    if (!withdrawal || withdrawal.type !== "withdrawal") return res.status(404).json({ error: "Withdrawal not found" });

    // Rejecting refunds the balance back to the player, once.
    if (status === "rejected" && withdrawal.status !== "rejected") {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, withdrawal.userId));
      if (user) {
        await db.update(usersTable).set({ balance: user.balance + Math.abs(withdrawal.amount) }).where(eq(usersTable.id, user.id));
      }
    }

    const [updated] = await db
      .update(earningsTable)
      .set({ status, ...(reviewNote !== undefined ? { reviewNote } : {}) })
      .where(eq(earningsTable.id, id))
      .returning();
    res.json({ id: updated.id, status: updated.status, reviewNote: updated.reviewNote });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/active-sessions — players currently mid-session, right now
router.get("/admin/active-sessions", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const rows = await db
      .select({
        id: playSessionsTable.id,
        userId: playSessionsTable.userId,
        username: usersTable.username,
        email: usersTable.email,
        gameId: playSessionsTable.gameId,
        gameTitle: gamesTable.title,
        startedAt: playSessionsTable.startedAt,
      })
      .from(playSessionsTable)
      .leftJoin(usersTable, eq(playSessionsTable.userId, usersTable.id))
      .leftJoin(gamesTable, eq(playSessionsTable.gameId, gamesTable.id))
      .where(eq(playSessionsTable.status, "active"))
      .orderBy(desc(playSessionsTable.startedAt));

    res.json(
      rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        username: r.username ?? "Unknown",
        email: r.email ?? "",
        gameId: r.gameId,
        gameTitle: r.gameTitle ?? "Unknown game",
        startedAt: r.startedAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

