import { Router } from "express";
import { db, gamesTable, usersTable, earningsTable, playSessionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    const [totalGamesRow] = await db.select({ count: sql<number>`count(*)` }).from(gamesTable);
    const [totalPlayersRow] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const [totalPayoutsRow] = await db
      .select({ sum: sql<number>`coalesce(sum(amount), 0)` })
      .from(earningsTable)
      .where(eq(earningsTable.type, "play"));
    const [activeSessionsRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(playSessionsTable)
      .where(eq(playSessionsTable.status, "active"));

    const genreRows = await db
      .select({ genre: gamesTable.genre, count: sql<number>`count(*)` })
      .from(gamesTable)
      .groupBy(gamesTable.genre)
      .orderBy(sql`count(*) desc`)
      .limit(5);

    res.json({
      totalGames: Number(totalGamesRow?.count ?? 0),
      totalPlayers: Number(totalPlayersRow?.count ?? 0),
      totalPayouts: Number(totalPayoutsRow?.sum ?? 0),
      activeSessionsCount: Number(activeSessionsRow?.count ?? 0),
      topGenres: genreRows.map(r => ({ genre: r.genre, count: Number(r.count) })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
