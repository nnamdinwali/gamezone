import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const earningsTable = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull().default("play"), // play | withdrawal
  status: text("status").notNull().default("completed"), // pending | completed | rejected
  payoutMethodId: integer("payout_method_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEarningSchema = createInsertSchema(earningsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earningsTable.$inferSelect;
