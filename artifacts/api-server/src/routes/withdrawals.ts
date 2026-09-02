import { Router } from "express";
import { db, earningsTable, usersTable, payoutMethodsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCurrentAppUser } from "../lib/current-user";

const router = Router();

// Must match CASHOUT_TARGET on the frontend (artifacts/gamezone/src/pages/home.tsx) —
// that's what the "Next cashout" progress bar promises, so it has to be true here too.
const MINIMUM_WITHDRAWAL_AMOUNT = 2.5;

// POST /withdrawals — the signed-in player requests a cashout against one of their saved payout methods
router.post("/withdrawals", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const { amount, payoutProfileId } = req.body as { amount?: number; payoutProfileId?: number };
    if (!amount || !payoutProfileId) return res.status(400).json({ error: "amount and payoutProfileId are required" });
    if (amount <= 0) return res.status(400).json({ error: "amount must be positive" });
    if (amount < MINIMUM_WITHDRAWAL_AMOUNT) {
      return res.status(400).json({ error: `Minimum withdrawal is ${MINIMUM_WITHDRAWAL_AMOUNT}` });
    }
    if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

    const [profile] = await db
      .select()
      .from(payoutMethodsTable)
      .where(and(eq(payoutMethodsTable.id, payoutProfileId), eq(payoutMethodsTable.userId, user.id)));
    if (!profile) return res.status(404).json({ error: "Payout method not found" });

    await db.update(usersTable).set({ balance: user.balance - amount }).where(eq(usersTable.id, user.id));

    const [withdrawal] = await db
      .insert(earningsTable)
      .values({
        userId: user.id,
        amount: -amount,
        type: "withdrawal",
        status: "pending",
        payoutMethodId: profile.id,
      })
      .returning();

    return res.status(201).json({
      id: withdrawal.id,
      amount: withdrawal.amount,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
