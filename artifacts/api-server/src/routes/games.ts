import { Router } from "express";
import { db, gamesTable } from "@workspace/db";
import { eq, ilike, or, desc } from "drizzle-orm";

const router = Router();

// GET /games
router.get("/games", async (req, res) => {
  try {
    const { genre, search } = req.query as { genre?: string; search?: string };
    let query = db.select().from(gamesTable);
    const conditions = [];
    if (genre) conditions.push(eq(gamesTable.genre, genre));
    if (search) conditions.push(or(ilike(gamesTable.title, `%${search}%`), ilike(gamesTable.description, `%${search}%`)));
    let games;
    if (conditions.length > 0) {
      games = await db.select().from(gamesTable).where(conditions.length === 1 ? conditions[0] : or(...conditions)).orderBy(desc(gamesTable.createdAt));
    } else {
      games = await db.select().from(gamesTable).orderBy(desc(gamesTable.createdAt));
    }
    res.json(games.map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      genre: g.genre,
      thumbnailUrl: g.thumbnailUrl,
      gameUrl: g.gameUrl,
      creatorName: g.creatorName,
      playCount: g.playCount,
      rating: g.rating,
      rewardPerMinute: g.rewardPerMinute,
      createdAt: g.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /games
router.post("/games", async (req, res) => {
  try {
    const { title, description, genre, thumbnailUrl, gameUrl, creatorName, rewardPerMinute } = req.body;
    if (!title || !description || !genre || !thumbnailUrl || !gameUrl || !creatorName || rewardPerMinute == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [game] = await db.insert(gamesTable).values({
      title, description, genre, thumbnailUrl, gameUrl, creatorName,
      rewardPerMinute: Number(rewardPerMinute),
    }).returning();
    return res.status(201).json({
      id: game.id,
      title: game.title,
      description: game.description,
      genre: game.genre,
      thumbnailUrl: game.thumbnailUrl,
      gameUrl: game.gameUrl,
      creatorName: game.creatorName,
      playCount: game.playCount,
      rating: game.rating,
      rewardPerMinute: game.rewardPerMinute,
      createdAt: game.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /games/trending
router.get("/games/trending", async (req, res) => {
  try {
    const games = await db.select().from(gamesTable).orderBy(desc(gamesTable.playCount)).limit(10);
    res.json(games.map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      genre: g.genre,
      thumbnailUrl: g.thumbnailUrl,
      gameUrl: g.gameUrl,
      creatorName: g.creatorName,
      playCount: g.playCount,
      rating: g.rating,
      rewardPerMinute: g.rewardPerMinute,
      createdAt: g.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /games/:id
router.get("/games/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, id));
    if (!game) return res.status(404).json({ error: "Game not found" });
    return res.json({
      id: game.id,
      title: game.title,
      description: game.description,
      genre: game.genre,
      thumbnailUrl: game.thumbnailUrl,
      gameUrl: game.gameUrl,
      creatorName: game.creatorName,
      playCount: game.playCount,
      rating: game.rating,
      rewardPerMinute: game.rewardPerMinute,
      createdAt: game.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /games/:id
router.patch("/games/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, genre, thumbnailUrl, gameUrl, rewardPerMinute } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (genre !== undefined) updates.genre = genre;
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;
    if (gameUrl !== undefined) updates.gameUrl = gameUrl;
    if (rewardPerMinute !== undefined) updates.rewardPerMinute = Number(rewardPerMinute);
    const [game] = await db.update(gamesTable).set(updates).where(eq(gamesTable.id, id)).returning();
    if (!game) return res.status(404).json({ error: "Game not found" });
    return res.json({
      id: game.id,
      title: game.title,
      description: game.description,
      genre: game.genre,
      thumbnailUrl: game.thumbnailUrl,
      gameUrl: game.gameUrl,
      creatorName: game.creatorName,
      playCount: game.playCount,
      rating: game.rating,
      rewardPerMinute: game.rewardPerMinute,
      createdAt: game.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /games/:id
router.delete("/games/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(gamesTable).where(eq(gamesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
