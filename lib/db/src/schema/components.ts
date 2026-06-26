import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Components Table ─────────────────────────────────────────────────────────
export const componentsTable = pgTable("components", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tags: text("tags").notNull().default("[]"),
  code: text("code").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertComponentSchema = createInsertSchema(componentsTable).omit({ id: true, createdAt: true });
export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Component = typeof componentsTable.$inferSelect;

// ── Knowledge Chunks Table ────────────────────────────────────────────────────
export const knowledgeChunksTable = pgTable("knowledge_chunks", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: uuid("project_id"),
  source: text("source").notNull(), // "design_extraction", "document", etc.
  sourceId: text("source_id"),       // extraction UUID
  section: text("section"),          // "Colors", "Typography", etc.
  content: text("content").notNull(),
  embedding: text("embedding"), // JSON-encoded vector (for pgvector this would be vector type)
  metadata: jsonb("metadata").$defaultFn(() => ({})),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKnowledgeChunkSchema = createInsertSchema(knowledgeChunksTable).omit({ id: true, createdAt: true });
export type InsertKnowledgeChunk = z.infer<typeof insertKnowledgeChunkSchema>;
export type KnowledgeChunk = typeof knowledgeChunksTable.$inferSelect;

// ── Templates Table ───────────────────────────────────────────────────────────
export const templatesTable = pgTable("templates", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  tags: text("tags").notNull().default("[]"),
  thumbnailUrl: text("thumbnail_url"),
  userId: varchar("user_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templatesTable).omit({ id: true, createdAt: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templatesTable.$inferSelect;

// ── Pages Table (Phase 3: multi-page support) ─────────────────────────────────
export const pagesTable = pgTable("pages", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  elements: text("elements").notNull().default("[]"),
  styles: text("styles").notNull().default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPageSchema = createInsertSchema(pagesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pagesTable.$inferSelect;
