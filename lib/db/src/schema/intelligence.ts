import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const intelligenceConversationsTable = pgTable("intelligence_conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("New conversation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const intelligenceMessagesTable = pgTable("intelligence_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const gameAuditArtifactsTable = pgTable("game_audit_artifacts", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  artifactType: text("artifact_type").notNull().default("source"),
  label: text("label").notNull(),
  storageKey: text("storage_key"), // where the raw file bytes live, if kept
  mimeType: text("mime_type"),
  byteSize: integer("byte_size"),
  scanStatus: text("scan_status").notNull().default("registered"), // registered | scanned | unsupported | failed
  scanEvidence: text("scan_evidence"), // JSON-encoded scan result
  scannedAt: timestamp("scanned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type IntelligenceConversation = typeof intelligenceConversationsTable.$inferSelect;
export type IntelligenceMessage = typeof intelligenceMessagesTable.$inferSelect;
export type GameAuditArtifact = typeof gameAuditArtifactsTable.$inferSelect;
