import { Router } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { db, earningsTable, gameMilestonesTable, milestoneClaimsTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.post("/game-events/milestone", async (req, res) => {
  try {
    const clerkId = getAuth(req).userId;
    if (!clerkId) return res.status(401).json({ error: "Authentication required" });

    const clerkUser = await clerkClient.users.getUser(clerkId);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
    if (!user) return res.status(404).json({ error: "GameZone user profile not found" });
    if (user.bannedAt) return res.status(403).json({ error: "Account banned" });

    const eventId = typeof req.body?.eventId === "string" ? req.body.eventId.trim() : "";
    const gameId = Number(req.body?.gameId);
    const milestoneId = Number(req.body?.milestoneId);
    if (!eventId || !Number.isInteger(gameId) || !Number.isInteger(milestoneId)) {
      return res.status(400).json({ error: "eventId, gameId, and milestoneId are required" });
    }

    const [existingClaim] = await db
      .select()
      .from(milestoneClaimsTable)
      .where(eq(milestoneClaimsTable.eventId, eventId));
    if (existingClaim) {
      return res.json({
        claimed: false,
        duplicate: true,
        claimId: existingClaim.id,
        amount: existingClaim.amount,
        currency: existingClaim.currency,
      });
    }

    const [milestone] = await db
      .select()
      .from(gameMilestonesTable)
      .where(and(eq(gameMilestonesTable.id, milestoneId), eq(gameMilestonesTable.gameId, gameId), eq(gameMilestonesTable.isActive, true)));
    if (!milestone) return res.status(404).json({ error: "Active milestone not found" });

    const claim = await db.transaction(async (tx) => {
      const [createdClaim] = await tx.insert(milestoneClaimsTable).values({
        eventId,
        userId: user.id,
        gameId,
        milestoneId,
        amount: milestone.rewardAmount,
        currency: milestone.currency,
      }).returning();

      await tx.insert(earningsTable).values({
        userId: user.id,
        amount: milestone.rewardAmount,
        type: "milestone",
        status: "completed",
      });

      await tx.update(usersTable)
        .set({
          balance: sql`${usersTable.balance} + ${milestone.rewardAmount}`,
          totalEarnings: sql`${usersTable.totalEarnings} + ${milestone.rewardAmount}`,
        })
        .where(eq(usersTable.id, user.id));

      return createdClaim;
    });

    return res.status(201).json({
      claimed: true,
      duplicate: false,
      claimId: claim.id,
      amount: claim.amount,
      currency: claim.currency,
      userId: user.id,
      username: clerkUser.username ?? user.username,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Unable to record milestone" });
  }
});

export default router;
