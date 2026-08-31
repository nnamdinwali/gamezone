import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const payoutMethodsTable = pgTable("payout_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // bank_transfer | mobile_money | paypal
  label: text("label").notNull(), // display name, e.g. "GTBank ****1234"
  details: text("details").notNull(), // JSON-encoded provider-specific fields
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPayoutMethodSchema = createInsertSchema(payoutMethodsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPayoutMethod = z.infer<typeof insertPayoutMethodSchema>;
export type PayoutMethod = typeof payoutMethodsTable.$inferSelect;
