import { Router } from "express";
import { db, playSessionsTable, gamesTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// GET /play-sessions
router.get("/play-sessions", async (req, res) => {
  try {
    const { userId, gameId } = req.query as { userId?: string; gameId?: string };
    const conditions = [];
    if (userId) conditions.push(eq(playSessionsTable.userId, Number(userId)));
    if (gameId) conditions.push(eq(playSessionsTable.gameId, Number(gameId)));

    let sessions;
    if (conditions.length > 0) {
      sessions = await db
        .select({
          id: playSessionsTable.id,
          userId: playSessionsTable.userId,
          gameId: playSessionsTable.gameId,
          gameName: gamesTable.title,
          status: playSessionsTable.status,
          pointsEarned: playSessionsTable.pointsEarned,
          durationMinutes: playSessionsTable.durationMinutes,
          startedAt: playSessionsTable.startedAt,
          endedAt: playSessionsTable.endedAt,
        })
        .from(playSessionsTable)
        .leftJoin(gamesTable, eq(playSessionsTable.gameId, gamesTable.id))
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(playSessionsTable.startedAt));
    } else {
      sessions = await db
        .select({
          id: playSessionsTable.id,
          userId: playSessionsTable.userId,
          gameId: playSessionsTable.gameId,
          gameName: gamesTable.title,
          status: playSessionsTable.status,
          pointsEarned: playSessionsTable.pointsEarned,
          durationMinutes: playSessionsTable.durationMinutes,
          startedAt: playSessionsTable.startedAt,
          endedAt: playSessionsTable.endedAt,
        })
        .from(playSessionsTable)
        .leftJoin(gamesTable, eq(playSessionsTable.gameId, gamesTable.id))
        .orderBy(desc(playSessionsTable.startedAt));
    }

    res.json(sessions.map(s => ({
      id: s.id,
      userId: s.userId,
      gameId: s.gameId,
      gameName: s.gameName ?? null,
      status: s.status,
      pointsEarned: s.pointsEarned,
      durationMinutes: s.durationMinutes ?? null,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt ? s.endedAt.toISOString() : null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /play-sessions
router.post("/play-sessions", async (req, res) => {
  try {
    const { userId, gameId } = req.body;
    if (!userId || !gameId) return res.status(400).json({ error: "userId and gameId required" });

    // Increment play count on game
    const [currentGame] = await db
      .select({ playCount: gamesTable.playCount })
      .from(gamesTable)
      .where(eq(gamesTable.id, Number(gameId)));
    await db
      .update(gamesTable)
      .set({ playCount: (currentGame?.playCount ?? 0) + 1 })
      .where(eq(gamesTable.id, Number(gameId)));

    const [session] = await db.insert(playSessionsTable).values({
      userId: Number(userId),
      gameId: Number(gameId),
    }).returning();

    const [game] = await db.select({ title: gamesTable.title }).from(gamesTable).where(eq(gamesTable.id, Number(gameId)));

    return res.status(201).json({
      id: session.id,
      userId: session.userId,
      gameId: session.gameId,
      gameName: game?.title ?? null,
      status: session.status,
      pointsEarned: session.pointsEarned,
      durationMinutes: session.durationMinutes ?? null,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt ? session.endedAt.toISOString() : null,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /play-sessions/:id/end
router.patch("/play-sessions/:id/end", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { durationMinutes } = req.body;
    if (durationMinutes == null) return res.status(400).json({ error: "durationMinutes required" });

    const [existing] = await db.select().from(playSessionsTable).where(eq(playSessionsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Session not found" });

    const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, existing.gameId));
    const pointsEarned = (game?.rewardPerMinute ?? 0.05) * Number(durationMinutes);

    const [session] = await db
      .update(playSessionsTable)
      .set({
        status: "completed",
        durationMinutes: Number(durationMinutes),
        pointsEarned,
        endedAt: new Date(),
      })
      .where(eq(playSessionsTable.id, id))
      .returning();

    // Update user balance and stats
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, existing.userId));
    if (user) {
      await db.update(usersTable).set({
        balance: user.balance + pointsEarned,
        totalEarnings: user.totalEarnings + pointsEarned,
        gamesPlayed: user.gamesPlayed + 1,
      }).where(eq(usersTable.id, existing.userId));
    }

    return res.json({
      id: session.id,
      userId: session.userId,
      gameId: session.gameId,
      gameName: game?.title ?? null,
      status: session.status,
      pointsEarned: session.pointsEarned,
      durationMinutes: session.durationMinutes ?? null,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt ? session.endedAt.toISOString() : null,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
