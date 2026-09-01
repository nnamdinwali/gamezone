import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url").notNull().default(""),
  balance: real("balance").notNull().default(0),
  totalEarnings: real("total_earnings").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  countryCode: text("country_code"),
  currencyCode: text("currency_code"),
  bannedAt: timestamp("banned_at", { withTimezone: true }),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  balance: true,
  totalEarnings: true,
  gamesPlayed: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
