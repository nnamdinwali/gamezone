import { Router, type Request, type Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { db, gamesTable, gameMilestonesTable } from "@workspace/db";
import { eq, ilike, or, desc, and } from "drizzle-orm";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

async function requireAdmin(req: Request, res: Response) {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const role = (user.publicMetadata as { role?: unknown } | undefined)?.role;
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
      androidStoreUrl: g.androidStoreUrl,
      iosStoreUrl: g.iosStoreUrl,
      packageName: g.packageName,
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
router.post("/games", upload.single("coverImage"), async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const {
      title,
      description,
      genre,
      thumbnailUrl: thumbnailUrlField,
      gameUrl,
      storeUrl,
      androidStoreUrl,
      iosStoreUrl,
      packageName,
      creatorName,
      rewardPerMinute,
    } = req.body;

    // Cover image can arrive two ways: an actual uploaded file (admin's
    // "Store-link APK flow" form) or a plain URL string (older/JSON callers).
    const uploadedFile = req.file;
    const thumbnailUrl = uploadedFile
      ? `data:${uploadedFile.mimetype};base64,${uploadedFile.buffer.toString("base64")}`
      : thumbnailUrlField;

    // Store-link games (redirect to an app store, no embedded player) don't
    // have a separate playable URL — the store link doubles as gameUrl.
    const resolvedAndroidStoreUrl = androidStoreUrl || storeUrl || null;
    const resolvedGameUrl = gameUrl || storeUrl || null;

    if (!title || !description || !genre || !thumbnailUrl || !resolvedGameUrl || !creatorName || rewardPerMinute == null) {
      return res.status(400).json({ error: "Missing required fields: title, description, genre, cover image, a game or store URL, creator name, and reward per minute are all required" });
    }
    const [game] = await db.insert(gamesTable).values({
      title,
      description,
      genre,
      thumbnailUrl,
      gameUrl: resolvedGameUrl,
      androidStoreUrl: resolvedAndroidStoreUrl,
      iosStoreUrl: iosStoreUrl || null,
      packageName: packageName || null,
      creatorName,
      rewardPerMinute: Number(rewardPerMinute),
    }).returning();
    return res.status(201).json({
      id: game.id,
      title: game.title,
      description: game.description,
      genre: game.genre,
      thumbnailUrl: game.thumbnailUrl,
      gameUrl: game.gameUrl,
      androidStoreUrl: game.androidStoreUrl,
      iosStoreUrl: game.iosStoreUrl,
      packageName: game.packageName,
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
      androidStoreUrl: g.androidStoreUrl,
      iosStoreUrl: g.iosStoreUrl,
      packageName: g.packageName,
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
      androidStoreUrl: game.androidStoreUrl,
      iosStoreUrl: game.iosStoreUrl,
      packageName: game.packageName,
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
  if (!(await requireAdmin(req, res))) return;
  try {
    const id = Number(req.params.id);
    const {
      title,
      description,
      genre,
      thumbnailUrl,
      gameUrl,
      androidStoreUrl,
      iosStoreUrl,
      packageName,
      rewardPerMinute,
    } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (genre !== undefined) updates.genre = genre;
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;
    if (gameUrl !== undefined) updates.gameUrl = gameUrl;
    if (androidStoreUrl !== undefined) updates.androidStoreUrl = androidStoreUrl || null;
    if (iosStoreUrl !== undefined) updates.iosStoreUrl = iosStoreUrl || null;
    if (packageName !== undefined) updates.packageName = packageName || null;
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
      androidStoreUrl: game.androidStoreUrl,
      iosStoreUrl: game.iosStoreUrl,
      packageName: game.packageName,
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
  if (!(await requireAdmin(req, res))) return;
  try {
    const id = Number(req.params.id);
    await db.delete(gamesTable).where(eq(gamesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /games/:id/milestones — public, active milestones for a game, optionally scoped to a country
router.get("/games/:id/milestones", async (req, res) => {
  try {
    const gameId = Number(req.params.id);
    const country = typeof req.query.country === "string" ? req.query.country.toUpperCase() : null;

    const milestones = await db
      .select()
      .from(gameMilestonesTable)
      .where(
        country
          ? and(eq(gameMilestonesTable.gameId, gameId), eq(gameMilestonesTable.isActive, true), eq(gameMilestonesTable.countryCode, country))
          : and(eq(gameMilestonesTable.gameId, gameId), eq(gameMilestonesTable.isActive, true)),
      )
      .orderBy(gameMilestonesTable.level);

    res.json(milestones);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
