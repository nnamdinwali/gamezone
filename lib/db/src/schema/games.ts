import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gamesTable = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  genre: text("genre").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  gameUrl: text("game_url").notNull(),
  creatorName: text("creator_name").notNull(),
  playCount: integer("play_count").notNull().default(0),
  rating: real("rating").notNull().default(4.0),
  rewardPerMinute: real("reward_per_minute").notNull().default(0.05),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGameSchema = createInsertSchema(gamesTable).omit({
  id: true,
  playCount: true,
  rating: true,
  createdAt: true,
});
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof gamesTable.$inferSelect;
