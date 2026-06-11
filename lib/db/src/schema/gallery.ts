import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryTemplatesTable = pgTable("gallery_templates", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  style: varchar("style", { length: 100 }).notNull(),
  creator: varchar("creator", { length: 255 }).notNull(),
  likes: integer("likes").notNull().default(0),
  tags: text("tags").notNull().default("[]"),
  sourceUrl: text("source_url").notNull(),
  description: text("description"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGalleryTemplateSchema = createInsertSchema(galleryTemplatesTable).omit({ id: true, createdAt: true });
export type InsertGalleryTemplate = z.infer<typeof insertGalleryTemplateSchema>;
export type GalleryTemplate = typeof galleryTemplatesTable.$inferSelect;
