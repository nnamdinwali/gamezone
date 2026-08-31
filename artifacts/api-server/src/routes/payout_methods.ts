import { Router } from "express";
import { db, payoutMethodsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentAppUser } from "../lib/current-user";

const router = Router();

function serialize(m: typeof payoutMethodsTable.$inferSelect) {
  return {
    id: m.id,
    type: m.type,
    label: m.label,
    details: JSON.parse(m.details),
    isDefault: m.isDefault,
    createdAt: m.createdAt.toISOString(),
  };
}

// GET /payout-methods
router.get("/payout-methods", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const methods = await db
      .select()
      .from(payoutMethodsTable)
      .where(eq(payoutMethodsTable.userId, user.id))
      .orderBy(desc(payoutMethodsTable.isDefault), desc(payoutMethodsTable.createdAt));

    return res.json(methods.map(serialize));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /payout-methods
router.post("/payout-methods", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const { type, label, details, isDefault } = req.body as {
      type?: string;
      label?: string;
      details?: unknown;
      isDefault?: boolean;
    };
    if (!type || !label || details === undefined) {
      return res.status(400).json({ error: "type, label, and details are required" });
    }

    if (isDefault) {
      await db
        .update(payoutMethodsTable)
        .set({ isDefault: false })
        .where(eq(payoutMethodsTable.userId, user.id));
    }

    const [method] = await db
      .insert(payoutMethodsTable)
      .values({
        userId: user.id,
        type,
        label,
        details: JSON.stringify(details),
        isDefault: Boolean(isDefault),
      })
      .returning();

    return res.status(201).json(serialize(method));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /payout-methods/:id
router.delete("/payout-methods/:id", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(payoutMethodsTable)
      .where(and(eq(payoutMethodsTable.id, id), eq(payoutMethodsTable.userId, user.id)));
    if (!existing) return res.status(404).json({ error: "Payout method not found" });

    await db.delete(payoutMethodsTable).where(eq(payoutMethodsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
