import { Router } from "express";
import { db, supportMessagesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getCurrentAppUser } from "../lib/current-user";
import { requireAdmin } from "./admin";

const router = Router();

function serialize(m: typeof supportMessagesTable.$inferSelect) {
  return {
    id: m.id,
    userId: m.userId,
    subject: m.subject,
    message: m.message,
    fromAdmin: m.fromAdmin,
    readAt: m.readAt ? m.readAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
  };
}

// GET /support/messages — the signed-in player's own message thread
router.get("/support/messages", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const messages = await db
      .select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.userId, user.id))
      .orderBy(supportMessagesTable.createdAt);

    return res.json(messages.map(serialize));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /support/messages — the signed-in player starts or continues a thread
router.post("/support/messages", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const { subject, message } = req.body as { subject?: string; message?: string };
    if (!subject || !message) return res.status(400).json({ error: "subject and message are required" });

    const [created] = await db
      .insert(supportMessagesTable)
      .values({ userId: user.id, subject, message, fromAdmin: false })
      .returning();

    return res.status(201).json(serialize(created));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/support/messages — every player-submitted message, for the admin inbox
router.get("/admin/support/messages", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const messages = await db
      .select({
        id: supportMessagesTable.id,
        userId: supportMessagesTable.userId,
        username: usersTable.username,
        email: usersTable.email,
        countryCode: usersTable.countryCode,
        subject: supportMessagesTable.subject,
        message: supportMessagesTable.message,
        readAt: supportMessagesTable.readAt,
        createdAt: supportMessagesTable.createdAt,
      })
      .from(supportMessagesTable)
      .leftJoin(usersTable, eq(supportMessagesTable.userId, usersTable.id))
      .where(eq(supportMessagesTable.fromAdmin, false))
      .orderBy(desc(supportMessagesTable.createdAt));

    return res.json({
      messages: messages.map((m) => ({
        id: m.id,
        userId: m.userId,
        subject: m.subject,
        message: m.message,
        status: m.readAt ? "read" : "open",
        readAt: m.readAt ? m.readAt.toISOString() : null,
        createdAt: m.createdAt.toISOString(),
        user: { username: m.username ?? "Player", email: m.email ?? "", countryCode: m.countryCode ?? null },
      })),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/support/messages/:userId — admin replies to a specific player
router.post("/admin/support/messages/:userId", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const userId = Number(req.params.userId);
    const { subject, message } = req.body as { subject?: string; message?: string };
    if (!subject || !message) return res.status(400).json({ error: "subject and message are required" });

    const [created] = await db
      .insert(supportMessagesTable)
      .values({ userId, subject, message, fromAdmin: true })
      .returning();

    return res.status(201).json(serialize(created));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
