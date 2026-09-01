import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc, isNull, and, sql } from "drizzle-orm";
import { getCurrentAppUser } from "../lib/current-user";

const router = Router();

function serialize(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt ? n.readAt.toISOString() : null,
  };
}

// GET /notifications
router.get("/notifications", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user.id))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, user.id), isNull(notificationsTable.readAt)));

    return res.json({ notifications: rows.map(serialize), unreadCount: count });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /notifications/:id/read
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(notificationsTable)
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)));
    if (!existing) return res.status(404).json({ error: "Notification not found" });

    const [updated] = await db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(eq(notificationsTable.id, id))
      .returning();

    return res.json(serialize(updated));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
