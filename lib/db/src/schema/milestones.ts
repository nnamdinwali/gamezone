import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, pgTable, real, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const gameMilestonesTable = pgTable(
  "game_milestones",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull(),
    level: integer("level").notNull(),
    title: text("title").notNull(),
    rewardAmount: real("reward_amount").notNull(),
    currency: text("currency").notNull().default("USD"),
    countryCode: text("country_code").notNull().default("US"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    gameLevelCountryUnique: uniqueIndex("game_milestones_game_level_country_idx").on(
      table.gameId,
      table.level,
      table.countryCode,
    ),
  }),
);

export const milestoneClaimsTable = pgTable(
  "milestone_claims",
  {
    id: serial("id").primaryKey(),
    eventId: text("event_id").notNull().unique(),
    userId: integer("user_id").notNull(),
    gameId: integer("game_id").notNull(),
    milestoneId: integer("milestone_id").notNull(),
    amount: real("amount").notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull().default("completed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const insertGameMilestoneSchema = createInsertSchema(gameMilestonesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertGameMilestone = z.infer<typeof insertGameMilestoneSchema>;
export type GameMilestone = typeof gameMilestonesTable.$inferSelect;
export type MilestoneClaim = typeof milestoneClaimsTable.$inferSelect;
