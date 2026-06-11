import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectSnapshotsTable = pgTable("project_snapshots", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  label: text("label").notNull().default("Auto-save"),
  componentTree: text("component_tree"),
  themeTokens: text("theme_tokens"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSnapshotSchema = createInsertSchema(projectSnapshotsTable).omit({ id: true, createdAt: true });
export type InsertSnapshot = z.infer<typeof insertSnapshotSchema>;
export type ProjectSnapshot = typeof projectSnapshotsTable.$inferSelect;
