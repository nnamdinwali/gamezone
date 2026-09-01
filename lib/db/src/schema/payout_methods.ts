import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const payoutMethodsTable = pgTable("payout_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  countryCode: text("country_code").notNull().default("US"),
  method: text("method").notNull(), // paypal | bank_transfer | opay | palmpay
  details: text("details").notNull(), // JSON-encoded: accountName, email, bankName, accountNumber, iban, accountIdentifier, phone
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPayoutMethodSchema = createInsertSchema(payoutMethodsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPayoutMethod = z.infer<typeof insertPayoutMethodSchema>;
export type PayoutMethod = typeof payoutMethodsTable.$inferSelect;
