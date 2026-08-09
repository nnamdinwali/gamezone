import { Router } from "express";
import { db, earningsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// GET /earnings
router.get("/earnings", async (req, res) => {
  try {
    const { userId } = req.query as { userId?: string };
    let earnings;
    if (userId) {
      earnings = await db.select().from(earningsTable).where(eq(earningsTable.userId, Number(userId))).orderBy(desc(earningsTable.createdAt));
    } else {
      earnings = await db.select().from(earningsTable).orderBy(desc(earningsTable.createdAt));
    }
    res.json(earnings.map(e => ({
      id: e.id,
      userId: e.userId,
      amount: e.amount,
      type: e.type,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /earnings/withdraw
router.post("/earnings/withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: "userId and amount required" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(userId)));
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.balance < Number(amount)) return res.status(400).json({ error: "Insufficient balance" });

    // Deduct from balance
    await db.update(usersTable).set({ balance: user.balance - Number(amount) }).where(eq(usersTable.id, Number(userId)));

    const [earning] = await db.insert(earningsTable).values({
      userId: Number(userId),
      amount: -Number(amount),
      type: "withdrawal",
      status: "pending",
    }).returning();

    return res.status(201).json({
      id: earning.id,
      userId: earning.userId,
      amount: earning.amount,
      type: earning.type,
      status: earning.status,
      createdAt: earning.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
