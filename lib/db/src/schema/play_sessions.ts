import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playSessionsTable = pgTable("play_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  status: text("status").notNull().default("active"), // active | completed
  pointsEarned: real("points_earned").notNull().default(0),
  durationMinutes: integer("duration_minutes"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
});

export const insertPlaySessionSchema = createInsertSchema(playSessionsTable).omit({
  id: true,
  status: true,
  pointsEarned: true,
  durationMinutes: true,
  startedAt: true,
  endedAt: true,
});
export type InsertPlaySession = z.infer<typeof insertPlaySessionSchema>;
export type PlaySession = typeof playSessionsTable.$inferSelect;
