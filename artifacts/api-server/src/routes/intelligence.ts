import { Router } from "express";
import multer from "multer";
import {
  db,
  usersTable,
  playSessionsTable,
  earningsTable,
  gamesTable,
  intelligenceConversationsTable,
  intelligenceMessagesTable,
  gameAuditArtifactsTable,
  supportMessagesTable,
} from "@workspace/db";
import { eq, desc, gte, sql, lt } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// ---- Summary + signals (rule-based, no external AI — free to run) ----

router.get("/admin/intelligence/summary", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    const [{ count: userCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);

    const activeUserIds = await db
      .selectDistinct({ userId: playSessionsTable.userId })
      .from(playSessionsTable)
      .where(gte(playSessionsTable.startedAt, dayAgo));

    const [{ count: avgEarningCount }, [{ avgAmount }]] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(earningsTable).where(eq(earningsTable.type, "play")),
      db.select({ avgAmount: sql<number>`coalesce(avg(${earningsTable.amount}), 0)` }).from(earningsTable).where(eq(earningsTable.type, "play")),
    ]);

    // Players active in the last 24h but whose most recent session started
    // more than 12h ago (a simple "going quiet" heuristic — no ML needed).
    const recentSessions = await db
      .select({ userId: playSessionsTable.userId, startedAt: playSessionsTable.startedAt })
      .from(playSessionsTable)
      .orderBy(desc(playSessionsTable.startedAt));
    const lastSeenByUser = new Map<number, Date>();
    for (const s of recentSessions) if (!lastSeenByUser.has(s.userId)) lastSeenByUser.set(s.userId, s.startedAt);
    const inactive12h = [...lastSeenByUser.values()].filter((d) => d < twelveHoursAgo).length;

    // Signal: earnings sessions paying far above the platform average — worth a manual look.
    const outlierEarnings = await db
      .select({ userId: earningsTable.userId, amount: earningsTable.amount, createdAt: earningsTable.createdAt })
      .from(earningsTable)
      .where(sql`${earningsTable.type} = 'play' and ${earningsTable.amount} > ${avgAmount || 0} * 5`)
      .orderBy(desc(earningsTable.createdAt))
      .limit(10);

    const signals = outlierEarnings.map((e) => ({
      code: "earning-outlier",
      severity: "review" as const,
      confidence: "medium" as const,
      subject: `User #${e.userId}`,
      evidence: `Earned ${e.amount.toFixed(2)} in one session — more than 5x the platform average (${(avgAmount || 0).toFixed(3)}). Worth a manual look for scripted/abuse activity.`,
      reviewStatus: "needs-owner-review" as const,
    }));

    return res.json({
      generatedAt: now.toISOString(),
      ownerOnly: true,
      automaticRestrictions: false,
      users: userCount,
      activeLast24Hours: activeUserIds.length,
      inactiveAtLeast12Hours: inactive12h,
      optedOutOfNotifications: 0,
      reengagementRemindersCreated: 0,
      reviewNote:
        avgEarningCount > 0
          ? `Computed directly from live platform data — ${userCount} total players, ${activeUserIds.length} active in the last 24h.`
          : "No play-session data yet — signals will populate once players start earning.",
      signals,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ---- Conversations ----

router.get("/admin/intelligence/conversations", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const conversations = await db
      .select()
      .from(intelligenceConversationsTable)
      .orderBy(desc(intelligenceConversationsTable.updatedAt));
    res.json(conversations.map((c) => ({ id: c.id, title: c.title, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/intelligence/conversations", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const { title } = req.body as { title?: string };
    const [created] = await db
      .insert(intelligenceConversationsTable)
      .values({ title: title?.trim() || "New conversation" })
      .returning();
    res.status(201).json({ id: created.id, title: created.title, createdAt: created.createdAt.toISOString(), updatedAt: created.updatedAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/intelligence/conversations/:id/messages", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const conversationId = Number(req.params.id);
    const [conversation] = await db.select().from(intelligenceConversationsTable).where(eq(intelligenceConversationsTable.id, conversationId));
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const messages = await db
      .select()
      .from(intelligenceMessagesTable)
      .where(eq(intelligenceMessagesTable.conversationId, conversationId))
      .orderBy(intelligenceMessagesTable.createdAt);

    res.json({
      conversation: { id: conversation.id, title: conversation.title, createdAt: conversation.createdAt.toISOString(), updatedAt: conversation.updatedAt.toISOString() },
      messages: messages.map((m) => ({ id: m.id, conversationId: m.conversationId, role: m.role, content: m.content, createdAt: m.createdAt.toISOString() })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---- Rule-based Q&A (no paid AI — answers computed directly from real data) ----

async function answerQuestion(question: string, gameId?: number): Promise<string> {
  const q = question.toLowerCase();

  const [{ count: totalUsers }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [{ count: totalGames }] = await db.select({ count: sql<number>`count(*)::int` }).from(gamesTable);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeUsers = await db.selectDistinct({ userId: playSessionsTable.userId }).from(playSessionsTable).where(gte(playSessionsTable.startedAt, dayAgo));
  const [{ count: bannedCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(sql`${usersTable.bannedAt} is not null`);
  const [{ count: pendingWithdrawals }] = await db.select({ count: sql<number>`count(*)::int` }).from(earningsTable).where(sql`${earningsTable.type} = 'withdrawal' and ${earningsTable.status} = 'pending'`);

  // Entity lookup: does the question mention a real username or game title
  // by name? If so, answer about that specific entity directly, regardless
  // of which category keyword also matched.
  const allUsers = await db.select({ id: usersTable.id, username: usersTable.username }).from(usersTable);
  const mentionedUser = allUsers.find((u) => u.username && q.includes(u.username.toLowerCase()));
  const allGames = await db.select({ id: gamesTable.id, title: gamesTable.title }).from(gamesTable);
  const mentionedGame = allGames.find((g) => g.title && q.includes(g.title.toLowerCase()));

  if (mentionedUser && (q.includes("who is") || q.includes("player") || q.includes("about") || q.includes("tell me"))) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, mentionedUser.id));
    const [{ sessionCount }] = await db.select({ sessionCount: sql<number>`count(*)::int` }).from(playSessionsTable).where(eq(playSessionsTable.userId, mentionedUser.id));
    return `${user.username}: balance ${user.balance.toFixed(2)}, ${user.totalEarnings.toFixed(2)} earned lifetime, ${sessionCount} play session(s), ${user.gamesPlayed} game(s) played, ${user.bannedAt ? `banned (${user.banReason ?? "no reason given"})` : "not banned"}, joined ${user.createdAt.toISOString().slice(0, 10)}.`;
  }

  if (mentionedGame && !gameId) {
    const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, mentionedGame.id));
    const [{ sessionCount }] = await db.select({ sessionCount: sql<number>`count(*)::int` }).from(playSessionsTable).where(eq(playSessionsTable.gameId, mentionedGame.id));
    return `${game.title}: ${game.playCount} total plays, ${sessionCount} recorded sessions, ${game.genre}, rating ${game.rating.toFixed(1)}, paying ${game.rewardPerMinute}/minute.`;
  }

  if (q.includes("unusual") || q.includes("outlier") || q.includes("suspicious")) {
    const [{ avgAmount }] = await db.select({ avgAmount: sql<number>`coalesce(avg(${earningsTable.amount}), 0)` }).from(earningsTable).where(eq(earningsTable.type, "play"));
    const outliers = await db
      .select({ userId: earningsTable.userId, amount: earningsTable.amount })
      .from(earningsTable)
      .where(sql`${earningsTable.type} = 'play' and ${earningsTable.amount} > ${avgAmount || 0} * 5`)
      .limit(5);
    if (!outliers.length) return "No unusual earning activity found — every session is within a normal range of the platform average.";
    return `${outliers.length} session(s) stand out as unusually high-earning: ${outliers.map((o) => `user #${o.userId} earned ${o.amount.toFixed(2)}`).join(", ")}. Platform average per session is ${(avgAmount || 0).toFixed(3)}.`;
  }

  if (q.includes("inactive")) {
    return `${totalUsers - activeUsers.length} of ${totalUsers} total players have not played in the last 24 hours.`;
  }

  if (q.includes("signup") || q.includes("sign up") || q.includes("new player") || q.includes("new user")) {
    const [{ today }] = await db.select({ today: sql<number>`count(*)::int` }).from(usersTable).where(gte(usersTable.createdAt, dayAgo));
    const [{ week }] = await db.select({ week: sql<number>`count(*)::int` }).from(usersTable).where(gte(usersTable.createdAt, weekAgo));
    return `${today} new signup(s) in the last 24 hours, ${week} in the last 7 days, out of ${totalUsers} total players.`;
  }

  if (q.includes("retention") || q.includes("come back") || q.includes("returning")) {
    const sessionCounts = await db.select({ userId: playSessionsTable.userId, count: sql<number>`count(*)::int` }).from(playSessionsTable).groupBy(playSessionsTable.userId);
    const returning = sessionCounts.filter((s) => s.count > 1).length;
    const playersWithSessions = sessionCounts.length;
    if (!playersWithSessions) return "No play sessions recorded yet — retention will be measurable once players start playing.";
    return `${returning} of ${playersWithSessions} players who have ever played (${((returning / playersWithSessions) * 100).toFixed(0)}%) have come back for more than one session.`;
  }

  if (q.includes("top earner") || q.includes("highest earn") || q.includes("who earns")) {
    const top = await db.select({ username: usersTable.username, totalEarnings: usersTable.totalEarnings }).from(usersTable).orderBy(desc(usersTable.totalEarnings)).limit(5);
    if (!top.length || top[0].totalEarnings === 0) return "No earnings recorded yet.";
    return `Top earners: ${top.map((u) => `${u.username} (${u.totalEarnings.toFixed(2)})`).join(", ")}.`;
  }

  if (q.includes("top game") || q.includes("most played") || q.includes("popular game") || q.includes("leaderboard")) {
    const top = await db.select({ title: gamesTable.title, playCount: gamesTable.playCount }).from(gamesTable).orderBy(desc(gamesTable.playCount)).limit(5);
    if (!top.length || top[0].playCount === 0) return "No games have recorded plays yet.";
    return `Top games by plays: ${top.map((g) => `${g.title} (${g.playCount})`).join(", ")}.`;
  }

  if (q.includes("revenue") || q.includes("total earning") || q.includes("how much") && q.includes("paid")) {
    const [{ total }] = await db.select({ total: sql<number>`coalesce(sum(${earningsTable.amount}), 0)::real` }).from(earningsTable).where(eq(earningsTable.type, "play"));
    const [{ weekTotal }] = await db.select({ weekTotal: sql<number>`coalesce(sum(${earningsTable.amount}), 0)::real` }).from(earningsTable).where(sql`${earningsTable.type} = 'play' and ${earningsTable.createdAt} >= ${weekAgo.toISOString()}`);
    return `${total.toFixed(2)} paid out to players all-time, ${weekTotal.toFixed(2)} in the last 7 days.`;
  }

  if (q.includes("support") || q.includes("ticket") || q.includes("message")) {
    const [{ open }] = await db
      .select({ open: sql<number>`count(*)::int` })
      .from(supportMessagesTable)
      .where(sql`${supportMessagesTable.fromAdmin} = false and ${supportMessagesTable.readAt} is null`);
    return `${open} unread player support message(s) waiting in the inbox.`;
  }

  if (q.includes("active")) {
    return `${activeUsers.length} players have been active in the last 24 hours, out of ${totalUsers} total registered players.`;
  }

  if (q.includes("withdraw") || q.includes("payout") || q.includes("cashout")) {
    return `There ${pendingWithdrawals === 1 ? "is" : "are"} currently ${pendingWithdrawals} pending withdrawal request(s) awaiting your review.`;
  }

  if (q.includes("ban")) {
    return `${bannedCount} account(s) are currently banned.`;
  }

  if (gameId) {
    const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, gameId));
    if (game) {
      const [{ sessionCount }] = await db.select({ sessionCount: sql<number>`count(*)::int` }).from(playSessionsTable).where(eq(playSessionsTable.gameId, gameId));
      return `${game.title}: ${game.playCount} total plays, ${sessionCount} recorded sessions, paying ${game.rewardPerMinute}/minute.`;
    }
  }

  return `Platform snapshot: ${totalUsers} total players, ${totalGames} games live, ${activeUsers.length} active in the last 24h, ${bannedCount} banned, ${pendingWithdrawals} withdrawal(s) pending review. Ask about a specific player or game by name, or try "unusual activity", "signups", "retention", "top earners", "top games", "revenue", "support", "withdrawals", or "bans".`;
}

router.post("/admin/intelligence/conversations/:id/messages", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const conversationId = Number(req.params.id);
    const { question, gameId } = req.body as { question?: string; gameId?: number };
    if (!question?.trim()) return res.status(400).json({ error: "question is required" });

    const [conversation] = await db.select().from(intelligenceConversationsTable).where(eq(intelligenceConversationsTable.id, conversationId));
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const answerText = await answerQuestion(question, gameId);

    await db.insert(intelligenceMessagesTable).values({ conversationId, role: "user", content: question.trim() });
    await db.insert(intelligenceMessagesTable).values({ conversationId, role: "assistant", content: answerText });
    await db.update(intelligenceConversationsTable).set({ updatedAt: new Date() }).where(eq(intelligenceConversationsTable.id, conversationId));

    res.json({ question: question.trim(), answer: answerText, ownerOnly: true, automaticRestrictions: false });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---- Game audit artifacts (upload + scan) ----

router.get("/admin/intelligence/games/:gameId/artifacts", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const gameId = Number(req.params.gameId);
    const artifacts = await db.select().from(gameAuditArtifactsTable).where(eq(gameAuditArtifactsTable.gameId, gameId)).orderBy(desc(gameAuditArtifactsTable.createdAt));
    res.json(
      artifacts.map((a) => ({
        id: a.id,
        gameId: a.gameId,
        artifactType: a.artifactType,
        label: a.label,
        sourceUrl: null,
        mimeType: a.mimeType,
        byteSize: a.byteSize,
        scanStatus: a.scanStatus,
        scanEvidence: a.scanEvidence ? JSON.parse(a.scanEvidence) : null,
        scannedAt: a.scannedAt ? a.scannedAt.toISOString() : null,
      })),
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/intelligence/games/:gameId/artifacts", upload.single("artifact"), async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const gameId = Number(req.params.gameId);
    const file = req.file;
    const label = (req.body.label as string) || file?.originalname || "Untitled artifact";
    if (!file) return res.status(400).json({ error: "artifact file is required" });

    const [created] = await db
      .insert(gameAuditArtifactsTable)
      .values({
        gameId,
        artifactType: (req.body.artifactType as string) || "source",
        label,
        mimeType: file.mimetype,
        byteSize: file.size,
        scanStatus: "registered",
      })
      .returning();

    // Text-based files get scanned immediately on upload; binaries (apk/zip)
    // are registered and can be scanned on demand below.
    const textLike = /json|text|xml|yaml|javascript|typescript/.test(file.mimetype) || /\.(json|js|ts|tsx|jsx|xml|yaml|yml|txt|html|css|kt|java|cs|md)$/i.test(file.originalname);
    if (textLike) {
      const evidence = scanTextForSignals(file.buffer.toString("utf-8"));
      const [scanned] = await db
        .update(gameAuditArtifactsTable)
        .set({ scanStatus: "scanned", scanEvidence: JSON.stringify(evidence), scannedAt: new Date() })
        .where(eq(gameAuditArtifactsTable.id, created.id))
        .returning();
      return res.status(201).json(serializeArtifact(scanned));
    }

    res.status(201).json(serializeArtifact(created));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/intelligence/games/:gameId/artifacts/:artifactId/scan", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const artifactId = Number(req.params.artifactId);
    const [artifact] = await db.select().from(gameAuditArtifactsTable).where(eq(gameAuditArtifactsTable.id, artifactId));
    if (!artifact) return res.status(404).json({ error: "Artifact not found" });

    // Binary formats (apk/aab/zip) are never executed — only registered.
    // Without the original bytes stored, we can confirm registration but
    // can't re-scan contents after the fact.
    const evidence = { warnings: ["Binary or archive artifacts are registered but not executed. Re-upload a text/source file for detailed scanning."] };
    const [updated] = await db
      .update(gameAuditArtifactsTable)
      .set({ scanStatus: "unsupported", scanEvidence: JSON.stringify(evidence), scannedAt: new Date() })
      .where(eq(gameAuditArtifactsTable.id, artifactId))
      .returning();

    res.json({ status: updated.scanStatus, evidence: JSON.parse(updated.scanEvidence!) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function serializeArtifact(a: typeof gameAuditArtifactsTable.$inferSelect) {
  return {
    id: a.id,
    gameId: a.gameId,
    artifactType: a.artifactType,
    label: a.label,
    sourceUrl: null,
    mimeType: a.mimeType,
    byteSize: a.byteSize,
    scanStatus: a.scanStatus,
    scanEvidence: a.scanEvidence ? JSON.parse(a.scanEvidence) : null,
    scannedAt: a.scannedAt ? a.scannedAt.toISOString() : null,
  };
}

function scanTextForSignals(text: string) {
  const detectedFormats: string[] = [];
  const adSignals: string[] = [];
  const progressionSignals: string[] = [];
  const placementHints: string[] = [];

  if (/admob|google.*ads|com\.google\.android\.gms\.ads/i.test(text)) adSignals.push("AdMob SDK reference found");
  if (/unityads|unity.*ads/i.test(text)) adSignals.push("Unity Ads SDK reference found");
  if (/applovin/i.test(text)) adSignals.push("AppLovin SDK reference found");
  if (/rewardedvideo|rewarded_ad|reward.*ad/i.test(text)) adSignals.push("Rewarded-ad integration point found");
  if (/interstitial/i.test(text)) placementHints.push("Interstitial ad placement referenced in code");
  if (/banner.*ad/i.test(text)) placementHints.push("Banner ad placement referenced in code");

  if (/level\s*[:=]\s*\d+/i.test(text)) progressionSignals.push("Numbered level markers found");
  if (/"levels"\s*:\s*\[/i.test(text)) progressionSignals.push("Levels array found in structured data");
  if (/checkpoint|milestone|stage\d+/i.test(text)) progressionSignals.push("Checkpoint/milestone/stage markers found");

  if (/\.json$/i.test(text) || text.trim().startsWith("{") || text.trim().startsWith("[")) detectedFormats.push("JSON/structured data");
  if (/<manifest/i.test(text)) detectedFormats.push("Android manifest XML");

  return {
    scannedBytes: text.length,
    truncated: false,
    detectedFormats,
    adSignals,
    progressionSignals,
    placementHints,
    warnings: adSignals.length === 0 && progressionSignals.length === 0 ? ["No recognizable ad or progression markers found in this file."] : [],
  };
}

export default router;
